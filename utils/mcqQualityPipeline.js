import { MCQ_QUALITY_CONFIG } from "../config/mcqQualityConfig.js";

/**
 * Normalizes text for string comparisons.
 */
function normalizeText(text) {
  if (!text || typeof text !== "string") return "";
  return text.toLowerCase().replace(/[^\w\s]/g, "").replace(/\s+/g, " ").trim();
}

/**
 * Calculates Token Jaccard Similarity between two strings (0.0 to 1.0).
 */
export function calculateStringSimilarity(str1, str2) {
  const norm1 = normalizeText(str1);
  const norm2 = normalizeText(str2);
  if (!norm1 || !norm2) return 0;
  if (norm1 === norm2) return 1.0;

  const set1 = new Set(norm1.split(" "));
  const set2 = new Set(norm2.split(" "));

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
}

/**
 * 1. STRUCTURED QUESTION VALIDATION
 * Checks if question object satisfies strict MCQ structure.
 */
export function validateStructure(question) {
  const reasons = [];
  const qText = question.text || question.question;

  if (!qText || typeof qText !== "string" || !qText.trim()) {
    reasons.push("Question text is empty or missing.");
  }

  const options = question.options;
  if (!Array.isArray(options) || options.length !== 4) {
    reasons.push(`Question must have exactly 4 options. Found: ${Array.isArray(options) ? options.length : 0}`);
  } else {
    let correctCount = 0;
    options.forEach((opt, idx) => {
      const optText = typeof opt === "string" ? opt : opt?.text;
      if (!optText || typeof optText !== "string" || !optText.trim()) {
        reasons.push(`Option ${idx + 1} text is empty.`);
      }
      if (opt && typeof opt === "object" && opt.isCorrect === true) {
        correctCount++;
      }
    });

    if (correctCount === 0 && typeof question.correctAnswer === "number") {
      // Allow correctAnswer index mapping if provided
      if (question.correctAnswer >= 0 && question.correctAnswer < 4) {
        correctCount = 1;
      }
    }

    if (correctCount !== 1) {
      reasons.push(`Question must have exactly 1 correct answer. Found: ${correctCount}`);
    }
  }

  return {
    valid: reasons.length === 0,
    reasons
  };
}

/**
 * 2. OPTION LENGTH BALANCING & OUTLIER DETECTION
 * Detects if the correct answer is significantly longer / more detailed than distractors.
 */
export function detectLengthOutliers(question) {
  const options = question.options || [];
  if (options.length !== 4) {
    return { isOutlier: false, reasons: ["Cannot evaluate option length: option count is not 4."] };
  }

  const wordCounts = options.map(opt => {
    const txt = typeof opt === "string" ? opt : opt?.text || "";
    return txt.trim().split(/\s+/).filter(Boolean).length;
  });

  const charCounts = options.map(opt => {
    const txt = typeof opt === "string" ? opt : opt?.text || "";
    return txt.trim().length;
  });

  let correctIdx = options.findIndex(opt => opt && typeof opt === "object" && opt.isCorrect === true);
  if (correctIdx === -1 && typeof question.correctAnswer === "number") {
    correctIdx = question.correctAnswer;
  }

  if (correctIdx === -1 || correctIdx >= 4) {
    return { isOutlier: false, reasons: ["Correct answer index not identified."] };
  }

  const correctWords = wordCounts[correctIdx];
  const correctChars = charCounts[correctIdx];

  const distractorWords = wordCounts.filter((_, idx) => idx !== correctIdx);
  const distractorChars = charCounts.filter((_, idx) => idx !== correctIdx);

  const avgDistractorWords = distractorWords.reduce((a, b) => a + b, 0) / distractorWords.length || 1;
  const avgDistractorChars = distractorChars.reduce((a, b) => a + b, 0) / distractorChars.length || 1;

  const wordRatio = correctWords / avgDistractorWords;
  const charRatio = correctChars / avgDistractorChars;

  const wordDiff = correctWords - avgDistractorWords;
  const charDiff = correctChars - avgDistractorChars;

  const reasons = [];
  let isOutlier = false;

  if (wordRatio >= MCQ_QUALITY_CONFIG.WORD_RATIO_THRESHOLD && wordDiff >= MCQ_QUALITY_CONFIG.MIN_WORD_DIFF) {
    isOutlier = true;
    reasons.push(`Correct answer is word count outlier: ${correctWords} words vs avg distractor ${avgDistractorWords.toFixed(1)} words (Ratio: ${wordRatio.toFixed(2)}x).`);
  }

  if (charRatio >= MCQ_QUALITY_CONFIG.CHAR_RATIO_THRESHOLD && charDiff >= MCQ_QUALITY_CONFIG.MIN_CHAR_DIFF) {
    isOutlier = true;
    reasons.push(`Correct answer is character length outlier: ${correctChars} chars vs avg distractor ${avgDistractorChars.toFixed(1)} chars (Ratio: ${charRatio.toFixed(2)}x).`);
  }

  return {
    isOutlier,
    reasons,
    metrics: {
      correctWords,
      correctChars,
      avgDistractorWords,
      avgDistractorChars,
      wordRatio,
      charRatio
    }
  };
}

