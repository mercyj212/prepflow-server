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
    const quizzes = await Quiz.find({ isActive: true });
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
    // Force inclusion of isCorrect field in query
    const quiz = await Quiz.findById(req.params.id);

    if (quiz) {
      // Use the raw MongoDB data to ensure we don't lose fields during toObject() default transforms
      const quizObj = quiz.toObject();
      
      // Reshuffle and slice, but manually verify isCorrect is present
      const randomQuestions = shuffleArray(quizObj.questions).slice(0, 60);

      quizObj.questions = randomQuestions.map(q => {
        return {
          ...q,
          options: shuffleArray(q.options).map(o => {
            return {
              text: o.text,
              _id: o._id,
              isCorrect: !!o.isCorrect // Explicitly cast and include
            };
          })
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
    const quiz = await Quiz.findById(req.params.id);

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
    const quiz = await Quiz.findById(req.params.id);

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
          console.error("Image Fetch Error:", imgErr);
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
    // Use gemini-2.5-flash as the primary generation model
    const modelName = "gemini-2.5-flash"; 
    const model = genAI.getGenerativeModel({ model: modelName });

    const instructions = `You are an expert curriculum designer and university lecturer specializing in high-stakes Computer Based Testing (CBT).

Your task is to generate exactly ${count} multiple-choice questions based on the provided source material.

CRITICAL PEDAGOGICAL REQUIREMENTS:
1. ORIGINALITY: Never copy exact examples or sentences from the source material. Instead, extract the underlying concepts and create NEW scenarios.
2. QUANTITATIVE ANALYSIS (Maths, Statistics, Finance, etc.):
   - If the material involves formulas or calculations, generate NEW problems that require the student to perform actual calculations.
   - Use your own numerical values. Do not reuse the numbers from the text examples.
   - Distractors (incorrect options) MUST be plausible; they should represent common calculation pitfalls (e.g., wrong sign, misapplied formula, decimal errors).
3. VARIETY: Mix conceptual questions (why things work) with computational questions (how to calculate result).
4. CBT STYLE: Questions should be clear, unambiguous, and suitable for a professional examination system.
5. EXPLANATION: For calculative questions, the 'explanation' field MUST show the step-by-step derivation or the formula used.

Output MUST be a valid JSON array of objects, strictly following this schema:
[
  {
    "text": "The question text?",
    "options": [
      { "text": "Option 1", "isCorrect": true },
      { "text": "Option 2", "isCorrect": false },
      { "text": "Option 3", "isCorrect": false },
      { "text": "Option 4", "isCorrect": false }
    ],
    "explanation": "Step-by-step reasoning or calculation..."
  }
]

Directly return the JSON array. Do not include markdown code blocks or any other text before or after the JSON.`;

    const promptText = materialDescription ? `${instructions}\n\nSource Material Content:\n${materialDescription}` : instructions;
    finalPromptParts.unshift(promptText);

    const result = await model.generateContent(finalPromptParts);
    const apiResponse = await result.response;
    let generatedText = apiResponse.text().trim();
    
    // 🛡️ SANITIZE RESPONSE: Handle bad control characters (newlines/tabs inside strings)
    const sanitizeJson = (str) => {
      // Remove markdowns
      let cleaned = str.replace(/```json/g, '').replace(/```/g, '').trim();
      
      // Escape raw control characters (ASCII 0-31) that are not already escaped
      // This specifically targets the "Bad control character in string literal" error
      return cleaned.replace(/[\x00-\x1F\x7F-\x9F]/g, (match) => {
        const escapes = { '\n': '\\n', '\t': '\\t', '\r': '\\r' };
        return escapes[match] || ''; 
      });
    };

    let questions;
    try {
      const cleanedText = sanitizeJson(generatedText);
      questions = JSON.parse(cleanedText);
    } catch (parseErr) {
      console.warn("Primary JSON parse failed, attempting regex recovery...");
      // Regex fallback to find the array [ ... ]
      const jsonMatch = generatedText.match(/\[\s*\{.*\}\s*\]/s);
      if (jsonMatch) {
         try {
           questions = JSON.parse(sanitizeJson(jsonMatch[0]));
         } catch (regexErr) {
           throw new Error(`AI response parsing failed: ${regexErr.message}. Raw text was: ${generatedText.substring(0, 100)}...`);
         }
      } else {
         throw new Error("Could not extract valid JSON array from AI response.");
      }
    }

    // Shuffle options to ensure balanced distribution of correct answers (not biased towards A or D)
    const shuffledQuestions = (questions || []).map(q => {
      if (q.options && q.options.length > 0) {
        // Simple Fisher-Yates shuffle algorithm
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
    console.error("Gemini Generation Error:", error);
    res.status(500).json({ message: "Failed to generate AI questions. Check server logs or Gemini API key.", error: error.message });
  }
};
