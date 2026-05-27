import React from 'react'
import { useEffect,useState } from 'react'
const JobDetails = ({ jobid }) => {
  const [job, setJob] = useState(null);

  useEffect(() => {
    const fetchJob = async () => {
      const response = await fetch(`http://localhost:5000/jobs/${jobid}`);
      const data = await response.json();
      setJob(data);
    };
    fetchJob();
  }, []);

  if (!job) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{job.title}</h1>
      <p>{job.description}</p>
        <p>Company: {job.company}</p>
        <p>Location: {job.location}</p>
        <p>Salary: {job.salary}</p>
     </div>
  )
}

export default JobDetails
