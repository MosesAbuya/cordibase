const fs = require('fs');

let file = 'apps/web/src/app/api/emailing/templates/route.ts';
let content = fs.readFileSync(file, 'utf-8');

content = content.replace(
  'const { name, subject, bodyHtml, aiInstructions } = await req.json();',
  'const { name, subject, bodyHtml, aiInstructions, attachments = [] } = await req.json();'
);

content = content.replace(
  'aiInstructions,',
  'aiInstructions,\n      attachments,'
);

fs.writeFileSync(file, content);
console.log("Updated templates API");
