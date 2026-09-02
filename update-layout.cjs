const fs = require('fs');
let content = fs.readFileSync('apps/web/src/app/dashboard/crm/layout.tsx', 'utf8');

if (!content.includes('/dashboard/crm/reports')) {
    content = content.replace(
        `{ name: 'Knowledge Base', href: '/dashboard/crm/kb' },`,
        `{ name: 'Knowledge Base', href: '/dashboard/crm/kb' },\n  { name: 'Reports', href: '/dashboard/crm/reports' },`
    );
    fs.writeFileSync('apps/web/src/app/dashboard/crm/layout.tsx', content);
    console.log('Layout updated with Reports link');
} else {
    console.log('Layout already has Reports link');
}
