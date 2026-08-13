import assert from "assert/strict";
import {
  validateStructure,
  detectLengthOutliers,
  detectGrammaticalClues,
  evaluateDistractorQuality,
  detectDuplicates,
  calculateQualityScore,
  shuffleOptionsWithTracking,
  balanceBatchPositions,
  sanitizeQuestionForStudent
} from "../utils/mcqQualityPipeline.js";
import { MCQ_QUALITY_CONFIG } from "../config/mcqQualityConfig.js";

console.log("🧪 Running MCQ Quality Control Pipeline Test Suite...\n");

let passedCount = 0;
let totalCount = 0;

function runTest(description, testFn) {
  totalCount++;
  try {
    testFn();
    console.log(`  ✅ TEST ${totalCount}: ${description}`);
    passedCount++;
  } catch (err) {
    console.error(`  ❌ TEST ${totalCount} FAILED: ${description}`);
    console.error(`     Error: ${err.message}`);
  }
}

// 1. Structure Validation Test
runTest("Four-option validation & structure check", () => {
  const invalidThreeOpts = {
    text: "What is entrepreneurship?",
    options: [
      { text: "Business creation", isCorrect: true },
      { text: "Playing sports", isCorrect: false },
      { text: "Cooking food", isCorrect: false }
    ]
  };
  const struct1 = validateStructure(invalidThreeOpts);
  assert.equal(struct1.valid, false);
  assert.ok(struct1.reasons.some(r => r.includes("must have exactly 4 options")));

  const validFourOpts = {
    text: "What is entrepreneurship?",
    options: [
      { text: "Identifying opportunities and creating value through business ventures", isCorrect: true },
      { text: "Working in a government ministry for a fixed monthly salary", isCorrect: false },
      { text: "Investing exclusively in foreign stock market indices", isCorrect: false },
      { text: "Operating non-profit community welfare projects", isCorrect: false }
    ]
  };
  const struct2 = validateStructure(validFourOpts);
  assert.equal(struct2.valid, true);
});

// 2. Option Length Outlier Detection Test
runTest("Option-length outlier detection for overly long correct answer", () => {
  const outlierQ = {
    text: "What is a sole proprietorship?",
    options: [
      { text: "A store", isCorrect: false },
      { text: "A small firm", isCorrect: false },
      { text: "A business structure owned, managed, and controlled by a single individual who assumes full financial responsibility and retains 100% of all generated net profits", isCorrect: true },
      { text: "A company", isCorrect: false }
    ]
  };
  const res = detectLengthOutliers(outlierQ);
  assert.equal(res.isOutlier, true);
  assert.ok(res.reasons.some(r => r.includes("outlier")));
});

// 3. Grammatical Clue Detection Test
runTest("Grammatical and explanatory clue detection", () => {
  const clueQ = {
    text: "Why do entrepreneurs conduct market research?",
    options: [
      { text: "Because it allows them to identify target customers, evaluate demand, and assess competitors effectively.", isCorrect: true },
      { text: "Market research", isCorrect: false },
      { text: "Business strategy", isCorrect: false },
      { text: "Financial profit", isCorrect: false }
    ]
  };
  const res = detectGrammaticalClues(clueQ);
  assert.equal(res.hasClues, true);
  assert.ok(res.reasons.some(r => r.includes("because")));
});

// 4. Duplicate Options & Duplicate Questions Test
runTest("Duplicate options & near-duplicate question detection", () => {
  const dupOptionQ = {
    text: "Which of the following is a factor of production?",
    options: [
      { text: "Capital", isCorrect: true },
      { text: "Capital", isCorrect: false },
      { text: "Labour", isCorrect: false },
      { text: "Land", isCorrect: false }
    ]
  };
  const res1 = detectDuplicates(dupOptionQ, []);
  assert.equal(res1.hasDuplicates, true);
  assert.ok(res1.reasons.some(r => r.includes("duplicate option")));

  const existingBank = [
    { text: "Which of the following is a key factor of production in modern economics?" }
  ];
  const nearDupQ = {
    text: "Which of the following is a key factor of production in modern economics?",
    options: [
      { text: "Capital", isCorrect: true },
      { text: "Interest", isCorrect: false },
      { text: "Rent", isCorrect: false },
      { text: "Wages", isCorrect: false }
    ]
  };
  const res2 = detectDuplicates(nearDupQ, existingBank);
  assert.equal(res2.hasDuplicates, true);
  assert.ok(res2.reasons.some(r => r.includes("near-duplicate")));
});

