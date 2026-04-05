import express from "express";
import { 
  registerStudent, 
  loginStudent, 
  verifyOTP,
  verifyEmail, 
  forgotPassword, 
  resetPassword 
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.post("/verify-otp", verifyOTP);

// 🛡️ SECURITY & IDENTITY ROUTES
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

export default router;
