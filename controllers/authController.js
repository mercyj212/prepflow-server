import Student from "../models/Student.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/emailService.js";
import crypto from 'crypto';

const generateToken = (id) => {
  return jwt.sign({ id: id.toString() }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

// @desc    Register a new student
// @route   POST /api/auth/register
export const registerStudent = async (req, res) => {
  const { fullName, email, password, phone } = req.body;

  try {
    // 🛡️ SECURITY SENTINEL: ENFORCE HIGH-ENTROPY PASSWORDS
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: "Institutional Security Required: Password must be 8+ chars, with Uppercase, Number, and Special Symbol (@$!%*?&)." 
      });
    }

    const studentExists = await Student.findOne({ email });

    if (studentExists) {
      return res.status(400).json({ message: "Student already exists" });
    }

    // 🛡️ GENERATE 6-DIGIT OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    const student = await Student.create({
      fullName,
      email,
      password,
      phone,
      verificationToken: otpHash,
      verificationTokenExpire: Date.now() + 10 * 60 * 1000, // 10 minutes (Urgent)
    });

    if (student) {
      let mailDiagnostic = "success";
      try {
        await sendEmail({
          email: student.email,
          subject: 'Action Required: Identity OTP Node 🛡️',
          template: 'verifyEmail',
          context: {
            name: student.fullName,
            otp: otp
          }
        });
      } catch (emailErr) {
        console.error('[COMMUNICATION DELAY]:', emailErr.message);
        mailDiagnostic = emailErr.message || "Silent Communication Failure";
      }

      res.status(201).json({
        _id: student._id,
        fullName: student.fullName,
        email: student.email,
        role: student.role,
        isVerified: student.isVerified,
        message: 'Registration successful. Check email to activate account.',
        serverDiagnostic: mailDiagnostic
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
      // 🛡️ IDENTITY CHECK: BLOCK AND RE-VERIFY UNVERIFIED SCHOLARS
      if (!student.isVerified) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

        await Student.findByIdAndUpdate(student._id, {
          verificationToken: otpHash,
          verificationTokenExpire: Date.now() + 10 * 60 * 1000, // 10 minutes
        });

        let mailDiagnostic = "success";
        
        try {
          await sendEmail({
            email: student.email,
            subject: 'Action Required: Identity OTP Node 🛡️',
            template: 'verifyEmail',
            context: { name: student.fullName, otp: otp }
          });
        } catch (emailErr) {
          console.error('[COMMUNICATION DELAY]:', emailErr.message);
          mailDiagnostic = emailErr.message || "Silent Communication Failure";
        }

        return res.status(403).json({ 
          message: "Identity not verified. A fresh OTP has been sent to your inbox.",
          requiresVerification: true,
          email: student.email,
          serverDiagnostic: mailDiagnostic
        });
      }

      // 🛰️ ACTIVITY TRACKER: High-Res Timing & Device Intelligence
      let deviceInfo = 'Standard Web-Client';
      const userAgent = req.headers['user-agent'] || '';
      
      if (/android/i.test(userAgent)) deviceInfo = 'Android Device';
      else if (/iphone|ipad|ipod/i.test(userAgent)) deviceInfo = 'iOS Device';
      else if (/windows/i.test(userAgent)) deviceInfo = 'Windows PC';
      else if (/macintosh/i.test(userAgent)) deviceInfo = 'Apple Mac';
      else if (/linux/i.test(userAgent)) deviceInfo = 'Linux PC';

      await Student.findByIdAndUpdate(student._id, {
        $set: { 
          lastLogin: Date.now(),
          deviceInfo: deviceInfo
        }
      });

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
    console.error('[AUTH ERROR][LOGIN]:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    const student = await Student.findOne({
      email,
      verificationToken: otpHash,
      verificationTokenExpire: { $gt: Date.now() }
    });

    if (!student) {
      return res.status(400).json({ message: "Invalid or expired OTP code 🛡️" });
    }

    student.isVerified = true;
    student.verificationToken = undefined;
    student.verificationTokenExpire = undefined;
    await student.save();

    res.json({ message: "Identity verified! Account activated.", token: generateToken(student._id) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify email address (Legacy support if needed, but we use OTP now)
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
