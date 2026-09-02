const fs = require('fs');

let file = 'apps/web/src/app/api/emailing/logs/route.ts';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf-8');
  content = content.replace(/.*requireAuth.*/g, '');
  fs.writeFileSync(file, content);
}
console.log('Fixed auth in logs API route');
