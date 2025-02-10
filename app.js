import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./routes/user.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();
const app = express();

// Middleware
app.use(express.json());

app.use(
  cors({
    origin: ["https://67a9ce11b3b13e68d9034200--newsfullstack.netlify.app"],
    credentials: true, // Allow credentials (cookies, authorization headers)
  })
);
app.use(cookieParser());
let mongodburl = `${process.env.DB_CONNECT}`;
let connectDB = async () => {
  await mongoose.connect(mongodburl);
  console.log("Connected to MongoDB successfully");
};

app.use("/api", userRouter);
connectDB().then(() => {
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Server running on port ${process.env.PORT || 5000}`);
  });
});
