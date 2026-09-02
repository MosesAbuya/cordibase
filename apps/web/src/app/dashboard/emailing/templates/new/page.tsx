"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { Save, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import "react-quill-new/dist/quill.snow.css";
import AttachmentPicker, { Attachment } from "../../components/AttachmentPicker";

const ReactQuill = dynamic(() => import("react-quill-new"), { ssr: false });

function getOrgId() { return typeof window !== "undefined" ? localStorage.getItem("cordibase_active_org") || "" : ""; }

export default function NewTemplatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    bodyHtml: "",
    aiInstructions: "",
    attachments: [] as Attachment[],
  });

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.subject || !formData.bodyHtml) {
      setError("Name, Subject, and Body are required.");
      return;
    }
    
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/emailing/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-org-id": getOrgId() },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save template");
      
      router.push("/dashboard/emailing/templates");
    } catch (err: any) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-ink overflow-hidden">
      <div className="p-6 border-b border-ink/10 dark:border-white/10 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/emailing/templates" className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-ink dark:text-white">New Template</h1>
            <p className="text-sm text-[#475467] dark:text-slate-400 mt-1">
              Create a reusable email template.
            </p>
          </div>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-thread text-white px-5 py-2.5 rounded-md hover:bg-thread/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? "Saving..." : "Save Template"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md flex items-center gap-2 mb-6">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        <form className="max-w-4xl space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#344054] dark:text-slate-300 mb-1">Template Name</label>
              <input 
                type="text" 
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-[#D0D5DD] dark:border-slate-600 rounded-md bg-white dark:bg-ink text-ink dark:text-white" 
                placeholder="e.g. Welcome Email" 
              />
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
          </div>
          
          <div>
            <label className="block text-sm font-medium text-[#344054] dark:text-slate-300 mb-1">AI Drafting Rules (Optional)</label>
            <textarea 
              value={formData.aiInstructions}
              onChange={(e) => setFormData({ ...formData, aiInstructions: e.target.value })}
              className="w-full p-2 border border-[#D0D5DD] dark:border-slate-600 rounded-md bg-white dark:bg-ink text-ink dark:text-white h-20 resize-y" 
              placeholder="Instructions for AI when generating emails from this template. e.g. Keep it casual, always mention our current sale..." 
            />
          </div>

          <div className="flex flex-col min-h-[400px]">
            <label className="block text-sm font-medium text-[#344054] dark:text-slate-300 mb-1">Message Body</label>
            <div className="flex-1 border border-[#D0D5DD] dark:border-slate-600 rounded-md overflow-hidden bg-white">
              <ReactQuill 
                theme="snow" 
                value={formData.bodyHtml}
                onChange={(val) => setFormData({ ...formData, bodyHtml: val })}
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
