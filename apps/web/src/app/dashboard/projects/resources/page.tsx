"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Activity, Clock } from "lucide-react";

export default function ResourcePlanningPage() {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects/resources')
      .then(r => r.json())
      .then(d => {
        if (d.resources) setResources(d.resources);
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 p-8 overflow-y-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/projects" className="p-2 bg-white dark:bg-slate-800 rounded-full shadow-sm hover:bg-slate-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users className="w-8 h-8 text-thread" /> Resource & Capacity Planning
          </h1>
          <p className="text-slate-500">Manage employee workload and prevent overbooking across all projects.</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm text-slate-600 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-900/50 font-medium text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="py-4 px-6">Employee</th>
              <th className="py-4 px-6">Assigned Projects</th>
              <th className="py-4 px-6">Max Weekly Hours</th>
              <th className="py-4 px-6">Current Workload</th>
              <th className="py-4 px-6">Capacity Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-10 text-center text-slate-500">Loading resources...</td></tr>
            ) : resources.length === 0 ? (
              <tr><td colSpan={5} className="p-10 text-center text-slate-500">No resources assigned to projects yet.</td></tr>
            ) : resources.map((r, i) => {
               // Mock workload calculation for the UI
               const workload = Math.floor(Math.random() * 45) + 10;
               const isOverbooked = workload > r.maxWeeklyHours;
               return (
                <tr key={r.id || i} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="py-4 px-6 font-medium flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-thread/10 flex items-center justify-center text-thread font-bold">
                      {r.userId.substring(0,2).toUpperCase()}
                    </div>
                    {r.userId}
                  </td>
                  <td className="py-4 px-6">{Math.floor(Math.random() * 4) + 1}</td>
                  <td className="py-4 px-6 flex items-center gap-2"><Clock className="w-4 h-4 text-slate-400" /> {r.maxWeeklyHours} hrs</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className={`h-2 rounded-full ${isOverbooked ? 'bg-red-500' : 'bg-thread'}`} style={{ width: `${Math.min((workload / r.maxWeeklyHours) * 100, 100)}%` }}></div>
                      </div>
                      <span className={`text-xs font-bold ${isOverbooked ? 'text-red-600 dark:text-red-400' : ''}`}>{workload} hrs</span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    {isOverbooked ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        <Activity className="w-3 h-3" /> Overbooked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                        Healthy
                      </span>
                    )}
                  </td>
                </tr>
               )
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
