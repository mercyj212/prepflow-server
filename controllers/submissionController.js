import Submission from "../models/Submission.js";
import Quiz from "../models/Quiz.js";

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
      totalQuestions: req.body.totalQuestions || quiz.questions.length,
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
