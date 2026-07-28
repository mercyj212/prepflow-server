require('dotenv').config();
const mongoose = require('mongoose');

const newQuestions = [
  {
    text: "Which search algorithm expands the deepest node first?",
    options: [
      { text: "BFS", isCorrect: false },
      { text: "DFS", isCorrect: true },
      { text: "A*", isCorrect: false },
      { text: "Greedy Search", isCorrect: false }
    ]
  },
  {
    text: "In AI, a problem is solved by moving from:",
    options: [
      { text: "End state to start state only", isCorrect: false },
      { text: "Initial state to goal state", isCorrect: true },
      { text: "Database to network", isCorrect: false },
      { text: "Input to output device", isCorrect: false }
    ]
  },
  {
    text: "The collection of all possible states in a problem is called the:",
    options: [
      { text: "Search Space", isCorrect: true },
      { text: "Database", isCorrect: false },
      { text: "Network", isCorrect: false },
      { text: "Memory Space", isCorrect: false }
    ]
  },
  {
    text: "Knowledge represented as IF-THEN statements is called:",
    options: [
      { text: "Rule-based representation", isCorrect: true },
      { text: "Object-oriented representation", isCorrect: false },
      { text: "Relational representation", isCorrect: false },
      { text: "Binary representation", isCorrect: false }
    ]
  },
  {
    text: "Which AI technique is commonly used in medical diagnosis?",
    options: [
      { text: "Expert Systems", isCorrect: true },
      { text: "Spreadsheet", isCorrect: false },
      { text: "Word Processing", isCorrect: false },
      { text: "Compiler Design", isCorrect: false }
    ]
  },
  {
    text: "The component of an expert system that contains facts and rules is the:",
    options: [
      { text: "Inference Engine", isCorrect: false },
      { text: "Knowledge Base", isCorrect: true },
      { text: "User Interface", isCorrect: false },
      { text: "Operating System", isCorrect: false }
    ]
  },
  {
    text: "A chatbot is an example of:",
    options: [
      { text: "Natural Language Processing", isCorrect: true },
      { text: "Network Security", isCorrect: false },
      { text: "Operating System", isCorrect: false },
      { text: "Data Compression", isCorrect: false }
    ]
  },
  {
    text: "Which branch of AI allows computers to recognize human speech?",
    options: [
      { text: "Robotics", isCorrect: false },
      { text: "Computer Vision", isCorrect: false },
      { text: "Natural Language Processing", isCorrect: true },
      { text: "Database Systems", isCorrect: false }
    ]
  },
  {
    text: "The technology behind fingerprint and facial recognition is:",
    options: [
      { text: "Computer Vision", isCorrect: true },
      { text: "Spreadsheet", isCorrect: false },
      { text: "HTML", isCorrect: false },
      { text: "CSS", isCorrect: false }
    ]
  },
  {
    text: "Artificial Neural Networks are mainly inspired by the:",
    options: [
      { text: "Human brain", isCorrect: true },
      { text: "Heart", isCorrect: false },
      { text: "Liver", isCorrect: false },
      { text: "Computer processor", isCorrect: false }
    ]
  },
  {
    text: "Which learning method does not require labelled data?",
    options: [
      { text: "Supervised Learning", isCorrect: false },
      { text: "Unsupervised Learning", isCorrect: true },
      { text: "Reinforcement Learning", isCorrect: false },
      { text: "Deep Learning", isCorrect: false }
    ]
  },
  {
    text: "The reward-and-punishment approach is used in:",
    options: [
      { text: "Supervised Learning", isCorrect: false },
      { text: "Reinforcement Learning", isCorrect: true },
      { text: "Unsupervised Learning", isCorrect: false },
      { text: "Rule-based Systems", isCorrect: false }
    ]
  },
  {
    text: "Which AI application is used in email systems to filter spam?",
    options: [
      { text: "Machine Learning", isCorrect: true },
      { text: "Compiler", isCorrect: false },
      { text: "Database", isCorrect: false },
      { text: "Router", isCorrect: false }
    ]
  },
  {
    text: "Which of the following is an AI programming language?",
    options: [
      { text: "LISP", isCorrect: true },
      { text: "COBOL", isCorrect: false },
      { text: "Pascal", isCorrect: false },
      { text: "BASIC", isCorrect: false }
    ]
  },
  {
    text: "Which AI programming language is widely used for symbolic reasoning?",
    options: [
      { text: "LISP", isCorrect: true },
      { text: "HTML", isCorrect: false },
      { text: "SQL", isCorrect: false },
      { text: "XML", isCorrect: false }
    ]
  },
  {
    text: "The programming language Prolog is mainly used for:",
    options: [
      { text: "Logic programming and AI", isCorrect: true },
      { text: "Web page design", isCorrect: false },
      { text: "Database management", isCorrect: false },
      { text: "Graphics editing", isCorrect: false }
    ]
  },
  {
    text: "One major advantage of AI is that it can:",
    options: [
      { text: "Work continuously without fatigue", isCorrect: true },
      { text: "Replace electricity", isCorrect: false },
      { text: "Eliminate computers", isCorrect: false },
      { text: "Stop cybercrime completely", isCorrect: false }
    ]
  },
  {
    text: "Which of the following is a disadvantage of AI?",
    options: [
      { text: "High development cost", isCorrect: true },
      { text: "Fast computation", isCorrect: false },
      { text: "Improved accuracy", isCorrect: false },
      { text: "Automation", isCorrect: false }
    ]
  },
  {
    text: "Which AI technology is used by autonomous (self-driving) vehicles?",
    options: [
      { text: "Computer Vision and Machine Learning", isCorrect: true },
      { text: "Microsoft Word", isCorrect: false },
      { text: "PowerPoint", isCorrect: false },
      { text: "Calculator", isCorrect: false }
    ]
  },
  {
    text: "Which of the following best describes Artificial General Intelligence (AGI)?",
    options: [
      { text: "AI that performs only one specific task", isCorrect: false },
      { text: "AI with human-level intelligence across many tasks", isCorrect: true },
      { text: "A web browser", isCorrect: false },
      { text: "A database application", isCorrect: false }
    ]
  },
  {
    text: "Artificial Intelligence is a branch of:",
    options: [
      { text: "Civil Engineering", isCorrect: false },
      { text: "Computer Science", isCorrect: true },
      { text: "Mechanical Engineering", isCorrect: false },
      { text: "Statistics", isCorrect: false }
    ]
  },
  {
    text: "Which of the following is an example of Strong AI (Artificial General Intelligence)?",
    options: [
      { text: "Google Maps", isCorrect: false },
      { text: "Siri", isCorrect: false },
      { text: "A hypothetical machine with human-level intelligence", isCorrect: true },
      { text: "Calculator", isCorrect: false }
    ]
  },
  {
    text: "The main objective of Machine Learning is to enable computers to:",
    options: [
      { text: "Replace hardware", isCorrect: false },
      { text: "Learn from experience and improve performance", isCorrect: true },
      { text: "Increase internet speed", isCorrect: false },
      { text: "Design websites", isCorrect: false }
    ]
  },
  {
    text: "Which search algorithm is not guaranteed to find the shortest path in all cases?",
    options: [
      { text: "Breadth-First Search", isCorrect: false },
      { text: "Depth-First Search", isCorrect: true },
      { text: "Uniform Cost Search", isCorrect: false },
      { text: "A* Search (with an admissible heuristic)", isCorrect: false }
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

  console.log('Successfully added 24 new questions to AIT 313 quiz.');
  console.log('Total questions is now:', updatedQuestions.length);
  process.exit(0);
}

main().catch(console.error);
