import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Conversation from '../models/Conversation.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

async function removeGroups() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected. Identifying group conversations to delete...'); ac
    const result = await Conversation.deleteMany({
      $or: [
        { isGroup: true },
        { isGlobal: true },
        { course: { $exists: true, $ne: null } }
      ]
    });
    console.log(`Successfully deleted ${result.deletedCount} group conversations.`);
  } catch (error) {
    console.error('Error deleting group conversations:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
}

removeGroups();
