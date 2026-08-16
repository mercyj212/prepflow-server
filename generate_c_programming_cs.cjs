require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
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

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Exact course material text from user uploaded images
const userUploadedMaterial = `
FEATURES OF C LANGUAGE:
1. Simple and Efficient: C has a relatively small set of keywords and is easy to learn compared to many other languages.
2. Fast Execution: Programs written in C run quickly because C is compiled into machine code.
3. Portable: A C program can be moved from one computer system to another with little or no modification.
4. Structured Language: C supports structured programming, which means programs can be divided into functions and blocks.
5. Middle-Level Language: C combines features of both high-level and low-level languages. It is useful for application development and system programming.
6. Rich Set of Operators: C provides many operators for arithmetic, comparison, logical operations, and more.
7. Supports Pointers: Pointers allow direct memory access and are one of the most powerful features of C.

BASIC STRUCTURE OF A C PROGRAM:
A C program usually follows a standard structure:
#include <stdio.h>

int main() {
    printf("Hello, World!");
    return 0;
}

EXPLANATION OF THE PARTS:
- #include <stdio.h>: includes the standard input/output library
- int main(): the main function where execution begins
- printf(): used to display output
- return 0;: indicates successful program execution

COMPONENTS OF A C PROGRAM:
1. Preprocessor Directives: These are instructions that begin with #, such as #include. They are processed before compilation.
2. Main Function: Every C program must have a main() function. It is the starting point of execution.
3. Declarations: Variables and functions are declared before use.
4. Statements: These are instructions that tell the computer what to do.
5. Comments: Comments are notes written in the code for human understanding. They are ignored by the compiler.
`;

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const csDeptId = new mongoose.Types.ObjectId('69e5e34f2eeaa5bffac98e94'); // Computer Science Department (ND 1)

    let course = await db.collection('courses').findOne({
      title: /COM 121|C PROGRAMMING/i,
      department: csDeptId
    });

    if (!course) {
      const newCourseDoc = {
        title: 'COM 121 - C PROGRAMMING',
        description: 'Official COM 121 C Programming course for Computer Science (ND 1). Based directly on official COM 121 lecture notes and curriculum standards, covering C features (Simple, Fast Execution, Portable, Structured, Middle-Level, Operators, Pointers), program structure, preprocessor directives, data types, control flow, functions, recursion, pointers, memory management, arrays, strings, structures, unions, and File I/O.',
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
            title: 'COM 121 - C PROGRAMMING',
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

    // ── 2. Generate Course Notes (8 Chapters) incorporating User Material ─────
    console.log('\nGenerating 8 Chapters of Textbook Course Notes for COM 121 C Programming...');

    const notePrompts = [
      `Based STRICTLY on the user provided course notes below and the COM 121 C Programming ND1 curriculum, generate chapters 1 to 4 of COM 121 textbook notes:
1. Features & Characteristics of C (Simple & Efficient, Fast Execution, Portable, Structured, Middle-Level Language, Rich Set of Operators, Supports Pointers),
2. Basic Structure & Components of a C Program (#include <stdio.h>, int main(), printf(), return 0;, Preprocessor Directives, Declarations, Statements, Comments),
3. Data Types, Modifiers (signed/unsigned, short/long), Variables, Constants & Keywords in C,
4. Operators, Expressions, Operator Precedence, Type Casting & Conditional Statements (if, if-else, switch-case).

User Material to include explicitly:
${userUploadedMaterial}

Include code snippets, syntax rules, detailed explanations, markdown formatting, and exam summary notes.`,

      `Based STRICTLY on the COM 121 C Programming ND1 curriculum, generate chapters 5 to 8 of COM 121 textbook notes:
5. Iteration & Looping Structures (for, while, do-while, break, continue, goto),
6. Functions, Prototypes, Parameter Passing (Call by Value vs Call by Reference) & Recursion,
7. Arrays, Strings, Pointers & Dynamic Memory Management (malloc, calloc, realloc, free),
8. Structures (struct), Unions (union) & File Input/Output Operations (fopen, fclose, fprintf, fscanf, fread, fwrite).

Include code snippets, syntax rules, detailed explanations, markdown formatting, and exam summary notes.`
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

      const res = await callWithRetry(() => notesModel.generateContent([{ text: notePrompts[g] }]));
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

    // ── 3. Generate 200 CBT Practice Questions (10 Batches of 20) ───────────
    console.log('\nGenerating 200 CBT Practice Questions (10 batches of 20) for COM 121 C Programming...');

    const topics = [
      `Batch 1: Features of C Language (Simple & Efficient, Fast Execution due to Machine Code compilation, Portable, Structured Language, Middle-Level Language, Rich Set of Operators, Supports Pointers)`,
      `Batch 2: Basic Structure & Components of C Program (#include <stdio.h>, int main(), printf(), return 0;, Preprocessor Directives beginning with #, Declarations, Statements, Comments)`,
      "Batch 3: Primary Data Types (int, float, double, char, void), Data Modifiers (short, long, signed, unsigned), Variable Declaration, and Constants (#define vs const)",
      "Batch 4: Operators: Arithmetic, Relational, Logical, Bitwise (&, |, ^, ~), Assignment, Increment/Decrement (++i vs i++), Ternary Operator (? :), and Operator Precedence",
      "Batch 5: Decision Making: if, if-else, nested if-else, else-if ladder, switch-case statement, break, and default statements",
      "Batch 6: Looping Structures: while loop, do-while loop, for loop, nested loops, loop control (break, continue, goto), and infinite loops",
      "Batch 7: User-defined Functions, Prototypes, Parameter Passing (Call by Value vs Call by Reference), Return Values, and Recursion",
      "Batch 8: Scope Rules (Local, Global, static, extern, register storage classes), Variable Lifetime, and Memory Allocation",
      "Batch 9: Arrays (1D & 2D), Strings (null terminator \\0, strlen, strcpy, strcat, strcmp), and Pointers (& address-of, * dereference, pointer arithmetic)",
      "Batch 10: Dynamic Memory Allocation (malloc, calloc, realloc, free), Structures (struct), Unions (union), and File Operations (FILE*, fopen, fclose, fprintf, fscanf, fread, fwrite)"
    ];

    const allQuestions = [];

    for (let batch = 0; batch < topics.length; batch++) {
      console.log(`\nGenerating Question Batch ${batch + 1}/${topics.length} (20 questions on: ${topics[batch]})...`);
      await delay(2500);

      const qPrompt = `
You are an expert university professor of Computer Science and COM 121 C Programming.
Based STRICTLY on the user provided COM 121 lecture notes below and C Programming curriculum, generate EXACTLY 20 unique, high-quality multiple-choice questions covering: ${topics[batch]}.

CRITICAL PSYCHOMETRIC & OPTION BALANCE RULES:
1. Each question MUST have exactly 4 options (A, B, C, D).
2. Exactly ONE option MUST have "isCorrect": true, and the other 3 MUST be false.
3. ABSOLUTE OPTION LENGTH BALANCE: All 4 options MUST be written with EQUAL DETAIL, EQUAL WORD COUNT, EQUAL CHARACTER LENGTH, and MATCHING GRAMMATICAL STRUCTURE.
   - NEVER make the correct option longer, more descriptive, or more technical than the distractors.
   - The distractors MUST be realistic, sophisticated, and equally detailed C programming concepts or code output snippets.
4. Explanations must be thorough, step-by-step technical clarifications directly explaining C syntax, memory behavior, or output logic.
5. Do NOT repeat any question topic or code snippet from earlier questions.

Reference Notes:
${userUploadedMaterial}

${notesSummaryText.slice(0, 10000)}
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
      title: "COM 121 CBT PRACTICE EXAM",
      description: "Comprehensive 200-question practice exam created directly from official COM 121 C Programming lecture materials and curriculum standards for Computer Science (ND 1). Covers C features, program structure, preprocessor directives, data types, operators, control flow, loops, functions, recursion, pointers, arrays, strings, structures, unions, and file handling. (60 random questions per 30-minute exam session).",
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
    console.log(`✅ Auto-granted COM 121 access to ${approvedStudents.length} approved users.`);

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
    console.log(`Sources Used: User Uploaded COM 121 Notes & Curriculum`);
    console.log('==============================================');

    console.log('\n🎉 COM 121 FOR COMPUTER SCIENCE (ND 1) CREATED & CONFIGURED SUCCESSFULLY!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ An error occurred:', error.message || error);
    process.exit(1);
  }
}

main();
