import { NavLink, useNavigate } from "react-router-dom";
import React, { useState } from 'react';
import { useAuth } from "../context/AuthContext";
import "@assets/css/navbar.css";

const JobSeekerNavbar = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setMenuOpen(false);
    navigate("/");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="navbar">
      <div className="siteName" onClick={() => navigate("/find-jobs")} style={{ cursor: "pointer" }}>JobSearchPortal 💼</div>
      <button type="button" className="mobile-menu-toggle" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </button>
      <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
        <ul className='navbarOpt'>
          <NavLink className={(e) => e.isActive ? "white active" : "navItems"} to="/find-jobs" onClick={closeMenu}><li>Find Jobs</li></NavLink>
          <NavLink className={(e) => e.isActive ? "white active" : "navItems"} to="/applied-jobs" onClick={closeMenu}><li>Applied Jobs</li></NavLink>
          <NavLink className={(e) => e.isActive ? "white active" : "navItems"} to="/resume-ats-tester" onClick={closeMenu}><li>Resume ATS Tester</li></NavLink>
          <li className="navItems profile-dropdown">
            <span style={{ cursor: "pointer", color: "gold", fontWeight: "bold" }}>Profile ▾</span>
            <div className="dropdown-menu">
              <NavLink to="/profile" className="dropdown-item" onClick={closeMenu}><li>View Profile</li></NavLink>
              <NavLink to="/edit-profile" className="dropdown-item" onClick={closeMenu}><li>Edit Profile</li></NavLink>
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