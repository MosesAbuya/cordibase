import { pgTable, text, timestamp, integer, pgEnum, index, date } from "drizzle-orm/pg-core";
import { organization } from "./auth";
import { relations } from "drizzle-orm";

export const employeeStatusEnum = pgEnum("employee_status", ["active", "on_leave", "terminated"]);
export const leaveStatusEnum = pgEnum("leave_status", ["pending", "approved", "rejected"]);
export const payrollStatusEnum = pgEnum("payroll_status", ["draft", "processed", "paid"]);

export const department = pgTable("department", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  managerId: text("manager_id"), // Self-referencing to employee, resolved in relations
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  orgIdx: index("dept_org_idx").on(table.organizationId),
}));

export const employee = pgTable("employee", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  departmentId: text("department_id").references(() => department.id, { onDelete: "set null" }),
  position: text("position").notNull(),
  salary: integer("salary").notNull(), // Monthly salary in cents
  hireDate: date("hire_date").notNull(),
  status: employeeStatusEnum("status").default("active").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  orgIdx: index("emp_org_idx").on(table.organizationId),
  deptIdx: index("emp_dept_idx").on(table.departmentId),
}));

export const leaveRequest = pgTable("leave_request", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  employeeId: text("employee_id").notNull().references(() => employee.id, { onDelete: "cascade" }),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  reason: text("reason").notNull(),
  status: leaveStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  orgIdx: index("leave_org_idx").on(table.organizationId),
  empIdx: index("leave_emp_idx").on(table.employeeId),
}));

export const payrollRun = pgTable("payroll_run", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  totalAmount: integer("total_amount").notNull(), // in cents
  status: payrollStatusEnum("status").default("draft").notNull(),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  orgIdx: index("payroll_org_idx").on(table.organizationId),
}));

export const payrollItem = pgTable("payroll_item", {
  id: text("id").primaryKey(),
  organizationId: text("organization_id").notNull().references(() => organization.id, { onDelete: "cascade" }),
  payrollRunId: text("payroll_run_id").notNull().references(() => payrollRun.id, { onDelete: "cascade" }),
  employeeId: text("employee_id").notNull().references(() => employee.id, { onDelete: "cascade" }),
  grossPay: integer("gross_pay").notNull(), // in cents
  deductions: integer("deductions").notNull(), // in cents
  netPay: integer("net_pay").notNull(), // in cents
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  runIdx: index("payroll_item_run_idx").on(table.payrollRunId),
}));

export const employeeRelations = relations(employee, ({ one, many }) => ({
  department: one(department, {
    fields: [employee.departmentId],
    references: [department.id],
  }),
  leaveRequests: many(leaveRequest),
  payrollItems: many(payrollItem),
}));

export const departmentRelations = relations(department, ({ many }) => ({
  employees: many(employee),
}));

export const payrollRunRelations = relations(payrollRun, ({ many }) => ({
  items: many(payrollItem),
}));
