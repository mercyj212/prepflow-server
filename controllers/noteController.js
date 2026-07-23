import CourseNote from "../models/CourseNote.js";
import Course from "../models/Course.js";

import mongoose from "mongoose";

// @desc    Get all notes for a specific course
// @route   GET /api/notes/:courseId
// @access  Public (or could be restricted to logged in students depending on your rules, let's keep it public/enrolled logic)
export const getCourseNotes = async (req, res) => {
  try {
    const { courseId } = req.params;
    const notes = await CourseNote.find({ course: new mongoose.Types.ObjectId(courseId) }).sort({ order: 1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new course note
// @route   POST /api/notes
// @access  Private/Admin
export const createCourseNote = async (req, res) => {
  const { course, chapterTitle, content, order } = req.body;

  if (!course || !chapterTitle || !content) {
    return res.status(400).json({ message: "Course, chapter title, and content are required" });
  }

  try {
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({ message: "Course not found" });
    }

    const note = await CourseNote.create({
      course,
      chapterTitle,
      content,
      order: order || 0,
    });

    res.status(201).json(note);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a course note
// @route   PUT /api/notes/:id
// @access  Private/Admin
export const updateCourseNote = async (req, res) => {
  try {
    const note = await CourseNote.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    const { chapterTitle, content, order } = req.body;

    if (chapterTitle) note.chapterTitle = chapterTitle;
    if (content) note.content = content;
    if (order !== undefined) note.order = order;

    const updatedNote = await note.save();
    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a course note
// @route   DELETE /api/notes/:id
// @access  Private/Admin
export const deleteCourseNote = async (req, res) => {
  try {
    const note = await CourseNote.findById(req.params.id);
    if (!note) return res.status(404).json({ message: "Note not found" });

    await CourseNote.deleteOne({ _id: note._id });
    res.json({ message: "Note removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

import { GoogleGenerativeAI } from '@google/generative-ai';

// @desc    Ask AI Tutor a question based on notes context
// @route   POST /api/notes/tutor
// @access  Public
export const askAITutor = async (req, res) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ message: "Messages array is required" });
    }

    const geminiApiKey = process.env.GOOGLE_API_KEY || process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return res.status(500).json({ message: "AI API key not configured" });
    }

    const genAI = new GoogleGenerativeAI(geminiApiKey);
    
    // Construct prompt from messages
    let prompt = "";
    for (const msg of messages) {
      if (msg.role === 'system') {
        prompt += `System Instructions: ${msg.content}\n\n`;
      } else if (msg.role === 'user') {
        prompt += `Student: ${msg.content}\n`;
      } else {
        prompt += `Tutor: ${msg.content}\n`;
      }
    }
    prompt += "Tutor: ";

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const reply = result.response.text();

    res.json({ reply });
  } catch (error) {
    console.error("[AI_TUTOR_ERROR]:", error);
    res.status(500).json({ message: error.message || "Failed to contact AI Tutor" });
  }
};
