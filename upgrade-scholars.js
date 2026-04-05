import 'dotenv/config';
import mongoose from 'mongoose';
import Student from './models/Student.js';

const upgradeScholars = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB... 🚀');

        const result = await Student.updateMany(
            { deviceInfo: { $exists: false } },
            { $set: { deviceInfo: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/Verified' } }
        );

        console.log(`Successfully upgraded ${result.modifiedCount} legacy scholars! 🏹`);
        process.exit();
    } catch (err) {
        console.error('Upgrade failed:', err);
        process.exit(1);
    }
};

upgradeScholars();
