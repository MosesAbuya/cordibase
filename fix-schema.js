const fs = require('fs');
let file = 'packages/shared-db/src/schema/emailing.ts';
let content = fs.readFileSync(file, 'utf-8');

if (!content.includes('emailSettings')) {
  content += `

export const emailSettings = pgTable("email_settings", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }).unique(),
  defaultSignatureHtml: text("default_signature_html"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
`;
  fs.writeFileSync(file, content);
}
