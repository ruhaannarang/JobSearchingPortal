// import { useEffect } from "react";
import "./App.css";
import { useState } from "react";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import About from "./components/About";
import Contact from "./components/Contact";
import SignUp from "./components/SignUp";
import JobDetails from "./components/JobDetails";
import Login from "./components/Login";
import JobSeekerSignUp from "./components/JobSeekerSignUp";
import RecruiterSignUp from "./components/RecruiterSignUp";
import SignUpDonePage from "./components/SignUpDonePage";
import AddJob from "./components/AddJob";
import Jobs from "./components/Jobs";
import JobSeekerJobs from "./components/JobSeekerJobs";
import { createBrowserRouter,RouterProvider } from 'react-router-dom';

function App() {
  const router = createBrowserRouter([
    {path:"/",
      element:<><Navbar/><Home/></>
    },
    {path:"/about",
      element:<><Navbar/><About/></>
    },
    {path:"/Contact",
      element:<><Navbar/><Contact/></>
    },
    {path:"/signup",
      element:<><Navbar/><SignUp/></>
    },
    {path:"/recruiter-signup",
      element:<><Navbar/><RecruiterSignUp/></>
    },
    {path:"/jobseeker-signup",
      element:<><Navbar/><JobSeekerSignUp/></>
    },
    {path:"/signup-done",
      element:<><Navbar/><SignUpDonePage/></>
    },
    {path:"/login",
      element:<><Navbar/><Login/></>
    },
    {path:"/jobs",
      element:<><Navbar/><Jobs/></>
    },
    {path:"/find-jobs",
      element:<><Navbar/><JobSeekerJobs/></>
    },
    {path:"/addjob",
      element:<><Navbar/><AddJob/></>
    },
    {path:"/jobs/:id",
      element:<><Navbar/><JobDetails/></>
    }
  ])
  // const [data, setData] = useState({});
  // useEffect(() => {
  //   async function fetchData() {
  //     const response = await fetch("http://localhost:5000/api");
  //     const data = await response.json();
  //     console.log(data);
  //     setData(data);
  //   }
  //   fetchData();
  // }, []);
  return (
    <>
    <AuthProvider>

    <RouterProvider router={router}/>
    </AuthProvider>
    
      {/* <Navbar />
      <h1>Job Search Portal</h1>
      <p>{data.message}</p>
      <p>Random Number: {data.randomNumber}</p> */}
    </>
  );
}

export default App;
