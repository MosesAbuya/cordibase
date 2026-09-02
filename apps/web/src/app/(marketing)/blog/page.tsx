import Link from "next/link";
import { ArrowRight } from "lucide-react";

const posts = [
  { slug: "#", title: "How to reconcile M-PESA payments automatically in 2025", excerpt: "Step-by-step guide to connecting your Paybill to Cordibase and eliminating manual reconciliation forever.", date: "Aug 28, 2026", tag: "Guide", readTime: "8 min", featured: true, author: "Moses K.", authorInitials: "MK" },
  { slug: "#", title: "KRA compliance for SMEs: What you need to know", excerpt: "A practical checklist for Kenyan small businesses to stay KRA-compliant without an accountant.", date: "Aug 15, 2026", tag: "Compliance", readTime: "6 min", author: "Aisha M.", authorInitials: "AM" },
  { slug: "#", title: "CRM vs Spreadsheets: The real cost of staying in Excel", excerpt: "We analyzed 50 SMEs and found the average Excel-based CRM costs 14 hours of lost productivity per week.", date: "Aug 5, 2026", tag: "Research", readTime: "10 min", author: "David O.", authorInitials: "DO" },
  { slug: "#", title: "Introducing automated payroll for Kenyan businesses", excerpt: "Announcing NSSF, NHIF, and PAYE auto-calculation — run your monthly payroll in under 5 minutes.", date: "Jul 22, 2026", tag: "Product", readTime: "4 min", author: "Moses K.", authorInitials: "MK" },
  { slug: "#", title: "5 ways to improve your sales pipeline velocity", excerpt: "Data-driven tactics from 300+ Cordibase teams on how to move deals faster without more salespeople.", date: "Jul 10, 2026", tag: "Sales", readTime: "7 min", author: "Fatuma S.", authorInitials: "FS" },
  { slug: "#", title: "How BuildCo reduced late payments by 72% with Cordibase", excerpt: "A case study on automated payment reminders and M-PESA integration in the construction industry.", date: "Jun 28, 2026", tag: "Case Study", readTime: "5 min", author: "Aisha M.", authorInitials: "AM" },
];

const tagColors: Record<string, string> = {
  Guide: "#31cb00", Compliance: "#f59e0b", Research: "#60a5fa",
  Product: "#a78bfa", Sales: "#fb7185", "Case Study": "#34d399"
};

export default function BlogPage() {
  const [featured, ...rest] = posts;
  return (
    <>
      <section className="pt-32 pb-20 px-6" style={{ background: "#0d1a0d" }}>
        <div className="max-w-7xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#31cb00" }}>Blog</p>
          <h1 className="text-5xl font-bold text-white mb-12">Insights for growing businesses</h1>

          {/* Featured post */}
          <Link href={featured.slug} className="block rounded-2xl border border-white/10 overflow-hidden mb-12 hover:border-white/20 transition-all group" style={{ background: "#0a150a" }}>
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: `${tagColors[featured.tag]}22`, color: tagColors[featured.tag] }}>{featured.tag}</span>
                  <span className="text-white/30 text-xs">{featured.readTime} read</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors leading-tight">{featured.title}</h2>
                <p className="text-white/50 mb-6 leading-relaxed">{featured.excerpt}</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "linear-gradient(135deg,#119822,#31cb00)" }}>{featured.authorInitials}</div>
                  <div>
                    <p className="text-white/70 text-sm font-medium">{featured.author}</p>
                    <p className="text-white/30 text-xs">{featured.date}</p>
                  </div>
                </div>
              </div>
              <div className="h-64 md:h-auto flex items-center justify-center" style={{ background: "linear-gradient(135deg,#0d1a0d,#1e441e)" }}>
                <div className="text-6xl font-black" style={{ color: "rgba(49,203,0,0.15)" }}>M-PESA</div>
              </div>
            </div>
          </Link>

          {/* Post grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((post) => (
              <Link key={post.slug + post.title} href={post.slug} className="rounded-2xl border border-white/10 p-6 hover:border-white/20 transition-all group block" style={{ background: "#0a150a" }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold px-3 py-1 rounded-full" style={{ background: `${tagColors[post.tag]}22`, color: tagColors[post.tag] }}>{post.tag}</span>
                  <span className="text-white/30 text-xs">{post.readTime} read</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-3 group-hover:text-green-400 transition-colors leading-snug">{post.title}</h3>
                <p className="text-white/40 text-sm mb-6 leading-relaxed line-clamp-2">{post.excerpt}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "linear-gradient(135deg,#119822,#31cb00)" }}>{post.authorInitials}</div>
                    <span className="text-white/40 text-xs">{post.date}</span>
                  </div>
                  <ArrowRight size={16} className="text-white/20 group-hover:text-green-400 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
