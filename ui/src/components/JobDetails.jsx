import React from 'react'
import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const JobDetails = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [recruiterInfo, setRecruiterInfo] = useState(null);

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

  if (!job) {
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
      </div>
    </div>
  )
}

export default JobDetails
