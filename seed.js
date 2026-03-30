import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from './models/Course.js';
import Quiz from './models/Quiz.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI);

const seedData = async () => {
  try {
    await Course.deleteMany();
    await Quiz.deleteMany();

    const course = await Course.create({
      title: 'INTRODUCTION TO VUE 3',
      description: 'Learn the basics of Vue 3 Composition API.',
    });

    await Quiz.create({
      title: 'Vue 3 Basics Assessment',
      description: 'A simple 3-question quiz to test your Vue 3 knowledge.',
      course: course._id,
      timeLimit: 10,
      questions: [
        {
          text: 'What is the primary way to manage reactive state in Vue 3?',
          options: [
            { text: 'useState', isCorrect: false },
            { text: 'ref and reactive', isCorrect: true },
            { text: 'setState', isCorrect: false },
            { text: 'data()', isCorrect: false },
          ]
        },
        {
          text: 'Which lifecycle hook runs first?',
          options: [
            { text: 'onMounted', isCorrect: false },
            { text: 'setup', isCorrect: true },
            { text: 'onUnmounted', isCorrect: false },
            { text: 'created', isCorrect: false },
          ]
        },
        {
          text: 'How do you loop through an array in a Vue template?',
          options: [
            { text: 'v-for', isCorrect: true },
            { text: 'ng-repeat', isCorrect: false },
            { text: '{array.map()}', isCorrect: false },
            { text: 'v-loop', isCorrect: false },
          ]
        }
      ]
    });

    console.log('Dummy Course and Quiz inserted successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
