const fs = require('fs');
['apps/web/src/app/dashboard/emailing/bulk/page.tsx', 'apps/web/src/app/dashboard/emailing/compose/page.tsx'].forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    content = content.replace(/\\\`\\\$\{current\} \\\$\{newEmails\}\\\`/g, '`${current} ${newEmails}`');
    content = content.replace(/\\\`\\\$\{current\}, \\\$\{newEmails\}\\\`/g, '`${current}, ${newEmails}`');
    // Also catch if it only escaped backticks but not dollars
    content = content.replace(/\\\`\$\{current\} \$\{newEmails\}\\\`/g, '`${current} ${newEmails}`');
    content = content.replace(/\\\`\$\{current\}, \$\{newEmails\}\\\`/g, '`${current}, ${newEmails}`');
    fs.writeFileSync(file, content);
  }
});
console.log('Fixed backslashes');
