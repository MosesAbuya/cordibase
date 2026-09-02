export default function ChangelogPage() {
  const releases = [
    {
      version: "v2.4.0",
      date: "August 2026",
      badge: "Latest",
      changes: [
        { type: "new", text: "Payroll automation: NSSF, NHIF, PAYE auto-calculation" },
        { type: "new", text: "M-PESA STK Push integration for invoice payment collection" },
        { type: "improved", text: "Pipeline board load time reduced by 60%" },
        { type: "improved", text: "Bulk contact import now supports up to 50,000 rows" },
        { type: "fixed", text: "Date picker timezone offset for EAT users" },
      ],
    },
    {
      version: "v2.3.0",
      date: "July 2026",
      badge: "",
      changes: [
        { type: "new", text: "Email campaigns module: send to contact segments, track opens/clicks" },
        { type: "new", text: "Custom deal pipeline stages with probability weighting" },
        { type: "improved", text: "Financial reports now export to Excel with proper formatting" },
        { type: "fixed", text: "Leave balance calculation for employees with carried-over days" },
      ],
    },
    {
      version: "v2.2.0",
      date: "June 2026",
      badge: "",
      changes: [
        { type: "new", text: "Multi-currency invoicing with live exchange rates" },
        { type: "new", text: "KRA ETR integration for receipt generation" },
        { type: "improved", text: "Mobile responsive dashboard redesign" },
        { type: "fixed", text: "Pagination on contacts list for orgs > 10,000 contacts" },
      ],
    },
    {
      version: "v2.1.0",
      date: "May 2026",
      badge: "",
      changes: [
        { type: "new", text: "Automation flows builder (no-code trigger/action sequences)" },
        { type: "new", text: "Support widget embed for customer portals" },
        { type: "improved", text: "API rate limits raised from 100 to 500 req/min" },
        { type: "fixed", text: "Webhook delivery reliability improved to 99.9%" },
      ],
    },
    {
      version: "v2.0.0",
      date: "March 2026",
      badge: "Major",
      changes: [
        { type: "new", text: "Complete UI overhaul — dark Enchanted Forest theme" },
        { type: "new", text: "HRM module launch: employee profiles, leave, payroll" },
        { type: "new", text: "Unified dashboard with cross-module insights" },
        { type: "improved", text: "Data model migration for 5x query performance" },
      ],
    },
  ];

  const typeStyles: Record<string, { label: string; color: string; bg: string }> = {
    new: { label: "New", color: "#31cb00", bg: "rgba(49,203,0,0.1)" },
    improved: { label: "Improved", color: "#60a5fa", bg: "rgba(96,165,250,0.1)" },
    fixed: { label: "Fixed", color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
  };

  return (
    <div style={{ background: "#0d1a0d", minHeight: "100vh" }}>
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#31cb00" }}>What's new</p>
          <h1 className="text-5xl font-bold text-white mb-4">Changelog</h1>
          <p className="text-white/50 text-lg">A running record of every improvement, fix, and new feature shipped to Cordibase.</p>
        </div>
      </section>

      <section className="pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <div className="absolute left-[11px] top-0 bottom-0 w-px" style={{ background: "rgba(255,255,255,0.08)" }}></div>
            <div className="space-y-16">
              {releases.map((release) => (
                <div key={release.version} className="relative pl-10">
                  <div className="absolute left-0 top-1.5 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg,#119822,#31cb00)" }}>
                    <div className="w-2 h-2 rounded-full bg-white"></div>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <h2 className="text-xl font-bold text-white">{release.version}</h2>
                    {release.badge && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: "linear-gradient(135deg,#119822,#31cb00)", color: "white" }}>{release.badge}</span>
                    )}
                    <span className="text-white/30 text-sm">{release.date}</span>
                  </div>
                  <ul className="space-y-3">
                    {release.changes.map((c, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="text-xs font-bold px-2 py-0.5 rounded shrink-0 mt-0.5" style={{ background: typeStyles[c.type].bg, color: typeStyles[c.type].color }}>{typeStyles[c.type].label}</span>
                        <span className="text-white/60 text-sm">{c.text}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
