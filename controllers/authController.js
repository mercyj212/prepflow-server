import Student from "../models/Student.js";
import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

import sendEmail from "../utils/emailService.js";

// @desc    Register a new student
// @route   POST /api/auth/register
// @access  Public
export const registerStudent = async (req, res) => {
  const { fullName, email, password, phone } = req.body;

  try {
    const studentExists = await Student.findOne({ email });

    if (studentExists) {
      return res.status(400).json({ message: "Student already exists" });
    }

    const student = await Student.create({
      fullName,
      email,
      password,
      phone,
    });

    if (student) {
      // 📧 DISPATCH WELCOME EMAIL (Non-blocking)
      try {
        await sendEmail({
          email: student.email,
          subject: 'Welcome to PrepUp CBT! 🚀',
          template: 'welcomeEmail',
          context: {
            name: student.fullName,
            loginUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`
          }
        });
      } catch (emailErr) {
        console.error('[COMMUNICATION DELAY]: Welcome kit dispatch pending.');
      }

      res.status(201).json({
        _id: student._id,
        fullName: student.fullName,
        email: student.email,
        role: student.role,
        token: generateToken(student._id),
      });
    } else {
      res.status(400).json({ message: "Invalid student data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth student & get token
// @route   POST /api/auth/login
export const loginStudent = async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await Student.findOne({ email });

    if (student && (await student.comparePassword(password))) {
      student.lastLogin = Date.now();
      
      // Robust device capture with fallback
      try {
        student.deviceInfo = req.headers['user-agent'] || 'Unknown Browser';
        await student.save();
      } catch (saveError) {
        console.error('[DATABASE ERROR]: Failed to save scholar activity:', saveError.message);
        // We still let them log in even if activity tracking fails
      }
      
      res.json({
        _id: student._id,
        fullName: student.fullName,
        email: student.email,
        role: student.role,
        token: generateToken(student._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current student profile
// @route   GET /api/auth/profile
export const getStudentProfile = async (req, res) => {
  const student = await Student.findById(req.user._id);

  if (student) {
    res.json({
      _id: student._id,
      fullName: student.fullName,
      email: student.email,
      role: student.role,
    });
  } else {
    res.status(404).json({ message: "Student not found" });
  }
};
