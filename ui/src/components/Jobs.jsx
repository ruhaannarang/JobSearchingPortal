import React from 'react'
import { use } from 'react'
import { useAuth } from '../context/AuthContext'
import { useEffect ,useState} from 'react'
const Jobs = (setJobid) => {
    const {user}=useAuth()
    const username=user.user.username
    const [jobs, setJobs] = useState([]);
    useEffect(() => {
        const fetchJobs = async () => {
            const response = await fetch(`http://localhost:5000/myjobs/${username}`);
            const data = await response.json();
            setJobs(data);
        }
        fetchJobs();
    }, [username]);

    return (
        <div>
            <a href="/addjob">Add Job</a>
            <h1>My Jobs</h1>
            {
                jobs.map((job) => (
                    <div key={job._id}>
                        <h2>{job.title}</h2>
                        <p>{job.description}</p>
                        <a href={`/jobs/${job._id}`} onClick={setJobid(job._id)}>View Details</a>
                    </div>
                ))
            }
        </div>
    )
}

export default Jobs
