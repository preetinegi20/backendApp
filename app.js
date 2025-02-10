import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./routes/user.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

// ✅ CORS Configuration
const allowedOrigins = [
  "https://67a9ce11b3b13e68d9034200--newsfullstack.netlify.app",
  "http://localhost:5173", // Include if testing locally
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // ✅ Allows cookies/auth headers
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
  })
);

// ✅ Handle Preflight Requests
app.options("*", cors());

app.use(express.json());
app.use(cookieParser());

// ✅ Ensure Routes Are Loaded Before Server Starts
app.use("/api", userRouter);

// ✅ Start Server After DB Connects
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.DB_CONNECT)
  .then(() => {
    console.log("Connected to MongoDB successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log("DB Connection Error:", err));
