"use client";

import TiltCard from "@/components/marketing/TiltCard";
import BlurText from "@/components/marketing/BlurText";
import { Heart, Zap, Globe } from "lucide-react";

export default function AboutPage() {
  const values = [
    { icon: Heart, title: "Built for Africa", color: "#31cb00", desc: "We build software that actually fits how African businesses operate — M-PESA first, KES pricing, local compliance built in." },
    { icon: Zap, title: "Radical Simplicity", color: "#f59e0b", desc: "Every feature earns its place. We remove until it breaks, then add one thing back. Cordibase stays fast, lean, and focused." },
    { icon: Globe, title: "Open Growth", color: "#60a5fa", desc: "Your data is yours. Export anytime, integrate via our public API, and grow without being locked in." },
  ];

  const team = [
    { name: "Moses K.", role: "Founder & CEO", color: "#119822", initials: "MK" },
    { name: "Aisha M.", role: "Head of Product", color: "#31cb00", initials: "AM" },
    { name: "David O.", role: "Lead Engineer", color: "#f59e0b", initials: "DO" },
    { name: "Fatuma S.", role: "Head of Support", color: "#60a5fa", initials: "FS" },
  ];

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-24 px-6" style={{ background: "#0d1a0d" }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#31cb00" }}>Our story</p>
          <h1 className="font-bold text-white leading-none mb-6 text-5xl md:text-7xl">
            <BlurText text="Built from frustration. Grown with purpose." className="text-5xl md:text-7xl font-bold text-white leading-tight" />
          </h1>
          <p className="text-white/50 text-xl max-w-2xl mx-auto leading-relaxed">
            Cordibase was born after our founder spent three years stitching together QuickBooks, HubSpot, and spreadsheets for a Nairobi-based company. There had to be a better way.
          </p>
        </div>
      </section>

      {/* Origin Story */}
      <section className="py-24 px-6" style={{ background: "#0a150a" }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">The problem we set out to solve</h2>
              <p className="text-white/50 leading-relaxed mb-4">
                Every tool built for African SMEs was either too expensive (Salesforce, SAP), too simple (Excel), or built for Western markets without understanding M-PESA, KRA compliance, or how local businesses actually grow.
              </p>
              <p className="text-white/50 leading-relaxed mb-4">
                We started building Cordibase in 2023, initially just for ourselves. Then three friends asked to use it. Then their friends. By 2024, we had 200 companies on the platform.
              </p>
              <p className="text-white/50 leading-relaxed">
                Today, over 1,240 teams across 30 countries trust Cordibase to run their business operations every day.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 p-8 space-y-4" style={{ background: "#0d1a0d" }}>
              {[["2023","Cordibase founded in Nairobi, Kenya"],["Jan 2024","First 100 paying customers"],["Jun 2024","Launched M-PESA reconciliation"],["2025","1,200+ teams · 30 countries"],["2026","Series A · Expanding to West Africa"]].map(([year, event]) => (
                <div key={year} className="flex gap-4 items-start">
                  <span className="text-xs font-mono font-bold mt-1 shrink-0" style={{ color: "#31cb00" }}>{year}</span>
                  <p className="text-white/60 text-sm">{event}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-6" style={{ background: "#0d1a0d" }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">What we stand for</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map((v) => (
              <TiltCard key={v.title} className="rounded-2xl border border-white/10 p-8" style={{ background: "#0a150a" } as React.CSSProperties}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6" style={{ background: `${v.color}22` }}>
                  <v.icon size={24} style={{ color: v.color }} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{v.title}</h3>
                <p className="text-white/50 leading-relaxed text-sm">{v.desc}</p>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-24 px-6" style={{ background: "#0a150a" }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">The people behind Cordibase</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {team.map((m) => (
              <div key={m.name} className="rounded-2xl border border-white/10 p-6 text-center" style={{ background: "#0d1a0d" }}>
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-black text-white mx-auto mb-4" style={{ background: `linear-gradient(135deg,${m.color}88,${m.color})` }}>
                  {m.initials}
                </div>
                <p className="text-white font-semibold">{m.name}</p>
                <p className="text-white/40 text-sm mt-1">{m.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 px-6 text-center" style={{ background: "#0d1a0d" }}>
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Our mission</h2>
          <p className="text-white/50 text-xl leading-relaxed">
            To give every African business — from a sole trader in Kisumu to a 500-person company in Lagos — the same world-class business software that Fortune 500 companies use, at a price they can actually afford.
          </p>
        </div>
      </section>
    </>
  );
}
