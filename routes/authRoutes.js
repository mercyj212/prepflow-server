import express from "express";
import { 
  registerStudent, 
  loginStudent, 
  verifyOTP,
  resendOTP,
  verifyEmail, 
  forgotPassword, 
  resetPassword,
  googleLogin,
  updateProfilePicture,
  refreshSession,
  logoutUser,
  getAuthStatus
} from "../controllers/authController.js";
import { protect } from "../utils/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

router.post("/register", registerStudent);
router.post("/login", loginStudent);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/google", googleLogin);
router.get("/refresh", refreshSession);
router.post("/logout", logoutUser);
router.get("/health", getAuthStatus);

// 🛡️ SECURITY & IDENTITY ROUTES
router.get("/verify-email/:token", verifyEmail);
router.post("/forgot-password", forgotPassword);
router.put("/reset-password/:token", resetPassword);

// 🛡️ PROFILE MANAGEMENT
router.put("/profile/avatar", protect, upload.single("avatar"), updateProfilePicture);

export default router;
