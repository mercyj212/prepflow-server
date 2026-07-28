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
    const uploadRes2 = await fileManager.uploadFile("../pdfs/CYS3222@.pdf", {
      mimeType: "application/pdf",
      displayName: "CYS 322 PDF 2",
    });

    console.log("Waiting for processing...");
    let file1 = await fileManager.getFile(uploadRes1.file.name);
    while (file1.state === "PROCESSING") {
      await new Promise((r) => setTimeout(r, 2000));
      file1 = await fileManager.getFile(uploadRes1.file.name);
    }
    let file2 = await fileManager.getFile(uploadRes2.file.name);
    while (file2.state === "PROCESSING") {
      await new Promise((r) => setTimeout(r, 2000));
      file2 = await fileManager.getFile(uploadRes2.file.name);
    }
    console.log("Files ready!");

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const chapters = [
      "Chapter 1: Foundations of Mobile and Wireless Security",
      "Chapter 2: Wireless Network Technologies and Security Protocols",
      "Chapter 3: Network Communication Models and Wireless Network Security",
      "Chapter 4: Threats, Vulnerabilities, and Countermeasures in Mobile and Wireless Environments",
      "Chapter 5: Advanced Topics in Mobile Security"
    ];

    const notesData = [];

    for (let i = 0; i < chapters.length; i++) {
      console.log(`Generating ${chapters[i]}...`);
      const prompt = `You are an expert AI tutor. Based on the uploaded PDFs for CYS 322 (Mobile and Wireless Security), generate VERY comprehensive, highly detailed study notes for ONLY "${chapters[i]}".
      
      Requirements:
      - This should be extremely long and detailed, acting as a complete textbook chapter.
      - Use rich Markdown formatting (headers, bullet points, bold text, definitions, code blocks if applicable).
      - Do not output JSON. Just output the raw Markdown content for this specific chapter.`;

      const result = await model.generateContent([
        { fileData: { mimeType: uploadRes1.file.mimeType, fileUri: uploadRes1.file.uri } },
        { fileData: { mimeType: uploadRes2.file.mimeType, fileUri: uploadRes2.file.uri } },
        { text: prompt }
      ]);
      
      notesData.push({
        chapterTitle: chapters[i],
        content: result.response.text(),
        order: i + 1
      });
      console.log(`Generated ${notesData[i].content.length} characters for Chapter ${i+1}.`);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const courses = await db.collection('courses').find({ title: /CYS 322/i }).toArray();
    
    for (const course of courses) {
      console.log(`Replacing notes for course: ${course.title}...`);
      await CourseNote.deleteMany({ course: course._id });
      
      for (const note of notesData) {
        await CourseNote.create({
          course: course._id,
          chapterTitle: note.chapterTitle,
          content: note.content,
          order: note.order
        });
      }
    }

    console.log('Successfully generated full notes chapter-by-chapter!');
    process.exit(0);

  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1);
  }
}

main();
