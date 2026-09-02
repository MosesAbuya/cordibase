"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, TrendingUp, BarChart3, Palette, Settings } from "lucide-react";

export default function AccountingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { label: "Documents", href: "/dashboard/accounting", icon: FileText, exact: true },
    { label: "Financial Tracker", href: "/dashboard/accounting/tracker", icon: TrendingUp },
    { label: "Reports", href: "/dashboard/accounting/reports", icon: BarChart3 },
    { label: "Branding", href: "/dashboard/accounting/branding", icon: Palette },
    { label: "Settings", href: "/dashboard/accounting/settings", icon: Settings },
  ];

  return (
    <div className="flex h-full bg-linen dark:bg-ink">
      {/* Sidebar */}
      <div className="w-64 border-r border-ink/10 dark:border-white/10 bg-white dark:bg-ink flex flex-col hidden md:flex">
        <div className="p-4 border-b border-ink/10 dark:border-white/10">
          <h2 className="text-[16px] font-semibold text-ink dark:text-white">Accounting</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2 text-[14px] font-medium rounded-md transition-colors ${
                  isActive 
                    ? "bg-thread/10 text-thread dark:bg-thread/20" 
                    : "text-[#475467] hover:bg-[#F9FAFB] dark:text-slate-300 dark:hover:bg-slate-800"
                }`}
              >
                <Icon size={18} className={`mr-3 ${isActive ? "text-thread" : "text-[#98A2B3]"}`} />
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {children}
      </div>
    </div>
  );
}
