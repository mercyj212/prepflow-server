require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require('mongoose');

const apiKey = process.env.GEMINI_API_KEY_2 || process.env.GEMINI_API_KEY;
console.log(`Using API Key ending in ...${apiKey.slice(-6)}`);

const genAI = new GoogleGenerativeAI(apiKey);

const delay = (ms) => new Promise(r => setTimeout(r, ms));

async function callWithRetry(fn, retries = 6, initialDelay = 5000) {
  let waitTime = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const msg = err.message || '';
      const isRetryable = msg.includes('429') || msg.includes('Quota') || msg.includes('503') || msg.includes('Service Unavailable') || msg.includes('OVERLOADED');
      if (isRetryable && i < retries - 1) {
        console.log(`  ⚠️ API temporary error (${msg.slice(0, 60)}...). Retrying in ${Math.round(waitTime / 1000)}s (Attempt ${i + 1}/${retries})...`);
        await delay(waitTime);
        waitTime = Math.round(waitTime * 1.5);
      } else {
        throw err;
      }
    }
  }
}

function needsBalancing(options) {
  if (!options || options.length < 2) return false;
  const correctOpt = options.find(o => o.isCorrect);
  const incorrectOpts = options.filter(o => !o.isCorrect);
  if (!correctOpt || incorrectOpts.length === 0) return false;

  const correctLen = correctOpt.text.length;
  const avgIncorrectLen = incorrectOpts.reduce((acc, o) => acc + o.text.length, 0) / incorrectOpts.length;

  // Correct is > 1.35x longer than distractors OR any distractor is < 50% length of correct
  if (correctLen > avgIncorrectLen * 1.35 && (correctLen - avgIncorrectLen) > 12) {
    return true;
  }
  return false;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

async function balanceBatch(questionsToBalance, model) {
  const prompt = `
You are an expert exam creator and psychometrician specializing in Multiple Choice Questions (MCQ).
Below is a JSON array of questions where the correct answer is currently longer or more detailed than the distractor options, making it easy for students to guess.

YOUR TASK:
For each question, rewrite the 4 options so that:
1. ALL 4 options are EQUALLY DETAILED, equal in word count and character length, and use matching sentence structure/grammar.
2. The correct option text remains 100% factually accurate.
3. The incorrect options (distractors) are expanded to be equally plausible, complete, and sophisticated as the correct option, so length CANNOT be used as a shortcut to guess the correct answer.
4. Maintain the existing "text", "options" ([{text, isCorrect}], exact 1 correct), "explanation", and "subject".

Input Questions JSON:
${JSON.stringify(questionsToBalance, null, 2)}

Return a JSON array of the updated questions.
`;

  const res = await callWithRetry(() => model.generateContent(prompt));
  const rawText = res.response.text().trim();
  return JSON.parse(rawText);
}

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const model = genAI.getGenerativeModel({
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
            required: ["text", "options", "explanation"]
          }
        }
      }
    });

    const quizzes = await db.collection('quizzes').find({}).toArray();
    console.log(`Processing ${quizzes.length} quizzes for option length balancing...\n`);

    let totalUpdated = 0;

    for (const quiz of quizzes) {
      const questions = quiz.questions || [];
      const imbalancedIndices = [];

      for (let i = 0; i < questions.length; i++) {
        if (needsBalancing(questions[i].options)) {
          imbalancedIndices.push(i);
        }
      }

      if (imbalancedIndices.length === 0) {
        console.log(`  ✓ Quiz "${quiz.title}": 0 imbalanced questions. Skipping.`);
        continue;
      }

      console.log(`\n🔹 Quiz "${quiz.title}" [ID: ${quiz._id}]: ${imbalancedIndices.length}/${questions.length} imbalanced questions.`);

      // Process in batches of 15 questions to stay well within token limits
      const BATCH_SIZE = 15;
      const updatedQuestions = [...questions];

      for (let b = 0; b < imbalancedIndices.length; b += BATCH_SIZE) {
        const batchIndices = imbalancedIndices.slice(b, b + BATCH_SIZE);
        const batchPayload = batchIndices.map(idx => ({
          text: questions[idx].text,
          options: questions[idx].options,
          explanation: questions[idx].explanation || "",
          subject: questions[idx].subject || ""
        }));

        console.log(`   Processing batch ${Math.floor(b / BATCH_SIZE) + 1}/${Math.ceil(imbalancedIndices.length / BATCH_SIZE)} (${batchPayload.length} questions)...`);
        await delay(2000);

        try {
          const balancedResults = await balanceBatch(batchPayload, model);
          for (let k = 0; k < batchIndices.length; k++) {
            const originalIdx = batchIndices[k];
            if (balancedResults[k] && balancedResults[k].options) {
              const shuffledOptions = shuffle(balancedResults[k].options);
              updatedQuestions[originalIdx] = {
                ...updatedQuestions[originalIdx],
                options: shuffledOptions,
                explanation: balancedResults[k].explanation || updatedQuestions[originalIdx].explanation
              };
              totalUpdated++;
            }
          }
        } catch (err) {
          console.error(`   ❌ Failed batch starting at index ${b}:`, err.message);
        }
      }

      // Update Quiz document in MongoDB
      await db.collection('quizzes').updateOne(
        { _id: quiz._id },
        { $set: { questions: updatedQuestions, updatedAt: new Date() } }
      );
      console.log(`   ✅ Saved updated Quiz "${quiz.title}" to MongoDB.`);
    }

    console.log(`\n================ FINAL SUMMARY ================`);
    console.log(`Total Quizzes Processed: ${quizzes.length}`);
    console.log(`Total Questions Balanced & Re-shuffled: ${totalUpdated}`);
    console.log(`===============================================`);

    console.log('\n🎉 ALL QUIZ OPTIONS BALANCED SUCCESSFULLY!');
    process.exit(0);

  } catch (err) {
    console.error('An error occurred:', err);
    process.exit(1);
  }
}

main();
