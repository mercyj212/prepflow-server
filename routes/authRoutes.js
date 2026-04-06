import express from "express";
import { 
  registerStudent, 
  loginStudent, 
  verifyOTP,
  resendOTP,
  verifyEmail, 
  forgotPassword, 
  resetPassword,
  googleLogin
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/google", googleLogin);

// 🛡️ SECURITY & IDENTITY ROUTES
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

export default router;
