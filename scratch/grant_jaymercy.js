import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import Student from './models/Student.js';
import Course from './models/Course.js';
import CourseAccess from './models/CourseAccess.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

async function grantAccess() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB.');

        const students = await Student.find({
            $or: [
                { username: new RegExp('jaymercy', 'i') },
                { email: new RegExp('jaymercy', 'i') }
            ]
        });

        if (students.length === 0) {
            console.log('No student matching "jaymercy" found.');
            const allStudents = await Student.find({}).select('username email fullName');
            console.log('Registered students:', allStudents);
            process.exit(0);
        }

        const course = await Course.findById('6a685990145c0ad0eb287329');
        if (!course) {
            console.log('Python Programming course not found!');
            process.exit(1);
        }

        for (const student of students) {
            const token = 'GRANT-' + Math.random().toString(36).substring(2, 10).toUpperCase();

            const access = await CourseAccess.findOneAndUpdate(
                { student: student._id, course: course._id },
                { student: student._id, course: course._id, accessToken: token, isActive: true },
                { upsert: true, returnDocument: 'after' }
            );

            console.log(`✅ Granted access to: ${student.username || student.email} (${student.fullName || 'No name'})`);
            console.log(`   Course: ${course.title}`);
            console.log(`   Access Record ID: ${access._id}`);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error granting access:', err.message);
        process.exit(1);
    }
}

grantAccess();
