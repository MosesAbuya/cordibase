"use client";

import TiltCard from "@/components/marketing/TiltCard";
import BlurText from "@/components/marketing/BlurText";
import { Users, Kanban, Zap, BarChart2, Phone, Mail, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const features = [
  { icon: Users, title: "Contact & company profiles", desc: "Rich profiles with custom fields, activity history, files, and linked deals. Import via CSV or sync from Gmail/Outlook." },
  { icon: Kanban, title: "Visual sales pipeline", desc: "Drag deals across stages. Color-code by health. Filter by rep, value, close date, or tag. Forecast accurately." },
  { icon: Zap, title: "Automation sequences", desc: "Build multi-step sequences: email, task, reminder — triggered by deal stage, idle time, or custom events. No code." },
  { icon: BarChart2, title: "Sales analytics", desc: "Leaderboards, conversion rates, average deal size, pipeline velocity. Identify what's working and who's excelling." },
  { icon: Phone, title: "Activity logging", desc: "Log calls, emails, meetings, and notes in seconds. Our AI suggests next actions based on deal context." },
  { icon: Mail, title: "Email integration", desc: "Two-way Gmail and Outlook sync. See every email thread right inside the contact or deal record." },
];

export default function CRMModulePage() {
  return (
    <>
      <section className="pt-32 pb-24 px-6" style={{ background: "#0d1a0d" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border" style={{ background: "rgba(17,152,34,0.1)", borderColor: "rgba(17,152,34,0.3)", color: "#31cb00" }}>
              <Users size={12} /> CRM Module
            </div>
            <h1 className="font-bold text-white mb-6 leading-tight">
              <BlurText text="Your pipeline. Moving." className="text-4xl md:text-6xl font-bold text-white leading-tight" />
            </h1>
            <p className="text-white/50 text-xl leading-relaxed mb-8">
              A CRM built for African sales teams. Manage contacts, deals, and follow-ups — all in one place, with automations that handle the busywork.
            </p>
            <ul className="space-y-3 mb-10">
              {["Unlimited contacts and deals","Custom pipeline stages","Automated follow-up sequences","Real-time team dashboards","Gmail & Outlook sync"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-white/70 text-sm">
                  <CheckCircle2 size={16} style={{ color: "#31cb00" }} />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white text-lg justify-center" style={{ background: "linear-gradient(135deg,#119822,#31cb00)" }}>
                Start free <ArrowRight size={18} />
              </Link>
              <div className="inline-flex items-center gap-2 px-5 py-4 text-white/50 text-sm">
                From <strong className="text-white">KES 2,200/mo</strong>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 p-6" style={{ background: "#0a150a" }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/50 text-xs font-mono">Q4 Pipeline — KES 8.4M total</span>
              <span className="text-xs font-bold" style={{ color: "#31cb00" }}>↑ 24% vs Q3</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { stage: "Qualified", count: 12, color: "#60a5fa", deals: ["Acme Corp — 480K","BuildCo — 220K","Agriflow — 150K"] },
                { stage: "Proposal", count: 7, color: "#f59e0b", deals: ["Nexapay — 1.2M","GreenLink — 340K","Souvenir — 90K"] },
                { stage: "Won", count: 18, color: "#31cb00", deals: ["INNOTECH — 650K","Masoko — 280K","QuickPay — 410K"] },
              ].map((col) => (
                <div key={col.stage}>
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="w-2 h-2 rounded-full" style={{ background: col.color }}></div>
                    <span className="text-white/60 text-xs">{col.stage}</span>
                    <span className="text-white/30 text-xs ml-auto">{col.count}</span>
                  </div>
                  <div className="space-y-2">
                    {col.deals.map((d) => (
                      <div key={d} className="rounded-lg border border-white/5 p-2.5 text-xs text-white/60" style={{ background: "#0d1a0d" }}>{d}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6" style={{ background: "#0a150a" }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Built for every stage of your sales process</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <TiltCard key={f.title} className="rounded-2xl border border-white/10 p-8" style={{ background: "#0d1a0d" } as React.CSSProperties}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: "rgba(17,152,34,0.15)" }}>
                  <f.icon size={22} style={{ color: "#31cb00" }} />
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
