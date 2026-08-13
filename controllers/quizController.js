import Quiz from "../models/Quiz.js";
import Submission from "../models/Submission.js";
import Course from "../models/Course.js";
import CourseAccess from "../models/CourseAccess.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRequire } from 'module';
import {
  calculateQualityScore,
  shuffleOptionsWithTracking,
  balanceBatchPositions,
  sanitizeQuestionForStudent,
  validateStructure,
} from "../utils/mcqQualityPipeline.js";
import { MCQ_QUALITY_CONFIG } from "../config/mcqQualityConfig.js";

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const coursePopulate = {
  path: "course",
  select: "title level path department price",
  populate: {
    path: "department",
    select: "name faculty",
    populate: { path: "faculty", select: "name path" },
  },
};

// Helper to format/shuffle single question with answer tracking
const formatAndShuffleQuestion = (question) => {
  const qObj = typeof question.toObject === "function" ? question.toObject() : { ...question };
  const shuffled = shuffleOptionsWithTracking(qObj);
  const qScore = calculateQualityScore(shuffled);

  return {
    ...shuffled,
    difficulty: qObj.difficulty || "medium",
    qualityScore: qObj.qualityScore ?? qScore.score,
    validationStatus: qObj.validationStatus || (qScore.score >= MCQ_QUALITY_CONFIG.QUALITY_PASS_SCORE ? "passed" : "flagged_admin"),
    rejectionReasons: qObj.rejectionReasons || qScore.rejectionReasons,
    regenerationCount: qObj.regenerationCount || 0,
    needsAdminReview: qObj.needsAdminReview ?? (qScore.score < MCQ_QUALITY_CONFIG.QUALITY_PASS_SCORE),
    aiGenerated: qObj.aiGenerated ?? true
  };
};

// @desc    Get public platform stats (no auth required)
// @route   GET /api/quizzes/stats
// @access  Public
export const getPublicStats = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isActive: true }).select('questions');
    const totalQuizzes = quizzes.length;
    const totalQuestions = quizzes.reduce((acc, q) => acc + (q.questions?.length || 0), 0);

    const submissions = await Submission.find({}).select('score totalQuestions');
    let totalScorePercentage = 0;
    
    if (submissions.length > 0) {
      submissions.forEach(sub => {
        const percentage = (sub.score / Math.max(1, sub.totalQuestions)) * 100;
        totalScorePercentage += percentage;
      });
    }

    const averageScore = submissions.length >= 5 
      ? Math.round(totalScorePercentage / submissions.length) 
      : 74;

    res.json({ totalQuestions, totalQuizzes, averageScore });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all quizzes
