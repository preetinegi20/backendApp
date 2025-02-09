import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/users.js";
import { ApiResponse } from "../utils/ApiRes.js";
const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true } //it will now give the new updated one where rt is undefined
  );
  const options = {
    httpOnly: true,
    security: true,
    sameSite: "Strict",
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged OUT"));
});
export { logout };
