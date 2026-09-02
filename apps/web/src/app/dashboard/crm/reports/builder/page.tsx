"use client";
import { useState } from "react";
import { Play, Save } from "lucide-react";

export default function ReportBuilder() {
  const [collection, setCollection] = useState("tickets");
  const [metric, setMetric] = useState("count");
  const [dimension, setDimension] = useState("status");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const runQuery = async () => {
    setLoading(true);
    try {
      const orgId = localStorage.getItem('cordibase_active_org');
      const res = await fetch('/api/crm/reports/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-org-id': orgId || ''
        },
        body: JSON.stringify({
          collection,
          metrics: [{ type: metric }],
          dimensions: [dimension],
        })
      });
      const data = await res.json();
      setResults(data.result || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-ink">Generic Report Builder</h2>
          <p className="text-sm text-gray-500">Construct queries across the object graph.</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-white border border-[#D0D5DD] text-[#344054] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#F9FAFB] transition-colors">
            <Save className="w-4 h-4" />
            Save to Dashboard
          </button>
          <button onClick={runQuery} className="flex items-center gap-2 bg-thread text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#8B3125] transition-colors shadow-sm">
            <Play className="w-4 h-4" />
            Run Query
          </button>
        </div>
      </div>

      <div className="flex gap-6 mt-6">
        <div className="w-1/3 bg-white border border-ink/10 rounded-xl p-4 shadow-sm h-fit">
          <h3 className="font-medium text-sm text-gray-700 mb-4 uppercase tracking-wider">Query Config</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Collection (FROM)</label>
              <select 
                value={collection}
                onChange={e => setCollection(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#A83C2E]"
              >
                <option value="tickets">Tickets (Service)</option>
                <option value="deals">Deals (Sales)</option>
                <option value="contacts">Contacts (Core)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Measure (SELECT)</label>
              <select 
                value={metric}
                onChange={e => setMetric(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#A83C2E]"
              >
                <option value="count">Count (Records)</option>
                <option value="sum_amount">Sum of Amount</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Dimension (GROUP BY)</label>
              <select 
                value={dimension}
                onChange={e => setDimension(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#A83C2E]"
              >
                <option value="status">Status / Stage</option>
                <option value="queueId">Queue / Department</option>
                <option value="priority">Priority</option>
              </select>
            </div>
          </div>
        </div>

        <div className="w-2/3 bg-white border border-ink/10 rounded-xl p-4 shadow-sm min-h-[400px]">
          <h3 className="font-medium text-sm text-gray-700 mb-4 uppercase tracking-wider">Visualization</h3>
          
          {loading ? (
            <div className="flex items-center justify-center h-64 text-gray-400">Executing Query...</div>
          ) : results.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="py-3 px-4 text-sm font-medium text-gray-500 uppercase">{dimension}</th>
                    <th className="py-3 px-4 text-sm font-medium text-gray-500 uppercase">{metric}</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((r, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm font-medium text-gray-900">{r._label || 'Unassigned'}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">{r.count || r.amount || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-8 h-48 flex items-end gap-4 px-4">
                {results.map((r, i) => {
                  const max = Math.max(...results.map(x => x.count || x.amount || 0));
                  const h = ((r.count || r.amount || 0) / max) * 100;
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center justify-end group relative">
                      <div className="w-full bg-thread rounded-t-sm transition-all" style={{ height: `${h}%` }}></div>
                      <span className="text-xs text-gray-500 mt-2 truncate w-full text-center">{r._label || 'None'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-400">No data. Click Run Query.</div>
          )}
        </div>
      </div>
    </div>
  );
}
