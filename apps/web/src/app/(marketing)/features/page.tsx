"use client";

import TiltCard from "@/components/marketing/TiltCard";
import BlurText from "@/components/marketing/BlurText";
import { Users, DollarSign, Shield, Zap, Globe, Mail, BarChart2, Lock, RefreshCw, Phone, FileText, Bell } from "lucide-react";

const features = [
  { icon: Users, title: "Contact Management", desc: "Full contact profiles with activity history, notes, tags, and custom fields. Import from CSV or sync with your email.", color: "#31cb00" },
  { icon: BarChart2, title: "Sales Pipeline", desc: "Kanban-style deal boards with custom stages, probability scoring, and forecasting. Drag to advance, click to deep-dive.", color: "#31cb00" },
  { icon: Zap, title: "Automation Flows", desc: "Build triggers: deal won → send invoice, contact idle 7 days → send follow-up. Visual no-code flow builder.", color: "#31cb00" },
  { icon: DollarSign, title: "Invoicing & Quotes", desc: "Professional KRA-compliant invoices with e-signature. Convert quotes to invoices in one click.", color: "#f59e0b" },
  { icon: RefreshCw, title: "M-PESA Reconciliation", desc: "Connect Paybill or Till number. Transactions auto-match to invoices. Export to KRA-ready format.", color: "#f59e0b" },
  { icon: FileText, title: "Financial Reports", desc: "P&L, balance sheet, cash flow — all real-time. Filter by period, client, or project. Export to Excel or PDF.", color: "#f59e0b" },
  { icon: Shield, title: "Employee Directory", desc: "Searchable employee profiles with job history, documents, and emergency contacts. Role-based access control.", color: "#60a5fa" },
  { icon: Bell, title: "Leave Management", desc: "Employees apply via self-service portal. Managers approve in one tap. Balances update automatically.", color: "#60a5fa" },
  { icon: Phone, title: "Payroll Processing", desc: "Run payroll in minutes. Auto-calculates NSSF, NHIF, PAYE. Direct bank transfers or M-PESA payment.", color: "#60a5fa" },
  { icon: Mail, title: "Email Campaigns", desc: "Send branded campaigns to contact segments. Track opens, clicks, and replies. A/B test subject lines.", color: "#a78bfa" },
  { icon: Globe, title: "Multi-currency", desc: "Invoice in USD, EUR, GBP. Auto-convert to KES at live rates. M-PESA and bank payments accepted.", color: "#a78bfa" },
  { icon: Lock, title: "Enterprise Security", desc: "SOC 2 compliant. End-to-end encryption. 2FA. Role-based permissions. Audit logs. Data stored in Kenya.", color: "#a78bfa" },
];

export default function FeaturesPage() {
  return (
    <>
      <section className="pt-32 pb-20 px-6 text-center" style={{ background: "#0d1a0d" }}>
        <div className="max-w-3xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#31cb00" }}>Platform features</p>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            <BlurText text="Everything your business needs." className="text-5xl md:text-7xl font-bold text-white leading-tight" />
          </h1>
          <p className="text-white/50 text-xl leading-relaxed">
            12 core features across CRM, Accounting, and HR — built to work together seamlessly.
          </p>
        </div>
      </section>

      <section className="py-24 px-6" style={{ background: "#0a150a" }}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <TiltCard key={f.title} className="rounded-2xl border border-white/10 p-8 h-full" style={{ background: "#0d1a0d" } as React.CSSProperties}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: `${f.color}22` }}>
                  <f.icon size={22} style={{ color: f.color }} />
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
