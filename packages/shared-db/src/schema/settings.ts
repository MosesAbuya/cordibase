import { pgTable, text, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { organization } from "./auth";

export const workspaceSettings = pgTable("workspace_settings", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  
  // SMTP Settings
  smtpHost: text("smtp_host"),
  smtpPort: integer("smtp_port").default(465),
  smtpUser: text("smtp_user"),
  smtpPassword: text("smtp_password"),
  smtpFromEmail: text("smtp_from_email"),
  
  // KYC Onboarding Fields
  orgType: text("org_type"),
  companySize: text("company_size"),
  industry: text("industry"),
  description: text("description"),
  registrationNumber: text("registration_number"),
  address: text("address"),
  poBox: text("po_box"),
  city: text("city"),
  country: text("country"),
  contactPhone: text("contact_phone"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