export const getQuizzes = async (req, res) => {
  try {
    const filter = { isActive: true };

    if (req.query.course) {
      filter.course = req.query.course;
    } else if (req.query.courses) {
      const courseIds = req.query.courses.split(',').filter(Boolean);
      if (courseIds.length > 0) {
        filter.course = { $in: courseIds };
      }
    } else if (req.query.department || (req.query.level && req.query.level !== 'All')) {
      const courseFilter = {};
      
      if (req.query.department) {
        courseFilter.$or = [
          { department: req.query.department }, 
          { department: null }
        ];
      }
      
      if (req.query.level && req.query.level !== 'All') {
        courseFilter.level = req.query.level;
      }

      const matchingCourses = await Course.find(courseFilter).select('_id').lean();
      const courseIds = matchingCourses.map(c => c._id);
      filter.course = { $in: courseIds };
    }

    const quizzes = await Quiz.find(filter)
      .select('title description course isActive questions._id duration createdAt updatedAt')
      .populate('course', 'title level path department semester price')
      .lean();

    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single quiz (Standard Exam - 60 Random Questions with Position Balancing & Security Sanitization)
export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate(coursePopulate);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const courseId = quiz.course?._id || quiz.course;
    const coursePrice = quiz.course?.price ?? 1000;
    
    if (courseId && coursePrice > 0 && req.user?.role !== "admin") {
      const hasAccess = await CourseAccess.exists({
        student: req.user._id,
        course: courseId,
        isActive: true,
      });

      if (!hasAccess) {
        return res.status(403).json({
          message: "Course access locked. Payment required to attempt this quiz.",
          isLocked: true,
          courseId: courseId
        });
      }
    }

    const quizObj = quiz.toObject();
    // Balance answer positions across batch (25% A, 25% B, 25% C, 25% D)
    const balancedQuestions = balanceBatchPositions(quizObj.questions || []);
    
    // Shuffle and pick 60 questions
    const selectedQuestions = balancedQuestions
      .sort(() => 0.5 - Math.random())
      .slice(0, 60)
      .map(q => sanitizeQuestionForStudent(q));

    quizObj.questions = selectedQuestions;
    res.json(quizObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single quiz for study mode (includes answers)
export const getStudyQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate(coursePopulate);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const courseId = quiz.course?._id || quiz.course;
    const coursePrice = quiz.course?.price ?? 1000;
    
    if (courseId && coursePrice > 0 && req.user?.role !== "admin") {
      const hasAccess = await CourseAccess.exists({
        student: req.user._id,
        course: courseId,
        isActive: true,
      });

      if (!hasAccess) {
        return res.status(403).json({
          message: "Course access locked. Payment required to access study mode.",
          isLocked: true,
          courseId: courseId
        });
      }
    }

    const quizObj = quiz.toObject();
    if (req.user?.role !== "admin") {
      quizObj.questions = (quizObj.questions || []).map(q => sanitizeQuestionForStudent(q));
    }

    res.json(quizObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single quiz for public practice (includes answers)
export const getStudyQuizByIdPublic = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate(coursePopulate);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const courseId = quiz.course?._id || quiz.course;
    const coursePrice = quiz.course?.price ?? 1000;

    if (courseId && coursePrice > 0) {
      let isUnlocked = false;
      if (req.user) {
        isUnlocked = await CourseAccess.exists({
          student: req.user._id,
          course: courseId,
          isActive: true,
        });
      }
      if (!isUnlocked) {
        return res.status(403).json({
          message: "Course access locked. Payment required to access this quiz.",
          isLocked: true,
          courseId: courseId
        });
      }
    }

    const quizObj = quiz.toObject();
    if (req.user?.role !== "admin") {
      quizObj.questions = (quizObj.questions || []).map(q => sanitizeQuestionForStudent(q));
    }

    res.json(quizObj);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a quiz
export const createQuiz = async (req, res) => {
  try {
    const rawQs = req.body.questions || [];
    const processedQs = rawQs.map(q => formatAndShuffleQuestion(q));
    const balancedQs = balanceBatchPositions(processedQs);

    const payload = {
      ...req.body,
      questions: balancedQs
    };

    const quiz = new Quiz(payload);
    const createdQuiz = await quiz.save();
    res.status(201).json(createdQuiz);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add question to a quiz
export const addQuestion = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (quiz) {
      const { text, options, explanation, subject, difficulty } = req.body;
      const formattedQ = formatAndShuffleQuestion({ text, options, explanation, subject, difficulty });
      quiz.questions.push(formattedQ);
      const updatedQuiz = await quiz.save();
      res.status(201).json(updatedQuiz);
    } else {
      res.status(404).json({ message: "Quiz not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add multiple questions to a quiz
export const addBatchQuestions = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (quiz) {
      const { questions } = req.body;
      if (!Array.isArray(questions)) return res.status(400).json({ message: "Questions must be an array" });
      
      const formattedQs = questions.map(q => formatAndShuffleQuestion(q));
      const balancedQs = balanceBatchPositions(formattedQs);

      quiz.questions.push(...balancedQs);
      const updatedQuiz = await quiz.save();
      res.status(201).json(updatedQuiz);
    } else {
      res.status(404).json({ message: "Quiz not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a quiz
export const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (quiz) {
      const payload = {
        ...req.body,
        ...(Array.isArray(req.body.questions)
          ? { questions: balanceBatchPositions(req.body.questions.map(q => formatAndShuffleQuestion(q))) }
          : {})
      };
      Object.assign(quiz, payload);
      const updatedQuiz = await quiz.save();
      res.json(updatedQuiz);
    } else {
      res.status(404).json({ message: "Quiz not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Rename a quiz
export const renameQuiz = async (req, res) => {
  const { title } = req.body;
  if (!title || !title.trim()) {
    return res.status(400).json({ message: "Title is required" });
  }

  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    quiz.title = title.trim();
    const updated = await quiz.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a quiz
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (quiz) {
      await Quiz.deleteOne({ _id: quiz._id });
      res.json({ message: "Quiz removed" });
    } else {
      res.status(404).json({ message: "Quiz not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate questions using Gemini AI with Quality Control Pipeline & Auto-Regeneration
export const generateQuestions = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let { material, count } = req.body;
    count = parseInt(count) || 10;
    
    let finalPromptParts = [];
    let materialDescription = "";

    const uploadedFiles = req.files || [];
    for (const file of uploadedFiles) {
      const isPdf = file.mimetype === "application/pdf";
      const fileUrl = file.path; 

      if (isPdf) {
        try {
          const response = await fetch(fileUrl);
          const buffer = await response.arrayBuffer();
          const data = await pdf(Buffer.from(buffer));
          materialDescription += `\n\n[FILE: ${file.originalname}]\n${data.text}`;
        } catch (pdfErr) {
          console.error("PDF Parse Error:", pdfErr);
        }
      } else {
        try {
          const response = await fetch(fileUrl);
          const buffer = await response.arrayBuffer();
          const base64Data = Buffer.from(buffer).toString('base64');
          finalPromptParts.push({
            inlineData: {
              data: base64Data,
              mimeType: file.mimetype
            }
          });
        } catch (imgErr) {
          console.error("Image Fetch Error:", imgErr);
        }
      }
    }

    if (material) {
      materialDescription = materialDescription ? `${materialDescription}\n\nAdditional text:\n${material}` : material;
    }

    if (!materialDescription && finalPromptParts.length === 0) {
      return res.status(400).json({ message: "Source material (text or file) is required" });
    }

    const geminiApiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;

    if (!geminiApiKey) {
      return res.status(500).json({ message: "Gemini API key is missing in server environment." });
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              text: { type: "string" },
              options: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    text: { type: "string" },
                    isCorrect: { type: "boolean" }
                  },
                  required: ["text", "isCorrect"]
                }
              },
              explanation: { type: "string" },
              difficulty: { type: "string" },
              subject: { type: "string" }
            },
            required: ["text", "options", "explanation"]
          }
        }
      }
    });

    const instructions = `You are an expert CBT curriculum designer. Generate exactly ${count} high-quality MCQs based on the source material. 

CRITICAL MCQ QUALITY & OPTION BALANCE RULES:
1. Each question MUST contain EXACTLY 4 options. Exactly 1 option MUST have "isCorrect": true, and 3 MUST have "isCorrect": false.
2. STRICT OPTION LENGTH PARITY: All 4 options MUST be equal in word count, character length, detail, and grammatical structure.
3. DO NOT make the correct answer longer, more descriptive, or more technical than the distractors.
4. DO NOT include explanatory connector words like 'because', 'therefore', or 'meaning that' inside option text. Put explanations in the 'explanation' field ONLY.
5. Distractors MUST be realistic, sophisticated, and plausible domain concepts related to the topic. Avoid obvious nonsense or generic placeholders.
6. Avoid 'all of the above' or 'none of the above'.
7. Include 'difficulty' ("easy", "medium", or "hard") and 'subject' fields.`;

    const promptText = materialDescription ? `${instructions}\n\nSource Material:\n${materialDescription}` : instructions;
    finalPromptParts.unshift(promptText);

    const result = await model.generateContent(finalPromptParts);
    const apiResponse = await result.response;
    let questions;
    
    try {
      questions = JSON.parse(apiResponse.text().trim());
    } catch (parseErr) {
      console.error("Strict JSON parse failed:", parseErr, "Raw text:", apiResponse.text());
      throw new Error("The AI provided an incompatible data format. Please refine the source material.");
    }

    // Process questions through Quality Control Pipeline & Auto-Regeneration
    const validatedQuestions = [];
    const existingBank = quiz.questions || [];

    for (let rawQ of (questions || [])) {
      let currentQ = { ...rawQ };
      let regenAttempts = 0;
      let qScore = calculateQualityScore(currentQ, [...existingBank, ...validatedQuestions]);

      while (qScore.score < MCQ_QUALITY_CONFIG.QUALITY_PASS_SCORE && regenAttempts < MCQ_QUALITY_CONFIG.MAX_REGEN_ATTEMPTS) {
        regenAttempts++;
        console.log(`  ⚠️ Question failed QC (Score: ${qScore.score}). Attempting AI regeneration ${regenAttempts}/${MCQ_QUALITY_CONFIG.MAX_REGEN_ATTEMPTS}...`);
        
        try {
          const feedbackPrompt = `Re-generate the following MCQ so it passes quality validation.
Issues with previous version: ${qScore.rejectionReasons.join("; ")}

Previous Question: ${JSON.stringify(currentQ)}

Ensure all 4 options match in word count and grammar. Make distractors equally detailed. Return a single JSON object.`;

          const regenResult = await model.generateContent([{ text: feedbackPrompt }]);
          const regenText = (await regenResult.response).text().trim();
          const regeneratedData = JSON.parse(regenText);
          const candidateQ = Array.isArray(regeneratedData) ? regeneratedData[0] : regeneratedData;
          if (candidateQ && candidateQ.text && Array.isArray(candidateQ.options)) {
            currentQ = candidateQ;
            qScore = calculateQualityScore(currentQ, [...existingBank, ...validatedQuestions]);
          }
        } catch (rErr) {
          console.error("Regeneration attempt failed:", rErr.message);
          break;
        }
      }

      const isPass = qScore.score >= MCQ_QUALITY_CONFIG.QUALITY_PASS_SCORE;
      const finalQ = {
        ...currentQ,
        qualityScore: qScore.score,
        validationStatus: isPass ? "passed" : "flagged_admin",
        rejectionReasons: qScore.rejectionReasons,
        regenerationCount: regenAttempts,
        needsAdminReview: !isPass,
        aiGenerated: true,
        difficulty: currentQ.difficulty || "medium",
        subject: currentQ.subject || quiz.title || "General"
      };

      validatedQuestions.push(formatAndShuffleQuestion(finalQ));
    }

    // Balance correct answer positions across batch (25% A, 25% B, 25% C, 25% D)
    const finalBalancedBatch = balanceBatchPositions(validatedQuestions);

    quiz.questions.push(...finalBalancedBatch);
    const updatedQuiz = await quiz.save();

    res.status(201).json({ message: "Questions generated successfully", updatedQuiz });
  } catch (error) {
    console.error("Gemini Generation Error:", error.message);
    res.status(500).json({ message: "Failed to generate AI questions.", error: error.message });
  }
};

// @desc    Get quality control report for a quiz (Admin only)
// @route   GET /api/quizzes/:id/admin-qc-report
export const getAdminQualityReport = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate(coursePopulate);
    if (!quiz) return res.status(404).json({ message: "Quiz not found" });

    const questions = quiz.questions || [];
    const totalQuestions = questions.length;
    const flaggedQuestions = questions.filter(q => q.needsAdminReview || q.validationStatus === "flagged_admin");
    const avgQualityScore = totalQuestions > 0
      ? Math.round(questions.reduce((acc, q) => acc + (q.qualityScore ?? 100), 0) / totalQuestions)
      : 100;

    res.json({
      quizId: quiz._id,
      title: quiz.title,
      totalQuestions,
      avgQualityScore,
      flaggedCount: flaggedQuestions.length,
      passedCount: totalQuestions - flaggedQuestions.length,
      flaggedQuestions: flaggedQuestions.map(q => ({
        _id: q._id,
        text: q.text,
        qualityScore: q.qualityScore,
        validationStatus: q.validationStatus,
        rejectionReasons: q.rejectionReasons,
        regenerationCount: q.regenerationCount,
        needsAdminReview: q.needsAdminReview,
        options: q.options
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
