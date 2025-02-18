import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/users.js";
import { ApiResponse } from "../utils/ApiRes.js";

const logout = asyncHandler(async (req, res) => {
  try {
    // Ensure cookie-parser middleware is properly configured
    const user = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: { refreshToken: undefined },
      },
      { new: true }
    );

    if (!user) {
      return res.status(401).json(new ApiResponse(401, null, "User not found"));
    }
    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
      path: "/",
    };

    return res
      .status(200)
      .clearCookie("accessToken", options)
      .clearCookie("refreshToken", options)
      .json(new ApiResponse(200, {}, "User logged out"));
  } catch (error) {
    return res
      .status(500)
      .json(new ApiResponse(500, null, "Error during logout"));
  }
});

export { logout };
