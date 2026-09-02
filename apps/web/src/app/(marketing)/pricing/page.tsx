import Link from "next/link";
import { Check } from "lucide-react";
import BlurText from "@/components/marketing/BlurText";
import { db } from "@/lib/db";
import { platformSchema } from "@cordibase/shared-db";
import ElectricBorder from "@/components/marketing/ElectricBorder";

export default async function PricingPage() {
  const packages = await db.select().from(platformSchema.pricingPackage).orderBy(platformSchema.pricingPackage.order);

  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-24 px-6 border-b border-black/5 dark:border-white/15 relative overflow-hidden transition-colors duration-300">
        <div className="absolute inset-0 pointer-events-none opacity-20">
           <div className="absolute top-0 right-1/4 w-96 h-96 bg-lime_green rounded-full blur-[120px]" />
           <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-forest_green rounded-full blur-[120px]" />
        </div>
        <div className="max-w-[1200px] mx-auto text-center relative z-10">
          <p className="text-sm font-semibold uppercase tracking-widest mb-4 text-lime_green">Plans & Pricing</p>
          <h1 className="font-bold text-slate-900 dark:text-white leading-[1.1] mb-6 text-5xl md:text-7xl transition-colors duration-300">
            <BlurText text="Scale without limits." className="inline-block" />
          </h1>
          <p className="text-slate-500 dark:text-white/50 text-xl max-w-2xl mx-auto leading-relaxed transition-colors duration-300">
            Simple, transparent pricing. Start for free, upgrade when you need more power.
          </p>
        </div>
      </section>

      {/* Pricing Cards (Staggered Theme) */}
      <section className="py-24 px-6 border-b border-black/5 dark:border-white/15 relative bg-slate-50 dark:bg-transparent transition-colors duration-300">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex flex-col lg:flex-row justify-center gap-6 lg:gap-8 items-end lg:h-[550px]">
            {packages.map((pkg, idx) => {
               const isPopular = pkg.isPopular;
               const delay = idx * 100;
               return (
                  <div key={pkg.id} className={`w-full lg:w-1/3 relative transition-all duration-500 hover:-translate-y-4`} style={{ animationDelay: `${delay}ms` }}>
                    {/* The staggered floating header tab */}
                    <div className={`absolute -top-8 left-1/2 -translate-x-1/2 w-[85%] py-3 rounded-xl z-20 text-center font-bold tracking-widest uppercase shadow-xl border border-white/10 backdrop-blur-md transform -skew-x-6 ${isPopular ? 'bg-white text-lime_green' : 'bg-lime_green text-evergreen'}`}>
                       <span className="block transform skew-x-6">{pkg.name}</span>
                    </div>

                    {/* Card Body */}
                    <div className={`pt-12 pb-8 px-8 rounded-3xl h-full border ${isPopular ? 'bg-gradient-to-b from-forest_green to-[#122812] border-lime_green/50 text-white min-h-[500px]' : 'bg-white dark:bg-black/60 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white min-h-[460px]'} shadow-2xl transition-colors duration-300 flex flex-col items-center text-center`}>
                       
                       <p className={`text-sm mb-4 ${isPopular ? 'text-white/80' : 'text-slate-500 dark:text-white/50'}`}>
                         {pkg.description || "Perfect for your business."}
                       </p>

                       <div className="flex items-start justify-center mb-8">
                         <span className="text-2xl font-medium mt-2">$</span>
                         <span className="text-6xl font-black">{pkg.price}</span>
                         <span className={`text-sm font-medium mt-auto mb-2 ml-1 ${isPopular ? 'text-white/60' : 'text-slate-400 dark:text-white/40'}`}>/mo</span>
                       </div>

                       <div className="w-full flex-1 mb-8 text-sm">
                         <p className={`mb-4 ${isPopular ? 'text-white' : 'text-slate-600 dark:text-white/70'} leading-relaxed text-left`}>
                           Includes these features:
                         </p>
                         <ul className="space-y-4 text-left">
                           {Array.isArray(pkg.features) && pkg.features.map((feat: any, i: number) => (
                             <li key={i} className="flex items-center gap-3">
                               <Check className={`w-4 h-4 shrink-0 ${isPopular ? 'text-lime_green' : 'text-lime_green'}`} />
                               <span className={isPopular ? 'text-white/90' : 'text-slate-700 dark:text-white/70'}>{String(feat)}</span>
                             </li>
                           ))}
                         </ul>
                       </div>

                       <Link href="/register" className={`w-full py-4 rounded-full font-bold uppercase tracking-widest text-sm transition-all ${isPopular ? 'bg-white text-evergreen hover:bg-slate-100 shadow-[0_0_20px_rgba(255,255,255,0.3)]' : 'bg-lime_green text-evergreen hover:bg-lime_green/90 shadow-[0_4px_14px_rgba(49,203,0,0.3)]'}`}>
                          Select
                       </Link>
                    </div>
                  </div>
               );
            })}
          </div>
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="py-24 px-6 text-center bg-slate-900 dark:bg-[#040704] relative overflow-hidden transition-colors duration-300">
        <div className="max-w-[1200px] mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6">Need something custom?</h2>
          <p className="text-white/50 text-xl leading-relaxed max-w-2xl mx-auto mb-10">
            For organizations with specialized security, scale, or compliance needs, we offer custom enterprise plans.
          </p>
          <Link href="/contact" className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold text-lg rounded-full hover:bg-white/20 transition-colors">
            Contact Sales
          </Link>
        </div>
      </section>
    </>
  );
}
