"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Mail, Loader2 } from "lucide-react";

function getOrgId() { return typeof window !== "undefined" ? localStorage.getItem("cordibase_active_org") || "" : ""; }

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const res = await fetch("/api/emailing/templates", { headers: { "x-org-id": getOrgId() } });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-ink overflow-hidden">
      <div className="p-6 border-b border-ink/10 dark:border-white/10 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Email Templates</h1>
          <p className="text-sm text-[#475467] dark:text-slate-400 mt-1">
            Manage your reusable email templates and AI rules.
          </p>
        </div>
        <Link 
          href="/dashboard/emailing/templates/new"
          className="flex items-center gap-2 bg-thread text-white px-5 py-2.5 rounded-md hover:bg-thread/90 transition-colors"
        >
          <Plus size={18} />
          New Template
        </Link>
      </div>

      <div className="p-6 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="animate-spin text-slate-400" size={32} />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-ink/10 dark:border-slate-700 rounded-lg">
            <Mail className="mx-auto text-slate-400 mb-4" size={48} />
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">No templates yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Create your first template to speed up your workflow.</p>
            <Link 
              href="/dashboard/emailing/templates/new"
              className="inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Plus size={18} />
              Create Template
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map(template => (
              <div key={template.id} className="border border-ink/10 dark:border-slate-700 rounded-lg p-5 hover:border-slate-300 dark:hover:border-slate-600 transition-colors bg-white dark:bg-slate-900">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{template.name}</h3>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 truncate">Subject: {template.subject}</p>
                <div className="text-xs text-slate-500 line-clamp-3 mb-4" dangerouslySetInnerHTML={{__html: template.bodyHtml}} />
                <div className="text-xs text-slate-400">Created: {new Date(template.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
