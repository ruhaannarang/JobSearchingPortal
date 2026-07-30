// const express = require("express");
// const cors = require("cors");
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { Jobs } from "./models/Jobs.js";
import { authverify } from "./middleware/authverify.js";
import jwt from "jsonwebtoken";
dotenv.config();
// await mongoose.connect("mongodb://localhost:27017/JobSearchPortal")
await mongoose.connect(process.env.mongoURL);
import { recruiterData } from "./models/RecruiterData.js";
import { jobSeekerData } from "./models/jobSeekerData.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/jobSeekerData", async (req, res) => {
  try {
    const user = new jobSeekerData(req.body);
    const password = user.password;
    const hashpassword = await bcrypt.hash(password, 10);
    user.password = hashpassword;
    await user.save();
    res.json({ message: "User saved successfully!" });
  } catch (err) {
    console.error("Error saving user:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/recruiterData", async (req, res) => {
  try {
    console.log("Received data:", req.body);

    const user = new recruiterData(req.body);
    const password = user.password;
    const hashpassword = await bcrypt.hash(password, 10);
    user.password = String(hashpassword);
    await user.save();
    res.json({ message: "User saved successfully!" });
  } catch (err) {
    console.error("Error saving user:", err.message);
    res.status(500).json({ error: err.message });
  }
});
app.post("/login", async (req, res) => {
  const creds = req.body;

  if (creds.role === "jobseeker") {
    const user = await jobSeekerData.findOne({ username: creds.username });
    if (!user) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }
    const check = await bcrypt.compare(creds.password, user.password);
    if (!check) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }
    const token = jwt.sign({ id: user._id, role: "jobseeker" }, process.env.JWT_SECRET);
    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        phone: user.phone,
        jobField: user.jobField,
        resumeUrl: user.resumeUrl,
        role: "jobseeker",
      },
    });
  }

  if (creds.role === "recruiter") {
    const user = await recruiterData.findOne({ username: creds.username });
    if (!user) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }
    const check = await bcrypt.compare(creds.password, user.password);
    if (!check) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }
    const token = jwt.sign({ id: user._id, role: "recruiter" }, process.env.JWT_SECRET);
    res.status(200).json({
      message: "Login Successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username,
        phone: user.phone,
        companyname: user.companyname,
        companylogourl: user.companylogourl,
        role: "recruiter",
      },
    });
  }
});
app.post("/api/jobs", async (req, res) => {
  try {
    const job = new Jobs(req.body);
    await job.save();
    res.status(201).json({ message: "Job created successfully!" });
  } catch (err) {
    console.error("Error creating job:", err.message);
    res.status(500).json({ error: err.message });
  }
});
app.get("/api/jobs", async (req, res) => {
  try {
    const { domain } = req.query;
    let query = {};
    if (domain) {
      query.domain = domain;
    }
    const jobs = await Jobs.find(query).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error("Error fetching all jobs:", err.message);
    res.status(500).json({ error: err.message });
  }
});
app.post("/api/jobs/:id/apply", authverify, async (req, res) => {
  try {
    if (req.user.role !== "jobseeker") {
      return res.status(403).json({ error: "Only job seekers can apply for jobs" });
    }
    if (!req.user.resumeUrl) {
      return res.status(400).json({ error: "You must upload a resume to apply. Please sign up with your resume." });
    }
    const job = await Jobs.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    const alreadyApplied = job.appliedBy && job.appliedBy.some(app => app.username === req.user.username);
    if (alreadyApplied) {
      return res.status(400).json({ error: "You have already applied to this job" });
    }
    const applicantDetails = {
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      jobField: req.user.jobField,
      username: req.user.username,
      resumeUrl: req.user.resumeUrl,
      appliedAt: new Date()
    };
    if (!job.appliedBy) {
      job.appliedBy = [];
    }
    job.appliedBy.push(applicantDetails);
    await job.save();

    // Add job to jobseeker's appliedJobs array
    await jobSeekerData.findByIdAndUpdate(
      req.user.id,
      {
        $addToSet: {
          appliedJobs: {
            jobId: job._id,
            title: job.title,
            company: job.company,
            location: job.location,
            salary: job.salary,
            domain: job.domain,
            appliedAt: new Date(),
            status: "applied"
          }
        }
      }
    );

    res.json({ message: "Application sent successfully!", job });
  } catch (err) {
    console.error("Error applying for job:", err.message);
    res.status(500).json({ error: err.message });
  }
});
app.get("/myjobs/:name", async (req, res) => {
  try {
    const username = req.params.name;
    const jobs = await Jobs.find({
      createdBy: { $regex: `^${username}$`, $options: "i" },
    }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    console.error("Error fetching jobs:", err.message);
    res.status(500).json({ error: err.message });
  }
});
app.get("/recruiter/:username", async (req, res) => {
  try {
    const recruiter = await recruiterData.findOne({ username: { $regex: `^${req.params.username}$`, $options: "i" } }).select("-password");
    if (!recruiter) {
      return res.status(404).json({ error: "Recruiter not found" });
    }

    res.json({
      id: recruiter._id,
      name: recruiter.name,
      username: recruiter.username,
      companyname: recruiter.companyname,
      companylogourl: recruiter.companylogourl,
    });
  } catch (err) {
    console.error("Error fetching recruiter:", err.message);
    res.status(500).json({ error: err.message });
  }
});
app.get("/jobs/:id", async (req, res) => {
  try {
    const job = await Jobs.findById(req.params.id);
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }
    res.json(job);
  } catch (err) {
    console.error("Error fetching job:", err.message);
    res.status(500).json({ error: err.message });
  }
});
app.get("/getuser", authverify, async (req, res) => {
  res.json({
    user: req.user
  });
});
app.get("/api", (req, res) => {
  res.json({
    message: "Hello from the API!",
    randomNumber: Math.ceil(Math.random() * 100),
  });
});

