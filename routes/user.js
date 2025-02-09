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
export default router;
