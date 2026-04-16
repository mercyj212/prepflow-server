import express from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import CourseAccess from '../models/CourseAccess.js';
import { protect } from '../utils/authMiddleware.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_API_KEY');

// 🔄 GET /api/chat/conversations - Fetch sidebar chats
router.get('/conversations', protect, async (req, res) => {
  try {
    // 1. Ensure Global room exists
    let globalChat = await Conversation.findOne({ isGlobal: true });
    if (!globalChat) {
      globalChat = await Conversation.create({ isGlobal: true });
    }

    // 2. Ensure Personal AI room exists
    let aiChat = await Conversation.findOne({ isAI: true, participants: req.user._id });
    if (!aiChat) {
      aiChat = await Conversation.create({ isAI: true, participants: [req.user._id] });
    }

    // 3. Ensure Course Study Rooms exist for user's enrolled courses
    let studentAccess = await CourseAccess.find({ student: req.user._id, isActive: true }).populate('course');

    // 🛡️ AUTO-ENROLL PATTERN: If 0 courses found, enroll in available public courses for demo
    if (studentAccess.length === 0) {
      console.log(`[AUTO-ENROLL]: Student ${req.user.email} has 0 courses. Providing demo set.`);
      const Course = (await import('../models/Course.js')).default;
      const allCourses = await Course.find({}).limit(5);
      
      for (const course of allCourses) {
        try {
          await CourseAccess.create({
            student: req.user._id,
            course: course._id,
            isActive: true,
            accessToken: `DEMO-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
          });
        } catch (enrollErr) {
          // Likely already exists or unique constraint check
        }
      }
      // Re-fetch now that they are enrolled
      studentAccess = await CourseAccess.find({ student: req.user._id, isActive: true }).populate('course');
    }

    for (const access of studentAccess) {
      if (access.course) {
        // Find existing course group room
        let courseChat = await Conversation.findOne({ isGlobal: false, course: access.course._id });
        if (!courseChat) {
          courseChat = await Conversation.create({ 
            isGlobal: false, 
            isAI: false,
            course: access.course._id,
            participants: [] // Global for everyone in course
          });
        }
      }
    }

    // 4. Fetch all user's chats
    const conversations = await Conversation.find({
      $or: [
        { isGlobal: true }, 
        { course: { $exists: true } }, // 🛡️ Ensure Course Study Groups are included
        { participants: req.user._id }
      ]
    })
    .populate('participants', 'fullName email profilePicture')
    .populate('course', 'title')
    .sort({ updatedAt: -1 })
    .lean();

    res.json(conversations);
  } catch (error) {
    console.error('[CONVO_FETCH_FAIL]:', error);
    res.status(500).json({ message: 'Failed to fetch conversations', error: error.message });
  }
});

// 📩 GET /api/chat/:conversationId - Fetch History
router.get('/:conversationId', protect, async (req, res) => {
  try {
    const convo = await Conversation.findById(req.params.conversationId);
    if (!convo) return res.status(404).json({ message: 'Conversation not found' });

    // 🛡️ PERMISSIONS 2.0: Allow access if Global, AI, or Enrolled in the course
    const isEnrolled = convo.course ? await CourseAccess.exists({ student: req.user._id, course: convo.course, isActive: true }) : false;
    
    if (!convo.isGlobal && !isEnrolled && !convo.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied to this chat.' });
    }

    const messages = await Message.find({ conversationId: convo._id })
      .populate('sender', 'fullName')
      .sort({ createdAt: 1 })
      .limit(100);

    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
});

// 📮 POST /api/chat/:conversationId - Send Message
router.post('/:conversationId', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'Text required' });

    const convo = await Conversation.findById(req.params.conversationId);
    if (!convo) return res.status(404).json({ message: 'Conversation not found' });

    // 🛡️ PERMISSIONS 2.0: Allow posting if Global, AI, or Enrolled in the course
    const isEnrolled = convo.course ? await CourseAccess.exists({ student: req.user._id, course: convo.course, isActive: true }) : false;

    if (!convo.isGlobal && !isEnrolled && !convo.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Save human message
    const userMessage = await Message.create({
      conversationId: convo._id,
      sender: req.user._id,
      isModel: false,
      text: text.trim()
    });

    const populatedUserMessage = await Message.findById(userMessage._id).populate('sender', 'fullName');

    // If it's the AI tutor, process AI reply
    if (convo.isAI) {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY is missing from environment variables');
      }

      try {
        // Fetch minimal messages for context to avoid 429 token limits
        const model = genAI.getGenerativeModel({ 
          model: 'gemini-2.0-flash',
          systemInstruction: 'You are the PrepUp AI Tutor. Be concise and helpful.'
        });

        const recentMessages = await Message.find({ conversationId: convo._id })
          .sort({ createdAt: -1 })
          .limit(3) // 🛡️ Reduced from 10 to 3 to stay within free tier limits
          .lean();
        
        const history = recentMessages
          .reverse()
          .filter(m => m._id.toString() !== userMessage._id.toString())
          .map(m => ({
            role: m.isModel ? 'model' : 'user',
            parts: [{ text: m.text }]
          }));

        const chat = model.startChat({ history });
        const result = await chat.sendMessage(text.trim());
        const aiResponseText = result.response.text();

        const aiMessage = await Message.create({
          conversationId: convo._id,
          isModel: true,
          text: aiResponseText
        });

        return res.status(201).json({ userMessage: populatedUserMessage, aiMessage });
      } catch (aiError) {
        console.error('[AI_REPLY_FAILED]:', aiError);
        
        // Handle Rate Limiting (429) specifically
        if (aiError.status === 429) {
          return res.status(429).json({
            message: 'PrepUp AI is currently busy (Rate Limit reached). Please try again in 30 seconds.',
            error: 'Quota exceeded',
            userMessage: populatedUserMessage
          });
        }

        return res.status(500).json({ 
          message: 'AI processing failed', 
          error: aiError.message,
          userMessage: populatedUserMessage 
        });
      }
    } else {
      // Standard message delivery (DMs, Global)
      return res.status(201).json({ userMessage: populatedUserMessage });
    }
  } catch (error) {
    console.error('[CHAT_ROUTE_CRASH]:', error);
    res.status(500).json({ message: 'Internal server error in chat route', error: error.message });
  }
});

// 🤝 POST /api/chat/direct - Start a DM with someone
router.post('/direct/new', protect, async (req, res) => {
  try {
    const { targetUserId } = req.body;
    if (!targetUserId || targetUserId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Invalid target user' });
    }

    // Check if DM already exists
    let convo = await Conversation.findOne({
      isGlobal: false,
      isAI: false,
      participants: { $all: [req.user._id, targetUserId], $size: 2 }
    });

    if (!convo) {
      convo = await Conversation.create({
        participants: [req.user._id, targetUserId]
      });
    }

    const populatedConvo = await Conversation.findById(convo._id).populate('participants', 'fullName email profilePicture');
    res.status(200).json(populatedConvo);
  } catch (error) {
    res.status(500).json({ message: 'Failed to start DM', error: error.message });
  }
});

export default router;
