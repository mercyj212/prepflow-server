require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const path = require('path');
const fs = require('fs');

const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function inspectPdfs() {
  const pdfDir = path.join(__dirname, '..', 'pdfs');
  const files = fs.readdirSync(pdfDir).filter(f => f.endsWith('.pdf'));

  console.log(`Found ${files.length} PDFs in pdfs directory:\n`);

  for (const f of files) {
    if (f.toLowerCase().includes('ncc') || f.toLowerCase().includes('network') || f.toLowerCase().includes('rout') || f.toLowerCase().includes('switch')) {
      const fullPath = path.join(pdfDir, f);
      console.log(`Uploading ${f}...`);
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
          { text: "Describe what this PDF covers in 2 sentences. Does it cover Routing and Switching?" }
        ]);
        console.log(`=== ${f} ===`);
        console.log(res.response.text());
        console.log('\n');
      } catch (err) {
        console.error(`Error processing ${f}:`, err.message);
      }
    }
  }
}

inspectPdfs().catch(console.error);
