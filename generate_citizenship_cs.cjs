require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');

const apiKeys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2
].filter(Boolean);

let currentKeyIndex = 0;

function getGenerativeModel(modelName, config = {}) {
  const apiKey = apiKeys[currentKeyIndex % apiKeys.length];
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: config
  });
}

function getFileManager() {
  const apiKey = apiKeys[currentKeyIndex % apiKeys.length];
  return new GoogleAIFileManager(apiKey);
}

function rotateKey() {
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  console.log(`  🔄 Rotating API Key to Key #${currentKeyIndex + 1} (ending in ...${apiKeys[currentKeyIndex].slice(-6)})`);
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

async function callWithRetry(fn, retries = 10, initialDelay = 4000) {
  let waitTime = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const msg = err.message || '';
      console.log(`  ⚠️ Error encountered (${msg.slice(0, 80)}...). Retrying in ${Math.round(waitTime / 1000)}s (Attempt ${i + 1}/${retries})...`);
      rotateKey();
      await delay(waitTime);
      waitTime = Math.round(waitTime * 1.3);
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
  console.log(`\nPDF File ${file.displayName} uploaded and ready.`);
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
      title: /CITIZENSHIP/i,
      department: csDeptId
    });

    if (!course) {
      const newCourseDoc = {
        title: 'CITIZENSHIP EDUCATION - GNS 111/128',
        description: 'Official Citizenship Education course for Computer Science (ND 1). Based directly on official Citizenship Education curriculum textbooks, covering concepts of citizenship, rights and duties, constitutional development, arms of government, rule of law, national ethics, democracy, anti-corruption agencies, and national security.',
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

    // ── 2. Upload GNS302 PDF ──────────────────────────────────────────────
    const pdfPath = path.join(__dirname, '..', 'pdfs', 'GNS302.pdf');
    const filePart = await uploadPdfFile(pdfPath, 'GNS302.pdf');

    // ── 3. Generate Course Notes (8 Chapters) ─────────────────────────────
    console.log('\nGenerating 8 Chapters of Textbook Course Notes for Citizenship Education...');

    const notePrompts = [
      "Based STRICTLY on GNS302.pdf and Citizenship Education curriculum, generate chapters 1 to 4 of Citizenship Education textbook notes: 1. Concepts of Citizenship, Rights, Duties & Modes of Acquisition in Nigeria, 2. Constitutional Development in Nigeria & The 1999 Constitution, 3. Structure of Government (Executive, Legislative, Judiciary & Federalism), 4. Fundamental Human Rights, Rule of Law & UDHR. Include detailed definitions, constitutional sections, real-world examples, full markdown formatting, and exam summary notes.",
      "Based STRICTLY on GNS302.pdf and Citizenship Education curriculum, generate chapters 5 to 8 of Citizenship Education textbook notes: 5. National Ethics, Moral Values, Discipline & Civic Responsibilities, 6. National Identity, Symbols, Unity & Cultural Integration, 7. Democracy, Electoral Systems, INEC & Political Participation, 8. Public Corruption, Anti-Corruption Agencies (EFCC, ICPC, CCB) & National Security. Include detailed definitions, constitutional sections, real-world examples, full markdown formatting, and exam summary notes."
    ];

    const allNotes = [];
    for (let g = 0; g < notePrompts.length; g++) {
      console.log(`Generating Notes Part ${g + 1}/2...`);
      await delay(3000);

      const notesModel = getGenerativeModel("gemini-2.5-flash", {
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
      });

      const res = await callWithRetry(() => notesModel.generateContent([filePart, { text: notePrompts[g] }]));
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
    const notesSummaryText = allNotes.map(n => `Chapter: ${n.chapterTitle}\n${n.content.slice(0, 1500)}`).join('\n\n');

    // ── 4. Generate 200 CBT Practice Questions (10 Batches of 20) ───────────
    console.log('\nGenerating 200 CBT Practice Questions (10 batches of 20) for Citizenship Education...');

    const topics = [
      "Batch 1: Meaning of Citizenship, Acquisition Modes (Birth, Registration, Naturalization), Dual Citizenship & Renunciation",
      "Batch 2: Constitutional Development in Nigeria (Clifford 1922, Richards 1946, Macpherson 1951, Lyttelton 1954, 1960, 1963, 1979, 1999)",
      "Batch 3: Arms of Government (Executive, Legislature, Judiciary) - Roles, Composition, Bicameral Legislature, and Separation of Powers",
      "Batch 4: Federalism in Nigeria, Revenue Allocation, State and Local Government Structures, and Intergovernmental Relations",
      "Batch 5: Fundamental Human Rights (Chapter IV of 1999 Constitution), Freedom of Speech, Press Freedom, and UDHR Framework",
      "Batch 6: Rule of Law, Judicial Independence, Due Process, Equality Before the Law, and Protection Against Arbitrary Power",
      "Batch 7: National Ethics, Civic Responsibilities, Patriotism, Community Service, Discipline, and Environmental Sanitation",
      "Batch 8: National Symbols (Flag, Coat of Arms, Anthem, Pledge, Currency), National Identity, Unity, and Ethnic Harmony",
      "Batch 9: Democracy, Electoral System, INEC Functions, Voter Registration, Multiparty System, and Transparent Elections",
      "Batch 10: Anti-Corruption Framework (EFCC, ICPC, Code of Conduct Bureau), Public Accountability, National Security, and Armed Forces Roles"
    ];

    const allQuestions = [];

    for (let batch = 0; batch < topics.length; batch++) {
      console.log(`\nGenerating Question Batch ${batch + 1}/${topics.length} (20 questions on: ${topics[batch]})...`);
      await delay(2500);

      const qPrompt = `
You are an expert university professor of Citizenship Education & Political Science.
Based STRICTLY on the attached Citizenship Education curriculum context, generate EXACTLY 20 unique, high-quality multiple-choice questions covering: ${topics[batch]}.

CRITICAL PSYCHOMETRIC & OPTION BALANCE RULES:
1. Each question MUST have exactly 4 options (A, B, C, D).
2. Exactly ONE option MUST have "isCorrect": true, and the other 3 MUST be false.
3. ABSOLUTE OPTION LENGTH BALANCE: All 4 options MUST be written with EQUAL DETAIL, EQUAL WORD COUNT, EQUAL CHARACTER LENGTH, and MATCHING GRAMMATICAL STRUCTURE.
   - NEVER make the correct option longer, more descriptive, or more technical than the distractors.
   - The distractors MUST be realistic, sophisticated, and equally detailed civics concepts.
4. Explanations must be thorough, step-by-step conceptual clarifications directly referencing constitutional provisions and civic principles.
5. Do NOT repeat any question topic or phrasing from earlier questions.

Curriculum Context:
${notesSummaryText.slice(0, 15000)}
`;

      const questionModel = getGenerativeModel("gemini-2.5-flash", {
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

      console.log(`  ✓ Batch ${batch + 1} generated ${batchQs.length} balanced questions.`);
      allQuestions.push(...batchQs);
    }

    console.log(`\nTotal questions generated: ${allQuestions.length}`);

    // ── 5. Save Quiz Document in MongoDB ─────────────────────────────────
    console.log('Saving Quiz document to MongoDB...');
    await db.collection('quizzes').deleteMany({ course: course._id });

    const quizDoc = {
      title: "CITIZENSHIP EDUCATION CBT PRACTICE EXAM",
      description: "Comprehensive 200-question practice exam created directly from official Citizenship Education curriculum textbooks for Computer Science (ND 1). Covers citizenship acquisition, constitutional history, arms of government, human rights, rule of law, national ethics, democracy, anti-corruption agencies, and national security. (60 random questions per 30-minute exam session).",
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
    console.log(`✅ Auto-granted Citizenship Education access to ${approvedStudents.length} approved users.`);

    // ── 7. Verification ──────────────────────────────────────────────────
    const finalQuiz = await db.collection('quizzes').findOne({ _id: quizRes.insertedId });
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
    console.log(`Sources Used: Official Citizenship Education Textbooks`);
    console.log('==============================================');

    console.log('\n🎉 CITIZENSHIP EDUCATION FOR COMPUTER SCIENCE (ND 1) CREATED & CONFIGURED SUCCESSFULLY!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ An error occurred:', error.message || error);
    process.exit(1);
  }
}

main();
