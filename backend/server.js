// const express = require("express");
// const cors = require("cors");
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import dns from "dns";
import { Resend } from "resend";
import { Jobs } from "./models/Jobs.js";
import { authverify } from "./middleware/authverify.js";
import jwt from "jsonwebtoken";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PDFParse } from "pdf-parse";

dns.setDefaultResultOrder("ipv4first");


dotenv.config();

// Prefer IPv4 DNS resolution to avoid ENETUNREACH errors when IPv6 is not available
if (dns && typeof dns.setDefaultResultOrder === 'function') {
  try {
    dns.setDefaultResultOrder('ipv4first');
  } catch (e) {
    console.warn('Could not set DNS result order:', e && e.message);
  }
}

// await mongoose.connect("mongodb://localhost:27017/JobSearchPortal")
await mongoose.connect(process.env.mongoURL);
import { recruiterData } from "./models/RecruiterData.js";
import { jobSeekerData } from "./models/jobSeekerData.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const getGeminiModel = () => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  return new ChatGoogleGenerativeAI({
    apiKey: process.env.GEMINI_API_KEY,
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    temperature: 0,
  });
};

const cleanGeminiJson = (text) => {
  if (!text) return null;
  const trimmed = String(text).trim();
  const afterFence = trimmed.replace(/```json\s*/i, '').replace(/```/g, '').trim();
  return afterFence;
};

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/api/resume/ats-score", async (req, res) => {
  try {
    const { resumeUrl, jobDescription, jobTitle, jobId } = req.body;

    if (!resumeUrl) {
      return res.status(400).json({ error: "resumeUrl is required" });
    }

    const jobContext = jobDescription || '';
    const targetJob = jobId ? await Jobs.findById(jobId) : null;
    const mergedJobDescription = jobContext || targetJob?.description || '';

    const resumeResponse = await fetch(resumeUrl);
    if (!resumeResponse.ok) {
      return res.status(400).json({ error: "Could not download the resume PDF from the resumeUrl" });
    }

    const resumeBuffer = Buffer.from(await resumeResponse.arrayBuffer());
    const pdfParser = new PDFParse({ data: resumeBuffer });
    const parsedPDF = await pdfParser.getText();
    const resumeText = parsedPDF?.text || '';

    if (!resumeText.trim()) {
      return res.status(422).json({ error: "The uploaded resume could not be parsed into text" });
    }

    await pdfParser.destroy();

    const ai = getGeminiModel();
    if (!ai) {
      return res.status(503).json({ error: "ATS scoring is unavailable because GEMINI_API_KEY is not configured" });
    }

    const prompt = `You are an ATS screening assistant.
Analyse the resume text against the job description below and return strict JSON only.

Request:
- Return atsScore as a number between 0 and 100.
- Return summary as a short paragraph.
- Return fitLevel as one of: Excellent, Good, Moderate, Weak.
- Return recommendations as an array of short recommendations for improving the resume.

Job title: ${jobTitle || "Applied role"}
Job description:
${mergedJobDescription || "No job description provided"}

Resume text:
${resumeText}

Required JSON schema:
{
  "atsScore": 0,
  "summary": "",
  "missingKeywords": [],
  "fitLevel": "",
  "recommendations": []
}`;

    const response = await ai.invoke(prompt);
    const rawResponse = typeof response?.content === 'string'
      ? response.content
      : Array.isArray(response?.content)
        ? response.content.map((part) => part?.text || part?.content || '').join('')
        : String(response || '');

    console.log('Gemini ATS raw response:', rawResponse);

    const parsedJSON = JSON.parse(cleanGeminiJson(rawResponse));

    return res.json({
      message: "ATS score generated successfully",
      ats: parsedJSON.atsScore,
      fitLevel: parsedJSON.fitLevel,
      summary: parsedJSON.summary,
      missingKeywords: parsedJSON.missingKeywords || [],
      recommendations: parsedJSON.recommendations || [],
      parsedResumeWords: resumeText.trim().split(/\s+/).length,
    });
  } catch (err) {
    console.error("Error generating ATS score:", err?.message || err);
    return res.status(500).json({ error: err?.message || "ATS score generation failed" });
  }
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

// Email Algorithm Helpers
const isValidEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

const escapeHtml = (str) => {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

const getResendClient = () => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  return new Resend(process.env.RESEND_API_KEY);
};

const sanitizeFromAddress = (raw) => {
  if (!raw) return null;
  let s = String(raw).trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    s = s.slice(1, -1).trim();
  }

  // If in the form: Name <email@domain>
  const match = s.match(/^(.*)<([^>]+)>$/);
  if (match) {
    const name = match[1].trim().replace(/^"|"$/g, '').trim();
    const email = match[2].trim();
    if (isValidEmail(email)) {
      return name ? `${name} <${email}>` : email;
    }
    return null;
  }

  // Otherwise raw should be just an email
  if (isValidEmail(s)) return s;
  return null;
};

const getResendFromAddress = () => {
  const raw = process.env.RESEND_FROM_EMAIL;
  const sanitized = sanitizeFromAddress(raw);
  if (!sanitized) {
    // Fallback to a safe default
    return 'Job Portal <onboarding@resend.dev>';
  }
  return sanitized;
};

