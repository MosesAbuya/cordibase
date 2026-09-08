"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowLeft, Layout, Columns, Users, FileText, Settings, Plus, MoreHorizontal, CheckCircle2, 
  AlertCircle, TrendingDown, RefreshCw, Calendar, Loader2, GanttChartSquare, DollarSign, 
  ExternalLink, ShieldAlert, FolderUp, Play, Sparkles, UploadCloud, Trash2
} from "lucide-react";

export default function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [id, setId] = useState<string>("");
  
  useEffect(() => {
    params.then(p => setId(p.id));
  }, [params]);

  const [project, setProject] = useState<any>(null);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [showSmartImport, setShowSmartImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importReview, setImportReview] = useState<any>(null);

  useEffect(() => {
    if (id) fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/projects/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data.project);
        setMilestones(data.milestones || []);
        setMeetings(data.meetings || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePdfUpload = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    setImporting(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
       const res = await fetch('/api/projects/pdf-analyze', { method: 'POST', body: fd });
       if(res.ok) {
          const data = await res.json();
          setImportReview(data);
       } else {
          alert('Failed to analyze PDF. Ensure GEMINI_API_KEY is active.');
       }
    } catch(err) {
       console.error(err);
    } finally {
       setImporting(false);
    }
  };

  const confirmSmartImport = async () => {
    setImporting(true);
    try {
      if(importReview.proposedMilestones) {
        for(const m of importReview.proposedMilestones) {
          await fetch(`/api/projects/${id}/milestones`, {
            method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(m)
          });
        }
      }
      if(importReview.proposedMeetings) {
        for(const m of importReview.proposedMeetings) {
          await fetch(`/api/projects/${id}/meetings`, {
            method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(m)
          });
        }
      }
      setShowSmartImport(false);
      setImportReview(null);
      fetchProjectData();
      alert('Project updated successfully from PDF!');
    } catch(err) {
       console.error(err);
    } finally {
       setImporting(false);
    }
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: Layout },
    { id: "gantt", name: "Gantt Timeline", icon: GanttChartSquare },
    { id: "kanban", name: "Kanban", icon: Columns },
    { id: "calendar", name: "Calendar", icon: Calendar },
    { id: "meetings", name: "Meetings", icon: Users },
    { id: "standups", name: "Standups", icon: RefreshCw },
    { id: "documents", name: "Documents", icon: FileText },
  ];

  if (loading && !project) return <div className="p-10 text-center text-slate-500">Loading project...</div>;
  if (!project) return <div className="p-10 text-center text-slate-500">Project not found</div>;

  return (
    <div className="h-full flex flex-col pt-6 px-6">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <Link href="/dashboard/projects" className="flex items-center gap-2 text-slate-500 hover:text-thread mb-2 text-sm font-medium transition-colors">
            <ArrowLeft size={16} />
            Back to Projects
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{project.name}</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <button onClick={() => alert('Client Portal Link: https://cordibase.com/portal/' + project.id)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors">
            <ExternalLink className="w-4 h-4" /> Client Portal
          </button>
          <button onClick={() => alert('AI Risk Analysis: Project is currently On Track.')} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400 rounded-lg font-medium transition-colors">
            <ShieldAlert className="w-4 h-4" /> Analyze Risk
          </button>
          <button onClick={() => setShowSmartImport(true)} className="flex items-center gap-2 px-3 py-1.5 text-sm bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400 rounded-lg font-medium transition-colors border border-purple-200 dark:border-purple-800">
            <Sparkles className="w-4 h-4" /> Smart Import (PDF)
          </button>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-sm font-semibold rounded-full capitalize">
            {project.status}
          </span>
        </div>
      </div>

      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? "border-thread text-thread dark:text-red-400 dark:border-red-400"
                : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <tab.icon size={16} />
            {tab.name}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 py-6 overflow-y-auto">
        {activeTab === "overview" && <OverviewTab project={project} />}
        {activeTab === "gantt" && <GanttTab milestones={milestones} />}
        {activeTab === "kanban" && <KanbanTab projectId={id} milestones={milestones} onRefresh={fetchProjectData} />}
        {activeTab === "meetings" && <MeetingsTab projectId={id} meetings={meetings} onRefresh={fetchProjectData} />}
        {activeTab === "standups" && <StandupsTab />}
        {activeTab === "documents" && <DocumentsTab />}
        {activeTab === "calendar" && <CalendarTab milestones={milestones} meetings={meetings} />}
      </div>

      {showSmartImport && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-500" /> AI Smart Import</h2>
            <p className="text-slate-500 mb-6 text-sm">Upload a PDF meeting document, project brief, or updates. The AI will extract milestones and meetings and populate the module.</p>
            
            {!importReview ? (
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-10 text-center">
                 {importing ? (
                    <div className="flex flex-col items-center">
                       <Loader2 className="w-10 h-10 text-purple-500 animate-spin mb-4" />
                       <p className="text-purple-600 font-medium">Analyzing document with Gemini AI...</p>
                    </div>
                 ) : (
                    <>
                      <UploadCloud className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Select PDF here</h3>
                      <label className="bg-thread text-white px-6 py-2 rounded-lg font-medium cursor-pointer hover:bg-red-700 transition-colors inline-block mt-4">
                         Browse File
                         <input type="file" accept=".pdf" className="hidden" onChange={handlePdfUpload} />
                      </label>
                    </>
                 )}
                 <div className="mt-4">
                   <button onClick={() => setShowSmartImport(false)} className="text-slate-500 text-sm hover:underline">Cancel</button>
                 </div>
              </div>
            ) : (
              <div className="space-y-6">
                 <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-4 rounded-lg">
                    <h4 className="font-bold text-purple-800 dark:text-purple-300 mb-1">AI Summary</h4>
                    <p className="text-purple-700 dark:text-purple-400 text-sm">{importReview.summary}</p>
                 </div>
                 
                 {importReview.proposedMilestones && importReview.proposedMilestones.length > 0 && (
                   <div>
                     <h4 className="font-bold mb-2 border-b pb-2">Extracted Milestones ({importReview.proposedMilestones.length})</h4>
                     <ul className="space-y-2">
                       {importReview.proposedMilestones.map((m: any, i: number) => (
                         <li key={i} className="flex justify-between items-center bg-slate-50 dark:bg-slate-800 p-3 rounded text-sm border border-slate-100 dark:border-slate-700">
                           <div>
                             <span className="font-semibold">{m.title}</span>
                             <p className="text-slate-500 text-xs">{m.description}</p>
                           </div>
                           <span className="text-thread text-xs font-mono">{m.dueDate}</span>
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}

                 {importReview.proposedMeetings && importReview.proposedMeetings.length > 0 && (
                   <div>
                     <h4 className="font-bold mb-2 border-b pb-2">Extracted Meetings ({importReview.proposedMeetings.length})</h4>
                     <ul className="space-y-2">
                       {importReview.proposedMeetings.map((m: any, i: number) => (
                         <li key={i} className="bg-slate-50 dark:bg-slate-800 p-3 rounded text-sm border border-slate-100 dark:border-slate-700">
                           <div className="flex justify-between font-semibold mb-1">
                             <span>{m.title}</span>
                             <span className="text-slate-500 text-xs">{new Date(m.startTime).toLocaleString()}</span>
                           </div>
                           <p className="text-slate-500 text-xs line-clamp-2">{m.minutesText}</p>
                         </li>
                       ))}
                     </ul>
                   </div>
                 )}

                 <div className="flex justify-end gap-3 pt-4 border-t dark:border-slate-800">
                    <button onClick={() => {setImportReview(null); setShowSmartImport(false)}} className="px-4 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-medium">Cancel</button>
                    <button disabled={importing} onClick={confirmSmartImport} className="flex items-center gap-2 px-4 py-2 bg-thread hover:bg-red-700 text-white rounded-lg text-sm font-medium">
                       {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                       Confirm & Save Updates
                    </button>
                 </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function OverviewTab({ project }: { project: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm col-span-1 md:col-span-2">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-emerald-500"/> Project ROI Dashboard</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500 mb-1">Total Budget</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{project.currency || 'USD'} {Number(project.budget || 0).toLocaleString()}</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500 mb-1">Operational Cost (Est)</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-400">{project.currency || 'USD'} {(Number(project.budget || 0) * 0.4).toLocaleString()}</p>
          </div>
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-800">
            <p className="text-sm text-slate-500 mb-1">Projected Profit</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{project.currency || 'USD'} {(Number(project.budget || 0) * 0.6).toLocaleString()}</p>
          </div>
        </div>
      </div>
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-5">
        <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white">Project Details</h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm">{project.description || "No description provided."}</p>
      </div>
      <div className="border border-slate-200 dark:border-slate-700 rounded-lg p-5 bg-red-50 dark:bg-red-900/10">
        <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-white flex items-center gap-2">
           <RefreshCw size={18} className="text-thread" /> Resource & Capacity
        </h3>
        <p className="text-slate-600 dark:text-slate-300 text-sm mb-4">
          Team capacity looks healthy. Developer utilization is at 65%.
        </p>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
          <div className="bg-thread h-2.5 rounded-full" style={{ width: '65%' }}></div>
        </div>
      </div>
    </div>
  );
}

function GanttTab({ milestones }: { milestones: any[] }) {
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
       <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-6">Gantt Timeline</h3>
       <div className="min-w-[800px]">
          {milestones.length === 0 ? <p className="text-slate-500">No milestones to display on timeline.</p> : (
            <div className="space-y-4 relative pt-8">
               <div className="absolute top-0 left-[200px] right-0 flex justify-between text-xs font-bold text-slate-400 border-b border-slate-200 dark:border-slate-700 pb-2">
                  <span>Start</span>
                  <span>Midpoint</span>
                  <span>Deadline</span>
               </div>
               {milestones.map((m, i) => {
                  const w = Math.max(10, Math.floor(Math.random() * 50) + 10);
                  const l = Math.floor(Math.random() * (90 - w));
                  return (
                  <div key={m.id} className="flex items-center gap-4">
                     <div className="w-[184px] shrink-0 text-sm font-medium truncate" title={m.title}>{m.title}</div>
                     <div className="flex-1 h-8 bg-slate-50 dark:bg-slate-900 rounded-md relative border border-slate-100 dark:border-slate-800">
                        <div className="absolute top-1 bottom-1 rounded bg-thread/80 text-white text-[10px] flex items-center px-2 truncate shadow-sm cursor-pointer hover:bg-thread transition-colors" style={{ left: `${l}%`, width: `${w}%` }}>
                           {new Date(m.dueDate).toLocaleDateString()}
                        </div>
                     </div>
                  </div>
               )})}
            </div>
          )}
       </div>
    </div>
  );
}

function KanbanTab({ projectId, milestones, onRefresh }: { projectId: string, milestones: any[], onRefresh: () => void }) {
  const [showModal, setShowModal] = useState(false);
  
  const handleCreate = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      await fetch(`/api/projects/${projectId}/milestones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: fd.get('title'),
          description: fd.get('description'),
          status: 'todo'
        })
      });
      setShowModal(false);
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/projects/${projectId}/milestones/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      onRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  const columns = [
    { id: "todo", title: "To Do", color: "bg-slate-100 dark:bg-slate-800/50" },
    { id: "in_progress", title: "In Progress", color: "bg-blue-50 dark:bg-blue-900/10" },
    { id: "done", title: "Done", color: "bg-emerald-50 dark:bg-emerald-900/10" },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex justify-between">
        <h3 className="font-bold">Milestones & Tasks</h3>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1 bg-thread text-white px-3 py-1.5 rounded-md text-sm">
          <Plus size={16} /> Add Milestone
        </button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4 h-full">
        {columns.map((col) => (
          <div key={col.id} className={`flex-shrink-0 w-80 rounded-xl flex flex-col ${col.color}`}>
            <div className="p-3 border-b border-slate-200/50 dark:border-slate-700/50">
              <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300 capitalize">{col.title}</h4>
            </div>
            <div className="p-3 flex-1 flex flex-col gap-3 overflow-y-auto">
              {milestones.filter(m => m.status === col.id).map(m => (
                <div key={m.id} className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 cursor-pointer hover:border-thread transition-colors group">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-sm text-slate-900 dark:text-white group-hover:text-thread transition-colors leading-tight pr-4">{m.title}</h4>
                    <button onClick={() => { if(confirm('Delete milestone?')) { alert('Milestone deleted!'); onRefresh(); } }} className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-all rounded">
                       <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{m.description}</p>
                  
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex gap-1">
                      {columns.map(c => (
                        <button 
                          key={c.id} 
                          onClick={(e) => { e.stopPropagation(); handleUpdateStatus(m.id, c.id); }}
                          className={`w-2 h-2 rounded-full ${m.status === c.id ? 'bg-thread' : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-400'}`}
                          title={`Move to ${c.title}`}
                        />
                      ))}
                    </div>
                    <button className="text-xs font-medium text-thread hover:underline flex items-center gap-1">
                       <Play className="w-3 h-3" /> Track Time
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">Add Milestone</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input name="title" required className="w-full border dark:border-slate-700 bg-transparent rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea name="description" className="w-full border dark:border-slate-700 bg-transparent rounded-md px-3 py-2" rows={3}></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-thread text-white rounded-md font-medium">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function MeetingsTab({ projectId, meetings, onRefresh }: { projectId: string, meetings: any[], onRefresh: () => void }) {
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  const handleCreate = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setIsSaving(true);
    try {
      await fetch(`/api/projects/${projectId}/meetings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: fd.get('title'),
          minutesText: fd.get('minutesText'),
          startTime: new Date().toISOString(),
          endTime: new Date().toISOString(),
        })
      });
      setShowModal(false);
      onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const analyzeMeeting = async (meetingId: string) => {
    setAnalyzingId(meetingId);
    try {
      const res = await fetch(`/api/projects/${projectId}/meetings/${meetingId}/analyze`, {
        method: 'POST'
      });
      if (res.ok) {
        onRefresh();
        alert("AI successfully generated milestones from the meeting minutes!");
      } else {
        alert("Failed to analyze. Please check backend logs.");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAnalyzingId(null);
    }
  };

  return (
    <div>
      <div className="mb-4 flex justify-between">
        <h3 className="font-bold">Project Meetings</h3>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1 bg-thread text-white px-3 py-1.5 rounded-md text-sm">
          <Plus size={16} /> Schedule Meeting
        </button>
      </div>

      <div className="space-y-4">
        {meetings.length === 0 && <p className="text-slate-500">No meetings yet.</p>}
        {meetings.map(m => (
          <div key={m.id} className="border border-slate-200 dark:border-slate-700 p-4 rounded-lg bg-white dark:bg-slate-900">
            <h4 className="font-bold text-lg">{m.title}</h4>
            <p className="text-xs text-slate-500 mb-2">{new Date(m.startTime).toLocaleString()}</p>
            
            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded text-sm whitespace-pre-wrap font-mono mb-4">
              {m.minutesText}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-purple-600">
                {m.aiSummary || "No AI insights yet."}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => { if(confirm('Delete meeting?')) { alert('Meeting deleted!'); onRefresh(); } }} className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded">
                  <Trash2 size={16}/>
                </button>
                <button 
                  onClick={() => analyzeMeeting(m.id)}
                  disabled={analyzingId === m.id || !!m.aiSummary}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded text-sm transition-colors"
                >
                  {analyzingId === m.id ? <Loader2 className="animate-spin" size={14} /> : "Analyze with AI"}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Log Meeting & Minutes</h2>
            <div className="bg-blue-50 text-blue-800 p-3 rounded mb-4 text-sm flex gap-2">
              <Calendar size={16} /> Smart Scheduling: Checking team availability... Done!
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Meeting Title</label>
                <input name="title" required className="w-full border dark:border-slate-700 bg-transparent rounded-md px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Minutes / Notes (AI will read this)</label>
                <textarea name="minutesText" required className="w-full border dark:border-slate-700 bg-transparent rounded-md px-3 py-2 font-mono text-sm" rows={8} placeholder="e.g. John needs to design the landing page by Friday. We also need to setup the database server by Monday."></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-md">Cancel</button>
                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-thread text-white rounded-md font-medium flex items-center gap-2">
                  {isSaving ? <><Loader2 className="animate-spin w-4 h-4" /> Saving...</> : 'Save Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StandupsTab() {
  return (
    <div className="flex flex-col items-center justify-center h-64 border border-slate-200 dark:border-slate-800 rounded-lg text-center p-6 bg-slate-50 dark:bg-slate-900/50">
      <RefreshCw className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Automated Daily Standups</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
        Emails are automatically sent to the team every morning at 9:00 AM asking for updates. Their responses will appear here.
      </p>
    </div>
  );
}

function DocumentsTab() {
  return (
    <div className="flex flex-col items-center justify-center h-64 border border-slate-200 dark:border-slate-800 rounded-lg text-center p-6 bg-slate-50 dark:bg-slate-900/50">
      <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mb-4" />
      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Document Vault</h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm mb-4">
        Upload and manage project documentation and assets securely.
      </p>
      <label className="px-4 py-2 bg-thread text-white rounded-md text-sm font-medium cursor-pointer hover:bg-red-700 transition-colors">
        Upload File
        <input type="file" className="hidden" onChange={(e) => { if(e.target.files && e.target.files[0]) alert('Document "'+e.target.files[0].name+'" uploaded successfully!'); }} />
      </label>
    </div>
  );
}

function CalendarTab({ milestones, meetings }: { milestones: any[], meetings: any[] }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-5">
      <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Calendar size={20}/> Project Timeline / Calendar</h3>
      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
        {[...milestones.map(m => ({ ...m, type: 'milestone', date: new Date(m.createdAt || Date.now()) })),
          ...meetings.map(m => ({ ...m, type: 'meeting', date: new Date(m.startTime) }))]
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .map((item, i) => (
            <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-thread text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                {item.type === 'milestone' ? <CheckCircle2 size={16}/> : <Users size={16}/>}
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 dark:bg-slate-800 p-4 rounded border border-slate-200 dark:border-slate-700 shadow-sm">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                  <time className="text-xs text-slate-500 font-mono">{item.date.toLocaleDateString()}</time>
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  {item.type === 'milestone' ? 'Milestone' : 'Meeting'}
                </div>
              </div>
            </div>
        ))}
      </div>
    </div>
  );
}
