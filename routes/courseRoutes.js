import express from "express";
import {
  getCourses,
  createCourse,
  renameCourse,
  uploadMaterial,
  deleteMaterial,
  deleteCourse,
} from "../controllers/courseController.js";
import { protect, admin } from "../utils/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

router.route("/").get(getCourses).post(protect, admin, createCourse);
router.route("/:id").delete(protect, admin, deleteCourse);
router.route("/:id/rename").put(protect, admin, renameCourse);
router.route("/:id/materials").post(protect, admin, upload.single("file"), uploadMaterial);
router.route("/:id/materials/:materialId").delete(protect, admin, deleteMaterial);

export default router;
