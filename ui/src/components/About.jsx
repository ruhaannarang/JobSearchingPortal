import React from 'react'

const About = () => {
  return (
    <div className="page-wrapper">
      <div className="about-container">
        <div className="page-card">
        <h1 className="page-heading">About JobSearchPortal</h1>
        <p className="muted">
          JobSearchPortal brings job seekers and recruiters together in a clean,
          efficient experience. We provide searchable job listings, tailored
          profiles, and tools for recruiters to find the right candidates faster.
        </p>

        <h2 className="page-heading">Our Mission</h2>
        <p className="muted">
          To make the job search and hiring process simpler, fairer, and more
          effective for everyone — whether you're applying for your first role or
          hiring across the company.
        </p>

        <h2 className="page-heading">What we offer</h2>
        <ul>
          <li>Clear, filterable job listings</li>
          <li>Profiles for candidates and recruiters</li>
          <li>Application tracking and resume-friendly formatting</li>
          <li>Privacy-first handling of user data</li>
        </ul>

        <h2 className="page-heading">Get Started</h2>
        <p className="muted">
          Create an account to apply for jobs, post openings, or save roles to
          revisit later. If you have questions, visit the Contact page to get in
          touch.
        </p>
        </div>
      </div>
    </div>
  )
}

export default About
