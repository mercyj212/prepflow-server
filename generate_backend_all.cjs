require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');

const apiKey = process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY;
console.log(`Using API Key ending in ...${apiKey.slice(-6)}`);

const fileManager = new GoogleAIFileManager(apiKey);
const genAI = new GoogleGenerativeAI(apiKey);

const courseNoteSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    chapterTitle: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    order: { type: Number, required: true, default: 0 },
  },
  { timestamps: true }
);

const CourseNote = mongoose.models.CourseNote || mongoose.model("CourseNote", courseNoteSchema);

const delay = (ms) => new Promise(r => setTimeout(r, ms));

async function callWithRetry(fn, retries = 5, initialDelay = 5000) {
  let waitTime = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      if (err.message && (err.message.includes('429') || err.message.includes('Quota')) && i < retries - 1) {
        console.log(`  ⚠️ Rate limit hit (429). Retrying in ${Math.round(waitTime / 1000)}s (Attempt ${i + 1}/${retries})...`);
        await delay(waitTime);
        waitTime = Math.round(waitTime * 1.5);
      } else {
        throw err;
      }
    }
  }
}

async function uploadPdfFile(filePath, displayName) {
  console.log(`Uploading ${displayName}...`);
  const uploadRes = await fileManager.uploadFile(filePath, {
    mimeType: "application/pdf",
    displayName
  });
  let file = await fileManager.getFile(uploadRes.file.name);
  while (file.state === "PROCESSING") {
    process.stdout.write(".");
    await delay(2500);
    file = await fileManager.getFile(uploadRes.file.name);
  }
  console.log(`\nPDF File ${file.displayName} uploaded and ready.`);
  return { fileData: { mimeType: file.mimeType, fileUri: file.uri } };
}

