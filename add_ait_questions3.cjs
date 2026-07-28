require('dotenv').config();
const mongoose = require('mongoose');

const newQuestions = [
  {
    text: "Artificial Intelligence is the science of making machines:",
    options: [
      { text: "Faster than humans", isCorrect: false },
      { text: "Perform tasks that normally require human intelligence", isCorrect: true },
      { text: "Smaller in size", isCorrect: false },
      { text: "Store more data", isCorrect: false }
    ]
  },
  {
    text: "Who coined the term Artificial Intelligence in 1956?",
    options: [
      { text: "Alan Turing", isCorrect: false },
      { text: "John McCarthy", isCorrect: true },
      { text: "Marvin Minsky", isCorrect: false },
      { text: "Charles Babbage", isCorrect: false }
    ]
  },
  {
    text: "The Turing Test was proposed by:",
    options: [
      { text: "John McCarthy", isCorrect: false },
      { text: "Alan Turing", isCorrect: true },
      { text: "Isaac Newton", isCorrect: false },
      { text: "Bill Gates", isCorrect: false }
    ]
  },
  {
    text: "Which of the following is an application of AI?",
    options: [
      { text: "Face recognition", isCorrect: true },
      { text: "Word processing", isCorrect: false },
      { text: "Calculator", isCorrect: false },
      { text: "Flash drive", isCorrect: false }
    ]
  },
  {
    text: "An AI system that recommends movies on Netflix is an example of:",
    options: [
      { text: "Recommendation System", isCorrect: true },
      { text: "Database System", isCorrect: false },
      { text: "Operating System", isCorrect: false },
      { text: "Compiler", isCorrect: false }
    ]
  },
  {
    text: "Which search algorithm explores nodes level by level?",
    options: [
      { text: "DFS", isCorrect: false },
      { text: "BFS", isCorrect: true },
      { text: "A*", isCorrect: false },
      { text: "Hill Climbing", isCorrect: false }
    ]
  },
  {
    text: "Which data structure is used in Breadth-First Search?",
    options: [
      { text: "Stack", isCorrect: false },
      { text: "Queue", isCorrect: true },
      { text: "Array", isCorrect: false },
      { text: "Tree", isCorrect: false }
    ]
  },
  {
    text: "Depth-First Search uses a:",
    options: [
      { text: "Queue", isCorrect: false },
      { text: "Stack", isCorrect: true },
      { text: "Heap", isCorrect: false },
      { text: "Graph", isCorrect: false }
    ]
  },
  {
    text: "Which search algorithm generally finds the shortest path in an unweighted graph?",
    options: [
      { text: "DFS", isCorrect: false },
      { text: "BFS", isCorrect: true },
      { text: "Hill Climbing", isCorrect: false },
      { text: "Genetic Algorithm", isCorrect: false }
    ]
  },
  {
    text: "The main component of an Expert System that stores facts is the:",
    options: [
      { text: "Inference Engine", isCorrect: false },
      { text: "Knowledge Base", isCorrect: true },
      { text: "Database Server", isCorrect: false },
      { text: "Compiler", isCorrect: false }
    ]
  },
  {
    text: "The inference engine is responsible for:",
    options: [
      { text: "Printing reports", isCorrect: false },
      { text: "Applying rules to reach conclusions", isCorrect: true },
      { text: "Creating databases", isCorrect: false },
      { text: "Storing videos", isCorrect: false }
    ]
  },
  {
    text: "Machine Learning is a subset of:",
    options: [
      { text: "Cybersecurity", isCorrect: false },
      { text: "Artificial Intelligence", isCorrect: true },
      { text: "Networking", isCorrect: false },
      { text: "Database Management", isCorrect: false }
    ]
  },
  {
    text: "Which type of Machine Learning uses labelled data?",
    options: [
      { text: "Supervised Learning", isCorrect: true },
      { text: "Unsupervised Learning", isCorrect: false },
      { text: "Reinforcement Learning", isCorrect: false },
      { text: "Deep Learning", isCorrect: false }
    ]
  },
  {
    text: "Which Machine Learning method finds hidden patterns without labelled data?",
    options: [
      { text: "Supervised Learning", isCorrect: false },
      { text: "Unsupervised Learning", isCorrect: true },
      { text: "Reinforcement Learning", isCorrect: false },
      { text: "Rule-based Learning", isCorrect: false }
    ]
  },
  {
    text: "Reinforcement Learning is based on:",
    options: [
      { text: "Rewards and penalties", isCorrect: true },
      { text: "Database queries", isCorrect: false },
      { text: "HTML tags", isCorrect: false },
      { text: "Operating systems", isCorrect: false }
    ]
  },
  {
    text: "Natural Language Processing (NLP) enables computers to:",
    options: [
      { text: "Build websites", isCorrect: false },
      { text: "Understand and process human language", isCorrect: true },
      { text: "Repair hardware", isCorrect: false },
      { text: "Create networks", isCorrect: false }
    ]
  },
  {
    text: "Which of the following is an NLP application?",
    options: [
      { text: "Google Translate", isCorrect: true },
      { text: "Microsoft Excel", isCorrect: false },
      { text: "Calculator", isCorrect: false },
      { text: "Printer", isCorrect: false }
    ]
  },
  {
    text: "Computer Vision deals with:",
    options: [
      { text: "Computer networking", isCorrect: false },
      { text: "Understanding images and videos", isCorrect: true },
      { text: "Data storage", isCorrect: false },
      { text: "Database management", isCorrect: false }
    ]
  },
  {
    text: "A robot that cleans floors automatically is an example of:",
    options: [
      { text: "Robotics", isCorrect: true },
      { text: "Compiler Design", isCorrect: false },
      { text: "Networking", isCorrect: false },
      { text: "Encryption", isCorrect: false }
    ]
  },
  {
    text: "Artificial Neural Networks are inspired by:",
    options: [
      { text: "Telephone networks", isCorrect: false },
      { text: "The human brain", isCorrect: true },
      { text: "Computer memory", isCorrect: false },
      { text: "Electrical circuits", isCorrect: false }
    ]
  },
  {
    text: "Fuzzy Logic is mainly used when:",
    options: [
      { text: "Answers are only true or false", isCorrect: false },
      { text: "There is uncertainty or partial truth", isCorrect: true },
      { text: "Databases are corrupted", isCorrect: false },
      { text: "Programs fail to compile", isCorrect: false }
    ]
  },
  {
    text: "Which AI technique is inspired by natural evolution?",
    options: [
      { text: "Genetic Algorithm", isCorrect: true },
      { text: "BFS", isCorrect: false },
      { text: "DFS", isCorrect: false },
      { text: "Binary Search", isCorrect: false }
    ]
  },
  {
    text: "Which of the following is NOT an AI application?",
    options: [
      { text: "Self-driving cars", isCorrect: false },
      { text: "Medical diagnosis", isCorrect: false },
      { text: "Voice assistants", isCorrect: false },
      { text: "Typewriter", isCorrect: true }
    ]
  },
  {
    text: "Which company developed ChatGPT?",
    options: [
      { text: "Microsoft", isCorrect: false },
      { text: "OpenAI", isCorrect: true },
      { text: "Apple", isCorrect: false },
      { text: "IBM", isCorrect: false }
    ]
  },
  {
    text: "One ethical concern associated with AI is:",
    options: [
      { text: "Increased data storage", isCorrect: false },
      { text: "Privacy and bias", isCorrect: true },
      { text: "Faster internet speed", isCorrect: false },
      { text: "Better graphics", isCorrect: false }
    ]
  },
  {
    text: "An intelligent agent is a system that:",
    options: [
      { text: "Only stores information", isCorrect: false },
      { text: "Perceives its environment and takes actions", isCorrect: true },
      { text: "Only performs calculations", isCorrect: false },
      { text: "Only connects to the internet", isCorrect: false }
    ]
  },
  {
    text: "Which of the following is an example of an intelligent agent?",
    options: [
      { text: "A calculator", isCorrect: false },
      { text: "A self-driving car", isCorrect: true },
      { text: "A USB flash drive", isCorrect: false },
      { text: "A monitor", isCorrect: false }
    ]
  },
  {
    text: "The environment in which an agent operates is called:",
    options: [
      { text: "Workspace", isCorrect: false },
      { text: "Agent Environment", isCorrect: true },
      { text: "Search Space", isCorrect: false },
      { text: "Knowledge Base", isCorrect: false }
    ]
  },
  {
    text: "A rational agent always tries to:",
    options: [
      { text: "Maximize its performance", isCorrect: true },
      { text: "Waste resources", isCorrect: false },
      { text: "Ignore its environment", isCorrect: false },
      { text: "Avoid solving problems", isCorrect: false }
    ]
  },
  {
    text: "Which search algorithm uses both the actual cost and estimated cost to reach the goal?",
    options: [
      { text: "Breadth-First Search", isCorrect: false },
      { text: "Depth-First Search", isCorrect: false },
      { text: "A* Search", isCorrect: true },
      { text: "Binary Search", isCorrect: false }
    ]
  },
  {
    text: "The heuristic function in AI is represented by:",
    options: [
      { text: "f(n)", isCorrect: false },
      { text: "g(n)", isCorrect: false },
      { text: "h(n)", isCorrect: true },
      { text: "p(n)", isCorrect: false }
    ]
  },
  {
    text: "The evaluation function used in A* Search is:",
    options: [
      { text: "f(n) = g(n) + h(n)", isCorrect: true },
      { text: "f(n) = g(n) × h(n)", isCorrect: false },
      { text: "f(n) = g(n) − h(n)", isCorrect: false },
      { text: "f(n) = h(n) ÷ g(n)", isCorrect: false }
    ]
  },
  {
    text: "Knowledge Representation in AI refers to:",
    options: [
      { text: "Storing knowledge in a form a computer can use", isCorrect: true },
      { text: "Designing websites", isCorrect: false },
      { text: "Building databases only", isCorrect: false },
      { text: "Installing software", isCorrect: false }
    ]
  },
  {
    text: "Which of the following is a method of knowledge representation?",
    options: [
      { text: "Rules", isCorrect: false },
      { text: "Semantic Networks", isCorrect: false },
      { text: "Frames", isCorrect: false },
      { text: "All of the above", isCorrect: true }
    ]
  },
  {
    text: "The IF–THEN structure is commonly used in:",
    options: [
      { text: "Expert Systems", isCorrect: true },
      { text: "Operating Systems", isCorrect: false },
      { text: "Word Processors", isCorrect: false },
      { text: "Compilers", isCorrect: false }
    ]
  },
  {
    text: "An expert system attempts to imitate:",
    options: [
      { text: "A database", isCorrect: false },
      { text: "Human expert decision-making", isCorrect: true },
      { text: "A compiler", isCorrect: false },
      { text: "A network server", isCorrect: false }
    ]
  },
  {
    text: "Which component explains how an expert system reached its conclusion?",
    options: [
      { text: "Knowledge Base", isCorrect: false },
      { text: "Explanation Facility", isCorrect: true },
      { text: "Database", isCorrect: false },
      { text: "Queue", isCorrect: false }
    ]
  },
  {
    text: "Machine Learning enables computers to:",
    options: [
      { text: "Learn from data", isCorrect: true },
      { text: "Replace computer hardware", isCorrect: false },
      { text: "Increase RAM size", isCorrect: false },
      { text: "Format disks", isCorrect: false }
    ]
  },
  {
    text: "Which of the following is NOT a Machine Learning algorithm?",
    options: [
      { text: "Decision Tree", isCorrect: false },
      { text: "K-Means", isCorrect: false },
      { text: "Linear Regression", isCorrect: false },
      { text: "Microsoft Word", isCorrect: true }
    ]
  },
  {
    text: "Deep Learning is mainly based on:",
    options: [
      { text: "Artificial Neural Networks", isCorrect: true },
      { text: "Binary Trees", isCorrect: false },
      { text: "Stacks", isCorrect: false },
      { text: "Queues", isCorrect: false }
    ]
  },
  {
    text: "The basic unit of an Artificial Neural Network is called:",
    options: [
      { text: "Node (Neuron)", isCorrect: true },
      { text: "Router", isCorrect: false },
      { text: "Switch", isCorrect: false },
      { text: "Cache", isCorrect: false }
    ]
  },
  {
    text: "Which AI application is commonly used in hospitals?",
    options: [
      { text: "Medical diagnosis systems", isCorrect: true },
      { text: "Paint application", isCorrect: false },
      { text: "Music player", isCorrect: false },
      { text: "Calculator", isCorrect: false }
    ]
  },
  {
    text: "Chatbots mainly use:",
    options: [
      { text: "Natural Language Processing", isCorrect: true },
      { text: "Computer Networking", isCorrect: false },
      { text: "Binary Search", isCorrect: false },
      { text: "Encryption", isCorrect: false }
    ]
  },
  {
    text: "Speech recognition is an application of:",
    options: [
      { text: "Computer Vision", isCorrect: false },
      { text: "NLP", isCorrect: true },
      { text: "Database Systems", isCorrect: false },
      { text: "Operating Systems", isCorrect: false }
    ]
  },
  {
    text: "Which of the following is an example of Computer Vision?",
    options: [
      { text: "Face Recognition", isCorrect: true },
      { text: "Email", isCorrect: false },
      { text: "Spreadsheet", isCorrect: false },
      { text: "Keyboard", isCorrect: false }
    ]
  },
  {
    text: "Which of these is a limitation of Artificial Intelligence?",
    options: [
      { text: "Lack of human emotions and common sense", isCorrect: true },
      { text: "Never makes mistakes", isCorrect: false },
      { text: "Needs no data", isCorrect: false },
      { text: "Learns without algorithms", isCorrect: false }
    ]
  },
  {
    text: "Which AI application is used by banks to detect fraudulent transactions?",
    options: [
      { text: "Machine Learning", isCorrect: true },
      { text: "HTML", isCorrect: false },
      { text: "CSS", isCorrect: false },
      { text: "FTP", isCorrect: false }
    ]
  },
  {
    text: "The field of AI concerned with making machines move and perform physical tasks is:",
    options: [
      { text: "Robotics", isCorrect: true },
      { text: "Networking", isCorrect: false },
      { text: "Web Design", isCorrect: false },
      { text: "Database Management", isCorrect: false }
    ]
  },
  {
    text: "Which of the following is an ethical issue in AI?",
    options: [
      { text: "Data privacy", isCorrect: false },
      { text: "Bias in decision-making", isCorrect: false },
      { text: "Job displacement", isCorrect: false },
      { text: "All of the above", isCorrect: true }
    ]
  },
  {
    text: "The ultimate goal of Artificial Intelligence is to:",
    options: [
      { text: "Replace all humans completely", isCorrect: false },
      { text: "Develop systems capable of intelligent decision-making and problem-solving", isCorrect: true },
      { text: "Increase computer size", isCorrect: false },
      { text: "Eliminate the internet", isCorrect: false }
    ]
  },
  {
    text: "Artificial Intelligence is primarily concerned with making computers:",
    options: [
      { text: "Smaller", isCorrect: false },
      { text: "Faster only", isCorrect: false },
      { text: "Think and solve problems intelligently", isCorrect: true },
      { text: "Consume less power", isCorrect: false }
    ]
  },
  {
    text: "The science of making intelligent machines was officially introduced at the:",
    options: [
      { text: "Harvard Conference", isCorrect: false },
      { text: "Dartmouth Conference (1956)", isCorrect: true },
      { text: "Oxford Meeting", isCorrect: false },
      { text: "MIT Symposium", isCorrect: false }
    ]
  },
  {
    text: "Which of the following is an example of weak (narrow) AI?",
    options: [
      { text: "Siri", isCorrect: true },
      { text: "Human brain", isCorrect: false },
      { text: "General human intelligence", isCorrect: false },
      { text: "Artificial General Intelligence (AGI)", isCorrect: false }
    ]
  },
  {
    text: "The ability of an AI system to improve from experience is known as:",
    options: [
      { text: "Programming", isCorrect: false },
      { text: "Machine Learning", isCorrect: true },
      { text: "Formatting", isCorrect: false },
      { text: "Debugging", isCorrect: false }
    ]
  },
  {
    text: "Which search strategy may get trapped in a local optimum?",
    options: [
      { text: "Breadth-First Search", isCorrect: false },
      { text: "Depth-First Search", isCorrect: false },
      { text: "Hill Climbing", isCorrect: true },
      { text: "Uniform Cost Search", isCorrect: false }
    ]
  },
  {
    text: "In Artificial Intelligence, a heuristic is:",
    options: [
      { text: "A guaranteed exact solution", isCorrect: false },
      { text: "A rule of thumb used to guide problem-solving", isCorrect: true },
      { text: "A programming language", isCorrect: false },
      { text: "A database query", isCorrect: false }
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

  console.log('Successfully added 56 new questions to AIT 313 quiz.');
  console.log('Total questions is now:', updatedQuestions.length);
  process.exit(0);
}

main().catch(console.error);
