import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
export const authverify = (req, res, next) => {
  const token = req.headers["authorization"];
  const data= jwt.verify(token, process.env.JWT_SECRET);
  req.user=data.user;
  next()
}