import express from "express";
import {
  createSubmission,
  getMySubmissions,
  getSubmissions,
  getProgressMetrics,
} from "../controllers/submissionController.js";
import { protect, admin } from "../utils/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createSubmission).get(protect, admin, getSubmissions);
router.route("/progress").get(protect, getProgressMetrics);
router.route("/my-submissions").get(protect, getMySubmissions);

export default router;
