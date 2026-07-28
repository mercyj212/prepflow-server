import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import Quiz from "../models/Quiz.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const backupQuizzes = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for backup.");

    const quizzes = await Quiz.find({}).lean();
    
    const backupPath = path.join(__dirname, 'quizzes_backup.json');
    fs.writeFileSync(backupPath, JSON.stringify(quizzes, null, 2));
    
    console.log(`Backed up ${quizzes.length} quizzes to ${backupPath}`);
    process.exit(0);
  } catch (error) {
    console.error("Backup failed:", error);
    process.exit(1);
  }
};

backupQuizzes();
