import express from "express";
import { createStudentAccess } from "../controllers/studentController.js";

const router = express.Router();

router.post("/create-access", createStudentAccess);

export default router;