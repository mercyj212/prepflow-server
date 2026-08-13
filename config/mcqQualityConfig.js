export const MCQ_QUALITY_CONFIG = {
  // Option length outlier thresholds
  WORD_RATIO_THRESHOLD: parseFloat(process.env.MCQ_WORD_RATIO_THRESHOLD) || 1.4,
  CHAR_RATIO_THRESHOLD: parseFloat(process.env.MCQ_CHAR_RATIO_THRESHOLD) || 1.4,
  MIN_WORD_DIFF: parseInt(process.env.MCQ_MIN_WORD_DIFF, 10) || 4,
  MIN_CHAR_DIFF: parseInt(process.env.MCQ_MIN_CHAR_DIFF, 10) || 20,
  
  // Similarity threshold for near-duplicate question detection (0.0 to 1.0)
  SIMILARITY_THRESHOLD: parseFloat(process.env.MCQ_SIMILARITY_THRESHOLD) || 0.85,
  
  // Quality Score thresholds (0 - 100)
  QUALITY_PASS_SCORE: parseInt(process.env.MCQ_QUALITY_PASS_SCORE, 10) || 75,
  QUALITY_EXCELLENT_SCORE: parseInt(process.env.MCQ_QUALITY_EXCELLENT_SCORE, 10) || 90,
  
  // Maximum AI regeneration attempts before flagging for admin review
  MAX_REGEN_ATTEMPTS: parseInt(process.env.MCQ_MAX_REGEN_ATTEMPTS, 10) || 3,
  
  // Explanatory clue keywords suspicious inside option text
  EXPLANATORY_CLUES: [
    'because',
    'therefore',
    'meaning that',
    'defined as',
    'refers to the process of',
    'in order to',
    'which leads to',
    'as a result of',
    'which means',
    'owing to',
    'due to the fact'
  ]
};
