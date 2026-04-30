import express from "express";
import { getQuestions, saveScore, getLeaderboard, getCoursesWithQuestions } from "../controllers/gameController.js";
import { protect } from "../utils/authMiddleware.js";

const router = express.Router();

router.get("/questions", protect, getQuestions);
router.get("/courses", protect, getCoursesWithQuestions);
router.get("/leaderboard", getLeaderboard);
router.post("/score", protect, saveScore);

export default router;
