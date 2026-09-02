"use client";
import { useState, useEffect } from "react";
import { Plus, BarChart3, PieChart, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ReportsHub() {
  const [dashboards, setDashboards] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    // In a real app we'd fetch saved dashboards here
    // For now we mock the initial state
    setDashboards([
      { id: '1', name: 'Sales Pipeline Health' },
      { id: '2', name: 'Support Ticket Volume' }
    ]);
  }, []);

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-ink">Reporting & Analytics</h2>
          <p className="text-sm text-gray-500">Generic object graph queries and visualizations.</p>
        </div>
        <button 
          onClick={() => router.push('/dashboard/crm/reports/builder')}
          className="flex items-center gap-2 bg-thread text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#8B3125] transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Report Builder
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        {dashboards.map((d: any) => (
          <div key={d.id} className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-gray-50 rounded-lg text-gray-500">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-medium text-gray-900">{d.name}</h3>
            </div>
            <p className="text-sm text-gray-500">Custom dashboard layout</p>
          </div>
        ))}
      </div>
    </div>
  );
}
