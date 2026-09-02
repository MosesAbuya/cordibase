"use client";

import TiltCard from "@/components/marketing/TiltCard";
import BlurText from "@/components/marketing/BlurText";
import { DollarSign, RefreshCw, FileText, BarChart2, Globe, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const features = [
  { icon: DollarSign, title: "Professional invoicing", desc: "Create KRA-compliant invoices in seconds. E-signature, custom branding, payment links embedded." },
  { icon: RefreshCw, title: "M-PESA reconciliation", desc: "Connect your Paybill or Till number. Transactions auto-match to invoices. Export to KRA-ready format." },
  { icon: FileText, title: "Expense tracking", desc: "Capture receipts via mobile, categorize automatically, and get instant reports by project or department." },
  { icon: BarChart2, title: "Financial reports", desc: "Real-time P&L, balance sheet, cash flow. Filter by period, client, or currency. Export to Excel or PDF." },
  { icon: Globe, title: "Multi-currency", desc: "Invoice in USD, GBP, EUR. Auto-convert to KES at live rates. M-PESA and bank payments both accepted." },
  { icon: DollarSign, title: "Quote to invoice", desc: "Send a quote, customer approves with one click, it becomes an invoice. No manual duplication." },
];

export default function AccountingModulePage() {
  return (
    <>
      <section className="pt-32 pb-24 px-6" style={{ background: "#0d1a0d" }}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border" style={{ background: "rgba(245,158,11,0.1)", borderColor: "rgba(245,158,11,0.3)", color: "#f59e0b" }}>
              <DollarSign size={12} /> Accounting Module
            </div>
            <h1 className="font-bold text-white mb-6 leading-tight">
              <BlurText text="Accounting built for Kenya." className="text-4xl md:text-6xl font-bold text-white leading-tight" />
            </h1>
            <p className="text-white/50 text-xl leading-relaxed mb-8">
              M-PESA reconciliation, KRA compliance, professional invoicing, and real-time financial reports — all in one platform. No accountant needed for day-to-day ops.
            </p>
            <ul className="space-y-3 mb-10">
              {["M-PESA Paybill & Till auto-reconciliation","KRA VAT & ETR compliance","Multi-currency invoicing","Automated payment reminders","One-click financial reports"].map((item) => (
                <li key={item} className="flex items-center gap-3 text-white/70 text-sm">
                  <CheckCircle2 size={16} style={{ color: "#f59e0b" }} />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white text-lg justify-center" style={{ background: "linear-gradient(135deg,#b45309,#f59e0b)" }}>
                Start free <ArrowRight size={18} />
              </Link>
              <div className="inline-flex items-center gap-2 px-5 py-4 text-white/50 text-sm">
                From <strong className="text-white">KES 3,300/mo</strong>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 p-6 space-y-4" style={{ background: "#0a150a" }}>
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/50 text-xs font-mono">August 2026 · Cash flow</span>
              <span className="font-bold text-sm" style={{ color: "#f59e0b" }}>KES +1.24M</span>
            </div>
            <div className="space-y-3">
              {[
                { label: "Revenue", amount: "KES 3,840,000", color: "#31cb00", positive: true },
                { label: "Expenses", amount: "KES 2,600,000", color: "#fb7185", positive: false },
                { label: "Net profit", amount: "KES 1,240,000", color: "#f59e0b", positive: true },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center px-4 py-3 rounded-xl" style={{ background: "#0d1a0d" }}>
                  <span className="text-white/60 text-sm">{row.label}</span>
                  <span className="font-bold text-sm" style={{ color: row.color }}>{row.amount}</span>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-white/5">
              <p className="text-white/30 text-xs mb-3">M-PESA reconciled this month</p>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                  <div className="h-full rounded-full" style={{ width: "94%", background: "linear-gradient(to right,#119822,#31cb00)" }}></div>
                </div>
                <span className="text-white/60 text-xs font-mono shrink-0">94% matched</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 px-6" style={{ background: "#0a150a" }}>
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">Full accounting, simplified</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <TiltCard key={f.title} className="rounded-2xl border border-white/10 p-8" style={{ background: "#0d1a0d" } as React.CSSProperties}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-5" style={{ background: "rgba(245,158,11,0.15)" }}>
                  <f.icon size={22} style={{ color: "#f59e0b" }} />
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
