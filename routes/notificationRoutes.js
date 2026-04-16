import express from 'express';
import { protect } from '../utils/authMiddleware.js';
import Submission from '../models/Submission.js';
import Quiz from '../models/Quiz.js';
import CourseAccess from '../models/CourseAccess.js';

const router = express.Router();

// GET /api/notifications - Generate smart notifications from real student data
router.get('/', protect, async (req, res) => {
  try {
    const studentId = req.user._id;
    const notifications = [];

    // 1. Welcome notification (always)
    notifications.push({
      id: 'welcome',
      type: 'info',
      title: 'Welcome to PrepUp!',
      message: `Hi ${req.user.fullName?.split(' ')[0] || 'there'}! Start practising to boost your exam score.`,
      time: new Date(),
      read: true,
      link: '/dashboard',
    });

    // 2. Recent quiz submissions
    const submissions = await Submission.find({ student: studentId })
      .populate('quiz', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    for (const sub of submissions) {
      const pct = sub.totalQuestions > 0 ? Math.round((sub.score / sub.totalQuestions) * 100) : 0;
      const quizName = sub.quiz?.title || 'a quiz';

      if (pct >= 70) {
        notifications.push({
          id: `sub-pass-${sub._id}`,
          type: 'success',
          title: 'Great result!',
          message: `You scored ${pct}% on "${quizName}". Keep it up!`,
          time: sub.createdAt,
          read: false,
          link: `/result?quizId=${sub.quiz?._id}`,
        });
      } else if (pct < 50) {
        notifications.push({
          id: `sub-fail-${sub._id}`,
          type: 'warning',
          title: 'Room to improve',
          message: `You got ${pct}% on "${quizName}". Review the questions you missed and try again.`,
          time: sub.createdAt,
          read: false,
          link: `/result?quizId=${sub.quiz?._id}`,
        });
      }
    }

    // 3. Streak calculation
    const allDays = [...new Set(
      submissions.map(s => s.createdAt.toISOString().split('T')[0])
    )].sort((a, b) => b.localeCompare(a));

    let streak = 0;
    if (allDays.length > 0) {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (allDays[0] === today || allDays[0] === yesterday) {
        streak = 1;
        let prev = new Date(allDays[0]);
        for (let i = 1; i < allDays.length; i++) {
          const curr = new Date(allDays[i]);
          if ((prev - curr) / 86400000 <= 1) { streak++; prev = curr; } else break;
        }
      }
    }

    if (streak >= 3) {
      notifications.push({
        id: 'streak',
        type: 'success',
        title: `${streak}-day streak!`,
        message: `You have studied ${streak} days in a row. Excellent consistency!`,
        time: new Date(),
        read: false,
        link: '/dashboard',
      });
    }

    // 4. Check for unattempted quizzes based on enrolled courses
    const enrolledAccess = await CourseAccess.find({ student: studentId, isActive: true });
    if (enrolledAccess.length > 0) {
      const courseIds = enrolledAccess.map(a => a.course);
      const availableQuizzes = await Quiz.find({ course: { $in: courseIds } }).select('_id title').limit(20);
      const attemptedQuizIds = new Set(submissions.map(s => s.quiz?._id?.toString()));
      const unattempted = availableQuizzes.filter(q => !attemptedQuizIds.has(q._id.toString()));

      if (unattempted.length > 0) {
        notifications.push({
          id: 'new-quiz',
          type: 'info',
          title: `${unattempted.length} quiz${unattempted.length > 1 ? 'zes' : ''} waiting`,
          message: `You haven't tried "${unattempted[0].title}" yet.${unattempted.length > 1 ? ` Plus ${unattempted.length - 1} other${unattempted.length - 1 > 1 ? 's' : ''}.` : ''} Give it a go!`,
          time: new Date(),
          read: false,
          link: `/quiz/${unattempted[0]._id}`,
        });
      }
    }

    // Sort: unread first, then by time
    notifications.sort((a, b) => {
      if (a.read !== b.read) return a.read ? 1 : -1;
      return new Date(b.time) - new Date(a.time);
    });

    res.json({ notifications, unreadCount: notifications.filter(n => !n.read).length });
  } catch (error) {
    console.error('[NOTIFICATIONS_ERROR]:', error);
    res.status(500).json({ message: 'Failed to load notifications', error: error.message });
  }
});

export default router;
