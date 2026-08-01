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

async function callWithRetry(fn, retries = 8, initialDelay = 6000) {
  let waitTime = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const msg = err.message || '';
      const isRetryable = msg.includes('429') || msg.includes('Quota') || msg.includes('503') || msg.includes('Service Unavailable') || msg.includes('OVERLOADED');
      if (isRetryable && i < retries - 1) {
        console.log(`  ⚠️ API temporary error (${msg.slice(0, 60)}...). Retrying in ${Math.round(waitTime / 1000)}s (Attempt ${i + 1}/${retries})...`);
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

    const nccDeptId = new mongoose.Types.ObjectId('69f329129ff6793adc55600a'); // Networking and Cloud Computing (NCC)

    let course = await db.collection('courses').findOne({
      $or: [
        { title: 'CLOUD COMPUTING' },
        { title: 'NCC - CLOUD COMPUTING' }
      ]
    });

    if (!course) {
      const newCourseDoc = {
        title: 'CLOUD COMPUTING',
        description: 'Comprehensive Cloud Computing course based on all 7 Cloud Computing lessons covering Cloud Architectures, Service Models (IaaS, PaaS, SaaS), Pricing Models, CapEx vs OpEx, TCO Calculations, Organization Accounts, Shared Responsibility Model, and Data Security.',
        department: nccDeptId,
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
            department: nccDeptId,
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

    // ── 2. Upload All 7 Cloud Computing PDF Files ─────────────────────────
    const pdfFiles = [
      { path: path.join(__dirname, '..', 'pdfs', 'Cloud Computing.pdf'), name: 'Cloud_Computing_Intro.pdf' },
      { path: path.join(__dirname, '..', 'pdfs', 'lesson 3- Cloud services pricing.pdf'), name: 'Lesson3_Pricing.pdf' },
      { path: path.join(__dirname, '..', 'pdfs', 'lesson 4- On premise costing.pdf'), name: 'Lesson4_OnPremise.pdf' },
      { path: path.join(__dirname, '..', 'pdfs', 'lesson 5- Total cost of ownership.pdf'), name: 'Lesson5_TCO.pdf' },
      { path: path.join(__dirname, '..', 'pdfs', 'lesson 6- SETTING UP ORGANIZATION ACCOUNT.pdf'), name: 'Lesson6_OrgAccount.pdf' },
      { path: path.join(__dirname, '..', 'pdfs', 'lesson 7- CLOUD COMPUTING SECURITY (shared responsibility).pdf'), name: 'Lesson7_SharedSecurity.pdf' },
      { path: path.join(__dirname, '..', 'pdfs', 'lesson 8- CLOUD COMPUTING SECURITY (How to Secure Data).pdf'), name: 'Lesson8_DataSecurity.pdf' }
    ];

    const pdfFileParts = [];
    for (const f of pdfFiles) {
      const part = await uploadPdfFile(f.path, f.name);
      pdfFileParts.push(part);
    }

    // ── 3. Generate Course Notes (8 Chapters) ────────────────────────────
    console.log('\nGenerating 8 Chapters of Course Notes directly from all 7 Cloud Computing PDFs...');
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
      "Based STRICTLY on the 7 uploaded Cloud Computing PDF lessons, generate chapters 1 to 4 of Cloud Computing textbook notes: 1. Fundamentals of Cloud Computing & Deployment Models (IaaS, PaaS, SaaS, Public, Private, Hybrid), 2. Cloud Services Pricing Models (Pay-As-You-Go, Reserved, Savings Plans & Spot), 3. On-Premise Costing vs Cloud Economics (CapEx vs OpEx), 4. Total Cost of Ownership (TCO) & Cloud ROI Analysis. Include full technical depth, markdown, financial calculations, diagrams described in text, and exam tips.",
      "Based STRICTLY on the 7 uploaded Cloud Computing PDF lessons, generate chapters 5 to 8 of Cloud Computing textbook notes: 5. Setting Up Organization Accounts & Multi-Account Architecture, 6. Cloud Computing Security & Shared Responsibility Model, 7. Data Protection, Encryption (Rest/Transit) & Key Management, 8. Cloud Governance, Compliance Standards & Monitoring. Include full technical depth, markdown, security matrices, and exam tips."
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

    // ── 4. Generate 200 CBT Questions (4 batches of 50) ──────────────────
    console.log('\nGenerating 200 CBT Practice Questions (4 batches of 50) strictly from all 7 Cloud Computing PDFs...');

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
      "Cloud Computing Intro & Service Models: IaaS, PaaS, SaaS, Public/Private/Hybrid Cloud, Cloud Characteristics, Elasticity, Scalability, and Virtualization",
      "Cloud Pricing & Financial Models: Pay-As-You-Go, Reserved Instances, Spot Pricing, CapEx vs OpEx, On-Premise Cost Breakdown, and Total Cost of Ownership (TCO) Calculations",
      "Cloud Organizations & Governance: Setting Up Organization Accounts, AWS/Azure Multi-Account Strategy, IAM Roles, Policies, SCPs, and Organization Units",
      "Cloud Security & Data Protection: Shared Responsibility Model (Provider vs Customer Responsibilities), Encryption at Rest, Encryption in Transit, Key Management Service (KMS), Compliance & Auditing"
    ];

    const allQuestions = [];
    for (let batch = 0; batch < 4; batch++) {
      console.log(`Generating Question Batch ${batch + 1}/4 (50 questions on: ${topics[batch]})...`);
      await delay(3000);

      const qPrompt = `
You are an expert Cloud Architect and University Professor specializing in Cloud Computing certifications (AWS Cloud Practitioner / Solutions Architect / Azure Fundamentals).
Using the content from all 7 uploaded Cloud Computing PDF lessons, generate EXACTLY 50 unique multiple-choice questions focusing on: ${topics[batch]}.

Requirements:
- Each question MUST have exactly 4 options.
- Exactly ONE option MUST have "isCorrect": true, and the other 3 MUST be false.
- Provide a clear, educational explanation demonstrating exact pricing calculations, security boundaries, or architectural choices directly from the PDF materials.
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
      title: "CLOUD COMPUTING CBT PRACTICE EXAM",
      description: "Comprehensive 200-question practice exam created directly from all 7 Cloud Computing textbook lessons (Cloud Architecture, Pricing, CapEx vs OpEx, TCO, IAM Organizations, Shared Responsibility & Data Security) for Networking and Cloud Computing (NCC). (60 random questions per 30-minute exam session).",
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
    console.log(`✅ Auto-granted Cloud Computing access to ${approvedStudents.length} approved users.`);

    // ── 7. Verification ──────────────────────────────────────────────────
    const finalQuiz = await db.collection('quizzes').findOne({ _id: quizRes.insertedId });
    console.log('\n================ VERIFICATION ================');
    console.log(`Course Title: ${course.title}`);
    console.log(`Department:   Networking and Cloud Computing (NCC)`);
    console.log(`Level:        ${course.level}`);
    console.log(`Semester:     ${course.semester}`);
    console.log(`Quiz Title:   ${finalQuiz.title}`);
    console.log(`Total Qs:     ${finalQuiz.questions?.length}`);
    console.log(`Time Limit:   ${finalQuiz.timeLimit} minutes`);
    console.log(`Sources Used: 7 Cloud Computing PDF files`);
    console.log('==============================================');

    console.log('\n🎉 CLOUD COMPUTING SET UP SUCCESSFULLY!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ An error occurred:', error.message || error);
    process.exit(1);
  }
}

main();
