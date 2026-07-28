import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';

import Course from '../models/Course.js';
import Quiz from '../models/Quiz.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Use the second key (fresh quota), fall back to primary if not set
const API_KEY = process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY;
console.log(`Using API key: ...${API_KEY.slice(-6)}`);

const genAI = new GoogleGenerativeAI(API_KEY);
const fileManager = new GoogleAIFileManager(API_KEY);

const COURSE_ID = '6a685990145c0ad0eb287329';
const QUIZ_ID = '6a691279ea83ad203d94f6ea'; // existing Python Programming Exam
const TARGET_QUESTIONS = 50;
const PDF_FILES = ['python3.pdf', 'python4.pdf'];
const PDFS_DIR = path.join(__dirname, '..', '..', 'pdfs');

async function uploadAndWait(filename) {
    const filePath = path.join(PDFS_DIR, filename);
    console.log(`Uploading ${filename}...`);
    const result = await fileManager.uploadFile(filePath, {
        mimeType: 'application/pdf',
        displayName: filename
    });
    let file = result.file;
    process.stdout.write(`Waiting for ${filename} to be active`);
    while (file.state === 'PROCESSING') {
        process.stdout.write('.');
        await new Promise(r => setTimeout(r, 4000));
        file = await fileManager.getFile(file.name);
    }
    console.log('');
    if (file.state !== 'ACTIVE') throw new Error(`${filename} failed: state=${file.state}`);
    console.log(`âœ” ${filename} ready (${file.name}).`);
    return file;
}

async function main() {
    const uploadedFiles = [];
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB.');

        const course = await Course.findById(COURSE_ID);
        if (!course) throw new Error('PYTHON PROGRAMMING course not found!');
        console.log(`Course: ${course.title}`);

        // Upload both PDFs
        for (const pdf of PDF_FILES) {
            const file = await uploadAndWait(pdf);
            uploadedFiles.push(file);
        }

        const fileParts = uploadedFiles.map(f => ({
            fileData: { mimeType: f.mimeType, fileUri: f.uri }
        }));

        // ONE single API call for all 50 questions
        const prompt = `You are an expert Python programming instructor creating a Computer Based Test (CBT).
Read the two Python course PDF files uploaded and generate exactly ${TARGET_QUESTIONS} unique multiple-choice questions.

RULES:
- Base every question strictly on content visible in the PDFs.
- Each question must have exactly 4 options, with exactly 1 correct answer.
- All 4 options must be roughly the same length â€” do NOT make the correct answer longer.
- Mix difficulty levels: easy, medium, and hard.
- Cover a variety of topics across both PDFs.

Return ONLY a raw JSON array of exactly ${TARGET_QUESTIONS} objects. No markdown, no code blocks, no explanation outside JSON.
Format:
[
  {
    "question": "Question text?",
    "options": [
      { "text": "Option A", "isCorrect": true },
      { "text": "Option B", "isCorrect": false },
      { "text": "Option C", "isCorrect": false },
      { "text": "Option D", "isCorrect": false }
    ],
    "explanation": "Brief reason why the correct answer is right."
  }
]`;

        console.log(`\nCalling Gemini for all ${TARGET_QUESTIONS} questions in one request...`);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        let response;
        try {
            response = await model.generateContent({
                contents: [{ role: 'user', parts: [...fileParts, { text: prompt }] }],
                generationConfig: {
                    temperature: 0.7,
                    responseMimeType: 'application/json'
                }
            });
        } catch (apiErr) {
            console.error('Gemini API call failed:');
            console.error('  Status :', apiErr.status);
            console.error('  Message:', apiErr.message);
            throw apiErr;
        }

        const rawText = response.response.text();
        const parsed = JSON.parse(rawText);
        if (!Array.isArray(parsed)) throw new Error('Response is not an array');
        console.log(`Gemini returned ${parsed.length} questions.`);

        // Map & validate
        const mapped = parsed
            .map(q => ({
                text: q.question || q.text || '',
                explanation: q.explanation || '',
                options: (q.options || []).map(o => ({
                    text: o.text || '',
                    isCorrect: !!o.isCorrect
                }))
            }))
            .filter(q => q.text && q.options.length === 4 && q.options.every(o => o.text));

        console.log(`${mapped.length} valid questions after filtering.`);

        if (mapped.length < 10) throw new Error(`Too few valid questions (${mapped.length}). Aborting save.`);

        // Append new questions to the existing quiz
        const quiz = await Quiz.findByIdAndUpdate(
            QUIZ_ID,
            { $push: { questions: { $each: mapped } } },
            { new: true }
        );

        if (!quiz) throw new Error(`Quiz ${QUIZ_ID} not found!`);

        console.log(`\nâœ… SUCCESS!`);
        console.log(`   Title    : ${quiz.title}`);
        console.log(`   New Qs added : ${mapped.length}`);
        console.log(`   Total Qs now : ${quiz.questions.length}`);
        console.log(`   Time     : ${quiz.timeLimit} minutes`);
        console.log(`   Quiz ID  : ${quiz._id}`);
        console.log(`   Visible  : ${quiz.isActive ? 'YES (live for users)' : 'NO'}`);

    } catch (err) {
        console.error('\nâœ˜ Fatal error:', err.message);
        process.exitCode = 1;
    } finally {
        // Clean up uploaded files
        for (const f of uploadedFiles) {
            try { await fileManager.deleteFile(f.name); } catch (_) {}
        }
        await mongoose.disconnect().catch(() => {});
        process.exit();
    }
}

main();

