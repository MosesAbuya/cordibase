import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-white font-sans bg-[#081008] flex flex-col">
      
      {/* ── HEADER / NAVBAR ── */}
      <header className="border-b border-white/15 relative z-50 bg-[#081008]">
        <div className="max-w-7xl mx-auto border-x border-white/15 px-6 sm:px-10 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black" style={{ background:"linear-gradient(135deg,#119822,#31cb00)" }}>C</div>
            <span className="font-bold text-white text-xl tracking-tight">Cordibase</span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/features" className="hover:text-white transition-colors">Features</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </nav>

          {/* CTA */}
          <div className="flex items-center">
            <Link href="/register" className="inline-flex items-center justify-center px-5 py-2.5 bg-gradient-to-b from-lime_green to-[#26a300] text-evergreen font-bold text-sm rounded-lg hover:brightness-110 transition-all shadow-[0_0_15px_rgba(49,203,0,0.3)]">
              Start Free
            </Link>
          </div>
          
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      
      {/* ── FOOTER ── */}
      <footer className="border-t border-white/15 relative bg-[#050a05]">
        <div className="max-w-7xl mx-auto border-x border-white/15 px-6 sm:px-10 py-16">
          <div className="flex flex-col md:flex-row gap-12 justify-between mb-12">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black" style={{ background:"linear-gradient(135deg,#119822,#31cb00)" }}>C</div>
                <span className="font-bold text-white text-xl">Cordibase</span>
              </div>
              <p className="text-white/40 text-sm leading-relaxed">The operating system for modern growing teams. CRM, Accounting, HR in one living platform.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
              {([
                ["Product",[["Features","/features"],["Pricing","/pricing"],["Changelog","/changelog"],["Roadmap","/roadmap"]]],
                ["Modules",[["CRM","/modules/crm"],["Accounting","/modules/accounting"],["HRM","/modules/hrm"],["Emailing","/modules/emailing"]]],
                ["Company",[["About","/about"],["Blog","/blog"],["Customers","/customers"],["Contact","/contact"]]],
                ["Legal",[["Privacy","/privacy"],["Terms","/terms"],["Security","/security"]]],
              ] as [string,[string,string][]][]).map(([heading, links]) => (
                <div key={heading}>
                  <h6 className="text-white/70 font-semibold mb-4 uppercase tracking-wider text-xs">{heading}</h6>
                  <ul className="space-y-3 text-white/40">
                    {links.map(([label, href]) => (
                      <li key={href}><Link href={href} className="hover:text-lime_green transition-colors">{label}</Link></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-8 border-t border-white/15 flex flex-col md:flex-row justify-between gap-4 text-white/40 text-xs">
            <p>2025 Cordibase. All rights reserved.</p>
            <p>Crafted for growing businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
