"use client";

import CountUp from "@/components/marketing/CountUp";
import TiltCard from "@/components/marketing/TiltCard";
import { ArrowRight, Star } from "lucide-react";
import Link from "next/link";

const cases = [
  {
    company: "BuildCo Kenya",
    industry: "Construction",
    logo: "BC",
    logoColor: "#f59e0b",
    headline: "72% reduction in late payments",
    story: "BuildCo was manually chasing 200+ invoices per month. After connecting Cordibase to their M-PESA Paybill, payments auto-match to invoices and reminders go out on schedule — with zero manual work.",
    stats: [["72%", "fewer late payments"], ["8h", "saved per week"], ["KES 2.4M", "recovered in 90 days"]],
  },
  {
    company: "Agriflow Ltd",
    industry: "Agriculture",
    logo: "AF",
    logoColor: "#31cb00",
    headline: "3x sales team productivity",
    story: "Agriflow's 15 field agents used to manage leads in WhatsApp. Switching to Cordibase CRM with mobile access tripled their pipeline visibility and helped them close KES 12M in new contracts in Q1.",
    stats: [["3×", "pipeline visibility"], ["KES 12M", "new contracts Q1"], ["15 agents", "onboarded in 1 day"]],
  },
  {
    company: "Nexapay",
    industry: "Fintech",
    logo: "NP",
    logoColor: "#60a5fa",
    headline: "Scaled from 20 to 80 employees painlessly",
    story: "When Nexapay raised their Series A, they needed to 4× the team fast. Cordibase HRM handled onboarding, payroll, and compliance — no external HR firm needed. Saved KES 180,000 in consulting fees.",
    stats: [["60", "new hires managed"], ["KES 180K", "consulting fees saved"], ["100%", "payroll accuracy"]],
  },
];

export default function CustomersPage() {
  return (
    <>
      <section className="pt-32 pb-20 px-6 text-center" style={{ background: "#0d1a0d" }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#31cb00" }}>Customer stories</p>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">Real businesses, <br />real results.</h1>
          <p className="text-white/50 text-xl">
            Over <strong className="text-white"><CountUp end={1240} suffix="+" /></strong> teams trust Cordibase to run their operations every day.
          </p>
        </div>
      </section>

      <section className="py-24 px-6" style={{ background: "#0a150a" }}>
        <div className="max-w-7xl mx-auto space-y-8">
          {cases.map((c) => (
            <TiltCard key={c.company} className="rounded-2xl border border-white/10 overflow-hidden" style={{ background: "#0d1a0d" } as React.CSSProperties}>
              <div className="grid grid-cols-1 lg:grid-cols-3">
                <div className="p-8 border-b lg:border-b-0 lg:border-r border-white/5 flex flex-col justify-between">
                  <div>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white mb-4" style={{ background: `linear-gradient(135deg,${c.logoColor}88,${c.logoColor})` }}>{c.logo}</div>
                    <h3 className="text-xl font-bold text-white">{c.company}</h3>
                    <p className="text-white/40 text-sm">{c.industry}</p>
                  </div>
                  <div className="flex mt-6">
                    {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#f59e0b" className="text-yellow-400" />)}
                  </div>
                </div>
                <div className="p-8 lg:col-span-2">
                  <h2 className="text-2xl font-bold mb-4" style={{ color: c.logoColor }}>{c.headline}</h2>
                  <p className="text-white/60 leading-relaxed mb-8">{c.story}</p>
                  <div className="grid grid-cols-3 gap-4">
                    {c.stats.map(([num, label]) => (
                      <div key={label} className="rounded-xl border border-white/5 p-4" style={{ background: "#0a150a" }}>
                        <p className="text-2xl font-black text-white mb-1">{num}</p>
                        <p className="text-white/40 text-xs">{label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TiltCard>
          ))}
        </div>
      </section>

      <section className="py-24 px-6 text-center" style={{ background: "#0d1a0d" }}>
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to be the next success story?</h2>
          <p className="text-white/50 mb-8">Start free. No credit card. See results in your first week.</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white text-lg transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg,#119822,#31cb00)" }}>
            Get Started Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </>
  );
}
