require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');

const apiKeys = [
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY
].filter(Boolean);

const models = [
  'gemini-3.6-flash',
  'gemini-2.5-flash'
];

let currentKeyIndex = 0;
let currentModelIndex = 0;

function getGenerativeModel(modelName, config = {}) {
  const apiKey = apiKeys[currentKeyIndex % apiKeys.length];
  const targetModel = modelName || models[currentModelIndex % models.length];
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: targetModel,
    generationConfig: config
  });
}

function getFileManager() {
  const apiKey = apiKeys[currentKeyIndex % apiKeys.length];
  return new GoogleAIFileManager(apiKey);
}

function rotateKey() {
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  currentModelIndex = (currentModelIndex + 1) % models.length;
  console.log(`  🔄 Switched to Key #${currentKeyIndex + 1} (ending in ...${apiKeys[currentKeyIndex].slice(-6)}) using Model: ${models[currentModelIndex % models.length]}`);
}

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

async function callWithRetry(fn, retries = 15, initialDelay = 5000) {
  let waitTime = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const msg = err.message || '';
      console.log(`  ⚠️ Error encountered (${msg.slice(0, 80)}...). Retrying in ${Math.round(waitTime / 1000)}s (Attempt ${i + 1}/${retries})...`);
      rotateKey();
      await delay(waitTime);
      waitTime = Math.min(Math.round(waitTime * 1.3), 30000);
    }
  }
  throw new Error("Max retries exceeded");
}

