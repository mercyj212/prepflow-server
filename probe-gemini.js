import fetch from "node-fetch"; // or just use global fetch if node18+
import dotenv from "dotenv";

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;
const URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

async function probe() {
  const payload = {
    contents: [{ parts: [{ text: "Hello" }] }]
  };

  try {
    const res = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log("STATUS:", res.status);
    console.log("RESPONSE:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("FETCH ERROR:", err.message);
  }
}

probe();
