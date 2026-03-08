const https = require('https');

https.get('https://disaster911.net', (res) => {
  console.log('Status:', res.statusCode);
  console.log('Headers:', JSON.stringify(res.headers, null, 2));
  
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const titleMatch = data.match(/<title>(.*?)<\/title>/);
    const descMatch = data.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/);
    
    console.log('--- LIVE SITE DATA ---');
    console.log('Title:', titleMatch ? titleMatch[1] : 'Not found');
    console.log('Description:', descMatch ? descMatch[1] : 'Not found');
    console.log('Schema Detect:', data.includes('application/ld+json') ? 'Present' : 'Missing');
    console.log('GHL Detect:', data.includes('link.msgsndr.com') ? 'Present' : 'Missing');
  });
}).on('error', (e) => {
  console.error(e);
});
