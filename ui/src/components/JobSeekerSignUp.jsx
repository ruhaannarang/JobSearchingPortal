import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const JobSeekerSignUp = () => {
  const [Loadingg, setLoadingg] = useState(false);
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm()

  const navigate = useNavigate()
  
  const handleResume = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Please upload a PDF file only.");
      e.target.value = "";
      return;
    }

    setLoadingg(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "s+ve_posts");
    data.append("cloud_name", "danmv4rdq");
    data.append("resource_type", "raw");

    try {
      const res = await fetch(
        "https://api.cloudinary.com/v1_1/danmv4rdq/raw/upload",
        {
          method: "post",
          body: data,
        }
      );
      const fileData = await res.json();

      if (!res.ok) {
        throw new Error(fileData.error?.message || "Resume upload failed");
      }
      console.log("Cloudinary response:", fileData);
      const uploadedUrl = fileData.secure_url || fileData.url;
      if (!uploadedUrl) {
        throw new Error("Cloudinary did not return a resume URL");
      }

      setValue("resumeUrl", uploadedUrl, {
        shouldValidate: true,
      });
    } catch (err) {
      console.error("Cloudinary resume upload failed", err);
      alert("Failed to upload resume, please try again.");
    } finally {
      setLoadingg(false);
    }
  };

  const onSubmit = async (jobSeekerData) => {
    const { confirmpassword: _, ...dataToSend } = jobSeekerData
    const res= await axios.post('http://localhost:5000/jobSeekerData', dataToSend)
    console.log(res.data)
    reset();
    navigate("/signup-done")
  }

  const password = watch("password");
  return (
    <div>
      <form action="" onSubmit={handleSubmit(onSubmit)}>
        <div className='RecruitersignUpPage'>
          <h1 className='signupPageHeading'>SignUp as JobSeeker</h1>
          <div className="inputQ" >
            <h2>Enter your email</h2>
            <div>

              <input {...register("email", { required: true })} type='email' name='email' placeholder='ex: abc123@gmail.com' />
              {errors.email && <span className='red'>This field is required</span>}
            </div>
          </div>
          <div className="inputQ" >
            <h2>Enter your Full Name</h2>
            <div>

              <input {...register("name", { required: true })} type='text' name='name' placeholder='ex: Ruhaan Narang' />
              {errors.name && <span className='red'>This field is required</span>}
            </div>
          </div>
          <div className="inputQ" >
            <h2>Enter your Phone Number</h2>
            <div>

              <input {...register("phone", { required: true })} type='tel' name='phone' placeholder='ex: 78898 XXXXX' />
              {errors.phone && <span className='red'>This field is required</span>}
            </div>

          </div>
          <div className="inputQ" >
            <h2>Select your field</h2>
            <div>

              {/* <input {...register("companyname", { required: true })} type='text' name='companyname' placeholder='ex: Maersk pvt ltd' /> */}

              <select id="jobField" {...register("jobField", { required: true })}>
                <option value="">-- Select a field --</option>
                <option value="it">Information Technology (IT)</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="education">Education</option>
                <option value="engineering">Engineering</option>
                <option value="marketing">Marketing</option>
                <option value="sales">Sales</option>
                <option value="others">Others</option>
              </select>
              {errors.jobField && <span className='red'>This field is required</span>}
            </div>
          </div>
          <div className="inputQ" >
            <h2>Upload your Resume (PDF format)</h2>
            <div>
              <input onChange={handleResume} type="file" accept=".pdf" />
              {Loadingg ? <p>Uploading resume...</p> : null}
              <input
                type="hidden"
                {...register("resumeUrl", { required: true })}
              />
              {errors.resumeUrl && <span className='red'>Resume upload is required</span>}
            </div>
          </div>
          <div className="inputQ" >
            <h2>Create username </h2>
            <div>

              <input {...register("username", { required: true })} type='text' name='username' placeholder='ex: ruhaan123' />
              {errors.username && <span className='red'>This field is required</span>}
            </div>
          </div>
          <div className="inputQ" >
            <h2>Create Password</h2>
            <div>

              <input {...register("password", { required: true })} type='password' name='password' placeholder='Create Password' />
              {errors.password && <span className='red'>This field is required</span>}
            </div>

          </div>
          <div className="inputQ" >
            <h2>Confirm Password</h2>
            <div>

              <input {...register("confirmpassword", {
                required: true,
                validate: (value) =>
                  value === password || "Passwords do not match"
              })} type='password' name='confirmpassword' placeholder='Confirm password' />
              {errors.confirmpassword && <p className='red'>Passwords do not match</p>}
              {/* {errors.confirmpassword && <span className='red'>This field is required</span>} */}
            </div>

          </div>
          <div >
            <input className="Submit" type="submit" value="Submit" />
          </div>
        </div>
      </form>
    </div>
  )
}

export default JobSeekerSignUp
