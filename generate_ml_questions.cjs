require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const mongoose = require('mongoose');

const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  isCorrect: { type: Boolean, required: true, default: false }
});

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true, trim: true },
  options: [optionSchema],
  explanation: { type: String, default: "", trim: true },
  subject: { type: String, default: "General", trim: true }
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, default: "", trim: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  questions: [questionSchema],
  timeLimit: { type: Number, default: 30 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", quizSchema);

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const db = mongoose.connection.db;
    const course = await db.collection('courses').findOne({ title: /machine learning/i });
    if (!course) {
      console.log("Could not find Machine Learning course.");
      process.exit(1);
    }
    console.log(`Found course: ${course.title}`);

    console.log("Uploading file to Gemini...");
    const uploadRes = await fileManager.uploadFile("../pdfs/machine learning2.pdf", {
      mimeType: "application/pdf",
      displayName: "Machine Learning PDF",
    });
    console.log(`Uploaded ${uploadRes.file.displayName} as: ${uploadRes.file.name}`);

    // Wait for file processing
    console.log("Waiting for file to be processed...");
    let file = await fileManager.getFile(uploadRes.file.name);
    while (file.state === "PROCESSING") {
      process.stdout.write(".");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      file = await fileManager.getFile(uploadRes.file.name);
    }
    if (file.state === "FAILED") {
      console.error("\nFile processing failed.");
      process.exit(1);
    }
    console.log("\nFile is ready!");

    console.log("Generating questions with Gemini...");
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      generationConfig: { responseMimeType: "application/json" }
    });

    const prompt = `
You are an expert AI professor. 
Based on the uploaded PDF document for Machine Learning, generate 50 multiple choice questions. 
Extract key concepts, definitions, algorithms, and practical applications directly from the document content.

Format your response exactly as this JSON array:
[
  {
    "text": "Question text here?",
    "options": [
      { "text": "Correct answer", "isCorrect": true },
      { "text": "Wrong answer 1", "isCorrect": false },
      { "text": "Wrong answer 2", "isCorrect": false },
      { "text": "Wrong answer 3", "isCorrect": false }
    ],
    "explanation": "Brief explanation of why the answer is correct.",
    "subject": "Machine Learning"
  }
]
Please generate exactly 50 distinct questions covering the entire document. Ensure each question has exactly one correct option.
`;

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadRes.file.mimeType,
          fileUri: uploadRes.file.uri
        }
      },
      { text: prompt }
    ]);

    const generatedText = result.response.text();
    const parsedQuestions = JSON.parse(generatedText);
    
    console.log(`Successfully generated ${parsedQuestions.length} questions.`);

    // Find or create quiz
    let quiz = await Quiz.findOne({ course: course._id });
    if (!quiz) {
      quiz = new Quiz({
        title: "Machine Learning Quiz",
        description: "Comprehensive quiz covering topics from the course material.",
        course: course._id,
        questions: parsedQuestions,
        timeLimit: 60,
        isActive: true
      });
      console.log("Creating new quiz with generated questions...");
    } else {
      quiz.questions = [...quiz.questions, ...parsedQuestions];
      console.log(`Adding ${parsedQuestions.length} questions to existing quiz. Total questions will be ${quiz.questions.length}.`);
    }

    await quiz.save();
    console.log("Quiz saved successfully!");
    
    process.exit(0);
  } catch (error) {
    console.error("Error generating questions:", error);
    process.exit(1);
  }
}

main();
