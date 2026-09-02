import { GoogleGenAI } from '@google/genai';
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;
import Fastify from 'fastify';
import dotenv from 'dotenv';
import { createDbClient, crmSchema, reportsSchema, authSchema, accountingSchema } from '@cordibase/shared-db';
import { eq, inArray, and, desc } from 'drizzle-orm';
import path from 'path';
import crypto from 'crypto';

// New: Import accounting routes
import { registerAccountingRoutes } from './accounting';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const fastify = Fastify({ logger: true });
const db = createDbClient(process.env.DATABASE_URL!);

fastify.addHook('preHandler', async (request, reply) => {
  const cookieHeader = request.headers.cookie || '';
  
  if (!cookieHeader && !request.headers['x-org-id'] && !request.headers['authorization']) {
    return reply.code(401).send({ error: 'Unauthorized - Missing token' });
  }

  try {
    const coreRes = await fetch('http://localhost:3001/api/auth/get-session', {
      headers: { 'Cookie': cookieHeader, 'authorization': request.headers['authorization'] || '' }
    });
    if (!coreRes.ok) throw new Error('Invalid session');
    const sessionData = await coreRes.json() as any;
    const userId = sessionData?.user?.id;
    
    if (userId) {
      (request as any).user = sessionData.user;
      const requestedOrgId = request.headers['x-org-id'] || sessionData?.session?.activeOrganizationId;
      
      let orgId = requestedOrgId;
      let memberRecord: any = null;

      if (orgId) {
        const memberships = await db.select().from(authSchema.member).where(and(eq(authSchema.member.userId, userId), eq(authSchema.member.organizationId, orgId as string))).limit(1);
        memberRecord = memberships[0];
      }
      
      if (!memberRecord) {
        const memberships = await db.select().from(authSchema.member).where(eq(authSchema.member.userId, userId)).limit(1);
        memberRecord = memberships[0];
        orgId = memberRecord?.organizationId;
      }

      if (memberRecord) {
        (request as any).activeOrganizationId = orgId;
        (request as any).member = memberRecord;

        // Module-based Access Control
        let requiredModule: any = null;
        if (request.url.startsWith('/api/crm/accounting')) {
          requiredModule = 'accounting';
        } else if (request.url.startsWith('/api/crm/reports')) {
          requiredModule = 'reports';
        } else if (request.url.startsWith('/api/crm')) {
          requiredModule = 'crm';
        }

        if (requiredModule && memberRecord.role !== 'owner' && memberRecord.role !== 'admin') {
          let allowedModules: any[] = [];
          try {
            allowedModules = typeof (memberRecord as any).modules === 'string' ? JSON.parse((memberRecord as any).modules) : ((memberRecord as any).modules || []);
          } catch(e) {}
          if (!allowedModules.includes(requiredModule)) {
            return reply.code(403).send({ error: 'Forbidden: Missing required module access (' + requiredModule + ')' });
          }
        }
      } else {
        (request as any).activeOrganizationId = null;
      }
    } else {
       return reply.code(401).send({ error: 'Unauthorized - Invalid session' });
    }
  } catch (err) {
    // leave it to routes
  }
});

fastify.get('/api/crm/ping', async () => {
  return { status: 'crm service running' };
});

// === Contacts ===
fastify.get('/api/crm/contacts', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const contacts = await db.select().from(crmSchema.contact).where(eq(crmSchema.contact.organizationId, orgId as string));
  return { contacts };
});

fastify.post('/api/crm/contacts', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const body = request.body as any;
  const newContact = await db.insert(crmSchema.contact).values({
    id: crypto.randomUUID(),
    organizationId: orgId as string,
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    phone: body.phone,
    title: body.title,
    department: body.department
  }).returning();
  return { contact: newContact[0] };
});

fastify.put('/api/crm/contacts/:id', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params as { id: string };
  const body = request.body as any;
  const updated = await db.update(crmSchema.contact).set({
    firstName: body.firstName,
    lastName: body.lastName,
    email: body.email,
    phone: body.phone,
    title: body.title,
    department: body.department,
    isStarred: body.isStarred,
    updatedAt: new Date()
  }).where(eq(crmSchema.contact.id, id)).returning();
  if (updated.length === 0) return reply.code(404).send({ error: 'Not found' });
  return { contact: updated[0] };
});

