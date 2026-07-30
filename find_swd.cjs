require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const courses = await mongoose.connection.db.collection('courses').find({
    $or: [
      { title: /swd/i },
      { courseCode: /swd/i },
      { title: /software/i }
    ]
  }).toArray();

  if (courses.length === 0) {
    console.log('No SWD course found. Listing ALL courses:');
    const all = await mongoose.connection.db.collection('courses').find({}).toArray();
    all.forEach(c => console.log(`ID: ${c._id} | Code: ${c.courseCode} | Title: ${c.title}`));
  } else {
    courses.forEach(c => console.log(`ID: ${c._id} | Code: ${c.courseCode} | Title: ${c.title}`));
  }
  mongoose.disconnect();
});
