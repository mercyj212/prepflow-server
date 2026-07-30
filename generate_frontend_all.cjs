require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const mongoose = require('mongoose');
const path = require('path');

const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

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

async function uploadFile(filePath, displayName) {
  console.log(`Uploading ${displayName}...`);
  const uploadRes = await fileManager.uploadFile(filePath, {
    mimeType: "application/pdf",
    displayName,
  });
  console.log(`  Uploaded as: ${uploadRes.file.name} — waiting for processing...`);
  let file = await fileManager.getFile(uploadRes.file.name);
  while (file.state === "PROCESSING") {
    process.stdout.write(".");
    await new Promise((resolve) => setTimeout(resolve, 2500));
    file = await fileManager.getFile(uploadRes.file.name);
  }
  if (file.state === "FAILED") {
    throw new Error(`File ${displayName} processing failed.`);
  }
  console.log(`\n  ${displayName} is ready!`);
  return uploadRes.file;
}

async function main() {
  try {
    const pdfPath = path.join(__dirname, '..', 'pdfs', 'FRONTEND.pdf');
    const uploadedFile = await uploadFile(pdfPath, 'FRONTEND.pdf');
    const filePart = { fileData: { mimeType: uploadedFile.mimeType, fileUri: uploadedFile.uri } };

    // ── 1. Database Connection & Course Setup ─────────────────────────────
    console.log('\nConnecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const swdDeptId = new mongoose.Types.ObjectId('69f329129ff6793adc556004'); // Software and Web Development

    let course = await db.collection('courses').findOne({
      $or: [
        { title: 'FRONTEND WEB DEVELOPMENT' },
        { title: 'FRONTEND DEVELOPMENT' }
      ]
    });

    if (!course) {
      const newCourseDoc = {
        title: 'FRONTEND WEB DEVELOPMENT',
        description: 'Comprehensive Frontend Web Development covering HTML5, CSS3, Responsive Design, Flexbox, Grid, JavaScript, DOM Manipulation, and Web Best Practices.',
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
      console.log(`✅ Course configured: "${course.title}" [ID: ${course._id}]`);
    }

    // ── 2. Generate Course Notes (8 Chapters generated in 2 groups of 4) ─
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

    const chapterPrompts = [
      "Generate chapters 1 to 4 of Frontend Web Development textbook notes: 1. Introduction to Web Development & HTML Basics, 2. HTML Structural Elements & Links/Media, 3. HTML Tables, Forms & Inputs, 4. Introduction to CSS3 (Selectors, Colors, Typography). Make content thorough with markdown formatting, code snippets, and exam tips.",
      "Generate chapters 5 to 8 of Frontend Web Development textbook notes: 5. CSS Box Model & Spacing, 6. CSS Positioning, Floats & Flexbox, 7. Responsive Web Design & CSS Grid, 8. JavaScript Basics & DOM Manipulation. Make content thorough with markdown formatting, code snippets, and exam tips."
    ];

    const allNotes = [];
    for (let g = 0; g < chapterPrompts.length; g++) {
      console.log(`Generating Notes Part ${g + 1}/2...`);
      const notesRes = await notesModel.generateContent([filePart, { text: chapterPrompts[g] }]);
      const parsedNotes = JSON.parse(notesRes.response.text().trim());
      allNotes.push(...parsedNotes);
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

    // ── 3. Generate 300 Questions for Quiz Bank (in 5 batches of 60) ─────
    console.log('\nGenerating 300 Practice Questions (5 batches of 60 questions)...');

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

    const allQuestions = [];
    const topics = [
      "HTML5 Tags, Document Structure, Headings, Paragraphs, Links, and Media Elements",
      "HTML5 Forms, Inputs, Form Validation, Tables, Lists, and Semantic Elements",
      "CSS3 Selectors, Colors, Typography, Fonts, Text Formatting, Backgrounds, and Specificity",
      "CSS Box Model, Margins, Padding, Borders, Display Modes, Positioning, Floats, and Flexbox",
      "Responsive Web Design, Media Queries, CSS Grid, JavaScript Syntax, Variables, Functions, and DOM Manipulation"
    ];

    for (let batch = 0; batch < 5; batch++) {
      console.log(`Generating Question Batch ${batch + 1}/5 (60 questions on: ${topics[batch]})...`);

      const questionPrompt = `
You are an expert Frontend Web Development professor.
Based on the uploaded FRONTEND PDF and Frontend Web Development standards, generate EXACTLY 60 unique multiple-choice questions focusing on: ${topics[batch]}.

Requirements:
- Each question MUST have exactly 4 options.
- Exactly ONE option MUST have "isCorrect": true, and the other 3 MUST be false.
- Provide a clear, educational explanation for each question.
- Do NOT repeat questions from previous batches.
`;

      const qRes = await questionModel.generateContent([filePart, { text: questionPrompt }]);
      const batchQuestions = JSON.parse(qRes.response.text().trim());

      console.log(`  Batch ${batch + 1} generated ${batchQuestions.length} questions.`);
      allQuestions.push(...batchQuestions);
    }

    console.log(`\nTotal questions generated across all batches: ${allQuestions.length}`);

    // ── 4. Save Quiz Document in MongoDB ─────────────────────────────────
    console.log('Saving Quiz document to MongoDB...');
    await db.collection('quizzes').deleteMany({ course: course._id });

    const quizDoc = {
      title: "FRONTEND WEB DEVELOPMENT CBT PRACTICE EXAM",
      description: "Comprehensive 300-question practice exam covering HTML5, CSS3, Responsive Layouts, Flexbox, Grid, JavaScript, and DOM Manipulation. (60 random questions per 30-minute exam session).",
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

    // Verification
    const finalQuiz = await db.collection('quizzes').findOne({ _id: quizRes.insertedId });
    console.log('\n================ VERIFICATION ================');
    console.log(`Course Title: ${course.title}`);
    console.log(`Department:   Software and Web Development (SWD)`);
    console.log(`Level:        ${course.level}`);
    console.log(`Semester:     ${course.semester}`);
    console.log(`Quiz Title:   ${finalQuiz.title}`);
    console.log(`Total Qs:     ${finalQuiz.questions?.length}`);
    console.log(`Time Limit:   ${finalQuiz.timeLimit} minutes`);
    console.log('==============================================');

    console.log('\n🎉 ALL DONE SUCCESSFULLY!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ An error occurred:', error.message || error);
    process.exit(1);
  }
}

main();
