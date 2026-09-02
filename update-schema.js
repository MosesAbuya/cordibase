const fs = require('fs');
const path = require('path');
let content = fs.readFileSync('packages/shared-db/src/schema/crm.ts', 'utf8');

const enumsToAdd = 
export const ticketSourceChannelEnum = pgEnum("ticket_source_channel", ["web", "email", "slack", "phone"]);
export const ticketSentimentEnum = pgEnum("ticket_sentiment", ["positive", "neutral", "negative"]);
export const ticketSlaStatusEnum = pgEnum("ticket_sla_status", ["on_track", "at_risk", "breached"]);
export const kbContentTypeEnum = pgEnum("kb_content_type", ["fact", "procedure", "troubleshooting", "policy"]);
export const ticketMessageSenderTypeEnum = pgEnum("ticket_message_sender_type", ["customer", "agent", "ai_bot"]);
;
content = content.replace('export const ticketStatusEnum', enumsToAdd + '\nexport const ticketStatusEnum');

const newTicket = export const ticket = pgTable("ticket", {
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
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});;
content = content.replace(/export const ticket = pgTable\("ticket", \{[\s\S]*?\}\);/, newTicket);

const newKb = export const knowledgeBaseArticle = pgTable("knowledge_base_article", {
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
});;
content = content.replace(/export const knowledgeBaseArticle = pgTable\("knowledge_base_article", \{[\s\S]*?\}\);/, newKb);

const ticketMsg = 
export const ticketMessage = pgTable("ticket_message", {
  id: text("id").primaryKey(),
  ticketId: text("ticket_id").notNull().references(() => ticket.id, { onDelete: "cascade" }),
  senderType: ticketMessageSenderTypeEnum("sender_type").notNull(),
  senderId: text("sender_id"),
  bodyHtml: text("body_html").notNull(),
  isInternal: boolean("is_internal").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
;
content += ticketMsg;

fs.writeFileSync('packages/shared-db/src/schema/crm.ts', content);
console.log('Schema updated.');
