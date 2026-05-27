import mongoose from "mongoose";
const jobsSchema = new mongoose.Schema({
  title:String,
  company:String,
  location:String,
  salary:Number,
  description:String,
  appliedBy:[Object],
  createdBy:String
}, { timestamps: true });
export const Jobs = mongoose.model('Jobs', jobsSchema);