import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const JobSeekerJobs = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState(null);
  const [selectedDomain, setSelectedDomain] = useState("All");
  const [applying, setApplying] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [recruiterProfiles, setRecruiterProfiles] = useState({});
  const requestedUsernamesRef = useRef(new Set());

  const domains = [
    "All",
    "Software Engineering",
    "Data Science",
    "Product Management",
    "Design",
    "Marketing",
    "Sales",
    "Human Resources",
    "Finance",
    "Other"
  ];

  const fetchRecruiterProfile = async (username) => {
    if (!username || requestedUsernamesRef.current.has(username)) return;

    requestedUsernamesRef.current.add(username);

    try {
      const response = await fetch(`http://localhost:5000/recruiter/${username}`);
      if (response.ok) {
        const data = await response.json();
        setRecruiterProfiles((prev) => ({ ...prev, [username]: data }));
      }
    } catch (error) {
      console.error("Could not fetch recruiter info", error);
    }
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:5000/api/jobs");
        if (response.ok) {
          const data = await response.json();
          const sorted = data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setJobs(sorted);
          await Promise.all(sorted.filter(job => job.createdBy).map(job => fetchRecruiterProfile(job.createdBy)));
          if (sorted.length > 0) {
            setSelectedJob(sorted[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const filteredJobs = selectedDomain === "All"
    ? jobs
    : jobs.filter(job => job.domain === selectedDomain);

  const handleApply = async (jobId) => {
    if (!user) {
      navigate("/login");
      return;
    }
    if (user.role !== "jobseeker") {
      setError("Only job seekers can apply for jobs.");
      return;
    }
    if (!user.resumeUrl) {
      setError("You must upload a resume to apply. Please sign up with a new account and attach your resume.");
      return;
    }

    setApplying(true);
    setError("");
    setMessage("");

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setMessage("Application submitted successfully!");
        
        // Update local jobs list and selected job with new applicant details
        const updatedJobs = jobs.map(j => {
          if (j._id === jobId) {
            const updatedAppliedBy = j.appliedBy ? [...j.appliedBy] : [];
            updatedAppliedBy.push({
              name: user.name,
              email: user.email,
              phone: user.phone,
              jobField: user.jobField,
              username: user.username,
              resumeUrl: user.resumeUrl,
              appliedAt: new Date()
            });
            return { ...j, appliedBy: updatedAppliedBy };
          }
          return j;
        });
        setJobs(updatedJobs);
        setSelectedJob(updatedJobs.find(j => j._id === jobId));
      } else {
        setError(data.error || "Failed to submit application.");
      }
    } catch (err) {
      console.error("Error submitting application:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setApplying(false);
    }
  };

  const hasApplied = (job) => {
    if (!user || !job || !job.appliedBy) return false;
    return job.appliedBy.some(app => app.username === user.username);
  };

  if (loading || authLoading) {
    return <div className="page-loading">Loading jobs marketplace...</div>;
  }

  return (
    <div className="jobseeker-container">
      <style>{`
        .jobseeker-container {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .jobseeker-header {
          margin-bottom: 24px;
        }
        .jobseeker-header h1 {
          color: gold;
          font-size: 2.2rem;
          margin-bottom: 8px;
        }
        .jobseeker-header p {
          color: #cccccc;
        }
        .filter-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 24px;
        }
        .filter-chip {
          background: rgba(255, 255, 255, 0.05);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 8px 16px;
          border-radius: 999px;
          cursor: pointer;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        .filter-chip:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: gold;
        }
        .filter-chip.active {
          background: gold;
          color: black;
          border-color: gold;
        }
        .jobs-workspace {
          display: flex;
          gap: 24px;
          min-height: 500px;
        }
        .jobs-sidebar {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 700px;
          overflow-y: auto;
          padding-right: 8px;
        }
        .jobs-sidebar::-webkit-scrollbar {
          width: 6px;
        }
        .jobs-sidebar::-webkit-scrollbar-thumb {
          background-color: rgba(255, 255, 255, 0.2);
          border-radius: 4px;
        }
        .jobseeker-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .jobseeker-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 215, 0, 0.4);
          background: rgba(255, 255, 255, 0.06);
        }
        .jobseeker-card.selected {
          border-color: gold;
          background: rgba(255, 215, 0, 0.08);
        }
        .jobseeker-card h3 {
          color: gold;
          font-size: 1.2rem;
          margin-bottom: 4px;
        }
        .jobseeker-card .company {
          font-weight: 600;
          margin-bottom: 8px;
          color: white;
        }
        .jobseeker-card-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          font-size: 0.85rem;
          color: #bbbbbb;
          margin-bottom: 8px;
        }
        .jobseeker-card-meta span {
          background: rgba(255, 255, 255, 0.05);
          padding: 2px 8px;
          border-radius: 4px;
        }
        .jobseeker-card .date {
          font-size: 0.8rem;
          color: #888888;
          text-align: right;
        }
        .jobs-details-pane {
          flex: 1.5;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 24px;
          max-height: 700px;
          overflow-y: auto;
          position: sticky;
          top: 20px;
        }
        .details-pane-header {
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .details-pane-header h2 {
          color: gold;
          font-size: 1.8rem;
          margin-bottom: 6px;
        }
        .details-pane-header .company {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 12px;
        }
        .details-meta-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        }
        .meta-box {
          background: rgba(255, 255, 255, 0.04);
          padding: 12px;
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .meta-box strong {
          display: block;
          font-size: 0.8rem;
          color: gold;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .meta-box span {
          font-size: 1rem;
          font-weight: 500;
        }
        .details-body {
          line-height: 1.6;
          margin-bottom: 24px;
          color: #e0e0e0;
          white-space: pre-wrap;
        }
        .apply-section {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 20px;
        }
        .apply-btn {
          background: gold;
          color: black;
          border: none;
          padding: 14px 28px;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.3s ease;
          width: 100%;
        }
        .apply-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
        }
        .apply-btn:disabled {
          background: #cccccc;
          color: #666666;
          cursor: not-allowed;
        }
        .apply-btn.applied {
          background: #2e7d32;
          color: white;
        }
        .status-msg {
          margin-top: 12px;
          padding: 10px;
          border-radius: 6px;
          font-weight: 500;
          text-align: center;
        }
        .status-msg.success {
          background: rgba(46, 125, 50, 0.15);
          color: #4caf50;
          border: 1px solid rgba(46, 125, 50, 0.3);
        }
        .status-msg.error {
          background: rgba(211, 47, 47, 0.15);
          color: #f44336;
          border: 1px solid rgba(211, 47, 47, 0.3);
        }
        .no-jobs-msg {
          text-align: center;
          color: #888888;
          padding: 40px;
          background: rgba(255, 255, 255, 0.01);
          border-radius: 12px;
          border: 1px dashed rgba(255, 255, 255, 0.1);
          width: 100%;
        }
        @media (max-width: 768px) {
          .jobs-workspace {
            flex-direction: column;
          }
          .jobs-details-pane {
            position: static;
          }
        }
      `}</style>

      <div className="jobseeker-header">
        <h1>Explore Opportunities</h1>
        <p>Find the perfect career match across various industries and domains.</p>
      </div>

      <div className="filter-chips">
        {domains.map(domain => (
          <button
            key={domain}
            className={`filter-chip ${selectedDomain === domain ? "active" : ""}`}
            onClick={() => {
              setSelectedDomain(domain);
              setMessage("");
              setError("");
              // Automatically select the first filtered job if any
              const filtered = domain === "All"
                ? jobs
                : jobs.filter(j => j.domain === domain);
              if (filtered.length > 0) {
                setSelectedJob(filtered[0]);
              } else {
                setSelectedJob(null);
              }
            }}
          >
            {domain}
          </button>
        ))}
      </div>

      {filteredJobs.length === 0 ? (
        <div className="no-jobs-msg">
          <h3>No jobs found in this category</h3>
          <p>Please check back later or try exploring other domains.</p>
        </div>
      ) : (
        <div className="jobs-workspace">
          <div className="jobs-sidebar">
            {filteredJobs.map(job => (
              <div
                key={job._id}
                className={`jobseeker-card ${selectedJob?._id === job._id ? "selected" : ""}`}
                onClick={() => {
                  setSelectedJob(job);
                  setMessage("");
                  setError("");
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                  {recruiterProfiles[job.createdBy]?.companylogourl ? (
                    <img
                      src={recruiterProfiles[job.createdBy].companylogourl}
                      alt="Company logo"
                      style={{ width: "38px", height: "38px", borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{ width: "38px", height: "38px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,215,0,0.15)", color: "gold", fontWeight: "700" }}>
                      {(recruiterProfiles[job.createdBy]?.companyname || recruiterProfiles[job.createdBy]?.name || "C").charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3>{job.title}</h3>
                    <div className="company">{job.company}</div>
                  </div>
                </div>
                <div className="jobseeker-card-meta">
                  <span>📍 {job.location}</span>
                  <span>💰 {job.salary ? `$${job.salary}` : "Undisclosed"}</span>
                  {job.domain && <span>📁 {job.domain}</span>}
                </div>
                <div className="date">
                  Posted: {new Date(job.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>

          <div className="jobs-details-pane">
            {selectedJob ? (
              <>
                <div className="details-pane-header">
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                    {recruiterProfiles[selectedJob.createdBy]?.companylogourl ? (
                      <img
                        src={recruiterProfiles[selectedJob.createdBy].companylogourl}
                        alt="Company logo"
                        style={{ width: "48px", height: "48px", borderRadius: "50%", objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ width: "48px", height: "48px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,215,0,0.15)", color: "gold", fontWeight: "700" }}>
                        {(recruiterProfiles[selectedJob.createdBy]?.companyname || recruiterProfiles[selectedJob.createdBy]?.name || "C").charAt(0)}
                      </div>
                    )}
                    <div>
                      <h2>{selectedJob.title}</h2>
                      <div className="company">💼 {selectedJob.company}</div>
                    </div>
                  </div>
                </div>

                <div className="details-meta-grid">
                  <div className="meta-box">
                    <strong>Location</strong>
                    <span>{selectedJob.location}</span>
                  </div>
                  <div className="meta-box">
                    <strong>Salary (Annual)</strong>
                    <span>{selectedJob.salary ? `$${selectedJob.salary}` : "Competitive"}</span>
                  </div>
                  <div className="meta-box">
                    <strong>Domain</strong>
                    <span>{selectedJob.domain || "Not specified"}</span>
                  </div>
                  <div className="meta-box">
                    <strong>Posted By</strong>
                    <span>{selectedJob.createdBy}</span>
                  </div>
                </div>

                <div className="details-body">
                  <h3 style={{ color: "gold", marginBottom: "8px" }}>Job Description</h3>
                  <p>{selectedJob.description}</p>
                </div>

                <div className="apply-section">
                  {user ? (
                    user.role === "jobseeker" ? (
                      <>
                        <button
                          className={`apply-btn ${hasApplied(selectedJob) ? "applied" : ""}`}
                          disabled={applying || hasApplied(selectedJob)}
                          onClick={() => handleApply(selectedJob._id)}
                        >
                          {hasApplied(selectedJob)
                            ? "✓ Applied"
                            : applying
                            ? "Submitting Application..."
                            : "Send Application"}
                        </button>
                        {message && <div className="status-msg success">{message}</div>}
                        {error && <div className="status-msg error">{error}</div>}
                      </>
                    ) : (
                      <button className="apply-btn" disabled>
                        Recruiter Account (Cannot Apply)
                      </button>
                    )
                  ) : (
                    <button
                      className="apply-btn"
                      onClick={() => navigate("/login")}
                    >
                      Login to Apply
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", color: "#888", marginTop: "100px" }}>
                Select a job from the list to view its details.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default JobSeekerJobs;
