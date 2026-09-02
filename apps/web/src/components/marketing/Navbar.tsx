"use client";
import Link from "next/link";
import { ChevronDown, LayoutGrid, Users, FileText, BarChart, Settings, Mail } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Navbar() {
  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 w-full max-w-5xl z-50 px-6">
      <nav className="glass-panel bg-white/70 dark:bg-black/40 backdrop-blur-xl border border-black/5 dark:border-white/10 rounded-2xl px-6 h-16 flex items-center justify-between shadow-2xl transition-colors duration-300">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="font-space font-bold text-2xl tracking-tighter text-black dark:text-white">Cor<span className="text-lime_green">dib</span>ase</span>
        </Link>

        {/* Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-black/70 dark:text-white/80">
          <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Home</Link>
          
          {/* Mega Menu: Products */}
          <div className="relative group h-16 flex items-center">
            <button className="flex items-center gap-1 hover:text-black dark:hover:text-white transition-colors">
              Products <ChevronDown className="w-4 h-4 opacity-50 group-hover:rotate-180 transition-transform" />
            </button>
            <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[500px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 pt-2">
              <div className="glass-panel bg-white/70 dark:bg-[#081008]/95 backdrop-blur-2xl border border-black/5 dark:border-white/10 rounded-2xl p-4 shadow-2xl grid grid-cols-2 gap-2 transition-colors duration-300">
                <Link href="/modules/crm" className="flex items-start gap-3 p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <Users className="w-5 h-5 text-lime_green mt-0.5" />
                  <div><div className="text-black dark:text-white font-medium mb-1">CRM</div><div className="text-black/50 dark:text-white/50 text-xs">Manage clients & deals</div></div>
                </Link>
                <Link href="/modules/accounting" className="flex items-start gap-3 p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <FileText className="w-5 h-5 text-lime_green mt-0.5" />
                  <div><div className="text-black dark:text-white font-medium mb-1">Accounting</div><div className="text-black/50 dark:text-white/50 text-xs">Invoices & reports</div></div>
                </Link>
                <Link href="/modules/hrm" className="flex items-start gap-3 p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <LayoutGrid className="w-5 h-5 text-lime_green mt-0.5" />
                  <div><div className="text-black dark:text-white font-medium mb-1">HRM</div><div className="text-black/50 dark:text-white/50 text-xs">Payroll & employees</div></div>
                </Link>
                <Link href="/modules/emailing" className="flex items-start gap-3 p-3 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                  <Mail className="w-5 h-5 text-lime_green mt-0.5" />
                  <div><div className="text-black dark:text-white font-medium mb-1">Emailing</div><div className="text-black/50 dark:text-white/50 text-xs">Campaigns & automation</div></div>
                </Link>
              </div>
            </div>
          </div>

          <Link href="/pricing" className="hover:text-black dark:hover:text-white transition-colors">Pricing</Link>
          <Link href="/about" className="hover:text-black dark:hover:text-white transition-colors">About</Link>
        </div>

        {/* CTA & Theme */}
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/register" className="inline-flex items-center justify-center px-5 py-2 bg-gradient-to-b from-lime_green to-[#26a300] text-evergreen font-bold text-sm rounded-lg hover:brightness-110 transition-all shadow-[0_0_15px_rgba(49,203,0,0.3)]">
            Start Free
          </Link>
        </div>
      </nav>
    </div>
  );
}
