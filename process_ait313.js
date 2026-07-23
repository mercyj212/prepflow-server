import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

import Course from './models/Course.js';
import Quiz from './models/Quiz.js';
import CourseNote from './models/CourseNote.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function run() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find AIT 313
    let course = await Course.findOne({ title: { $regex: /AIT 313/i } });
    if (!course) {
      course = await Course.findOne({ courseCode: { $regex: /AIT 313/i } });
    }

    if (!course) {
      console.log('Course AIT 313 not found.');
      process.exit(1);
    }

    console.log(`Found course: ${course.title}`);

    // Read PDF
    console.log('Reading AIT313.pdf...');
    const dataBuffer = fs.readFileSync('../pdfs/AIT313.pdf');
    
    // Call Gemini
    console.log('Calling Gemini to process PDF and generate 100 questions (this may take a minute)...');
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an AI tutor processing course material for AIT 313 (Artificial Intelligence). 
Below is the course PDF containing the course material.
    
Task 1: Summarize and format this material into comprehensive Course Notes. Use headings, bullet points, and clean Markdown formatting. Keep all the important concepts intact. Do NOT use code blocks unless appropriate for algorithms.
Task 2: Generate exactly 100 multiple-choice questions based ONLY on this text. Each question must have 4 options, with exactly 1 correct option. Include a short explanation.

You MUST return your response as a valid JSON object with the following schema:
{
  "notes": "markdown text here...",
  "questions": [
    {
      "text": "Question text...",
      "options": [
        {"text": "Option 1", "isCorrect": true},
        {"text": "Option 2", "isCorrect": false},
        {"text": "Option 3", "isCorrect": false},
        {"text": "Option 4", "isCorrect": false}
      ],
      "explanation": "Explanation here...",
      "subject": "Artificial Intelligence"
    }
  ]
}

DO NOT include markdown fences like \`\`\`json around your response. Return ONLY the raw JSON object. Ensure the JSON is properly escaped.`;

    const filePart = {
      inlineData: {
        data: dataBuffer.toString("base64"),
        mimeType: "application/pdf"
      }
    };

    const result = await model.generateContent([prompt, filePart]);
    const responseText = result.response.text().replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse JSON response from Gemini.', e);
      fs.writeFileSync('gemini_error_output.txt', responseText);
      console.log('Saved raw response to gemini_error_output.txt');
      process.exit(1);
    }

    // Save CourseNotes
    let note = await CourseNote.findOne({ course: course._id });
    if (note) {
      note.content = parsedData.notes;
      await note.save();
      console.log('Updated existing CourseNote.');
    } else {
      await CourseNote.create({
        course: course._id,
        content: parsedData.notes,
        topics: ['Introduction to AI', 'Core Concepts']
      });
      console.log('Created new CourseNote.');
    }

    // Save Quiz
    let quiz = await Quiz.findOne({ course: course._id, title: "AIT 313 Comprehensive Quiz" });
    if (quiz) {
      quiz.questions = parsedData.questions;
      await quiz.save();
      console.log(`Updated existing quiz with ${parsedData.questions.length} questions.`);
    } else {
      await Quiz.create({
        title: "AIT 313 Comprehensive Quiz",
        description: "A comprehensive practice exam based on the course materials.",
        course: course._id,
        questions: parsedData.questions,
        timeLimit: 120,
        isActive: true
      });
      console.log(`Created new quiz with ${parsedData.questions.length} questions.`);
    }

    console.log('Finished successfully.');
    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
