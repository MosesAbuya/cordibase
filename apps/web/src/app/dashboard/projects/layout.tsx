"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Folder, Calendar, Users, MessageSquare, Copy } from "lucide-react";

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const navigation = [
    { name: "Projects", href: "/dashboard/projects", icon: Folder },
    { name: "Team Calendar", href: "/dashboard/projects/calendar", icon: Calendar },
    { name: "Resource Planning", href: "/dashboard/projects/resources", icon: Users },
    { name: "Standups", href: "/dashboard/projects/standups", icon: MessageSquare },
    { name: "Templates", href: "/dashboard/projects/templates", icon: Copy },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-8 min-h-[calc(100vh-120px)]">
      {/* Secondary Sidebar */}
      <aside className="w-full md:w-64 shrink-0">
        <h2 className="text-xl font-bold mb-6">Projects Hub</h2>
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard/projects" && pathname.startsWith(item.href)) || (item.href === "/dashboard/projects" && pathname.startsWith("/dashboard/projects/") && !["calendar", "resources", "standups", "templates"].some(p => pathname.includes(p)));
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? "bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-medium"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                }`}
              >
                <item.icon size={18} className={isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}
