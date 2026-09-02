import { Check, X, Minus } from "lucide-react";
import Link from "next/link";

const rows = [
  { feature: "M-PESA integration", cordibase: true, hubspot: false, zoho: false, salesforce: false },
  { feature: "KES-denominated pricing", cordibase: true, hubspot: false, zoho: false, salesforce: false },
  { feature: "Built-in accounting", cordibase: true, hubspot: false, zoho: true, salesforce: false },
  { feature: "Built-in HR/payroll", cordibase: true, hubspot: false, zoho: true, salesforce: false },
  { feature: "KRA compliance tools", cordibase: true, hubspot: false, zoho: false, salesforce: false },
  { feature: "No-code automation", cordibase: true, hubspot: true, zoho: true, salesforce: true },
  { feature: "CRM pipeline", cordibase: true, hubspot: true, zoho: true, salesforce: true },
  { feature: "Email campaigns", cordibase: true, hubspot: true, zoho: true, salesforce: true },
  { feature: "Africa-based data storage", cordibase: true, hubspot: false, zoho: false, salesforce: false },
  { feature: "Free trial (14 days)", cordibase: true, hubspot: true, zoho: true, salesforce: null },
  { feature: "Affordable SME pricing", cordibase: true, hubspot: null, zoho: true, salesforce: false },
  { feature: "Local customer support", cordibase: true, hubspot: false, zoho: false, salesforce: false },
];

function Cell({ val }: { val: boolean | null }) {
  if (val === true) return <Check size={18} style={{ color: "#31cb00" }} className="mx-auto" />;
  if (val === false) return <X size={18} className="mx-auto text-white/20" />;
  return <Minus size={18} className="mx-auto text-white/30" />;
}

export default function ComparisonPage() {
  return (
    <div style={{ background: "#0d1a0d", minHeight: "100vh" }}>
      <section className="pt-32 pb-16 px-6 text-center">
        <div className="max-w-2xl mx-auto">
          <p className="text-sm font-semibold uppercase tracking-widest mb-4" style={{ color: "#31cb00" }}>Comparison</p>
          <h1 className="text-5xl font-bold text-white mb-4">Why Cordibase?</h1>
          <p className="text-white/50 text-lg">Built for Africa from the ground up. See how we compare to global alternatives.</p>
        </div>
      </section>

      <section className="pb-32 px-6">
        <div className="max-w-5xl mx-auto overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-4 text-white/40 text-sm font-medium w-1/3">Feature</th>
                {[
                  { name: "Cordibase", highlight: true },
                  { name: "HubSpot", highlight: false },
                  { name: "Zoho CRM", highlight: false },
                  { name: "Salesforce", highlight: false },
                ].map((h) => (
                  <th key={h.name} className={`p-4 text-center text-sm font-bold rounded-t-xl ${h.highlight ? "text-white" : "text-white/50"}`} style={h.highlight ? { background: "rgba(17,152,34,0.15)" } : {}}>
                    {h.name}
                    {h.highlight && <div className="text-xs font-normal mt-1" style={{ color: "#31cb00" }}>← Best for Africa</div>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.feature} style={{ background: i % 2 === 0 ? "#0a150a" : "transparent" }}>
                  <td className="p-4 text-white/70 text-sm">{row.feature}</td>
                  <td className="p-4 text-center" style={{ background: "rgba(17,152,34,0.08)" }}><Cell val={row.cordibase} /></td>
                  <td className="p-4 text-center"><Cell val={row.hubspot} /></td>
                  <td className="p-4 text-center"><Cell val={row.zoho} /></td>
                  <td className="p-4 text-center"><Cell val={row.salesforce} /></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-12 text-center">
            <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-white text-lg" style={{ background: "linear-gradient(135deg,#119822,#31cb00)" }}>
              Try Cordibase free for 14 days
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