async function main() {
  try {
    // ── 1. Database Connection & Course Setup ─────────────────────────────
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const swdDeptId = new mongoose.Types.ObjectId('69f329129ff6793adc556004'); // Software and Web Development (SWD)

    let course = await db.collection('courses').findOne({
      $or: [
        { title: 'BACKEND WEB DEVELOPMENT' },
        { title: 'BACKEND DEVELOPMENT' }
      ]
    });

    if (!course) {
      const newCourseDoc = {
        title: 'BACKEND WEB DEVELOPMENT',
        description: 'Comprehensive Backend Web Development course based on Backend1.pdf, Backend2.pdf, and Backend3.pdf covering Node.js, Express.js, MongoDB/Mongoose, REST APIs, Authentication (JWT/Bcrypt), API Security, and Deployment.',
        department: swdDeptId,
        level: 'HND1',
        path: 'polytechnic',
        semester: 'Second Semester',
        price: 1000,
        materials: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const res = await db.collection('courses').insertOne(newCourseDoc);
      course = await db.collection('courses').findOne({ _id: res.insertedId });
      console.log(`✅ Created course: "${course.title}" [ID: ${course._id}]`);
    } else {
      await db.collection('courses').updateOne(
        { _id: course._id },
        {
          $set: {
            department: swdDeptId,
            level: 'HND1',
            path: 'polytechnic',
            semester: 'Second Semester',
            price: 1000
          }
        }
      );
      course = await db.collection('courses').findOne({ _id: course._id });
      console.log(`✅ Configured course: "${course.title}" [ID: ${course._id}]`);
    }

    // ── 2. PDF Context Setup (Backend 1, 2, and 3) ────────────────────────
    const pdf1Path = path.join(__dirname, '..', 'pdfs', 'Backend1.pdf');
    const pdf2Path = path.join(__dirname, '..', 'pdfs', 'Backend2.pdf');
    const pdf3Path = path.join(__dirname, '..', 'pdfs', 'Backend3.pdf');

    const filePart1 = await uploadPdfFile(pdf1Path, "Backend1.pdf");
    const filePart2 = await uploadPdfFile(pdf2Path, "Backend2.pdf");
    const filePart3 = await uploadPdfFile(pdf3Path, "Backend3.pdf");

    const pdfFileParts = [filePart1, filePart2, filePart3];

    // ── 3. Generate Course Notes (8 Chapters) ────────────────────────────
    console.log('\nGenerating 8 Chapters of Course Notes directly from Backend 1, 2 & 3 PDFs...');
    const notesModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              chapterTitle: { type: "string" },
              content: { type: "string" }
            },
            required: ["chapterTitle", "content"]
          }
        }
      }
    });

    const notePrompts = [
      "Based STRICTLY on Backend1.pdf, Backend2.pdf, and Backend3.pdf provided, generate chapters 1 to 4 of Backend Web Development textbook notes: 1. Client-Server Architecture, HTTP Protocol & REST Principles, 2. Node.js Core Architecture, Event Loop & Modules, 3. Building Web Servers & REST APIs with Express.js, 4. Databases, MongoDB & Mongoose Schemas & CRUD Operations. Include full code snippets, markdown, diagrams in text, and exam notes.",
      "Based STRICTLY on Backend1.pdf, Backend2.pdf, and Backend3.pdf provided, generate chapters 5 to 8 of Backend Web Development textbook notes: 5. Authentication & Authorization (Password Hashing, Bcrypt & JWT Tokens), 6. Data Validation, Error Handling & API Security (CORS, Rate Limiting, Helmet), 7. Advanced Backend Concepts (File Uploads, Multer & Middleware Chains), 8. Environment Configuration, Production Deployment & API Testing. Include full code snippets, markdown, and exam notes."
    ];

    const allNotes = [];
    for (let g = 0; g < notePrompts.length; g++) {
      console.log(`Generating Notes Part ${g + 1}/2...`);
      await delay(3000);
      const res = await callWithRetry(() => notesModel.generateContent([...pdfFileParts, { text: notePrompts[g] }]));
      const notesBatch = JSON.parse(res.response.text().trim());
      allNotes.push(...notesBatch);
    }

    console.log(`Saving ${allNotes.length} note chapters to MongoDB...`);
    await CourseNote.deleteMany({ course: course._id });
    for (let i = 0; i < allNotes.length; i++) {
      await CourseNote.create({
        course: course._id,
        chapterTitle: allNotes[i].chapterTitle,
        content: allNotes[i].content,
        order: i + 1,
      });
    }
    console.log('✅ Course notes saved successfully!');

    // ── 4. Generate 150 CBT Questions (3 batches of 50) ──────────────────
    console.log('\nGenerating 150 CBT Practice Questions (3 batches of 50) strictly from Backend 1, 2 & 3 PDFs...');

    const questionModel = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              text: { type: "string" },
              options: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    text: { type: "string" },
                    isCorrect: { type: "boolean" }
                  },
                  required: ["text", "isCorrect"]
                }
              },
              explanation: { type: "string" },
              subject: { type: "string" }
            },
            required: ["text", "options", "explanation", "subject"]
          }
        }
      }
    });

    const topics = [
      "Backend PDF Material 1: Client-Server Architecture, HTTP Methods & Status Codes, Node.js Fundamentals, CommonJS vs ES Modules, Event Loop, and Express.js Server Setup",
      "Backend PDF Material 2: Express.js Middleware Functions, Request/Response Objects, REST API Routing, MongoDB Connection, Mongoose Schemas, Models, and CRUD Operations",
      "Backend PDF Material 3: Authentication Mechanisms, Password Hashing with Bcrypt, JSON Web Tokens (JWT), Authorization Headers, API Security (CORS, Rate Limiting, Helmet), Environment Variables, and Deployment"
    ];

    const allQuestions = [];
    for (let batch = 0; batch < 3; batch++) {
      console.log(`Generating Question Batch ${batch + 1}/3 (50 questions on: ${topics[batch]})...`);
      await delay(3000);

      const qPrompt = `
You are an expert Backend Web Development university professor and Senior Full-Stack Engineer.
Using the content from Backend1.pdf, Backend2.pdf, and Backend3.pdf, generate EXACTLY 50 unique multiple-choice questions focusing on: ${topics[batch]}.

Requirements:
- Each question MUST have exactly 4 options.
- Exactly ONE option MUST have "isCorrect": true, and the other 3 MUST be false.
- Provide a clear, detailed explanation demonstrating exact code syntax, error causes, or architecture mechanics directly from the text.
- Do NOT repeat questions from previous batches.
`;

      const qRes = await callWithRetry(() => questionModel.generateContent([...pdfFileParts, { text: qPrompt }]));
      const batchQs = JSON.parse(qRes.response.text().trim());

      console.log(`  Batch ${batch + 1} generated ${batchQs.length} questions.`);
      allQuestions.push(...batchQs);
    }

    console.log(`\nTotal questions generated across all batches: ${allQuestions.length}`);

    // ── 5. Save Quiz Document in MongoDB ─────────────────────────────────
    console.log('Saving Quiz document to MongoDB...');
    await db.collection('quizzes').deleteMany({ course: course._id });

    const quizDoc = {
      title: "BACKEND WEB DEVELOPMENT CBT PRACTICE EXAM",
      description: "Comprehensive 150-question practice exam created directly from Backend 1, 2 & 3 textbooks (Node.js, Express.js, MongoDB/Mongoose, REST APIs, Authentication, Security, and Deployment) for Software & Web Development (SWD). (60 random questions per 30-minute exam session).",
      course: course._id,
      questions: allQuestions,
      timeLimit: 30,
      duration: 30,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const quizRes = await db.collection('quizzes').insertOne(quizDoc);
    console.log(`✅ Successfully created Quiz ID: ${quizRes.insertedId}`);

    // ── 6. Auto-Grant Access to Approved Users ────────────────────────────
    const approvedEmails = [
      'jaymercy510@gmail.com',
      'franklinpeter2020@gmail.com',
      'ebubeonuorahobi@gmail.com',
      'perryxau@gmail.com',
      'danieleneluwe@gmail.com'
    ];

    const approvedStudents = await db.collection('students').find({
      email: { $in: approvedEmails }
    }).toArray();

    for (const s of approvedStudents) {
      await db.collection('courseaccesses').updateOne(
        { student: s._id, course: course._id },
        {
          $set: {
            student: s._id,
            course: course._id,
            accessToken: crypto.randomBytes(16).toString('hex'),
            isActive: true,
            isUsed: true,
            firstUsedAt: new Date(),
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
    }
    console.log(`✅ Auto-granted Backend Web Development access to ${approvedStudents.length} approved users.`);

    // ── 7. Verification ──────────────────────────────────────────────────
    const finalQuiz = await db.collection('quizzes').findOne({ _id: quizRes.insertedId });
    console.log('\n================ VERIFICATION ================');
    console.log(`Course Title: ${course.title}`);
    console.log(`Department:   Software and Web Development (SWD)`);
    console.log(`Level:        ${course.level}`);
    console.log(`Semester:     ${course.semester}`);
    console.log(`Quiz Title:   ${finalQuiz.title}`);
    console.log(`Total Qs:     ${finalQuiz.questions?.length}`);
    console.log(`Time Limit:   ${finalQuiz.timeLimit} minutes`);
    console.log(`Sources Used: Backend1.pdf, Backend2.pdf & Backend3.pdf`);
    console.log('==============================================');

    console.log('\n🎉 BACKEND WEB DEVELOPMENT SET UP SUCCESSFULLY!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ An error occurred:', error.message || error);
    process.exit(1);
  }
}

main();