// 5. Quality Score Calculation Test
runTest("Composite quality score calculation and pass/fail classification", () => {
  const excellentQ = {
    text: "Which form of business organization provides separate legal personality to its owners?",
    options: [
      { text: "Incorporated limited liability company", isCorrect: true },
      { text: "Traditional sole proprietorship enterprise", isCorrect: false },
      { text: "General partnership agreement venture", isCorrect: false },
      { text: "Informal street trading association", isCorrect: false }
    ]
  };
  const scoreResult1 = calculateQualityScore(excellentQ, []);
  assert.ok(scoreResult1.score >= 90);
  assert.equal(scoreResult1.status, "passed");

  const badQ = {
    text: "What is capital?",
    options: [
      { text: "Money", isCorrect: false },
      { text: "Money", isCorrect: false },
      { text: "Capital refers to financial assets, machinery, buildings, and physical resources deployed by an entrepreneur to establish and operate commercial business operations efficiently", isCorrect: true },
      { text: "Goods", isCorrect: false }
    ]
  };
  const scoreResult2 = calculateQualityScore(badQ, []);
  assert.ok(scoreResult2.score < MCQ_QUALITY_CONFIG.QUALITY_PASS_SCORE);
  assert.equal(scoreResult2.status, "failed");
});

// 6. Option Shuffling & Correct Answer Tracking Test
runTest("Option shuffling preserves correct answer factual accuracy", () => {
  const originalQ = {
    text: "What is the primary motive of an entrepreneur?",
    options: [
      { text: "Pursuit of independence and value creation", isCorrect: true },
      { text: "Avoiding all form of work", isCorrect: false },
      { text: "Working for government salary", isCorrect: false },
      { text: "Paying higher corporate taxes", isCorrect: false }
    ]
  };

  const shuffled = shuffleOptionsWithTracking(originalQ);
  const correctOption = shuffled.options.find(o => o.isCorrect);
  assert.ok(correctOption);
  assert.equal(correctOption.text, "Pursuit of independence and value creation");
  assert.equal(shuffled.options.filter(o => o.isCorrect).length, 1);
});

// 7. Batch Position Balancing Test
runTest("Batch position balancing distributes correct answers across A, B, C, D", () => {
  const batch = Array.from({ length: 12 }, (_, i) => ({
    text: `Sample Question ${i + 1}`,
    options: [
      { text: `Correct Answer ${i + 1}`, isCorrect: true },
      { text: `Distractor 1 for Q${i + 1}`, isCorrect: false },
      { text: `Distractor 2 for Q${i + 1}`, isCorrect: false },
      { text: `Distractor 3 for Q${i + 1}`, isCorrect: false }
    ]
  }));

  const balancedBatch = balanceBatchPositions(batch);
  const positionCounts = { 0: 0, 1: 0, 2: 0, 3: 0 };
  
  balancedBatch.forEach(q => {
    const idx = q.options.findIndex(o => o.isCorrect);
    positionCounts[idx]++;
  });

  assert.equal(positionCounts[0], 3); // 3 A's
  assert.equal(positionCounts[1], 3); // 3 B's
  assert.equal(positionCounts[2], 3); // 3 C's
  assert.equal(positionCounts[3], 3); // 3 D's
});

// 8. Student Security Sanitization Test
runTest("Sanitizing question payload strips internal admin quality metadata", () => {
  const rawAdminQ = {
    text: "Who is an entrepreneur?",
    options: [
      { text: "A risk-taker", isCorrect: true },
      { text: "A passive worker", isCorrect: false },
      { text: "A government agent", isCorrect: false },
      { text: "A consumer", isCorrect: false }
    ],
    qualityScore: 95,
    validationStatus: "passed",
    rejectionReasons: [],
    regenerationCount: 0,
    needsAdminReview: false
  };

  const studentQ = sanitizeQuestionForStudent(rawAdminQ);
  assert.equal(studentQ.qualityScore, undefined);
  assert.equal(studentQ.validationStatus, undefined);
  assert.equal(studentQ.rejectionReasons, undefined);
  assert.equal(studentQ.regenerationCount, undefined);
  assert.equal(studentQ.needsAdminReview, undefined);
  assert.equal(studentQ.text, "Who is an entrepreneur?");
});

console.log(`\n🎉 TEST RESULTS: ${passedCount}/${totalCount} tests passed successfully!`);
if (passedCount === totalCount) {
  process.exit(0);
} else {
  process.exit(1);
}
