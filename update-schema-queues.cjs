const fs = require('fs');
let content = fs.readFileSync('packages/shared-db/src/schema/crm.ts', 'utf8');

const queueTable = `
export const supportQueue = pgTable("support_queue", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
`;

content = content.replace('export const ticket = pgTable(', queueTable + '\nexport const ticket = pgTable(');
content = content.replace('assigneeId: text("assignee_id"),', 'assigneeId: text("assignee_id"),\n  queueId: text("queue_id").references(() => supportQueue.id, { onDelete: "set null" }),');

fs.writeFileSync('packages/shared-db/src/schema/crm.ts', content);
console.log('Queues added to schema');
