import express from 'express';
import Message from '../models/Message.js';
import TypingStatus from '../models/TypingStatus.js';
import { protect } from '../utils/authMiddleware.js';

const router = express.Router();

// 📩 GET /api/chat - Fetch recent messages & typing users
router.get('/', protect, async (req, res) => {
  try {
    const messages = await Message.find()
      .populate('sender', 'fullName')
      .sort({ createdAt: -1 })
      .limit(50);
    
    // Fetch currently typing users (excluding self)
    const typingUsers = await TypingStatus.find({
      studentId: { $ne: req.user._id }
    }).select('fullName');

    res.json({
      messages: messages.reverse(),
      typingUsers: typingUsers.map(u => u.fullName)
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat', error: error.message });
  }
});

// ⚡️ POST /api/chat/typing - Signal that user is typing
router.post('/typing', protect, async (req, res) => {
  try {
    await TypingStatus.findOneAndUpdate(
      { studentId: req.user._id },
      { 
        fullName: req.user.fullName,
        lastTyped: new Date() 
      },
      { upsert: true, new: true }
    );
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ message: 'Error updating typing status', error: error.message });
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

    const populatedMessage = await Message.findById(newMessage._id).populate('sender', 'fullName');
    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Error sending message', error: error.message });
  }
});

export default router;
