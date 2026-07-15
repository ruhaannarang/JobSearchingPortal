import { NavLink, useNavigate } from "react-router-dom";
import React from 'react';
import { useAuth } from "../context/AuthContext";
import "@assets/css/navbar.css";

const RecruiterNavbar = () => {
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
      <div className="siteName" onClick={() => navigate("/jobs")} style={{ cursor: "pointer" }}>JobSearchPortal 💼</div>
      <div>
        <ul className='navbarOpt'>
          <NavLink className={(e) => e.isActive ? "white active" : "navItems"} to="/jobs"><li>My Jobs</li></NavLink>
          <NavLink className={(e) => e.isActive ? "white active" : "navItems"} to="/addjob"><li>Add Job</li></NavLink>
          <li className="navItems profile-dropdown">
            <span style={{ cursor: "pointer", color: "gold", fontWeight: "bold" }}>Profile ▾</span>
            <div className="dropdown-menu">
              <NavLink to="/recruiter-profile" className="dropdown-item">
                <li>View Profile</li>
              </NavLink>
              <NavLink to="/recruiter-edit-profile" className="dropdown-item">
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

export default RecruiterNavbar;