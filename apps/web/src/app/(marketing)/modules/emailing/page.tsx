"use client";

import TiltCard from "@/components/marketing/TiltCard";
import BlurText from "@/components/marketing/BlurText";
import { Mail, Target, BarChart2, Zap, Users, CheckCircle2, ArrowRight } from "lucide-react";
import Link from "next/link";

const features = [
  { icon: Mail, title: "Branded campaigns", desc: "Drag-and-drop email builder with your logo, colors, and custom domain sender." },
  { icon: Target, title: "Smart segmentation", desc: "Send to contact segments based on deal stage, tags, location, or custom fields." },
  { icon: BarChart2, title: "Open & click tracking", desc: "See exactly who opened, clicked, or unsubscribed. Replay sequences automatically." },
  { icon: Zap, title: "Trigger-based sequences", desc: "Set it once: welcome series, deal won celebration, re-engagement drip — all automatic." },
  { icon: Users, title: "CRM-synced contacts", desc: "Your contact list stays in sync with CRM. No CSV uploads. No duplicate lists." },
  { icon: CheckCircle2, title: "GDPR & CAN-SPAM compliant", desc: "Unsubscribe links auto-inserted, suppression lists managed, compliance built in." },
];

export default function EmailingModulePage() {
  return (
    <>
      <section className="relative pt-32 pb-24 px-6 overflow-hidden" style={{ background: "#0d1a0d" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border" style={{ background: "rgba(167,139,250,0.1)", borderColor: "rgba(167,139,250,0.3)", color: "#a78bfa" }}>
              <Mail size={12} /> Emailing Module
            </div>
            <h1 className="font-bold text-white mb-6 leading-tight">
              <BlurText text="Emails that feel personal. At scale." className="text-4xl md:text-6xl font-bold text-white leading-tight" />
            </h1>
            <p className="text-white/50 text-xl leading-relaxed mb-10">
              Build once, send to thousands. Cordibase email campaigns are powered by your CRM data — every message is relevant, timely, and on-brand.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white text-lg justify-center" style={{ background: "linear-gradient(135deg,#7c3aed,#a78bfa)" }}>
                Start free <ArrowRight size={18} />
              </Link>
              <Link href="/pricing" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white/60 text-lg border border-white/15 justify-center hover:border-white/30 transition-all">
                View pricing
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 p-6 space-y-3" style={{ background: "#0a150a" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-white/50 text-xs font-mono">Campaign: August Newsletter</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ color: "#31cb00", background: "rgba(49,203,0,0.1)" }}>Sent</span>
            </div>
            {[
              { label: "Delivered", value: "2,847", pct: 98.2, color: "#31cb00" },
              { label: "Opened", value: "1,423", pct: 50.0, color: "#a78bfa" },
              { label: "Clicked", value: "312", pct: 10.9, color: "#60a5fa" },
              { label: "Unsubscribed", value: "4", pct: 0.1, color: "#f59e0b" },
            ].map((row) => (
              <div key={row.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/50">{row.label}</span>
                  <span className="text-white font-mono">{row.value} <span className="text-white/30">({row.pct}%)</span></span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="h-full rounded-full" style={{ width: `${row.pct}%`, background: row.color }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6" style={{ background: "#0a150a" }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Everything your email campaigns need</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <TiltCard key={f.title} className="rounded-2xl border border-white/10 p-8" style={{ background: "#0d1a0d" } as React.CSSProperties}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: "rgba(167,139,250,0.15)" }}>
                  <f.icon size={22} style={{ color: "#a78bfa" }} />
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{f.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{f.desc}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
