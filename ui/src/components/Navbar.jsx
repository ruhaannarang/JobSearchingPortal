import "@assets/css/navbar.css";
import { NavLink } from "react-router-dom";

import React from 'react'

const Navbar = () => {
  return (
    <div className="navbar">
      <div className="siteName">JobSearchPortal 💼</div>
      <div>
        <ul className='navbarOpt'>
          <NavLink className={(e) => { return e.isActive ? "white" : "navItems" }} to="/"><li>Home</li></NavLink>
          <NavLink className={(e) => { return e.isActive ? "white" : "navItems" }} to="/about"><li>About</li></NavLink>
          <NavLink className={(e) => { return e.isActive ? "white" : "navItems" }} to="/contact"><li>Contact</li></NavLink>
        </ul>
      </div>
    </div>
  )
}

export default Navbar
