import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Quiz from "../models/Quiz.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
  }
});

const balanceOptions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for balancing options.");

    const quizzes = await Quiz.find({});
    let totalQuestions = 0;
    let rewrittenQuestions = 0;

    for (const quiz of quizzes) {
      console.log(`Processing quiz: ${quiz.title}`);
      let quizUpdated = false;

      for (const question of quiz.questions) {
        totalQuestions++;
        const options = question.options;
        if (!options || options.length < 2) continue;

        const correctOption = options.find(o => o.isCorrect);
        if (!correctOption) continue;

        const lengths = options.map(o => o.text.length);
        const maxLen = Math.max(...lengths);
        const minLen = Math.min(...lengths);
        
        // If the correct option is significantly longer than the shortest option, it's a "tell"
        // Let's use a threshold: if max length > 1.8 * min length AND the longest option is the correct one.
        // Actually, let's just balance any question where max length > 1.8 * min length.
        if (maxLen > 30 && maxLen > minLen * 1.8) {
          console.log(`\nRebalancing question: "${question.text.substring(0, 50)}..."`);
          console.log(`Lengths: ${lengths.join(', ')}`);

          const prompt = `
You are an expert test creator. We have a multiple-choice question where the options are unbalanced in length, which might give away the answer to test-wise students.
Your task is to rewrite the options so they are all roughly the same length and level of detail.

Question: ${question.text}
Explanation: ${question.explanation || 'None'}

Current Options:
${options.map((o, i) => `${i + 1}. [${o.isCorrect ? 'CORRECT' : 'INCORRECT'}] ${o.text}`).join('\n')}

Rules:
1. Do NOT change which option is correct.
2. Keep the meaning of the correct option exactly the same.
3. Rewrite the incorrect options to be just as long, detailed, and plausible-sounding as the correct option (or shorten the correct option, or both).
4. Do not make the correct option stand out.
5. Return the exact same number of options.
6. The JSON output must be an array of objects, where each object has "text" (string) and "isCorrect" (boolean). Ensure the true/false values exactly match the original ones.
          `;

          try {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();
            let newOptions = JSON.parse(responseText);

            if (Array.isArray(newOptions) && newOptions.length === options.length) {
              const hasOneCorrect = newOptions.filter(o => o.isCorrect).length === 1;
              if (hasOneCorrect) {
                // Update the options
                question.options = newOptions.map(o => ({
                  text: o.text,
                  isCorrect: o.isCorrect
                }));
                quizUpdated = true;
                rewrittenQuestions++;
                console.log(`Success! New lengths: ${newOptions.map(o => o.text.length).join(', ')}`);
              } else {
                console.log(`Failed: Output did not have exactly one correct option.`);
              }
            } else {
              console.log(`Failed: Invalid JSON shape returned.`);
            }
            console.log("Waiting 13 seconds for rate limits...");
            await new Promise(resolve => setTimeout(resolve, 13000));
          } catch (e) {
            console.error(`Gemini API error for question:`, e.message);
            console.log("Waiting 15 seconds to recover from error...");
            await new Promise(resolve => setTimeout(resolve, 15000));
          }
        }
      }

      if (quizUpdated) {
        await quiz.save();
        console.log(`Saved updates for quiz: ${quiz.title}`);
      }
    }

    console.log(`\nDone! Processed ${totalQuestions} questions, rewritten ${rewrittenQuestions}.`);
    process.exit(0);
  } catch (error) {
    console.error("Script failed:", error);
    process.exit(1);
  }
};

balanceOptions();
