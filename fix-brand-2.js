const fs = require('fs');

function updateTemplate(content) {
  content = content.replace('.logo-box { width: 20mm; height: 20mm; flex-shrink: 0; }', '.logo-box { width: 26mm; height: 26mm; flex-shrink: 0; margin-left: -4mm; }');
  
  if (content.includes('.brand-text p { margin: 0; }')) {
    // already has it, ignore
  } else {
    content = content.replace('.brand-text .company-name {', '.brand-text p { margin: 0; }\n  .brand-text .company-name {');
  }

  content = content.replace('.brand-text .company-name { font-size: 15pt; font-weight: 700; color: #1a1a1a; margin: 0 0 1mm 0; }', '.brand-text .company-name { font-size: 15pt; font-weight: 700; color: #1a1a1a; margin-bottom: 0.5mm; }');
  content = content.replace('.brand-text .tagline { font-size: 9pt; color: #444; line-height: 1.3; max-width: 60mm; }', '.brand-text .tagline { font-size: 10.5pt; color: #444; line-height: 1.2; max-width: 38mm; }');
  
  return content;
}

let crm = fs.readFileSync('apps/service-crm/src/accounting.ts', 'utf-8');
crm = updateTemplate(crm);
fs.writeFileSync('apps/service-crm/src/accounting.ts', crm);

let web = fs.readFileSync('apps/web/src/app/dashboard/accounting/branding/page.tsx', 'utf-8');
web = updateTemplate(web);
fs.writeFileSync('apps/web/src/app/dashboard/accounting/branding/page.tsx', web);

console.log('Fixed');
