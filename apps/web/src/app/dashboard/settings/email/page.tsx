"use client";
import { useState, useEffect } from "react";
import { Save, AlertCircle, RefreshCw, Mail, Settings, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useOrganization, useSession } from "@/lib/auth-client";

export default function EmailSettings() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  
  const { data: organization, isPending: orgPending } = useOrganization();
  const { data: session } = useSession();
  const activeMember = organization?.members?.find((m: any) => m.userId === session?.user?.id);
  const isAdmin = activeMember?.role === 'admin' || activeMember?.role === 'owner';

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const orgId = localStorage.getItem('cordibase_active_org');
      const res = await fetch('/api/emailing/accounts', {
        headers: { 'x-org-id': orgId || '' }
      });
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
        
        // Find if one is already global
        const globalAcc = data.accounts?.find((a: any) => a.isGlobal);
        if (globalAcc) {
          setSelectedAccountId(globalAcc.id);
        } else if (data.accounts?.length > 0) {
          setSelectedAccountId(data.accounts[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!orgPending && isAdmin) {
      fetchAccounts();
    }
  }, [orgPending, isAdmin]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountId) return;
    
    setSaving(true);
    setMsg("");
    try {
      const orgId = localStorage.getItem('cordibase_active_org');
      const res = await fetch('/api/emailing/accounts/global', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': orgId || ''
        },
        body: JSON.stringify({ accountId: selectedAccountId })
      });
      if (res.ok) {
        setMsg("Default SMTP account updated successfully!");
        fetchAccounts(); // refresh to ensure UI is in sync
      } else {
        setMsg("Failed to update default SMTP account.");
      }
    } catch (err) {
      setMsg("Error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  if (orgPending) {
    return (
      <div className="py-8 flex justify-center text-gray-400">
        <RefreshCw className="animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-2xl bg-white p-8 rounded-xl border border-ink/10 shadow-sm text-center">
        <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={24} />
        </div>
        <h2 className="text-lg font-bold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-500 mb-6">
          You do not have permission to manage the workspace's default SMTP configuration. Only administrators can change this setting.
        </p>
        <Link 
          href="/dashboard/emailing/settings"
          className="inline-flex items-center gap-2 text-sm bg-[#1D2939] text-white px-4 py-2 rounded-lg hover:bg-black transition-colors"
        >
          <Settings className="w-4 h-4" />
          Manage Personal SMTP Accounts
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl bg-white p-6 rounded-xl border border-ink/10 shadow-sm animate-in fade-in">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Default SMTP Configuration</h2>
          <p className="text-sm text-gray-500">
            Select the default SMTP account used for automated system emails (e.g., invites, workflow notifications). 
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-8 flex justify-center text-gray-400">
          <RefreshCw className="animate-spin" />
        </div>
      ) : accounts.length === 0 ? (
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg flex gap-3 text-orange-800">
          <AlertCircle className="shrink-0 w-5 h-5 mt-0.5 text-orange-600" />
          <div>
            <h4 className="font-medium">No SMTP Accounts Found</h4>
            <p className="text-sm mt-1 mb-3 text-orange-700">
              You haven't configured any SMTP accounts in the Emailing module yet. You need at least one to set a default.
            </p>
            <Link 
              href="/dashboard/emailing/settings"
              className="inline-flex items-center gap-2 text-sm bg-orange-600 text-white px-3 py-1.5 rounded hover:bg-orange-700 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Go to Emailing Settings
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Default Account</label>
            <select
              value={selectedAccountId}
              onChange={(e) => setSelectedAccountId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A83C2E] focus:border-transparent bg-white text-gray-900"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.fromEmail}) {acc.isGlobal ? '— Current Default' : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">
              Want to add or edit SMTP credentials? Manage them in the <Link href="/dashboard/emailing/settings" className="text-thread hover:underline">Emailing settings</Link>.
            </p>
          </div>

          {msg && (
            <p className={`text-sm mt-1 ${msg.startsWith("Default") || msg.includes("successfully") ? "text-green-600" : "text-red-500"}`}>
              {msg}
            </p>
          )}

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-thread text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#8B3125] transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? "Saving..." : "Save Default SMTP"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
