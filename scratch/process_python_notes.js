import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GoogleAIFileManager } from '@google/generative-ai/server';
import Course from '../models/Course.js';
import CourseNote from '../models/CourseNote.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);

const pdfFiles = [
    'python.pdf', 'python2.pdf', 'python3.pdf', 'python4.pdf',
    'python5.pdf', 'python6.pdf', 'python7.pdf', 'python8.pdf'
];
const pdfsDir = path.join(__dirname, '..', '..', 'pdfs');

async function processNotes() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB.");

        const course = await Course.findOne({ title: "PYTHON PROGRAMMING" });
        if (!course) {
            console.error("PYTHON PROGRAMMING course not found!");
            process.exit(1);
        }

        console.log("Uploading PDFs to Gemini...");
        const uploadedFiles = [];
        for (const file of pdfFiles) {
            const filePath = path.join(pdfsDir, file);
            console.log(`Uploading ${file}...`);
            const uploadResult = await fileManager.uploadFile(filePath, {
                mimeType: 'application/pdf',
                displayName: file
            });
            uploadedFiles.push(uploadResult.file);
            console.log(`Uploaded ${file} as ${uploadResult.file.name}`);
        }

        console.log("Waiting for files to be ACTIVE...");
        for (const file of uploadedFiles) {
            let state = file.state;
            while (state === 'PROCESSING') {
                await new Promise(resolve => setTimeout(resolve, 3000));
                const f = await fileManager.getFile(file.name);
                state = f.state;
            }
            if (state !== 'ACTIVE') {
                console.error(`File ${file.name} failed to process. State: ${state}`);
                process.exit(1);
            }
        }
        console.log("All files are ACTIVE.");

        console.log("Prompting Gemini to extract notes...");
        const prompt = `
You are an expert Python programming instructor. 
I have uploaded multiple PDFs containing course materials (including handwritten and printed notes).
Please extract all the meaningful educational content and compile it into a comprehensive, well-structured set of course notes.
Break the content down into logical chapters (e.g., "1. Introduction to Python", "2. Data Types", "3. Control Structures", etc.).
Do not miss any important concepts, examples, or code snippets from the PDFs. Use markdown for the content.

Return ONLY a JSON array of chapter objects. Do not include markdown codeblocks around the JSON.
Format:
[
  {
    "chapterTitle": "1. Introduction to Python",
    "content": "Detailed markdown content with explanations and code examples here..."
  },
  ...
]`;

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        
        const fileParts = uploadedFiles.map(f => ({
            fileData: {
                mimeType: f.mimeType,
                fileUri: f.uri
            }
        }));

        const response = await model.generateContent({
            contents: [
                { role: "user", parts: [...fileParts, { text: prompt }] }
            ],
            generationConfig: { 
                temperature: 0.2,
                responseMimeType: "application/json"
            }
        });

        const responseText = response.response.text();
        let chapters;
        try {
            chapters = JSON.parse(responseText);
        } catch (e) {
            console.error("Failed to parse JSON response:", responseText);
            throw e;
        }

        console.log(`Extracted ${chapters.length} chapters.`);

        await CourseNote.deleteMany({ course: course._id });

        let order = 1;
        for (const chap of chapters) {
            await CourseNote.create({
                course: course._id,
                chapterTitle: chap.chapterTitle,
                content: chap.content,
                order: order++
            });
            console.log(`Saved chapter: ${chap.chapterTitle}`);
        }

        console.log("Successfully extracted and saved all notes.");
        
    } catch (err) {
        console.error("Error processing notes:", err);
        process.exitCode = 1;
    } finally {
        console.log("Cleaning up Gemini files...");
        if (typeof uploadedFiles !== 'undefined') {
            for (const file of uploadedFiles) {
                try {
                    await fileManager.deleteFile(file.name);
                    console.log(`Deleted ${file.name}`);
                } catch(e) {
                    // Ignore deletion errors
                }
            }
        }
        process.exit();
    }
}

processNotes();
