import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';

dotenv.config();

const clearGroups = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);

    console.log('Deleting Group/Global/Course conversations...');
    // We target any conversation that isn't a simple DM (i.e. isGroup:true, isGlobal:true, or has a course)
    const result = await Conversation.deleteMany({
      $or: [
        { isGroup: true },
        { isGlobal: true },
        { course: { $exists: true } }
      ]
    });

    console.log(`Deleted ${result.deletedCount} conversations.`);

    // Optionally clear messages that are no longer attached to a valid conversation
    // (though Cascade isn't strictly necessary here, it keeps DB clean)
    const conversations = await Conversation.find({}, '_id');
    const validIds = conversations.map(c => c._id);
    const msgResult = await Message.deleteMany({ conversationId: { $nin: validIds } });
    
    console.log(`Deleted ${msgResult.deletedCount} orphaned messages.`);
    console.log('Cleanup complete!');
    process.exit(0);
  } catch (err) {
    console.error('Error during cleanup:', err);
    process.exit(1);
  }
};

clearGroups();
