import 'dotenv/config';

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.models) {
      console.log('SUPPORTED MODELS:', data.models.map(m => m.name));
    } else {
      console.log('NO MODELS FOUND OR ERROR:', data);
    }
  } catch (err) {
    console.error('FETCH FAILED:', err.message);
  }
}

listModels();
