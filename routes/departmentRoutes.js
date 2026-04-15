import express from "express";
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../controllers/departmentController.js";
import { protect, admin } from "../utils/authMiddleware.js";

const router = express.Router();

router.route("/").get(getDepartments).post(protect, admin, createDepartment);
router.route("/:id").put(protect, admin, updateDepartment).delete(protect, admin, deleteDepartment);

export default router;
