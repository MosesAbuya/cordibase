"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Copy, LayoutTemplate, Plus } from "lucide-react";

export default function TemplatesPage() {
  const [templates] = useState([
    { id: 1, name: "Marketing Campaign", description: "Standard deliverables for a marketing rollout.", milestoneCount: 5 },
    { id: 2, name: "Software Development", description: "Agile sprints, QA, and deployment.", milestoneCount: 12 },
    { id: 3, name: "Client Onboarding", description: "Initial setup, training, and handover.", milestoneCount: 3 }
  ]);

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/projects" className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:bg-slate-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <LayoutTemplate className="w-8 h-8 text-thread" /> Project Templates
            </h1>
            <p className="text-slate-500">Create standard project structures to save time.</p>
          </div>
        </div>
        <button className="flex items-center gap-2 bg-thread hover:bg-thread/90 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus className="w-4 h-4" /> New Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map(t => (
          <div key={t.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group">
            <div className="w-12 h-12 bg-thread/10 rounded-lg flex items-center justify-center mb-4 text-thread">
              <Copy className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{t.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t.description}</p>
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-700 pt-4 mt-auto">
              <span className="text-sm font-medium text-slate-500">{t.milestoneCount} Milestones</span>
              <button className="text-thread text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Use Template →</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
