import Link from "next/link";
import { CheckCircle2, Info } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="pt-32 pb-24 bg-linen">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h1 className="text-5xl md:text-6xl font-display text-ink tracking-tight mb-6">Simple, transparent <span className="italic">pricing</span>.</h1>
          <p className="text-xl text-ink/70 leading-relaxed">
            No per-user fees. No hidden costs. Pay a flat monthly rate for the modules your business actually uses.
          </p>
        </div>

        {/* Bundle Banner */}
        <div className="bg-thread/5 border border-thread/20 rounded-[18px] p-8 mb-16 max-w-3xl mx-auto flex flex-col md:flex-row items-start gap-6 shadow-resting">
          <div className="w-12 h-12 rounded-full bg-thread/10 flex items-center justify-center shrink-0">
            <Info className="text-thread" size={24} />
          </div>
          <div>
            <h4 className="text-xl font-display text-ink mb-2">The Complete OS Bundle</h4>
            <p className="text-ink/70 leading-relaxed">
              Subscribe to all three modules (CRM, Accounting, HRM) and save 15% automatically on your monthly bill. Unlock the full power of cross-module synchronization.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {/* CRM Card */}
          <div className="bg-cardsurface border border-ink/5 rounded-[18px] flex flex-col overflow-hidden shadow-resting card-3d">
            <div className="p-8 border-b border-ink/5">
              <h3 className="text-2xl font-display text-ink mb-2">CRM</h3>
              <p className="text-ink/60 text-sm mb-6">Manage contacts and sales pipelines.</p>
              <div className="flex items-end gap-1 mb-8">
                <span className="text-4xl font-mono font-bold text-ink">$20</span>
                <span className="text-ink/50 mb-1">/mo</span>
              </div>
              <Link href="/register" className="block w-full py-3 bg-transparent hover:bg-ink/5 text-ink font-medium rounded-full text-center border border-ink transition-colors">
                Start Free Trial
              </Link>
            </div>
            <div className="p-8 flex-1 bg-cardsurface">
              <ul className="space-y-4">
                <li className="flex items-start gap-4 text-ink/80"><CheckCircle2 className="text-thread shrink-0" size={20} /> <span>Unlimited Contacts</span></li>
                <li className="flex items-start gap-4 text-ink/80"><CheckCircle2 className="text-thread shrink-0" size={20} /> <span>Custom Deal Stages</span></li>
                <li className="flex items-start gap-4 text-ink/80"><CheckCircle2 className="text-thread shrink-0" size={20} /> <span>Sales Forecasting</span></li>
                <li className="flex items-start gap-4 text-ink/80"><CheckCircle2 className="text-thread shrink-0" size={20} /> <span>Accounting Integration</span></li>
              </ul>
            </div>
          </div>

          {/* Accounting Card */}
          <div className="bg-cardsurface border border-marigold/30 rounded-[18px] flex flex-col overflow-hidden relative shadow-hover card-3d z-10 transform md:-translate-y-4">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-marigold text-ink text-xs font-bold uppercase tracking-wider py-1 px-4 rounded-b-lg">
              Most Popular
            </div>
            <div className="p-8 border-b border-ink/5 mt-4">
              <h3 className="text-2xl font-display text-ink mb-2">Accounting</h3>
              <p className="text-ink/60 text-sm mb-6">Invoices, expenses, and ledgers.</p>
              <div className="flex items-end gap-1 mb-8">
                <span className="text-4xl font-mono font-bold text-ink">$30</span>
                <span className="text-ink/50 mb-1">/mo</span>
              </div>
              <Link href="/register" className="block w-full py-3 bg-thread hover:bg-thread-dark text-cardsurface font-medium rounded-full text-center transition-colors shadow-resting hover:shadow-hover hover:-translate-y-[2px]">
                Start Free Trial
              </Link>
            </div>
            <div className="p-8 flex-1 bg-cardsurface">
              <ul className="space-y-4">
                <li className="flex items-start gap-4 text-ink/80"><CheckCircle2 className="text-marigold shrink-0" size={20} /> <span>Professional Invoices</span></li>
                <li className="flex items-start gap-4 text-ink/80"><CheckCircle2 className="text-marigold shrink-0" size={20} /> <span>Expense Tracking</span></li>
                <li className="flex items-start gap-4 text-ink/80"><CheckCircle2 className="text-marigold shrink-0" size={20} /> <span>Double-entry Ledger</span></li>
                <li className="flex items-start gap-4 text-ink/80"><CheckCircle2 className="text-marigold shrink-0" size={20} /> <span>CRM & HRM Integration</span></li>
              </ul>
            </div>
          </div>

          {/* HRM Card */}
          <div className="bg-cardsurface border border-ink/5 rounded-[18px] flex flex-col overflow-hidden shadow-resting card-3d">
            <div className="p-8 border-b border-ink/5">
              <h3 className="text-2xl font-display text-ink mb-2">HRM</h3>
              <p className="text-ink/60 text-sm mb-6">Employees, payroll, and leave.</p>
              <div className="flex items-end gap-1 mb-8">
                <span className="text-4xl font-mono font-bold text-ink">$25</span>
                <span className="text-ink/50 mb-1">/mo</span>
              </div>
              <Link href="/register" className="block w-full py-3 bg-transparent hover:bg-ink/5 text-ink font-medium rounded-full text-center border border-ink transition-colors">
                Start Free Trial
              </Link>
            </div>
            <div className="p-8 flex-1 bg-cardsurface">
              <ul className="space-y-4">
                <li className="flex items-start gap-4 text-ink/80"><CheckCircle2 className="text-moss shrink-0" size={20} /> <span>Employee Directory</span></li>
                <li className="flex items-start gap-4 text-ink/80"><CheckCircle2 className="text-moss shrink-0" size={20} /> <span>Payroll Generation</span></li>
                <li className="flex items-start gap-4 text-ink/80"><CheckCircle2 className="text-moss shrink-0" size={20} /> <span>Leave Management</span></li>
                <li className="flex items-start gap-4 text-ink/80"><CheckCircle2 className="text-moss shrink-0" size={20} /> <span>Accounting Integration</span></li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-display text-ink mb-10 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-cardsurface p-8 rounded-[18px] border border-ink/5 shadow-resting">
              <h4 className="text-xl font-display text-ink mb-3">Are there per-user fees?</h4>
              <p className="text-ink/70 leading-relaxed">No. Our pricing is a flat monthly rate per module. You can add as many team members as you need without your bill increasing.</p>
            </div>
            <div className="bg-cardsurface p-8 rounded-[18px] border border-ink/5 shadow-resting">
              <h4 className="text-xl font-display text-ink mb-3">Can I cancel at any time?</h4>
              <p className="text-ink/70 leading-relaxed">Yes, subscriptions are month-to-month. You can cancel any module at any time from your billing dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
