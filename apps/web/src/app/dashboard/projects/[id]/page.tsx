"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Layout, 
  Kanban as KanbanIcon, 
  Users, 
  FileText,
  Plus,
  MoreHorizontal
} from "lucide-react";
import Link from "next/link";

type Tab = "overview" | "kanban" | "meetings" | "documents";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // In a real app, we would fetch project details by ID here.
  // Using mock data for demonstration.
  const projectName = `Project ${projectId}`;
  const projectStatus = "Active";

  const tabs: { id: Tab; name: string; icon: any }[] = [
    { id: "overview", name: "Overview", icon: Layout },
    { id: "kanban", name: "Kanban", icon: KanbanIcon },
    { id: "meetings", name: "Meetings", icon: Users },
    { id: "documents", name: "Documents", icon: FileText },
  ];

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="space-y-1">
          <Link 
            href="/dashboard/projects" 
            className="inline-flex items-center text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors mb-2"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back to Projects
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {projectName}
            </h1>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-medium">
              {projectStatus}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium">
            Settings
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors font-medium text-sm">
            <Plus size={16} />
            Add Task
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <tab.icon size={16} />
            {tab.name}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "kanban" && <KanbanTab />}
        {activeTab === "meetings" && <MeetingsTab />}
        {activeTab === "documents" && <DocumentsTab />}
      </div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-center p-6">
      <Layout className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Overview Placeholder</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
        This is where the project summary, recent activity, and key metrics will be displayed.
      </p>
    </div>
  );
}

function KanbanTab() {
  const columns = [
    { id: "todo", title: "To Do", count: 3, color: "bg-slate-100 dark:bg-slate-800/50" },
    { id: "in-progress", title: "In Progress", count: 2, color: "bg-blue-50 dark:bg-blue-900/10" },
    { id: "done", title: "Done", count: 5, color: "bg-emerald-50 dark:bg-emerald-900/10" },
  ];

  return (
    <div className="h-full flex gap-6 overflow-x-auto pb-4">
      {columns.map((col) => (
        <div key={col.id} className={`flex-shrink-0 w-80 rounded-xl flex flex-col ${col.color}`}>
          <div className="p-3 flex justify-between items-center border-b border-slate-200/50 dark:border-slate-700/50">
            <h3 className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2">
              {col.title}
              <span className="text-xs font-normal text-slate-500 dark:text-slate-400 bg-slate-200/50 dark:bg-slate-700/50 px-2 py-0.5 rounded-full">
                {col.count}
              </span>
            </h3>
            <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1">
              <MoreHorizontal size={16} />
            </button>
          </div>
          
          <div className="p-3 flex-1 flex flex-col gap-3">
            {/* Example Card */}
            <div className="bg-white dark:bg-slate-900 p-3 rounded-lg shadow-sm border border-slate-200/60 dark:border-slate-700/60 cursor-grab hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] uppercase font-bold text-indigo-600 dark:text-indigo-400 tracking-wider">Design</span>
                <button className="text-slate-400 hover:text-slate-600">
                  <MoreHorizontal size={14} />
                </button>
              </div>
              <p className="text-sm text-slate-800 dark:text-slate-200 font-medium mb-3">
                Mockup empty states for Kanban board
              </p>
              <div className="flex justify-between items-center">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-slate-300 border-2 border-white dark:border-slate-900"></div>
                  <div className="w-6 h-6 rounded-full bg-emerald-300 border-2 border-white dark:border-slate-900"></div>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Sep 15</span>
              </div>
            </div>

            {/* Example Card 2 */}
            <div className="bg-white dark:bg-slate-900 p-3 rounded-lg shadow-sm border border-slate-200/60 dark:border-slate-700/60 cursor-grab hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">Frontend</span>
              </div>
              <p className="text-sm text-slate-800 dark:text-slate-200 font-medium mb-3">
                Implement project layout component
              </p>
              <div className="flex justify-between items-center">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-indigo-300 border-2 border-white dark:border-slate-900"></div>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">Sep 12</span>
              </div>
            </div>
          </div>
          
          <div className="p-3 mt-auto">
            <button className="w-full flex items-center justify-center gap-2 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 rounded-md transition-colors">
              <Plus size={16} />
              Add Task
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function MeetingsTab() {
  return (
    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-center p-6">
      <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Meetings Placeholder</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
        List of upcoming and past meetings related to this project will appear here.
      </p>
      <button className="mt-4 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium">
        Schedule Meeting
      </button>
    </div>
  );
}

function DocumentsTab() {
  return (
    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-lg text-center p-6">
      <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Documents Placeholder</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
        Upload and manage project documentation, assets, and files.
      </p>
      <button className="mt-4 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium">
        Upload Document
      </button>
    </div>
  );
}
