"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Send, Wand2, Mail, Loader2, AlertCircle, Users } from "lucide-react";
import "react-quill-new/dist/quill.snow.css";
import ContactPickerModal from "../components/ContactPickerModal";
import AttachmentPicker, { Attachment } from "../components/AttachmentPicker";
import { useModal } from "@/components/ModalProvider";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

function getOrgId() { return typeof window !== "undefined" ? localStorage.getItem("cordibase_active_org") || "" : ""; }

export default function ComposeEmail() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isContactPickerOpen, setIsContactPickerOpen] = useState(false);

  const [formData, setFormData] = useState({
    accountId: "",
    to: "",
    subject: "",
    html: "",
    attachments: [] as Attachment[],
  });
  
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/emailing/accounts", { headers: { "x-org-id": getOrgId() } });
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.accounts || []);
        if (data.accounts?.length > 0) {
          setFormData(prev => ({ ...prev, accountId: data.accounts[0].id }));
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const { alert } = useModal();

  const handleAiPolish = async () => {
    if (!aiPrompt) return;
    setAiLoading(true);
    try {
      const res = await fetch("/api/emailing/ai-draft", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-org-id": getOrgId() },
        body: JSON.stringify({
          prompt: aiPrompt,
          currentBody: formData.html,
          subject: formData.subject,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI request failed");
      setFormData(prev => ({ ...prev, html: data.html }));
      setAiPrompt("");
    } catch (err: any) {
      alert(err.message || "Failed to draft email", "AI Error");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.accountId) {
      setError("Please select a sender account. Go to Settings if you haven't added one.");
      return;
    }
    
    setSending(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/emailing/send", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-org-id": getOrgId() },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send email");
      
      setSuccess("Email sent successfully!");
      setFormData(prev => ({ ...prev, to: "", subject: "", html: "" }));
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
          <h1 className="text-2xl font-bold text-ink dark:text-white">Compose Email</h1>
          <p className="text-sm text-[#475467] dark:text-slate-400 mt-1">
            Write and send an email using your configured SMTP accounts.
          </p>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={sending}
          className="flex items-center gap-2 bg-thread text-white px-5 py-2.5 rounded-md hover:bg-thread/90 transition-colors disabled:opacity-50"
        >
          {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          {sending ? "Sending..." : "Send Email"}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Main Compose Area */}
        <div className="flex-1 flex flex-col p-6 overflow-y-auto">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md flex items-center gap-2 mb-6">
              <AlertCircle size={18} />
              {error}
            </div>
          )}
          {success && (
            <div className="p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md flex items-center gap-2 mb-6">
              <Mail size={18} />
              {success}
            </div>
          )}

          <form className="space-y-4 flex-1 flex flex-col">
            <div className="grid grid-cols-2 gap-4">
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
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-[#344054] dark:text-slate-300">To</label>
                  <button 
                    type="button" 
                    onClick={() => setIsContactPickerOpen(true)}
                    className="text-xs flex items-center gap-1 text-thread hover:underline font-medium"
                  >
                    <Users size={14} />
                    Select from CRM/HRM
                  </button>
                </div>
                <input 
                  type="text" 
                  value={formData.to}
                  onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                  className="w-full p-2 border border-[#D0D5DD] dark:border-slate-600 rounded-md bg-white dark:bg-ink text-ink dark:text-white" 
                  placeholder="recipient@example.com, recipient2@example.com..." 
                />
              </div>
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

            
              <div className="flex-1 flex flex-col min-h-[300px]">
              <label className="block text-sm font-medium text-[#344054] dark:text-slate-300 mb-1">Message</label>
              <div className="flex-1 border border-[#D0D5DD] dark:border-slate-600 rounded-md overflow-hidden bg-white">
                <ReactQuill 
                  theme="snow" 
                  value={formData.html}
                  onChange={(val) => setFormData({ ...formData, html: val })}
                  className="h-full flex flex-col"
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
          <div className="mt-4 pt-4 border-t border-ink/10 dark:border-slate-700">
                <label className="block text-sm font-medium text-[#344054] dark:text-slate-300 mb-2">Attachments</label>
                <AttachmentPicker 
                  attachments={formData.attachments}
                  onChange={(att) => setFormData({ ...formData, attachments: att })}
                />
              </div>
          </form>
        </div>

        {/* AI Sidebar */}
        <div className="w-80 border-l border-ink/10 dark:border-white/10 bg-[#F9FAFB] dark:bg-slate-800/30 p-6 flex flex-col">
          <div className="flex items-center gap-2 mb-4 text-ink dark:text-white">
            <Wand2 size={20} className="text-thread" />
            <h3 className="font-semibold">AI Assistant</h3>
          </div>
          <p className="text-sm text-[#475467] dark:text-slate-400 mb-4">
            Provide instructions to polish or rewrite your email content.
          </p>
          
          <textarea
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="E.g. Write a professional follow-up email to a client about our software product, or Make it more concise..."
            className="w-full p-3 h-32 border border-[#D0D5DD] dark:border-slate-600 rounded-md bg-white dark:bg-ink text-ink dark:text-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#A83C2E]/50 mb-3"
          />
          
          <button
            onClick={handleAiPolish}
            disabled={aiLoading || !aiPrompt}
            className="w-full flex items-center justify-center gap-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50 text-sm font-medium"
          >
            {aiLoading ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
            {aiLoading ? "Polishing..." : "Polish with AI"}
          </button>
        </div>
      </div>
      
      {isContactPickerOpen && (
        <ContactPickerModal
          onClose={() => setIsContactPickerOpen(false)}
          onAddSelected={(emails) => {
            setFormData(prev => {
              const current = prev.to ? prev.to.trim() : "";
              const newEmails = emails.join(", ");
              const combined = current 
                ? (current.endsWith(",") ? `${current} ${newEmails}` : `${current}, ${newEmails}`)
                : newEmails;
              return { ...prev, to: combined };
            });
          }}
        />
      )}

      {/* Add a style override to make react-quill-new take remaining height */}
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
