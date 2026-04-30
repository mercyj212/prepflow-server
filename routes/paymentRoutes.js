import express from "express";
import { 
    initializeTransaction, 
    verifyTransaction, 
    handleWebhook 
} from "../controllers/paymentController.js";
import { protect } from "../utils/authMiddleware.js";

const router = express.Router();

router.post("/initialize", protect, initializeTransaction);
router.get("/verify/:reference", protect, verifyTransaction);
router.post("/webhook", handleWebhook); // Webhook is called by Paystack, no protect middleware here

export default router;