// Update job seeker profile
app.put("/api/jobseeker/profile", authverify, async (req, res) => {
  try {
    if (req.user.role !== "jobseeker") {
      return res.status(403).json({ error: "Only job seekers can update this profile" });
    }
    const { name, email, phone, jobField, resumeUrl } = req.body;
    const user = await jobSeekerData.findByIdAndUpdate(
      req.user.id,
      { name, email, phone, jobField, resumeUrl },
      { new: true, runValidators: true }
    ).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "Profile updated successfully!", user });
  } catch (err) {
    console.error("Error updating job seeker profile:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get applied jobs for job seeker
app.get("/api/jobseeker/applied-jobs", authverify, async (req, res) => {
  try {
    if (req.user.role !== "jobseeker") {
      return res.status(403).json({ error: "Only job seekers can view applied jobs" });
    }
    const user = await jobSeekerData.findById(req.user.id).select("-password").populate('appliedJobs.jobId');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ appliedJobs: user.appliedJobs || [] });
  } catch (err) {
    console.error("Error fetching applied jobs:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Update recruiter profile
app.put("/api/recruiter/profile", authverify, async (req, res) => {
  try {
    if (req.user.role !== "recruiter") {
      return res.status(403).json({ error: "Only recruiters can update this profile" });
    }
    const { name, email, phone, companyname, companylogourl } = req.body;
    const user = await recruiterData.findByIdAndUpdate(
      req.user.id,
      { name, email, phone, companyname, companylogourl },
      { new: true, runValidators: true }
    ).select("-password");
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ message: "Profile updated successfully!", user });
  } catch (err) {
    console.error("Error updating recruiter profile:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Helper to get Nodemailer transporter
const getTransporter = async () => {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  try {
    const testAccount = await nodemailer.createTestAccount();
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  } catch (err) {
    console.warn("Could not create Ethereal test account, using JSON transport fallback:", err.message);
    return nodemailer.createTransport({
      jsonTransport: true,
    });
  }
};

// Endpoint 1: Send Job Offer Email
app.post("/api/send-offer-email", authverify, async (req, res) => {
  try {
    const { applicantEmail, applicantName, jobTitle, companyName, customNote } = req.body;

    if (!applicantEmail) {
      return res.status(400).json({ error: "Applicant email is required" });
    }

    const transporter = await getTransporter();
    const sender = process.env.EMAIL_USER || `"Job Portal" <no-reply@jobportal.com>`;

    const mailOptions = {
      from: sender,
      to: applicantEmail,
      subject: `🎉 Job Offer: ${jobTitle || 'Position'} at ${companyName || 'Our Company'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111827; color: #f9fafb; padding: 30px; border-radius: 12px; border: 1px solid #374151;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #fbbf24; margin: 0; font-size: 24px;">Congratulations!</h1>
            <p style="color: #9ca3af; font-size: 14px; margin-top: 4px;">Job Offer Letter</p>
          </div>
          <p style="font-size: 16px; color: #e5e7eb;">Dear <strong>${applicantName || 'Applicant'}</strong>,</p>
          <p style="font-size: 15px; line-height: 1.6; color: #d1d5db;">
            We are thrilled to offer you the position of <strong>${jobTitle || 'the applied role'}</strong> at <strong>${companyName || 'our company'}</strong>!
          </p>
          ${customNote ? `
            <div style="background-color: #1f2937; padding: 16px; border-left: 4px solid #fbbf24; border-radius: 6px; margin: 20px 0; color: #e5e7eb;">
              <strong>Message from Recruiter:</strong><br/>
              <p style="margin: 6px 0 0 0; color: #d1d5db; white-space: pre-wrap;">${customNote}</p>
            </div>
          ` : ''}
          <p style="font-size: 15px; line-height: 1.6; color: #d1d5db;">
            We were very impressed with your background and skills, and we believe you will be a valuable addition to our team.
          </p>
          <p style="font-size: 15px; line-height: 1.6; color: #d1d5db;">
            Please reply to this email to confirm your acceptance or if you have any questions.
          </p>
          <hr style="border: 0; border-top: 1px solid #374151; margin: 24px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">
            Sent from ${companyName || 'Job Portal'} Recruitment Team
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Offer email sent successfully:", info.messageId || info);

    const previewUrl = nodemailer.getTestMessageUrl(info);

    res.json({
      message: "Job offer email sent successfully!",
      info: info.messageId || info,
      previewUrl: previewUrl || null,
    });
  } catch (err) {
    console.error("Error sending offer email:", err);
    res.status(500).json({ error: err.message || "Failed to send offer email" });
  }
});

// Endpoint 2: Send Rejection (Not Selected) Email
app.post("/api/send-rejection-email", authverify, async (req, res) => {
  try {
    const { applicantEmail, applicantName, jobTitle, companyName, customNote } = req.body;

    if (!applicantEmail) {
      return res.status(400).json({ error: "Applicant email is required" });
    }

    const transporter = await getTransporter();
    const sender = process.env.EMAIL_USER || `"Job Portal" <no-reply@jobportal.com>`;

    const mailOptions = {
      from: sender,
      to: applicantEmail,
      subject: `Application Update: ${jobTitle || 'Position'} at ${companyName || 'Our Company'}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111827; color: #f9fafb; padding: 30px; border-radius: 12px; border: 1px solid #374151;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #f87171; margin: 0; font-size: 22px;">Application Status Update</h1>
          </div>
          <p style="font-size: 16px; color: #e5e7eb;">Dear <strong>${applicantName || 'Applicant'}</strong>,</p>
          <p style="font-size: 15px; line-height: 1.6; color: #d1d5db;">
            Thank you for taking the time to apply for the <strong>${jobTitle || 'position'}</strong> role at <strong>${companyName || 'our company'}</strong>.
          </p>
          <p style="font-size: 15px; line-height: 1.6; color: #d1d5db;">
            After careful review of all applications, we regret to inform you that we have decided to move forward with other candidates for this position.
          </p>
          ${customNote ? `
            <div style="background-color: #1f2937; padding: 16px; border-left: 4px solid #f87171; border-radius: 6px; margin: 20px 0; color: #e5e7eb;">
              <strong>Message from Recruiter:</strong><br/>
              <p style="margin: 6px 0 0 0; color: #d1d5db; white-space: pre-wrap;">${customNote}</p>
            </div>
          ` : ''}
          <p style="font-size: 15px; line-height: 1.6; color: #d1d5db;">
            We sincerely appreciate your interest in joining our team and wish you the best of luck in your job search.
          </p>
          <hr style="border: 0; border-top: 1px solid #374151; margin: 24px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">
            Sent from ${companyName || 'Job Portal'} Recruitment Team
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Rejection email sent successfully:", info.messageId || info);

    const previewUrl = nodemailer.getTestMessageUrl(info);

    res.json({
      message: "Application status (Not Selected) email sent successfully!",
      info: info.messageId || info,
      previewUrl: previewUrl || null,
    });
  } catch (err) {
    console.error("Error sending rejection email:", err);
    res.status(500).json({ error: err.message || "Failed to send rejection email" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