fastify.delete('/api/crm/contacts/:id', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params as { id: string };
  const deleted = await db.delete(crmSchema.contact).where(eq(crmSchema.contact.id, id)).returning();
  if (deleted.length === 0) return reply.code(404).send({ error: 'Not found' });
  return { success: true };
});

fastify.delete('/api/crm/contacts', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const body = request.body as { ids: string[] };
  if (!body.ids || body.ids.length === 0) return reply.code(400).send({ error: 'No ids provided' });
  await db.delete(crmSchema.contact).where(and(
    eq(crmSchema.contact.organizationId, orgId as string),
    inArray(crmSchema.contact.id, body.ids)
  ));
  return { success: true };
});

fastify.get('/api/crm/contacts/:id', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params as { id: string };
  const contact = await db.select().from(crmSchema.contact).where(and(
    eq(crmSchema.contact.organizationId, orgId as string),
    eq(crmSchema.contact.id, id)
  )).limit(1);
  if (contact.length === 0) return reply.code(404).send({ error: 'Not found' });
  return { contact: contact[0] };
});

// === Companies ===
fastify.get('/api/crm/companies', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const companies = await db.select().from(crmSchema.company).where(eq(crmSchema.company.organizationId, orgId as string));
  return { companies };
});

fastify.post('/api/crm/companies', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const body = request.body as any;
  const newCompany = await db.insert(crmSchema.company).values({
    id: crypto.randomUUID(),
    organizationId: orgId as string,
    name: body.name,
    domain: body.domain,
    industry: body.industry,
    address: body.address
  }).returning();
  return { company: newCompany[0] };
});

fastify.put('/api/crm/companies/:id', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params as { id: string };
  const body = request.body as any;
  const updated = await db.update(crmSchema.company).set({
    name: body.name, domain: body.domain, industry: body.industry,
    address: body.address, isStarred: body.isStarred, updatedAt: new Date()
  }).where(eq(crmSchema.company.id, id)).returning();
  if (updated.length === 0) return reply.code(404).send({ error: 'Not found' });
  return { company: updated[0] };
});

fastify.delete('/api/crm/companies/:id', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params as { id: string };
  const deleted = await db.delete(crmSchema.company).where(eq(crmSchema.company.id, id)).returning();
  if (deleted.length === 0) return reply.code(404).send({ error: 'Not found' });
  return { success: true };
});

fastify.delete('/api/crm/companies', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const body = request.body as { ids: string[] };
  if (!body.ids || body.ids.length === 0) return reply.code(400).send({ error: 'No ids provided' });
  await db.delete(crmSchema.company).where(and(
    eq(crmSchema.company.organizationId, orgId as string),
    inArray(crmSchema.company.id, body.ids)
  ));
  return { success: true };
});

// === Deals ===
fastify.get('/api/crm/deals', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const deals = await db.select().from(crmSchema.deal).where(eq(crmSchema.deal.organizationId, orgId as string));
  return { deals };
});

fastify.post('/api/crm/deals', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const body = request.body as any;
  const newDeal = await db.insert(crmSchema.deal).values({
    id: crypto.randomUUID(),
    organizationId: orgId as string,
    title: body.title,
    amount: body.amount,
    stage: body.stage || 'prospecting',
    probability: body.probability || 0,
    companyId: body.companyId || null,
  }).returning();
  return { deal: newDeal[0] };
});

fastify.put('/api/crm/deals/:id', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params as { id: string };
  const body = request.body as any;
  const updated = await db.update(crmSchema.deal).set({
    title: body.title, amount: body.amount, companyId: body.companyId,
    stage: body.stage, probability: body.probability,
    isStarred: body.isStarred, updatedAt: new Date()
  }).where(eq(crmSchema.deal.id, id)).returning();
  if (updated.length === 0) return reply.code(404).send({ error: 'Not found' });
  return { deal: updated[0] };
});

fastify.delete('/api/crm/deals/:id', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params as { id: string };
  const deleted = await db.delete(crmSchema.deal).where(eq(crmSchema.deal.id, id)).returning();
  if (deleted.length === 0) return reply.code(404).send({ error: 'Not found' });
  return { success: true };
});

fastify.delete('/api/crm/deals', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const body = request.body as { ids: string[] };
  if (!body.ids || body.ids.length === 0) return reply.code(400).send({ error: 'No ids provided' });
  await db.delete(crmSchema.deal).where(and(
    eq(crmSchema.deal.organizationId, orgId as string),
    inArray(crmSchema.deal.id, body.ids)
  ));
  return { success: true };
});

