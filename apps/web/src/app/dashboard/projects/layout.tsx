"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Folder, Calendar, Users, MessageSquare, Copy } from "lucide-react";

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const navigation = [
    { name: "Projects", href: "/dashboard/projects", icon: Folder, exact: true },
    { name: "Team Calendar", href: "/dashboard/projects/calendar", icon: Calendar },
    { name: "Resource Planning", href: "/dashboard/projects/resources", icon: Users },
    { name: "Standups", href: "/dashboard/projects/standups", icon: MessageSquare },
    { name: "Templates", href: "/dashboard/projects/templates", icon: Copy },
  ];

  return (
    <div className="flex h-full bg-linen dark:bg-ink">
      {/* Secondary Sidebar */}
      <div className="w-64 border-r border-ink/10 dark:border-white/10 bg-white dark:bg-ink flex flex-col hidden md:flex">
        <div className="p-4 border-b border-ink/10 dark:border-white/10">
          <h2 className="text-[16px] font-semibold text-ink dark:text-white">Projects Hub</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {navigation.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-3 py-2 text-[14px] font-medium rounded-md transition-colors ${
                  isActive
                    ? "bg-thread/10 text-thread dark:bg-thread/20" 
                    : "text-[#475467] hover:bg-[#F9FAFB] dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <item.icon size={18} className={`mr-3 ${isActive ? "text-thread" : "text-[#98A2B3]"}`} />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
