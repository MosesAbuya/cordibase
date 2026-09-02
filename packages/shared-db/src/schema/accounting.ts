import { pgTable, text, timestamp, decimal, varchar, integer, boolean } from "drizzle-orm/pg-core";
import { organization } from "./auth";
import { company } from "./crm";

// existing tables
export const invoice = pgTable("invoice", {
  id: varchar("id", { length: 255 }).primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  companyId: text("company_id").notNull().references(() => company.id, { onDelete: "restrict" }),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  issueDate: timestamp("issue_date").notNull().defaultNow(),
  dueDate: timestamp("due_date").notNull(),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  taxTotal: decimal("tax_total", { precision: 12, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull().default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const invoiceItem = pgTable("invoice_item", {
  id: varchar("id", { length: 255 }).primaryKey(),
  invoiceId: varchar("invoice_id", { length: 255 }).notNull().references(() => invoice.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull().default("1"),
  unitPrice: decimal("unit_price", { precision: 12, scale: 2 }).notNull().default("0"),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull().default("0"),
});

export const payment = pgTable("payment", {
  id: varchar("id", { length: 255 }).primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  invoiceId: varchar("invoice_id", { length: 255 }).notNull().references(() => invoice.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").notNull().defaultNow(),
  paymentMethod: varchar("payment_method", { length: 50 }),
  reference: varchar("reference", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Accounting settings
export const accountingSettings = pgTable("accounting_settings", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }).unique(),
  currency: varchar("currency", { length: 10 }).notNull().default("KES"),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).notNull().default("16.00"),
  vatEnabled: boolean("vat_enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Document template / branding
export const documentTemplate = pgTable("document_template", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }).unique(),
  companyName: text("company_name").notNull().default(""),
  companyTagline: text("company_tagline"),
  companyPhone: text("company_phone"),
  companyEmail: text("company_email"),
  companyWebsite: text("company_website"),
  companyPoBox: text("company_po_box"),
  companyCity: text("company_city"),
  stampText: text("stamp_text"),
  logoUrl: text("logo_url"),
  primaryColor: varchar("primary_color", { length: 9 }).notNull().default("#A83C2E"),
  accentColor: varchar("accent_color", { length: 9 }).notNull().default("#1B1B1B"),
  watermarkEnabled: boolean("watermark_enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Generated documents
export const document = pgTable("document", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 20 }).notNull().default("invoice"),
  refNumber: varchar("ref_number", { length: 50 }).notNull(),
  sequenceId: integer("sequence_id").notNull().default(1),
  clientName: text("client_name").notNull(),
  clientCo: text("client_co"),
  clientSpec: text("client_spec"),
  clientAddress: text("client_address"),
  issueDate: timestamp("issue_date").notNull().defaultNow(),
  dueDate: timestamp("due_date"),
  status: varchar("status", { length: 20 }).notNull().default("draft"),
  currency: varchar("currency", { length: 10 }).notNull().default("KES"),
  vatRate: decimal("vat_rate", { precision: 5, scale: 2 }).notNull().default("16.00"),
  subtotal: decimal("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  vatAmount: decimal("vat_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull().default("0"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Line items
export const documentLineItem = pgTable("document_line_item", {
  id: text("id").primaryKey(),
  documentId: text("document_id").notNull().references(() => document.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  particulars: text("particulars").notNull(),
  price: decimal("price", { precision: 12, scale: 2 }).notNull().default("0"),
  qty: decimal("qty", { precision: 10, scale: 2 }).notNull().default("1"),
  total: decimal("total", { precision: 12, scale: 2 }).notNull().default("0"),
});

// Transaction categories
export const transactionCategory = pgTable("transaction_category", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 10 }).notNull(),
  name: text("name").notNull(),
  isCustom: boolean("is_custom").notNull().default(false),
  color: varchar("color", { length: 9 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Financial tracker transactions
export const transaction = pgTable("transaction", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  type: varchar("type", { length: 10 }).notNull(),
  date: timestamp("date").notNull().defaultNow(),
  amount: decimal("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 10 }).notNull().default("KES"),
  categoryId: text("category_id").references(() => transactionCategory.id, { onDelete: "set null" }),
  description: text("description").notNull(),
  vendorOrSource: text("vendor_or_source"),
  receiptUrl: text("receipt_url"),
  aiExtracted: boolean("ai_extracted").notNull().default(false),
  linkedDocumentId: text("linked_document_id").references(() => document.id, { onDelete: "set null" }),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
