"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";
import { useModal } from "@/components/ModalProvider";

export default function AccountingSettings() {
  const modal = useModal();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [form, setForm] = useState({
    currency: "KES",
    vatRate: 16,
    vatEnabled: true
  });

  const currencies = ["KES", "USD", "EUR", "GBP", "UGX", "TZS", "ZAR", "NGN"];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/crm/accounting/settings");
      if (res.ok) {
        const data = await res.json();
        setForm({
          currency: data.currency || "KES",
          vatRate: Number(data.vatRate) || 16,
          vatEnabled: data.vatEnabled
        });
      }
    } catch (e) {
    } finally {
      setFetching(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/crm/accounting/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) throw new Error("Failed to save settings");
      modal.alert("Success", "Accounting settings saved successfully.");
    } catch (e: any) {
      modal.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-12 text-center text-ink/60">Loading settings...</div>;

  return (
    <div className="flex-1 overflow-y-auto bg-[#F9FAFB] dark:bg-ink p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-[24px] font-bold text-ink dark:text-white">Accounting Settings</h1>
          <p className="text-[14px] text-ink/60 mt-1">Configure your default currency and tax rates.</p>
        </div>

        <form onSubmit={handleSave} className="space-y-6 bg-white dark:bg-ink p-6 rounded-[12px] border border-ink/10 dark:border-white/10 shadow-sm">
          
          <div className="space-y-1.5">
            <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">Default Currency</label>
            <select 
              value={form.currency} 
              onChange={e => setForm({...form, currency: e.target.value})} 
              className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread"
            >
              {currencies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <p className="text-[12px] text-ink/60">This currency will be used for all new documents and transactions.</p>
          </div>

          <div className="pt-4 border-t border-ink/10 dark:border-white/10 space-y-4">
            <label className="flex items-center text-[14px] font-medium text-[#344054] dark:text-slate-300 cursor-pointer">
              <input 
                type="checkbox" 
                checked={form.vatEnabled} 
                onChange={e => setForm({...form, vatEnabled: e.target.checked})} 
                className="mr-3 rounded text-thread focus:ring-[#A83C2E]" 
              />
              Enable VAT (Value Added Tax) on Documents
            </label>

            {form.vatEnabled && (
              <div className="space-y-1.5 pl-7">
                <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">Default VAT Rate (%)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  max="100" 
                  value={form.vatRate} 
                  onChange={e => setForm({...form, vatRate: Number(e.target.value)})} 
                  className="w-full max-w-[150px] px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread" 
                />
              </div>
            )}
          </div>

          <div className="pt-6">
            <button disabled={loading} type="submit" className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-[8px] shadow-sm text-[14px] font-medium text-white bg-thread hover:bg-[#8B3125] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A83C2E] disabled:opacity-50 transition-colors">
              <Save size={18} className="mr-2" /> {loading ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
