"use client";
import { useEffect, useState } from "react";
import { Users, Building2, TrendingUp, AlertTriangle } from "lucide-react";

export default function SuperadminOverviewPage() {
  const [stats, setStats] = useState({
    users: 0,
    organizations: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We can fetch quick stats from our existing APIs
    const loadStats = async () => {
      try {
        const [orgRes, userRes] = await Promise.all([
          fetch('/api/superadmin/organizations'),
          fetch('/api/superadmin/users')
        ]);
        
        const orgData = await orgRes.json();
        const userData = await userRes.json();
        
        setStats({
          organizations: orgData.organizations?.length || 0,
          users: userData.users?.length || 0
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink tracking-tight">Platform Overview</h1>
        <p className="text-ink/60 mt-1 text-sm">A high-level view of Cordibase metrics and health.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-ink/60">Total Organizations</h3>
            <div className="p-2 bg-linen rounded-md text-ink">
              <Building2 size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-ink">{loading ? '-' : stats.organizations}</p>
        </div>

        <div className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-ink/60">Total Users</h3>
            <div className="p-2 bg-linen rounded-md text-ink">
              <Users size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-ink">{loading ? '-' : stats.users}</p>
        </div>
        
        <div className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm opacity-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-ink/60">Active Subscriptions</h3>
            <div className="p-2 bg-linen rounded-md text-ink">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-ink">Coming Soon</p>
        </div>

        <div className="bg-white border border-ink/10 rounded-xl p-6 shadow-sm opacity-50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-ink/60">System Alerts</h3>
            <div className="p-2 bg-red-50 rounded-md text-red-600">
              <AlertTriangle size={18} />
            </div>
          </div>
          <p className="text-3xl font-bold text-ink">0</p>
        </div>
      </div>
    </div>
  );
}
