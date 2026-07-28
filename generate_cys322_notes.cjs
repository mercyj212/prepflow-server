require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const mongoose = require('mongoose');

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

async function main() {
  try {
    console.log("Uploading files to Gemini...");
    const uploadRes1 = await fileManager.uploadFile("../pdfs/CYS322.pdf", {
      mimeType: "application/pdf",
      displayName: "CYS 322 PDF 1",
    });
    console.log(`Uploaded ${uploadRes1.file.displayName} as: ${uploadRes1.file.name}`);

    const uploadRes2 = await fileManager.uploadFile("../pdfs/CYS3222@.pdf", {
      mimeType: "application/pdf",
      displayName: "CYS 322 PDF 2",
    });
    console.log(`Uploaded ${uploadRes2.file.displayName} as: ${uploadRes2.file.name}`);

    // Wait for files to be processed
    console.log("Waiting for files to be processed...");
    let file1 = await fileManager.getFile(uploadRes1.file.name);
    while (file1.state === "PROCESSING") {
      process.stdout.write(".");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      file1 = await fileManager.getFile(uploadRes1.file.name);
    }
    let file2 = await fileManager.getFile(uploadRes2.file.name);
    while (file2.state === "PROCESSING") {
      process.stdout.write(".");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      file2 = await fileManager.getFile(uploadRes2.file.name);
    }
    console.log("\nFiles are ready!");

    console.log("Generating notes with Gemini...");
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
You are an expert AI tutor. 
Based on these two uploaded PDF documents for the course CYS 322 (Mobile and Wireless Security), generate very comprehensive, highly detailed study notes.
The notes must be divided into exactly 5 logical chapters. 
Each chapter should contain extensive markdown content with headers, bullet points, definitions, and explanations based on the PDF material. It should feel like reading a detailed textbook.

Output ONLY a valid JSON array of objects.
Each object must have the following keys:
- "chapterTitle": The title of the chapter (e.g., "Chapter 1: Introduction to Mobile Security").
- "content": A long, detailed string of Markdown-formatted text containing the full notes for that chapter.
    `;

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadRes1.file.mimeType,
          fileUri: uploadRes1.file.uri
        }
      },
      {
        fileData: {
          mimeType: uploadRes2.file.mimeType,
          fileUri: uploadRes2.file.uri
        }
      },
      { text: prompt }
    ]);

    let responseText = result.response.text();
    if (responseText.startsWith('```json')) {
      responseText = responseText.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (responseText.startsWith('```')) {
      responseText = responseText.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    let notesData;
    try {
      notesData = JSON.parse(responseText);
    } catch (e) {
      console.error("Failed to parse JSON response:", responseText);
      process.exit(1);
    }

    console.log(`Generated ${notesData.length} chapters.`);

    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const courses = await db.collection('courses').find({ title: /CYS 322/i }).toArray();
    console.log(`Found ${courses.length} CYS 322 courses in database.`);

    for (const course of courses) {
      console.log(`Replacing notes for course: ${course.title}...`);
      await CourseNote.deleteMany({ course: course._id });
      
      let order = 1;
      for (const note of notesData) {
        await CourseNote.create({
          course: course._id,
          chapterTitle: note.chapterTitle,
          content: note.content,
          order: order++
        });
      }
    }

    console.log('Successfully generated and updated detailed notes for CYS 322!');
    process.exit(0);

  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1);
  }
}

main();
