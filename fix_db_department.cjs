require('dotenv').config();
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  const result = await mongoose.connection.db.collection('courses').updateOne(
    { _id: new ObjectId('69e2146d67e00d9c07c51d5a') },
    { $set: { level: 'HND1' } }
  );

  console.log(result.modifiedCount === 1 ? '✅ Level updated to HND1' : '⚠️ No change made');

  const updated = await mongoose.connection.db.collection('courses').findOne({ _id: new ObjectId('69e2146d67e00d9c07c51d5a') });
  console.log(`Title: ${updated.title} | Level: ${updated.level} | Department: ${updated.department}`);

  mongoose.disconnect();
});