// === Activities ===
fastify.get('/api/crm/activities', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { contactId, companyId, dealId } = request.query as { contactId?: string, companyId?: string, dealId?: string };
  let conditions = [eq(crmSchema.activity.organizationId, orgId as string)];
  if (contactId) conditions.push(eq(crmSchema.activity.contactId, contactId));
  if (companyId) conditions.push(eq(crmSchema.activity.companyId, companyId));
  if (dealId) conditions.push(eq(crmSchema.activity.dealId, dealId));
  const activities = await db.select().from(crmSchema.activity).where(and(...conditions)).orderBy(desc(crmSchema.activity.timestamp));
  return { activities };
});

fastify.post('/api/crm/activities', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const body = request.body as any;
  if (!body.type || !body.title) return reply.code(400).send({ error: 'type and title are required' });
  const newActivity = await db.insert(crmSchema.activity).values({
    id: crypto.randomUUID(),
    organizationId: orgId as string,
    contactId: body.contactId || null,
    companyId: body.companyId || null,
    dealId: body.dealId || null,
    type: body.type, title: body.title, description: body.description || null,
  }).returning();
  return { activity: newActivity[0] };
});

// === Workflows ===
fastify.get('/api/crm/workflows', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const workflows = await db.select().from(crmSchema.workflow).where(eq(crmSchema.workflow.organizationId, orgId as string));
  return { workflows };
});

fastify.get('/api/crm/workflows/:id', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params as { id: string };
  const w = await db.select().from(crmSchema.workflow).where(eq(crmSchema.workflow.id, id)).limit(1);
  if (w.length === 0) return reply.code(404).send({ error: 'Not found' });
  
  const steps = await db.select().from(crmSchema.workflowStep).where(eq(crmSchema.workflowStep.workflowId, id)).orderBy(crmSchema.workflowStep.stepOrder);
  return { workflow: w[0], steps };
});

fastify.post('/api/crm/workflows', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const body = request.body as any;
  const newWorkflow = await db.insert(crmSchema.workflow).values({
    id: crypto.randomUUID(),
    organizationId: orgId as string,
    title: body.title,
    description: body.description || null,
    triggerType: body.triggerType || 'record_created',
    isActive: body.isActive || false
  }).returning();
  return { workflow: newWorkflow[0] };
});

fastify.put('/api/crm/workflows/:id', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params as { id: string };
  const body = request.body as any;
  const updated = await db.update(crmSchema.workflow).set({
    title: body.title,
    description: body.description,
    triggerType: body.triggerType,
    triggerConfig: body.triggerConfig,
    isActive: body.isActive,
    isStarred: body.isStarred,
    updatedAt: new Date()
  }).where(eq(crmSchema.workflow.id, id)).returning();
  if (updated.length === 0) return reply.code(404).send({ error: 'Not found' });
  return { workflow: updated[0] };
});

fastify.delete('/api/crm/workflows/:id', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params as { id: string };
  const deleted = await db.delete(crmSchema.workflow).where(eq(crmSchema.workflow.id, id)).returning();
  if (deleted.length === 0) return reply.code(404).send({ error: 'Not found' });
  return { success: true };
});

fastify.delete('/api/crm/workflows', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const body = request.body as { ids: string[] };
  if (!body.ids || body.ids.length === 0) return reply.code(400).send({ error: 'No ids provided' });
  await db.delete(crmSchema.workflow).where(and(
    eq(crmSchema.workflow.organizationId, orgId as string),
    inArray(crmSchema.workflow.id, body.ids)
  ));
  return { success: true };
});

// === Workflow Steps ===
fastify.post('/api/crm/workflows/:id/steps', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params as { id: string };
  const body = request.body as any;
  const newStep = await db.insert(crmSchema.workflowStep).values({
    id: crypto.randomUUID(),
    workflowId: id,
    stepOrder: body.stepOrder || 0,
    actionType: body.actionType || 'create_task',
    actionConfig: body.actionConfig || null
  }).returning();
  return { step: newStep[0] };
});

