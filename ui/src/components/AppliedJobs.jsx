import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const AppliedJobs = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [appliedJobs, setAppliedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAppliedJobs = async () => {
      if (!user || user.role !== "jobseeker") {
        navigate("/login");
        return;
      }
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const response = await fetch("https://jobsearchingportal.onrender.com/api/jobseeker/applied-jobs", {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setAppliedJobs(data.appliedJobs || []);
        } else {
          const errData = await response.json();
          setError(errData.error || "Failed to fetch applied jobs");
        }
      } catch (err) {
        console.error("Error fetching applied jobs:", err);
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchAppliedJobs();
  }, [user, navigate]);

  if (authLoading || loading) {
    return <div className="page-loading">Loading applied jobs...</div>;
  }

  return (
    <div className="applied-jobs-container">
      <style>{`
        .applied-jobs-container {
          padding: 24px;
          max-width: 1200px;
          margin: 0 auto;
        }
        .applied-jobs-header {
          margin-bottom: 24px;
        }
        .applied-jobs-header h1 {
          color: gold;
          font-size: 2.2rem;
          margin-bottom: 8px;
        }
        .applied-jobs-header p {
          color: #cccccc;
        }
        .applied-jobs-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .applied-job-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 20px;
          transition: all 0.3s ease;
        }
        .applied-job-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 215, 0, 0.4);
          background: rgba(255, 255, 255, 0.06);
        }
        .applied-job-header {
          display: flex;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 12px;
        }
        .applied-job-logo {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          object-fit: cover;
          border: 2px solid gold;
        }
        .applied-job-logo-fallback {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 215, 0, 0.15);
          color: gold;
          font-weight: 700;
          font-size: 1.5rem;
        }
        .applied-job-title-company h2 {
          color: gold;
          font-size: 1.4rem;
          margin-bottom: 4px;
        }
        .applied-job-title-company .company {
          font-weight: 600;
          color: white;
        }
        .applied-job-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 0.9rem;
          color: #bbbbbb;
          margin-bottom: 12px;
        }
        .applied-job-meta span {
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 10px;
          border-radius: 6px;
        }
        .applied-job-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: capitalize;
        }
        .status-applied {
          background: rgba(255, 193, 7, 0.15);
          color: #ffc107;
          border: 1px solid rgba(255, 193, 7, 0.3);
        }
        .status-selected {
          background: rgba(46, 125, 50, 0.15);
          color: #4caf50;
          border: 1px solid rgba(46, 125, 50, 0.3);
        }
        .status-accepted {
          background: rgba(46, 125, 50, 0.15);
          color: #4caf50;
          border: 1px solid rgba(46, 125, 50, 0.3);
        }
        .status-rejected {
          background: rgba(211, 47, 47, 0.15);
          color: #f44336;
          border: 1px solid rgba(211, 47, 47, 0.3);
        }
        .applied-job-date {
          font-size: 0.85rem;
          color: #888888;
          margin-top: 8px;
        }
        .no-applications {
          text-align: center;
          color: #888888;
          padding: 60px 20px;
          background: rgba(255, 255, 255, 0.01);
          border-radius: 12px;
          border: 1px dashed rgba(255, 255, 255, 0.1);
        }
        .no-applications h3 {
          margin-bottom: 8px;
          color: #ccc;
        }
        .error-msg {
          text-align: center;
          color: #f44336;
          padding: 20px;
          background: rgba(211, 47, 47, 0.1);
          border: 1px solid rgba(211, 47, 47, 0.3);
          border-radius: 8px;
        }
      `}</style>

      <div className="applied-jobs-header">
        <h1>Applied Jobs</h1>
        <p>Track the status of your job applications.</p>
      </div>

      {error && <div className="error-msg">{error}</div>}

      {appliedJobs.length === 0 ? (
        <div className="no-applications">
          <h3>No Applications Yet</h3>
          <p>You haven't applied to any jobs yet. Start exploring opportunities!</p>
          <Link to="/find-jobs" style={{ display: "inline-block", marginTop: "16px", textDecoration: "none", color: "gold", fontWeight: "bold" }}>
            Browse Jobs →
          </Link>
        </div>
      ) : (
        <div className="applied-jobs-list">
          {appliedJobs.map((application, index) => (
            <div key={index} className="applied-job-card">
              <div className="applied-job-header">
                <div className="applied-job-logo-wrapper">
                  {/* We don't have recruiter logo here, use fallback */}
                  <div className="applied-job-logo-fallback">{(application.company || 'C').charAt(0)}</div>
                </div>
                <div className="applied-job-title-company">
                  <h2>{application.title}</h2>
                  <div className="company">{application.company}</div>
                </div>
              </div>
              <div className="applied-job-meta">
                <span>📍 {application.location}</span>
                <span>💰 {application.salary ? `$${application.salary}` : "Undisclosed"}</span>
                {application.domain && <span>📁 {application.domain}</span>}
              </div>
              <div>
                <span className={`applied-job-status status-${application.status || 'applied'}`}>
                  {application.status || 'applied'}
                </span>
              </div>
              <div className="applied-job-date">
                Applied on: {new Date(application.appliedAt).toLocaleDateString()}
              </div>
              {application.recruiterNote && application.recruiterNote.trim() !== "" && (
                <div style={{ marginTop: "12px", padding: "12px", borderRadius: "8px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.03)", color: "#ddd" }}>
                  <div style={{ fontWeight: 700, color: "gold", marginBottom: "6px" }}>Message from Recruiter</div>
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{application.recruiterNote}</div>
                  {application.decisionAt && (
                    <div style={{ marginTop: "8px", fontSize: "0.85rem", color: "#aaa" }}>
                      Decision on: {new Date(application.decisionAt).toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppliedJobs;