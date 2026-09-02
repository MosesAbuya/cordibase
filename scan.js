const fs = require('fs');
const path = require('path');

const dir = 'apps/web/src/app/dashboard/emailing';
function walk(d) {
  const items = fs.readdirSync(d);
  items.forEach(item => {
    const full = path.join(d, item);
    if (fs.statSync(full).isDirectory()) return walk(full);
    if (!full.endsWith('.tsx') && !full.endsWith('.ts')) return;
    const content = fs.readFileSync(full, 'utf-8');
    if (content.includes('Object.assign')) {
      console.log('FOUND in:', full);
    }
  });
}
walk(dir);
console.log('Scan complete');
