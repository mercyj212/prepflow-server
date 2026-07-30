require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const path = require('path');

const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testFrontendPdf() {
  const pdfPath = path.join(__dirname, '..', 'pdfs', 'FRONTEND.pdf');
  console.log('Uploading FRONTEND.pdf...');
  const uploadRes = await fileManager.uploadFile(pdfPath, {
    mimeType: "application/pdf",
    displayName: "FRONTEND.pdf"
  });
  console.log(`Uploaded file: ${uploadRes.file.name}`);

  let file = await fileManager.getFile(uploadRes.file.name);
  while (file.state === "PROCESSING") {
    process.stdout.write(".");
    await new Promise((res) => setTimeout(res, 2000));
    file = await fileManager.getFile(uploadRes.file.name);
  }
  console.log(`\nFile state: ${file.state}`);

  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  const result = await model.generateContent([
    { fileData: { mimeType: file.mimeType, fileUri: file.uri } },
    { text: "Give a 3-sentence summary of what this FRONTEND PDF covers, listing the main topics." }
  ]);

  console.log('\n--- PDF Summary ---');
  console.log(result.response.text());
}

testFrontendPdf().catch(console.error);
