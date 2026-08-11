import { NavLink, useNavigate } from "react-router-dom";
import React from 'react';
import { useAuth } from "../context/AuthContext";
import "@assets/css/navbar.css";

const JobSeekerNavbar = () => {
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
      <div className="siteName" onClick={() => navigate("/find-jobs")} style={{ cursor: "pointer" }}>JobSearchPortal 💼</div>
      <div>
        <ul className='navbarOpt'>
          <NavLink className={(e) => e.isActive ? "white active" : "navItems"} to="/find-jobs"><li>Find Jobs</li></NavLink>
          <NavLink className={(e) => e.isActive ? "white active" : "navItems"} to="/applied-jobs"><li>Applied Jobs</li></NavLink>
          <NavLink className={(e) => e.isActive ? "white active" : "navItems"} to="/resume-ats-tester"><li>Resume ATS Tester</li></NavLink>
          <li className="navItems profile-dropdown">
            <span style={{ cursor: "pointer", color: "gold", fontWeight: "bold" }}>Profile ▾</span>
            <div className="dropdown-menu">
              <NavLink to="/profile" className="dropdown-item">
                <li>View Profile</li>
              </NavLink>
              <NavLink to="/edit-profile" className="dropdown-item">
                <li>Edit Profile</li>
              </NavLink>
              <li className="logout-btn" onClick={handleLogout} style={{ cursor: "pointer", color: "#f44336", fontWeight: "bold", padding: "10px 15px", width: "100%", textAlign: "left" }}>
                Logout ({user?.username})
              </li>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default JobSeekerNavbar;