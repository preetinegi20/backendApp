import { mongoose, Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
const userSchema = new Schema(
  {
    username: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); //if pass is not modified skip further process
  this.password = await bcrypt.hash(this.password, 10);
});
userSchema.methods.isPassCorrect = async function (password) {
  console.log(await bcrypt.compare(password, this.password));
  return await bcrypt.compare(password, this.password); //compare first decrypt the existing pass ans then compare between the entered pass and exissting password
};
userSchema.methods.generateAccessToken = async function () {
  return jwt.sign(
    {
      _id: this._id,
      username: this.username,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_SECRET_EXPIRY }
  );
};
userSchema.methods.generateRefreshToken = async function () {
  return jwt.sign({ _id: this.id }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
  });
};
const User = mongoose.model("User", userSchema);
export { User };
