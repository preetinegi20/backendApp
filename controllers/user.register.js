import { User } from "../models/users.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiRes.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const registerUser = asyncHandler(async (req, res) => {
  //user details from frontend
  const { username, email, password } = req.body;

  if ([username, email].some((item) => item?.trim() === ""))
    throw new ApiError(400, "All fields are required");

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  console.log(req.body);

  if (existedUser) throw new ApiError(206, "User already exist");

  const user = await User.create({
    username: username.toLowerCase(),
    email,
    password,
  });
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) throw new ApiError(500, "error while registring the user");

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registration completed"));
});
export { registerUser };
