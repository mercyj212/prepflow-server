require('dotenv').config();
const mongoose = require('mongoose');

const paperQuestions = [
  {
    text: "What does HTML stand for?",
    options: [
      { text: "Hyper Text Markup Language", isCorrect: true },
      { text: "High Text Machine Language", isCorrect: false },
      { text: "Hyperlink Text Managing Language", isCorrect: false },
      { text: "Home Tool Markup Language", isCorrect: false }
    ],
    explanation: "HTML stands for Hyper Text Markup Language, the standard markup language for creating Web pages.",
    subject: "HTML Basics"
  },
  {
    text: "Which HTML tag is used to create a hyperlink?",
    options: [
      { text: "<link>", isCorrect: false },
      { text: "<a>", isCorrect: true },
      { text: "<href>", isCorrect: false },
      { text: "<url>", isCorrect: false }
    ],
    explanation: "The <a> (anchor) tag defines a hyperlink used to link from one page to another.",
    subject: "HTML Elements"
  },
  {
    text: "Which tag is used to insert an image in HTML?",
    options: [
      { text: "<img>", isCorrect: true },
      { text: "<image>", isCorrect: false },
      { text: "<picture>", isCorrect: false },
      { text: "<src>", isCorrect: false }
    ],
    explanation: "The <img> tag embeds an image in an HTML page using the 'src' attribute.",
    subject: "HTML Media"
  },
  {
    text: "Which HTML tag is used for the largest heading?",
    options: [
      { text: "<h6>", isCorrect: false },
      { text: "<heading>", isCorrect: false },
      { text: "<h1>", isCorrect: true },
      { text: "<head>", isCorrect: false }
    ],
    explanation: "<h1> defines the most important and largest heading, while <h6> defines the least important/smallest heading.",
    subject: "HTML Structure"
  },
  {
    text: "Which tag is used to create a line break?",
    options: [
      { text: "<break>", isCorrect: false },
      { text: "<lb>", isCorrect: false },
      { text: "<br>", isCorrect: true },
      { text: "<newline>", isCorrect: false }
    ],
    explanation: "The <br> tag inserts a single line break in text without starting a new paragraph.",
    subject: "HTML Formatting"
  },
  {
    text: "Which attribute specifies the URL of a link?",
    options: [
      { text: "src", isCorrect: false },
      { text: "href", isCorrect: true },
      { text: "link", isCorrect: false },
      { text: "url", isCorrect: false }
    ],
    explanation: "The 'href' (Hypertext Reference) attribute inside an <a> tag specifies the destination URL of the link.",
    subject: "HTML Attributes"
  },
  {
    text: "Which HTML element is used to create a numbered list?",
    options: [
      { text: "<ul>", isCorrect: false },
      { text: "<ol>", isCorrect: true },
      { text: "<li>", isCorrect: false },
      { text: "<dl>", isCorrect: false }
    ],
    explanation: "<ol> creates an ordered (numbered) list, whereas <ul> creates an unordered (bulleted) list.",
    subject: "HTML Lists"
  },
  {
    text: "What does CSS stand for?",
    options: [
      { text: "Cascading Style Sheets", isCorrect: true },
      { text: "Colorful Style Systems", isCorrect: false },
      { text: "Computer Style Sheets", isCorrect: false },
      { text: "Creative Styling Syntax", isCorrect: false }
    ],
    explanation: "CSS stands for Cascading Style Sheets, used to format and style the visual layout of HTML documents.",
    subject: "CSS Basics"
  },
  {
    text: "Which property is used to change text color in CSS?",
    options: [
      { text: "text-color", isCorrect: false },
      { text: "color", isCorrect: true },
      { text: "font-color", isCorrect: false },
      { text: "foreground", isCorrect: false }
    ],
    explanation: "The 'color' property in CSS specifies the foreground color of text elements.",
    subject: "CSS Properties"
  },
  {
    text: "Which CSS property controls the text size?",
    options: [
      { text: "text-size", isCorrect: false },
      { text: "font-style", isCorrect: false },
      { text: "font-size", isCorrect: true },
      { text: "text-style", isCorrect: false }
    ],
    explanation: "The 'font-size' property sets the size of text/fonts in CSS.",
    subject: "CSS Typography"
  },
  {
    text: "Which symbol is used to select a class in CSS?",
    options: [
      { text: "#", isCorrect: false },
      { text: ". (period)", isCorrect: true },
      { text: "@", isCorrect: false },
      { text: "*", isCorrect: false }
    ],
    explanation: "The period/dot (.) character is used in CSS selectors to select elements with a specific class name.",
    subject: "CSS Selectors"
  },
  {
    text: "Which symbol is used to select an ID in CSS?",
    options: [
      { text: ".", isCorrect: false },
      { text: "# (hash)", isCorrect: true },
      { text: "$", isCorrect: false },
      { text: "&", isCorrect: false }
    ],
    explanation: "The hash (#) character is used in CSS selectors to select an element with a unique ID attribute.",
    subject: "CSS Selectors"
  },
  {
    text: "Which property is used to change the background color?",
    options: [
      { text: "bgcolor", isCorrect: false },
      { text: "background-color", isCorrect: true },
      { text: "color-background", isCorrect: false },
      { text: "bg-color", isCorrect: false }
    ],
    explanation: "The 'background-color' CSS property sets the background color of an element.",
    subject: "CSS Styling"
  },
  {
    text: "Which CSS property is used to make text bold?",
    options: [
      { text: "font-weight: bold;", isCorrect: true },
      { text: "text-style: bold;", isCorrect: false },
      { text: "font-bold: true;", isCorrect: false },
      { text: "style: bold;", isCorrect: false }
    ],
    explanation: "The 'font-weight' property specifies the weight or thickness of a font (e.g., bold or 700).",
    subject: "CSS Typography"
  },
  {
    text: "Which keyword is used to declare a variable in JavaScript?",
    options: [
      { text: "var", isCorrect: false },
      { text: "let", isCorrect: false },
      { text: "const", isCorrect: false },
      { text: "All of the above (var, let, const)", isCorrect: true }
    ],
    explanation: "JavaScript provides var, let, and const keywords to declare variables.",
    subject: "JavaScript Fundamentals"
  },
  {
    text: "Which method displays a message box in JavaScript?",
    options: [
      { text: "alert()", isCorrect: true },
      { text: "msgBox()", isCorrect: false },
      { text: "prompt()", isCorrect: false },
      { text: "console.log()", isCorrect: false }
    ],
    explanation: "The alert() method displays a modal alert box containing a specified message and an OK button.",
    subject: "JavaScript Functions"
  },
  {
    text: "What are the ways a variable can be declared in JavaScript?",
    options: [
      { text: "Using var, let, or const", isCorrect: false },
      { text: "Automatically by assigning a value to an undeclared variable", isCorrect: false },
      { text: "Using dim or define keywords", isCorrect: false },
      { text: "Both A and B", isCorrect: true }
    ],
    explanation: "Variables can be explicitly declared using var, let, or const, or implicitly created by assigning a value without a keyword.",
    subject: "JavaScript Variables"
  },
  {
    text: "What is a method in JavaScript?",
    options: [
      { text: "A function stored as an object property", isCorrect: true },
      { text: "A variable holding a string value", isCorrect: false },
      { text: "A CSS layout rule", isCorrect: false },
      { text: "An HTML element attribute", isCorrect: false }
    ],
    explanation: "A method in JavaScript is an object property that stores a function definition.",
    subject: "JavaScript Objects"
  },
  {
    text: "What is the purpose of the Array map() method in JavaScript?",
    options: [
      { text: "It creates a new array populated with the results of calling a provided function on every element in the calling array", isCorrect: true },
      { text: "It deletes all elements in an existing array", isCorrect: false },
      { text: "It sorts array items alphabetically", isCorrect: false },
      { text: "It converts an array to an HTML map element", isCorrect: false }
    ],
    explanation: "Array.prototype.map() transforms each element of an array using a callback function and returns a new transformed array.",
    subject: "JavaScript Arrays"
  },
  {
    text: "What is an object in JavaScript?",
    options: [
      { text: "A standalone entity containing a collection of key-value pairs (properties and methods)", isCorrect: true },
      { text: "A primitive boolean true/false value", isCorrect: false },
      { text: "A CSS layout rule", isCorrect: false },
      { text: "An HTML form input tag", isCorrect: false }
    ],
    explanation: "An object in JavaScript is a non-primitive data structure that holds collections of key-value pairs representing properties and methods.",
    subject: "JavaScript Data Structures"
  }
];

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;

  const frontendCourse = await db.collection('courses').findOne({
    $or: [
      { title: 'FRONTEND WEB DEVELOPMENT' },
      { title: 'FRONTEND DEVELOPMENT' }
    ]
  });

  if (!frontendCourse) {
    console.error('FRONTEND WEB DEVELOPMENT course not found');
    process.exit(1);
  }

  const quiz = await db.collection('quizzes').findOne({ course: frontendCourse._id });
  if (!quiz) {
    console.error('Quiz not found for Frontend Web Development course');
    process.exit(1);
  }

  console.log(`Current questions count: ${quiz.questions?.length}`);

  const updateRes = await db.collection('quizzes').updateOne(
    { _id: quiz._id },
    { $push: { questions: { $each: paperQuestions } } }
  );

  console.log(`✅ Successfully appended 20 test paper questions to Frontend CBT Quiz!`);

  const updatedQuiz = await db.collection('quizzes').findOne({ _id: quiz._id });
  console.log(`New total questions count: ${updatedQuiz.questions?.length}`);

  mongoose.disconnect();
});
