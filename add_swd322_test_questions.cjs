require('dotenv').config();
const mongoose = require('mongoose');

const newQuestions = [
  {
    text: "What is query optimization in a database?",
    options: [
      { text: "Deleting unused data", isCorrect: false },
      { text: "Improving query performance and reducing resource usage", isCorrect: true },
      { text: "Creating tables", isCorrect: false },
      { text: "Backing up data", isCorrect: false }
    ],
    explanation: "Query optimization is the process of selecting the most efficient execution plan for a SQL query to improve execution speed and reduce CPU/IO consumption.",
    subject: "Query Optimization"
  },
  {
    text: "The main goal of query optimization is to:",
    options: [
      { text: "Increase storage size", isCorrect: false },
      { text: "Make queries run faster and use fewer resources", isCorrect: true },
      { text: "Encrypt data", isCorrect: false },
      { text: "Delete indexes", isCorrect: false }
    ],
    explanation: "The primary objective of query optimization is to minimize execution time and resource utilization (CPU, memory, and disk I/O).",
    subject: "Query Optimization"
  },
  {
    text: "Which of the following best describes query efficiency?",
    options: [
      { text: "Amount of data stored in a database", isCorrect: false },
      { text: "Speed and effectiveness of retrieving data", isCorrect: true },
      { text: "Number of users in a system", isCorrect: false },
      { text: "Size of database tables", isCorrect: false }
    ],
    explanation: "Query efficiency measures how quickly and resource-effectively a database system fetches and processes requested data.",
    subject: "Query Performance"
  },
  {
    text: "What happens when a query is inefficient?",
    options: [
      { text: "Faster execution", isCorrect: false },
      { text: "Reduced CPU usage", isCorrect: false },
      { text: "Increased execution time and resource usage", isCorrect: true },
      { text: "Better indexing", isCorrect: false }
    ],
    explanation: "Inefficient queries consume excessive CPU, memory, and I/O cycles, leading to slow response times and potential system performance degradation.",
    subject: "Query Performance"
  },
  {
    text: "Aggregate functions are used to",
    options: [
      { text: "Delete records", isCorrect: false },
      { text: "Update records", isCorrect: false },
      { text: "Perform calculations on multiple rows", isCorrect: true },
      { text: "Create tables", isCorrect: false }
    ],
    explanation: "Aggregate functions process a set of values across multiple rows to compute a single aggregated summary value.",
    subject: "SQL Aggregates"
  },
  {
    text: "Which of the following is an aggregate function?",
    options: [
      { text: "SELECT", isCorrect: false },
      { text: "COUNT", isCorrect: true },
      { text: "CREATE", isCorrect: false },
      { text: "DELETE", isCorrect: false }
    ],
    explanation: "COUNT is a standard SQL aggregate function that returns the total count of rows or non-null column values.",
    subject: "SQL Aggregates"
  },
  {
    text: "Which of the following is an example of structured data?",
    options: [
      { text: "Social media posts", isCorrect: false },
      { text: "Images", isCorrect: false },
      { text: "Student database", isCorrect: true },
      { text: "Videos", isCorrect: false }
    ],
    explanation: "Structured data follows a strict schema with defined tables, rows, and columns (e.g., a relational student database).",
    subject: "Data Types"
  },
  {
    text: "Which aggregate function counts number of records?",
    options: [
      { text: "COUNT()", isCorrect: true },
      { text: "SUM()", isCorrect: false },
      { text: "MAX()", isCorrect: false },
      { text: "AVG()", isCorrect: false }
    ],
    explanation: "The COUNT() function counts and returns the number of records or rows matching a query condition.",
    subject: "SQL Aggregates"
  },
  {
    text: "Aggregate functions return",
    options: [
      { text: "Multiple rows", isCorrect: false },
      { text: "Single value", isCorrect: true },
      { text: "Table", isCorrect: false },
      { text: "Database", isCorrect: false }
    ],
    explanation: "An aggregate function operates on a group of rows and returns a single summary result value.",
    subject: "SQL Aggregates"
  },
  {
    text: "GROUP BY is usually used with",
    options: [
      { text: "Constraints", isCorrect: false },
      { text: "Aggregate functions", isCorrect: true },
      { text: "Tables", isCorrect: false },
      { text: "Indexes", isCorrect: false }
    ],
    explanation: "The GROUP BY clause groups rows that share common column values, usually paired with aggregate functions (e.g., SUM, COUNT, AVG).",
    subject: "SQL Queries"
  },
  {
    text: "NoSQL databases are best for",
    options: [
      { text: "Small data", isCorrect: false },
      { text: "Structured data only", isCorrect: false },
      { text: "Large and unstructured data", isCorrect: true },
      { text: "Only numeric data", isCorrect: false }
    ],
    explanation: "NoSQL databases provide high scalability and flexible schemas suitable for storing large-scale, unstructured or semi-structured datasets.",
    subject: "NoSQL Databases"
  },
  {
    text: "Which database is best for structured data?",
    options: [
      { text: "NoSQL", isCorrect: false },
      { text: "Document Database", isCorrect: false },
      { text: "Relational Database", isCorrect: true },
      { text: "MongoDB", isCorrect: false }
    ],
    explanation: "Relational Databases (RDBMS) are specifically engineered for highly structured tabular data governed by schemas and ACID guarantees.",
    subject: "Database Architecture"
  },
  {
    text: "In relational databases, rows are also called",
    options: [
      { text: "Columns", isCorrect: false },
      { text: "Fields", isCorrect: false },
      { text: "Records", isCorrect: true },
      { text: "Objects", isCorrect: false }
    ],
    explanation: "In a relational table, a row is also commonly termed a record or tuple.",
    subject: "Relational Concepts"
  },
  {
    text: "A column in a relational database represents",
    options: [
      { text: "Record", isCorrect: false },
      { text: "Attribute", isCorrect: true },
      { text: "Table", isCorrect: false },
      { text: "Document", isCorrect: false }
    ],
    explanation: "A column in a relational table represents an attribute or characteristic of the entity.",
    subject: "Relational Concepts"
  },
  {
    text: "Which key uniquely identifies each record in a table?",
    options: [
      { text: "Foreign key", isCorrect: false },
      { text: "Primary key", isCorrect: true },
      { text: "Candidate key", isCorrect: false },
      { text: "Secondary key", isCorrect: false }
    ],
    explanation: "A primary key is a column or set of columns that uniquely identifies each row/record in a table.",
    subject: "Database Keys"
  },
  {
    text: "MySQL is mainly used for",
    options: [
      { text: "Image processing", isCorrect: false },
      { text: "Database management", isCorrect: true },
      { text: "Networking", isCorrect: false },
      { text: "File storage", isCorrect: false }
    ],
    explanation: "MySQL is a relational database management system (RDBMS) used to define, manage, query, and maintain databases.",
    subject: "DBMS Software"
  },
  {
    text: "Which of the following is a weakness of relational databases?",
    options: [
      { text: "Strong consistency", isCorrect: false },
      { text: "Difficult scaling", isCorrect: true },
      { text: "Data integrity", isCorrect: false },
      { text: "Security", isCorrect: false }
    ],
    explanation: "Relational databases are historically designed for vertical scaling; horizontal scaling (sharding across servers) is complex and challenging.",
    subject: "Database Systems"
  },
  {
    text: "Relational databases use ________ to retrieve data",
    options: [
      { text: "HTML", isCorrect: false },
      { text: "SQL", isCorrect: true },
      { text: "XML", isCorrect: false },
      { text: "JSON", isCorrect: false }
    ],
    explanation: "Structured Query Language (SQL) is the standard query language for retrieving and manipulating relational data.",
    subject: "SQL Basics"
  },
  {
    text: "A document database stores data in",
    options: [
      { text: "Tables", isCorrect: false },
      { text: "Files", isCorrect: false },
      { text: "Documents", isCorrect: true },
      { text: "Rows", isCorrect: false }
    ],
    explanation: "Document databases organize and store data as documents (typically JSON, BSON, or XML formats).",
    subject: "NoSQL Databases"
  },
  {
    text: "Which of the following is an example of document database?",
    options: [
      { text: "MySQL", isCorrect: false },
      { text: "MongoDB", isCorrect: true },
      { text: "Oracle", isCorrect: false },
      { text: "SQL Server", isCorrect: false }
    ],
    explanation: "MongoDB is a leading document-oriented NoSQL database that stores data in JSON-like BSON documents.",
    subject: "NoSQL Databases"
  }
];

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const db = mongoose.connection.db;
  const dbCourseId = new mongoose.Types.ObjectId('69e2146d67e00d9c07c51d5a');

  const quiz = await db.collection('quizzes').findOne({ course: dbCourseId });

  if (!quiz) {
    console.error('Quiz not found for Database Design course');
    process.exit(1);
  }

  console.log(`Current questions count: ${quiz.questions?.length}`);

  const updateRes = await db.collection('quizzes').updateOne(
    { _id: quiz._id },
    { $push: { questions: { $each: newQuestions } } }
  );

  console.log(`✅ Appended 20 new questions from SWD 322 test paper.`);

  const updatedQuiz = await db.collection('quizzes').findOne({ _id: quiz._id });
  console.log(`New total questions count: ${updatedQuiz.questions?.length}`);

  mongoose.disconnect();
});
