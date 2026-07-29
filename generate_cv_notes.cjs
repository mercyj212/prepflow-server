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
const Course = mongoose.models.Course || mongoose.model("Course", new mongoose.Schema({
    title: String,
    code: String,
    level: String,
    department: String,
    semester: String,
    credits: Number,
    isActive: Boolean
}, { strict: false }));

async function main() {
  try {
    console.log("Uploading files to Gemini...");
    const uploadRes1 = await fileManager.uploadFile("../pdfs/Computer Vision.pdf", {
      mimeType: "application/pdf",
      displayName: "CV PDF 1",
    });
    console.log(`Uploaded ${uploadRes1.file.displayName} as: ${uploadRes1.file.name}`);

    const uploadRes2 = await fileManager.uploadFile("../pdfs/Computer Visition2.pdf", {
      mimeType: "application/pdf",
      displayName: "CV PDF 2",
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
You are an expert AI professor. 
Based on these two uploaded PDF documents for the course "Computer Vision", generate very comprehensive, highly detailed study notes.
The notes must be divided into exactly 7 logical chapters. 
Each chapter should contain extensive markdown content with headers, bullet points, definitions, algorithms, and mathematical explanations based on the PDF material. 
It should be arranged well, like a detailed textbook, moving from introductory concepts to advanced techniques.

DO NOT OUTPUT JSON. Instead, output the chapters in plain Markdown.
Separate each chapter using exactly this delimiter on a new line: ---CHAPTER_DELIMITER---

Format each chapter starting with the title as an H1 heading (e.g., # Chapter 1: Introduction to Computer Vision), followed by the content.
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
    
    // Parse responseText by delimiter
    const chapterBlocks = responseText.split('---CHAPTER_DELIMITER---').map(s => s.trim()).filter(s => s.length > 0);
    
    let notesData = [];
    for (const block of chapterBlocks) {
      // Find the first line to use as title
      const lines = block.split('\n');
      let title = "Chapter";
      let content = block;
      
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('# ')) {
          title = lines[i].replace('# ', '').trim();
          break;
        }
      }
      
      notesData.push({
        chapterTitle: title,
        content: content
      });
    }

    if (notesData.length === 0) {
      console.error("Failed to parse chapters.");
      process.exit(1);
    }

    console.log(`Generated ${notesData.length} chapters.`);

    await mongoose.connect(process.env.MONGODB_URI);
    const course = await Course.findOne({ title: /computer vision/i });
    if (!course) {
        console.log("Course not found!");
        process.exit(1);
    }

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

    console.log('Successfully generated and updated detailed notes for Computer Vision!');
    process.exit(0);

  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1);
  }
}

main();
