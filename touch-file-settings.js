const fs = require('fs');

let file = 'apps/web/src/app/api/emailing/settings/route.ts';
let content = fs.readFileSync(file, 'utf-8');

// Just touching the file to trigger a clean Turbopack rebuild
fs.writeFileSync(file, content.trim() + "\n// rebuild 2\n");

console.log("Forced rebuild of route.ts");
