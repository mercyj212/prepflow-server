import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from '../models/Student.js';
import sendEmail from '../utils/emailService.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const broadcastUpdate = async () => {
    try {
        console.log('Connecting to database...');
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined. Please check your .env path.');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Database connected.');

        const students = await Student.find({ role: 'student' });
        console.log(`Found ${students.length} students. Starting broadcast...`);

        if (students.length === 0) {
            console.log('No students found. Exiting.');
            process.exit(0);
        }

        const subject = "New Courses Added: Expand Your Knowledge on PrepUp! 🎓";
        const message = `Hello,\n\nWe're excited to announce that new courses and study materials have been successfully uploaded to PrepUp!\n\nYou can now access these fresh curriculum assets in your student dashboard to enhance your academic preparation. Log in now to explore the latest content.\n\nHappy Studying!\n\nBest regards,\nThe PrepUp Team`;

        for (const student of students) {
            try {
                await sendEmail({
                    email: student.email,
                    subject: subject,
                    message: message,
                    context: { name: student.fullName }
                });
                console.log(`[SUCCESS]: ${student.email}`);
                // 🛡️ SLOW-DRIP: Small delay to respect SMTP rate limits
                await new Promise(r => setTimeout(r, 800));
            } catch (err) {
                console.error(`[FAILED]: ${student.email} - ${err.message}`);
                // Wait a bit longer on failure before next attempt
                await new Promise(r => setTimeout(r, 2000));
            }
        }

        console.log('\n--- STABILIZED BROADCAST COMPLETE ---');
        process.exit(0);
    } catch (err) {
        console.error('[CRITICAL BROADCAST ERROR]:', err);
        process.exit(1);
    }
};

broadcastUpdate();
