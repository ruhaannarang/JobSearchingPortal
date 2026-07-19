// const express = require("express");
// const cors = require("cors");
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
