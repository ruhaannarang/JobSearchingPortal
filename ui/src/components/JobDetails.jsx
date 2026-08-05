import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const JobDetails = () => {
  const { id } = useParams();
  const { loading: authLoading } = useAuth();
  const [job, setJob] = useState(null);
  const [recruiterInfo, setRecruiterInfo] = useState(null);

  // Email modal state
  const [emailModal, setEmailModal] = useState({
    isOpen: false,
    type: '', // 'offer' or 'rejection'
    applicant: null,
    customNote: ''
  });
  const [sending, setSending] = useState(false);
  const [modalError, setModalError] = useState('');
  // Email status map state loaded from localStorage if available
  const [statusMap, setStatusMap] = useState(() => {
    try {
      const saved = localStorage.getItem(`email_status_${id}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const hasApplicants = Array.isArray(job?.appliedBy) && job.appliedBy.length > 0;

  useEffect(() => {
    if (id && Object.keys(statusMap).length > 0) {
      try {
        localStorage.setItem(`email_status_${id}`, JSON.stringify(statusMap));
      } catch (err) {
        console.error("Error saving email status map:", err);
      }
    }
  }, [id, statusMap]);

  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
      try {
        const response = await fetch(`http://localhost:5000/jobs/${id}`);
        const data = await response.json();
        setJob(data);

        if (data?.createdBy) {
          try {
            const recruiterResponse = await fetch(`http://localhost:5000/recruiter/${data.createdBy}`);
            if (recruiterResponse.ok) {
              setRecruiterInfo(await recruiterResponse.json());
            }
          } catch (error) {
            console.error('Could not fetch recruiter info', error);
          }
        }
      } catch (err) {
        console.error('Error fetching job details:', err);
      }
    };

    fetchJob();
  }, [id]);

  const handleOpenEmailModal = (applicant, type) => {
    const defaultNote = type === 'offer'
      ? `We are delighted to offer you the position of ${job?.title || 'the applied position'} at ${job?.company || 'our company'}. We were very impressed with your application!`
      : `Thank you for your interest in the ${job?.title || 'applied position'} role at ${job?.company || 'our company'}. We appreciate the time you spent applying.`;

    setEmailModal({
      isOpen: true,
      type,
      applicant,
      customNote: defaultNote
    });
    setModalError('');
  };

  const handleCloseEmailModal = () => {
    setEmailModal({
      isOpen: false,
      type: '',
      applicant: null,
      customNote: ''
    });
    setModalError('');
  };

  const handleSendEmail = async () => {
    const { applicant, type, customNote } = emailModal;
    if (!applicant || !applicant.email) {
      setModalError('Applicant email is missing.');
      return;
    }

    setSending(true);
    setModalError('');

    const endpoint = type === 'offer' 
      ? 'http://localhost:5000/api/send-offer-email' 
      : 'http://localhost:5000/api/send-rejection-email';

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          applicantEmail: applicant.email,
          applicantName: applicant.name,
          jobTitle: job?.title || '',
          companyName: job?.company || '',
          customNote: customNote
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send email');
      }

      setStatusMap((prev) => ({
        ...prev,
        [applicant.email]: {
          type,
          message: data.message || 'Email sent successfully!',
          previewUrl: data.previewUrl || null,
          error: false
        }
      }));

      handleCloseEmailModal();
    } catch (err) {
      console.error('Error sending email:', err);
      setModalError(err.message || 'An error occurred while sending email');
    } finally {
      setSending(false);
    }
  };

  if (!job || authLoading) {
    return <div className="page-loading">Loading job details...</div>;
  }

  return (
    <div className="job-details-page">
      <div className="page-actions">
        <Link to="/jobs" className="secondary-link">Back to Jobs</Link>
        <Link to="/addjob" className="secondary-link">Add New Job</Link>
      </div>
      <div className="job-details-card">
        <div className="job-details-header">
          {recruiterInfo?.companylogourl ? (
            <img src={recruiterInfo.companylogourl} alt="Company logo" className="company-logo" />
          ) : (
            <div className="company-logo-fallback">{(recruiterInfo?.companyname || recruiterInfo?.name || 'C').charAt(0)}</div>
          )}
          <div>
            <h1>{job.title}</h1>
            <p>{job.company}</p>
          </div>
        </div>
        <div className="job-detail-body">
          <p>{job.description}</p>
          <div className="job-detail-meta">
            <span>Location: {job.location}</span>
            <span>Salary: {job.salary}</span>
            <span>Posted by: {job.createdBy}</span>
          </div>
        </div>
        
        {(hasApplicants || job.appliedBy) && (
          <div className="job-details-applicants" style={{ marginTop: "24px", borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: "20px" }}>
            <h2 style={{ color: "gold", marginBottom: "12px" }}>Applicants ({job.appliedBy?.length || 0})</h2>
            {hasApplicants ? (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                {job.appliedBy.map((applicant, index) => (
                  <div key={index} style={{ background: "rgba(255, 255, 255, 0.03)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#fff", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                        {recruiterInfo?.companylogourl ? (
                          <img src={recruiterInfo.companylogourl} alt="Company logo" style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "40px", height: "40px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,215,0,0.15)", color: "gold", fontWeight: "700" }}>
                            {(recruiterInfo?.companyname || recruiterInfo?.name || "C").charAt(0)}
                          </div>
                        )}
                        <div style={{ fontWeight: "700", color: "gold", fontSize: "1.1rem" }}>{applicant.name}</div>
                      </div>
                      <div style={{ color: "#eee", fontSize: "0.9rem", marginBottom: "4px" }}>Field: {applicant.jobField || "Not specified"}</div>
                      <div style={{ color: "#ccc", fontSize: "0.9rem" }}>✉ {applicant.email}</div>
                      <div style={{ color: "#ccc", fontSize: "0.9rem" }}>☎ {applicant.phone}</div>
                      {applicant.resumeUrl && (
                        <div style={{ marginTop: "8px" }}>
                          <a href={applicant.resumeUrl} target="_blank" rel="noopener noreferrer" style={{ color: "gold", textDecoration: "underline", fontSize: "0.9rem", fontWeight: "bold" }}>
                            📄 View Resume
                          </a>
                        </div>
                      )}
                      <div style={{ color: "#888", fontSize: "0.8rem", marginTop: "8px" }}>Applied on: {new Date(applicant.appliedAt).toLocaleDateString()}</div>
                    </div>

                    {/* Email Action Buttons or Status Badge */}
                    <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.08)", display: "flex", flexDirection: "column", gap: "8px" }}>
                      {statusMap[applicant.email] && !statusMap[applicant.email].error ? (
                        /* Email already sent: Hide action buttons and display status badge */
                        <div style={{
                          padding: "10px 12px",
                          borderRadius: "8px",
                          fontSize: "0.85rem",
                          background: statusMap[applicant.email].type === 'offer' ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                          border: `1px solid ${statusMap[applicant.email].type === 'offer' ? '#10b981' : '#ef4444'}`,
                          color: statusMap[applicant.email].type === 'offer' ? '#6ee7b7' : '#fca5a5'
                        }}>
                          <div style={{ fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
                            {statusMap[applicant.email].type === 'offer' ? '🎉 Offer Email Sent' : '❌ Not Selected Email Sent'}
                          </div>
                          <div style={{ marginTop: "4px", fontSize: "0.8rem", color: "#d1d5db" }}>
                            {statusMap[applicant.email].message}
                          </div>
                          {statusMap[applicant.email].previewUrl && (
                            <div style={{ marginTop: "6px" }}>
                              <a
                                href={statusMap[applicant.email].previewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "gold", textDecoration: "underline", fontWeight: "600", fontSize: "0.8rem" }}
                              >
                                🔗 View Sent Ethereal Mail
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        /* Email not sent yet or last attempt failed: Show action buttons */
                        <>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            <button
                              onClick={() => handleOpenEmailModal(applicant, 'offer')}
                              style={{
                                flex: 1,
                                padding: "8px 12px",
                                borderRadius: "8px",
                                border: "none",
                                background: "linear-gradient(135deg, #10b981, #059669)",
                                color: "#ffffff",
                                fontWeight: "bold",
                                cursor: "pointer",
                                fontSize: "0.82rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "4px"
                              }}
                            >
                              🎉 Send Offer
                            </button>
                            <button
                              onClick={() => handleOpenEmailModal(applicant, 'rejection')}
                              style={{
                                flex: 1,
                                padding: "8px 12px",
                                borderRadius: "8px",
                                border: "none",
                                background: "linear-gradient(135deg, #ef4444, #dc2626)",
                                color: "#ffffff",
                                fontWeight: "bold",
                                cursor: "pointer",
                                fontSize: "0.82rem",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "4px"
                              }}
                            >
                              ❌ Not Selected
                            </button>
                          </div>

                          {/* Show error badge if previous attempt failed */}
                          {statusMap[applicant.email]?.error && (
                            <div style={{
                              padding: "8px 10px",
                              borderRadius: "6px",
                              fontSize: "0.8rem",
                              background: "rgba(239, 68, 68, 0.15)",
                              border: "1px solid #ef4444",
                              color: "#fca5a5"
                            }}>
                              ⚠️ {statusMap[applicant.email].message}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#888", fontStyle: "italic" }}>No applications received yet for this job post.</p>
            )}
          </div>
        )}
      </div>

      {/* Email Modal Dialog */}
      {emailModal.isOpen && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.75)",
          backdropFilter: "blur(4px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000,
          padding: "20px"
        }}>
          <div style={{
            background: "#111827",
            border: "1px solid rgba(255, 215, 0, 0.3)",
            borderRadius: "16px",
            padding: "24px",
            maxWidth: "500px",
            width: "100%",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.5)",
            color: "#ffffff"
          }}>
            <h3 style={{ color: emailModal.type === 'offer' ? '#10b981' : '#ef4444', marginBottom: "8px", fontSize: "1.3rem" }}>
              {emailModal.type === 'offer' ? '🎉 Send Job Offer Email' : '❌ Send Not Selected Email'}
            </h3>
            <p style={{ color: "#9ca3af", fontSize: "0.9rem", marginBottom: "16px" }}>
              Sending email to <strong style={{ color: "gold" }}>{emailModal.applicant?.name}</strong> ({emailModal.applicant?.email})
            </p>

            {modalError && (
              <div style={{ background: "rgba(239, 68, 68, 0.2)", border: "1px solid #ef4444", color: "#fca5a5", padding: "10px", borderRadius: "8px", marginBottom: "16px", fontSize: "0.85rem" }}>
                ⚠️ {modalError}
              </div>
            )}

            <div style={{ marginBottom: "16px" }}>
              <label style={{ display: "block", color: "gold", marginBottom: "6px", fontWeight: "600", fontSize: "0.9rem" }}>
                Custom Note / Message for Candidate:
              </label>
              <textarea
                value={emailModal.customNote}
                onChange={(e) => setEmailModal(prev => ({ ...prev, customNote: e.target.value }))}
                rows={4}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  background: "#1f2937",
                  color: "#ffffff",
                  fontSize: "0.9rem",
                  resize: "vertical"
                }}
                placeholder="Enter custom note to include in the email..."
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
              <button
                type="button"
                onClick={handleCloseEmailModal}
                disabled={sending}
                style={{
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  background: "transparent",
                  color: "#ccc",
                  cursor: "pointer",
                  fontWeight: "600"
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendEmail}
                disabled={sending}
                style={{
                  padding: "8px 20px",
                  borderRadius: "8px",
                  border: "none",
                  background: emailModal.type === 'offer'
                    ? "linear-gradient(135deg, #10b981, #059669)"
                    : "linear-gradient(135deg, #ef4444, #dc2626)",
                  color: "#ffffff",
                  cursor: sending ? "not-allowed" : "pointer",
                  fontWeight: "bold",
                  opacity: sending ? 0.7 : 1
                }}
              >
                {sending ? 'Sending...' : 'Send Email'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobDetails
