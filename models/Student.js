import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const studentSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    profilePicture: {
      type: String,
    },
    nickname: {
      type: String,
      trim: true,
      minlength: 3,
      maxlength: 20,
    },
    role: {
      type: String,
      enum: ["student", "admin"],
      default: "student",
    },
    phone: {
      type: String,
      required: false,
      trim: true,
    },
    accessStatus: {
      type: String,
      enum: ["active", "revoked"],
      default: "active",
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    deviceInfo: {
      type: String,
      default: "Unknown",
    },
    // 🛡️ SECURITY NODES
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: String,
    verificationTokenExpire: Date,
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    // 🎮 GAME STATS
    prepDriveScore: {
      type: Number,
      default: 0,
    },
    prepDriveAwards: {
      type: Number,
      default: 0,
    },
    speedRecallScore: {
      type: Number,
      default: 0,
    },
    speedRecallAwards: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
studentSchema.pre("save", async function () {
  if (!this.isModified("password") || !this.password) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password
studentSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model("Student", studentSchema);
