import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Course from './models/Course.js';
import CourseNote from './models/CourseNote.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/prepflow';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const DIRECTORY_PATH = '../pdfs';

const fileMappings = {
  'AIT313.pdf': 'AIT 313',
  'GNS302.pdf': 'COMMUNICATION SKILLS',
  'Cloud Computing.pdf': 'NETWORKING AND CLOUD COMPUTING',
  'lesson 3- Cloud services pricing.pdf': 'NETWORKING AND CLOUD COMPUTING',
  'lesson 4- On premise costing.pdf': 'NETWORKING AND CLOUD COMPUTING',
  'lesson 5- Total cost of ownership.pdf': 'NETWORKING AND CLOUD COMPUTING',
  'lesson 6- SETTING UP ORGANIZATION ACCOUNT.pdf': 'NETWORKING AND CLOUD COMPUTING',
  'lesson 7- CLOUD COMPUTING SECURITY (shared responsibility).pdf': 'NETWORKING AND CLOUD COMPUTING',
  'lesson 8- CLOUD COMPUTING SECURITY (How to Secure Data).pdf': 'NETWORKING AND CLOUD COMPUTING',
  'NCC-321- lesson 9- NETWORKING.pdf': 'NETWORKING AND CLOUD COMPUTING',
  'EED1.pdf': 'SOFTWARE AND WEB DEVELOPMENT',
  'EED2.pdf': 'SOFTWARE AND WEB DEVELOPMENT',
  'EED3.pdf': 'SOFTWARE AND WEB DEVELOPMENT',
  'EED4.pdf': 'SOFTWARE AND WEB DEVELOPMENT',
  'EED5.pdf': 'SOFTWARE AND WEB DEVELOPMENT',
  'EED6.pdf': 'SOFTWARE AND WEB DEVELOPMENT',
  'EED7.pdf': 'SOFTWARE AND WEB DEVELOPMENT'
};

async function processNotes() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Fetch all courses to match
    const courses = await Course.find({}).lean();

    const files = fs.readdirSync(DIRECTORY_PATH);

    for (const file of files) {
      if (file.startsWith('.')) continue; // ignore hidden files
      
      let targetCourseCode = fileMappings[file];
      if (!targetCourseCode) {
        console.warn(`No mapping found for ${file}. Skipping.`);
        continue;
      }

      let course = courses.find(c => c.title?.toUpperCase().includes(targetCourseCode.toUpperCase()));

      if (!course) {
        console.error(`Course not found for code/title: ${targetCourseCode} (file: ${file})`);
        continue;
      }

      let chapterName = file.replace('.pdf', '').replace('.pptx', '');
      const existingNote = await CourseNote.findOne({ course: course._id, chapterTitle: chapterName });
      if (existingNote) {
         console.log(`Note for ${course.title} -> ${chapterName} already exists. Skipping.`);
         continue;
      }

      console.log(`Processing ${file} for course ${course.title}...`);

      const filePath = path.join(DIRECTORY_PATH, file);
      const dataBuffer = fs.readFileSync(filePath);

      if (file.endsWith('.pptx')) {
         console.warn(`Skipping ${file} because PPTX is not natively supported by Gemini Vision API. Please convert to PDF.`);
         continue;
      }

      let mimeType = 'application/pdf';

      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `You are an AI tutor processing course material for ${course.title}. 
Below is a file containing the course material.
    
Task: Summarize and format this material into comprehensive Course Notes. 
Use headings, bullet points, and clean Markdown formatting. 
Keep all the important concepts intact. Do NOT use code blocks unless appropriate for algorithms.
Return ONLY the raw markdown text. Do not include markdown fences like \`\`\`markdown at the start or end.`;

      const filePart = {
        inlineData: {
          data: dataBuffer.toString("base64"),
          mimeType: mimeType
        }
      };

      let responseText = '';
      let retries = 10;
      while (retries > 0) {
          try {
              const result = await model.generateContent([prompt, filePart]);
              responseText = result.response.text().trim();
              break;
          } catch (err) {
              if (err.message.includes('429')) {
                  console.warn(`Rate limit hit (429) for file ${file}. Waiting 60 seconds... (${retries} retries left)`);
                  retries--;
                  if (retries === 0) throw err;
                  await new Promise(resolve => setTimeout(resolve, 60000));
              } else if (err.message.includes('503') || err.message.includes('500')) {
                  console.warn(`API Error for file ${file}: ${err.message}. Retrying in 10 seconds... (${retries} retries left)`);
                  retries--;
                  if (retries === 0) throw err;
                  await new Promise(resolve => setTimeout(resolve, 10000));
              } else {
                  throw err;
              }
          }
      }

      try {
          if (responseText.startsWith('```markdown')) {
              responseText = responseText.replace(/^```markdown\n?/, '').replace(/\n?```$/, '').trim();
          } else if (responseText.startsWith('```')) {
              responseText = responseText.replace(/^```\n?/, '').replace(/\n?```$/, '').trim();
          }

          let chapterName = file.replace('.pdf', '').replace('.pptx', '');
          
          const noteCount = await CourseNote.countDocuments({ course: course._id });
          
          const note = new CourseNote({
             course: course._id,
             chapterTitle: chapterName,
             content: responseText,
             order: noteCount + 1
          });
          
          await note.save();
          console.log(`Created new chapter note for ${course.title} -> ${chapterName}`);

      } catch (err) {
          console.error(`Error saving note for file ${file}:`, err.message);
      }
    }
    console.log('Finished processing all files.');
    process.exit(0);

  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

processNotes();
