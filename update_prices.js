import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Course.js';

dotenv.config();

const updatePrices = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Update ALL courses to have a price of 1000
        const result = await Course.updateMany(
            {},
            { $set: { price: 1000 } }
        );

        console.log(`Successfully set price to 1000 for ${result.modifiedCount} courses.`);
        process.exit(0);
    } catch (error) {
        console.error('Error updating prices:', error);
        process.exit(1);
    }
};

updatePrices();
