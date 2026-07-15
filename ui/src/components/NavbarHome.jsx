import { NavLink, useNavigate } from "react-router-dom";
import React from 'react';
import { useAuth } from "../context/AuthContext";
import "@assets/css/navbar.css";

const NavbarHome = () => {
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
          <NavLink className={(e) => e.isActive ? "white active" : "navItems"} to="/"><li>Home</li></NavLink>
          <NavLink className={(e) => e.isActive ? "white active" : "navItems"} to="/about"><li>About</li></NavLink>
          <NavLink className={(e) => e.isActive ? "white active" : "navItems"} to="/contact"><li>Contact</li></NavLink>
          {user ? (
            <li className="navItems profile-dropdown">
              <span style={{ cursor: "pointer", color: "gold", fontWeight: "bold" }}>Profile ▾</span>
              <div className="dropdown-menu">
                {user.role === "jobseeker" && (
                  <>
                    <NavLink to="/profile" className="dropdown-item">
                      <li>View Profile</li>
                    </NavLink>
                    <NavLink to="/edit-profile" className="dropdown-item">
                      <li>Edit Profile</li>
                    </NavLink>
                    <NavLink to="/find-jobs" className="dropdown-item">
                      <li>Find Jobs</li>
                    </NavLink>
                    <NavLink to="/applied-jobs" className="dropdown-item">
                      <li>Applied Jobs</li>
                    </NavLink>
                  </>
                )}
                {user.role === "recruiter" && (
                  <>
                    <NavLink to="/recruiter-profile" className="dropdown-item">
                      <li>View Profile</li>
                    </NavLink>
                    <NavLink to="/recruiter-edit-profile" className="dropdown-item">
                      <li>Edit Profile</li>
                    </NavLink>
                    <NavLink to="/jobs" className="dropdown-item">
                      <li>My Jobs</li>
                    </NavLink>
                    <NavLink to="/addjob" className="dropdown-item">
                      <li>Add Job</li>
                    </NavLink>
                  </>
                )}
                <li className="logout-btn" onClick={handleLogout} style={{ cursor: "pointer", color: "#f44336", fontWeight: "bold", padding: "10px 15px", width: "100%", textAlign: "left" }}>
                  Logout ({user?.username})
                </li>
              </div>
            </li>
          ) : (
            <>
              <NavLink className={(e) => e.isActive ? "white active" : "navItems"} to="/login"><li>Login</li></NavLink>
              <NavLink className={(e) => e.isActive ? "white active" : "navItems"} to="/signup"><li>Sign Up</li></NavLink>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};

export default NavbarHome;