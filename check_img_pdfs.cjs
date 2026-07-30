require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const path = require('path');
const fs = require('fs');

const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function checkImgPdfs() {
  const dirs = [
    path.join(__dirname, '..', 'pdfs', 'Telegram Desktop'),
    path.join(__dirname, '..', 'pdfs')
  ];

  for (const d of dirs) {
    if (!fs.existsSync(d)) continue;
    const files = fs.readdirSync(d).filter(f => f.toLowerCase().startsWith('img_') && f.endsWith('.pdf'));
    for (const f of files) {
      const fullPath = path.join(d, f);
      console.log(`Checking scanned PDF: ${f}...`);
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
          { text: "What course title or subject is written on page 1 of this PDF? Be brief." }
        ]);
        const outputText = res.response.text().trim();
        console.log(`  🎯 ${f}: ${outputText}`);

        await new Promise(r => setTimeout(r, 5000));
      } catch (err) {
        console.error(`  Error on ${f}: ${err.message}`);
        await new Promise(r => setTimeout(r, 6000));
      }
    }
  }
}

checkImgPdfs().catch(console.error);
