import Quiz from "../models/Quiz.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
    const quizzes = await Quiz.find({ isActive: true }).select("-questions.options.isCorrect");
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single quiz (No answers)
// @route   GET /api/quizzes/:id
// @access  Private
export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select("-questions.options.isCorrect");

    if (quiz) {
      // Create a shallow copy to modify questions without affecting DB
      const quizObj = quiz.toObject();
      quizObj.questions = shuffleArray(quizObj.questions).slice(0, 60);
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
      quizObj.questions = shuffleArray(quizObj.questions).slice(0, 60);
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

// @desc    Update a quiz
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

// @desc    Generate questions using Gemini AI
// @route   POST /api/quizzes/:id/generate
// @access  Private/Admin
export const generateQuestions = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    const { material, count } = req.body;
    if (!material || !count) {
      return res.status(400).json({ message: "Material and count are required" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "Gemini API key is missing in server environment." });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `You are an expert curriculum designer. Based on the following source material, generate exactly ${count || 100} multiple-choice questions. 
It is extremely important that you attempt to generate as close to 100 questions as possible if the text allows.
For each question, provide 4 options, a boolean flag 'isCorrect' (only exactly 1 option should be true), and an 'explanation' string explaining why the answer is correct based on the text.

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
    "explanation": "Because..."
  }
]

Directly return the JSON array. Do not include markdown code blocks or any other explanation.

Source Material:
"${material}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let generatedText = response.text().trim();
    
    // Clean up potential markdown formatting
    if (generatedText.startsWith('```json')) {
      generatedText = generatedText.substring(7);
    }
    if (generatedText.startsWith('```')) {
      generatedText = generatedText.substring(3);
    }
    if (generatedText.endsWith('```')) {
      generatedText = generatedText.substring(0, generatedText.length - 3);
    }
    
    const questions = JSON.parse(generatedText.trim());

    // Append to existing
    quiz.questions.push(...questions);
    const updatedQuiz = await quiz.save();

    res.status(201).json({ message: "Questions generated successfully", updatedQuiz });
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    res.status(500).json({ message: "Failed to generate AI questions. Check server logs or Gemini API key.", error: error.message });
  }
};
