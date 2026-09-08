"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, MoreVertical, TrendingDown, AlertCircle, CheckCircle2, DollarSign } from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/projects/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: any) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    try {
      const res = await fetch('/api/projects/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: fd.get('name'),
          description: fd.get('description'),
          budget: fd.get('budget'),
          status: 'active'
        })
      });
      if (res.ok) {
        setShowModal(false);
        fetchProjects();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case "on_track": return <CheckCircle2 className="text-emerald-500" size={16} />;
      case "at_risk": return <AlertCircle className="text-amber-500" size={16} />;
      case "off_track": return <TrendingDown className="text-red-500" size={16} />;
      default: return <CheckCircle2 className="text-slate-400" size={16} />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 h-full flex flex-col relative">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Active Projects</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Manage and track your ongoing projects and AI insights.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-lg transition-colors font-medium text-sm shadow-sm">
          <Plus size={18} />
          New Project
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading projects...</div>
      ) : projects.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed rounded-lg border-slate-200">
          <p className="text-slate-500 mb-4">No projects found.</p>
          <button onClick={() => setShowModal(true)} className="text-indigo-600 font-medium">Create your first project</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Link href={`/dashboard/projects/${project.id}`} key={project.id} className="block group">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm hover:shadow-md transition-all group-hover:border-indigo-300 dark:group-hover:border-indigo-700">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-semibold rounded-full uppercase tracking-wider">
                      {project.status}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
                      {getHealthIcon(project.healthStatus || 'on_track')}
                      {(project.healthStatus || 'on_track').replace('_', ' ')}
                    </span>
                  </div>
                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300" onClick={(e) => e.preventDefault()}>
                    <MoreVertical size={18} />
                  </button>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {project.name}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-5 line-clamp-2">
                  {project.description || "No description"}
                </p>

                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <DollarSign size={16} className="text-slate-400" />
                    {Number(project.budget || 0).toLocaleString()}
                  </div>
                  <div className="text-xs text-slate-500">
                    ROI Dashboard
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4">New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Project Name</label>
                <input name="name" required className="w-full border dark:border-slate-700 bg-transparent rounded-md px-3 py-2" placeholder="e.g. Q3 Marketing" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Template (Feature 8)</label>
                <select name="template" className="w-full border dark:border-slate-700 bg-transparent rounded-md px-3 py-2">
                  <option value="">Blank Project</option>
                  <option value="sw">Software Development</option>
                  <option value="mkt">Marketing Campaign</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Budget (ROI Dashboard - Feature 12)</label>
                <input name="budget" type="number" required className="w-full border dark:border-slate-700 bg-transparent rounded-md px-3 py-2" placeholder="e.g. 50000" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea name="description" className="w-full border dark:border-slate-700 bg-transparent rounded-md px-3 py-2" rows={3}></textarea>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
