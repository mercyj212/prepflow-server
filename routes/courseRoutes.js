import express from "express";
import {
  getCourses,
  createCourse,
  updateCourse,
  renameCourse,
  uploadMaterial,
  deleteMaterial,
  deleteCourse,
} from "../controllers/courseController.js";
import { protect, optionalProtect, admin } from "../utils/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

router.route("/").get(optionalProtect, getCourses).post(protect, admin, createCourse);
router.route("/:id").delete(protect, admin, deleteCourse).put(protect, admin, updateCourse);
router.route("/:id/rename").put(protect, admin, renameCourse);
router.route("/:id/materials").post(protect, admin, upload.single("file"), uploadMaterial);
router.route("/:id/materials/:materialId").delete(protect, admin, deleteMaterial);

export default router;
