import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import Course from './models/Course.js';
import Quiz from './models/Quiz.js';

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  // Find the Python Programming course
  let course = await Course.findOne({ title: { $regex: /python/i } });
  if (!course) {
    console.log('Python Programming course not found. Listing all courses...');
    const allCourses = await Course.find({}).select('title level department');
    allCourses.forEach(c => console.log(`  - ${c.title} (level: ${c.level})`));
    process.exit(1);
  }

  console.log(`Found course: ${course.title} (ID: ${course._id})`);

  const questions = [
    {
      text: "Python is a __ language.",
      options: [
        { text: "Compiled", isCorrect: false },
        { text: "Interpreted", isCorrect: true },
        { text: "Machine", isCorrect: false },
        { text: "Assembly", isCorrect: false }
      ],
      explanation: "Python is an interpreted language — code is executed line by line by the Python interpreter.",
      subject: "Python Programming"
    },
    {
      text: "Who developed Python?",
      options: [
        { text: "James Gosling", isCorrect: false },
        { text: "Guido van Rossum", isCorrect: true },
        { text: "Dennis Ritchie", isCorrect: false },
        { text: "Bjarne Stroustrup", isCorrect: false }
      ],
      explanation: "Python was created by Guido van Rossum and first released in 1991.",
      subject: "Python Programming"
    },
    {
      text: "Which symbol is used for comments in Python?",
      options: [
        { text: "//", isCorrect: false },
        { text: "#", isCorrect: true },
        { text: "/*", isCorrect: false },
        { text: "%", isCorrect: false }
      ],
      explanation: "The # symbol is used for single-line comments in Python.",
      subject: "Python Programming"
    },
    {
      text: "Which function displays output?",
      options: [
        { text: "input()", isCorrect: false },
        { text: "print()", isCorrect: true },
        { text: "show()", isCorrect: false },
        { text: "echo()", isCorrect: false }
      ],
      explanation: "The print() function is used to display output to the console in Python.",
      subject: "Python Programming"
    },
    {
      text: "Which function accepts user input?",
      options: [
        { text: "read()", isCorrect: false },
        { text: "input()", isCorrect: true },
        { text: "print()", isCorrect: false },
        { text: "write()", isCorrect: false }
      ],
      explanation: "The input() function reads a line of text from the user.",
      subject: "Python Programming"
    },
    {
      text: "Which of the following is a valid variable name?",
      options: [
        { text: "2name", isCorrect: false },
        { text: "my_name", isCorrect: true },
        { text: "class", isCorrect: false },
        { text: "first-name", isCorrect: false }
      ],
      explanation: "my_name is valid — variable names can't start with a number, be a reserved keyword, or contain hyphens.",
      subject: "Python Programming"
    },
    {
      text: "Python is case __.",
      options: [
        { text: "Independent", isCorrect: false },
        { text: "Sensitive", isCorrect: true },
        { text: "Free", isCorrect: false },
        { text: "Ignored", isCorrect: false }
      ],
      explanation: "Python is case-sensitive — 'Name' and 'name' are treated as different identifiers.",
      subject: "Python Programming"
    },
    {
      text: "Which data type stores whole numbers?",
      options: [
        { text: "float", isCorrect: false },
        { text: "int", isCorrect: true },
        { text: "str", isCorrect: false },
        { text: "bool", isCorrect: false }
      ],
      explanation: "The int (integer) data type stores whole numbers without decimal points.",
      subject: "Python Programming"
    },
    {
      text: "Which operator performs exponentiation?",
      options: [
        { text: "^", isCorrect: false },
        { text: "**", isCorrect: true },
        { text: "%", isCorrect: false },
        { text: "//", isCorrect: false }
      ],
      explanation: "The ** operator is used for exponentiation in Python (e.g., 2**3 = 8).",
      subject: "Python Programming"
    },
    {
      text: "What is the output of print(type(10))?",
      options: [
        { text: "int", isCorrect: false },
        { text: "<class 'int'>", isCorrect: true },
        { text: "integer", isCorrect: false },
        { text: "number", isCorrect: false }
      ],
      explanation: "The type() function returns the type of an object, displayed as <class 'int'> for integers.",
      subject: "Python Programming"
    },
    {
      text: "Which keyword defines a function?",
      options: [
        { text: "function", isCorrect: false },
        { text: "define", isCorrect: false },
        { text: "def", isCorrect: true },
        { text: "fun", isCorrect: false }
      ],
      explanation: "The 'def' keyword is used to define a function in Python.",
      subject: "Python Programming"
    },
    {
      text: "Which keyword is used to make decisions?",
      options: [
        { text: "if", isCorrect: true },
        { text: "for", isCorrect: false },
        { text: "while", isCorrect: false },
        { text: "break", isCorrect: false }
      ],
      explanation: "The 'if' keyword is used for conditional decision-making in Python.",
      subject: "Python Programming"
    },
    {
      text: "Which loop is used to iterate over a sequence?",
      options: [
        { text: "do-while", isCorrect: false },
        { text: "for", isCorrect: true },
        { text: "repeat", isCorrect: false },
        { text: "until", isCorrect: false }
      ],
      explanation: "The 'for' loop is used to iterate over sequences like lists, tuples, and strings.",
      subject: "Python Programming"
    },
    {
      text: "Which keyword exits a loop?",
      options: [
        { text: "stop", isCorrect: false },
        { text: "continue", isCorrect: false },
        { text: "break", isCorrect: true },
        { text: "exit", isCorrect: false }
      ],
      explanation: "The 'break' keyword terminates the nearest enclosing loop immediately.",
      subject: "Python Programming"
    },
    {
      text: "Which keyword skips the current iteration?",
      options: [
        { text: "next", isCorrect: false },
        { text: "continue", isCorrect: true },
        { text: "break", isCorrect: false },
        { text: "pass", isCorrect: false }
      ],
      explanation: "The 'continue' keyword skips the rest of the current iteration and moves to the next one.",
      subject: "Python Programming"
    },
    {
      text: "Which collection is enclosed in square brackets?",
      options: [
        { text: "Tuple", isCorrect: false },
        { text: "List", isCorrect: true },
        { text: "Dictionary", isCorrect: false },
        { text: "Set", isCorrect: false }
      ],
      explanation: "Lists in Python are enclosed in square brackets [], e.g., [1, 2, 3].",
      subject: "Python Programming"
    },
    {
      text: "Which collection uses curly braces with key-value pairs?",
      options: [
        { text: "List", isCorrect: false },
        { text: "Tuple", isCorrect: false },
        { text: "Dictionary", isCorrect: true },
        { text: "String", isCorrect: false }
      ],
      explanation: "Dictionaries use curly braces with key-value pairs, e.g., {'name': 'John', 'age': 25}.",
      subject: "Python Programming"
    },
    {
      text: "Which data type is immutable?",
      options: [
        { text: "List", isCorrect: false },
        { text: "Dictionary", isCorrect: false },
        { text: "Tuple", isCorrect: true },
        { text: "Set", isCorrect: false }
      ],
      explanation: "Tuples are immutable — once created, their elements cannot be changed.",
      subject: "Python Programming"
    },
    {
      text: "Which function returns the length of a list?",
      options: [
        { text: "count()", isCorrect: false },
        { text: "size()", isCorrect: false },
        { text: "len()", isCorrect: true },
        { text: "length()", isCorrect: false }
      ],
      explanation: "The len() function returns the number of items in a sequence or collection.",
      subject: "Python Programming"
    },
    {
      text: "Which operator checks equality?",
      options: [
        { text: "=", isCorrect: false },
        { text: "==", isCorrect: true },
        { text: "!=", isCorrect: false },
        { text: ">=", isCorrect: false }
      ],
      explanation: "The == operator checks whether two values are equal.",
      subject: "Python Programming"
    },
    {
      text: "Which operator is used for assignment?",
      options: [
        { text: "==", isCorrect: false },
        { text: "=", isCorrect: true },
        { text: "<=", isCorrect: false },
        { text: "!=", isCorrect: false }
      ],
      explanation: "The = operator assigns a value to a variable.",
      subject: "Python Programming"
    },
    {
      text: "Which keyword creates a class?",
      options: [
        { text: "object", isCorrect: false },
        { text: "class", isCorrect: true },
        { text: "def", isCorrect: false },
        { text: "new", isCorrect: false }
      ],
      explanation: "The 'class' keyword is used to define a class in Python.",
      subject: "Python Programming"
    },
    {
      text: "Which function converts a string to an integer?",
      options: [
        { text: "str()", isCorrect: false },
        { text: "float()", isCorrect: false },
        { text: "int()", isCorrect: true },
        { text: "bool()", isCorrect: false }
      ],
      explanation: "The int() function converts a value (like a string) to an integer.",
      subject: "Python Programming"
    },
    {
      text: "Which function converts a value to a string?",
      options: [
        { text: "int()", isCorrect: false },
        { text: "float()", isCorrect: false },
        { text: "str()", isCorrect: true },
        { text: "list()", isCorrect: false }
      ],
      explanation: "The str() function converts a value to its string representation.",
      subject: "Python Programming"
    },
    {
      text: "Which module is used for mathematical functions?",
      options: [
        { text: "os", isCorrect: false },
        { text: "math", isCorrect: true },
        { text: "sys", isCorrect: false },
        { text: "random", isCorrect: false }
      ],
      explanation: "The math module provides mathematical functions like sqrt(), ceil(), floor(), etc.",
      subject: "Python Programming"
    },
    {
      text: "Which function generates a random integer?",
      options: [
        { text: "randint()", isCorrect: true },
        { text: "randomint()", isCorrect: false },
        { text: "integer()", isCorrect: false },
        { text: "rand()", isCorrect: false }
      ],
      explanation: "The randint() function from the random module generates a random integer within a range.",
      subject: "Python Programming"
    },
    {
      text: "Which keyword handles exceptions?",
      options: [
        { text: "catch", isCorrect: false },
        { text: "try", isCorrect: true },
        { text: "throw", isCorrect: false },
        { text: "except", isCorrect: false }
      ],
      explanation: "The 'try' keyword begins a block of code that might raise an exception.",
      subject: "Python Programming"
    },
    {
      text: "Which block executes when no exception occurs?",
      options: [
        { text: "else", isCorrect: true },
        { text: "finally", isCorrect: false },
        { text: "pass", isCorrect: false },
        { text: "break", isCorrect: false }
      ],
      explanation: "The 'else' block in a try-except structure runs only when no exception occurs.",
      subject: "Python Programming"
    },
    {
      text: "Which keyword imports a module?",
      options: [
        { text: "include", isCorrect: false },
        { text: "import", isCorrect: true },
        { text: "using", isCorrect: false },
        { text: "package", isCorrect: false }
      ],
      explanation: "The 'import' keyword is used to include modules in Python.",
      subject: "Python Programming"
    },
    {
      text: "Which method adds an item to a list?",
      options: [
        { text: "insert()", isCorrect: false },
        { text: "append()", isCorrect: true },
        { text: "add()", isCorrect: false },
        { text: "push()", isCorrect: false }
      ],
      explanation: "The append() method adds a single item to the end of a list.",
      subject: "Python Programming"
    },
    {
      text: "Which method removes the last item in a list?",
      options: [
        { text: "delete()", isCorrect: false },
        { text: "pop()", isCorrect: true },
        { text: "remove()", isCorrect: false },
        { text: "clear()", isCorrect: false }
      ],
      explanation: "The pop() method removes and returns the last item from a list.",
      subject: "Python Programming"
    },
    {
      text: "Which operator performs floor division?",
      options: [
        { text: "/", isCorrect: false },
        { text: "//", isCorrect: true },
        { text: "%", isCorrect: false },
        { text: "**", isCorrect: false }
      ],
      explanation: "The // operator performs floor division, returning the largest integer less than or equal to the result.",
      subject: "Python Programming"
    },
    {
      text: "Which Boolean value means truth?",
      options: [
        { text: "Yes", isCorrect: false },
        { text: "1", isCorrect: false },
        { text: "True", isCorrect: true },
        { text: "On", isCorrect: false }
      ],
      explanation: "In Python, the Boolean value True represents truth. While 1 is truthy, True is the actual Boolean.",
      subject: "Python Programming"
    },
    {
      text: "Which function opens a file?",
      options: [
        { text: "file()", isCorrect: false },
        { text: "open()", isCorrect: true },
        { text: "read()", isCorrect: false },
        { text: "write()", isCorrect: false }
      ],
      explanation: "The open() function is used to open a file and returns a file object.",
      subject: "Python Programming"
    },
    {
      text: "Which statement closes a file?",
      options: [
        { text: "end()", isCorrect: false },
        { text: "stop()", isCorrect: false },
        { text: "close()", isCorrect: true },
        { text: "finish()", isCorrect: false }
      ],
      explanation: "The close() method closes an open file and frees up system resources.",
      subject: "Python Programming"
    }
  ];

  console.log(`Prepared ${questions.length} questions.`);

  // Check if a quiz already exists for this course
  let quiz = await Quiz.findOne({ course: course._id, title: { $regex: /python/i } });
  if (quiz) {
    // Append new questions to existing quiz
    const existingCount = quiz.questions.length;
    quiz.questions.push(...questions);
    await quiz.save();
    console.log(`✅ Appended ${questions.length} questions to existing quiz "${quiz.title}" (was ${existingCount}, now ${quiz.questions.length}).`);
  } else {
    // Create new quiz
    quiz = await Quiz.create({
      title: "Python Programming CBT",
      description: "HND I Python Programming practice exam covering fundamentals, data types, control structures, functions, and file handling.",
      course: course._id,
      questions: questions,
      timeLimit: 35,
      isActive: true
    });
    console.log(`✅ Created new quiz "${quiz.title}" with ${questions.length} questions.`);
  }

  console.log(`Quiz ID: ${quiz._id}`);
  process.exit(0);
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
