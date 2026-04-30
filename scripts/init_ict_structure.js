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

    // 2. Ensure ICT departments exist under School of ICT
    const departments = [
      {
        name: 'Computer Science',
        description: 'ND1 and ND2 foundation department'
      },
      {
        name: 'Software and Web Development',
        description: 'HND specialization department'
      },
      {
        name: 'Artificial Intelligence',
        description: 'HND specialization department'
      },
      {
        name: 'Networking and Cloud Computing',
        description: 'HND specialization department'
      },
      {
        name: 'Cyber Security',
        description: 'HND specialization department'
      }
    ];

    for (const dept of departments) {
      const exists = await Department.findOne({
        name: new RegExp(`^${dept.name}$`, 'i'),
        faculty: ictFaculty._id
      });

      if (!exists) {
        await Department.create({
          ...dept,
          faculty: ictFaculty._id
        });
        console.log(`Created Department: ${dept.name}`);
      } else {
        console.log(`Department already exists: ${dept.name}`);
      }
    }

    console.log('Academic structure preparation complete.');
    process.exit(0);
  } catch (err) {
    console.error('Initialisation failed:', err);
    process.exit(1);
  }
};

ensureStructure();
