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
  console.log("input pass: ", password);
  if (!isPassCorrect)
    return res.status(401).json(new ApiError(401, "incorrect password"));

  const { accessToken, refreshToken } =
    await generateAccessTokenANDRefreshToken(user._id);

  console.log("accessToken", refreshToken);
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  ); //extracting the whole user field excluding pass anf rt
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken: accessToken,
          refreshToken: refreshToken,
        },
        "user logged in successfully"
      )
    );
});
export { loginUser, generateAccessTokenANDRefreshToken };
