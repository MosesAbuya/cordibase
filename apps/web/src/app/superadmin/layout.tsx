"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, LayoutDashboard, Users, Activity, Settings, LogOut, ArrowLeft } from "lucide-react";

export default function SuperadminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/superadmin", icon: LayoutDashboard },
    { name: "Organizations", href: "/superadmin/organizations", icon: BuildingIcon }, // Note: Will define BuildingIcon below or use Users
    { name: "Platform Users", href: "/superadmin/users", icon: Users },
    { name: "Audit Logs", href: "/superadmin/activity", icon: Activity },
    { name: "Platform Config", href: "/superadmin/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-linen font-['Inter'] overflow-hidden selection:bg-thread/20 selection:text-ink">
      {/* Sidebar */}
      <aside className="bg-white flex flex-col shrink-0 border-r border-ink/10 w-[260px] relative">
        {/* Brand */}
        <div className="h-[64px] flex items-center px-6 border-b border-ink/10">
          <Shield className="text-thread" size={24} />
          <span className="text-[20px] font-bold text-ink ml-2">Superadmin</span>
        </div>
        
        {/* Navigation */}
        <div className="py-4 flex-1 overflow-y-auto">
          <div className="text-[11px] uppercase tracking-wider text-ink/60 font-semibold mb-2 px-6 mt-2">God Mode</div>
          <nav className="space-y-1 mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/superadmin' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center mx-3 px-3 py-2 rounded-md transition-colors group ${isActive ? 'bg-thread/10 text-thread' : 'text-[#475467] hover:bg-[#F9FAFB] hover:text-ink'}`}
                >
                  <Icon size={18} className={`mr-3 ${isActive ? 'text-thread' : 'text-ink/60 group-hover:text-[#475467]'}`} />
                  <span className="text-[14px] font-medium">{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-ink/10">
          <Link href="/dashboard" className="flex items-center mx-1 px-3 py-2 rounded-md transition-colors text-[#475467] hover:bg-[#F9FAFB] hover:text-ink group">
            <ArrowLeft size={18} className="mr-3 text-ink/60 group-hover:text-[#475467]" />
            <span className="text-[14px] font-medium">Exit Superadmin</span>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-[64px] bg-white border-b border-ink/10 flex items-center px-6 shrink-0 justify-between sticky top-0 z-10">
          <div className="flex-1"></div>
          <div className="flex items-center gap-4">
             <div className="px-3 py-1 bg-thread/10 text-thread border border-thread/20 text-[11px] font-bold tracking-wider rounded-md">
               PLATFORM COMMAND CENTER
             </div>
          </div>
        </header>
        
        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

// Just an alias to keep icons neat
function BuildingIcon(props: any) {
  return <Activity {...props} />; // We'll replace with actual building or something but I used Activity before
}