fastify.put('/api/crm/workflow_steps/:stepId', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { stepId } = request.params as { stepId: string };
  const body = request.body as any;
  const updated = await db.update(crmSchema.workflowStep).set({
    actionConfig: body.actionConfig
  }).where(eq(crmSchema.workflowStep.id, stepId)).returning();
  if (updated.length === 0) return reply.code(404).send({ error: 'Not found' });
  return { step: updated[0] };
});

fastify.delete('/api/crm/workflow_steps/:stepId', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { stepId } = request.params as { stepId: string };
  await db.delete(crmSchema.workflowStep).where(eq(crmSchema.workflowStep.id, stepId));
  return { success: true };
});

// Marketing - Campaigns
fastify.get('/api/crm/campaigns', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const records = await db.select().from(crmSchema.campaign).where(eq(crmSchema.campaign.organizationId, orgId)).orderBy(desc(crmSchema.campaign.createdAt));
  return { campaigns: records };
});

fastify.post('/api/crm/campaigns', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const body = request.body as any;
  const newRecord = await db.insert(crmSchema.campaign).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    title: body.title,
    subject: body.subject || '',
    bodyHtml: body.bodyHtml || '',
    targetListId: body.targetListId || null,
    status: body.status || 'draft'
  }).returning();
  return { campaign: newRecord[0] };
});

fastify.get('/api/crm/campaigns/:id', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params as { id: string };
  const records = await db.select().from(crmSchema.campaign).where(and(eq(crmSchema.campaign.id, id), eq(crmSchema.campaign.organizationId, orgId)));
  if (records.length === 0) return reply.code(404).send({ error: 'Not found' });
  return { campaign: records[0] };
});

fastify.put('/api/crm/campaigns/:id', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params as { id: string };
  const body = request.body as any;
  const updated = await db.update(crmSchema.campaign).set({
    title: body.title,
    subject: body.subject,
    bodyHtml: body.bodyHtml,
    targetListId: body.targetListId || null,
    status: body.status,
    updatedAt: new Date()
  }).where(and(eq(crmSchema.campaign.id, id), eq(crmSchema.campaign.organizationId, orgId))).returning();
  return { campaign: updated[0] };
});

fastify.delete('/api/crm/campaigns/:id', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params as { id: string };
  await db.delete(crmSchema.campaign).where(and(eq(crmSchema.campaign.id, id), eq(crmSchema.campaign.organizationId, orgId)));
  return { success: true };
});

fastify.delete('/api/crm/campaigns', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const body = request.body as { ids: string[] };
  if (!body.ids || body.ids.length === 0) return { success: true };
  await db.delete(crmSchema.campaign).where(and(inArray(crmSchema.campaign.id, body.ids), eq(crmSchema.campaign.organizationId, orgId)));
  return { success: true };
});

// Marketing - Lists
fastify.get('/api/crm/lists', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const records = await db.select().from(crmSchema.marketingList).where(eq(crmSchema.marketingList.organizationId, orgId)).orderBy(desc(crmSchema.marketingList.createdAt));
  return { lists: records };
});

fastify.post('/api/crm/lists', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const body = request.body as any;
  const newRecord = await db.insert(crmSchema.marketingList).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    name: body.name,
    type: body.type || 'static',
    criteria: body.criteria || ''
  }).returning();
  return { list: newRecord[0] };
});

fastify.put('/api/crm/lists/:id', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params as { id: string };
  const body = request.body as any;
  const updated = await db.update(crmSchema.marketingList).set({
    name: body.name,
    type: body.type,
    criteria: body.criteria,
    updatedAt: new Date()
  }).where(and(eq(crmSchema.marketingList.id, id), eq(crmSchema.marketingList.organizationId, orgId))).returning();
  return { list: updated[0] };
});

fastify.delete('/api/crm/lists/:id', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params as { id: string };
  await db.delete(crmSchema.marketingList).where(and(eq(crmSchema.marketingList.id, id), eq(crmSchema.marketingList.organizationId, orgId)));
  return { success: true };
});

fastify.delete('/api/crm/lists', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const body = request.body as { ids: string[] };
  if (!body.ids || body.ids.length === 0) return { success: true };
  await db.delete(crmSchema.marketingList).where(and(inArray(crmSchema.marketingList.id, body.ids), eq(crmSchema.marketingList.organizationId, orgId)));
  return { success: true };
});

