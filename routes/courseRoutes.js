import express from "express";
import { getCourses, createCourse } from "../controllers/courseController.js";
import { protect, admin } from "../utils/authMiddleware.js";

const router = express.Router();

router.route("/").get(getCourses).post(protect, admin, createCourse);

export default router;
