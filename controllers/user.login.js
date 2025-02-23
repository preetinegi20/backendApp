import { User } from "../models/users.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRes.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const generateAccessTokenANDRefreshToken = async function (userID) {
  try {
    const user = await User.findById(userID);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false }); //save the rt in DB
    return { accessToken, refreshToken };
  } catch (err) {
    throw new ApiError(
      500,
      "Something went wrong while generating the access and refresh token"
    );
  }
};
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new ApiError(400, "email and password required");

  //find the user
  const user = await User.findOne({ email });
  if (!user)
    return res.status(401).json(new ApiError(401, "email is not found"));

  const isPassCorrect = await user.isPassCorrect(password);
  if (!isPassCorrect)
    return res.status(401).json(new ApiError(401, "incorrect password"));

  const { accessToken, refreshToken } =
    await generateAccessTokenANDRefreshToken(user._id);
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  ); //extracting the whole user field excluding pass anf rt
  const options = {
    httpOnly: true,
    secure: true, //  for production
    sameSite: "None", // for cross-origin
    path: "/",
    domain: process.env.NODE_ENV === "production",
    // ? "backendapp-18bz.onrender.com" // Make sure this matches your API domain
    // : "localhost",
  };
  // console.log(user);
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200, //statuscode
        {
          //data
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully" //msg
      )
    );
});
export { loginUser, generateAccessTokenANDRefreshToken };
