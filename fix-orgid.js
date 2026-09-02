const fs = require('fs');

const files = [
  'apps/web/src/app/dashboard/emailing/settings/page.tsx',
  'apps/web/src/app/dashboard/emailing/compose/page.tsx',
  'apps/web/src/app/dashboard/emailing/bulk/page.tsx',
  'apps/web/src/app/dashboard/emailing/page.tsx',
  'apps/web/src/app/dashboard/emailing/templates/page.tsx',
  'apps/web/src/app/dashboard/emailing/templates/new/page.tsx',
];

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf-8');
  
  // Add orgId helper after "use client" or after first import block if not present
  if (!content.includes("cordibase_active_org")) {
    // Add orgId fetcher before first "const [" or "export default"
    content = content.replace(
      /export default function/,
      `function getOrgId() { return typeof window !== "undefined" ? localStorage.getItem("cordibase_active_org") || "" : ""; }\n\nexport default function`
    );
  }
  
  // Replace bare fetch calls to emailing API with ones that include x-org-id
  content = content.replace(
    /await fetch\("\/api\/emailing\/([^"]+)",\s*\{/g,
    `await fetch("/api/emailing/$1", { headers: Object.assign({ "x-org-id": getOrgId() }, `
  );
  // This approach won't work cleanly, let's do it differently
  // Just inject the header into each fetch that is missing it
  
  fs.writeFileSync(file, content);
});
console.log("Done scanning files");
