const fs = require('fs');

// Fix emailing dashboard page - add x-org-id to logs fetch
let file = 'apps/web/src/app/dashboard/emailing/page.tsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf-8');
  // Add getOrgId if not already there cleanly
  if (!content.includes('function getOrgId')) {
    content = content.replace('"use client";', '"use client";\n\nfunction getOrgId() { return typeof window !== "undefined" ? localStorage.getItem("cordibase_active_org") || "" : ""; }');
  }
  // Fix logs fetch
  content = content.replace(
    'await fetch("/api/emailing/logs")',
    'await fetch("/api/emailing/logs", { headers: { "x-org-id": getOrgId() } })'
  );
  fs.writeFileSync(file, content);
}

// Fix compose page - add x-org-id to accounts fetch
file = 'apps/web/src/app/dashboard/emailing/compose/page.tsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf-8');
  if (!content.includes('function getOrgId')) {
    content = content.replace('"use client";', '"use client";\n\nfunction getOrgId() { return typeof window !== "undefined" ? localStorage.getItem("cordibase_active_org") || "" : ""; }');
  }
  content = content.replace(
    'await fetch("/api/emailing/accounts")',
    'await fetch("/api/emailing/accounts", { headers: { "x-org-id": getOrgId() } })'
  );
  content = content.replace(
    'await fetch("/api/emailing/send",',
    'await fetch("/api/emailing/send", '
  );
  fs.writeFileSync(file, content);
}

// Fix bulk page
file = 'apps/web/src/app/dashboard/emailing/bulk/page.tsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf-8');
  if (!content.includes('function getOrgId')) {
    content = content.replace('"use client";', '"use client";\n\nfunction getOrgId() { return typeof window !== "undefined" ? localStorage.getItem("cordibase_active_org") || "" : ""; }');
  }
  content = content.replace(
    'await fetch("/api/emailing/accounts")',
    'await fetch("/api/emailing/accounts", { headers: { "x-org-id": getOrgId() } })'
  );
  content = content.replace(
    'await fetch("/api/emailing/templates")',
    'await fetch("/api/emailing/templates", { headers: { "x-org-id": getOrgId() } })'
  );
  fs.writeFileSync(file, content);
}

// Fix templates page
file = 'apps/web/src/app/dashboard/emailing/templates/page.tsx';
if (fs.existsSync(file)) {
  let content = fs.readFileSync(file, 'utf-8');
  if (!content.includes('function getOrgId')) {
    content = content.replace('"use client";', '"use client";\n\nfunction getOrgId() { return typeof window !== "undefined" ? localStorage.getItem("cordibase_active_org") || "" : ""; }');
  }
  content = content.replace(
    'await fetch("/api/emailing/templates")',
    'await fetch("/api/emailing/templates", { headers: { "x-org-id": getOrgId() } })'
  );
  fs.writeFileSync(file, content);
}

console.log('All pages updated with org ID headers');
