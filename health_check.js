import http from 'http';

http.get('http://localhost:10000/api/health', (res) => {
  console.log('STATUS:', res.statusCode);
  res.on('data', d => process.stdout.write(d));
}).on('error', e => console.error('ERROR:', e.message));
