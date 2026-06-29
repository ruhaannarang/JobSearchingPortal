import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { jobSeekerData } from "../models/jobSeekerData.js";
import { recruiterData } from "../models/RecruiterData.js";

dotenv.config();

export const authverify = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id || decoded._id;
    const role = decoded.role;

    let user = null;

    try {
      if (role === "recruiter") {
        user = await recruiterData.findById(userId).select("-password");
      } else if (role === "jobseeker") {
        user = await jobSeekerData.findById(userId).select("-password");
      } else {
        user = (await jobSeekerData.findById(userId).select("-password")) ||
          (await recruiterData.findById(userId).select("-password"));
      }
    } catch (dbError) {
      console.warn("User lookup failed, falling back to token payload:", dbError.message);
    }

    if (user) {
      req.user = user.toObject ? user.toObject() : user;
      req.user.role = req.user.role || role;
      req.user._id = req.user._id || userId;
      req.user.id = req.user.id || userId;
    } else {
      req.user = { _id: userId, id: userId, role };
    }

    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    return res.status(401).json({ message: "Invalid token." });
  }
};