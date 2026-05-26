import React from 'react'
// import SignUp from './SignUp'

const Home = () => {
  return (
    <div>

      <div className='homepage'>
        <img className='img-homepage' src="https://m.foolcdn.com/media/dubs/images/smiling_man_in_business_suit_at_laptop_GettyIma.original.jpg" alt="" />
        <div className="homepage-side">
          <div className="intro">Get your Dream Job or give people theirs...</div>
          <div className="login-signup">
            <a className='login-signupOpt' href="/signup">Sign Up</a>
            <a className='login-signupOpt' href="/login">Login</a>
          </div>
        </div>
      </div>
      <div className="homepagedown">
        <p className='siteDesc' >Welcome to <span id='siteName'>JobSearchPortal</span> , a modern job search portal designed to bridge the gap between talented job seekers and forward-thinking recruiters.
          Our platform makes it simple for candidates to discover opportunities that match their skills, and for companies to find the right talent with ease.

          With advanced filters, smart recommendations, and real-time updates, <span id='siteName'>JobSearchPortal</span>  ensures that no opportunity is ever missed.
          Whether you are a student starting your career journey, a professional seeking growth, or an employer looking for skilled candidates, our portal is your one-stop solution for a seamless hiring experience.</p>
        <div className="keyfeatures">
          <h2>Why Choose Us?</h2>
           <ul>
            <li>Easy sign-up for job seekers and recruiters</li>
            <li>Personalized job recommendations</li>
            <li>24/7 access from any device</li>
            <li>Secure and fast application process</li>
           </ul>
        </div>
      </div>
    </div>
  )
}

export default Home
