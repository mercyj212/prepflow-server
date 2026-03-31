import express from "express";
import { getCourses, createCourse, deleteCourse } from "../controllers/courseController.js";
import { protect, admin } from "../utils/authMiddleware.js";

const router = express.Router();

router.route("/").get(getCourses).post(protect, admin, createCourse);
router.route("/:id").delete(protect, admin, deleteCourse);

export default router;
