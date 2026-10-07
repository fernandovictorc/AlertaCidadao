const https = require('https');
const fs = require('fs');

https.get('https://www.producthunt.com/', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('ph.html', data);
    console.log('Saved to ph.html');
  });
}).on('error', (err) => {
  console.error('Error: ' + err.message);
});
