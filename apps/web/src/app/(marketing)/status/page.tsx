export default function StatusPage() {
  const services = [
    { name: "Web Application", status: "operational", uptime: "99.98%" },
    { name: "API (REST)", status: "operational", uptime: "99.97%" },
    { name: "M-PESA Integration", status: "operational", uptime: "99.95%" },
    { name: "Email Service", status: "operational", uptime: "99.99%" },
    { name: "Database", status: "operational", uptime: "99.99%" },
    { name: "File Storage", status: "operational", uptime: "100%" },
    { name: "Authentication", status: "operational", uptime: "99.98%" },
    { name: "Webhooks", status: "operational", uptime: "99.93%" },
  ];

  const incidents = [
    { date: "Aug 12, 2026", title: "Resolved: M-PESA webhook delays", desc: "Safaricom upstream latency caused a 23-minute delay in M-PESA payment notifications. Fully resolved at 14:32 EAT.", severity: "minor" },
    { date: "Jul 28, 2026", title: "Resolved: Slow report generation", desc: "A background job migration caused P95 report generation times to spike to 45s. Rolled back and resolved in 12 minutes.", severity: "minor" },
  ];

  return (
    <div style={{ background: "#0d1a0d", minHeight: "100vh" }}>
      <section className="pt-32 pb-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold" style={{ background: "rgba(49,203,0,0.1)", color: "#31cb00" }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#31cb00" }}></div>
            All systems operational
          </div>
          <h1 className="text-5xl font-bold text-white mb-4">System Status</h1>
          <p className="text-white/50">Real-time status of all Cordibase services. Updated every 60 seconds.</p>
        </div>
      </section>

      <section className="pb-16 px-6">
        <div className="max-w-3xl mx-auto space-y-3">
          {services.map((svc) => (
            <div key={svc.name} className="flex items-center justify-between px-6 py-4 rounded-xl border border-white/5" style={{ background: "#0a150a" }}>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: "#31cb00" }}></div>
                <span className="text-white font-medium">{svc.name}</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-white/40 text-sm font-mono">{svc.uptime} uptime</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded" style={{ color: "#31cb00", background: "rgba(49,203,0,0.1)" }}>Operational</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-white mb-6">Recent incidents</h2>
          {incidents.length === 0 ? (
            <p className="text-white/40">No incidents in the past 90 days.</p>
          ) : (
            <div className="space-y-4">
              {incidents.map((inc) => (
                <div key={inc.title} className="rounded-xl border border-white/5 p-6" style={{ background: "#0a150a" }}>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-white font-semibold text-sm">{inc.title}</h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded shrink-0" style={{ color: "#f59e0b", background: "rgba(245,158,11,0.1)" }}>Minor</span>
                  </div>
                  <p className="text-white/40 text-xs mb-2">{inc.date}</p>
                  <p className="text-white/50 text-sm">{inc.desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
