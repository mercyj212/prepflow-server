import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Student from './models/Student.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

const seedAdmin = async () => {
  try {
    // Check if admin already exists
    const adminExists = await Student.findOne({ email: 'admin@prepflow.com' });
    
    if (adminExists) {
      console.log('Admin user already exists! Email: admin@prepflow.com');
      process.exit();
    }

    await Student.create({
      fullName: 'Super Admin',
      email: 'admin@prepflow.com',
      password: 'adminpassword123',
      phone: '1234567890',
      role: 'admin'
    });

    console.log('✅ Admin user created successfully!');
    console.log('Email: admin@prepflow.com');
    console.log('Password: adminpassword123');
    process.exit();
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

seedAdmin();
