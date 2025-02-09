import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/users.js";
import jwt from "jsonwebtoken";
const jwtAuth = asyncHandler(async (req, res, next) => {
  try {
    console.log(req.cookies);
    const token =
      req.cookies.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    if (!token) throw new ApiError(401, "Unauthorized request");
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET); //check if the token is valid
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );
    if (!user) throw new ApiError(401, "Invalid token");
    req.user = user;
    next();
  } catch (err) {
    throw new ApiError(401, err?.message || "Invalid access token");
  }
});
export { jwtAuth };
