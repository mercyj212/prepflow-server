import mongoose from "mongoose";

const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
    default: false,
    select: true,
  },
});

const questionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    trim: true,
  },
  options: [optionSchema],
  explanation: {
    type: String,
    default: "",
    trim: true,
  },
  subject: {
    type: String,
    default: "General",
    trim: true,
  },
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },
  qualityScore: {
    type: Number,
    default: 100,
    min: 0,
    max: 100,
  },
  validationStatus: {
    type: String,
    enum: ["passed", "failed", "flagged_admin"],
    default: "passed",
  },
  rejectionReasons: {
    type: [String],
    default: [],
  },
  regenerationCount: {
    type: Number,
    default: 0,
  },
  needsAdminReview: {
    type: Boolean,
    default: false,
  },
  aiGenerated: {
    type: Boolean,
    default: true,
  },
});

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    questions: [questionSchema],
    timeLimit: {
      type: Number, // in minutes
      default: 30,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);
