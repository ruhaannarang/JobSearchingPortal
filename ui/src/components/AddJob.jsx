import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AddJob = () => {
    const { user, loading } = useAuth();
    const username = user?.username || user?.name || "";
    const [recruiterInfo, setRecruiterInfo] = useState(null);
    const [jobdata, setJobdata] = useState({
        title: "",
        company: "",
        location: "",
        salary: "",
        description: "",
        createdBy: username,
    });

    useEffect(() => {
        setJobdata((prev) => ({ ...prev, createdBy: username }));
    }, [username]);

    useEffect(() => {
        if (!username) return;

        const fetchRecruiterInfo = async () => {
            try {
                const response = await fetch(`http://localhost:5000/recruiter/${username}`);
                if (response.ok) {
                    setRecruiterInfo(await response.json());
                }
            } catch (error) {
                console.error('Could not fetch recruiter info', error);
            }
        };

        fetchRecruiterInfo();
    }, [username]);

    const senddata = async (e) => {
        e.preventDefault();
        await fetch("http://localhost:5000/api/jobs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(jobdata),
        });
    };

    if (loading) {
        return <div className="page-loading">Loading recruiter profile...</div>;
    }

    return (
    <div className="addjob-page">
      <div className="jobs-hero">
        <div>
          <h1>{username ? `${username}'s Add Job` : 'Add Job'}</h1>
          <p>Post a new opportunity with your company branding.</p>
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
        <Link to="/jobs" className="secondary-link">View My Jobs</Link>
        <Link to="/" className="secondary-link">Back to Home</Link>
      </div>
      <div className="addjob-card">
        <div className="addjobtitle">Create a Job Post</div>
        <form className="addjob-form" onSubmit={senddata}>
          <div className="jobinput">
            <div className="jobdetail">
              <label>Job Title</label>
              <input type="text" placeholder="Job Title" onChange={(e) => setJobdata({...jobdata, title: e.target.value})} />
            </div>
          </div>
          <div className="jobinput">
            <div className="jobdetail">
              <label>Company Name</label>
              <input type="text" placeholder="Company Name" onChange={(e) => setJobdata({...jobdata, company: e.target.value})} />
            </div>
          </div>
          <div className="jobinput">
            <div className="jobdetail">
              <label>Location</label>
              <input type="text" placeholder="Location" onChange={(e) => setJobdata({...jobdata, location: e.target.value})} />
            </div>
          </div>
          <div className="jobinput">
            <div className="jobdetail">
              <label>Salary</label>
              <input type="text" placeholder="Salary" onChange={(e) => setJobdata({...jobdata, salary: e.target.value})} />
            </div>
          </div>
          <div className="jobinput">
            <div className="jobdetail">
              <label>Job Description</label>
              <textarea
                cols="30"
                rows="10"
                placeholder="Job Description"
                onChange={(e) => setJobdata({...jobdata, description: e.target.value})}
              ></textarea>
            </div>
          </div>
          <button className="submit-job-btn" type="submit">Add Job</button>
        </form>
      </div>
    </div>
  );
};

export default AddJob;
