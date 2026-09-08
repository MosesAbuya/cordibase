import { pgTable, text, timestamp, boolean, uuid, decimal, integer, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { organization } from './auth';

export const project = pgTable('project', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: text('organization_id').notNull().references(() => organization.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  status: text('status').default('active').notNull(),
  isTemplate: boolean('is_template').default(false),
  archivedAt: timestamp('archived_at'),
  clientPortalToken: text('client_portal_token'),
  clientId: uuid('client_id'),
  templateId: uuid('template_id'),
  budget: decimal('budget', { precision: 12, scale: 2 }),
  currency: text('currency').default('USD'),
  startDate: timestamp('start_date').notNull().defaultNow(),
  targetEndDate: timestamp('target_end_date'),
  actualEndDate: timestamp('actual_end_date'),
  healthStatus: text('health_status').default('on_track'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const projectMeeting = pgTable('project_meeting', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: text('organization_id').notNull().references(() => organization.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').notNull().references(() => project.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  startTime: timestamp('start_time').notNull(),
  endTime: timestamp('end_time').notNull(),
  minutesText: text('minutes_text'),
  aiSummary: text('ai_summary'),
  sentimentScore: integer('sentiment_score'),
  riskFlag: boolean('risk_flag').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const projectMilestone = pgTable('project_milestone', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: text('organization_id').notNull().references(() => organization.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').notNull().references(() => project.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  status: text('status').default('todo').notNull(),
  dueDate: timestamp('due_date'),
  timeSpentHours: decimal('time_spent_hours', { precision: 10, scale: 2 }).default('0'),
  isBillable: boolean('is_billable').default(true),
  completedAt: timestamp('completed_at'),
  generatedByAi: boolean('generated_by_ai').default(false),
  originMeetingId: uuid('origin_meeting_id').references(() => projectMeeting.id, { onDelete: 'set null' }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const milestoneAssignee = pgTable('milestone_assignee', {
  id: uuid('id').primaryKey().defaultRandom(),
  milestoneId: uuid('milestone_id').notNull().references(() => projectMilestone.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
});

export const projectDocument = pgTable('project_document', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: text('organization_id').notNull().references(() => organization.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').notNull().references(() => project.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  url: text('url').notNull(),
  type: text('type'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const projectStandup = pgTable('project_standup', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: text('organization_id').notNull().references(() => organization.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').notNull().references(() => project.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  date: timestamp('date').notNull().defaultNow(),
  updateText: text('update_text').notNull(),
  blockers: text('blockers'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});


export const projectTemplate = pgTable('project_template', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: text('organization_id').notNull().references(() => organization.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  milestones: jsonb('milestones'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const projectResource = pgTable('project_resource', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: text('organization_id').notNull().references(() => organization.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  maxWeeklyHours: integer('max_weekly_hours').default(40),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const projectTimeLog = pgTable('project_time_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  organizationId: text('organization_id').notNull().references(() => organization.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').notNull().references(() => project.id, { onDelete: 'cascade' }),
  milestoneId: uuid('milestone_id').notNull().references(() => projectMilestone.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull(),
  hours: decimal('hours', { precision: 10, scale: 2 }).notNull(),
  date: timestamp('date').notNull().defaultNow(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const projectRiskLog = pgTable('project_risk_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => project.id, { onDelete: 'cascade' }),
  riskLevel: text('risk_level').notNull(),
  details: text('details').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
