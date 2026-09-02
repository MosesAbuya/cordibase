"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useOrganization, useSession } from "@/lib/auth-client";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { data: organization } = useOrganization();
  const { data: session } = useSession();
  const activeMember = organization?.members?.find((m: any) => m.userId === session?.user?.id);
  const role = activeMember?.role || 'member';
  const isAdmin = role === 'admin' || role === 'owner';

  const allTabs = [
    { name: "My Profile", href: "/dashboard/settings/profile", adminOnly: false },
    { name: "Organization", href: "/dashboard/settings/organization", adminOnly: true },
    { name: "Billing & Plans", href: "/dashboard/settings/billing", adminOnly: true },
    { name: "Team & Roles", href: "/dashboard/settings/team", adminOnly: true },
    { name: "Email Config", href: "/dashboard/settings/email", adminOnly: true },
  ];

  const visibleTabs = allTabs.filter(tab => !tab.adminOnly || isAdmin);

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-ink/10">
        <div className="flex space-x-8 px-6 pt-4">
          {visibleTabs.map((tab) => {
            const isActive = pathname === tab.href;
            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`pb-3 text-sm font-medium border-b-2 transition-colors ${isActive ? 'border-thread text-thread' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
              >
                {tab.name}
              </Link>
            );
          })}
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6">{children}</div>
    </div>
  );
}
