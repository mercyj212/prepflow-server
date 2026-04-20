import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Faculty from '../models/Faculty.js';
import Department from '../models/Department.js';

dotenv.config();

const ensureStructure = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 1. Ensure School of ICT (Faculty) exists in polytechnic path
    let ictFaculty = await Faculty.findOne({ name: /School of ICT/i, path: 'polytechnic' });
    if (!ictFaculty) {
      ictFaculty = await Faculty.create({
        name: 'School of ICT',
        path: 'polytechnic',
        description: 'School of Information and Communication Technology'
      });
      console.log('Created Faculty: School of ICT');
    } else {
      console.log('Faculty already exists: School of ICT');
    }

    // 2. Ensure Computer Science (Department) exists under School of ICT
    let csDept = await Department.findOne({ name: /Computer Science/i, faculty: ictFaculty._id });
    if (!csDept) {
      csDept = await Department.create({
        name: 'Computer Science',
        faculty: ictFaculty._id,
        description: 'Department of Computer Science'
      });
      console.log('Created Department: Computer Science');
    } else {
      console.log('Department already exists: Computer Science');
    }

    console.log('Academic structure preparation complete.');
    process.exit(0);
  } catch (err) {
    console.error('Initialisation failed:', err);
    process.exit(1);
  }
};

ensureStructure();
