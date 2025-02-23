import { Router } from "express";
import { registerUser } from "../controllers/user.register.js";
import { loginUser } from "../controllers/user.login.js";
import { jwtAuth } from "../middleware/jwtAuth.js";
import { logout } from "../controllers/user.logout.js";
import { refreshAccess } from "../controllers/newAccessToken.js";
// import handleUserSignUp from '../controllers/user'
const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(jwtAuth, logout);
router.route("/refresh-access").post(refreshAccess);
router.get("/check-auth", (req, res) => {
  const token = req.cookies.authToken; // Get token from HTTP-only cookie

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    res.status(200).json({ message: "Authenticated", user: decoded });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});
export default router;
