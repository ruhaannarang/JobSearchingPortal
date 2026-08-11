// import { useEffect } from "react";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import NavbarHome from "./components/NavbarHome";
import NavbarJobSeeker from "./components/JobSeekerNavbar";
import NavbarRecruiter from "./components/RecruiterNavbar";
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
import AppliedJobs from "./components/AppliedJobs";
import Profile from "./components/Profile";
import EditProfile from "./components/EditProfile";
import RecruiterProfile from "./components/RecruiterProfile";
import RecruiterEditProfile from "./components/RecruiterEditProfile";
import HomeRedirect from "./components/HomeRedirect";
import ResumeAtsTester from "./components/ResumeAtsTester";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

function App() {
  const router = createBrowserRouter([
    {path:"/",
      element:<><NavbarHome/><HomeRedirect/><Home/></>
    },
    {path:"/about",
      element:<><NavbarHome/><About/></>
    },
    {path:"/Contact",
      element:<><NavbarHome/><Contact/></>
    },
    {path:"/signup",
      element:<><NavbarHome/><SignUp/></>
    },
    {path:"/recruiter-signup",
      element:<><NavbarHome/><RecruiterSignUp/></>
    },
    {path:"/jobseeker-signup",
      element:<><NavbarHome/><JobSeekerSignUp/></>
    },
    {path:"/signup-done",
      element:<><NavbarHome/><SignUpDonePage/></>
    },
    {path:"/login",
      element:<><NavbarHome/><Login/></>
    },
    {path:"/find-jobs",
      element:<><NavbarJobSeeker/><JobSeekerJobs/></>
    },
    {path:"/applied-jobs",
      element:<><NavbarJobSeeker/><AppliedJobs/></>
    },
    {path:"/profile",
      element:<><NavbarJobSeeker/><Profile/></>
    },
    {path:"/edit-profile",
      element:<><NavbarJobSeeker/><EditProfile/></>
    },
    {path:"/resume-ats-tester",
      element:<><NavbarJobSeeker/><ResumeAtsTester/></>
    },
    {path:"/jobs",
      element:<><NavbarRecruiter/><Jobs/></>
    },
    {path:"/addjob",
      element:<><NavbarRecruiter/><AddJob/></>
    },
    {path:"/recruiter-profile",
      element:<><NavbarRecruiter/><RecruiterProfile/></>
    },
    {path:"/recruiter-edit-profile",
      element:<><NavbarRecruiter/><RecruiterEditProfile/></>
    },
    {path:"/jobs/:id",
      element:<><NavbarJobSeeker/><JobDetails/></>
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