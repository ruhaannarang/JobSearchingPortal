import "@assets/css/navbar.css";
import { NavLink, useNavigate } from "react-router-dom";
import React from 'react'
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  return (
    <div className="navbar">
      <div className="siteName" onClick={() => navigate("/")} style={{ cursor: "pointer" }}>JobSearchPortal 💼</div>
      <div>
        <ul className='navbarOpt'>
          <NavLink className={(e) => e.isActive ? "white" : "navItems"} to="/"><li>Home</li></NavLink>
          <NavLink className={(e) => e.isActive ? "white" : "navItems"} to="/about"><li>About</li></NavLink>
          
          {user?.role === "jobseeker" && (
            <NavLink className={(e) => e.isActive ? "white" : "navItems"} to="/find-jobs"><li>Find Jobs</li></NavLink>
          )}
          
          {user?.role === "recruiter" && (
            <>
              <NavLink className={(e) => e.isActive ? "white" : "navItems"} to="/jobs"><li>My Jobs</li></NavLink>
              <NavLink className={(e) => e.isActive ? "white" : "navItems"} to="/addjob"><li>Add Job</li></NavLink>
            </>
          )}

          {user ? (
            <li className="navItems logout-btn" onClick={handleLogout} style={{ cursor: "pointer", color: "gold", fontWeight: "bold", listStyleType: "none", display: "inline-block" }}>
              Logout ({user.username})
            </li>
          ) : (
            <NavLink className={(e) => e.isActive ? "white" : "navItems"} to="/login"><li>Login</li></NavLink>
          )}
        </ul>
      </div>
    </div>
  )
}

export default Navbar
