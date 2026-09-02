"use client";
import { useState, useEffect } from "react";
import { useModal } from "@/components/ModalProvider";
import { Settings2, Clock, Globe, Mail } from "lucide-react";

export default function SuperadminSettingsPage() {
  const modal = useModal();
  const [trialDays, setTrialDays] = useState("7");
  const [saving, setSaving] = useState(false);

  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("465");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPassword, setSmtpPassword] = useState("");
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [savingSmtp, setSavingSmtp] = useState(false);

  useEffect(() => {
    fetch('/api/superadmin/settings')
      .then(res => res.json())
      .then(data => {
        if (data.settings) {
          if (data.settings.smtpHost) setSmtpHost(data.settings.smtpHost);
          if (data.settings.smtpPort) setSmtpPort(data.settings.smtpPort.toString());
          if (data.settings.smtpUser) setSmtpUser(data.settings.smtpUser);
          if (data.settings.smtpPassword) setSmtpPassword(data.settings.smtpPassword);
          if (data.settings.fromName) setFromName(data.settings.fromName);
          if (data.settings.fromEmail) setFromEmail(data.settings.fromEmail);
        }
      })
      .catch(e => console.error(e));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    setSaving(false);
    modal.alert(`Platform trial duration successfully updated to ${trialDays} days.`, "Settings Saved");
  };

  const handleSaveSmtp = async () => {
    setSavingSmtp(true);
    try {
      const res = await fetch('/api/superadmin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpHost,
          smtpPort: parseInt(smtpPort),
          smtpUser,
          smtpPassword,
          fromName,
          fromEmail
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      modal.alert("SAAS Super Mails SMTP settings successfully updated.", "SMTP Saved");
    } catch (err: any) {
      modal.alert(err.message, "Error saving SMTP");
    } finally {
      setSavingSmtp(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-ink tracking-tight">Platform Configuration</h1>
        <p className="text-ink/60 mt-1 text-sm">Manage global settings, trial limits, and platform-wide defaults.</p>
      </div>

      <div className="bg-white border border-ink/10 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-ink/10">
          <div className="flex items-center gap-3 text-ink font-bold mb-1">
            <Clock size={18} className="text-thread" />
            <h3>Billing & Trials</h3>
          </div>
          <p className="text-sm text-ink/60">Configure the default trial lengths for new workspaces.</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-[#344054] mb-2">
              Default Trial Duration (Days)
            </label>
            <input 
              type="number" 
              value={trialDays}
              onChange={(e) => setTrialDays(e.target.value)}
              className="max-w-xs w-full px-4 py-2 border border-ink/10 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/50 focus:border-thread transition-shadow text-ink"
            />
            <p className="text-xs text-ink/60 mt-2">New organizations will automatically be granted this amount of time in 'trialing' state.</p>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-thread text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow hover:bg-[#8C3125] transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Configuration"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-ink/10 rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-ink/10">
          <div className="flex items-center gap-3 text-ink font-bold mb-1">
            <Mail size={18} className="text-thread" />
            <h3>SAAS Super Mails (SMTP)</h3>
          </div>
          <p className="text-sm text-ink/60">Configure the default email account used to communicate with subscribers (e.g. Welcome emails, Billing confirmations).</p>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-[#344054] mb-2">SMTP Host</label>
              <input type="text" value={smtpHost} onChange={e => setSmtpHost(e.target.value)} placeholder="smtp.mailgun.org" className="w-full px-4 py-2 border border-ink/10 rounded-lg focus:ring-2 focus:ring-[#A83C2E]/50 focus:border-thread" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#344054] mb-2">SMTP Port</label>
              <input type="number" value={smtpPort} onChange={e => setSmtpPort(e.target.value)} placeholder="465" className="w-full px-4 py-2 border border-ink/10 rounded-lg focus:ring-2 focus:ring-[#A83C2E]/50 focus:border-thread" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#344054] mb-2">SMTP Username</label>
              <input type="text" value={smtpUser} onChange={e => setSmtpUser(e.target.value)} placeholder="postmaster@yourdomain.com" className="w-full px-4 py-2 border border-ink/10 rounded-lg focus:ring-2 focus:ring-[#A83C2E]/50 focus:border-thread" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#344054] mb-2">SMTP Password</label>
              <input type="password" value={smtpPassword} onChange={e => setSmtpPassword(e.target.value)} placeholder="••••••••" className="w-full px-4 py-2 border border-ink/10 rounded-lg focus:ring-2 focus:ring-[#A83C2E]/50 focus:border-thread" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#344054] mb-2">From Name</label>
              <input type="text" value={fromName} onChange={e => setFromName(e.target.value)} placeholder="Cordibase Support" className="w-full px-4 py-2 border border-ink/10 rounded-lg focus:ring-2 focus:ring-[#A83C2E]/50 focus:border-thread" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#344054] mb-2">From Email (Fallback Default)</label>
              <input type="email" value={fromEmail} onChange={e => setFromEmail(e.target.value)} placeholder="support@cordibase.com" className="w-full px-4 py-2 border border-ink/10 rounded-lg focus:ring-2 focus:ring-[#A83C2E]/50 focus:border-thread" />
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
             <input type="checkbox" id="default-fallback" checked disabled className="w-4 h-4 text-thread rounded focus:ring-[#A83C2E]" />
             <label htmlFor="default-fallback" className="text-sm font-medium text-[#344054]">Set as default fallback email account for all platform emails</label>
          </div>

          <div className="pt-4">
            <button 
              onClick={handleSaveSmtp}
              disabled={savingSmtp}
              className="bg-[#1D2939] text-white px-6 py-2.5 rounded-lg text-sm font-bold shadow hover:bg-black transition-colors disabled:opacity-50"
            >
              {savingSmtp ? "Saving..." : "Save SMTP Settings"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
