import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Student from '../models/Student.js';
import Course from '../models/Course.js';
import CourseAccess from '../models/CourseAccess.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const email = 'Perryxau@gmail.com';
const AI_DEPT_ID = '69f329129ff6793adc556007';

async function grantAIAccess() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.");

        const student = await Student.findOne({ email: new RegExp(email, 'i') });
        if (!student) {
            console.error('User not found:', email);
            process.exit(1);
        }

        console.log('Found user:', student.email);

        const aiCourses = await Course.find({ department: AI_DEPT_ID });
        console.log(`Found ${aiCourses.length} AI courses.`);

        if (aiCourses.length === 0) {
            console.log('No AI courses found in the DB for that department.');
            process.exit(0);
        }

        const existingAccesses = await CourseAccess.find({ student: student._id });
        const existingCourseIds = new Set(existingAccesses.map(a => a.course.toString()));
        let granted = 0;
        
        for (const c of aiCourses) {
            if (!existingCourseIds.has(c._id.toString())) {
                await CourseAccess.create({
                    student: student._id,
                    course: c._id,
                    accessToken: 'auto-granted-ai-' + Date.now() + '-' + Math.random().toString(36).substring(7),
                    isActive: true,
                    isUsed: true,
                    firstUsedAt: new Date()
                });
                granted++;
            }
        }
        
        console.log(`Granted access to ${granted} new AI courses.`);
        process.exit(0);

    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
}

grantAIAccess();
