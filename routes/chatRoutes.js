import express from 'express';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import CourseAccess from '../models/CourseAccess.js';
import { protect } from '../utils/authMiddleware.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();
const geminiApiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(geminiApiKey || 'MISSING_API_KEY');

// 🔄 GET /api/chat/conversations - Fetch sidebar chats
router.get('/conversations', protect, async (req, res) => {
  try {
    // 1. Global room has been disabled per user request.


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

    // 3. Course study rooms have been disabled per user request.

    // 4. Fetch all user's chats
    let conversationDocs = await Conversation.find({
      participants: req.user._id
    })
    .populate('participants', 'fullName email profilePicture')
    .populate('course', 'title')
    .populate('admin', 'fullName email')
    .sort({ updatedAt: -1 })
    .lean();

    // 👁️ CALCULATE UNREAD COUNTS: For each conversation, count messages where readBy doesn't include current user
    const conversations = await Promise.all(conversationDocs.map(async (convo) => {
      const unreadCount = await Message.countDocuments({
        conversationId: convo._id,
        readBy: { $ne: req.user._id }
      });
      return { ...convo, unreadCount };
    }));

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

    // 🛡️ PERMISSIONS 2.0: Allow if Global, AI, group member, or enrolled in course
    const isEnrolled = convo.course ? await CourseAccess.exists({ student: req.user._id, course: convo.course, isActive: true }) : false;
    const isMember = convo.participants.map(p => p.toString()).includes(req.user._id.toString());

    if (!convo.isGlobal && !isEnrolled && !isMember) {
      return res.status(403).json({ message: 'Access denied to this chat.' });
    }

    // 👁️ MARK AS READ: When a user fetches history, mark messages they haven't seen as read
    await Message.updateMany(
      { conversationId: convo._id, readBy: { $ne: req.user._id } },
      { $addToSet: { readBy: req.user._id } }
    );

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

    // 🛡️ PERMISSIONS 2.0: Allow posting if Global, group member, AI, or enrolled in course
    const isEnrolled = convo.course ? await CourseAccess.exists({ student: req.user._id, course: convo.course, isActive: true }) : false;
    const isMember = convo.participants.map(p => p.toString()).includes(req.user._id.toString());

    if (!convo.isGlobal && !isEnrolled && !isMember) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Save human message
    const userMessage = await Message.create({
      conversationId: convo._id,
      sender: req.user._id,
      isModel: false,
      text: text.trim(),
      readBy: [req.user._id]
    });

    const populatedUserMessage = await Message.findById(userMessage._id).populate('sender', 'fullName');

    // If it's the AI tutor, process AI reply
    if (convo.isAI) {
      if (!geminiApiKey) {
        throw new Error('GOOGLE_API_KEY or GEMINI_API_KEY is missing from environment variables');
      }

      try {
        // Fetch minimal messages for context to avoid token limits
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

        let aiResponseText = null;
        let lastGeminiError = null;

        // --- 🛡️ WATERFALL TIER 1: INTERNAL GEMINI ROTATION ---
        const geminiModels = ['gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'];
        
        for (const modelName of geminiModels) {
          try {
            const model = genAI.getGenerativeModel({ 
              model: modelName,
              systemInstruction: 'You are the PrepUp AI Tutor. Be concise and helpful.'
            });
            const chat = model.startChat({ history });
            const result = await chat.sendMessage(text.trim());
            aiResponseText = result.response.text();
            break; // Success! Exit the loop.
          } catch (geminiErr) {
            lastGeminiError = geminiErr;
            if (geminiErr.status === 429 || geminiErr.message?.includes('429')) {
               console.warn(`[GEMINI_RATE_LIMIT]: ${modelName} hit limit. Re-routing...`);
               continue; // Try the next Gemini model
            } else {
               break; // Not a rate limit (e.g., policy violation), break to external fallback immediately
            }
          }
        }

        // If a Gemini model succeeded, return it immediately
        if (aiResponseText) {
          const aiMessage = await Message.create({
            conversationId: convo._id,
            isModel: true,
            text: aiResponseText,
            readBy: [req.user._id]
          });
          return res.status(201).json({ userMessage: populatedUserMessage, aiMessage });
        }

        // If we reach here, ALL Gemini models failed or hit rate limits. Throw to Tier 2.
        throw lastGeminiError || new Error('All internal Gemini models failed');
      } catch (aiError) {
        console.warn('[GEMINI_TIER_FAILED]:', aiError.message);
        
        // --- 🛡️ WATERFALL TIER 2: EXTERNAL API FALLBACK LOGIC ---
        try {
          if (process.env.GROQ_API_KEY) {
            console.log('[FALLBACK]: Attempting Groq API...');
            const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: 'llama3-8b-8192',
                messages: [
                  { role: 'system', content: 'You are the PrepUp AI Tutor. Be concise and helpful.' },
                  ...history.map(m => ({
                    role: m.role === 'model' ? 'assistant' : 'user',
                    content: m.parts[0].text
                  })),
                  { role: 'user', content: text.trim() }
                ]
              })
            });

            if (!groqRes.ok) throw new Error(`Groq Error: ${groqRes.statusText}`);
            const data = await groqRes.json();
            
            const aiMessage = await Message.create({
              conversationId: convo._id,
              isModel: true,
              text: data.choices[0].message.content,
              readBy: [req.user._id]
            });
            return res.status(201).json({ userMessage: populatedUserMessage, aiMessage });
            
          } else if (process.env.OPENAI_API_KEY) {
            console.log('[FALLBACK]: Attempting native OpenAI API...');
            const oaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                  { role: 'system', content: 'You are the PrepUp AI Tutor. Be concise and helpful.' },
                  ...history.map(m => ({
                    role: m.role === 'model' ? 'assistant' : 'user',
                    content: m.parts[0].text
                  })),
                  { role: 'user', content: text.trim() }
                ]
              })
            });

            if (!oaiRes.ok) throw new Error(`OpenAI Error: ${oaiRes.statusText}`);
            const data = await oaiRes.json();
            
            const aiMessage = await Message.create({
              conversationId: convo._id,
              isModel: true,
              text: data.choices[0].message.content,
              readBy: [req.user._id]
            });
            return res.status(201).json({ userMessage: populatedUserMessage, aiMessage });
            
          } else if (process.env.OPENROUTER_API_KEY) {
            console.log('[FALLBACK]: Attempting OpenRouter API...');
            const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': process.env.FRONTEND_URL || 'https://prepup.app',
                'X-Title': 'PrepUp Tutor'
              },
              body: JSON.stringify({
                model: 'meta-llama/llama-3-8b-instruct:free',
                messages: [
                  { role: 'system', content: 'You are the PrepUp AI Tutor. Be concise and helpful.' },
                  ...history.map(m => ({
                    role: m.role === 'model' ? 'assistant' : 'user',
                    content: m.parts[0].text
                  })),
                  { role: 'user', content: text.trim() }
                ]
              })
            });

            if (!orRes.ok) throw new Error(`OpenRouter Error: ${orRes.statusText}`);
            const data = await orRes.json();
            
            const aiMessage = await Message.create({
              conversationId: convo._id,
              isModel: true,
              text: data.choices[0].message.content,
              readBy: [req.user._id]
            });
            return res.status(201).json({ userMessage: populatedUserMessage, aiMessage });
          }
        } catch (fallbackError) {
          console.error('[FALLBACK_FAILED]:', fallbackError.message);
        }
        
        // Handle Rate Limiting (429) if fallbacks failed or keys weren't set
        if (aiError.status === 429 || aiError.message?.includes('429')) {
          return res.status(429).json({
            message: 'PrepUp AI is currently busy. Add a free GROQ_API_KEY, OPENAI_API_KEY, or OPENROUTER_API_KEY to your .env to unlock unlimited fallback access.',
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

// ✏️ PUT /api/chat/message/:id - Edit a sent message
router.put('/message/:id', protect, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) return res.status(400).json({ message: 'Message text is required' });

    const message = await Message.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });

    // Verify sender
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'You can only edit your own messages' });
    }

    message.text = text.trim();
    message.isEdited = true;
    await message.save();

    const populatedMessage = await Message.findById(message._id).populate('sender', 'fullName email profilePicture');
    res.status(200).json(populatedMessage);
  } catch (error) {
    res.status(500).json({ message: 'Failed to edit message', error: error.message });
  }
});

