import Link from "next/link";

const integrations = [
  { name: "M-PESA", category: "Payments", logo: "MP", color: "#31cb00", desc: "Paybill, Till, STK Push reconciliation" },
  { name: "Stripe", category: "Payments", logo: "ST", color: "#635bff", desc: "Card payments from global customers" },
  { name: "Flutterwave", category: "Payments", logo: "FW", color: "#f5a623", desc: "Pan-African payment collection" },
  { name: "Gmail", category: "Email", logo: "GM", color: "#ea4335", desc: "Two-way email sync and tracking" },
  { name: "Outlook", category: "Email", logo: "OL", color: "#0078d4", desc: "Microsoft 365 email and calendar sync" },
  { name: "Slack", category: "Notifications", logo: "SL", color: "#4a154b", desc: "Deal alerts and team notifications" },
  { name: "WhatsApp Business", category: "Messaging", logo: "WA", color: "#25d366", desc: "Send messages from contact/deal pages" },
  { name: "KRA eTIMS", category: "Compliance", logo: "KR", color: "#c0392b", desc: "Direct receipt submission to KRA" },
  { name: "Quickbooks", category: "Accounting", logo: "QB", color: "#2ca01c", desc: "Import historical financial data" },
  { name: "Zapier", category: "Automation", logo: "ZP", color: "#ff4a00", desc: "Connect to 6,000+ apps via Zapier" },
  { name: "REST API", category: "Developer", logo: "API", color: "#a78bfa", desc: "Full REST API with webhooks support" },
  { name: "Power BI", category: "Analytics", logo: "BI", color: "#f2c811", desc: "Export data for custom dashboards" },
];

const categories = [...new Set(integrations.map((i) => i.category))];

export default function IntegrationsPage() {
  return (
    <div style={{ background: "#0d1a0d", minHeight: "100vh" }}>
      <section className="pt-32 pb-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#31cb00" }}>Integrations</p>
          <h1 className="text-5xl font-bold text-white mb-4">Connect everything</h1>
          <p className="text-white/50 text-lg">Cordibase plugs into your existing tools. Payments, email, compliance, and more.</p>
        </div>
      </section>

      <section className="pb-32 px-6">
        <div className="max-w-7xl mx-auto">
          {categories.map((cat) => (
            <div key={cat} className="mb-12">
              <h2 className="text-white/40 text-xs font-bold uppercase tracking-widest mb-4">{cat}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {integrations.filter((i) => i.category === cat).map((intg) => (
                  <div key={intg.name} className="rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all group" style={{ background: "#0a150a" }}>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-sm text-white mb-4" style={{ background: `${intg.color}33` }}>
                      <span style={{ color: intg.color }}>{intg.logo}</span>
                    </div>
                    <h3 className="text-white font-bold mb-1">{intg.name}</h3>
                    <p className="text-white/40 text-xs leading-relaxed">{intg.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="rounded-2xl border border-white/5 p-10 text-center" style={{ background: "#0a150a" }}>
            <h2 className="text-2xl font-bold text-white mb-3">Don't see your tool?</h2>
            <p className="text-white/50 mb-6">Our REST API and Zapier connector let you build any integration in minutes.</p>
            <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white" style={{ background: "linear-gradient(135deg,#119822,#31cb00)" }}>
              Request an integration
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