// Marketing - Web Forms
fastify.get('/api/crm/forms', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const records = await db.select().from(crmSchema.webForm).where(eq(crmSchema.webForm.organizationId, orgId)).orderBy(desc(crmSchema.webForm.createdAt));
  return { forms: records };
});

fastify.post('/api/crm/forms', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const body = request.body as any;
  const newRecord = await db.insert(crmSchema.webForm).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    title: body.title,
    fieldsConfig: body.fieldsConfig || '[]',
    submitAction: body.submitAction || '{}',
    isActive: true
  }).returning();
  return { form: newRecord[0] };
});

fastify.put('/api/crm/forms/:id', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params as { id: string };
  const body = request.body as any;
  const updated = await db.update(crmSchema.webForm).set({
    title: body.title,
    fieldsConfig: body.fieldsConfig,
    submitAction: body.submitAction,
    isActive: body.isActive,
    updatedAt: new Date()
  }).where(and(eq(crmSchema.webForm.id, id), eq(crmSchema.webForm.organizationId, orgId))).returning();
  return { form: updated[0] };
});

fastify.delete('/api/crm/forms/:id', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params as { id: string };
  await db.delete(crmSchema.webForm).where(and(eq(crmSchema.webForm.id, id), eq(crmSchema.webForm.organizationId, orgId)));
  return { success: true };
});

fastify.delete('/api/crm/forms', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const body = request.body as { ids: string[] };
  if (!body.ids || body.ids.length === 0) return { success: true };
  await db.delete(crmSchema.webForm).where(and(inArray(crmSchema.webForm.id, body.ids), eq(crmSchema.webForm.organizationId, orgId)));
  return { success: true };
});

// Service - Tickets
fastify.get('/api/crm/tickets', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const records = await db.select().from(crmSchema.ticket).where(eq(crmSchema.ticket.organizationId, orgId)).orderBy(desc(crmSchema.ticket.createdAt));
  return { tickets: records };
});

fastify.post('/api/crm/tickets', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const body = request.body as any;
  const newRecord = await db.insert(crmSchema.ticket).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    subject: body.subject,
    description: body.description || '',
    status: body.status || 'open',
    priority: body.priority || 'medium',
    contactId: body.contactId || null,
    companyId: body.companyId || null,
    assigneeId: body.assigneeId || null
  }).returning();
  return { ticket: newRecord[0] };
});

fastify.get('/api/crm/tickets/:id', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params as { id: string };
  const records = await db.select().from(crmSchema.ticket).where(and(eq(crmSchema.ticket.id, id), eq(crmSchema.ticket.organizationId, orgId)));
  if (records.length === 0) return reply.code(404).send({ error: 'Not found' });
  return { ticket: records[0] };
});

fastify.put('/api/crm/tickets/:id', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params as { id: string };
  const body = request.body as any;
  
  const updateData: any = {
    subject: body.subject,
    description: body.description,
    status: body.status,
    priority: body.priority,
    contactId: body.contactId || null,
    companyId: body.companyId || null,
    assigneeId: body.assigneeId || null,
    updatedAt: new Date()
  };

  if (body.status === 'resolved' || body.status === 'closed') {
    updateData.resolvedAt = new Date();
  }

  const updated = await db.update(crmSchema.ticket).set(updateData).where(and(eq(crmSchema.ticket.id, id), eq(crmSchema.ticket.organizationId, orgId))).returning();
  return { ticket: updated[0] };
});

fastify.delete('/api/crm/tickets/:id', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params as { id: string };
  await db.delete(crmSchema.ticket).where(and(eq(crmSchema.ticket.id, id), eq(crmSchema.ticket.organizationId, orgId)));
  return { success: true };
});

fastify.delete('/api/crm/tickets', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const body = request.body as { ids: string[] };
  if (!body.ids || body.ids.length === 0) return { success: true };
  await db.delete(crmSchema.ticket).where(and(inArray(crmSchema.ticket.id, body.ids), eq(crmSchema.ticket.organizationId, orgId)));
  return { success: true };
});

// Service - Knowledge Base
fastify.get('/api/crm/kb-articles', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const records = await db.select().from(crmSchema.knowledgeBaseArticle).where(eq(crmSchema.knowledgeBaseArticle.organizationId, orgId)).orderBy(desc(crmSchema.knowledgeBaseArticle.createdAt));
  return { articles: records };
});

