import mongoose from 'mongoose';

const typingSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  lastTyped: {
    type: Date,
    default: Date.now
  }
});

// Index to expire typing indicator automatically after 10 seconds of inactivity
typingSchema.index({ lastTyped: 1 }, { expireAfterSeconds: 10 });

const TypingStatus = mongoose.model('TypingStatus', typingSchema);
export default TypingStatus;
