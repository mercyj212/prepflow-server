import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';

import Course from '../models/Course.js';
import CourseNote from '../models/CourseNote.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const API_KEY = process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY;
console.log(`Using Gemini API Key ending in: ...${API_KEY.slice(-6)}`);

const genAI = new GoogleGenerativeAI(API_KEY);
const fileManager = new GoogleAIFileManager(API_KEY);

const COURSE_ID = '6a685990145c0ad0eb287329';
const PDF_FILES = [
    'python.pdf', 'python2.pdf', 'python3.pdf', 'python4.pdf',
    'python5.pdf', 'python6.pdf', 'python7.pdf', 'python8.pdf'
];
const PDFS_DIR = path.join(__dirname, '..', '..', 'pdfs');

async function uploadAndWait(filename) {
    const filePath = path.join(PDFS_DIR, filename);
    console.log(`Uploading ${filename}...`);
    const result = await fileManager.uploadFile(filePath, {
        mimeType: 'application/pdf',
        displayName: filename
    });
    let file = result.file;
    process.stdout.write(`Waiting for ${filename} activation`);
    while (file.state === 'PROCESSING') {
        process.stdout.write('.');
        await new Promise(r => setTimeout(r, 4000));
        file = await fileManager.getFile(file.name);
    }
    console.log('');
    if (file.state !== 'ACTIVE') throw new Error(`${filename} failed processing`);
    console.log(`✔ ${filename} active.`);
    return file;
}

async function extractFullNotes() {
    const uploadedFiles = [];
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB.');

        const course = await Course.findById(COURSE_ID);
        if (!course) throw new Error('PYTHON PROGRAMMING course not found!');
        console.log(`Course: ${course.title}`);

        for (const pdf of PDF_FILES) {
            const file = await uploadAndWait(pdf);
            uploadedFiles.push(file);
        }

        const fileParts = uploadedFiles.map(f => ({
            fileData: { mimeType: f.mimeType, fileUri: f.uri }
        }));

        const prompt = `You are an expert Python programming lecturer preparing complete, detailed course notes from handwriting and printed slides uploaded in these 8 PDF files.

Organize the content STRICTLY into 9 well-structured, clear chapters based on the course outline:

1. Concept of Programming (Translators, Interpreters, Compilers, Assemblers, Software types, Algorithms, Flowcharts)
2. Python Data Types, Variables, Identifiers, Keywords, and Operators (Arithmetic, Relational, Logical, Assignment, Bitwise, Membership, Identity)
3. Python Boolean Values, Conditional Execution (if/elif/else), Loops (while/for), and List Processing
4. Python Functions, Tuples, Dictionaries, Sets, and Data Processing
5. Python Modules, Packages, Libraries, and PIP
6. Python Strings, String Methods, Indexing, Slicing, and Formatting
7. Concept of Object-Oriented Programming (OOP) in Python (Classes, Objects, Inheritance, Encapsulation, Polymorphism)
8. Working with Databases in Python (SQLite/MySQL connection, CRUD operations, SQL queries)
9. Data Analysis in Python (NumPy, Pandas, Matplotlib, Data Wrangling, Visualization)

REQUIREMENTS FOR EACH CHAPTER:
- Write comprehensive, clear markdown text.
- Include all handwritten code examples, math expressions, tables, and explanations found across the PDFs.
- Ensure code snippets use clean Markdown code blocks (\`\`\`python ... \`\`\`).
- Format headers, bullet points, and code blocks cleanly for student reading.

Return ONLY a JSON array of chapter objects. No markdown wrappers outside JSON.
Format:
[
  {
    "order": 1,
    "chapterTitle": "Chapter 1: Concept of Programming",
    "content": "# Chapter 1: Concept of Programming\\n\\nDetailed content here..."
  },
  ...
]`;

        console.log('\nPrompting Gemini to synthesize all 9 chapters from the 8 PDFs...');
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        
        let response;
        let retries = 0;
        while (retries < 6) {
            try {
                response = await model.generateContent({
                    contents: [{ role: 'user', parts: [...fileParts, { text: prompt }] }],
                    generationConfig: {
                        temperature: 0.2,
                        responseMimeType: 'application/json'
                    }
                });
                break;
            } catch (e) {
                if (e.status === 503 || e.status === 429) {
                    retries++;
                    console.log(`Gemini ${e.status} (High demand/quota). Retrying in 25s... (${retries}/6)`);
                    await new Promise(r => setTimeout(r, 25000));
                } else {
                    throw e;
                }
            }
        }

        if (!response) throw new Error('Failed to get response from Gemini after retries.');

        const rawText = response.response.text();
        let cleanedText = rawText.trim();
        if (cleanedText.startsWith('```')) {
            cleanedText = cleanedText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '').trim();
        }
        // Fix unescaped newlines/tabs inside JSON strings
        cleanedText = cleanedText.replace(/[\u0000-\u001F\u007F-\u009F]/g, (match) => {
            if (match === '\n') return '\\n';
            if (match === '\r') return '\\r';
            if (match === '\t') return '\\t';
            return '';
        });

        let chapters;
        try {
            chapters = JSON.parse(cleanedText);
        } catch (parseErr) {
            console.error('Initial JSON parse failed, trying fallback extraction...');
            // Fallback: extract json array with regex
            const match = rawText.match(/\[\s*\{[\s\S]*\}\s*\]/);
            if (match) {
                const safeStr = match[0].replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ');
                chapters = JSON.parse(safeStr);
            } else {
                throw parseErr;
            }
        }
        if (!Array.isArray(chapters)) throw new Error('Response is not an array');

        console.log(`\nGemini generated ${chapters.length} structured chapters.`);

        // Clear existing incomplete notes
        await CourseNote.deleteMany({ course: course._id });
        console.log('Cleared old course notes.');

        let count = 0;
        for (const chap of chapters) {
            await CourseNote.create({
                course: course._id,
                chapterTitle: chap.chapterTitle || `Chapter ${chap.order}`,
                content: chap.content || '',
                order: chap.order || (count + 1)
            });
            count++;
            console.log(`Saved: ${chap.chapterTitle}`);
        }

        console.log(`\n✅ SUCCESS! ${count} complete, well-arranged chapters saved to MongoDB.`);

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

extractFullNotes();
