const fs = require('fs');
const files = [
  'src/app/dashboard/accounting/documents/[id]/page.tsx',
  'src/app/dashboard/accounting/layout.tsx',
  'src/app/dashboard/crm/campaigns/[id]/page.tsx',
  'src/app/dashboard/crm/companies/[id]/page.tsx',
  'src/app/dashboard/crm/contacts/[id]/page.tsx',
  'src/app/dashboard/crm/deals/[id]/page.tsx',
  'src/app/dashboard/crm/forms/[id]/page.tsx',
  'src/app/dashboard/crm/kb/[id]/page.tsx',
  'src/app/dashboard/crm/tickets/[id]/page.tsx',
  'src/app/dashboard/crm/workflows/[id]/page.tsx',
  'src/app/dashboard/emailing/layout.tsx',
  'src/app/dashboard/layout.tsx',
  'src/app/superadmin/layout.tsx',
  'src/components/marketing/Dock.tsx'
];

for (const f of files) {
  const p = 'apps/web/' + f;
  if (fs.existsSync(p)) {
    let c = fs.readFileSync(p, 'utf8');
    c = c.replace(/params\.id/g, '(params?.id || "")');
    c = c.replace(/pathname\.startsWith/g, '(pathname || "").startsWith');
    c = c.replace(/pathname ===/g, '(pathname || "") ===');
    c = c.replace(/pathname\.includes/g, '(pathname || "").includes');
    // Also fix the export default function DocumentPreviewPage({ params }: { params: { id: string } })
    c = c.replace(/export default function DocumentPreviewPage\(\{ params \}: \{ params: \{ id: string \} \}\)/g, 'export default function DocumentPreviewPage({ params }: any)');
    fs.writeFileSync(p, c);
  }
}
