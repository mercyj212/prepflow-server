import Student from "../models/Student.js";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/emailService.js";
import crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

const generateToken = (id) => {
  return jwt.sign({ id: id.toString() }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

/**
 * @public @async
 * @method registerStudent
 * @description Ingests scholar profile data, validates password entropy, 
 * generates higher-order hash for OTP, and dispatches verification briefing.
 * @param {Express.Request} req - Request object containing scholar credentials.
 * @param {Express.Response} res - Response object returning scholar metadata.
 */
export const registerStudent = async (req, res) => {
  const { fullName, email, password, phone } = req.body;

  try {
    // ️ SECURITY SENTINEL: ENFORCE HIGH-ENTROPY PASSWORDS
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ 
        message: "Security Requirement: Your password must be at least 8 characters long and include an uppercase letter, a number, and a special symbol (@$!%*?&)." 
      });
    }

    const studentExists = await Student.findOne({ email });

    if (studentExists) {
      return res.status(400).json({ message: "Student already exists" });
    }

    // ️ GENERATE 6-DIGIT OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    const student = await Student.create({
      fullName,
      email,
      password,
      phone,
      verificationToken: otpHash,
      verificationTokenExpire: Date.now() + 60 * 60 * 1000, // 60 minutes
    });

    if (student) {
      let mailDiagnostic = "success";
      try {
        await sendEmail({
          email: student.email,
          subject: 'Confirm your PrepUp account',
          template: 'verifyEmail',
          context: {
            name: student.fullName,
            otp: otp
          }
        });
      } catch (emailErr) {
        console.warn(`\n===  RENDER SMTP BYPASS  ===\nYour free Render server blocked outbound SMTP.\nRetrieve OTP Code to Register: [ ${otp} ]\n==============================\n`);
        console.error('[COMMUNICATION DELAY]:', emailErr.message);
        mailDiagnostic = emailErr.message || "Silent Communication Failure";
      }

      res.status(201).json({
        _id: student._id,
        fullName: student.fullName,
        email: student.email,
        role: student.role,
        isVerified: student.isVerified,
        message: 'Registration successful. Please check your email to verify your account.',
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

    // Handle case where account might exist but doesn't have a password (like Google logins)
    if (student && student.password && (await student.comparePassword(password))) {
      // ️ IDENTITY CHECK: BLOCK AND RE-VERIFY UNVERIFIED SCHOLARS
      if (!student.isVerified) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

        await Student.findByIdAndUpdate(student._id, {
          verificationToken: otpHash,
          verificationTokenExpire: Date.now() + 60 * 60 * 1000, // 60 minutes
        });

        let mailDiagnostic = "success";
        
        try {
          await sendEmail({
            email: student.email,
            subject: 'Your PrepUp verification code',
            template: 'verifyEmail',
            context: { name: student.fullName, otp: otp }
          });
        } catch (emailErr) {
          console.warn(`\n===  RENDER SMTP BYPASS  ===\nYour free Render server blocked outbound SMTP.\nRetrieve OTP Code to Login: [ ${otp} ]\n==============================\n`);
          console.error('[COMMUNICATION DELAY]:', emailErr.message);
          mailDiagnostic = emailErr.message || "Silent Communication Failure";
        }

        return res.status(403).json({ 
          message: "Account not verified. A new verification code has been sent to your email.",
          requiresVerification: true,
          email: student.email,
          serverDiagnostic: mailDiagnostic
        });
      }

      // ️ ACTIVITY TRACKER: High-Res Timing & Device Intelligence
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
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required.' });
    }

    const otpHash = crypto.createHash('sha256').update(otp.toString()).digest('hex');

    // Use findOneAndUpdate to bypass the pre-save password rehashing hook
    const student = await Student.findOneAndUpdate(
      {
        email,
        verificationToken: otpHash,
        verificationTokenExpire: { $gt: Date.now() }
      },
      {
        $set: { isVerified: true },
        $unset: { verificationToken: 1, verificationTokenExpire: 1 }
      },
      { new: true }
    );

    if (!student) {
      return res.status(400).json({ message: 'Invalid or expired OTP. Please request a new one.' });
    }

    let mailDiagnostic = "success";
    try {
      const loginUrl = `${process.env.FRONTEND_URL || 'https://prepupcbt.vercel.app'}/login`;
      await sendEmail({
        email: student.email,
        subject: 'Welcome to the PrepUp CBT Community 🎓',
        template: 'welcomeEmail',
        context: {
          name: student.fullName,
          loginUrl: loginUrl
        }
      });
    } catch (welcomeErr) {
      console.warn('[WELCOME EMAIL SKIP]:', welcomeErr.message);
      mailDiagnostic = welcomeErr.message || "Silent Communication Failure";
    }

    res.json({
      _id: student._id,
      fullName: student.fullName,
      email: student.email,
      role: student.role,
      isVerified: true,
      message: 'Email verified! Your account is now active.',
      token: generateToken(student._id),
      serverDiagnostic: mailDiagnostic
    });
  } catch (error) {
    console.error('[AUTH ERROR][VERIFY OTP]:', error.message, error.stack);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify email address (Legacy support if needed, but we use OTP now)
// @route   GET /api/auth/verify-email/:token
export const verifyEmail = async (req, res) => {
  try {
    const vTokenHash = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const student = await Student.findOneAndUpdate(
      {
        verificationToken: vTokenHash,
        verificationTokenExpire: { $gt: Date.now() }
      },
      {
        $set: { isVerified: true },
        $unset: { verificationToken: 1, verificationTokenExpire: 1 }
      },
      { new: true }
    );

    if (!student) {
      return res.status(400).json({ message: "Verification link invalid or expired." });
    }

    res.json({ message: "Verification successful! Your account is active." });
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
      return res.status(404).json({ message: "No account found with this email address." });
    }

    const rToken = crypto.randomBytes(32).toString('hex');
    const rTokenHash = crypto.createHash('sha256').update(rToken).digest('hex');

    // Use findByIdAndUpdate to avoid triggering the pre-save password hook
    await Student.findByIdAndUpdate(student._id, {
      $set: {
        resetPasswordToken: rTokenHash,
        resetPasswordExpire: Date.now() + 60 * 60 * 1000 // 1 hour
      }
    });

    try {
      const resetUrl = `${process.env.FRONTEND_URL || 'https://prepupcbt.vercel.app'}/reset-password/${rToken}`;
      await sendEmail({
        email: student.email,
        subject: 'Reset your PrepUp password',
        template: 'resetPassword',
        context: { resetUrl }
      });
      res.json({ 
        message: "Password reset link sent! Please check your email.",
        serverDiagnostic: "success"
      });
    } catch (emailErr) {
      await Student.findByIdAndUpdate(student._id, {
        $unset: { resetPasswordToken: 1, resetPasswordExpire: 1 }
      });
      res.status(500).json({ 
        message: "Failed to send recovery email. Please try again.",
        serverDiagnostic: emailErr.message || "Generic Dispatch Error"
      });
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

// @desc    Resend OTP for unverified users
// @route   POST /api/auth/resend-otp
export const resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const student = await Student.findOne({ email });

    if (!student) {
      return res.status(404).json({ message: 'No account found with that email.' });
    }

    if (student.isVerified) {
      return res.status(400).json({ message: 'Account is already verified.' });
    }

    // Generate a fresh 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    await Student.findByIdAndUpdate(student._id, {
      verificationToken: otpHash,
      verificationTokenExpire: Date.now() + 60 * 60 * 1000, // 60 minutes
    });

    let mailDiagnostic = 'success';
    try {
      await sendEmail({
        email: student.email,
        subject: 'Your new verification code',
        template: 'verifyEmail',
        context: { name: student.fullName, otp: otp }
      });
    } catch (emailErr) {
      console.warn(`\n===  RENDER SMTP BYPASS  ===\nOTP Code for ${student.email}: [ ${otp} ]\n==============================\n`);
      console.error('[RESEND OTP DISPATCH ERROR]:', emailErr.message);
      mailDiagnostic = emailErr.message || 'Silent Communication Failure';
    }

    res.json({
      message: 'A fresh OTP has been sent to your inbox.',
      serverDiagnostic: mailDiagnostic
    });
  } catch (error) {
    console.error('[AUTH ERROR][RESEND OTP]:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Google Identity Hub Login
// @route   POST /api/auth/google
export const googleLogin = async (req, res) => {
  const { idToken } = req.body;

  try {
    if (!idToken) {
      return res.status(400).json({ message: "Missing Google Security Token." });
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      console.error('[AUTH ERROR][GOOGLE HUB]: Server-side GOOGLE_CLIENT_ID missing.');
      return res.status(500).json({ message: "External identity hub configuration error." });
    }

    const authClient = new OAuth2Client(clientId);
    const ticket = await authClient.verifyIdToken({
      idToken,
      audience: clientId,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let student = await Student.findOne({ email });

    if (student) {
      // ️ LEGACY ACCOUNT UPGRADE: Link Google Profile if not present
      if (!student.googleId) {
        student.googleId = googleId;
      }
      student.profilePicture = picture || student.profilePicture;
      student.isVerified = true; // Google accounts are implicitly verified
      await student.save();
    } else {
      // ️ NEW SCHOLAR: Automatic Enrollment via Google
      student = await Student.create({
        fullName: name,
        email,
        googleId,
        profilePicture: picture,
        isVerified: true
      });
    }

    // ️ ACTIVITY TRACKER: High-Res Timing & Device Intelligence
    let deviceInfo = 'Standard Web-Client';
    const userAgent = req.headers['user-agent'] || '';
    if (/android/i.test(userAgent)) deviceInfo = 'Android Device';
    else if (/iphone|ipad|ipod/i.test(userAgent)) deviceInfo = 'iOS Device';
    else if (/windows/i.test(userAgent)) deviceInfo = 'Windows PC';
    else if (/macintosh/i.test(userAgent)) deviceInfo = 'Apple Mac';
    else if (/linux/i.test(userAgent)) deviceInfo = 'Linux PC';

    student.lastLogin = Date.now();
    student.deviceInfo = deviceInfo;
    await student.save();

    res.json({
      _id: student._id,
      fullName: student.fullName,
      email: student.email,
      role: student.role,
      isVerified: student.isVerified,
      profilePicture: student.profilePicture,
      token: generateToken(student._id),
    });

  } catch (error) {
    console.error('[AUTH ERROR][GOOGLE HUB]:', error);
    res.status(401).json({ 
      message: "Identity verification failed via Google Hub. Access denied.",
      debug: error.message 
    });
  }
};

// @desc    Update User Profile Avatar
// @route   PUT /api/auth/profile/avatar
// @access  Private (Protect Middleware + Upload Middleware)
export const updateProfilePicture = async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);

    if (!student) {
      return res.status(404).json({ message: "Student account not found." });
    }

    if (!req.file || !req.file.path) {
      return res.status(400).json({ message: "No image file provided." });
    }

    // Assign Cloudinary URL directly to the student record
    student.profilePicture = req.file.path;
    await student.save();

    res.json({
      _id: student._id,
      fullName: student.fullName,
      email: student.email,
      role: student.role,
      isVerified: student.isVerified,
      profilePicture: student.profilePicture,
      token: generateToken(student._id),
      message: "Avatar updated securely.",
    });
  } catch (error) {
    console.error('[AUTH ERROR][AVATAR UPDATE]:', error);
    res.status(500).json({ message: "Failed to update profile picture. Ensure the image is valid." });
  }
};
