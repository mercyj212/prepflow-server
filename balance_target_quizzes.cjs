require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require('mongoose');

const apiKeys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2
].filter(Boolean);

let currentKeyIndex = 0;

function getGenerativeModel(modelName) {
  const apiKey = apiKeys[currentKeyIndex % apiKeys.length];
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: modelName,
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
}

function rotateKey() {
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  console.log(`  🔄 Rotating API Key to Key #${currentKeyIndex + 1} (ending in ...${apiKeys[currentKeyIndex].slice(-6)})`);
}

const delay = (ms) => new Promise(r => setTimeout(r, ms));

async function callWithRetry(promptFn, retries = 6, initialDelay = 5000) {
  let waitTime = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      const model = getGenerativeModel("gemini-2.5-flash");
      return await promptFn(model);
    } catch (err) {
      const msg = err.message || '';
      const isRetryable = msg.includes('429') || msg.includes('Quota') || msg.includes('503') || msg.includes('Service Unavailable') || msg.includes('OVERLOADED');
      if (isRetryable) {
        rotateKey();
        console.log(`  ⚠️ API temporary error (${msg.slice(0, 60)}...). Retrying in ${Math.round(waitTime / 1000)}s (Attempt ${i + 1}/${retries})...`);
        await delay(waitTime);
        waitTime = Math.round(waitTime * 1.3);
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

  if (correctLen > avgIncorrectLen * 1.3 && (correctLen - avgIncorrectLen) > 10) {
    return true;
  }
  return false;
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function balanceBatch(questionsToBalance) {
  const prompt = `
You are an expert university examiner and psychometrician specializing in Multiple Choice Questions (MCQ).
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

  const res = await callWithRetry((model) => model.generateContent(prompt));
  const rawText = res.response.text().trim();
  return JSON.parse(rawText);
}

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    // TARGET: FRONTEND, BACKEND, CLOUD COMPUTING, ROUTING & SWITCHING, DATABASE DESIGN
    const targetTitles = [
      /FRONTEND WEB DEVELOPMENT/i,
      /BACKEND WEB DEVELOPMENT/i,
      /CLOUD COMPUTING/i,
      /ROUTING AND SWITCHING/i,
      /DATABASE DESIGN/i
    ];

    const quizzes = await db.collection('quizzes').find({
      $or: targetTitles.map(t => ({ title: t }))
    }).toArray();

    console.log(`🎯 Found ${quizzes.length} target quizzes to process:\n`);
    quizzes.forEach(q => console.log(`  - ${q.title} (${q.questions?.length} questions)`));

    let totalUpdated = 0;

    for (const quiz of quizzes) {
      const questions = quiz.questions || [];
      const imbalancedIndices = [];

      for (let i = 0; i < questions.length; i++) {
        if (needsBalancing(questions[i].options)) {
          imbalancedIndices.push(i);
        }
      }

      console.log(`\n==================================================`);
      console.log(`🚀 Processing Quiz: "${quiz.title}" [ID: ${quiz._id}]`);
      console.log(`   Imbalanced Questions: ${imbalancedIndices.length}/${questions.length}`);
      console.log(`==================================================`);

      if (imbalancedIndices.length === 0) {
        console.log(`   ✓ Already perfectly balanced! Skipping.`);
        continue;
      }

      const BATCH_SIZE = 10;
      const updatedQuestions = [...questions];

      for (let b = 0; b < imbalancedIndices.length; b += BATCH_SIZE) {
        const batchIndices = imbalancedIndices.slice(b, b + BATCH_SIZE);
        const batchPayload = batchIndices.map(idx => ({
          text: questions[idx].text,
          options: questions[idx].options,
          explanation: questions[idx].explanation || "",
          subject: questions[idx].subject || ""
        }));

        const currentBatchNum = Math.floor(b / BATCH_SIZE) + 1;
        const totalBatches = Math.ceil(imbalancedIndices.length / BATCH_SIZE);
        console.log(`   Processing batch ${currentBatchNum}/${totalBatches} (${batchPayload.length} questions)...`);

        await delay(3000);

        try {
          const balancedResults = await balanceBatch(batchPayload);
          for (let k = 0; k < batchIndices.length; k++) {
            const originalIdx = batchIndices[k];
            if (balancedResults[k] && balancedResults[k].options && balancedResults[k].options.length === 4) {
              const shuffledOptions = shuffle(balancedResults[k].options);
              updatedQuestions[originalIdx] = {
                ...updatedQuestions[originalIdx],
                options: shuffledOptions,
                explanation: balancedResults[k].explanation || updatedQuestions[originalIdx].explanation
              };
              totalUpdated++;
            }
          }
          console.log(`   ✓ Batch ${currentBatchNum}/${totalBatches} completed.`);

          // Save partial progress every batch so updates are saved immediately!
          await db.collection('quizzes').updateOne(
            { _id: quiz._id },
            { $set: { questions: updatedQuestions, updatedAt: new Date() } }
          );
        } catch (err) {
          console.error(`   ❌ Failed batch starting at index ${b}:`, err.message);
        }
      }

      console.log(`\n✅ SUCCESSFULLY BALANCED AND SAVED "${quiz.title}" TO MONGODB!`);
    }

    console.log(`\n================ FINAL SUMMARY ================`);
    console.log(`Total Target Quizzes Processed: ${quizzes.length}`);
    console.log(`Total Questions Balanced & Re-shuffled: ${totalUpdated}`);
    console.log(`===============================================`);

    console.log('\n🎉 ALL TARGET QUIZZES BALANCED SUCCESSFULLY!');
    process.exit(0);

  } catch (err) {
    console.error('An error occurred:', err);
    process.exit(1);
  }
}

main();
