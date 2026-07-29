import express from "express";
import {
  getCourseNotes,
  createCourseNote,
  updateCourseNote,
  deleteCourseNote,
  askAITutor,
} from "../controllers/noteController.js";
import { protect, optionalProtect, admin } from "../utils/authMiddleware.js";

const router = express.Router();

router.route("/")
  .post(protect, admin, createCourseNote);

router.post("/tutor", askAITutor);

router.route("/:courseId")
  .get(optionalProtect, getCourseNotes);

router.route("/:id")
  .put(protect, admin, updateCourseNote)
  .delete(protect, admin, deleteCourseNote);

export default router;
