import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import Department from '../models/Department.js';
import Course from '../models/Course.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function checkCourses() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const courses = await Course.find({}).populate('department');
        console.log(`Found ${courses.length} courses:`);
        for (const c of courses) {
            console.log(`- ID: ${c._id} | Title: "${c.title}" | Dept: ${c.department?.name || 'None'} | Level: ${c.level}`);
        }
        process.exit(0);
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
}

checkCourses();