fastify.post('/api/crm/kb-articles', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const body = request.body as any;
  const newRecord = await db.insert(crmSchema.knowledgeBaseArticle).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    title: body.title,
    contentHtml: body.contentHtml || '',
    category: body.category || '',
    isPublished: body.isPublished || false
  }).returning();
  return { article: newRecord[0] };
});

fastify.get('/api/crm/kb-articles/:id', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params as { id: string };
  const records = await db.select().from(crmSchema.knowledgeBaseArticle).where(and(eq(crmSchema.knowledgeBaseArticle.id, id), eq(crmSchema.knowledgeBaseArticle.organizationId, orgId)));
  if (records.length === 0) return reply.code(404).send({ error: 'Not found' });
  return { article: records[0] };
});

fastify.put('/api/crm/kb-articles/:id', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params as { id: string };
  const body = request.body as any;
  const updated = await db.update(crmSchema.knowledgeBaseArticle).set({
    title: body.title,
    contentHtml: body.contentHtml,
    category: body.category,
    isPublished: body.isPublished,
    updatedAt: new Date()
  }).where(and(eq(crmSchema.knowledgeBaseArticle.id, id), eq(crmSchema.knowledgeBaseArticle.organizationId, orgId))).returning();
  return { article: updated[0] };
});

fastify.delete('/api/crm/kb-articles/:id', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params as { id: string };
  await db.delete(crmSchema.knowledgeBaseArticle).where(and(eq(crmSchema.knowledgeBaseArticle.id, id), eq(crmSchema.knowledgeBaseArticle.organizationId, orgId)));
  return { success: true };
});

fastify.delete('/api/crm/kb-articles', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const body = request.body as { ids: string[] };
  if (!body.ids || body.ids.length === 0) return { success: true };
  await db.delete(crmSchema.knowledgeBaseArticle).where(and(inArray(crmSchema.knowledgeBaseArticle.id, body.ids), eq(crmSchema.knowledgeBaseArticle.organizationId, orgId)));
  return { success: true };
});


fastify.get('/api/crm/tickets/:id/messages', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params as any;
  const records = await db.select().from(crmSchema.ticketMessage).where(eq(crmSchema.ticketMessage.ticketId, id)).orderBy(crmSchema.ticketMessage.createdAt);
  return { messages: records };
});

fastify.post('/api/crm/tickets/:id/messages', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params as any;
  const body = request.body as any;
  
  const msg = await db.insert(crmSchema.ticketMessage).values({
    id: crypto.randomUUID(),
    ticketId: id,
    senderType: body.senderType || 'agent',
    bodyHtml: body.bodyHtml || '',
    isInternal: body.isInternal || false
  }).returning();
  
  return { message: msg[0] };
});

