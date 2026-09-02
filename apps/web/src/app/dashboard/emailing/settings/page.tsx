"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Trash2, Mail, Save, Pencil, X, PlusCircle, Eye, EyeOff, Send, CheckCircle2, AlertCircle, Loader2, Settings } from "lucide-react";
import { useModal } from "@/components/ModalProvider";
import "react-quill-new/dist/quill.snow.css";
import { useOrganization, useSession } from "@/lib/auth-client";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

function getOrgId() {
  return typeof window !== "undefined" ? localStorage.getItem("cordibase_active_org") || "" : "";
}

const EMPTY_FORM = {
  name: "",
  fromName: "",
  fromEmail: "",
  smtpHost: "",
  smtpPort: "465",
  smtpUser: "",
  smtpPassword: "",
  signatureHtml: "",
  assignedUserIds: [] as string[],
};

type TestStatus = { type: "idle" } | { type: "loading" } | { type: "success"; message: string } | { type: "error"; message: string };

export default function EmailingSettings() {
  const modal = useModal();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { data: organization } = useOrganization();
  const { data: session } = useSession();
  const activeMember = organization?.members?.find((m: any) => m.userId === session?.user?.id);
  const isAdmin = activeMember?.role === 'admin' || activeMember?.role === 'owner';

  // Global Settings
  const [globalSignature, setGlobalSignature] = useState("");
  const [savingGlobal, setSavingGlobal] = useState(false);

  // Test SMTP state
  const [testAccountId, setTestAccountId] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [testStatus, setTestStatus] = useState<TestStatus>({ type: "idle" });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [accRes, setRes] = await Promise.all([
        fetch("/api/emailing/accounts", { headers: { "x-org-id": getOrgId() } }),
        fetch("/api/emailing/settings", { headers: { "x-org-id": getOrgId() } })
      ]);
      
      if (accRes.ok) {
        const data = await accRes.json();
        setAccounts(data.accounts || []);
        if (data.accounts?.length > 0 && !testAccountId) {
          setTestAccountId(data.accounts[0].id);
        }
      }
      
      if (setRes.ok) {
        const data = await setRes.json();
        if (data.settings) {
          setGlobalSignature(data.settings.defaultSignatureHtml || "");
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUserToggle = (userId: string) => {
    const current = formData.assignedUserIds || [];
    if (current.includes(userId)) {
      setFormData({ ...formData, assignedUserIds: current.filter(id => id !== userId) });
    } else {
      setFormData({ ...formData, assignedUserIds: [...current, userId] });
    }
  };

  const openNewForm = () => {
    setEditingId(null);
    setFormData({ ...EMPTY_FORM });
    setShowPassword(false);
    setShowForm(true);
  };

  const openEditForm = (acc: any) => {
    setEditingId(acc.id);
    setFormData({
      name: acc.name,
      fromName: acc.fromName,
      fromEmail: acc.fromEmail,
      smtpHost: acc.smtpHost,
      smtpPort: String(acc.smtpPort),
      smtpUser: acc.smtpUser,
      smtpPassword: "",
      signatureHtml: acc.signatureHtml || "",
      assignedUserIds: acc.assignedUserIds || [],
    });
    setShowPassword(false);
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const orgId = getOrgId();
      const method = editingId ? "PUT" : "POST";
      const url = editingId ? `/api/emailing/accounts/${editingId}` : "/api/emailing/accounts";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "x-org-id": orgId },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setShowForm(false);
        fetchData();
      } else {
        modal.alert("Failed to save account.");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!await modal.confirm("Are you sure you want to delete this account?", `"${name}" will be permanently removed.`)) return;
    try {
      const res = await fetch(`/api/emailing/accounts/${id}`, {
        method: "DELETE",
        headers: { "x-org-id": getOrgId() },
      });
      if (res.ok) fetchData();
    } catch (e) {}
  };

  const handleSaveGlobal = async () => {
    setSavingGlobal(true);
    try {
      const res = await fetch("/api/emailing/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-org-id": getOrgId() },
        body: JSON.stringify({ defaultSignatureHtml: globalSignature }),
      });
      if (res.ok) {
        modal.alert("Global Settings Saved");
      }
    } catch (e) {
    } finally {
      setSavingGlobal(false);
    }
  };

  const handleTestSmtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testAccountId || !testEmail) return;
    
    setTestStatus({ type: "loading" });
    try {
      const res = await fetch("/api/emailing/accounts/test", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-org-id": getOrgId() },
        body: JSON.stringify({ accountId: testAccountId, toEmail: testEmail })
      });
      
      const data = await res.json();
      
      if (res.ok && data.success) {
        setTestStatus({ type: "success", message: "Test email sent successfully! Please check your inbox." });
      } else {
        setTestStatus({ type: "error", message: data.error || "Failed to send test email" });
      }
    } catch (err: any) {
      setTestStatus({ type: "error", message: err.message || "Network error occurred" });
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#F9FAFB] dark:bg-ink">
      {/* Header */}
      <div className="bg-white dark:bg-ink border-b border-ink/10 dark:border-white/10 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sticky top-0 z-10">
        <div>
          <h1 className="text-[20px] font-bold text-ink dark:text-white mb-1">Emailing Settings</h1>
          <p className="text-[14px] text-ink/60">Manage SMTP accounts and global emailing preferences.</p>
        </div>
        <button
          onClick={openNewForm}
          className="flex items-center gap-2 bg-thread text-white px-4 py-2 rounded-[8px] text-[14px] font-medium hover:bg-[#8B3125] transition-colors shadow-sm"
        >
          <PlusCircle size={18} />
          Add SMTP Account
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-8">
        
        {/* Accounts List */}
        <section className="bg-white dark:bg-ink border border-ink/10 dark:border-white/10 rounded-[12px] overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-ink/10 dark:border-white/10 flex justify-between items-center bg-[#F9FAFB] dark:bg-slate-800/50">
            <h2 className="text-[16px] font-bold text-ink dark:text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-ink/60" />
              SMTP Accounts
            </h2>
          </div>
          
          {loading ? (
            <div className="p-12 text-center text-ink/60 flex flex-col items-center">
               <Loader2 className="animate-spin mb-2" size={24} />
               Loading accounts...
            </div>
          ) : accounts.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-linen dark:bg-slate-800 flex items-center justify-center mb-3">
                <Mail className="w-6 h-6 text-[#98A2B3]" />
              </div>
              <p className="text-[15px] font-medium text-ink dark:text-white mb-1">No SMTP Accounts</p>
              <p className="text-[14px] text-ink/60">Add an account to start sending emails.</p>
            </div>
          ) : (
            <div className="divide-y divide-[#EAECF0] dark:divide-slate-800">
              {accounts.map(acc => (
                <div key={acc.id} className="p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-[#F9FAFB] dark:hover:bg-slate-800/20 transition-colors">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-ink dark:text-white">{acc.name}</h3>
                      {acc.isGlobal && (
                        <span className="px-2 py-0.5 rounded-full bg-thread/10 text-thread text-[11px] font-bold uppercase tracking-wider">
                          Workspace Default
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-ink/60">
                       <span>{acc.fromEmail}</span>
                       <span className="w-1 h-1 rounded-full bg-[#D0D5DD] dark:bg-slate-600 hidden sm:block"></span>
                       <span>Host: {acc.smtpHost}:{acc.smtpPort}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEditForm(acc)} className="p-2 text-ink/60 hover:text-ink dark:hover:text-white hover:bg-linen dark:hover:bg-slate-700 rounded-[8px] transition-colors border border-transparent hover:border-ink/10 dark:hover:border-slate-700">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(acc.id, acc.name)} className="p-2 text-[#F04438] hover:bg-[#F04438]/10 rounded-[8px] transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Global Settings */}
        {isAdmin && (
        <section className="bg-white dark:bg-ink border border-ink/10 dark:border-white/10 rounded-[12px] overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-ink/10 dark:border-white/10 flex justify-between items-center bg-[#F9FAFB] dark:bg-slate-800/50">
            <h2 className="text-[16px] font-bold text-ink dark:text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-ink/60" />
              Workspace Global Settings
            </h2>
          </div>
          <div className="p-6 space-y-4">
             <div className="space-y-1.5">
                <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">Default Workspace Signature (HTML)</label>
                <textarea 
                  value={globalSignature}
                  onChange={e => setGlobalSignature(e.target.value)}
                  className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread min-h-[100px]"
                  placeholder="<p>Best regards,<br>The Team</p>"
                ></textarea>
             </div>
             <button 
                onClick={handleSaveGlobal}
                disabled={savingGlobal}
                className="px-4 py-2.5 bg-white dark:bg-slate-800 border border-[#D0D5DD] dark:border-slate-700 text-[#344054] dark:text-slate-300 rounded-[8px] text-[14px] font-medium hover:bg-[#F9FAFB] dark:hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-50 flex items-center min-w-[100px] justify-center"
              >
                {savingGlobal ? <Loader2 size={16} className="animate-spin" /> : "Save Global Settings"}
             </button>
          </div>
        </section>
        )}

        {/* Test Connection */}
        <section className="bg-white dark:bg-ink border border-ink/10 dark:border-white/10 rounded-[12px] overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-ink/10 dark:border-white/10 flex justify-between items-center bg-[#F9FAFB] dark:bg-slate-800/50">
            <h2 className="text-[16px] font-bold text-ink dark:text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-ink/60" />
              Test Connection
            </h2>
          </div>
          <div className="p-6">
            <form onSubmit={handleTestSmtp} className="flex flex-col sm:flex-row gap-4 items-end">
               <div className="flex-1 w-full space-y-1.5">
                  <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">Select Account</label>
                  <select 
                    value={testAccountId} 
                    onChange={e => setTestAccountId(e.target.value)}
                    className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread"
                    required
                  >
                    <option value="" disabled>Select an account...</option>
                    {accounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.fromEmail})</option>)}
                  </select>
               </div>
               <div className="flex-1 w-full space-y-1.5">
                  <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">Send To (Email Address)</label>
                  <input 
                    type="email" 
                    placeholder="you@example.com"
                    value={testEmail}
                    onChange={e => setTestEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread"
                    required
                  />
               </div>
               <button 
                  disabled={!testAccountId || !testEmail || testStatus.type === "loading"}
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2.5 bg-white dark:bg-slate-800 border border-[#D0D5DD] dark:border-slate-700 text-[#344054] dark:text-slate-300 rounded-[8px] text-[14px] font-medium hover:bg-[#F9FAFB] dark:hover:bg-slate-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center min-w-[120px]"
                >
                  {testStatus.type === "loading" ? <Loader2 size={16} className="animate-spin" /> : "Send Test Email"}
               </button>
            </form>
            
            {testStatus.type !== "idle" && testStatus.type !== "loading" && (
              <div className={`mt-4 p-3 rounded-[8px] flex items-start gap-3 text-[14px] ${testStatus.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                {testStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                <p>{testStatus.message}</p>
              </div>
            )}
          </div>
        </section>

      </div>

      {/* Account Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-ink w-full max-w-2xl rounded-xl shadow-xl border border-ink/10 dark:border-white/10 flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center px-6 py-4 border-b border-ink/10 dark:border-white/10">
              <h2 className="text-[18px] font-bold text-ink dark:text-white">{editingId ? "Edit SMTP Account" : "Add SMTP Account"}</h2>
              <button onClick={() => setShowForm(false)} className="text-[#98A2B3] hover:text-ink dark:hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <form id="smtp-form" onSubmit={handleSave} className="space-y-6">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Account Name */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">Account Label</label>
                    <input required name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Sales Team Mailbox" className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread" />
                  </div>
                  
                  {/* Sender Details */}
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">From Name</label>
                    <input required name="fromName" value={formData.fromName} onChange={handleChange} placeholder="John Doe" className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">From Email</label>
                    <input required type="email" name="fromEmail" value={formData.fromEmail} onChange={handleChange} placeholder="john@example.com" className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread" />
                  </div>
                  
                  <div className="col-span-1 md:col-span-2 border-t border-ink/10 dark:border-white/10 pt-6 mt-2">
                    <h3 className="text-[14px] font-semibold text-ink dark:text-white mb-4">SMTP Credentials</h3>
                  </div>

                  {/* SMTP Settings */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">SMTP Host</label>
                    <input required name="smtpHost" value={formData.smtpHost} onChange={handleChange} placeholder="smtp.gmail.com" className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">SMTP Port</label>
                    <input required name="smtpPort" type="number" value={formData.smtpPort} onChange={handleChange} placeholder="465" className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">SMTP User / Username</label>
                    <input required name="smtpUser" value={formData.smtpUser} onChange={handleChange} placeholder="user@example.com" className="w-full px-3 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread" />
                  </div>
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">SMTP Password</label>
                    <div className="relative">
                      <input required={!editingId} name="smtpPassword" type={showPassword ? "text" : "password"} value={formData.smtpPassword} onChange={handleChange} placeholder={editingId ? "Leave blank to keep unchanged" : "Password or App Password"} className="w-full pl-3 pr-10 py-2 border border-ink/10 dark:border-slate-700 rounded-[8px] bg-transparent text-[14px] focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/20 focus:border-thread" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-ink/60">
                         {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  
                  {isAdmin && (
                    <div className="space-y-1.5 md:col-span-2 mt-4 pt-4 border-t border-ink/10 dark:border-white/10">
                      <label className="text-[13px] font-medium text-[#344054] dark:text-slate-300">Team Access (Assign to Members)</label>
                      <p className="text-[12px] text-ink/60 mb-2">Select which team members can view and send emails using this SMTP account. You will always have access.</p>
                      <div className="max-h-[160px] overflow-y-auto border border-ink/10 dark:border-slate-700 rounded-[8px] divide-y divide-[#EAECF0] dark:divide-slate-700">
                        {organization?.members?.map((m: any) => (
                          <label key={m.userId} className="flex items-center justify-between p-3 hover:bg-[#F9FAFB] dark:hover:bg-slate-800/50 cursor-pointer">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-thread/10 flex items-center justify-center text-thread text-xs font-bold uppercase">
                                {(m.name || m.email || '?').charAt(0)}
                              </div>
                              <div>
                                <p className="text-[13px] font-medium text-ink dark:text-white">{m.name || m.email}</p>
                                <p className="text-[11px] text-ink/60 capitalize">{m.role}</p>
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={formData.assignedUserIds.includes(m.userId)}
                              onChange={() => handleUserToggle(m.userId)}
                              className="w-4 h-4 rounded border-[#D0D5DD] text-thread focus:ring-[#A83C2E]"
                            />
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                </div>
              </form>
            </div>
            
            <div className="px-6 py-4 border-t border-ink/10 dark:border-white/10 bg-[#F9FAFB] dark:bg-slate-800/50 flex justify-end gap-3 rounded-b-xl">
               <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-[#D0D5DD] dark:border-slate-700 text-[#344054] dark:text-slate-300 font-medium rounded-[8px] text-[14px] hover:bg-[#F9FAFB] dark:hover:bg-slate-800 transition-colors bg-white dark:bg-slate-900 shadow-sm">
                 Cancel
               </button>
               <button form="smtp-form" type="submit" disabled={saving} className="px-5 py-2 bg-thread text-white font-medium rounded-[8px] text-[14px] hover:bg-[#8B3125] transition-colors shadow-sm disabled:opacity-50 flex items-center">
                 {saving && <Loader2 size={16} className="mr-2 animate-spin" />}
                 {editingId ? "Save Changes" : "Add Account"}
               </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
