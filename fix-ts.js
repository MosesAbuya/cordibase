const fs = require('fs');
let file = fs.readFileSync('apps/service-crm/src/index.ts', 'utf8');

file = file.replace(/const { id } = request\.params;/g, 'const { id } = request.params as any;');
file = file.replace(/const body = request\.body;/g, 'const body = request.body as any;');

fs.writeFileSync('apps/service-crm/src/index.ts', file);
console.log('fixed TS errors');
