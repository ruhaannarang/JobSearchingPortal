import "@assets/css/navbar.css";
import { NavLink } from "react-router-dom";
import React from 'react'

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="siteName">JobSearchPortal 💼</div>
      <div>
        <ul className='navbarOpt'>
          <NavLink className={(e) => e.isActive ? "white" : "navItems"} to="/"><li>Home</li></NavLink>
          <NavLink className={(e) => e.isActive ? "white" : "navItems"} to="/about"><li>About</li></NavLink>
          <NavLink className={(e) => e.isActive ? "white" : "navItems"} to="/contact"><li>Contact</li></NavLink>
          <NavLink className={(e) => e.isActive ? "white" : "navItems"} to="/jobs"><li>Jobs</li></NavLink>
          <NavLink className={(e) => e.isActive ? "white" : "navItems"} to="/addjob"><li>Add Job</li></NavLink>
        </ul>
      </div>
    </div>
  )
}

export default Navbar
