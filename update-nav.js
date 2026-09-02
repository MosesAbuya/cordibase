const fs = require('fs');
let content = fs.readFileSync('apps/web/src/app/dashboard/layout.tsx', 'utf8');

if (!content.includes('path: "/dashboard/settings"')) {
    content = content.replace('{ name: "Billing", path: "/dashboard/billing", icon: <CreditCard size={18} /> },', '{ name: "Billing", path: "/dashboard/billing", icon: <CreditCard size={18} /> },\n    { name: "Settings", path: "/dashboard/settings/team", icon: <Settings size={18} /> },');
    
    // add Settings to lucide-react import
    if (!content.includes('Settings')) {
        content = content.replace('LayoutDashboard, Users, BookOpen, Briefcase, CreditCard,', 'LayoutDashboard, Users, BookOpen, Briefcase, CreditCard, Settings,');
    }
    fs.writeFileSync('apps/web/src/app/dashboard/layout.tsx', content);
    console.log('Updated global nav with Settings');
}
