// const express = require("express");
// const cors = require("cors");
import cors from "cors";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import express from "express";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
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
    password = user.password;
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
    password = user.password;
    const hashpassword = await bcrypt.hash(password, 10);
    user.password = hashpassword;
    await user.save();
    res.json({ message: "User saved successfully!" });
  } catch (err) {
    console.error("Error saving user:", err.message);
    res.status(500).json({ error: err.message });
  }
});
app.post("/login", async (req, res) => {
  const creds =  req.body;

  if (creds.role == "jobseeker") {
    const user = await jobSeekerData.findOne({username:creds.username});
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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).json({
      message: "Login Successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  }
  if (creds.role == "recruiter") {
    const user = await recruiterData.findOne({username:creds.username});
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
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
    res.status(200).json({
      message: "Login Successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
