import { GoogleGenerativeAI } from '@google/generative-ai';
import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function checkModels() {
  try {
    const listModels = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await listModels.generateContent("Hello?");
    console.log("SUCCESS: 1.5-flash works!");
    console.log("RESPONSE:", result.response.text());
  } catch (err) {
    console.error("1.5-flash FAILED:", err.message);
    try {
      const modelPro = await genAI.getGenerativeModel({ model: "gemini-pro" });
      const resultPro = await modelPro.generateContent("Hello?");
      console.log("SUCCESS: gemini-pro works!");
    } catch (errPro) {
      console.error("gemini-pro FAILED:", errPro.message);
    }
  }
}

checkModels();
