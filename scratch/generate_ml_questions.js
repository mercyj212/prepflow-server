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

const API_KEY = process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY;
console.log(`Using API key: ...${API_KEY.slice(-6)}`);

const genAI = new GoogleGenerativeAI(API_KEY);
const fileManager = new GoogleAIFileManager(API_KEY);

const COURSE_ID = '6a69267104f34b655891d2a6'; // MACHINE LEARNING course ID
const TARGET_QUESTIONS = 100;
const PDF_FILES = ['Machine Learning.pdf'];
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
    console.log(`✔ ${filename} ready (${file.name}).`);
    return file;
}

async function main() {
    const uploadedFiles = [];
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB.');

        const course = await Course.findById(COURSE_ID);
        if (!course) throw new Error('MACHINE LEARNING course not found!');
        console.log(`Course: ${course.title} (${course._id})`);

        for (const pdf of PDF_FILES) {
            const file = await uploadAndWait(pdf);
            uploadedFiles.push(file);
        }

        const fileParts = uploadedFiles.map(f => ({
            fileData: { mimeType: f.mimeType, fileUri: f.uri }
        }));

        const prompt = `You are an expert Machine Learning instructor creating a Computer Based Test (CBT).
Read the uploaded Machine Learning PDF document carefully and generate exactly ${TARGET_QUESTIONS} unique multiple-choice questions.

RULES:
- Every question MUST be based strictly on content from the uploaded Machine Learning PDF.
- Cover all key topics: Supervised Learning, Unsupervised Learning, Regression, Classification, Clustering, Neural Networks, Model Evaluation, Cross-Validation, Overfitting/Underfitting, Hyperparameters, Feature Engineering, etc.
- Each question must have exactly 4 options with exactly 1 correct answer.
- All 4 options MUST be roughly equal in length and detail.
- Mix difficulty levels: 30% easy, 40% medium, 30% hard.

Return ONLY a raw JSON array of exactly ${TARGET_QUESTIONS} objects. No markdown wrappers.
Format:
[
  {
    "question": "Question text here?",
    "options": [
      { "text": "Option A", "isCorrect": true },
      { "text": "Option B", "isCorrect": false },
      { "text": "Option C", "isCorrect": false },
      { "text": "Option D", "isCorrect": false }
    ],
    "explanation": "Brief explanation of why the answer is correct."
  }
]`;

        console.log(`\nCalling Gemini to generate ${TARGET_QUESTIONS} Machine Learning questions...`);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        let response;
        let retries = 0;
        while (retries < 5) {
            try {
                response = await model.generateContent({
                    contents: [{ role: 'user', parts: [...fileParts, { text: prompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        responseMimeType: 'application/json'
                    }
                });
                break;
            } catch (err) {
                if (err.status === 503 || err.status === 429) {
                    retries++;
                    console.log(`Gemini ${err.status}. Waiting 25s before retry ${retries}/5...`);
                    await new Promise(r => setTimeout(r, 25000));
                } else {
                    throw err;
                }
            }
        }

        if (!response) throw new Error('No response received from Gemini.');

        const rawText = response.response.text();
        let cleanedText = rawText.trim();
        if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
        }
        cleanedText = cleanedText.replace(/[\u0000-\u001F\u007F-\u009F]/g, (match) => {
            if (match === '\n') return '\\n';
            if (match === '\r') return '\\r';
            if (match === '\t') return '\\t';
            return '';
        });

        let parsed;
        try {
            parsed = JSON.parse(cleanedText);
        } catch (e) {
            const match = rawText.match(/\[\s*\{[\s\S]*\}\s*\]/);
            if (match) {
                parsed = JSON.parse(match[0].replace(/[\u0000-\u001F\u007F-\u009F]/g, ' '));
            } else {
                throw e;
            }
        }

        console.log(`Gemini returned ${parsed.length} questions.`);

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

        await Quiz.deleteMany({ course: course._id });
        const quiz = await Quiz.create({
            course: course._id,
            title: 'Machine Learning Exam',
            questions: mapped,
            timeLimit: 60,
            isActive: true
        });

        console.log(`\n✅ SUCCESS!`);
        console.log(`   Title    : ${quiz.title}`);
        console.log(`   Questions: ${quiz.questions.length}`);
        console.log(`   Time     : ${quiz.timeLimit} minutes`);
        console.log(`   Quiz ID  : ${quiz._id}`);
        console.log(`   Visible  : ${quiz.isActive ? 'YES (live for users)' : 'NO'}`);

    } catch (err) {
        console.error('Fatal error:', err.message);
        process.exitCode = 1;
    } finally {
        for (const f of uploadedFiles) {
            try { await fileManager.deleteFile(f.name); } catch (_) {}
        }
        await mongoose.disconnect().catch(() => {});
        process.exit();
    }
}

main();