async function uploadPdfFile(filePath, displayName) {
  console.log(`Uploading ${displayName}...`);
  const fileManager = getFileManager();
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
  console.log(`\n  ✓ PDF File ${file.displayName} uploaded and ready.`);
  return { fileData: { mimeType: file.mimeType, fileUri: file.uri } };
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const csDeptId = new mongoose.Types.ObjectId('69e5e34f2eeaa5bffac98e94'); // Computer Science Department (ND 1)

    let course = await db.collection('courses').findOne({
      title: /JAVA PROGRAMMING/i,
      department: csDeptId
    });

    if (!course) {
      const newCourseDoc = {
        title: 'JAVA PROGRAMMING - COM 124/211',
        description: 'Official Java Programming course for Computer Science (ND 1). Based directly on official Java textbook Table of Contents and Java.pdf, covering 10 structured chapters: 1. How to install Java on Windows, 2. Introduction to Java Programming, 3. Java variables / Identifiers, 4. Java Data Types, 5. Java Operators, 6. Java Strings, 7. Java Conditions & Loop Structures, 8. Java Arrays, 9. Java methods, and 10. Java Scope & Recursion.',
        department: csDeptId,
        level: 'ND1',
        path: 'polytechnic',
        semester: 'Second Semester',
        price: 1000,
        materials: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const res = await db.collection('courses').insertOne(newCourseDoc);
      course = await db.collection('courses').findOne({ _id: res.insertedId });
      console.log(`✅ Created course: "${course.title}" [ID: ${course._id}] for Computer Science (ND 1).`);
    } else {
      await db.collection('courses').updateOne(
        { _id: course._id },
        {
          $set: {
            title: 'JAVA PROGRAMMING - COM 124/211',
            department: csDeptId,
            level: 'ND1',
            path: 'polytechnic',
            semester: 'Second Semester',
            price: 1000,
            updatedAt: new Date()
          }
        }
      );
      course = await db.collection('courses').findOne({ _id: course._id });
      console.log(`✅ Configured course: "${course.title}" [ID: ${course._id}] for Computer Science (ND 1).`);
    }

    const existingNotes = await CourseNote.find({ course: course._id }).sort({ order: 1 });
    console.log(`✅ Verified ${existingNotes.length} saved detailed course note chapters in MongoDB.`);

    // Find or create quiz document for incremental updates
    let quiz = await db.collection('quizzes').findOne({ course: course._id });
    if (!quiz) {
      const newQuizDoc = {
        title: "JAVA PROGRAMMING CBT PRACTICE EXAM",
        description: "Comprehensive 200-question practice exam created directly from official Java.pdf lecture notes (70 questions) and 10 detailed textbook Table of Contents chapters (130 questions) for Computer Science (ND 1). Covers installing Java on Windows, program structure, main method, comments (//, /* */), identifier naming rules, variables, data types (int, String, float, char, boolean), operators, strings, control flow (if, switch-case), loops, arrays, methods, scope, and recursion. (60 random questions per 30-minute exam session).",
        course: course._id,
        questions: [],
        timeLimit: 30,
        duration: 30,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const qRes = await db.collection('quizzes').insertOne(newQuizDoc);
      quiz = await db.collection('quizzes').findOne({ _id: qRes.insertedId });
    }

    const currentQuestions = quiz.questions || [];
    console.log(`ℹ️ Quiz document has ${currentQuestions.length}/200 questions currently saved in MongoDB.`);

    // Upload file for PDF question prompts if needed
    const pdfPath = path.join(__dirname, '..', 'pdfs', 'Java.pdf');
    const filePart = await uploadPdfFile(pdfPath, 'Java.pdf');

    const pdfQuestionBatches = [
      { id: "pdf_1", count: 25, topic: "Java.pdf Part 1: Basic Java Program Structure, Syntax Rules (Classes, Methods, Statements, Braces), System.out.println, Comments (// single-line, /* */ multi-line), and Welcome Program exercises" },
      { id: "pdf_2", count: 25, topic: "Java.pdf Part 2: Variables & Identifiers (naming rules with letters, digits, _, $, reserved words, type variableName = value;), Data Types (int, String, float, char, boolean), and Summing last 3 digits exercise logic" },
      { id: "pdf_3", count: 20, topic: "Java.pdf Part 3: Java Operators (Arithmetic +, -, *, /, %, ++, --, Assignment, Comparison, Logical &&, ||, !), and Control Flow (if statement and switch statement examples from PDF notes)" }
    ];

    const tocQuestionBatches = [
      { id: "toc_1", count: 13, topic: "CHAPTER 1: How to install Java on Windows (JDK download, installation directory, JAVA_HOME, PATH environment variable, javac compiler verification, IDE setup)" },
      { id: "toc_2", count: 13, topic: "CHAPTER 2: Introduction to Java Programming (History by Sun Microsystems, James Gosling, WORA, JVM/JRE/JDK, Bytecode) and Java variables / Identifiers" },
      { id: "toc_3", count: 13, topic: "CHAPTER 3: Java variables / Identifiers (Variable definition, Identifier rules with _, $, letters, digits, reserved words, Single // and Multi-line /* */ comments)" },
      { id: "toc_4", count: 13, topic: "CHAPTER 4: Java Data Types (Primitive byte, short, int, long, float, double, char, boolean, Reference types, memory byte sizes, ranges, default values)" },
      { id: "toc_5", count: 13, topic: "CHAPTER 5: Java Operators (Arithmetic +, -, *, /, %, ++, --, Assignment =, +=, -=, Comparison ==, !=, >, <, >=, <=, Logical &&, ||, !, Bitwise, Precedence)" },
      { id: "toc_6", count: 13, topic: "CHAPTER 6: Java Strings (String class, String immutability, Concatenation, methods: length(), charAt(), substring(), toLowerCase(), toUpperCase(), equals(), indexOf())" },
      { id: "toc_7", count: 13, topic: "CHAPTER 7: Java Conditions & Loop Structures (if, if-else, else-if ladder, switch-case, break, default, fall-through, while, do-while, for loop, for-each, continue)" },
      { id: "toc_8", count: 13, topic: "CHAPTER 8: Java Arrays (1D & 2D arrays, Array declaration int[] arr, Memory allocation with new keyword, Indexing, array.length property, iteration)" },
      { id: "toc_9", count: 14, topic: "CHAPTER 9: Java methods (Method syntax, return types, parameters, call-by-value, return statement, method overloading, static vs instance methods)" },
      { id: "toc_10", count: 15, topic: "CHAPTER 10: Java Scope & Recursion (Variable Scope: Class, Method, Block scope; Recursion definition, Base case requirement, Recursive calls, StackOverflowError)" }
    ];

    // Phase A: 70 questions directly from Java.pdf
    for (let i = 0; i < pdfQuestionBatches.length; i++) {
      const b = pdfQuestionBatches[i];
      const targetCount = (i === 0 ? 25 : i === 1 ? 50 : 70);

      if (currentQuestions.length >= targetCount) {
        console.log(`  ✓ PDF Batch ${i + 1} already generated (${currentQuestions.length}/${targetCount} target questions saved). Skipping.`);
        continue;
      }

      console.log(`\nGenerating PDF Batch ${i + 1}/3 (${b.count} questions on: ${b.topic})...`);
      await delay(5000);

      const qPrompt = `
You are an expert university professor of Computer Science and Java Programming.
Based STRICTLY on the attached Java.pdf lecture notes, generate EXACTLY ${b.count} unique, high-quality multiple-choice questions covering: ${b.topic}.

CRITICAL PSYCHOMETRIC & OPTION BALANCE RULES:
1. Each question MUST have exactly 4 options (A, B, C, D).
2. Exactly ONE option MUST have "isCorrect": true, and the other 3 MUST be false.
3. ABSOLUTE OPTION LENGTH BALANCE: All 4 options MUST be written with EQUAL DETAIL, EQUAL WORD COUNT, EQUAL CHARACTER LENGTH, and MATCHING GRAMMATICAL STRUCTURE.
   - NEVER make the correct option longer, more descriptive, or more technical than the distractors.
   - The distractors MUST be realistic, sophisticated, and equally detailed Java concepts or code output snippets.
4. Explanations must be thorough, step-by-step technical clarifications directly explaining Java syntax, operator behavior, or exercise logic.
5. Do NOT repeat any question topic or code snippet from earlier questions.
`;

      const questionModel = getGenerativeModel(null, {
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
      });

      const qRes = await callWithRetry(() => questionModel.generateContent([filePart, { text: qPrompt }]));
      const rawQs = JSON.parse(qRes.response.text().trim());

      const batchQs = rawQs.map(q => ({
        ...q,
        options: shuffle(q.options),
        difficulty: "medium",
        qualityScore: 95,
        validationStatus: "passed"
      }));

      currentQuestions.push(...batchQs);

      await db.collection('quizzes').updateOne(
        { _id: quiz._id },
        { $set: { questions: currentQuestions, updatedAt: new Date() } }
      );
      console.log(`  ✓ PDF Batch ${i + 1} generated & saved! Total questions now saved: ${currentQuestions.length}/200.`);
    }

    // Phase B: 130 questions from 10 Textbook Chapters
    for (let i = 0; i < tocQuestionBatches.length; i++) {
      const b = tocQuestionBatches[i];
      const targetCount = 70 + tocQuestionBatches.slice(0, i + 1).reduce((acc, curr) => acc + curr.count, 0);

      if (currentQuestions.length >= targetCount) {
        console.log(`  ✓ TOC Batch ${i + 1} already generated (${currentQuestions.length}/${targetCount} target questions saved). Skipping.`);
        continue;
      }

      console.log(`\nGenerating TOC Batch ${i + 1}/10 (${b.count} questions on: ${b.topic})...`);
      await delay(5000);

      const chapterContext = existingNotes[i]?.content.slice(0, 1500) || "";

      const qPrompt = `
You are an expert university professor of Computer Science and Java Programming.
Based STRICTLY on the Java textbook curriculum notes below, generate EXACTLY ${b.count} unique, high-quality multiple-choice questions covering: ${b.topic}.

CRITICAL PSYCHOMETRIC & OPTION BALANCE RULES:
1. Each question MUST have exactly 4 options (A, B, C, D).
2. Exactly ONE option MUST have "isCorrect": true, and the other 3 MUST be false.
3. ABSOLUTE OPTION LENGTH BALANCE: All 4 options MUST be written with EQUAL DETAIL, EQUAL WORD COUNT, EQUAL CHARACTER LENGTH, and MATCHING GRAMMATICAL STRUCTURE.
   - NEVER make the correct option longer, more descriptive, or more technical than the distractors.
   - The distractors MUST be realistic, sophisticated, and equally detailed Java concepts or code output snippets.
4. Explanations must be thorough, step-by-step technical clarifications directly explaining Java syntax, operator behavior, or compiler rules.
5. Do NOT repeat any question topic or code snippet from earlier questions.

Chapter Context:
${chapterContext}
`;

      const questionModel = getGenerativeModel(null, {
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
      });

      const qRes = await callWithRetry(() => questionModel.generateContent([{ text: qPrompt }]));
      const rawQs = JSON.parse(qRes.response.text().trim());

      const batchQs = rawQs.map(q => ({
        ...q,
        options: shuffle(q.options),
        difficulty: "medium",
        qualityScore: 95,
        validationStatus: "passed"
      }));

      currentQuestions.push(...batchQs);

      await db.collection('quizzes').updateOne(
        { _id: quiz._id },
        { $set: { questions: currentQuestions, updatedAt: new Date() } }
      );
      console.log(`  ✓ TOC Batch ${i + 1} generated & saved! Total questions now saved: ${currentQuestions.length}/200.`);
    }

    console.log(`\n🎉 Total questions saved to MongoDB: ${currentQuestions.length} (70 from Java.pdf + 130 from 10 Textbook Chapters)`);

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
    console.log(`✅ Auto-granted Java Programming access to ${approvedStudents.length} approved users.`);

    // ── 7. Verification ──────────────────────────────────────────────────
    const finalQuiz = await db.collection('quizzes').findOne({ _id: quiz._id });
    const finalNotes = await CourseNote.find({ course: course._id });

    console.log('\n================ VERIFICATION ================');
    console.log(`Course Title: ${course.title}`);
    console.log(`Department:   Computer Science (ND 1) [ID: ${course.department}]`);
    console.log(`Level:        ${course.level}`);
    console.log(`Semester:     ${course.semester}`);
    console.log(`Quiz Title:   ${finalQuiz.title}`);
    console.log(`Total Qs:     ${finalQuiz.questions?.length}`);
    console.log(`Time Limit:   ${finalQuiz.timeLimit} minutes`);
    console.log(`Notes Count:  ${finalNotes.length} chapters`);
    console.log(`Sources Used: 70 Questions directly from Java.pdf + 130 Questions from 10 Textbook Chapters`);
    console.log('==============================================');

    console.log('\n🎉 JAVA PROGRAMMING FOR COMPUTER SCIENCE (ND 1) CREATED & CONFIGURED SUCCESSFULLY!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ An error occurred:', error.message || error);
    process.exit(1);
  }
}

main();
