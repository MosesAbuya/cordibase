"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Send, Users, AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import "react-quill-new/dist/quill.snow.css";
import ContactPickerModal from "../components/ContactPickerModal";
import AttachmentPicker, { Attachment } from "../components/AttachmentPicker";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

function getOrgId() { return typeof window !== "undefined" ? localStorage.getItem("cordibase_active_org") || "" : ""; }

export default function BulkEmailPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [isContactPickerOpen, setIsContactPickerOpen] = useState(false);

  const [formData, setFormData] = useState({
    accountId: "",
    toRaw: "",
    subject: "",
    html: "",
    templateId: "",
    attachments: [] as Attachment[],
  });

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [accRes, tplRes] = await Promise.all([
        fetch("/api/emailing/accounts"),
        fetch("/api/emailing/templates")
      ]);
      
      if (accRes.ok) {
        const accData = await accRes.json();
        setAccounts(accData.accounts || []);
        if (accData.accounts?.length > 0) {
          setFormData(prev => ({ ...prev, accountId: accData.accounts[0].id }));
        }
      }
      
      if (tplRes.ok) {
        const tplData = await tplRes.json();
        setTemplates(tplData.templates || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        templateId,
        subject: template.subject,
        html: template.bodyHtml,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        templateId: "",
        subject: "",
        html: "",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setResults([]);

    if (!formData.accountId) {
      setError("Please select a sender account.");
      return;
    }
    
    const emails = formData.toRaw
      .split(",")
      .map(e => e.trim())
      .filter(e => e);

    if (emails.length === 0) {
      setError("Please enter at least one recipient email.");
      return;
    }

    if (!formData.subject || !formData.html) {
      setError("Subject and message body are required.");
      return;
    }
    
    setSending(true);

    try {
      const res = await fetch("/api/emailing/bulk/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-org-id": getOrgId() },
        body: JSON.stringify({
          accountId: formData.accountId,
          to: emails,
          subject: formData.subject,
          html: formData.html,
        }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send bulk email");
      
      setSuccess(`Successfully processed bulk sending.`);
      setResults(data.results || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-ink overflow-hidden">
      <div className="p-6 border-b border-ink/10 dark:border-white/10 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Bulk Email</h1>
          <p className="text-sm text-[#475467] dark:text-slate-400 mt-1">
            Send emails to multiple recipients at once.
          </p>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={sending || loading}
          className="flex items-center gap-2 bg-thread text-white px-5 py-2.5 rounded-md hover:bg-thread/90 transition-colors disabled:opacity-50"
        >
          {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          {sending ? "Sending..." : "Send Bulk Email"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md flex items-center gap-2 mb-6">
            <AlertCircle size={18} />
            {error}
          </div>
        )}
        
        {success && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md flex flex-col gap-2 mb-6">
            <div className="flex items-center gap-2 font-medium">
              <CheckCircle2 size={18} />
              {success}
            </div>
            {results.length > 0 && (
              <div className="mt-2 pl-6 text-sm max-h-32 overflow-y-auto">
                {results.map((r, i) => (
                  <div key={i} className="flex items-center gap-2">
                    {r.success ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <span className="text-red-600">✗</span>
                    )}
                    <span>{r.email}</span>
                    {!r.success && <span className="text-red-500">- {r.error}</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <form className="max-w-4xl space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#344054] dark:text-slate-300 mb-1">From Account</label>
              <select 
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                className="w-full p-2 border border-[#D0D5DD] dark:border-slate-600 rounded-md bg-white dark:bg-ink text-ink dark:text-white"
              >
                {loading ? <option>Loading...</option> : accounts.length === 0 ? <option value="">No accounts found</option> : null}
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.name} ({acc.fromEmail})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#344054] dark:text-slate-300 mb-1">Email Template</label>
              <select 
                value={formData.templateId}
                onChange={(e) => handleTemplateChange(e.target.value)}
                className="w-full p-2 border border-[#D0D5DD] dark:border-slate-600 rounded-md bg-white dark:bg-ink text-ink dark:text-white"
              >
                <option value="">-- No Template (Start from scratch) --</option>
                {templates.map(tpl => (
                  <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-sm font-medium text-[#344054] dark:text-slate-300">Recipients</label>
              <button 
                type="button" 
                onClick={() => setIsContactPickerOpen(true)}
                className="text-xs flex items-center gap-1 text-thread hover:underline font-medium"
              >
                <Users size={14} />
                Select from CRM/HRM
              </button>
            </div>
            <textarea 
              value={formData.toRaw}
              onChange={(e) => setFormData({ ...formData, toRaw: e.target.value })}
              className="w-full p-2 border border-[#D0D5DD] dark:border-slate-600 rounded-md bg-white dark:bg-ink text-ink dark:text-white h-24 resize-y" 
              placeholder="recipient1@example.com, recipient2@example.com..." 
            />
            <p className="text-xs text-slate-500 mt-1">Enter email addresses separated by commas.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#344054] dark:text-slate-300 mb-1">Subject</label>
            <input 
              type="text" 
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full p-2 border border-[#D0D5DD] dark:border-slate-600 rounded-md bg-white dark:bg-ink text-ink dark:text-white" 
              placeholder="Email Subject" 
            />
          </div>

          <div className="flex flex-col min-h-[400px]">
            <div className="mb-4">
              <label className="block text-sm font-medium text-[#344054] dark:text-slate-300 mb-2">Attachments</label>
              <AttachmentPicker 
                attachments={formData.attachments}
                onChange={(att) => setFormData({ ...formData, attachments: att })}
              />
            </div>
            <label className="block text-sm font-medium text-[#344054] dark:text-slate-300 mb-1">Message Body</label>
            <div className="flex-1 border border-[#D0D5DD] dark:border-slate-600 rounded-md overflow-hidden bg-white">
              <ReactQuill 
                theme="snow" 
                value={formData.html}
                onChange={(val) => setFormData({ ...formData, html: val })}
                className="h-full flex flex-col min-h-[350px]"
                modules={{
                  toolbar: [
                    [{ 'header': [1, 2, false] }],
                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                    [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
                    ['link', 'image'],
                    ['clean']
                  ],
                }}
              />
            </div>
          </div>
        </form>
      </div>

      {isContactPickerOpen && (
        <ContactPickerModal
          onClose={() => setIsContactPickerOpen(false)}
          onAddSelected={(emails) => {
            setFormData(prev => {
              const current = prev.toRaw ? prev.toRaw.trim() : "";
              const newEmails = emails.join(", ");
              // Append neatly
              const combined = current 
                ? (current.endsWith(",") ? `${current} ${newEmails}` : `${current}, ${newEmails}`)
                : newEmails;
              return { ...prev, toRaw: combined };
            });
          }}
        />
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .ql-container {
          flex: 1;
          overflow-y: auto;
          font-family: inherit;
        }
        .ql-editor {
          min-height: 100%;
        }
        .ql-toolbar {
          border-top: none !important;
          border-left: none !important;
          border-right: none !important;
          background-color: #f9fafb;
        }
        .dark .ql-toolbar {
          background-color: #1e293b;
          border-color: #334155 !important;
        }
        .dark .ql-container {
          border-color: #334155 !important;
        }
        .dark .ql-editor {
          color: #f8fafc;
        }
      `}} />
    </div>
  );
}
