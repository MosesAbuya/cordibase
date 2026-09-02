const fs = require('fs');

let file = 'apps/web/src/app/api/emailing/templates/route.ts';
let content = fs.readFileSync(file, 'utf-8');

// Just touching the file to trigger a clean Turbopack rebuild
fs.writeFileSync(file, content + "\n// rebuild");

console.log("Forced rebuild of route.ts");
