import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "./routes/user.js";
import cookieParser from "cookie-parser";
import axios from "axios";
dotenv.config();
const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));
const allowedOrigins = [
  "https://67b4ae9630252f000893eb08--newsfullstack.netlify.app/",
  "https://backendapp-18bz.onrender.com",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // console.log("Blocked CORS Request from:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // 🔥 Required for sending cookies
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/news", async (req, res) => {
  try {
    const { category, author, startDate, endDate } = req.query;

    // Construct the NewsAPI request
    const response = await axios.get("https://newsapi.org/v2/everything", {
      params: {
        q: category || "technology", // Use category as the search term
        apiKey: process.env.NEWS_API_KEY,
        language: "en",
        sortBy: "publishedAt",
        ...(startDate && { from: startDate }),
        ...(endDate && { to: endDate }),
      },
    });

    let articles = response.data.articles;

    // Apply additional filters
    if (author) {
      articles = articles.filter((item) =>
        item.author?.toLowerCase().includes(author.toLowerCase())
      );
    }

    res.json({ articles });
  } catch (error) {
    console.error(
      "Error fetching news:",
      error.response?.data || error.message
    );
    res.status(error.response?.status || 500).json({
      error: error.response?.data || "Server error",
    });
  }
});

// app.get("/news", async (req, res) => {
//   try {
//     const { category, author, startDate, endDate } = req.query;

//     const response = await axios.get("http://newsapi.org/v2/everything?", {
//       params: {
//         q: category || "",
//         ...(startDate && { from: startDate }),
//         ...(endDate && { to: endDate }),
//         apiKey: process.env.NEWS_API_KEY,
//         // Add date range to API query if provided
//       },
//     });

//     let articles = response.data.articles;

//     // Filter by author if provided
//     if (author) {
//       articles = articles.filter((item) =>
//         item.author?.toLowerCase().includes(author.toLowerCase())
//       );
//     }

//     // Additional date filtering if needed
//     if (startDate || endDate) {
//       articles = articles.filter((item) => {
//         const articleDate = new Date(item.publishedAt);
//         const start = startDate ? new Date(startDate) : null;
//         const end = endDate ? new Date(endDate) : null;

//         return (!start || articleDate >= start) && (!end || articleDate <= end);
//       });
//     }

//     res.json({ articles });
//   } catch (error) {
//     console.log(req.query);
//     console.error(
//       "Error fetching news:",
//       error.response?.data || error.message
//     );
//     res.status(error.response?.status || 500).json({
//       error: error.response?.data || "Server error",
//     });
//   }
// });

// app.get("/news", async (req, res) => {
//   try {
//     const { category, author, startDate, endDate } = req.query;

//     const response = await axios.get("http://newsapi.org/v2/everything?", {
//       params: {
//         // country: "us",
//         q: category || "", // Example: "sports", "business", "technology"
//         // publishedAt: publishedAt,
//         apiKey: process.env.NEWS_API_KEY,
//       },
//     });
//     // console.log(response.data);
//     let articles = response.data.articles;

//     console.log(articles);
//     // 🔹 Filter by author
//     if (author) {
//       articles = articles.filter((item) => {
//         return item.author?.toLowerCase().includes(author.toLowerCase());
//       });
//     }

//     // 🔹 Filter by start date
//     if (startDate) {
//       articles = articles.filter((item) => {
//         return new Date(item.publishedAt) >= new Date(startDate); //later than
//       });
//     }

//     // 🔹 Filter by end date
//     if (endDate) {
//       articles = articles.filter(
//         (item) => new Date(item.publishedAt) <= new Date(endDate) // before than
//       );
//     }

//     res.json({ articles });
//   } catch (error) {
//     console.error(
//       "Error fetching news:",
//       error.response?.data || error.message
//     );
//     res.status(error.response?.status || 500).json({
//       error: error.response?.data || "Server error",
//     });
//   }
// });

// ✅ Handle Preflight Requests
app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.status(204).end(); // No content response (important)
});

// ✅ Ensure Routes Are Loaded Before Server Starts
app.use("/api", userRouter);
// app.use((err, req, res, next) => {
//   req.setTimeout(5000); // 10 second timeout
//   console.error("Uncaught error:", err); // Log the error details

//   // Check if there's a custom status code and message
//   const statusCode = err.statusCode || 500;
//   const message = err.message || "Internal Server Error";

//   // Send JSON response
//   res.status(statusCode).json({
//     message,
//     error: err.stack, // Include the error stack for debugging
//   });
//   next();
// });

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
