import express from "express";
import { createStudentAccess, getAllStudentsCount } from "../controllers/studentController.js";
import { protect, admin } from "../middleware/authMiddleware.js"; // Standard protect/admin check

const router = express.Router();

router.post("/create-access", createStudentAccess);
router.get("/count", protect, admin, getAllStudentsCount);

export default router;