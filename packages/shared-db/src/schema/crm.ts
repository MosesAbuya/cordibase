import { pgTable, text, timestamp, integer, pgEnum, index, boolean } from "drizzle-orm/pg-core";
import { organization } from "./auth";
import { relations } from "drizzle-orm";

export const dealStageEnum = pgEnum("deal_stage", ["prospecting", "qualification", "proposal", "negotiation", "closed_won", "closed_lost"]);

// Company (Organization)
export const company = pgTable("company", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  domain: text("domain"),
  industry: text("industry"),
  address: text("address"),
  isStarred: boolean("is_starred").default(false).notNull(),
  accountHealthScore: integer("account_health_score").default(100),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  orgIdx: index("company_org_idx").on(table.organizationId),
}));

// Contact (Person)
export const contact = pgTable("contact", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  title: text("title"),
  department: text("department"),
  isStarred: boolean("is_starred").default(false).notNull(),
  isUnsubscribed: boolean("is_unsubscribed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  orgIdx: index("contact_org_idx").on(table.organizationId),
}));

// Relationship Edge (Contact <-> Company)
export const contactCompanyRole = pgTable("contact_company_role", {
  id: text("id").primaryKey(),
  contactId: text("contact_id").notNull().references(() => contact.id, { onDelete: "cascade" }),
  companyId: text("company_id").notNull().references(() => company.id, { onDelete: "cascade" }),
  role: text("role"), // e.g. "Champion", "Former Employee"
  isPrimary: boolean("is_primary").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  contactIdx: index("ccr_contact_idx").on(table.contactId),
  companyIdx: index("ccr_company_idx").on(table.companyId),
}));

// Pipeline Deal
export const deal = pgTable("deal", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  companyId: text("company_id").references(() => company.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  amount: integer("amount").notNull(), // stored in cents
  stage: dealStageEnum("stage").default("prospecting").notNull(),
  probability: integer("probability").default(0).notNull(), // 0-100
  isStarred: boolean("is_starred").default(false).notNull(),
  expectedCloseDate: timestamp("expected_close_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  orgIdx: index("deal_org_idx").on(table.organizationId),
  companyIdx: index("deal_company_idx").on(table.companyId),
}));

export const activityTypeEnum = pgEnum("activity_type", ["email", "call", "meeting", "note", "task"]);

// Activity Timeline (Communication & Interactions)
export const activity = pgTable("activity", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull(),
  contactId: text("contact_id").references(() => contact.id, { onDelete: "cascade" }),
  companyId: text("company_id").references(() => company.id, { onDelete: "cascade" }),
  dealId: text("deal_id").references(() => deal.id, { onDelete: "cascade" }),
  type: activityTypeEnum("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  orgIdx: index("activity_org_idx").on(table.organizationId),
  contactIdx: index("activity_contact_idx").on(table.contactId),
  companyIdx: index("activity_company_idx").on(table.companyId),
  dealIdx: index("activity_deal_idx").on(table.dealId),
}));

export const workflowTriggerEnum = pgEnum("workflow_trigger", [
  "field_change", "record_created", "stage_change", "time_based", "manual"
]);

export const workflowActionEnum = pgEnum("workflow_action", [
  "create_record", "update_record", "send_email", "create_task", "webhook", "ai_agent"
]);

