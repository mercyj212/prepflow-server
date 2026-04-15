import express from "express";
import {
  getFaculties,
  createFaculty,
  updateFaculty,
  deleteFaculty,
} from "../controllers/facultyController.js";
import { protect, admin } from "../utils/authMiddleware.js";

const router = express.Router();

router.route("/").get(getFaculties).post(protect, admin, createFaculty);
router.route("/:id").put(protect, admin, updateFaculty).delete(protect, admin, deleteFaculty);

export default router;
