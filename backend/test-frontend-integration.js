import express from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// Simple integration test for frontend-backend email endpoints
const JWT_SECRET = process.env.JWT_SECRET || "JobSearchPortal";

// Email Algorithm Helpers (same as server.js)
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

let cachedTransporter = null;

const getTransporter = async () => {
  if (cachedTransporter) return cachedTransporter;
  try {
    const testAccount = await nodemailer.createTestAccount();
    cachedTransporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    return cachedTransporter;
  } catch (err) {
    cachedTransporter = nodemailer.createTransport({ jsonTransport: true });
    return cachedTransporter;
  }
};

const mockAuthverify = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid token" });
  }
};

const app = express();
app.use(express.json());

// Endpoint 1: Send Job Offer Email
app.post("/api/send-offer-email", mockAuthverify, async (req, res) => {
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

    const transporter = await getTransporter();

    const mailOptions = {
      from: `"Job Portal" <no-reply@jobportal.com>`,
      to: applicantEmail,
      subject: `🎉 Job Offer: ${safeJob} at ${safeCompany}`,
      html: `<p>Dear ${safeName}, congratulations on ${safeJob} at ${safeCompany}. Note: ${safeNote}</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);

    res.json({
      message: "Job offer email sent successfully!",
      info: info.messageId || info,
      previewUrl: previewUrl || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to send offer email" });
  }
});

// Endpoint 2: Send Rejection Email
app.post("/api/send-rejection-email", mockAuthverify, async (req, res) => {
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

    const transporter = await getTransporter();

    const mailOptions = {
      from: `"Job Portal" <no-reply@jobportal.com>`,
      to: applicantEmail,
      subject: `Application Update: ${safeJob} at ${safeCompany}`,
      html: `<p>Dear ${safeName}, application update for ${safeJob} at ${safeCompany}. Note: ${safeNote}</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);

    res.json({
      message: "Application status (Not Selected) email sent successfully!",
      info: info.messageId || info,
      previewUrl: previewUrl || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message || "Failed to send rejection email" });
  }
});

// Run Integration Server on random port to test HTTP requests
const server = app.listen(0, async () => {
  const port = server.address().port;
  console.log(`Test Integration Server listening on port ${port}`);

  const testToken = jwt.sign({ id: "testRecruiter123", role: "recruiter" }, JWT_SECRET);
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    console.log("\n--- 1. Testing Frontend POST /api/send-offer-email (Valid Payload) ---");
    const res1 = await fetch(`http://localhost:${port}/api/send-offer-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${testToken}`
      },
      body: JSON.stringify({
        applicantEmail: "applicant@example.com",
        applicantName: "Alex Mercer",
        jobTitle: "Senior React Developer",
        companyName: "InnovateTech",
        customNote: "Excited to welcome you!"
      })
    });
    const data1 = await res1.json();
    assert(res1.status === 200, "HTTP 200 returned for valid offer request");
    assert(data1.message === "Job offer email sent successfully!", "Success message returned");
    assert(data1.previewUrl !== undefined, "Preview URL field returned");

    console.log("\n--- 2. Testing Frontend POST /api/send-rejection-email (Valid Payload) ---");
    const res2 = await fetch(`http://localhost:${port}/api/send-rejection-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${testToken}`
      },
      body: JSON.stringify({
        applicantEmail: "candidate@example.com",
        applicantName: "Jordan Lee",
        jobTitle: "UI/UX Designer",
        companyName: "Creative Studio",
        customNote: "Thank you for applying."
      })
    });
    const data2 = await res2.json();
    assert(res2.status === 200, "HTTP 200 returned for valid rejection request");
    assert(data2.message === "Application status (Not Selected) email sent successfully!", "Success message returned");

    console.log("\n--- 3. Testing Missing Authorization Token (401 Unauthorized) ---");
    const res3 = await fetch(`http://localhost:${port}/api/send-offer-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicantEmail: "test@example.com" })
    });
    assert(res3.status === 401, "HTTP 401 returned when token is missing");

    console.log("\n--- 4. Testing Invalid Email Format (400 Bad Request) ---");
    const res4 = await fetch(`http://localhost:${port}/api/send-offer-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${testToken}`
      },
      body: JSON.stringify({
        applicantEmail: "not-an-email",
        applicantName: "Bad Input",
        jobTitle: "Dev",
        companyName: "Co"
      })
    });
    const data4 = await res4.json();
    assert(res4.status === 400, "HTTP 400 returned for invalid email string");
    assert(data4.error === "Invalid applicant email address format", "Error message indicates invalid format");

    console.log(`\n=== Integration Test Summary: ${passed} Passed, ${failed} Failed ===`);
  } catch (err) {
    console.error("Integration test error:", err);
  } finally {
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  }
});
