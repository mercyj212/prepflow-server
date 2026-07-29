import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import Department from '../models/Department.js';
import Course from '../models/Course.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

async function setupMLCourse() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB.');

        let aiDept = await Department.findOne({ name: new RegExp('Artificial Intelligence', 'i') });
        if (!aiDept) {
            console.log('AI Department not found, creating...');
            aiDept = await Department.create({
                name: 'Artificial Intelligence',
                description: 'HND specialization department'
            });
        }

        let course = await Course.findOne({ title: 'MACHINE LEARNING' });
        if (!course) {
            course = await Course.create({
                title: 'MACHINE LEARNING',
                description: 'Comprehensive Machine Learning Concepts, Algorithms, Supervised & Unsupervised Learning',
                department: aiDept._id,
                level: 'HND1',
                path: 'polytechnic',
                semester: 'Second Semester',
                price: 1000
            });
            console.log(`Created course: ${course.title} (${course._id})`);
        } else {
            console.log(`Course already exists: ${course.title} (${course._id})`);
        }

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error('Error:', err.message);
        process.exit(1);
    }
}

setupMLCourse();