fastify.post('/api/crm/tickets/:id/copilot/draft', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params as any;
  
  if (!ai) return reply.code(500).send({ error: 'Gemini AI not configured' });
  
  const ticket = await db.select().from(crmSchema.ticket).where(eq(crmSchema.ticket.id, id));
  if (!ticket[0]) return reply.code(404).send({ error: 'Ticket not found' });
  
  const messages = await db.select().from(crmSchema.ticketMessage).where(eq(crmSchema.ticketMessage.ticketId, id)).orderBy(crmSchema.ticketMessage.createdAt);
  
  const prompt = `
  You are an AI Copilot for a customer support agent.
  Draft a polite, helpful reply to the customer for the following ticket.
  
  Ticket Subject: ${ticket[0].subject}
  Ticket Description: ${ticket[0].description}
  
  Recent messages:
  ${messages.map(m => `[${m.senderType}]: ${m.bodyHtml}`).join('\n')}
  
  Provide ONLY the text of the suggested reply. Do not include introductory conversational text.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  
  return { draft: response.text };
});


fastify.post('/api/public/support/:orgId/tickets', async (request, reply) => {
  const { orgId } = request.params as any;
  const body = request.body as any;
  if (!orgId) return reply.code(400).send({ error: 'Organization ID is required' });
  if (!body.email || !body.subject || !body.description) {
    return reply.code(400).send({ error: 'Missing required fields' });
  }

  // Find or create contact
  let contactRecord = await db.select().from(crmSchema.contact).where(eq(crmSchema.contact.email, body.email));
  let contactId = contactRecord[0]?.id;
  
  if (!contactId) {
    const newContact = await db.insert(crmSchema.contact).values({
      id: crypto.randomUUID(),
      organizationId: orgId,
      email: body.email,
      firstName: body.firstName || '',
      lastName: body.lastName || '',
    }).returning();
    contactId = newContact[0].id;
  }

  // Create Ticket
  const ticket = await db.insert(crmSchema.ticket).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    subject: body.subject,
    description: body.description,
    contactId: contactId,
    sourceChannel: 'web',
    status: 'open',
    priority: 'medium',
  }).returning();

  return { success: true, ticket: ticket[0] };
});


fastify.get('/api/crm/queues', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const records = await db.select().from(crmSchema.supportQueue).where(eq(crmSchema.supportQueue.organizationId, orgId));
  return { queues: records };
});

fastify.post('/api/crm/queues', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const body = request.body as any;
  const newQ = await db.insert(crmSchema.supportQueue).values({
    id: crypto.randomUUID(),
    organizationId: orgId as string,
    name: body.name,
  }).returning();
  return { queue: newQ[0] };
});



// === Reports & Dashboards ===
  fastify.get('/api/crm/dashboard/summary', async (request: any, reply) => {
      console.log("HIT /api/crm/dashboard/summary");
      const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
      console.log("orgId:", orgId);
      if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
      
      // Revenue & Transactions
      let txns: any[] = [];
      try {
        txns = await db.select().from((accountingSchema as any).transaction).where(eq((accountingSchema as any).transaction.organizationId, orgId));
      } catch(e) {
        console.error("Txns error:", e);
      }
      
      let totalIncome = 0;
      for (const t of txns) {
        if (t.type === 'income') totalIncome += Number(t.amount);
      }
      
      // Deals
      const deals = await db.select().from(crmSchema.deal).where(eq(crmSchema.deal.organizationId, orgId));
      const activeDeals = deals.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost').length;
      
      // Conversion Rate
      const wonDeals = deals.filter(d => d.stage === 'closed_won').length;
      const conversionRate = deals.length > 0 ? ((wonDeals / deals.length) * 100).toFixed(1) : "0.0";
      
      // Contacts
      const contacts = await db.select().from(crmSchema.contact).where(eq(crmSchema.contact.organizationId, orgId));
      const totalContacts = contacts.length;
      
      console.log("Returning:", { revenue: totalIncome, activeDeals, conversionRate, totalContacts });
      return {
        revenue: totalIncome,
        activeDeals,
        conversionRate,
        totalContacts
      };
    });

fastify.get('/api/crm/reports/dashboards', async (request: any, reply) => {
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const dashboards = await db.select().from(reportsSchema.dashboard).where(eq(reportsSchema.dashboard.orgId, orgId));
  return { dashboards };
});

fastify.post('/api/crm/reports/query', async (request: any, reply) => {
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const body = request.body as any;
  const { collection, metrics, dimensions, timeRange } = body;
  
  let result: any[] = [];
  
  if (collection === 'tickets') {
    const records = await db.select().from(crmSchema.ticket).where(eq(crmSchema.ticket.organizationId, orgId));
    const grouped: any = {};
    for (const r of records) {
      let key = dimensions.map((d: any) => (r as any)[d]).join('-');
      if (!key) key = 'total';
      if (!grouped[key]) grouped[key] = { count: 0, _label: key };
      grouped[key].count++;
    }
    result = Object.values(grouped);
  } else if (collection === 'deals') {
    const records = await db.select().from(crmSchema.deal).where(eq(crmSchema.deal.organizationId, orgId));
    const grouped: any = {};
    for (const r of records) {
      let key = dimensions.map((d: any) => (r as any)[d]).join('-');
      if (!key) key = 'total';
      if (!grouped[key]) grouped[key] = { count: 0, amount: 0, _label: key };
      grouped[key].count++;
      grouped[key].amount += r.amount || 0;
    }
    result = Object.values(grouped);
  } else if (collection === 'contacts') {
    const records = await db.select().from(crmSchema.contact).where(eq(crmSchema.contact.organizationId, orgId));
    result = [{ count: records.length, _label: 'total' }];
  }

  return { result, meta: { generatedAt: new Date().toISOString() } };
});

const start = async () => {
  try {
    await fastify.register(async (app) => {
      await registerAccountingRoutes(app);
    });
    await fastify.listen({ port: 3002, host: '0.0.0.0' });
    console.log(`CRM Service running on http://localhost:3002`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();




