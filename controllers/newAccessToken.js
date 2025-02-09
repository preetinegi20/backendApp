import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/users.js";
import { ApiResponse } from "../utils/ApiRes.js";
import { generateAccessTokenANDRefreshToken } from "./user.login.js";
import jwt from "jsonwebtoken";
const refreshAccess = asyncHandler(async (req, res) => {
  const refToken = req.cookies.refreshToken || req.body.refreshToken;
  //   console.log(refToken);
  if (!refToken) throw new ApiError(401, "Unauthorized request");
  try {
    const decodedToken = jwt.verify(refToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id);
    if (!user) throw new ApiError(401, "Invalid refresh Token");
    const { accessToken, newRefreshToken } = generateAccessTokenANDRefreshToken(
      user._id
    );
    const options = {
      httpOnly: true,
      secure: true,
    };
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          {
            accessToken,
            refreshToken: newRefreshToken,
          },
          "Access token refreshed successfully"
        )
      );
  } catch (err) {
    throw new ApiError(401, err?.message || "INVALID refresh Token");
  }
});
export { refreshAccess };
