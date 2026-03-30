import express from "express";
import { verifyAccessLink } from "../controllers/accessController.js";

const router = express.Router();

router.get("/verify/:token", verifyAccessLink);

export default router;