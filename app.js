import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./routes/user.js";
import cookieParser from "cookie-parser";
import axios from "axios";

dotenv.config();
const app = express();

// Basic middleware
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// CORS Configuration
const allowedOrigins = [
  "https://67b6224131f6815993cddefb--newsfullstack.netlify.app",
  "https://backendapp-18bz.onrender.com",
  "http://localhost:5173",
  "http://localhost:3000",
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      console.log("Blocked origin:", origin);
      return callback(new Error("CORS policy restriction"), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"],
  maxAge: 86400,
};

app.use(cors(corsOptions));

// News API endpoint with error handling
app.get("/news", async (req, res, next) => {
  try {
    const { category, author, startDate, endDate } = req.query;

    const response = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: category || "technology",
        apiKey: process.env.NEWS_API_KEY,
        language: "en",
        sortBy: "publishedAt",
        ...(startDate && { from: startDate }),
        ...(endDate && { to: endDate }),
      },
      timeout: 5000, // 5 second timeout
    });

    let articles = response.data.articles;

    if (author) {
      articles = articles.filter((item) =>
        item.author?.toLowerCase().includes(author.toLowerCase())
      );
    }

    res.json({
      success: true,
      articles,
    });
  } catch (error) {
    next(error); // Pass to error handler
  }
});

// API routes
app.use("/api", userRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Error:", err);

  // Handle CORS errors
  if (err.message.includes("CORS")) {
    return res.status(403).json({
      success: false,
      message: "CORS policy restriction",
      error: err.message,
    });
  }

  // Handle Axios errors
  if (axios.isAxiosError(err)) {
    return res.status(err.response?.status || 500).json({
      success: false,
      message: "External API error",
      error: err.response?.data || err.message,
    });
  }

  // Handle Mongoose errors
  if (err instanceof mongoose.Error) {
    return res.status(400).json({
      success: false,
      message: "Database error",
      error: err.message,
    });
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      error: err.message,
    });
  }

  // Default error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// Database connection and server start
const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
  })
  .then(() => {
    console.log("Connected to MongoDB successfully");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("DB Connection Error:", err);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down gracefully");
  mongoose.connection.close(false, () => {
    console.log("MongoDB connection closed");
    process.exit(0);
  });
});
