const fs = require('fs');
let content = fs.readFileSync('apps/web/src/app/dashboard/layout.tsx', 'utf8');

const searchStr = \  const navItems = [
    { name: "Overview", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
    { name: "CRM", path: "/dashboard/crm", icon: <Users size={18} /> },
    { name: "Accounting", path: "/dashboard/accounting", icon: <BookOpen size={18} /> },
    { name: "HRM", path: "/dashboard/hrm", icon: <Briefcase size={18} /> },
    { name: "Emailing", path: "/dashboard/emailing", icon: <Mail size={18} /> },
    { name: "Billing", path: "/dashboard/settings/billing", icon: <CreditCard size={18} /> },
    { name: "Settings", path: "/dashboard/settings/team", icon: <Settings size={18} /> },
  ];\;

const replaceStr = \  const activeMember = organization?.members?.find(m => m.userId === session?.user?.id);
  const activeRole = activeMember?.role || 'member';
  const isAdmin = activeRole === 'admin' || activeRole === 'owner';
  
  // Try to parse modules safely (could be string or array)
  let allowedModules: string[] = [];
  if (activeMember?.modules) {
     try {
         allowedModules = typeof activeMember.modules === 'string' ? JSON.parse(activeMember.modules) : activeMember.modules;
     } catch(e) {
         allowedModules = [];
     }
  } else if (isAdmin) {
     // Admins defaults to all if not set
     allowedModules = ['crm', 'accounting', 'hrm', 'reports', 'emailing'];
  }
  
  const hasModuleAccess = (mod: string) => isAdmin || allowedModules.includes(mod);

  const navItems = [
    { name: "Overview", path: "/dashboard", icon: <LayoutDashboard size={18} /> },
    ...(hasModuleAccess('crm') ? [{ name: "CRM", path: "/dashboard/crm", icon: <Users size={18} /> }] : []),
    ...(hasModuleAccess('accounting') ? [{ name: "Accounting", path: "/dashboard/accounting", icon: <BookOpen size={18} /> }] : []),
    ...(hasModuleAccess('hrm') ? [{ name: "HRM", path: "/dashboard/hrm", icon: <Briefcase size={18} /> }] : []),
    ...(hasModuleAccess('emailing') || isAdmin ? [{ name: "Emailing", path: "/dashboard/emailing", icon: <Mail size={18} /> }] : []),
    ...(isAdmin ? [{ name: "Billing", path: "/dashboard/settings/billing", icon: <CreditCard size={18} /> }] : []),
    ...(isAdmin ? [{ name: "Settings", path: "/dashboard/settings/team", icon: <Settings size={18} /> }] : []),
  ];\;

fs.writeFileSync('apps/web/src/app/dashboard/layout.tsx', content.replace(searchStr, replaceStr));
