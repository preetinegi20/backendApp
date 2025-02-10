import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./routes/user.js";
import cookieParser from "cookie-parser";

dotenv.config();
const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ["https://67a9ce11b3b13e68d9034200--newsfullstack.netlify.app"],
    credentials: true, // ✅ Allows cookies/auth headers
    methods: "GET, POST, PUT, DELETE, OPTIONS",
    allowedHeaders: "Content-Type, Authorization",
  })
);

// ✅ Ensure preflight requests are handled
app.options("*", cors());

// ✅ Register routes BEFORE starting the server
app.use("/api", userRouter);

let mongodburl = `${process.env.DB_CONNECT}`;
let connectDB = async () => {
  await mongoose.connect(mongodburl);
  console.log("Connected to MongoDB successfully");
};

app.get("/", (req, res) => {
  res.send("Backend is running successfully!");
});

// ✅ Start server AFTER DB is connected
const PORT = process.env.PORT || 5000;
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
