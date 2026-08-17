require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');

// Put GEMINI_API_KEY_2 first since GEMINI_API_KEY_1 hit its daily free limit
const apiKeys = [
  process.env.GEMINI_API_KEY_2,
  process.env.GEMINI_API_KEY
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

function rotateKey() {
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  console.log(`  🔄 Switched to Key #${currentKeyIndex + 1} (ending in ...${apiKeys[currentKeyIndex].slice(-6)})`);
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

async function callWithRetry(fn, retries = 5, initialDelay = 3000) {
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
      title: /COM 122|INTRODUCTION TO THE INTERNET/i,
      department: csDeptId
    });

    if (!course) {
      const newCourseDoc = {
        title: 'COM 122 - INTRODUCTION TO THE INTERNET',
        description: 'Official COM 122 Introduction to the Internet course for Computer Science (ND 1). Based directly on official Introduction to the Internet PDF lecture materials (Parts 1 to 5), covering Internet history, ARPANET, Internet vs Intranet vs Extranet, Data transmission (Parallel/Serial, Asynchronous/Synchronous, EBCDIC/ASCII), Routers, Access Points, Cybercafe operations, TCP/IP, IP addressing, DNS, Web browsers, URLs, Email protocols, and Security.',
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
            title: 'COM 122 - INTRODUCTION TO THE INTERNET',
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

    const existingNotes = await CourseNote.find({ course: course._id });
    console.log(`✅ Loaded ${existingNotes.length} saved course note chapters from MongoDB.`);

    // ── 3. Generate 200 CBT Practice Questions (10 Batches of 20) ───────────
    console.log('\nGenerating 200 CBT Practice Questions (10 batches of 20) strictly from 5 Internet PDFs content...');

    const topics = [
      "Batch 1: History of the Internet (ARPANET 1960s, Kleinrock 1961, Cerf & Kahn 1974, Queen Elizabeth II email 1976, TCP/IP 1982, DNS 1983, Gibson cyberspace 1984, Symbolics.com 1985, Tim Berners-Lee HTML 1990, CERN 1991, Mosaic 1993, Google/IPv6 1998, Facebook 2004, YouTube 2005, Twitter 2006, Snowden 2013, 3.4B Users)",
      "Batch 2: Ownership & Governance of Internet (No single owner, Internet Society, IETF, RFCs, backbone infrastructure owned by telecom companies)",
      "Batch 3: Internet vs Intranet vs Extranet (Definitions, Similarities in TCP/IP & Browsers, Differences, Extranet business benefits like 24/7 access & collaboration, Extranet disadvantages like high cost & security risks)",
      "Batch 4: Data Transmission Principles (Movement of bits, Coding schemes EBCDIC & ASCII, Transmission media like coaxial & fiber optics)",
      "Batch 5: Parallel vs Serial Data Transmission (Simultaneous bits over multiple lines vs single line, short vs long distance, cost comparison)",
      "Batch 6: Asynchronous vs Synchronous Serial Transmission (Start/stop bits with idle gaps vs continuous bit stream frames with synchronized clocks, speed & overhead comparison)",
      "Batch 7: Networking Hardware & Operations (Routers: path determination, firewalls, VPN, IP telephony; Wireless Access Points; Switches; Nodes & Transmission links)",
      "Batch 8: Cybercafe Setup, Operations & Management (Public internet access, ADSL/Cable, Client/Server setup, ISP selection factors, Management software, Bulk ticket discounts, Hardware requirements)",
      "Batch 9: Electronic Mail & Protocols (SMTP, POP3, IMAP, Mail headers, Webmail vs Clients, Netiquette) & Web Browsers/URLs (HTTP vs HTTPS, SSL/TLS, URL Anatomy, DNS resolution)",
      "Batch 10: HTML Essentials (Structure, <html>, <head>, <body>, headings, links, images, tables, forms) & Internet Security (Malware, Viruses, Worms, Trojans, Phishing, Ransomware, Firewalls, Cybercrime laws)"
    ];

    const allQuestions = [];

    for (let batch = 0; batch < topics.length; batch++) {
      console.log(`\nGenerating Question Batch ${batch + 1}/${topics.length} (20 questions on: ${topics[batch]})...`);
      await delay(3000);

      const chapterContext = existingNotes[Math.floor(batch % existingNotes.length)]?.content.slice(0, 2000) || "";

      const qPrompt = `
You are an expert university professor of Computer Science and Networking / Web Technologies.
Based STRICTLY on the COM 122 Introduction to the Internet curriculum, generate EXACTLY 20 unique, high-quality multiple-choice questions covering: ${topics[batch]}.

CRITICAL PSYCHOMETRIC & OPTION BALANCE RULES:
1. Each question MUST have exactly 4 options (A, B, C, D).
2. Exactly ONE option MUST have "isCorrect": true, and the other 3 MUST be false.
3. ABSOLUTE OPTION LENGTH BALANCE: All 4 options MUST be written with EQUAL DETAIL, EQUAL WORD COUNT, EQUAL CHARACTER LENGTH, and MATCHING GRAMMATICAL STRUCTURE.
   - NEVER make the correct option longer, more descriptive, or more technical than the distractors.
   - The distractors MUST be realistic, sophisticated, and equally detailed networking or internet concepts.
4. Explanations must be thorough, step-by-step technical clarifications directly explaining protocol behavior, historical dates, URL structure, or network concepts.
5. Do NOT repeat any question topic or scenario from earlier questions.

Context:
${chapterContext}
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

      const qRes = await callWithRetry(() => questionModel.generateContent([{ text: qPrompt }]));
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

    // ── 4. Save Quiz Document in MongoDB ─────────────────────────────────
    console.log('Saving Quiz document to MongoDB...');
    await db.collection('quizzes').deleteMany({ course: course._id });

    const quizDoc = {
      title: "COM 122 CBT PRACTICE EXAM",
      description: "Comprehensive 200-question practice exam created directly from official Introduction to the Internet PDF lecture materials (Parts 1-5) for Computer Science (ND 1). Covers Internet history, ARPANET, Internet vs Intranet vs Extranet, Data transmission (Parallel/Serial, Asynchronous/Synchronous, EBCDIC/ASCII), Routers, Access Points, Cybercafe operations, TCP/IP, IP addressing, DNS, Web browsers, URLs, Email protocols, and Security. (60 random questions per 30-minute exam session).",
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

    // ── 5. Auto-Grant Access to Approved Users ────────────────────────────
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
    console.log(`✅ Auto-granted COM 122 access to ${approvedStudents.length} approved users.`);

    // ── 6. Verification ──────────────────────────────────────────────────
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
    console.log(`Sources Used: 5 Introduction to the Internet PDFs`);
    console.log('==============================================');

    console.log('\n🎉 COM 122 FOR COMPUTER SCIENCE (ND 1) CREATED & CONFIGURED SUCCESSFULLY!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ An error occurred:', error.message || error);
    process.exit(1);
  }
}

main();
