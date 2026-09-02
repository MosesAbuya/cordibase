"use client";

import { useOrganization } from "@/lib/auth-client";
import { ArrowUpRight, ArrowDownRight, DollarSign, Briefcase, Percent, Users, ChevronDown, MoreVertical, Plus } from "lucide-react";
import { useEffect, useState } from "react";

export default function DashboardOverview() {
  const { data: activeOrg } = useOrganization();
  const [data, setData] = useState({
    revenue: 0,
    activeDeals: 0,
    conversionRate: "0.0",
    totalContacts: 0
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const orgId = localStorage.getItem("cordibase_active_org");
        const res = await fetch("/api/crm/dashboard/summary", {
          headers: { "x-org-id": orgId || "" },
          credentials: "include"
        });
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error(e);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="w-full">
      {/* Top Controls Row */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-ink dark:text-white mb-1">Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          {/* Avatar Pile & Add Button */}
          <div className="flex items-center -space-x-2 mr-2">
            <img src="https://ui-avatars.com/api/?name=JS&background=F79009&color=fff" className="w-8 h-8 rounded-full border-2 border-[#F4F6FA] dark:border-[#0B1120] z-10" alt="Avatar" />
            <img src="https://ui-avatars.com/api/?name=MW&background=5B5FF0&color=fff" className="w-8 h-8 rounded-full border-2 border-[#F4F6FA] dark:border-[#0B1120] z-20" alt="Avatar" />
            <button className="w-8 h-8 rounded-full bg-[#F04438] text-white flex items-center justify-center border-2 border-[#F4F6FA] dark:border-[#0B1120] z-40 hover:bg-[#D92D20] transition-colors focus:outline-none focus:ring-2 focus:ring-[#A83C2E] focus:ring-offset-2">
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* KPI 1 */}
        <div className="bg-white dark:bg-ink rounded-[12px] p-5 border border-ink/10 dark:border-white/10 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[13px] font-medium text-ink/60 mb-1">Revenue</p>
              <h3 className="text-[24px] font-bold text-ink dark:text-white tabular-nums tracking-tight">
                ${Number(data.revenue).toLocaleString()}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-[8px] bg-[#F04438]/10 text-[#F04438] flex items-center justify-center">
              <DollarSign size={20} />
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-ink rounded-[12px] p-5 border border-ink/10 dark:border-white/10 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[13px] font-medium text-ink/60 mb-1">Active Deals</p>
              <h3 className="text-[24px] font-bold text-ink dark:text-white tabular-nums tracking-tight">
                {data.activeDeals}
              </h3>
            </div>
            <div className="w-10 h-10 rounded-[8px] bg-thread/10 text-thread flex items-center justify-center">
              <Briefcase size={20} />
            </div>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-ink rounded-[12px] p-5 border border-ink/10 dark:border-white/10 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[13px] font-medium text-ink/60 mb-1">Conversion Rate</p>
              <h3 className="text-[24px] font-bold text-ink dark:text-white tabular-nums tracking-tight">
                {data.conversionRate}%
              </h3>
            </div>
            <div className="w-10 h-10 rounded-[8px] bg-[#F79009]/10 text-[#F79009] flex items-center justify-center">
              <Percent size={20} />
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-white dark:bg-ink rounded-[12px] p-5 border border-ink/10 dark:border-white/10 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[13px] font-medium text-ink/60 mb-1">Total Contacts</p>
              <h3 className="text-[24px] font-bold text-ink dark:text-white tabular-nums tracking-tight">
                {data.totalContacts}
              </h3>
            </div>
            <div className="w-10 h-10 flex items-center justify-center text-ink dark:text-white bg-[#EAECF0] dark:bg-slate-800 rounded-[8px]">
               <Users size={20} />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
