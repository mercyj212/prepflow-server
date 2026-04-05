import Student from "../models/Student.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/emailService.js";
import crypto from 'crypto';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new student
// @route   POST /api/auth/register
export const registerStudent = async (req, res) => {
  const { fullName, email, password, phone } = req.body;

  try {
    const studentExists = await Student.findOne({ email });

    if (studentExists) {
      return res.status(400).json({ message: "Student already exists" });
    }

    // 🛡️ GENERATE SECURE VERIFICATION TOKEN
    const vToken = crypto.randomBytes(32).toString('hex');
    const vTokenHash = crypto.createHash('sha256').update(vToken).digest('hex');

    const student = await Student.create({
      fullName,
      email,
      password,
      phone,
      verificationToken: vTokenHash,
      verificationTokenExpire: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    if (student) {
      // 📧 DISPATCH VERIFICATION EMAIL
      try {
        const vUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${vToken}`;
        await sendEmail({
          email: student.email,
          subject: 'Action Required: Verify Your Identity 🛡️',
          template: 'verifyEmail',
          context: {
            name: student.fullName,
            verificationUrl: vUrl
          }
        });
      } catch (emailErr) {
        console.error('[COMMUNICATION DELAY]: Identity badge pending dispatch.');
      }

      res.status(201).json({
        _id: student._id,
        fullName: student.fullName,
        email: student.email,
        role: student.role,
        isVerified: student.isVerified,
        message: 'Registration successful. Check email to activate account.'
      });
    } else {
      res.status(400).json({ message: "Invalid student data" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login student
// @route   POST /api/auth/login
export const loginStudent = async (req, res) => {
  const { email, password } = req.body;

  try {
    const student = await Student.findOne({ email });

    if (student && (await student.comparePassword(password))) {
      // 🛡️ IDENTITY CHECK: BLOCK UNVERIFIED
      if (!student.isVerified) {
        return res.status(401).json({ message: "Identity not verified. Please check your inbox 🛡️" });
      }

      // 🛰️ ACTIVITY TRACKER: High-Res Timing & Device Intelligence
      student.lastLogin = Date.now();
      const userAgent = req.headers['user-agent'] || 'Unknown-Client';
      
      try {
        if (/android/i.test(userAgent)) student.deviceInfo = 'Android Device';
        else if (/iphone|ipad|ipod/i.test(userAgent)) student.deviceInfo = 'iOS Device';
        else if (/windows/i.test(userAgent)) student.deviceInfo = 'Windows PC';
        else if (/macintosh/i.test(userAgent)) student.deviceInfo = 'Apple Mac';
        else if (/linux/i.test(userAgent)) student.deviceInfo = 'Linux PC';
        else student.deviceInfo = 'Standard Web-Client';
      } catch (e) {
        student.deviceInfo = 'Verified Client';
      }
      
      await student.save();

      res.json({
        _id: student._id,
        fullName: student.fullName,
        email: student.email,
        role: student.role,
        isVerified: student.isVerified,
        token: generateToken(student._id),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify email address
// @route   GET /api/auth/verify-email/:token
export const verifyEmail = async (req, res) => {
  try {
    const vTokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const student = await Student.findOne({
      verificationToken: vTokenHash,
      verificationTokenExpire: { $gt: Date.now() }
    });

    if (!student) {
      return res.status(400).json({ message: "Verification link invalid or expired." });
    }

    student.isVerified = true;
    student.verificationToken = undefined;
    student.verificationTokenExpire = undefined;
    await student.save();

    res.json({ message: "Identity verified! Account activated 🛡️" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Request password reset
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const student = await Student.findOne({ email: req.body.email });

    if (!student) {
      return res.status(404).json({ message: "Scholar profile not found." });
    }

    const rToken = crypto.randomBytes(32).toString('hex');
    const rTokenHash = crypto.createHash('sha256').update(rToken).digest('hex');

    student.resetPasswordToken = rTokenHash;
    student.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
    await student.save();

    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${rToken}`;
      await sendEmail({
        email: student.email,
        subject: 'Security Alert: Recovery Beacon Dispatched 🛠️',
        template: 'resetPassword',
        context: { resetUrl }
      });
      res.json({ message: "Security beacon sent! Check your inbox." });
    } catch (emailErr) {
      student.resetPasswordToken = undefined;
      student.resetPasswordExpire = undefined;
      await student.save();
      res.status(500).json({ message: "Recovery dispatch failed." });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset password
// @route   PUT /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  try {
    const rTokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const student = await Student.findOne({
      resetPasswordToken: rTokenHash,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!student) {
      return res.status(400).json({ message: "Recovery link invalid or expired." });
    }

    student.password = req.body.password;
    student.resetPasswordToken = undefined;
    student.resetPasswordExpire = undefined;
    await student.save();

    res.json({ message: "Identity credentials updated! You can now log in." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
