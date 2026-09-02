import { db } from "@/lib/db";
import { platformSchema } from "@cordibase/shared-db";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";

export default async function SuperadminPricingPage() {
  const packages = await db.select().from(platformSchema.pricingPackage).orderBy(platformSchema.pricingPackage.order);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pricing Packages</h1>
          <p className="text-slate-500 dark:text-white/50">Manage subscription plans across the platform.</p>
        </div>
        <button className="flex items-center gap-2 bg-lime_green text-evergreen px-4 py-2 rounded-lg font-medium hover:bg-lime_green/90">
          <Plus className="w-4 h-4" /> Add Package
        </button>
      </div>

      <div className="bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600 dark:text-white/70">
          <thead className="bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-medium">
            <tr>
              <th className="px-6 py-4">Name</th>
              <th className="px-6 py-4">Price</th>
              <th className="px-6 py-4">Interval</th>
              <th className="px-6 py-4">Popular</th>
              <th className="px-6 py-4">Order</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-white/10">
            {packages.map((pkg) => (
              <tr key={pkg.id} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{pkg.name}</td>
                <td className="px-6 py-4">${pkg.price}</td>
                <td className="px-6 py-4 capitalize">{pkg.interval}</td>
                <td className="px-6 py-4">
                  {pkg.isPopular ? (
                    <span className="px-2 py-1 bg-lime_green/20 text-lime_green text-xs rounded-md font-medium">Yes</span>
                  ) : (
                    <span className="text-slate-400">No</span>
                  )}
                </td>
                <td className="px-6 py-4">{pkg.order}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white"><Edit className="w-4 h-4" /></button>
                    <button className="text-slate-400 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {packages.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-500">No packages found. Seed the database.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
