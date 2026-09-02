import { pgTable, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { organization, user } from "./auth";

export const emailAccount = pgTable("email_account", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  fromName: text("from_name").notNull(),
  fromEmail: text("from_email").notNull(),
  smtpHost: text("smtp_host").notNull(),
  smtpPort: integer("smtp_port").default(465).notNull(),
  smtpUser: text("smtp_user").notNull(),
  smtpPassword: text("smtp_password").notNull(),
  signatureHtml: text("signature_html"),
  isGlobal: boolean("is_global").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailAccountAccess = pgTable("email_account_access", {
  id: text("id").primaryKey(),
  emailAccountId: text("email_account_id").notNull().references(() => emailAccount.id, { onDelete: "cascade" }),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
});

export const emailTemplate = pgTable("email_template", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  bodyHtml: text("body_html").notNull(),
  attachments: jsonb("attachments").default([]),
  aiInstructions: text("ai_instructions"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailAiRule = pgTable("email_ai_rule", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }), // if null, it's global for org
  ruleText: text("rule_text").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailLog = pgTable("email_log", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  emailAccountId: text("email_account_id").references(() => emailAccount.id, { onDelete: "set null" }),
  senderUserId: text("sender_user_id").references(() => user.id, { onDelete: "set null" }),
  toEmail: text("to_email").notNull(),
  subject: text("subject").notNull(),
  status: text("status").notNull(),
  sentAt: timestamp("sent_at").defaultNow().notNull(),
});


export const emailSettings = pgTable("email_settings", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }).unique(),
  defaultSignatureHtml: text("default_signature_html"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
