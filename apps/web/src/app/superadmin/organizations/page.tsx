"use client";
import { useEffect, useState } from "react";
import { ShieldAlert, LogIn, Search, MoreVertical } from "lucide-react";
import { useModal } from "@/components/ModalProvider";

export default function SuperadminOrganizations() {
  const [orgs, setOrgs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [impersonating, setImpersonating] = useState<string | null>(null);
  const modal = useModal();

  useEffect(() => {
    fetchOrgs();
  }, []);

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/superadmin/organizations');
      if (res.ok) {
        const data = await res.json();
        setOrgs(data.organizations);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleImpersonate = async (orgId: string, orgName: string) => {
    const confirm = await modal.confirm(
      `Are you sure you want to impersonate ${orgName}? Every action will be logged in the audit trail.`,
      "Confirm Impersonation"
    );
    if (!confirm) return;

    setImpersonating(orgId);
    try {
      const res = await fetch('/api/superadmin/impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgId, reason: "Support Request" })
      });
      
      if (res.ok) {
        // Set the local storage item to hijack the UI's active org
        localStorage.setItem('cordibase_active_org', orgId);
        window.location.href = '/dashboard';
      } else {
        const error = await res.json();
        modal.alert(error.message || "Failed to initiate impersonation", "Error");
        setImpersonating(null);
      }
    } catch (e) {
      modal.alert("Network error", "Error");
      setImpersonating(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Organizations</h2>
          <p className="text-slate-500 text-sm mt-1">Manage all tenant workspaces and subscriptions on the platform.</p>
        </div>
        
        <div className="relative w-72">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name or slug..." 
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
              <th className="px-6 py-4">Workspace</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Trial Ends</th>
              <th className="px-6 py-4">Members</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-12 text-sm text-slate-400">Loading...</td></tr>
            ) : orgs.map(org => (
              <tr key={org.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-slate-900">{org.name}</div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">{org.slug}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700 capitalize">
                    {org.type}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    org.onboardingStatus === 'active' ? 'bg-emerald-100 text-emerald-700' :
                    org.onboardingStatus === 'trialing' ? 'bg-blue-100 text-blue-700' :
                    org.onboardingStatus === 'past_due' ? 'bg-red-100 text-red-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {org.onboardingStatus.replace('_', ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {org.trialEndsAt ? new Date(org.trialEndsAt).toLocaleDateString() : 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {org.members?.length || 1}
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => handleImpersonate(org.id, org.name)}
                    disabled={impersonating === org.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    <LogIn size={14} />
                    {impersonating === org.id ? 'Connecting...' : 'Impersonate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
