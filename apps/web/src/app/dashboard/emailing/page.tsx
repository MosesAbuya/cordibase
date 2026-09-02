"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Mail, Search, RefreshCw, AlertCircle } from "lucide-react";

function getOrgId() { return typeof window !== "undefined" ? localStorage.getItem("cordibase_active_org") || "" : ""; }

export default function EmailingDashboard() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/emailing/logs", { headers: { "x-org-id": getOrgId() } });
      if (!res.ok) throw new Error("Failed to fetch email logs");
      const data = await res.json();
      setLogs(data.logs || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-ink">
      <div className="flex items-center justify-between p-6 border-b border-ink/10 dark:border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-white">Emailing Dashboard</h1>
          <p className="text-sm text-[#475467] dark:text-slate-400 mt-1">
            Overview of recently sent emails.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchLogs}
            className="p-2 border border-ink/10 dark:border-slate-700 rounded-md text-[#475467] hover:bg-[#F9FAFB] dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      <div className="flex-1 p-6 overflow-auto">
        {error ? (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md flex items-center gap-2 mb-6">
            <AlertCircle size={18} />
            {error}
          </div>
        ) : loading ? (
          <div className="flex justify-center p-12">
            <RefreshCw size={24} className="animate-spin text-[#98A2B3]" />
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Mail size={24} className="text-[#98A2B3]" />
            </div>
            <h3 className="text-lg font-medium text-ink dark:text-white">No emails sent yet</h3>
            <p className="text-[#475467] dark:text-slate-400 mt-1 max-w-sm">
              Emails you send will appear here.
            </p>
          </div>
        ) : (
          <div className="border border-ink/10 dark:border-white/10 rounded-lg overflow-hidden">
            <table className="w-full text-left text-sm text-[#475467] dark:text-slate-300">
              <thead className="bg-[#F9FAFB] dark:bg-slate-800/50 text-ink dark:text-white">
                <tr>
                  <th className="px-4 py-3 font-medium">To</th>
                  <th className="px-4 py-3 font-medium">Subject</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EAECF0] dark:divide-slate-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#F9FAFB] dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3 font-medium text-ink dark:text-white">{log.toEmail}</td>
                    <td className="px-4 py-3 truncate max-w-xs">{log.subject}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                        log.status === "SENT" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" :
                        log.status === "FAILED" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" :
                        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {format(new Date(log.sentAt), "MMM d, yyyy h:mm a")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