/**
 * 3. GRAMMATICAL & STRUCTURAL CLUE DETECTION
 * Detects structural disparity, complete sentence vs fragment differences, and explanatory clues.
 */
export function detectGrammaticalClues(question) {
  const options = question.options || [];
  if (options.length !== 4) return { hasClues: false, reasons: [] };

  let correctIdx = options.findIndex(opt => opt && typeof opt === "object" && opt.isCorrect === true);
  if (correctIdx === -1 && typeof question.correctAnswer === "number") {
    correctIdx = question.correctAnswer;
  }
  if (correctIdx === -1 || correctIdx >= 4) return { hasClues: false, reasons: [] };

  const correctText = (typeof options[correctIdx] === "string" ? options[correctIdx] : options[correctIdx]?.text || "").trim();
  const distractorTexts = options
    .filter((_, idx) => idx !== correctIdx)
    .map(opt => (typeof opt === "string" ? opt : opt?.text || "").trim());

  const reasons = [];
  let hasClues = false;

  // A. Explanatory keywords in correct answer
  const lowerCorrect = correctText.toLowerCase();
  for (const clue of MCQ_QUALITY_CONFIG.EXPLANATORY_CLUES) {
    if (lowerCorrect.includes(clue)) {
      const distractorsHaveClue = distractorTexts.some(d => d.toLowerCase().includes(clue));
      if (!distractorsHaveClue) {
        hasClues = true;
        reasons.push(`Correct option contains explanatory clue '${clue}' while distractors do not.`);
      }
    }
  }

  // B. Sentence vs Fragment disparity
  const isCorrectSentence = /^[A-Z].*[\.\?!]$/.test(correctText) && correctText.length > 25;
  const distractorsAreFragments = distractorTexts.every(d => !/[\.\?!]$/.test(d) && d.length < 20);

  if (isCorrectSentence && distractorsAreFragments) {
    hasClues = true;
    reasons.push("Correct answer is a complete formatted sentence while distractors are short fragments.");
  }

  // C. Unnecessary "All of the above" / "None of the above" check inside individual options
  if (options.some(opt => {
    const txt = (typeof opt === "string" ? opt : opt?.text || "").toLowerCase();
    return txt.includes("all of the above") || txt.includes("none of the above");
  })) {
    hasClues = true;
    reasons.push("Options contain 'all of the above' or 'none of the above' phrasing.");
  }

  return { hasClues, reasons };
}

/**
 * 4. DISTRACTOR QUALITY ASSESSMENT
 * Checks if distractors are plausible, non-generic, and unique.
 */
export function evaluateDistractorQuality(question) {
  const options = question.options || [];
  if (options.length !== 4) return { isLowQuality: true, reasons: ["Invalid option count."] };

  const reasons = [];
  let isLowQuality = false;

  const optionTexts = options.map(opt => (typeof opt === "string" ? opt : opt?.text || "").trim());

  // A. Check for generic/nonsense options (e.g. "Option A", "N/A", "None", single letters)
  const genericPatterns = [/^(option|choice)\s+[a-d1-4]$/i, /^n\/a$/i, /^none$/i, /^something else$/i, /^xyz$/i, /^test$/i];
  
  optionTexts.forEach((txt, idx) => {
    if (txt.length < 2) {
      isLowQuality = true;
      reasons.push(`Option ${idx + 1} ('${txt}') is too short to be a valid choice.`);
    }
    for (const pat of genericPatterns) {
      if (pat.test(txt)) {
        isLowQuality = true;
        reasons.push(`Option ${idx + 1} ('${txt}') is a generic placeholder distractor.`);
      }
    }
  });

  return { isLowQuality, reasons };
}

/**
 * 7. DUPLICATE AND NEAR-DUPLICATE DETECTION
 */
export function detectDuplicates(question, questionBank = []) {
  const reasons = [];
  let hasDuplicates = false;

  const options = question.options || [];
  const normalizedOpts = options.map(opt => normalizeText(typeof opt === "string" ? opt : opt?.text));

  // A. Duplicate options inside question
  const uniqueOpts = new Set(normalizedOpts);
  if (uniqueOpts.size < normalizedOpts.length) {
    hasDuplicates = true;
    reasons.push("Question contains duplicate option texts.");
  }

  // B. Near-duplicate question in bank
  const qText = question.text || question.question || "";
  for (const existingQ of questionBank) {
    const existingText = existingQ.text || existingQ.question || "";
    if (existingText) {
      const similarity = calculateStringSimilarity(qText, existingText);
      if (similarity >= MCQ_QUALITY_CONFIG.SIMILARITY_THRESHOLD) {
        hasDuplicates = true;
        reasons.push(`Question is a near-duplicate (${Math.round(similarity * 100)}% match) of an existing question: '${existingText.slice(0, 50)}...'`);
        break;
      }
    }
  }

  return { hasDuplicates, reasons };
}

