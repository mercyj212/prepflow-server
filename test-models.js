import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function listModels() {
  try {
    const listModels = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    // Since listModels tool is not directly in SDK, try to see if it even initializes
    console.log("Model initialized successfully.");
  } catch (err) {
    console.error("Model initialization FAILED:", err.message);
  }
}

listModels();
