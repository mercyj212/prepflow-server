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

async function uploadAndWait(filePath, displayName) {
  console.log(`Uploading ${displayName}...`);
  const uploadRes = await fileManager.uploadFile(filePath, {
    mimeType: "application/pdf",
    displayName,
  });
  console.log(`  Uploaded as: ${uploadRes.file.name} — waiting for processing...`);
  let file = await fileManager.getFile(uploadRes.file.name);
  while (file.state === "PROCESSING") {
    process.stdout.write(".");
    await new Promise((resolve) => setTimeout(resolve, 3000));
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
    // ── 1. Upload all 7 PDFs ─────────────────────────────────────────────
    const pdfDir = path.join(__dirname, '..', 'pdfs');

    const pdfFiles = [
      { path: path.join(pdfDir, 'Database1.pdf'),  label: 'Database Part 1' },
      { path: path.join(pdfDir, 'database2.pdf'),  label: 'Database Part 2' },
      { path: path.join(pdfDir, 'database3.pdf'),  label: 'Database Part 3' },
      { path: path.join(pdfDir, 'database4.pdf'),  label: 'Database Part 4' },
      { path: path.join(pdfDir, 'database5.pdf'),  label: 'Database Part 5' },
      { path: path.join(pdfDir, 'database6.pdf'),  label: 'Database Part 6' },
      { path: path.join(pdfDir, 'database7.pdf'),  label: 'Database Part 7' },
    ];

    const uploadedFiles = [];
    for (const pdf of pdfFiles) {
      const file = await uploadAndWait(pdf.path, pdf.label);
      uploadedFiles.push(file);
    }

    // ── 2. Build Gemini content parts ────────────────────────────────────
    const fileParts = uploadedFiles.map(f => ({
      fileData: { mimeType: f.mimeType, fileUri: f.uri }
    }));

    const prompt = `
You are an expert database systems professor and AI tutor.
Based on all 7 uploaded PDF documents for the course "DATABASE DESIGN", generate extremely comprehensive, highly detailed study notes suitable for a university-level exam.

The notes MUST be divided into exactly 8 logical chapters covering these topics in order:
1. Introduction to Database Systems and Data Models
2. Entity-Relationship (ER) Model and Database Design
3. Relational Model and Relational Algebra
4. Structured Query Language (SQL) — DDL and DML
5. Advanced SQL — Joins, Subqueries, Views, and Stored Procedures
6. Normalization and Database Integrity
7. Transaction Management, Concurrency Control, and Recovery
8. Database Security, Indexing, and Query Optimization

For each chapter:
- Write very detailed, thorough Markdown content
- Use headers (##, ###), bullet points, numbered lists, tables, and code blocks for SQL examples
- Include definitions, examples, diagrams described in text, and exam-style tips
- Each chapter should feel like a full textbook chapter — aim for at least 800-1200 words per chapter
- Base the content strictly on what is covered in the uploaded PDF materials

Output ONLY a valid JSON array with no extra text before or after it.
Each object must have exactly these keys:
- "chapterTitle": e.g. "Chapter 1: Introduction to Database Systems and Data Models"
- "content": A long, detailed string of Markdown-formatted text for that chapter
`;

    // ── 3. Call Gemini ───────────────────────────────────────────────────
    console.log('\nGenerating notes with Gemini (this may take a few minutes)...');
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const result = await model.generateContent([...fileParts, { text: prompt }]);
    let responseText = result.response.text();

    // Strip markdown code fences if present
    responseText = responseText
      .replace(/^```json\n?/, '')
      .replace(/^```\n?/, '')
      .replace(/\n?```$/, '')
      .trim();

    let notesData;
    try {
      notesData = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse JSON response. Raw output saved to database_notes_raw.txt");
      require('fs').writeFileSync('database_notes_raw.txt', responseText);
      process.exit(1);
    }

    console.log(`\nSuccessfully generated ${notesData.length} chapters.`);

    // ── 4. Save to MongoDB ───────────────────────────────────────────────
    console.log('\nConnecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    // Find the DATABASE DESIGN course
    const courses = await db.collection('courses').find({
      $or: [
        { title: /database/i },
        { courseCode: /db/i }
      ]
    }).toArray();

    console.log(`Found ${courses.length} database course(s):`);
    courses.forEach(c => console.log(`  - [${c._id}] ${c.courseCode}: ${c.title}`));

    if (courses.length === 0) {
      console.error('No database course found! Check course title in DB.');
      process.exit(1);
    }

    for (const course of courses) {
      console.log(`\nReplacing notes for: "${course.title}"...`);
      await CourseNote.deleteMany({ course: course._id });

      for (let i = 0; i < notesData.length; i++) {
        const note = notesData[i];
        await CourseNote.create({
          course: course._id,
          chapterTitle: note.chapterTitle,
          content: note.content,
          order: i + 1,
        });
        console.log(`  Saved: ${note.chapterTitle}`);
      }
    }

    console.log('\n✅ Successfully generated and saved Database Design notes!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ An error occurred:', error.message || error);
    process.exit(1);
  }
}

main();
