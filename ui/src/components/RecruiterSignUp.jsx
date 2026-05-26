import React from "react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import axios from "axios";
// import { Navigate } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
const RecruiterSignUp = () => {
  const [Loadingg, setLoadingg] = useState();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();
  
  const handleimage = async (e) => {
    const file = e.target.files[0];
    setLoadingg(true);
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "s+ve_posts");
    data.append("cloud_name", "danmv4rdq");
    const res = await fetch(
      "https://api.cloudinary.com/v1_1/danmv4rdq/image/upload",
      {
        method: "post",
        body: data,
      },
    );
    const imgUrl = await res.json();
    setLoadingg(false);
    console.log(imgUrl.url);
    setValue("companylogourl", imgUrl.url, {
      shouldValidate: true,
    });
  };
  const onSubmit = async (RecruiterData) => {
    const res = await axios.post(
      "http://localhost:5000/recruiterData",
      RecruiterData,
    );
    console.log(res.RecruiterData);
    reset();
    navigate("/signup-done");
  };

  const password = watch("password");

  return (
    <div>
      <form action="" onSubmit={handleSubmit(onSubmit)}>
        <div className="RecruitersignUpPage">
          <h1 className="signupPageHeading">SignUp as Recruiter</h1>
          <div className="inputQ">
            <h2>Enter your email</h2>
            <div>
              <input
                {...register("email", { required: true })}
                type="email"
                name="email"
                placeholder="ex: abc123@gmail.com"
              />
              {errors.email && (
                <span className="red">This field is required</span>
              )}
            </div>
          </div>
          <div className="inputQ">
            <h2>Enter your Full Name</h2>
            <div>
              <input
                {...register("name", { required: true })}
                type="text"
                name="name"
                placeholder="ex: Ruhaan Narang"
              />
              {errors.name && (
                <span className="red">This field is required</span>
              )}
            </div>
          </div>
          <div className="inputQ">
            <h2>Enter your Phone Number</h2>
            <div>
              <input
                {...register("phone", { required: true })}
                type="tel"
                name="phone"
                placeholder="ex: 78898 XXXXX"
              />
              {errors.phone && (
                <span className="red">This field is required</span>
              )}
            </div>
          </div>
          <div className="inputQ">
            <h2>Enter your Company/Business Name </h2>
            <div>
              <input
                {...register("companyname", { required: true })}
                type="text"
                name="companyname"
                placeholder="ex: Maersk pvt ltd"
              />
              {errors.companyname && (
                <span className="red">This field is required</span>
              )}
            </div>
          </div>
          <div className="inputQ">
            <h2>Enter your Company/Business Image/Logo </h2>
            <div>
              <input onChange={handleimage} type="file" />
              {Loadingg ? <p>Uploading image...</p> : null}
              {/* {errors.companylogourl && (
                <span className="red">This field is required</span>
              )} */}
              <input
                type="hidden"
                {...register("companylogourl", { required: true })}
              />
            </div>
          </div>
          <div className="inputQ">
            <h2>Create username </h2>
            <div>
              <input
                {...register("username", { required: true })}
                type="text"
                name="username"
                placeholder="ex: ruhaan123"
              />
              {errors.username && (
                <span className="red">This field is required</span>
              )}
            </div>
          </div>
          <div className="inputQ">
            <h2>Create Password</h2>
            <div>
              <input
                {...register("password", { required: true })}
                type="password"
                name="password"
                placeholder="Create Password"
              />
              {errors.password && (
                <span className="red">This field is required</span>
              )}
            </div>
          </div>
          <div className="inputQ">
            <h2>Confirm Password</h2>
            <div>
              <input
                {...register("confirmpassword", {
                  required: true,
                  validate: (value) =>
                    value === password || "Passwords do not match",
                })}
                type="password"
                name="confirmpassword"
                placeholder="Confirm password"
              />
              {errors.confirmpassword && (
                <p className="red">Passwords do not match</p>
              )}
              {/* {errors.confirmpassword && <span className='red'>This field is required</span>} */}
            </div>
          </div>
          <div>
              <button className="Submit" type="submit" value="Submit">Submit</button>
          </div>
        </div>
      </form>
    </div>
  );
};
export default RecruiterSignUp;
