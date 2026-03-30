import express from "express";
import {
  createSubmission,
  getMySubmissions,
  getSubmissions,
} from "../controllers/submissionController.js";
import { protect, admin } from "../utils/authMiddleware.js";

const router = express.Router();

router.route("/").post(protect, createSubmission).get(protect, admin, getSubmissions);
router.route("/my-submissions").get(protect, getMySubmissions);

export default router;
