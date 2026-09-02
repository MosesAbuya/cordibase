import { pgTable, text, timestamp, jsonb } from "drizzle-orm/pg-core";

export const dashboard = pgTable("dashboard", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  layout: jsonb("layout").notNull().default([]), // Array of grid positions
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const report = pgTable("report", {
  id: text("id").primaryKey(),
  orgId: text("org_id").notNull(),
  dashboardId: text("dashboard_id").references(() => dashboard.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'bar', 'line', 'metric', 'table', 'pie'
  queryConfig: jsonb("query_config").notNull(), // JSON representing the query
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
