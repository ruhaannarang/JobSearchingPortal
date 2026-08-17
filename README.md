# JobSearchPortal

JobSearchPortal is a full-stack job portal that connects recruiters and job seekers in one platform. The application includes user authentication, recruiter job posting, candidate applications, job filtering, profile management, and ATS-based resume analysis powered by Gemini.

## Features

- Separate portals for job seekers and recruiters
- Sign up and login with secure password hashing and JWT authentication
- Recruiter dashboard for posting and managing jobs
- Job seeker dashboard for browsing available jobs and applying
- Applied jobs tracking with status updates
- Resume ATS scoring using PDF parsing and Gemini AI
- Email notifications through Resend for application updates
- Profile editing for both job seekers and recruiters
- Responsive front-end built with React + Vite

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Axios

### Backend
- Node.js
- Express
- MongoDB with Mongoose
- JWT authentication
- bcrypt password hashing
- Resend email integration
- Google Gemini AI integration for ATS analysis

## Project Structure

```text
JobSearchPortal/
├── backend/
│   ├── middleware/
│   ├── models/
│   ├── .env
│   ├── package.json
│   ├── server.js
│   └── ...
├── ui/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
├── package.json
├── README.md
└── ...
```

## Prerequisites

Before running the project, make sure you have:

- Node.js 18+ installed
- npm installed
- MongoDB running locally or a MongoDB connection string available
- A Google Gemini API key for ATS resume scoring
- A Resend API key for email notifications

## Environment Variables

Create a `.env` file inside the `backend` folder with the following values:

```env
mongoURL=mongodb://localhost:27017/JobSearchPortal
JWT_SECRET=your_secure_jwt_secret
PORT=5000
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL="Job Search Portal <onboarding@resend.dev>"
```

> If you are connecting to MongoDB Atlas, replace `mongoURL` with your cluster connection string.

## Installation

1. Clone the repository

```bash
git clone <repository-url>
cd JobSearchPortal
```

2. Install backend dependencies

```bash
cd backend
npm install
```

3. Install frontend dependencies

```bash
cd ../ui
npm install
```

## Running the Application

### Start the backend

```bash
cd backend
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

### Start the frontend

```bash
cd ui
npm run dev
```

The UI runs on the Vite development server, typically:

```text
http://localhost:5173
```

## Available Scripts

### Backend

```bash
npm run dev
npm start
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## Main Backend API Endpoints

- `POST /jobSeekerData` – register a job seeker
- `POST /recruiterData` – register a recruiter
- `POST /login` – login for either role
- `POST /api/jobs` – create a job listing
- `GET /api/jobs` – fetch jobs
- `POST /api/jobs/:id/apply` – apply for a job
- `POST /api/resume/ats-score` – score a resume against a job description
- `GET /api/jobseeker/applied-jobs` – fetch applied jobs for a job seeker

## Notes

- The backend uses `.env` values for configuration and must be running before frontend APIs can work.
- ATS scoring requires a valid `GEMINI_API_KEY` and a PDF resume URL.
- Email features depend on `RESEND_API_KEY` and a valid sender address.

## License

This project is currently unlicensed unless otherwise specified in the repository.

## Contributing

Pull requests and improvements are welcome. If you are working on this project, keep the frontend and backend configuration aligned with the environment variables and API contracts.
