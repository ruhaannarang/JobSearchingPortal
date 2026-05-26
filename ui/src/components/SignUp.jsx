import React from 'react'

const SignUp = () => {
    return (
        <div className='signUpPage'>
            <p className='signuppageheading'>How do you want to signup?</p>
            <div className='signUpFor'>
                <a className='signUpOptions' href="/recruiter-signup">Sign Up as Recruiter</a>
                <a className='signUpOptions' href="/jobseeker-signup">Sign Up as as Job Seeker</a>
            </div>
        </div>
    )
}

export default SignUp
