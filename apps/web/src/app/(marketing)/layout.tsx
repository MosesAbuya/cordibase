import Link from "next/link";
import Navbar from "@/components/marketing/Navbar";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen text-black dark:text-black dark:text-white font-sans bg-[#f7f9f7] dark:bg-[#081008] transition-colors duration-300 relative">
      
      {/* Global Background Grid Lines - Runs top to bottom unbroken */}
      <div className="fixed inset-0 pointer-events-none flex justify-center z-0">
         <div className="w-full max-w-[1200px] h-full border-x border-black/5 dark:border-black/5 dark:border-white/15 transition-colors duration-300" />
      </div>

      <Navbar />

      <main className="relative z-10 flex flex-col min-h-screen">
        {children}
      </main>
      
      <footer className="relative z-10 border-t border-black/5 dark:border-black/5 dark:border-white/15 bg-white dark:bg-[#050a05] transition-colors duration-300">
        <div className="max-w-[1200px] mx-auto px-6 sm:px-10 py-16">
          <div className="flex flex-col md:flex-row gap-12 justify-between mb-12">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-4">
                <span className="font-space font-bold text-2xl tracking-tighter text-black dark:text-white">Cor<span className="text-lime_green">dib</span>ase</span>
              </div>
              <p className="text-black/50 dark:text-black dark:text-white/40 text-sm leading-relaxed">The operating system for modern growing teams. CRM, Accounting, HR in one living platform.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
              {([
                ["Product",[["Features","/features"],["Pricing","/pricing"],["Changelog","/changelog"],["Roadmap","/roadmap"]]],
                ["Modules",[["CRM","/modules/crm"],["Accounting","/modules/accounting"],["HRM","/modules/hrm"],["Emailing","/modules/emailing"]]],
                ["Company",[["About","/about"],["Blog","/blog"],["Customers","/customers"],["Contact","/contact"]]],
                ["Legal",[["Privacy","/privacy"],["Terms","/terms"],["Security","/security"]]],
              ] as [string,[string,string][]][]).map(([heading, links]) => (
                <div key={heading}>
                  <h6 className="text-black/70 dark:text-black dark:text-white/70 font-semibold mb-4 uppercase tracking-wider text-xs">{heading}</h6>
                  <ul className="space-y-3 text-black/50 dark:text-black dark:text-white/40">
                    {links.map(([label, href]) => (
                      <li key={href}><Link href={href} className="hover:text-lime_green transition-colors">{label}</Link></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
          <div className="pt-8 border-t border-black/5 dark:border-white/15 flex flex-col md:flex-row justify-between gap-4 text-black/50 dark:text-black dark:text-white/40 text-xs">
            <p>2025 Cordibase. All rights reserved.</p>
            <p>Crafted for growing businesses.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
