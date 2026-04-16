import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  isGlobal: { type: Boolean, default: false },
  isAI: { type: Boolean, default: false },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
}, { timestamps: true });

export default mongoose.model('Conversation', conversationSchema);
