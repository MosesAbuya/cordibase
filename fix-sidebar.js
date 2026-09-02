const fs = require('fs');
let content = fs.readFileSync('apps/web/src/app/dashboard/layout.tsx', 'utf-8');

// Add Emailing to the navItems array
if (!content.includes('path: "/dashboard/emailing"')) {
    content = content.replace('{ name: "HRM", path: "/dashboard/hrm", icon: <Briefcase size={18} /> },', '{ name: "HRM", path: "/dashboard/hrm", icon: <Briefcase size={18} /> },\n      { name: "Emailing", path: "/dashboard/emailing", icon: <Mail size={18} /> },');
}

// Ensure Mail icon is imported from lucide-react
if (!content.includes('Mail,')) {
    content = content.replace('Briefcase,', 'Briefcase,\n  Mail,');
}

fs.writeFileSync('apps/web/src/app/dashboard/layout.tsx', content);
console.log('Fixed');
