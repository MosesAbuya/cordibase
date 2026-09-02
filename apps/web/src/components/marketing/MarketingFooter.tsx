import Link from "next/link";
import { Building2 } from "lucide-react";

export function MarketingFooter() {
  return (
    <footer className="bg-espresso border-t border-ink/10 pt-20 pb-8 text-linen/70">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        {/* Brand */}
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-8 h-8 rounded-full bg-thread flex items-center justify-center shadow-resting">
              <div className="w-3 h-3 rounded-full bg-cardsurface"></div>
            </div>
            <span className="text-2xl font-display font-medium text-linen">Cordibase</span>
          </div>
          <p className="text-base leading-relaxed">
            The relationship board for modern business. Everything you need to manage customers, money, and teams in one place.
          </p>
        </div>

        {/* Modules */}
        <div>
          <h3 className="text-linen font-medium text-lg mb-6">Modules</h3>
          <ul className="space-y-4 text-base">
            <li><Link href="/modules/crm" className="hover:text-thread transition-colors">CRM</Link></li>
            <li><Link href="/modules/accounting" className="hover:text-thread transition-colors">Accounting</Link></li>
            <li><Link href="/modules/hrm" className="hover:text-thread transition-colors">HRM</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="text-linen font-medium text-lg mb-6">Company</h3>
          <ul className="space-y-4 text-base">
            <li><Link href="/pricing" className="hover:text-thread transition-colors">Pricing</Link></li>
            <li><Link href="/about" className="hover:text-thread transition-colors">About Us</Link></li>
            <li><Link href="/careers" className="hover:text-thread transition-colors">Careers</Link></li>
            <li><Link href="/contact" className="hover:text-thread transition-colors">Contact</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="text-linen font-medium text-lg mb-6">Legal</h3>
          <ul className="space-y-4 text-base">
            <li><Link href="/privacy" className="hover:text-thread transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-thread transition-colors">Terms of Service</Link></li>
            <li><Link href="/cookies" className="hover:text-thread transition-colors">Cookie Policy</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 border-t border-linen/10 pt-8 flex flex-col md:flex-row items-center justify-between text-sm">
        <p>© 2026 Cordibase Inc. All rights reserved.</p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <Link href="#" className="hover:text-thread transition-colors">Twitter</Link>
          <Link href="#" className="hover:text-thread transition-colors">GitHub</Link>
          <Link href="#" className="hover:text-thread transition-colors">LinkedIn</Link>
        </div>
      </div>
    </footer>
  );
}
