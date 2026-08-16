import mongoose from "mongoose";
const jobSeekerDataSchema = new mongoose.Schema({
  name:String,
  email:String,
  phone:Number,
  jobField:String,
  resumeUrl:String,
  username:String,
  password:String,
  appliedJobs: [{
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Jobs' },
    title: String,
    company: String,
    location: String,
    salary: Number,
    domain: String,
    appliedAt: { type: Date, default: Date.now },
    status: { type: String, default: 'applied' },
    decisionAt: { type: Date },
    recruiterNote: { type: String }
  }]
});
export const jobSeekerData = mongoose.model('jobSeekerData', jobSeekerDataSchema);