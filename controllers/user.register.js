import { User } from "../models/users.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRes.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const registerUser = asyncHandler(async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Basic validation
    if (!username?.trim() || !email?.trim() || !password?.trim()) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Check existing user
    const existingUser = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        { email: email.toLowerCase() },
      ],
    });

    if (existingUser) {
      const field =
        existingUser.username === username.toLowerCase() ? "username" : "email";
      return res.status(409).json({
        success: false,
        message: `User with this ${field} already exists`,
      });
    }

    // Hash password

    // Create user
    const user = await User.create({
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password,
    });

    // Get user without sensitive data
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken"
    );

    if (!createdUser) {
      throw new Error("Error while registering user");
    }

    return res.status(201).json({
      success: true,
      data: createdUser,
      message: "User registered successfully",
    });
  } catch (error) {
    console.error("Registration error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "Username or email already exists",
      });
    }

    return res.status(500).json({
      success: false,
      message: "An error occurred during registration. Please try again.",
    });
  }
});

export { registerUser };

// import { User } from "../models/users.js";
// import { ApiError } from "../utils/ApiError.js";
// import { ApiResponse } from "../utils/ApiRes.js";
// import { asyncHandler } from "../utils/asyncHandler.js";
// const registerUser = asyncHandler(async (req, res) => {
//   //user details from frontend
//   const { username, email, password } = req.body;

//   if ([username, email].some((item) => item?.trim() === ""))
//     throw new ApiError(400, "All fields are required");

//   const existedUser = await User.findOne({
//     $or: [{ username }, { email }],
//   });
//   console.log(req.body);

//   if (existedUser) throw new ApiError(206, "User already exist");

//   const user = await User.create({
//     username: username.toLowerCase(),
//     email,
//     password,
//   });
//   const createdUser = await User.findById(user._id).select(
//     "-password -refreshToken"
//   );
//   if (!createdUser) throw new ApiError(500, "error while registring the user");

//   return res
//     .status(201)
//     .json(new ApiResponse(200, createdUser, "User registration completed"));
// });
// export { registerUser };
