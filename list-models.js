import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listAllModels() {
  try {
    const list = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // The native SDK doesn't have a simple .listModels() in the v1/v1beta high-level client
    // without using the underlying fetch or a different library.
    // However, we can try to "probe" several common models.
    
    const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-1.0-pro", "gemini-pro"];
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        await model.generateContent("test");
        console.log(`✅ Model AVAILABLE: ${m}`);
      } catch (err) {
        console.log(`❌ Model UNAVAILABLE: ${m} (${err.message})`);
      }
    }
  } catch (err) {
    console.error("Fatal list error:", err.message);
  }
}

listAllModels();
