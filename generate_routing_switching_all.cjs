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

async function main() {
  try {
    // ── 1. Database Connection & Course Setup ─────────────────────────────
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const nccDeptId = new mongoose.Types.ObjectId('69f329129ff6793adc55600a'); // Networking and Cloud Computing (NCC)

    let course = await db.collection('courses').findOne({
      $or: [
        { title: 'ROUTING AND SWITCHING' },
        { title: 'NCC 321 - ROUTING AND SWITCHING' }
      ]
    });

    if (!course) {
      const newCourseDoc = {
        title: 'ROUTING AND SWITCHING',
        description: 'Comprehensive Routing and Switching 1 & 2 covering OSI/TCP-IP models, Ethernet Switching, VLANs, Trunking, STP, Inter-VLAN Routing, Static/Dynamic Routing (OSPF, EIGRP, BGP), Subnetting, NAT, and ACLs.',
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

    // ── 2. PDF Context Setup ─────────────────────────────────────────────
    const pdfPath = path.join(__dirname, '..', 'pdfs', 'NCC-321- lesson 9- NETWORKING.pdf');
    console.log(`Uploading ${path.basename(pdfPath)}...`);
    const uploadRes = await fileManager.uploadFile(pdfPath, {
      mimeType: "application/pdf",
      displayName: "NCC-321-NETWORKING.pdf"
    });
    let file = await fileManager.getFile(uploadRes.file.name);
    while (file.state === "PROCESSING") {
      process.stdout.write(".");
      await delay(2500);
      file = await fileManager.getFile(uploadRes.file.name);
    }
    console.log(`\nPDF File ${file.displayName} ready.`);
    const filePart = { fileData: { mimeType: file.mimeType, fileUri: file.uri } };

    // ── 3. Generate Course Notes (8 Chapters) ────────────────────────────
    console.log('\nGenerating 8 Chapters of Course Notes...');
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
      "Generate chapters 1 to 4 of Routing and Switching textbook notes: 1. Introduction to Computer Networking & Layer Architectures (OSI & TCP/IP), 2. Ethernet Switching & MAC Address Tables, 3. Virtual LANs (VLANs), 802.1Q Trunking & VTP, 4. Spanning Tree Protocol (STP, RSTP, MSTP) & Switch Redundancy. Include rich markdown, diagrams described in text, CLI configurations, and exam tips.",
      "Generate chapters 5 to 8 of Routing and Switching textbook notes: 5. Inter-VLAN Routing (Router-on-a-Stick & Layer 3 Switch SVI), 6. IP Addressing, VLSM & IPv4/IPv6 Subnetting, 7. Dynamic Routing Protocols (RIP, EIGRP, OSPF, BGP), 8. Network Services, NAT/PAT, ACLs & Network Troubleshooting. Include rich markdown, CLI commands, and exam tips."
    ];

    const allNotes = [];
    for (let g = 0; g < notePrompts.length; g++) {
      console.log(`Generating Notes Part ${g + 1}/2...`);
      await delay(3000);
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

    // ── 4. Generate 150 CBT Questions (3 batches of 50) ──────────────────
    console.log('\nGenerating 150 CBT Practice Questions (3 batches of 50 questions)...');

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
      "Networking Fundamentals, OSI & TCP/IP Layers, Ethernet Switching, MAC Address Tables, VLANs, and Access Ports",
      "VLAN 802.1Q Trunking, VTP Modes, Spanning Tree Protocol (STP, RSTP, Root Bridge Selection), and Inter-VLAN Routing (ROAS & SVI)",
      "IPv4/IPv6 Subnetting, VLSM, Static Routes, Dynamic Routing Protocols (RIP, EIGRP, OSPF, BGP), NAT/PAT, and Standard/Extended Access Control Lists (ACLs)"
    ];

    const allQuestions = [];
    for (let batch = 0; batch < 3; batch++) {
      console.log(`Generating Question Batch ${batch + 1}/3 (50 questions on: ${topics[batch]})...`);
      await delay(3000);

      const qPrompt = `
You are an expert Cisco Certified Network Associate (CCNA) and Routing & Switching university professor.
Based on Routing and Switching 1 & 2 curriculum and the uploaded PDF, generate EXACTLY 50 unique multiple-choice questions focusing on: ${topics[batch]}.

Requirements:
- Each question MUST have exactly 4 options.
- Exactly ONE option MUST have "isCorrect": true, and the other 3 MUST be false.
- Provide a clear, educational explanation showing the step-by-step reasoning or calculation (e.g. subnetting math or CLI command logic).
- Do NOT repeat questions from previous batches.
`;

      const qRes = await callWithRetry(() => questionModel.generateContent([filePart, { text: qPrompt }]));
      const batchQs = JSON.parse(qRes.response.text().trim());

      console.log(`  Batch ${batch + 1} generated ${batchQs.length} questions.`);
      allQuestions.push(...batchQs);
    }

    console.log(`\nTotal questions generated across all batches: ${allQuestions.length}`);

    // ── 5. Save Quiz Document in MongoDB ─────────────────────────────────
    console.log('Saving Quiz document to MongoDB...');
    await db.collection('quizzes').deleteMany({ course: course._id });

    const quizDoc = {
      title: "ROUTING AND SWITCHING CBT PRACTICE EXAM",
      description: "Comprehensive 150-question practice exam covering Routing & Switching 1 & 2 (VLANs, STP, Inter-VLAN Routing, OSPF, Subnetting, NAT, ACLs) for Networking and Cloud Computing (NCC). (60 random questions per 30-minute exam session).",
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
    console.log(`✅ Auto-granted Routing & Switching access to ${approvedStudents.length} approved users.`);

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
    console.log('==============================================');

    console.log('\n🎉 ROUTING AND SWITCHING SET UP SUCCESSFULLY!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ An error occurred:', error.message || error);
    process.exit(1);
  }
}

main();
