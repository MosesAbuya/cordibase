import { db } from "./src/lib/db";
import { platformSchema } from "@cordibase/shared-db";

async function seed() {
  console.log("Seeding pricing packages...");
  // Clear existing first
  

  await db.insert(platformSchema.pricingPackage).values([
    {
      id: "starter",
      name: "Starter",
      description: "Perfect for small teams starting out.",
      price: 0,
      interval: "month",
      features: [
        "2 Team Members",
        "Basic CRM",
        "Community Support",
      ],
      isPopular: false,
      order: 1,
    },
    {
      id: "professional",
      name: "Professional",
      description: "For growing businesses needing power.",
      price: 49,
      interval: "month",
      features: [
        "Up to 10 Team Members",
        "Advanced CRM & Accounting",
        "Priority Email Support",
        "Custom Automations",
      ],
      isPopular: true,
      order: 2,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For large scale organizations.",
      price: 199,
      interval: "month",
      features: [
        "Unlimited Members",
        "All Modules Unlocked",
        "24/7 Phone Support",
        "Dedicated Success Manager",
      ],
      isPopular: false,
      order: 3,
    },
  ]);
  console.log("Done.");
}

seed().catch(console.error);
