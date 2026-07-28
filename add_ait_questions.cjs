require('dotenv').config();
const mongoose = require('mongoose');

const newQuestions = [
  {
    text: "Which of the following is an informed search algorithm?",
    options: [
      { text: "Breadth-First Search", isCorrect: false },
      { text: "Depth-First Search", isCorrect: false },
      { text: "A* Search", isCorrect: true },
      { text: "Uniform Cost Search", isCorrect: false }
    ]
  },
  {
    text: "Which of the following is an uninformed search algorithm?",
    options: [
      { text: "A*", isCorrect: false },
      { text: "Greedy Best-First Search", isCorrect: false },
      { text: "Breadth-First Search", isCorrect: true },
      { text: "Hill Climbing", isCorrect: false }
    ]
  },
  {
    text: "The purpose of the heuristic function in A* Search is to:",
    options: [
      { text: "Estimate the remaining cost to the goal", isCorrect: true },
      { text: "Count the number of nodes visited", isCorrect: false },
      { text: "Store the database", isCorrect: false },
      { text: "Encrypt information", isCorrect: false }
    ]
  },
  {
    text: "Which of the following is a characteristic of an intelligent agent?",
    options: [
      { text: "It always requires human intervention.", isCorrect: false },
      { text: "It perceives its environment and acts autonomously.", isCorrect: true },
      { text: "It cannot make decisions.", isCorrect: false },
      { text: "It has no sensors.", isCorrect: false }
    ]
  },
  {
    text: "An autonomous robot mainly depends on:",
    options: [
      { text: "Human control at every step", isCorrect: false },
      { text: "Sensors and intelligent decision-making", isCorrect: true },
      { text: "Paper instructions", isCorrect: false },
      { text: "Manual calculations", isCorrect: false }
    ]
  },
  {
    text: "Which AI technique is commonly used in recommendation systems such as Netflix and Amazon?",
    options: [
      { text: "Machine Learning", isCorrect: true },
      { text: "HTML", isCorrect: false },
      { text: "CSS", isCorrect: false },
      { text: "Assembly Language", isCorrect: false }
    ]
  },
  {
    text: "The main goal of Computer Vision is to enable computers to:",
    options: [
      { text: "Design websites", isCorrect: false },
      { text: "Interpret visual information from images and videos", isCorrect: true },
      { text: "Build databases", isCorrect: false },
      { text: "Manage networks", isCorrect: false }
    ]
  },
  {
    text: "Voice assistants such as Siri and Google Assistant rely heavily on:",
    options: [
      { text: "Natural Language Processing", isCorrect: true },
      { text: "Spreadsheet Software", isCorrect: false },
      { text: "Computer Networking", isCorrect: false },
      { text: "Operating Systems", isCorrect: false }
    ]
  },
  {
    text: "Which of the following is an example of supervised learning?",
    options: [
      { text: "Classifying emails as spam or not spam using labelled examples", isCorrect: true },
      { text: "Grouping customers without labels", isCorrect: false },
      { text: "Random guessing", isCorrect: false },
      { text: "Manual programming only", isCorrect: false }
    ]
  },
  {
    text: "Clustering is commonly associated with:",
    options: [
      { text: "Supervised Learning", isCorrect: false },
      { text: "Unsupervised Learning", isCorrect: true },
      { text: "Reinforcement Learning", isCorrect: false },
      { text: "Expert Systems", isCorrect: false }
    ]
  },
  {
    text: "Which AI technique is inspired by biological evolution?",
    options: [
      { text: "Genetic Algorithm", isCorrect: true },
      { text: "Breadth-First Search", isCorrect: false },
      { text: "Binary Search", isCorrect: false },
      { text: "Bubble Sort", isCorrect: false }
    ]
  },
  {
    text: "Which of the following is a major challenge of AI?",
    options: [
      { text: "Ethical concerns", isCorrect: false },
      { text: "Bias in data", isCorrect: false },
      { text: "Privacy issues", isCorrect: false },
      { text: "All of the above", isCorrect: true }
    ]
  },
  {
    text: "Which of the following is not an AI programming language?",
    options: [
      { text: "LISP", isCorrect: false },
      { text: "Prolog", isCorrect: false },
      { text: "Python", isCorrect: false },
      { text: "HTML", isCorrect: true }
    ]
  },
  {
    text: "Python is widely used in AI because it:",
    options: [
      { text: "Has many AI libraries", isCorrect: true },
      { text: "Is difficult to learn", isCorrect: false },
      { text: "Cannot process data", isCorrect: false },
      { text: "Is only used for networking", isCorrect: false }
    ]
  },
  {
    text: "Which Python library is widely used for Machine Learning?",
    options: [
      { text: "Scikit-learn", isCorrect: true },
      { text: "Bootstrap", isCorrect: false },
      { text: "jQuery", isCorrect: false },
      { text: "Laravel", isCorrect: false }
    ]
  },
  {
    text: "Which of the following is an AI application in agriculture?",
    options: [
      { text: "Crop disease detection", isCorrect: true },
      { text: "Word processing", isCorrect: false },
      { text: "File compression", isCorrect: false },
      { text: "Printing documents", isCorrect: false }
    ]
  },
  {
    text: "AI is used in banking mainly for:",
    options: [
      { text: "Fraud detection", isCorrect: true },
      { text: "Replacing cash completely", isCorrect: false },
      { text: "Increasing electricity supply", isCorrect: false },
      { text: "Formatting computers", isCorrect: false }
    ]
  },
  {
    text: "Which field of AI focuses on enabling machines to make decisions based on experience?",
    options: [
      { text: "Machine Learning", isCorrect: true },
      { text: "Computer Graphics", isCorrect: false },
      { text: "Data Entry", isCorrect: false },
      { text: "Networking", isCorrect: false }
    ]
  },
  {
    text: "Which of the following best describes Deep Learning?",
    options: [
      { text: "A subset of Machine Learning based on multi-layer neural networks", isCorrect: true },
      { text: "A database language", isCorrect: false },
      { text: "A search algorithm", isCorrect: false },
      { text: "A networking protocol", isCorrect: false }
    ]
  },
  {
    text: "The ultimate objective of Artificial Intelligence is to:",
    options: [
      { text: "Replace every human activity", isCorrect: false },
      { text: "Build systems that can reason, learn, and solve problems intelligently", isCorrect: true },
      { text: "Eliminate computers", isCorrect: false },
      { text: "Increase computer prices", isCorrect: false }
    ]
  }
];

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  
  const course = await db.collection('courses').findOne({ title: 'AIT 313 - ARTIFICIAL INTELLIGENCE' });
  if (!course) {
    console.log('Course not found');
    process.exit(1);
  }

  const quiz = await db.collection('quizzes').findOne({ course: course._id });
  if (!quiz) {
    console.log('Quiz not found for AIT 313');
    process.exit(1);
  }

  // Generate ObjectIds for new questions and options to match Mongoose schema structure
  const formattedQuestions = newQuestions.map(q => ({
    _id: new mongoose.Types.ObjectId(),
    text: q.text,
    options: q.options.map(opt => ({
      _id: new mongoose.Types.ObjectId(),
      text: opt.text,
      isCorrect: opt.isCorrect
    }))
  }));

  const updatedQuestions = [...quiz.questions, ...formattedQuestions];

  await db.collection('quizzes').updateOne(
    { _id: quiz._id },
    { $set: { questions: updatedQuestions } }
  );

  console.log('Successfully added 20 new questions to AIT 313 quiz.');
  console.log('Total questions is now:', updatedQuestions.length);
  process.exit(0);
}

main().catch(console.error);
