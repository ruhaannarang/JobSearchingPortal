import "@assets/css/navbar.css";
import { NavLink, useNavigate } from "react-router-dom";
import React, { useState } from 'react'
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className="navbar">
      <div className="navbar-top">
        <div className="siteName" onClick={() => { navigate("/"); setMenuOpen(false); }} style={{ cursor: "pointer" }}>JobSearchPortal 💼</div>
        <button type="button" className="mobile-menu-toggle" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </button>
      </div>
      <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
        <ul className='navbarOpt'>
          <NavLink className={(e) => e.isActive ? "white" : "navItems"} to="/" onClick={closeMenu}><li>Home</li></NavLink>
          <NavLink className={(e) => e.isActive ? "white" : "navItems"} to="/about" onClick={closeMenu}><li>About</li></NavLink>

          {user?.role === "jobseeker" && (
            <NavLink className={(e) => e.isActive ? "white" : "navItems"} to="/find-jobs" onClick={closeMenu}><li>Find Jobs</li></NavLink>
          )}

          {user?.role === "recruiter" && (
            <>
              <NavLink className={(e) => e.isActive ? "white" : "navItems"} to="/jobs" onClick={closeMenu}><li>My Jobs</li></NavLink>
              <NavLink className={(e) => e.isActive ? "white" : "navItems"} to="/addjob" onClick={closeMenu}><li>Add Job</li></NavLink>
            </>
          )}

          {user ? (
            <li className="navItems logout-btn" onClick={() => { handleLogout(); setMenuOpen(false); }} style={{ cursor: "pointer", color: "gold", fontWeight: "bold", listStyleType: "none", display: "inline-block" }}>
              Logout ({user.username})
            </li>
          ) : (
            <NavLink className={(e) => e.isActive ? "white" : "navItems"} to="/login" onClick={closeMenu}><li>Login</li></NavLink>
          )}
        </ul>
      </div>
    </div>
  )
}

export default Navbar