export const workflow = pgTable("workflow", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  triggerType: workflowTriggerEnum("trigger_type").default("record_created").notNull(),
  triggerConfig: text("trigger_config"), // stringified JSON for simplicity
  isActive: boolean("is_active").default(false).notNull(),
  isStarred: boolean("is_starred").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workflowStep = pgTable("workflow_step", {
  id: text("id").primaryKey(),
  workflowId: text("workflow_id").references(() => workflow.id, { onDelete: "cascade" }).notNull(),
  stepOrder: integer("step_order").notNull(),
  actionType: workflowActionEnum("action_type").notNull(),
  actionConfig: text("action_config"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Deal Contact Role (Contact <-> Deal)
export const dealContactRole = pgTable("deal_contact_role", {
  id: text("id").primaryKey(),
  dealId: text("deal_id").notNull().references(() => deal.id, { onDelete: "cascade" }),
  contactId: text("contact_id").notNull().references(() => contact.id, { onDelete: "cascade" }),
  role: text("role"), // e.g. "Decision Maker", "Influencer"
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  dealIdx: index("dcr_deal_idx").on(table.dealId),
  contactIdx: index("dcr_contact_idx").on(table.contactId),
}));

// Relations
export const companyRelations = relations(company, ({ many }) => ({
  contacts: many(contactCompanyRole),
  deals: many(deal),
}));

export const contactRelations = relations(contact, ({ many }) => ({
  companies: many(contactCompanyRole),
  deals: many(dealContactRole),
}));

export const contactCompanyRoleRelations = relations(contactCompanyRole, ({ one }) => ({
  contact: one(contact, {
    fields: [contactCompanyRole.contactId],
    references: [contact.id],
  }),
  company: one(company, {
    fields: [contactCompanyRole.companyId],
    references: [company.id],
  }),
}));

export const dealRelations = relations(deal, ({ one, many }) => ({
  company: one(company, {
    fields: [deal.companyId],
    references: [company.id],
  }),
  contacts: many(dealContactRole),
}));

export const dealContactRoleRelations = relations(dealContactRole, ({ one }) => ({
  deal: one(deal, {
    fields: [dealContactRole.dealId],
    references: [deal.id],
  }),
  contact: one(contact, {
    fields: [dealContactRole.contactId],
    references: [contact.id],
  }),
}));

export const activityRelations = relations(activity, ({ one }) => ({
  contact: one(contact, {
    fields: [activity.contactId],
    references: [contact.id],
  }),
  company: one(company, {
    fields: [activity.companyId],
    references: [company.id],
  }),
  deal: one(deal, {
    fields: [activity.dealId],
    references: [deal.id],
  }),
}));

export const campaignStatusEnum = pgEnum("campaign_status", ["draft", "scheduled", "sent"]);
export const marketingListTypeEnum = pgEnum("marketing_list_type", ["static", "dynamic"]);

export const marketingList = pgTable("marketing_list", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: marketingListTypeEnum("type").default("static").notNull(),
  criteria: text("criteria"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const marketingListMember = pgTable("marketing_list_member", {
  id: text("id").primaryKey(),
  listId: text("list_id").notNull().references(() => marketingList.id, { onDelete: "cascade" }),
  contactId: text("contact_id").notNull().references(() => contact.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const campaign = pgTable("campaign", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  subject: text("subject"),
  bodyHtml: text("body_html"),
  status: campaignStatusEnum("status").default("draft").notNull(),
  targetListId: text("target_list_id").references(() => marketingList.id, { onDelete: "set null" }),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const webForm = pgTable("web_form", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  fieldsConfig: text("fields_config"), // JSON string
  submitAction: text("submit_action"), // JSON string
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});



export const ticketSourceChannelEnum = pgEnum("ticket_source_channel", ["web", "email", "slack", "phone"]);
export const ticketSentimentEnum = pgEnum("ticket_sentiment", ["positive", "neutral", "negative"]);
export const ticketSlaStatusEnum = pgEnum("ticket_sla_status", ["on_track", "at_risk", "breached"]);
export const kbContentTypeEnum = pgEnum("kb_content_type", ["fact", "procedure", "troubleshooting", "policy"]);
export const ticketMessageSenderTypeEnum = pgEnum("ticket_message_sender_type", ["customer", "agent", "ai_bot"]);

export const ticketStatusEnum = pgEnum("ticket_status", ["open", "in_progress", "resolved", "closed"]);
export const ticketPriorityEnum = pgEnum("ticket_priority", ["low", "medium", "high", "urgent"]);


export const supportQueue = pgTable("support_queue", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ticket = pgTable("ticket", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  subject: text("subject").notNull(),
  description: text("description"),
  status: ticketStatusEnum("status").default("open").notNull(),
  priority: ticketPriorityEnum("priority").default("medium").notNull(),
  sourceChannel: ticketSourceChannelEnum("source_channel").default("web").notNull(),
  category: text("category"),
  sentiment: ticketSentimentEnum("sentiment"),
  slaStatus: ticketSlaStatusEnum("sla_status").default("on_track").notNull(),
  slaBreachAt: timestamp("sla_breach_at"),
  contactId: text("contact_id").references(() => contact.id, { onDelete: "set null" }),
  companyId: text("company_id").references(() => company.id, { onDelete: "set null" }),
  assigneeId: text("assignee_id"),
  queueId: text("queue_id").references(() => supportQueue.id, { onDelete: "set null" }),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const knowledgeBaseArticle = pgTable("knowledge_base_article", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  contentHtml: text("content_html"),
  contentType: kbContentTypeEnum("content_type").default("fact").notNull(),
  category: text("category"),
  isPublished: boolean("is_published").default(false).notNull(),
  viewCount: integer("view_count").default(0).notNull(),
  deflectionCount: integer("deflection_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const ticketMessage = pgTable("ticket_message", {
  id: text("id").primaryKey(),
  ticketId: text("ticket_id").notNull().references(() => ticket.id, { onDelete: "cascade" }),
  senderType: ticketMessageSenderTypeEnum("sender_type").notNull(),
  senderId: text("sender_id"),
  bodyHtml: text("body_html").notNull(),
  isInternal: boolean("is_internal").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
