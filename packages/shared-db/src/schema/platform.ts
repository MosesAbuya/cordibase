import { relations } from "drizzle-orm";
import { pgTable, text, timestamp, boolean, json, integer } from "drizzle-orm/pg-core";
import { user, organization } from "./auth";

export const platformAdmin = pgTable("platform_admin", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => user.id, { onDelete: "cascade" }),
  canImpersonate: boolean("can_impersonate").default(false).notNull(),
  canManageBilling: boolean("can_manage_billing").default(false).notNull(),
  canViewAllOrgs: boolean("can_view_all_orgs").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const auditLog = pgTable("audit_log", {
  id: text("id").primaryKey(),
  actorId: text("actor_id").references(() => user.id, { onDelete: "set null" }), // User who performed the action
  targetOrgId: text("target_org_id").references(() => organization.id, { onDelete: "set null" }), // Organization affected (if applicable)
  action: text("action").notNull(), // e.g. "IMPERSONATE_ORG", "EXTEND_TRIAL", "CANCEL_SUBSCRIPTION"
  metadata: json("metadata"), // Additional context
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const platformAdminRelations = relations(platformAdmin, ({ one }) => ({
  user: one(user, {
    fields: [platformAdmin.userId],
    references: [user.id],
  }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  actor: one(user, {
    fields: [auditLog.actorId],
    references: [user.id],
  }),
  targetOrg: one(organization, {
    fields: [auditLog.targetOrgId],
    references: [organization.id],
  }),
}));

export const platformSettings = pgTable("platform_settings", {
  id: text("id").primaryKey(), // usually just 'global'
  smtpHost: text("smtp_host"),
  smtpPort: integer("smtp_port").default(465),
  smtpUser: text("smtp_user"),
  smtpPassword: text("smtp_password"),
  fromName: text("from_name"),
  fromEmail: text("from_email"),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date()),
});

export const pricingPackage = pgTable("pricing_package", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: integer("price").notNull(),
  interval: text("interval").notNull(), // 'month' or 'year'
  features: json("features").notNull(), // string[]
  isPopular: boolean("is_popular").default(false).notNull(),
  order: integer("order").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