// Endpoint 1: Send Job Offer Email
app.post("/api/send-offer-email", authverify, async (req, res) => {
  try {
    const { applicantEmail, applicantName, jobTitle, companyName, customNote } = req.body;

    if (!applicantEmail) {
      return res.status(400).json({ error: "Applicant email is required" });
    }

    if (!isValidEmail(applicantEmail)) {
      return res.status(400).json({ error: "Invalid applicant email address format" });
    }

    const safeName = escapeHtml(applicantName || 'Applicant');
    const safeJob = escapeHtml(jobTitle || 'Position');
    const safeCompany = escapeHtml(companyName || 'Our Company');
    const safeNote = escapeHtml(customNote || '');

    const resend = getResendClient();
    const sender = getResendFromAddress();
    console.log('Resolved sender for offer email:', sender);

    const emailPayload = {
      from: sender,
      to: applicantEmail,
      subject: `🎉 Job Offer: ${safeJob} at ${safeCompany}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111827; color: #f9fafb; padding: 30px; border-radius: 12px; border: 1px solid #374151;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #fbbf24; margin: 0; font-size: 24px;">Congratulations!</h1>
            <p style="color: #9ca3af; font-size: 14px; margin-top: 4px;">Job Offer Letter</p>
          </div>
          <p style="font-size: 16px; color: #e5e7eb;">Dear <strong>${safeName}</strong>,</p>
          <p style="font-size: 15px; line-height: 1.6; color: #d1d5db;">
            We are thrilled to offer you the position of <strong>${safeJob}</strong> at <strong>${safeCompany}</strong>!
          </p>
          ${safeNote ? `
            <div style="background-color: #1f2937; padding: 16px; border-left: 4px solid #fbbf24; border-radius: 6px; margin: 20px 0; color: #e5e7eb;">
              <strong>Message from Recruiter:</strong><br/>
              <p style="margin: 6px 0 0 0; color: #d1d5db; white-space: pre-wrap;">${safeNote}</p>
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
            Sent from ${safeCompany} Recruitment Team
          </p>
        </div>
      `,
    };

    const { data, error } = await resend.emails.send(emailPayload);
    if (error) {
      throw new Error(error.message || "Failed to send offer email");
    }
    console.log("Offer email sent successfully:", data?.id || data);

    res.json({
      message: "Job offer email sent successfully!",
      info: data?.id || data || null,
      previewUrl: null,
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

    if (!isValidEmail(applicantEmail)) {
      return res.status(400).json({ error: "Invalid applicant email address format" });
    }

    const safeName = escapeHtml(applicantName || 'Applicant');
    const safeJob = escapeHtml(jobTitle || 'Position');
    const safeCompany = escapeHtml(companyName || 'Our Company');
    const safeNote = escapeHtml(customNote || '');

    const resend = getResendClient();
    const sender = getResendFromAddress();
    console.log('Resolved sender for rejection email:', sender);

    const emailPayload = {
      from: sender,
      to: applicantEmail,
      subject: `Application Update: ${safeJob} at ${safeCompany}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #111827; color: #f9fafb; padding: 30px; border-radius: 12px; border: 1px solid #374151;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #f87171; margin: 0; font-size: 22px;">Application Status Update</h1>
          </div>
          <p style="font-size: 16px; color: #e5e7eb;">Dear <strong>${safeName}</strong>,</p>
          <p style="font-size: 15px; line-height: 1.6; color: #d1d5db;">
            Thank you for taking the time to apply for the <strong>${safeJob}</strong> role at <strong>${safeCompany}</strong>.
          </p>
          <p style="font-size: 15px; line-height: 1.6; color: #d1d5db;">
            After careful review of all applications, we regret to inform you that we have decided to move forward with other candidates for this position.
          </p>
          ${safeNote ? `
            <div style="background-color: #1f2937; padding: 16px; border-left: 4px solid #f87171; border-radius: 6px; margin: 20px 0; color: #e5e7eb;">
              <strong>Message from Recruiter:</strong><br/>
              <p style="margin: 6px 0 0 0; color: #d1d5db; white-space: pre-wrap;">${safeNote}</p>
            </div>
          ` : ''}
          <p style="font-size: 15px; line-height: 1.6; color: #d1d5db;">
            We sincerely appreciate your interest in joining our team and wish you the best of luck in your job search.
          </p>
          <hr style="border: 0; border-top: 1px solid #374151; margin: 24px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">
            Sent from ${safeCompany} Recruitment Team
          </p>
        </div>
      `,
    };

    const { data, error } = await resend.emails.send(emailPayload);

    if (error) {
      throw new Error(error.message || "Failed to send rejection email");
    }

    console.log("Rejection email sent successfully:", data?.id || data);

    res.json({
      message: "Application status (Not Selected) email sent successfully!",
      info: data?.id || data || null,
      previewUrl: null,
    });
  } catch (err) {
    console.error("Error sending rejection email:", err);
    res.status(500).json({ error: err.message || "Failed to send rejection email" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
