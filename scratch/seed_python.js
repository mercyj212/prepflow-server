import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import Course from '../models/Course.js';
import Department from '../models/Department.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const SWD_DEPT_ID = "69f329129ff6793adc556004";

async function createPythonCourse() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.");

        const dept = await Department.findById(SWD_DEPT_ID);
        if (!dept) {
            console.error("SWD department not found!");
            process.exit(1);
        }

        const existingCourse = await Course.findOne({ title: "PYTHON PROGRAMMING" });
        if (existingCourse) {
            console.log(`Course already exists: ${existingCourse.title} (${existingCourse._id})`);
            process.exit(0);
        }

        const newCourse = await Course.create({
            title: "PYTHON PROGRAMMING",
            description: "Introduction to Python Data Types, Operators, Control Structures, and Functions.",
            department: dept._id,
            level: "HND1", // Guessing level, will use HND1
            path: "polytechnic",
            semester: "First Semester",
            price: 0
        });

        console.log(`Successfully created course: ${newCourse.title} (${newCourse._id})`);
        process.exit(0);
    } catch (err) {
        console.error("Error creating course:", err);
        process.exit(1);
    }
}

createPythonCourse();
