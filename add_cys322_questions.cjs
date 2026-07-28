require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

async function main() {
  try {
    const rawData = fs.readFileSync('cys322_extra_questions.txt', 'utf8');
    
    // Split into question blocks (each starts with a number followed by a dot, e.g., "1.\n")
    const blocks = rawData.split(/\n(?=\d+\.\n)/).map(b => b.trim()).filter(b => b.length > 0);
    
    const formattedQuestions = [];
    
    for (const block of blocks) {
      // Clean up any weird lines like horizontal rules or extra spaces
      const lines = block.split('\n').map(l => l.trim()).filter(l => l.length > 0 && !l.startsWith('⸻'));
      
      // First line is like "1."
      // Second line (and potentially others) is the question text
      let textLines = [];
      let i = 1;
      while (i < lines.length && !lines[i].startsWith('*')) {
        textLines.push(lines[i]);
        i++;
      }
      const questionText = textLines.join(' ').trim();
      
      // Next lines should be options
      const optionsLines = [];
      while (i < lines.length && lines[i].startsWith('*')) {
        optionsLines.push(lines[i]);
        i++;
      }
      
      // Answer line
      let answerLetter = null;
      if (i < lines.length && lines[i].startsWith('Answer:')) {
        answerLetter = lines[i].replace('Answer:', '').trim();
      }
      
      if (!questionText || optionsLines.length === 0 || !answerLetter) {
        console.log("Skipping invalid block:", block);
        continue;
      }
      
      const options = optionsLines.map(opt => {
        // opt is like "* A. To increase battery life"
        const match = opt.match(/^\*\s*([A-Z])\.\s*(.+)$/);
        if (match) {
          const letter = match[1];
          const text = match[2];
          return {
            _id: new mongoose.Types.ObjectId(),
            text: text,
            isCorrect: letter === answerLetter
          };
        }
        return null;
      }).filter(o => o !== null);
      
      // Shuffle options
      options.sort(() => Math.random() - 0.5);
      
      formattedQuestions.push({
        _id: new mongoose.Types.ObjectId(),
        text: questionText,
        options: options
      });
    }
    
    console.log(`Parsed ${formattedQuestions.length} valid questions.`);
    if (formattedQuestions.length === 0) {
      process.exit(1);
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const depts = ["Cyber Security", "Networking and Cloud Computing"];
    let updatedCount = 0;
    
    for (const deptName of depts) {
      const deptDoc = await db.collection('departments').findOne({ name: deptName });
      if (!deptDoc) continue;
      
      const course = await db.collection('courses').findOne({ title: `CYS 322 - MOBILE AND WIRELESS SECURITY - ${deptName.toUpperCase()}`, department: deptDoc._id });
      if (!course) continue;
      
      const quiz = await db.collection('quizzes').findOne({ course: course._id });
      if (quiz) {
        // Append these new questions
        await db.collection('quizzes').updateOne(
          { _id: quiz._id },
          { $push: { questions: { $each: formattedQuestions } } }
        );
        updatedCount++;
        const newTotal = (quiz.questions ? quiz.questions.length : 0) + formattedQuestions.length;
        console.log(`Added ${formattedQuestions.length} questions to ${deptName} quiz. Total is now ~${newTotal}.`);
      }
    }
    
    console.log(`Successfully updated ${updatedCount} quizzes!`);
    process.exit(0);
  } catch (error) {
    console.error("An error occurred:", error);
    process.exit(1);
  }
}

main();
