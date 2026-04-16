import express from 'express';
import { createStudentAccess, getAllStudentsCount, getAllStudents, deleteStudent, sendScholarEmail, sendScholarBlast, searchStudents } from "../controllers/studentController.js";
import { protect, admin } from "../utils/authMiddleware.js"; // Fixed path

const router = express.Router();

router.get("/search", protect, searchStudents);
router.post("/create-access", protect, admin, createStudentAccess);
router.get("/count", protect, admin, getAllStudentsCount);
router.get("/", protect, admin, getAllStudents);
router.delete("/:id", protect, admin, deleteStudent);
router.post("/email", protect, admin, sendScholarEmail);
router.post("/email-blast", protect, admin, sendScholarBlast);

export default router;
