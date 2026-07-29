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
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    let course = await Course.findOne({ title: /computer vision/i });
    if (!course) {
      console.log("Could not find Computer Vision course. Creating it...");
      course = new Course({
          title: "COMPUTER VISION",
          code: "AIT 314", // Just a guess, it can be updated later
          level: "HND1",
          department: "Artificial Intelligence",
          semester: "Second Semester",
          credits: 3,
          isActive: true
      });
      await course.save();
    }
    console.log(`Found/Created course: ${course.title} (${course._id})`);

    const pdfFiles = ["../pdfs/Computer Vision.pdf", "../pdfs/Computer Visition2.pdf"];
    let allParsedQuestions = [];

    for (const pdfPath of pdfFiles) {
        console.log(`\nUploading file ${pdfPath} to Gemini...`);
        const uploadRes = await fileManager.uploadFile(pdfPath, {
          mimeType: "application/pdf",
          displayName: "Computer Vision PDF",
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
          console.error(`\nFile processing failed for ${pdfPath}`);
          continue;
        }
        console.log("\nFile is ready!");

        console.log("Generating 75 questions with Gemini...");
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash",
          generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `
You are an expert AI professor teaching Computer Vision. 
Based on the uploaded PDF document, generate 75 highly detailed multiple choice questions.
Focus on extracting key concepts, mathematical foundations, algorithms, object detection, image processing, and practical applications directly from the document.
Avoid generic questions; be highly specific to the provided text.

Format your response EXACTLY as this JSON array (no markdown block, just raw JSON array):
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
    "subject": "Computer Vision"
  }
]
Please generate exactly 75 distinct questions. Make sure it is valid JSON.
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
        try {
            const parsedQuestions = JSON.parse(generatedText);
            console.log(`Successfully generated ${parsedQuestions.length} questions from ${pdfPath}.`);
            allParsedQuestions = allParsedQuestions.concat(parsedQuestions);
        } catch (e) {
            console.error(`Failed to parse JSON from ${pdfPath}:`, e.message);
            // In case there is some prefix/suffix
            const match = generatedText.match(/\[.*\]/s);
            if (match) {
                try {
                    const parsed = JSON.parse(match[0]);
                    console.log(`Recovered and parsed ${parsed.length} questions from ${pdfPath}.`);
                    allParsedQuestions = allParsedQuestions.concat(parsed);
                } catch(err) {
                    console.error("Recovery failed.");
                }
            }
        }
    }

    if (allParsedQuestions.length === 0) {
        console.log("No questions generated. Exiting.");
        process.exit(1);
    }

    // Find or create quiz
    let quiz = await Quiz.findOne({ course: course._id });
    if (!quiz) {
      quiz = new Quiz({
        title: "Computer Vision Quiz",
        description: "Comprehensive quiz covering topics from the course material.",
        course: course._id,
        questions: allParsedQuestions,
        timeLimit: 60,
        isActive: true
      });
      console.log("Creating new quiz with generated questions...");
    } else {
      quiz.questions = [...quiz.questions, ...allParsedQuestions];
      console.log(`Adding ${allParsedQuestions.length} questions to existing quiz. Total questions will be ${quiz.questions.length}.`);
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
