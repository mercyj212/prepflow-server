import express from "express";
import {
  getQuizzes,
  getQuizById,
  getStudyQuizById,
  getStudyQuizByIdPublic,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  addQuestion,
  generateQuestions,
  renameQuiz,
} from "../controllers/quizController.js";
import { protect, admin } from "../utils/authMiddleware.js";
import { upload } from "../config/cloudinary.js";

const router = express.Router();

router.route("/").get(getQuizzes).post(protect, admin, createQuiz);
router.route("/:id/study").get(protect, getStudyQuizById);
router.route("/:id/study/public").get(getStudyQuizByIdPublic);
router.route("/:id/questions").post(protect, admin, addQuestion);
router.route("/:id/batch-questions").post(protect, admin, addBatchQuestions);
router.route("/:id/generate").post(protect, admin, upload.array("files", 10), generateQuestions);
router
  .route("/:id")
  .get(protect, getQuizById)
  .put(protect, admin, updateQuiz)
  .delete(protect, admin, deleteQuiz);
router.route("/:id/rename").put(protect, admin, renameQuiz);

export default router;
