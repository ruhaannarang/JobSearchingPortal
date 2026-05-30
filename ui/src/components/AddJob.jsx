import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
const AddJob = () => {
    const {user,loading}=useAuth()
    const username=user?.user?.username
    const [jobdata, setJobdata] = useState({
        title: "",
        company: "",
        location: "",
        salary: "",
        description: "",
        createdBy:username
    })
    const navigate = useNavigate();

        const senddata = async () => {
        await fetch("http://localhost:5000/api/jobs",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(jobdata),
            }
        )
        // await navigate("/jobs");
      }

   

  return (
    <div>
      <h1>{username}'s Add Job</h1>
      <div className="page">
        <div className="addjobtitle">Add Job</div>
        <div className="addjobform">
          <form action="">
            <div className="addjobform">
              <div className="jobinput">
                <div className="jobdetail">
                  <div>Job Title</div>
                  <input type="text" placeholder="Job Title" onChange={(e) => setJobdata({...jobdata, title: e.target.value})} />
                </div>
              </div>
              <div className="jobinput">
                <div className="jobdetail">
                  <div>Company Name</div>
                  <input type="text" placeholder="Company Name" onChange={(e) => setJobdata({...jobdata, company: e.target.value})} />
                </div>
              </div>
              <div className="jobinput">
                <div className="jobdetail">
                  <div>Location</div>
                  <input type="text" placeholder="Location" onChange={(e) => setJobdata({...jobdata, location: e.target.value})} />
                </div>
              </div>
              <div className="jobinput">
                <div className="jobdetail">
                  <div>Salary</div>
                  <input type="text" placeholder="Salary" onChange={(e) => setJobdata({...jobdata, salary: e.target.value})}     />
                </div>
              </div>
              <div className="jobinput">
                <div className="jobdetail">
                  <div>Job Description</div>
                  <textarea
                    name=""
                    id=""
                    cols="30"
                    rows="10"
                    placeholder="Job Description"
                    onChange={(e) => setJobdata({...jobdata, description: e.target.value})}
                  ></textarea>
                </div>
              </div>
              <button type="submit" onClick={senddata()}>Add Job</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddJob;
