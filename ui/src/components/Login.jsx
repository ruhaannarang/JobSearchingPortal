import React from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const Login = () => {
  const Navigate=useNavigate();
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm()
   
  const onSubmit =async (loginCreds) => {
    try {
      console.log(loginCreds)
      const res=await axios.post("http://localhost:5000/login",loginCreds)
      console.log(res.data)
      localStorage.setItem(
        "token",
        res.data.token
      );
      localStorage.setItem("user", JSON.stringify(res.data.user));
      if(res.data.user.role==="recruiter"){
        await Navigate("/addjob")
      }
      reset()
      //will update after setting up backend for auth and when the homepage will be made
      // Navigate("/login-done")
    } catch (error) {
      console.error("Login failed:", error.response?.data?.message || error.message);
      alert(error.response?.data?.message || "Login failed");
    }
  }
  
  
  return (
    <div>
      <div className="loginpage">
        <h2 className='loginNow'>Login to your account</h2>
        <form className='LoginContent' action="" onSubmit={handleSubmit(onSubmit)}>
          <div className="inputQ">
            <h2>Enter your username</h2>
            <div>
              <input {...register("username", { required: true })} type="text" name="username" placeholder='username' />
              {errors.username && <span className='red'>This field is required</span>}
            </div>
          </div>

          <div className="inputQ">
            <h2>Enter your password</h2>
            <div>
              <input {...register("password", { required: true })} type="password" name="password" placeholder='password' />
              {errors.password && <span className='red'>This field is required</span>}
            </div>
          </div>
          <div className="inputQ">
            <h2>Your Role</h2>
            <div>
              <select {...register("role", { required: true })} name="role" id="role">
                <option value="">Select your role</option>
                <option value="jobseeker">Job Seeker</option>
                <option value="recruiter">Recruiter</option>
              </select>
              {errors.role && <span className='red'>This field is required</span>}
            </div>
          </div>
          <div >
            <input className="Submit" type="submit" value="Login"/>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
