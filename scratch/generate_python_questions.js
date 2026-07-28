import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';

import Course from '../models/Course.js';
import CourseNote from '../models/CourseNote.js';
import Quiz from '../models/Quiz.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function callGeminiWithRetry(prompt) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    let retries = 0;
    while (retries < 8) {
        try {
            const response = await model.generateContent({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    responseMimeType: "application/json"
                }
            });
            return response.response.text();
        } catch (e) {
            if (e.status === 429 || e.status === 503) {
                const waitSecs = e.status === 429 ? 60 : 30;
                console.log(`Error ${e.status}, waiting ${waitSecs}s... (retry ${retries + 1}/8)`);
                await new Promise(r => setTimeout(r, waitSecs * 1000));
                retries++;
            } else {
                throw e;
            }
        }
    }
    throw new Error("Max retries exceeded");
}

async function generateQuestions() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.");

        const course = await Course.findOne({ title: "PYTHON PROGRAMMING" });
        if (!course) {
            console.error("PYTHON PROGRAMMING course not found!");
            process.exit(1);
        }

        const notes = await CourseNote.find({ course: course._id }).sort({ order: 1 });
        if (notes.length === 0) {
            console.error("No notes found for this course!");
            process.exit(1);
        }

        console.log(`Found ${notes.length} chapters.`);
        console.log("Deleting existing quizzes for this course...");
        await Quiz.deleteMany({ course: course._id });

        const TARGET_QUESTIONS = 60;
        const BATCH_SIZE = 20; // small enough to avoid token limits
        let allQuestions = [];
        let chapIndex = 0;

        while (allQuestions.length < TARGET_QUESTIONS) {
            const chap = notes[chapIndex % notes.length];
            const remaining = TARGET_QUESTIONS - allQuestions.length;
            const numToGenerate = Math.min(BATCH_SIZE, remaining);

            console.log(`Generating ${numToGenerate} questions from "${chap.chapterTitle}" (Total so far: ${allQuestions.length}/${TARGET_QUESTIONS})...`);

            const prompt = `
You are an expert Python programming instructor creating a Computer Based Test (CBT).
Using ONLY the course chapter provided below, generate exactly ${numToGenerate} unique multiple-choice questions.

CRITICAL BALANCING RULE: All 4 options for each question MUST be roughly the same length and level of detail. Do not make the correct answer noticeably longer than the incorrect options.

Return ONLY a JSON array. No markdown, no code blocks, just raw JSON.
Format:
[
  {
    "question": "Question text here?",
    "options": [
      { "text": "Option A text", "isCorrect": true },
      { "text": "Option B text", "isCorrect": false },
      { "text": "Option C text", "isCorrect": false },
      { "text": "Option D text", "isCorrect": false }
    ],
    "explanation": "Brief explanation of why Option A is correct."
  }
]

CHAPTER: ${chap.chapterTitle}
${chap.content.substring(0, 8000)}
`;

            try {
                const responseText = await callGeminiWithRetry(prompt);
                const parsed = JSON.parse(responseText);
                if (!Array.isArray(parsed)) throw new Error("Not an array");
                allQuestions = allQuestions.concat(parsed);
                console.log(`Added ${parsed.length} questions. Total: ${allQuestions.length}`);
            } catch (e) {
                console.error("Failed for this batch:", e.message);
            }

            chapIndex++;
            // pause between calls
            if (allQuestions.length < TARGET_QUESTIONS) {
                console.log("Waiting 12 seconds before next batch...");
                await new Promise(r => setTimeout(r, 45000));
            }
        }

        // Trim to exactly 200 and remap field names to match the Quiz schema
        if (allQuestions.length > TARGET_QUESTIONS) {
            allQuestions = allQuestions.sort(() => 0.5 - Math.random()).slice(0, TARGET_QUESTIONS);
        }

        // Remap: AI returns { question, options, explanation } but schema needs { text, options, explanation }
        const mappedQuestions = allQuestions
            .map(q => ({
                text: q.question || q.text || "",
                explanation: q.explanation || "",
                options: (q.options || []).map(o => ({
                    text: o.text || "",
                    isCorrect: !!o.isCorrect
                }))
            }))
            .filter(q => q.text && q.options.length === 4 && q.options.every(o => o.text));

        console.log(`Saving ${mappedQuestions.length} valid questions...`);
        const quiz = await Quiz.create({
            course: course._id,
            title: "Python Programming Comprehensive Exam",
            questions: mappedQuestions,
            timeLimit: 30,
            isActive: true
        });

        console.log(`SUCCESS! Created quiz "${quiz.title}" with ${quiz.questions.length} questions.`);
        process.exit(0);

    } catch (err) {
        console.error("Fatal error:", err);
        process.exit(1);
    }
}

generateQuestions();
