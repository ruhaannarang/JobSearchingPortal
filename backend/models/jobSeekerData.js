import mongoose from "mongoose";
const jobSeekerDataSchema = new mongoose.Schema({
  name:String,
  email:String,
  phone:Number,
  jobField:String,
  username:String,
  password:String
});
export const jobSeekerData = mongoose.model('jobSeekerData', jobSeekerDataSchema);