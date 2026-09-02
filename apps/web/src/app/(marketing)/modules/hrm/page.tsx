"use client";

import TiltCard from "@/components/marketing/TiltCard";
import BlurText from "@/components/marketing/BlurText";
import { Shield, Users, FileText, DollarSign, Bell, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const features = [
  { icon: Users, title: "Employee directory", desc: "Searchable profiles with job history, documents, emergency contacts, and custom fields. Role-based access control." },
  { icon: Bell, title: "Leave management", desc: "Employees apply via self-service portal. Managers approve in one tap. Annual leave balances update automatically." },
  { icon: DollarSign, title: "Payroll processing", desc: "Auto-calculates NSSF (National Social Security Fund), NHIF, and PAYE. Generates payslips and bank transfer sheets." },
  { icon: FileText, title: "HR reports & compliance", desc: "KRA PAYE reports, NSSF contribution schedules, NHIF schedules — all formatted for direct submission." },
  { icon: Shield, title: "Onboarding workflows", desc: "Checklist-based onboarding ensures new hires get access, documents, and training in the right order." },
  { icon: Lock, title: "Document management", desc: "Store contracts, NDAs, and IDs securely. Set expiry reminders so nothing lapses unnoticed." },
];

export default function HRMModulePage() {
  return (
    <>
      <section className="pt-32 pb-24 px-6" style={{ background: "#0d1a0d" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border" style={{ background: "rgba(96,165,250,0.1)", borderColor: "rgba(96,165,250,0.3)", color: "#60a5fa" }}>
              <Shield size={12} /> HRM Module
            </div>
            <h1 className="font-bold text-white mb-6 leading-tight">
              <BlurText text="Your team, organized." className="text-4xl md:text-6xl font-bold text-white leading-tight" />
            </h1>
            <p className="text-white/50 text-xl leading-relaxed mb-8">
              Full HR management for Kenyan businesses. Employee directory, leave approvals, payroll with PAYE/NSSF/NHIF auto-calculation — all compliant, all in one place.
            </p>
            <ul className="space-y-3 mb-10">
              {["Employee self-service portal","Automated payroll processing","NSSF, NHIF, PAYE auto-calculation","Leave balance tracking","Compliance report generation"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-white/70 text-sm">
                  <CheckCircle2 size={16} style={{ color: "#60a5fa" }} />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white text-lg justify-center" style={{ background: "linear-gradient(135deg,#1d4ed8,#60a5fa)" }}>
                Start free <ArrowRight size={18} />
              </Link>
              <div className="inline-flex items-center gap-2 px-5 py-4 text-white/50 text-sm">
                From <strong className="text-white">KES 2,750/mo</strong>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 p-6 space-y-4" style={{ background: "#0a150a" }}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/50 text-xs font-mono">Payroll run · August 2026</span>
              <span className="font-bold text-sm" style={{ color: "#60a5fa" }}>24 employees</span>
            </div>
            <div className="space-y-2">
              {[
                { name: "Jane Muthoni", role: "Sales Manager", gross: "KES 120,000", net: "KES 87,420" },
                { name: "David Omondi", role: "Engineer", gross: "KES 95,000", net: "KES 69,150" },
                { name: "Amina Wanjiru", role: "Designer", gross: "KES 80,000", net: "KES 58,320" },
              ].map((emp) => (
                <div key={emp.name} className="flex items-center justify-between px-4 py-3 rounded-xl border border-white/5" style={{ background: "#0d1a0d" }}>
                  <div>
                    <p className="text-white text-sm font-medium">{emp.name}</p>
                    <p className="text-white/30 text-xs">{emp.role}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/50 text-xs">{emp.gross} gross</p>
                    <p className="font-bold text-sm" style={{ color: "#60a5fa" }}>{emp.net} net</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-white/5 flex justify-between text-xs">
              <span className="text-white/40">Total payout:</span>
              <span className="font-bold text-white">KES 2,156,800</span>
            </div>
            <div className="flex gap-2">
              {[["NSSF ✓", "#31cb00"], ["NHIF ✓", "#31cb00"], ["PAYE ✓", "#31cb00"]].map(([label, color]) => (
                <span key={label} className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ color, background: `${color}22` }}>{label}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6" style={{ background: "#0a150a" }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Everything your HR team needs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <TiltCard key={f.title} className="rounded-2xl border border-white/10 p-8" style={{ background: "#0d1a0d" } as React.CSSProperties}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: "rgba(96,165,250,0.15)" }}>
                  <f.icon size={22} style={{ color: "#60a5fa" }} />
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
