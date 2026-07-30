const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

async function checkPdfText() {
  const dirs = [
    path.join(__dirname, '..', 'pdfs'),
    path.join(__dirname, '..', 'pdfs', 'Telegram Desktop')
  ];

  for (const d of dirs) {
    if (!fs.existsSync(d)) continue;
    const files = fs.readdirSync(d).filter(f => f.endsWith('.pdf'));
    for (const f of files) {
      const fullPath = path.join(d, f);
      try {
        const buffer = fs.readFileSync(fullPath);
        const data = await pdf(buffer);
        const text = data.text.toLowerCase();
        if (text.includes('routing') || text.includes('switching') || text.includes('ncc-321') || text.includes('ncc 321')) {
          console.log(`\n🎯 MATCH FOUND: ${f} (${d.includes('Telegram') ? 'Telegram' : 'Root'})`);
          console.log(`   Page count: ${data.numpages}`);
          console.log(`   Sample text: ${data.text.slice(0, 300).replace(/\n/g, ' ')}`);
        }
      } catch (err) {
        // Skip unparseable
      }
    }
  }
}

checkPdfText().catch(console.error);
