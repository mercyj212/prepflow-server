import express from 'express';
import Message from '../models/Message.js';
import { protect } from '../utils/authMiddleware.js';

const router = express.Router();

// 📩 GET /api/chat - Fetch recent messages
router.get('/', protect, async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('sender', 'name') // We only need student's name
      .sort({ createdAt: -1 })
      .limit(50);
    
    // Return in chronological order for UI
    res.json(messages.reverse());
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat messages', error: error.message });
  }
});

// 📮 POST /api/chat - Send a message
router.post('/', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ message: 'Message text is required' });
    }

    const newMessage = await Message.create({
      sender: req.user._id,
      text: text.trim()
    });

    const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'name');
    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

export default router;
