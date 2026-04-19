import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  isModel: {
    type: Boolean,
    default: false
  },
  isEdited: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    required: true,
    trim: true
  }
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
export default Message;
