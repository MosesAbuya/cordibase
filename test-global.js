const http = require('http');

const data = JSON.stringify({ accountId: "nonexistent-id-for-now" }); // We expect an error or 0 updates, but no 500

const req = http.request({
  hostname: 'localhost',
  port: 3001,
  path: '/api/emailing/accounts/global',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-org-id': 'org_1'
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, body));
});

req.on('error', e => console.error(e));
req.write(data);
req.end();
