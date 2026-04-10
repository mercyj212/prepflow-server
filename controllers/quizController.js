import Quiz from "../models/Quiz.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// @desc    Get all quizzes
// @route   GET /api/quizzes
// @access  Public/Private based on requirements
export const getQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ isActive: true }).populate("course", "title");
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single quiz (Includes answers for feedback)
// @route   GET /api/quizzes/:id
// @access  Private
export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate("course", "title");

    if (quiz) {
      const quizObj = quiz.toObject();
      const randomQuestions = shuffleArray(quizObj.questions).slice(0, 60);

      quizObj.questions = randomQuestions.map(q => {
        return {
          ...q,
          options: shuffleArray(q.options).map(o => ({
            _id: o._id,
            text: o.text,
            isCorrect: Boolean(o.isCorrect)
          }))
        };
      });
      
      res.json(quizObj);
    } else {
      res.status(404).json({ message: "Quiz not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single quiz for study mode (includes answers)
// @route   GET /api/quizzes/:id/study
// @access  Private
export const getStudyQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate("course", "title");

    if (quiz) {
      res.json(quiz);
    } else {
      res.status(404).json({ message: "Quiz not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single quiz for public practice (includes answers)
// @route   GET /api/quizzes/:id/study/public
// @access  Public
export const getStudyQuizByIdPublic = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate("course", "title");

    if (quiz) {
      const quizObj = quiz.toObject();
      const randomQuestions = shuffleArray(quizObj.questions).slice(0, 60);
      
      quizObj.questions = randomQuestions.map(q => {
        return {
          ...q,
          options: shuffleArray(q.options)
        };
      });
      res.json(quizObj);
    } else {
      res.status(404).json({ message: "Quiz not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a quiz
// @route   POST /api/quizzes
// @access  Private/Admin
export const createQuiz = async (req, res) => {
  try {
    const quiz = new Quiz(req.body);
    const createdQuiz = await quiz.save();
    res.status(201).json(createdQuiz);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Add question to a quiz
// @route   POST /api/quizzes/:id/questions
// @access  Private/Admin
export const addQuestion = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (quiz) {
      const { text, options, explanation } = req.body;
      const question = { text, options, explanation };
      quiz.questions.push(question);
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
// @route   POST /api/quizzes/:id/batch-questions
// @access  Private/Admin
export const addBatchQuestions = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (quiz) {
      const { questions } = req.body;
      if (!Array.isArray(questions)) return res.status(400).json({ message: "Questions must be an array" });
      
      quiz.questions.push(...questions);
      const updatedQuiz = await quiz.save();
      res.status(201).json(updatedQuiz);
    } else {
      res.status(404).json({ message: "Quiz not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// @route   PUT /api/quizzes/:id
// @access  Private/Admin
export const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (quiz) {
      Object.assign(quiz, req.body);
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
// @route   PUT /api/quizzes/:id/rename
// @access  Private/Admin
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
// @route   DELETE /api/quizzes/:id
// @access  Private/Admin
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

// @desc    Generate questions using Gemini AI (supports Text, Image, PDF)
// @route   POST /api/quizzes/:id/generate
// @access  Private/Admin
export const generateQuestions = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    let { material, count } = req.body;
    count = parseInt(count) || 10;
    
    // If we have files, extract text or prepare multimodal content
    let finalPromptParts = [];
    let materialDescription = "";

    const uploadedFiles = req.files || [];
    for (const file of uploadedFiles) {
      const isPdf = file.mimetype === "application/pdf";
      const fileUrl = file.path; // Cloudinary URL

      if (isPdf) {
        // Option 1: Extract text from PDF using pdf-parse
        try {
          const response = await fetch(fileUrl);
          const buffer = await response.arrayBuffer();
          const data = await pdf(Buffer.from(buffer));
          materialDescription += `\n\n[FILE: ${file.originalname}]\n${data.text}`;
        } catch (pdfErr) {
          console.error("PDF Parse Error:", pdfErr);
          // Continue to next file instead of failing entire request
        }
      } else {
        // Option 2: Image - Send directly to Gemini as inline data
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
          console.error("Image                            Fetch Error:", imgErr);
        }
      }
    }

    // Combine with manual material text if provided
    if (material) {
      materialDescription = materialDescription ? `${materialDescription}\n\nAdditional text:\n${material}` : material;
    }

    if (!materialDescription && finalPromptParts.length === 0) {
      return res.status(400).json({ message: "Source material (text or file) is required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "Gemini API key is missing in server environment." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use gemini-2.5-flash as requested
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
              explanation: { type: "string" }
            },
            required: ["text", "options", "explanation"]
          }
        }
      }
    });

    const instructions = `You are an expert CBT curriculum designer. Generate exactly ${count} MCQs based on the source material. 
Focus on:
1. Analytical and scenario-based questions.
2. For calculation questions, use different numbers than the source text.
3. Distractors must be plausible.
4. Explanations must show the step-by-step reasoning or formula.`;

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

    // Shuffle options
    const shuffledQuestions = (questions || []).map(q => {
      if (q.options && q.options.length > 0) {
        for (let i = q.options.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [q.options[i], q.options[j]] = [q.options[j], q.options[i]];
        }
      }
      return q;
    });

    // Append to existing
    quiz.questions.push(...shuffledQuestions);
    const updatedQuiz = await quiz.save();

    res.status(201).json({ message: "Questions generated successfully", updatedQuiz });
  } catch (error) {
    console.error("Gemini Generation Error:", error.message);
    res.status(500).json({ message: "Failed to generate AI questions.", error: error.message });
  }
};
