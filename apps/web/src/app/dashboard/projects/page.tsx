"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, MoreVertical, TrendingDown, AlertCircle, CheckCircle2 } from "lucide-react";

type Project = {
  id: string;
  name: string;
  status: string;
  budget: number;
  healthStatus: "on_track" | "at_risk" | "off_track";
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock the API call to GET /api/projects/projects
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // We pretend to call the API
        // const res = await fetch("/api/projects/projects");
        // const data = await res.json();
        
        // Simulating network delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setProjects([
          { id: "1", name: "Website Redesign", status: "Active", budget: 15000, healthStatus: "on_track" },
          { id: "2", name: "Mobile App MVP", status: "Active", budget: 45000, healthStatus: "at_risk" },
          { id: "3", name: "Q3 Marketing Campaign", status: "Planning", budget: 8500, healthStatus: "on_track" },
          { id: "4", name: "Cloud Migration", status: "Active", budget: 120000, healthStatus: "off_track" },
        ]);
      } catch (error) {
        console.error("Failed to fetch projects:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const getHealthIcon = (status: Project["healthStatus"]) => {
    switch (status) {
      case "on_track": return <CheckCircle2 className="text-emerald-500" size={16} />;
      case "at_risk": return <AlertCircle className="text-amber-500" size={16} />;
      case "off_track": return <TrendingDown className="text-rose-500" size={16} />;
    }
  };

  const getHealthLabel = (status: Project["healthStatus"]) => {
    switch (status) {
      case "on_track": return "On Track";
      case "at_risk": return "At Risk";
      case "off_track": return "Off Track";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Active Projects</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors font-medium text-sm">
          <Plus size={16} />
          New Project
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 h-48 animate-pulse flex flex-col justify-between">
              <div className="space-y-3">
                <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
              </div>
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-full mt-4"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(project => (
            <Link href={`/dashboard/projects/${project.id}`} key={project.id} className="block group h-full">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-all h-full flex flex-col relative group-hover:border-indigo-300 dark:group-hover:border-indigo-700">
                <button 
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
                  onClick={(e) => e.preventDefault()}
                >
                  <MoreVertical size={16} />
                </button>
                
                <div className="mb-4 flex-1">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors pr-6">
                    {project.name}
                  </h3>
                  <div className="inline-block px-2.5 py-0.5 mt-2 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300">
                    {project.status}
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4 shrink-0">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Budget</p>
                    <p className="font-medium text-slate-900 dark:text-white">
                      ${project.budget.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Health</p>
                    <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-white text-sm">
                      {getHealthIcon(project.healthStatus)}
                      <span>{getHealthLabel(project.healthStatus)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