// ── GROUP ROUTES ──────────────────────────────────────────────────────

// POST /api/chat/group/create
router.post('/group/create', protect, async (req, res) => {
  try {
    const { name, description, memberIds = [] } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Group name is required' });

    const uniqueMembers = [...new Set([req.user._id.toString(), ...memberIds])];

    const group = await Conversation.create({
      isGroup: true,
      name: name.trim(),
      description: description?.trim() || '',
      admin: req.user._id,
      participants: uniqueMembers
    });

    const populated = await Conversation.findById(group._id)
      .populate('participants', 'fullName email profilePicture')
      .populate('admin', 'fullName email');

    res.status(201).json(populated);
  } catch (error) {
    console.error('[GROUP_CREATE_FAIL]:', error);
    res.status(500).json({ message: 'Failed to create group', error: error.message });
  }
});

// POST /api/chat/group/:id/add-member  (admin only)
router.post('/group/:id/add-member', protect, async (req, res) => {
  try {
    const group = await Conversation.findOne({ _id: req.params.id, isGroup: true });
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.admin.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the group admin can add members' });

    const { memberId } = req.body;
    if (!memberId) return res.status(400).json({ message: 'memberId is required' });

    if (!group.participants.map(p => p.toString()).includes(memberId)) {
      group.participants.push(memberId);
      await group.save();
    }

    const populated = await Conversation.findById(group._id)
      .populate('participants', 'fullName email profilePicture')
      .populate('admin', 'fullName email');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to add member', error: error.message });
  }
});

// DELETE /api/chat/group/:id/remove-member  (admin only)
router.delete('/group/:id/remove-member', protect, async (req, res) => {
  try {
    const group = await Conversation.findOne({ _id: req.params.id, isGroup: true });
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.admin.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the group admin can remove members' });

    const { memberId } = req.body;
    if (!memberId) return res.status(400).json({ message: 'memberId is required' });
    if (memberId === req.user._id.toString())
      return res.status(400).json({ message: 'Admin cannot remove themselves' });

    group.participants = group.participants.filter(p => p.toString() !== memberId);
    await group.save();

    const populated = await Conversation.findById(group._id)
      .populate('participants', 'fullName email profilePicture')
      .populate('admin', 'fullName email');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to remove member', error: error.message });
  }
});

// DELETE /api/chat/group/:id  (admin deletes whole group)
router.delete('/group/:id', protect, async (req, res) => {
  try {
    const group = await Conversation.findOne({ _id: req.params.id, isGroup: true });
    if (!group) return res.status(404).json({ message: 'Group not found' });
    if (group.admin.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the group admin can delete this group' });
    await Message.deleteMany({ conversationId: group._id });
    await group.deleteOne();
    res.json({ message: 'Group deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete group', error: error.message });
  }
});

export default router;
