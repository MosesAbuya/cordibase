export default function RoadmapPage() {
  const columns = [
    {
      title: "In Progress",
      color: "#31cb00",
      items: [
        { title: "WhatsApp Business integration", tag: "CRM", desc: "Send and receive WhatsApp messages directly from deal and contact pages." },
        { title: "AI deal summary", tag: "CRM", desc: "Auto-generate a deal brief from all notes, emails, and call logs using AI." },
        { title: "Mobile app (iOS & Android)", tag: "Platform", desc: "Full-featured mobile app for on-the-go pipeline management and approvals." },
      ],
    },
    {
      title: "Up Next",
      color: "#60a5fa",
      items: [
        { title: "KRA eTIMS integration", tag: "Accounting", desc: "Direct submission of invoices and receipts to KRA eTIMS system." },
        { title: "Job board & ATS", tag: "HRM", desc: "Post jobs, collect applications, and track candidates in a hiring pipeline." },
        { title: "Customer portal", tag: "CRM", desc: "Give clients a self-service portal to view invoices, approve quotes, and track orders." },
        { title: "Stripe & Flutterwave payments", tag: "Accounting", desc: "Accept card and mobile money payments from customers globally." },
      ],
    },
    {
      title: "Considering",
      color: "#a78bfa",
      items: [
        { title: "Field sales & GPS tracking", tag: "CRM", desc: "Route planning and check-in verification for on-the-ground sales teams." },
        { title: "Inventory management", tag: "New Module", desc: "Track stock levels, purchase orders, and product catalogs." },
        { title: "Document e-signatures", tag: "Platform", desc: "Built-in digital signature collection for contracts and quotes." },
        { title: "Multi-company support", tag: "Platform", desc: "Manage multiple business entities under one Cordibase account." },
        { title: "Power BI connector", tag: "Analytics", desc: "Export Cordibase data to Power BI for custom executive dashboards." },
      ],
    },
  ];

  const tagColors: Record<string, string> = { CRM: "#31cb00", Accounting: "#f59e0b", HRM: "#60a5fa", Platform: "#a78bfa", "New Module": "#fb7185", Analytics: "#34d399" };

  return (
    <div style={{ background: "#0d1a0d", minHeight: "100vh" }}>
      <section className="pt-32 pb-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#31cb00" }}>Public roadmap</p>
          <h1 className="text-5xl font-bold text-white mb-4">What we're building next</h1>
          <p className="text-white/50 text-lg">Transparency is a core value. Here's exactly what the Cordibase team is working on.</p>
        </div>
      </section>

      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {columns.map((col) => (
              <div key={col.title}>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-2 h-2 rounded-full" style={{ background: col.color }}></div>
                  <h2 className="font-bold text-white">{col.title}</h2>
                  <span className="text-white/30 text-sm ml-auto">{col.items.length} items</span>
                </div>
                <div className="space-y-4">
                  {col.items.map((item) => (
                    <div key={item.title} className="rounded-xl border border-white/10 p-5" style={{ background: "#0a150a" }}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="text-white font-semibold text-sm leading-snug">{item.title}</h3>
                        <span className="text-xs font-bold px-2 py-0.5 rounded shrink-0" style={{ color: tagColors[item.tag] || "#fff", background: `${tagColors[item.tag] || "#fff"}22` }}>{item.tag}</span>
                      </div>
                      <p className="text-white/40 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-white/5 p-8 text-center" style={{ background: "#0a150a" }}>
            <p className="text-white/50 mb-4">Have a feature idea? We read every request.</p>
            <a href="mailto:ideas@cordibase.com" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white transition-all" style={{ background: "linear-gradient(135deg,#119822,#31cb00)" }}>
              Submit a feature request
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
