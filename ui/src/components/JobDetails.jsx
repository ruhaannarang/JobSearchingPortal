import React from 'react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const JobDetails = () => {
  const { id } = useParams();
  const { loading: authLoading } = useAuth();
  const [job, setJob] = useState(null);
  const [recruiterInfo, setRecruiterInfo] = useState(null);

  const hasApplicants = Array.isArray(job?.appliedBy) && job.appliedBy.length > 0;

  useEffect(() => {
    if (!id) return;

    const fetchJob = async () => {
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
    };

    fetchJob();
  }, [id]);

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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "16px" }}>
                {job.appliedBy.map((applicant, index) => (
                  <div key={index} style={{ background: "rgba(255, 255, 255, 0.03)", padding: "16px", borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.08)", color: "#fff" }}>
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
                ))}
              </div>
            ) : (
              <p style={{ color: "#888", fontStyle: "italic" }}>No applications received yet for this job post.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default JobDetails
