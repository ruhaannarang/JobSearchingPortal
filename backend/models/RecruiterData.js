import mongoose from "mongoose";
const recruiterDataSchema = new mongoose.Schema({
  name:String,
  email:String,
  phone:Number,
  companyname:String,
  companylogourl:String,
  username:String,
  password:String
});
export const recruiterData = mongoose.model('recruiterData', recruiterDataSchema);