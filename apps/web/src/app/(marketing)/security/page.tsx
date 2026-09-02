import { Lock, Shield, Eye, RefreshCw, Server, Key } from "lucide-react";

const pillars = [
  { icon: Lock, title: "End-to-End Encryption", color: "#31cb00", desc: "All data is encrypted in transit (TLS 1.3) and at rest (AES-256). Your customer data is never readable by Cordibase staff." },
  { icon: Shield, title: "Role-Based Access Control", color: "#60a5fa", desc: "Fine-grained permissions per module and record type. Limit what each team member can see, edit, or delete." },
  { icon: Eye, title: "Full Audit Logs", color: "#f59e0b", desc: "Every action is logged with timestamp, user, IP address, and device. Tamper-proof logs stored separately from your data." },
  { icon: RefreshCw, title: "Continuous Backups", color: "#a78bfa", desc: "Point-in-time database backups every 15 minutes. Geo-redundant storage. 30-day retention with one-click restore." },
  { icon: Server, title: "Kenya-based Data Storage", color: "#34d399", desc: "Your data stays in Africa. Primary servers located in Nairobi, Kenya with failover to Johannesburg, South Africa." },
  { icon: Key, title: "Two-Factor Authentication", color: "#fb7185", desc: "Enforce 2FA across your entire organization. Supports TOTP apps (Google Authenticator, Authy) and SMS backup codes." },
];

export default function SecurityPage() {
  return (
    <div style={{ background: "#0d1a0d", minHeight: "100vh" }}>
      <section className="pt-32 pb-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#31cb00" }}>Security</p>
          <h1 className="text-5xl font-bold text-white mb-4">Your data is sacred.</h1>
          <p className="text-white/50 text-xl leading-relaxed">
            We built security into every layer of Cordibase — not as an afterthought, but as a foundation. Enterprise-grade protection for every plan.
          </p>
        </div>
      </section>

      <section className="py-12 px-6" style={{ background: "#0a150a" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[["SOC 2 Type II","In progress"],["ISO 27001","Certified"],["GDPR","Compliant"],["KRA Data Act","Compliant"]].map(([cert, status]) => (
            <div key={cert} className="rounded-2xl border border-white/10 p-6" style={{ background: "#0d1a0d" }}>
              <div className="text-3xl mb-2">🛡️</div>
              <p className="text-white font-bold text-sm">{cert}</p>
              <p className="text-white/40 text-xs mt-1">{status}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-24 px-6" style={{ background: "#0d1a0d" }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Security pillars</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pillars.map((p) => (
              <div key={p.title} className="rounded-2xl border border-white/10 p-8" style={{ background: "#0a150a" }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${p.color}22` }}>
                  <p.icon size={22} style={{ color: p.color }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{p.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6" style={{ background: "#0a150a" }}>
        <div className="max-w-3xl mx-auto rounded-2xl border border-white/10 p-10 text-center" style={{ background: "#0d1a0d" }}>
          <h2 className="text-2xl font-bold text-white mb-4">Responsible disclosure</h2>
          <p className="text-white/50 mb-6">Found a security vulnerability? We take reports seriously and respond within 24 hours. Eligible reports receive recognition in our Hall of Fame.</p>
          <a href="mailto:security@cordibase.com" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-semibold text-sm text-white" style={{ background: "linear-gradient(135deg,#119822,#31cb00)" }}>
            security@cordibase.com
          </a>
        </div>
      </section>
    </div>
  );
}
