require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const path = require('path');
const fs = require('fs');

const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function scanAllPdfs() {
  const dirs = [
    path.join(__dirname, '..', 'pdfs'),
    path.join(__dirname, '..', 'pdfs', 'Telegram Desktop')
  ];

  for (const d of dirs) {
    if (!fs.existsSync(d)) continue;
    const files = fs.readdirSync(d).filter(f => f.endsWith('.pdf'));
    for (const f of files) {
      const fullPath = path.join(d, f);
      // Check file names like IMG_*, NCC*, lesson*, etc.
      console.log(`Checking ${f} (${d.includes('Telegram') ? 'Telegram' : 'Root'})...`);
      try {
        const uploadRes = await fileManager.uploadFile(fullPath, {
          mimeType: "application/pdf",
          displayName: f
        });
        let file = await fileManager.getFile(uploadRes.file.name);
        while (file.state === "PROCESSING") {
          await new Promise(r => setTimeout(r, 2000));
          file = await fileManager.getFile(uploadRes.file.name);
        }
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
        const res = await model.generateContent([
          { fileData: { mimeType: file.mimeType, fileUri: file.uri } },
          { text: "What is the main title or topic of this document? Does it cover Routing and Switching (1 & 2)?" }
        ]);
        console.log(`  File: ${f} -> Output: ${res.response.text().slice(0, 200)}...`);
      } catch (err) {
        console.error(`  Error reading ${f}: ${err.message}`);
      }
    }
  }
}

scanAllPdfs().catch(console.error);
