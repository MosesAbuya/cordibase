"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function CRMLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: "Contacts", href: "/dashboard/crm" },
    { name: "Companies", href: "/dashboard/crm/companies" },
    { name: "Pipeline", href: "/dashboard/crm/pipeline" },
    { name: "Workflows", href: "/dashboard/crm/workflows" },
    { name: "Campaigns", href: "/dashboard/crm/campaigns" },
    { name: "Forms", href: "/dashboard/crm/forms" },
    { name: "Tickets", href: "/dashboard/crm/tickets" },
    { name: "Knowledge Base", href: "/dashboard/crm/kb" },
    { name: "Reports", href: "/dashboard/crm/reports" },
  ];

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center space-x-6 border-b border-ink/10 pb-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.name}
              href={tab.href}
              className={`pb-2 text-sm font-medium transition-colors relative ${
                isActive ? "text-thread" : "text-ink/60 hover:text-ink"
              }`}
            >
              {tab.name}
              {isActive && (
                <div className="absolute left-0 right-0 -bottom-[3px] h-[2px] bg-thread rounded-t-sm" />
              )}
            </Link>
          );
        })}
      </div>
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
