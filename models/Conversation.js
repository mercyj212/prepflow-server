import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
  isGlobal:    { type: Boolean, default: false },
  isAI:        { type: Boolean, default: false },
  isGroup:     { type: Boolean, default: false },
  name:        { type: String, trim: true },          // group display name
  description: { type: String, trim: true },          // optional group bio
  admin:       { type: mongoose.Schema.Types.ObjectId, ref: 'Student' }, // group creator
  course:      { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  participants:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
}, { timestamps: true });

export default mongoose.model('Conversation', conversationSchema);
