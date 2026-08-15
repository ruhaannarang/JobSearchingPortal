import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'

const Jobs = () => {
    const { user, loading } = useAuth();
    const username = user?.username || user?.name || "";
    const [jobs, setJobs] = useState([]);
    const [recruiterInfo, setRecruiterInfo] = useState(null);

    useEffect(() => {
        if (!username) {
            setJobs([]);
            setRecruiterInfo(null);
            return;
        }

        const fetchRecruiterInfo = async () => {
            try {
                const response = await fetch(`https://jobsearchingportal.onrender.com/recruiter/${username}`);
                if (response.ok) {
                    const data = await response.json();
                    setRecruiterInfo(data);
                }
            } catch (error) {
                console.error('Could not fetch recruiter info', error);
            }
        };

        const fetchJobs = async () => {
            const response = await fetch(`https://jobsearchingportal.onrender.com/myjobs/${username}`);
            const data = await response.json();
            setJobs(data);
        };

        fetchRecruiterInfo();
        fetchJobs();
    }, [username]);

    if (loading) {
        return <div className="page-loading">Loading jobs...</div>;
    }

    return (
        <div className="jobs-page">
            <div className="jobs-hero">
                <div>
                    <h1>{username ? `${username}'s Jobs` : 'My Jobs'}</h1>
                    <p>Manage your posted opportunities and keep your company brand visible.</p>
                </div>
                {recruiterInfo && (
                    <div className="company-summary-card">
                        {recruiterInfo.companylogourl ? (
                            <img src={recruiterInfo.companylogourl} alt="Company logo" className="company-logo" />
                        ) : (
                            <div className="company-logo-fallback">{(recruiterInfo.companyname || recruiterInfo.name || 'C').charAt(0)}</div>
                        )}
                        <div>
                            <strong>{recruiterInfo.companyname || recruiterInfo.name}</strong>
                            <p>{recruiterInfo.username}</p>
                        </div>
                    </div>
                )}
            </div>

            <div className="page-actions">
                <Link to="/addjob" className="add-job-link">+ Add Job</Link>
            </div>

            <div className="jobs-list">
                {jobs.map((job) => (
                    <div key={job._id} className="job-card">
                        <div className="job-card-header">
                            {recruiterInfo?.companylogourl ? (
                                <img src={recruiterInfo.companylogourl} alt="Company logo" className="small-company-logo" />
                            ) : (
                                <div className="small-company-logo-fallback">{(recruiterInfo?.companyname || recruiterInfo?.name || 'C').charAt(0)}</div>
                            )}
                            <div>
                                <h2>{job.title}</h2>
                                <p>{job.company}</p>
                            </div>
                        </div>
                        <p className="job-description">{job.description}</p>
                        
                        <div className="applicants-summary" style={{ marginTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: "12px", color: "#ccc" }}>
                            <h4 style={{ color: "gold", marginBottom: "8px" }}>Applicants ({job.appliedBy?.length || 0})</h4>
                            <p style={{ margin: 0, fontSize: "0.9rem" }}>
                                {job.appliedBy && job.appliedBy.length > 0
                                    ? `${job.appliedBy.length} applicant${job.appliedBy.length > 1 ? "s" : ""}`
                                    : "No applications yet"}
                            </p>
                        </div>

                        <div className="job-card-footer">
                            <span>{job.location}</span>
                            <Link to={`/jobs/${job._id}`} className="view-details-link">View Details</Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Jobs
