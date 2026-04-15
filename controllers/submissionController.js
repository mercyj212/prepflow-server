import Submission from "../models/Submission.js";
import Quiz from "../models/Quiz.js";

// @desc    Get progress metrics for current student
// @route   GET /api/submissions/progress
// @access  Private
export const getProgressMetrics = async (req, res) => {
  try {
    const studentId = req.user._id;

    const submissions = await Submission.find({ student: studentId })
      .populate("quiz", "title course")
      .sort({ createdAt: 1 });

    if (!submissions || submissions.length === 0) {
      return res.json({
        totalQuestionsDone: 0,
        averageScore: 0,
        streakDays: 0,
        subjectMastery: [],
        performanceOverTime: [],
      });
    }

    // 1. Total Questions and Average Score
    let totalQuestionsDone = 0;
    let totalScorePercentage = 0;

    submissions.forEach(sub => {
      totalQuestionsDone += (sub.totalQuestions || 0);
      const percentage = (sub.score / Math.max(1, sub.totalQuestions)) * 100;
      totalScorePercentage += percentage;
    });

    const averageScore = Math.round(totalScorePercentage / submissions.length);

    // 2. Streak Days Calculation
    const uniqueDays = [...new Set(
      submissions.map(sub => sub.createdAt.toISOString().split('T')[0])
    )].sort((a, b) => b.localeCompare(a)); // Sort descending

    let streakDays = 0;
    if (uniqueDays.length > 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

      if (uniqueDays[0] === todayStr || uniqueDays[0] === yesterdayStr) {
        streakDays = 1;
        let currentCheck = new Date(uniqueDays[0]);
        for (let i = 1; i < uniqueDays.length; i++) {
          const prevDay = new Date(uniqueDays[i]);
          const diff = Math.floor((currentCheck - prevDay) / (1000 * 60 * 60 * 24));
          if (diff <= 1) {
            streakDays++;
            currentCheck = prevDay;
          } else {
            break;
          }
        }
      }
    }

    // 3. Subject Mastery
    const subjectStats = {};
    submissions.forEach(sub => {
      const subjectName = sub.quiz?.title || "Practice";
      if (!subjectStats[subjectName]) {
        subjectStats[subjectName] = { totalPercentage: 0, count: 0 };
      }
      subjectStats[subjectName].totalPercentage += (sub.score / Math.max(1, sub.totalQuestions)) * 100;
      subjectStats[subjectName].count++;
    });

    const subjectMastery = Object.keys(subjectStats).map(subject => ({
      subject,
      mastery: Math.round(subjectStats[subject].totalPercentage / subjectStats[subject].count)
    }));

    // 4. Performance Over Time (aggregate by day)
    const dailyStats = {};
    submissions.forEach(sub => {
      const day = sub.createdAt.toISOString().split('T')[0];
      if (!dailyStats[day]) {
        dailyStats[day] = { totalPercentage: 0, count: 0 };
      }
      dailyStats[day].totalPercentage += (sub.score / Math.max(1, sub.totalQuestions)) * 100;
      dailyStats[day].count++;
    });

    const performanceOverTime = Object.keys(dailyStats).sort().map(day => ({
      date: day,
      score: Math.round(dailyStats[day].totalPercentage / dailyStats[day].count)
    }));

    res.json({
      totalQuestionsDone,
      averageScore,
      streakDays,
      subjectMastery,
      performanceOverTime
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new submission
// @route   POST /api/submissions
// @access  Private
export const createSubmission = async (req, res) => {
  const { quizId, answers, timeTaken } = req.body;

  try {
    const quiz = await Quiz.findById(quizId);
    
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let score = 0;
    const processedAnswers = answers.map((answer) => {
      const question = quiz.questions.id(answer.questionId);
      
      let isCorrect = false;
      if (question) {
        const selectedOption = question.options.id(answer.selectedOptionId);
        if (selectedOption && selectedOption.isCorrect) {
          isCorrect = true;
          score++;
        }
      }

      return {
        questionId: answer.questionId,
        selectedOptionId: answer.selectedOptionId,
        isCorrect,
      };
    });

    const submission = new Submission({
      student: req.user._id,
      quiz: quizId,
      score,
      totalQuestions: answers.length || quiz.questions.length,
      timeTaken,
      answers: processedAnswers,
    });

    const createdSubmission = await submission.save();
    res.status(201).json(createdSubmission);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get logged in student submissions
// @route   GET /api/submissions/my-submissions
// @access  Private
export const getMySubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find({ student: req.user._id }).populate("quiz", "title course");
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all submissions
// @route   GET /api/submissions
// @access  Private/Admin
export const getSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find().populate("student", "fullName email").populate("quiz", "title course");
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
