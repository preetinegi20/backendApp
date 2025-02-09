// import cookieParser from "cookie-parser";
// import express from "express";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// const app = express();
// app.use(cookieParser()); //middleware to pass cookie
// app.get("/", (req, res) => {
//   //   res.cookie("name", "preeti");
//   //BCRYPT THE PASS (SALT- IT MIXED RANDOM CHARACTER WITH EXISITNG PASS, HASH- IT IS LONG CHARACTER STRING THAT IS MIXEDD WITH SALT VAL)
//   //   bcrypt.genSalt(10, (err, salt) => {
//   //     bcrypt.hash("password12312e", salt, (err, hash) => {
//   //       res.send(hash);
//   //       //   console.log(hash);
//   //     });
//   //   });

//   //COMPARE THE PASS WITH ENCRYPTED
//   //   bcrypt.compare(
//   //     "password12312e",
//   //     "$2b$10$QiKh/nXOlCEQYaM7YFCmZ.P/7VRwZpLvaXw3LFL3ZWuXNKpxKshvK"
//   //   ),
//   //     (err, result) => {
//   //       console.log(result);
//   //     };

//   let token = jwt.sign({ email: "me@gmail.com" }, "secret");
//   res.cookie("token", token);
//   console.log(token);
//   res.send(token);
// });

// app.get("/read", (req, res) => {
//   let data = jwt.verify(req.cookies.token, "secret");
//   res.send(data);
// });
// app.listen(5000);
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import userRouter from "../backend/routes/user.js";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();
const app = express();

// Middleware
app.use(express.json());
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Serve the built Vite files
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

const allowedOrigins = [
  "http://localhost:3000",
  "https://newsweb-production-eaaa.up.railway.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true, // Allow credentials (cookies, authorization headers)
  })
);
app.use(cookieParser());
let mongodburl = `${process.env.DB_CONNECT}/user`;
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
