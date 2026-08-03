require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require('mongoose');
const path = require('path');
const crypto = require('crypto');

const apiKeys = [
  process.env.GEMINI_API_KEY,
  process.env.GEMINI_API_KEY_2
].filter(Boolean);

let currentKeyIndex = 0;

function getGenerativeModel(modelName, config = {}) {
  const apiKey = apiKeys[currentKeyIndex % apiKeys.length];
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: modelName,
    generationConfig: config
  });
}

function rotateKey() {
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  console.log(`  🔄 Rotating API Key to Key #${currentKeyIndex + 1} (ending in ...${apiKeys[currentKeyIndex].slice(-6)})`);
}

const delay = (ms) => new Promise(r => setTimeout(r, ms));

async function callWithRetry(fn, retries = 6, initialDelay = 3000) {
  let waitTime = initialDelay;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err) {
      const msg = err.message || '';
      console.log(`  ⚠️ Error encountered (${msg.slice(0, 80)}...). Retrying in ${Math.round(waitTime / 1000)}s (Attempt ${i + 1}/${retries})...`);
      rotateKey();
      await delay(waitTime);
      waitTime = Math.round(waitTime * 1.3);
    }
  }
  throw new Error("Max retries exceeded");
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function main() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const swdDeptId = new mongoose.Types.ObjectId('69f329129ff6793adc556004'); // Software and Web Development (SWD) ONLY

    let course = await db.collection('courses').findOne({
      title: /ADVANCED STATISTICS FOR COMPUTING/i,
      department: swdDeptId
    });

    if (!course) {
      const newCourseDoc = {
        title: 'ADVANCED STATISTICS FOR COMPUTING',
        description: 'Advanced Statistics for Computing course based strictly on the official ADVANCED STATISTICS FOR COMPUTING textbook. Covers probability distributions, statistical inference, hypothesis testing, regression & correlation, ANOVA, non-parametric tests, stochastic processes, and data analysis for software engineers.',
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
    }

    // Fetch notes from MongoDB as text context
    const notesDocs = await db.collection('coursenotes').find({ course: course._id }).sort({ order: 1 }).toArray();
    const notesContext = notesDocs.map(n => `CHAPTER: ${n.chapterTitle}\n${n.content}`).join('\n\n====================\n\n');

    console.log(`Loaded ${notesDocs.length} chapters of course notes (${notesContext.length} chars) from MongoDB.`);

    // Load existing questions
    const existingQuiz = await db.collection('quizzes').findOne({ course: course._id });
    let allQuestions = existingQuiz?.questions || [];
    console.log(`Starting with ${allQuestions.length} existing questions in MongoDB.`);

    const topics = [
      "Probability Axioms, Permutations, Combinations, Conditional Probability, and Bayes Theorem",
      "Discrete Probability Distributions: Binomial, Poisson, Hypergeometric, and Geometric Distributions",
      "Continuous Probability Distributions: Uniform, Exponential, Normal, and Standard Normal (Z-score)",
      "Sampling Theory, Central Limit Theorem, and Standard Error of the Mean",
      "Point Estimation, Unbiased Estimators, and Confidence Intervals for Means and Proportions",
      "Hypothesis Testing Principles, One-Sample Z-tests and t-tests, Type I & Type II Errors, and p-values",
      "Two-Sample Hypothesis Testing (Independent & Paired t-tests) and Variance Ratio (F-tests)",
      "Analysis of Variance: One-Way ANOVA, Two-Way ANOVA, Sum of Squares, and F-ratio interpretations",
      "Chi-Square Tests: Contingency Tables, Goodness-of-Fit Tests, Independence Tests, and Degrees of Freedom",
      "Simple & Multiple Linear Regression, Pearson/Spearman Correlation, R-squared, and Statistical Computing Applications"
    ];

    let batchIdx = 0;
    while (allQuestions.length < 250) {
      const currentTopic = topics[batchIdx % topics.length];
      const questionsNeeded = Math.min(25, 250 - allQuestions.length);
      console.log(`\nGenerating Batch ${batchIdx + 1} (${questionsNeeded} questions on: ${currentTopic}). Current Total: ${allQuestions.length}/250...`);
      await delay(2000);

      const qPrompt = `
You are a senior university professor of Applied Statistics and Quantitative Methods for Software Engineering.
Based STRICTLY on the attached ADVANCED STATISTICS FOR COMPUTING textbook notes below, generate EXACTLY ${questionsNeeded} unique, high-quality multiple-choice questions covering: ${currentTopic}.

TEXTBOOK NOTES CONTEXT:
${notesContext.slice(0, 20000)}

CRITICAL PSYCHOMETRIC & OPTION BALANCE RULES:
1. Each question MUST have exactly 4 options (A, B, C, D).
2. Exactly ONE option MUST have "isCorrect": true, and the other 3 MUST be false.
3. ABSOLUTE OPTION LENGTH BALANCE: All 4 options MUST be written with EQUAL DETAIL, EQUAL WORD COUNT, EQUAL CHARACTER LENGTH, and MATCHING GRAMMATICAL STRUCTURE.
   - NEVER make the correct option longer, more descriptive, or more qualified than the distractors.
   - The distractors MUST be realistic, sophisticated, and equally detailed scientific statements so students cannot guess the answer by option length alone.
4. Explanations must be thorough, step-by-step mathematical proofs or conceptual clarifications referencing formulas and principles from the textbook notes.
5. Do NOT repeat any question topic or phrasing.
`;

      try {
        const questionModel = getGenerativeModel("gemini-2.5-flash", {
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
        });

        const qRes = await callWithRetry(() => questionModel.generateContent(qPrompt));
        const rawQs = JSON.parse(qRes.response.text().trim());

        const batchQs = rawQs.map(q => ({
          ...q,
          options: shuffle(q.options)
        }));

        console.log(`  ✓ Batch ${batchIdx + 1} generated ${batchQs.length} balanced questions.`);
        allQuestions.push(...batchQs);

        // Update MongoDB immediately
        await db.collection('quizzes').updateOne(
          { course: course._id },
          {
            $set: {
              title: "ADVANCED STATISTICS CBT PRACTICE EXAM",
              description: `Comprehensive 250-question practice exam created directly from the ADVANCED STATISTICS FOR COMPUTING textbook for Software & Web Development (SWD). Covers probability distributions, statistical inference, hypothesis testing, ANOVA, linear regression & correlation, Chi-square tests, and quantitative data analysis. (60 random questions per 30-minute exam session).`,
              course: course._id,
              questions: allQuestions,
              timeLimit: 30,
              duration: 30,
              isActive: true,
              updatedAt: new Date()
            },
            $setOnInsert: { createdAt: new Date() }
          },
          { upsert: true }
        );
        console.log(`  💾 Updated MongoDB! Total questions now: ${allQuestions.length}/250`);
      } catch (err) {
        console.error(`  ❌ Batch ${batchIdx + 1} failed:`, err.message);
      }
      batchIdx++;
    }

    // Auto-Grant Access to Approved Users
    const approvedEmails = [
      'jaymercy510@gmail.com',
      'franklinpeter2020@gmail.com',
      'ebubeonuorahobi@gmail.com',
      'perryxau@gmail.com',
      'danieleneluwe@gmail.com'
    ];

    const approvedStudents = await db.collection('students').find({
      email: { $in: approvedEmails }
    }).toArray();

    for (const s of approvedStudents) {
      await db.collection('courseaccesses').updateOne(
        { student: s._id, course: course._id },
        {
          $set: {
            student: s._id,
            course: course._id,
            accessToken: crypto.randomBytes(16).toString('hex'),
            isActive: true,
            isUsed: true,
            firstUsedAt: new Date(),
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );
    }
    console.log(`✅ Auto-granted Advanced Statistics access to ${approvedStudents.length} approved users.`);

    const finalQuiz = await db.collection('quizzes').findOne({ course: course._id });
    console.log('\n================ VERIFICATION ================');
    console.log(`Course Title: ${course.title}`);
    console.log(`Department:   Software and Web Development (SWD) ONLY`);
    console.log(`Quiz Title:   ${finalQuiz.title}`);
    console.log(`Total Qs:     ${finalQuiz.questions?.length}`);
    console.log(`Time Limit:   ${finalQuiz.timeLimit} minutes`);
    console.log('==============================================');

    console.log('\n🎉 ADVANCED STATISTICS FOR COMPUTING COMPLETED SUCCESSFULLY FOR SWD!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ An error occurred:', error.message || error);
    process.exit(1);
  }
}

main();