/**
 * 8. COMPOSITE QUALITY SCORE CALCULATION (0 - 100)
 */
export function calculateQualityScore(question, questionBank = []) {
  const struct = validateStructure(question);
  if (!struct.valid) {
    return {
      score: 0,
      status: "failed",
      rejectionReasons: struct.reasons,
      metrics: {}
    };
  }

  let score = 100;
  const rejectionReasons = [];

  // Outlier check (-30 pts)
  const lengthCheck = detectLengthOutliers(question);
  if (lengthCheck.isOutlier) {
    score -= 30;
    rejectionReasons.push(...lengthCheck.reasons);
  }

  // Grammatical clue check (-25 pts)
  const clueCheck = detectGrammaticalClues(question);
  if (clueCheck.hasClues) {
    score -= 25;
    rejectionReasons.push(...clueCheck.reasons);
  }

  // Distractor quality check (-25 pts)
  const distractorCheck = evaluateDistractorQuality(question);
  if (distractorCheck.isLowQuality) {
    score -= 25;
    rejectionReasons.push(...distractorCheck.reasons);
  }

  // Duplicate check (-50 pts)
  const dupCheck = detectDuplicates(question, questionBank);
  if (dupCheck.hasDuplicates) {
    score -= 50;
    rejectionReasons.push(...dupCheck.reasons);
  }

  score = Math.max(0, Math.min(100, score));
  const status = score >= MCQ_QUALITY_CONFIG.QUALITY_PASS_SCORE ? "passed" : "failed";

  return {
    score,
    status,
    rejectionReasons,
    details: {
      lengthCheck,
      clueCheck,
      distractorCheck,
      dupCheck
    }
  };
}

/**
 * 5. STABLE CORRECT ANSWER TRACKING & OPTION RANDOMIZATION
 * Shuffles options while guaranteeing 100% stable correct answer tracking.
 */
export function shuffleOptionsWithTracking(question) {
  const options = question.options || [];
  if (options.length === 0) return question;

  // Identify correct option text or ID
  let correctOptText = null;
  const normalizedOpts = options.map((opt, idx) => {
    const text = typeof opt === "string" ? opt : opt?.text || "";
    const isCorrect = typeof opt === "object" ? Boolean(opt.isCorrect) : idx === question.correctAnswer;
    const _id = opt._id || null;
    if (isCorrect) correctOptText = text;
    return { text, isCorrect, _id };
  });

  // Fisher-Yates Shuffle
  const shuffled = [...normalizedOpts];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Verify exactly 1 correct answer remains true
  const correctMatches = shuffled.filter(o => o.isCorrect);
  if (correctMatches.length !== 1 && correctOptText) {
    shuffled.forEach(o => {
      o.isCorrect = o.text === correctOptText;
    });
  }

  return {
    ...question,
    options: shuffled
  };
}

/**
 * 6. BATCH ANSWER-POSITION BALANCING (A, B, C, D Distribution)
 * Balances the correct answer positions across a batch of questions to ~25% each.
 */
export function balanceBatchPositions(questions = []) {
  if (!Array.isArray(questions) || questions.length === 0) return [];

  const targetPositions = [0, 1, 2, 3]; // A, B, C, D
  return questions.map((q, qIdx) => {
    const shuffledQ = shuffleOptionsWithTracking(q);
    const opts = shuffledQ.options || [];
    if (opts.length !== 4) return shuffledQ;

    const currentCorrectIdx = opts.findIndex(o => o.isCorrect);
    if (currentCorrectIdx === -1) return shuffledQ;

    const desiredCorrectIdx = targetPositions[qIdx % 4];
    if (currentCorrectIdx !== desiredCorrectIdx) {
      // Swap current correct option into desired position
      const reordered = [...opts];
      [reordered[currentCorrectIdx], reordered[desiredCorrectIdx]] = [reordered[desiredCorrectIdx], reordered[currentCorrectIdx]];
      return {
        ...shuffledQ,
        options: reordered
      };
    }

    return shuffledQ;
  });
}

/**
 * 12. SECURITY SANITIZATION FOR STUDENT PAYLOADS
 * Omits admin quality metadata when returning questions to student CBT clients.
 */
export function sanitizeQuestionForStudent(question) {
  if (!question) return question;
  const qObj = typeof question.toObject === "function" ? question.toObject() : { ...question };

  delete qObj.qualityScore;
  delete qObj.validationStatus;
  delete qObj.rejectionReasons;
  delete qObj.regenerationCount;
  delete qObj.needsAdminReview;

  return qObj;
}
