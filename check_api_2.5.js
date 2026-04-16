import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function checkModels() {
  const modelName = "gemini-2.5-flash";
  try {
    const model = await genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent("Hello?");
    console.log(`SUCCESS: ${modelName} works!`);
    console.log("RESPONSE:", result.response.text());
  } catch (err) {
    console.error(`${modelName} FAILED:`, err.message);
  }
}

checkModels();
