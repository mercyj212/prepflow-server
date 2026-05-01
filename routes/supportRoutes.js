import express from 'express';
import { sendSupportMessage } from '../controllers/supportController.js';
import { protect } from '../utils/authMiddleware.js';

const router = express.Router();

// Public contact route (can be used by guests too)
router.post('/contact', sendSupportMessage);

export default router;
