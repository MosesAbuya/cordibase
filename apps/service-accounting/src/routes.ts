import { createDbClient, accountingSchema, authSchema } from '@cordibase/shared-db';
import { eq, and } from 'drizzle-orm';
import dotenv from 'dotenv';
import path from 'path';
import { FastifyInstance } from 'fastify';

export default async function pluginRoutes(fastify: FastifyInstance, opts: any) {

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const db = createDbClient(process.env.DATABASE_URL!);

fastify.addHook('preHandler', async (request, reply) => {
  if (request.method === 'OPTIONS') return;

  const cookieHeader = request.headers.cookie;
  if (!cookieHeader && !request.headers['x-org-id']) {
    return reply.code(401).send({ error: 'Unauthorized: No session cookie or org header provided' });
  }

  try {
    const authRes = await fetch((process.env.CORE_SERVICE_INTERNAL_URL || 'http://127.0.0.1:3001') + '/api/auth/get-session', {
      headers: { cookie: cookieHeader || '' }
    });
    const sessionData = await authRes.json() as any;

    if (!sessionData || !sessionData.session) {
      return reply.code(401).send({ error: 'Unauthorized: Invalid session' });
    }

    (request as any).user = sessionData.user;
    const userId = sessionData.user.id;
    const requestedOrgId = request.headers['x-org-id'] || sessionData.session.activeOrganizationId;

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

      if (memberRecord.role !== 'owner' && memberRecord.role !== 'admin') {
        let allowedModules: any[] = [];
        try {
          allowedModules = typeof (memberRecord as any).modules === 'string' ? JSON.parse((memberRecord as any).modules) : ((memberRecord as any).modules || []);
        } catch(e) {}
        if (!allowedModules.includes('accounting')) {
          return reply.code(403).send({ error: 'Forbidden: Missing accounting module access' });
        }
      }
    } else {
      (request as any).activeOrganizationId = null;
    }
  } catch (error) {
    request.log.error(error);
    return reply.code(500).send({ error: 'Internal Server Error validating session' });
  }
});

// GET /api/accounting/documents
fastify.get('/api/accounting/documents', async (request: any, reply: any) => {
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const type = request.query.type as string;
  const allDocs = await db.select().from(accountingSchema.document).where(eq(accountingSchema.document.organizationId, orgId as string));
  return type ? allDocs.filter((d: any) => d.type === type) : allDocs;
});

// GET /api/accounting/documents/:id
fastify.get('/api/accounting/documents/:id', async (request: any, reply: any) => {
  const { id } = request.params;
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  const doc = await db.select().from(accountingSchema.document).where(and(eq(accountingSchema.document.id, id), eq(accountingSchema.document.organizationId, orgId as string))).limit(1);
  if (!doc.length) return reply.code(404).send({ error: 'Not Found' });
  return doc[0];
});

// POST /api/accounting/documents
fastify.post('/api/accounting/documents', async (request: any, reply: any) => {
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  const body = request.body as any;
  const newDoc = await db.insert(accountingSchema.document).values({
    id: crypto.randomUUID(),
    organizationId: orgId as string,
    type: body.type || 'invoice',
    refNumber: body.refNumber || 'DOC-001',
    clientName: body.clientName || 'Unknown',
    total: body.total || '0',
    subtotal: body.subtotal || '0',
    vatAmount: body.vatAmount || '0',
    vatRate: body.vatRate || '16.00',
    currency: body.currency || 'KES',
    issueDate: body.issueDate ? new Date(body.issueDate) : new Date(),
    dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    clientCo: body.clientCo,
    clientSpec: body.clientSpec,
    clientAddress: body.clientAddress,
    notes: body.notes,
    status: 'draft',
    sequenceId: 1,
  }).returning();
  return newDoc[0];
});

// DELETE /api/accounting/documents/:id
fastify.delete('/api/accounting/documents/:id', async (request: any, reply: any) => {
  const { id } = request.params;
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  await db.delete(accountingSchema.documentLineItem).where(eq(accountingSchema.documentLineItem.documentId, id));
  await db.delete(accountingSchema.document).where(and(eq(accountingSchema.document.id, id), eq(accountingSchema.document.organizationId, orgId as string)));
  return { success: true };
});

// GET /api/accounting/template
fastify.get('/api/accounting/template', async (request: any, reply: any) => {
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  const template = await db.select().from(accountingSchema.documentTemplate).where(eq(accountingSchema.documentTemplate.organizationId, orgId as string)).limit(1);
  return template[0] || {};
});

// POST /api/accounting/template
fastify.post('/api/accounting/template', async (request: any, reply: any) => {
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  const body = request.body as any;
  const existing = await db.select().from(accountingSchema.documentTemplate).where(eq(accountingSchema.documentTemplate.organizationId, orgId as string)).limit(1);
  if (existing.length) {
    return (await db.update(accountingSchema.documentTemplate).set(body).where(eq(accountingSchema.documentTemplate.id, existing[0].id)).returning())[0];
  } else {
    return (await db.insert(accountingSchema.documentTemplate).values({ id: crypto.randomUUID(), organizationId: orgId as string, ...body }).returning())[0];
  }
});

// GET /api/accounting/settings
fastify.get('/api/accounting/settings', async (request: any, reply: any) => {
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  const settings = await db.select().from(accountingSchema.accountingSettings).where(eq(accountingSchema.accountingSettings.organizationId, orgId as string)).limit(1);
  return settings[0] || {};
});

// POST /api/accounting/settings
fastify.post('/api/accounting/settings', async (request: any, reply: any) => {
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  const body = request.body as any;
  const existing = await db.select().from(accountingSchema.accountingSettings).where(eq(accountingSchema.accountingSettings.organizationId, orgId as string)).limit(1);
  if (existing.length) {
    return (await db.update(accountingSchema.accountingSettings).set(body).where(eq(accountingSchema.accountingSettings.id, existing[0].id)).returning())[0];
  } else {
    return (await db.insert(accountingSchema.accountingSettings).values({ id: crypto.randomUUID(), organizationId: orgId as string, ...body }).returning())[0];
  }
});

// GET /api/accounting/categories
fastify.get('/api/accounting/categories', async (request: any, reply: any) => {
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  const type = request.query.type as string;

  const where = type
    ? and(eq(accountingSchema.transactionCategory.organizationId, orgId as string), eq(accountingSchema.transactionCategory.type, type))
    : eq(accountingSchema.transactionCategory.organizationId, orgId as string);

  const categories = await db.select().from(accountingSchema.transactionCategory).where(where);

  if (!categories.length) {
    const defaults = type === 'income'
      ? ['Sales', 'Services', 'Consulting', 'Grants', 'Other Income']
      : ['Rent', 'Salaries', 'Utilities', 'Supplies', 'Marketing', 'Travel', 'Other Expense'];
    return defaults.map((name, i) => ({ id: 'default-' + i, name, type: type || 'expense', organizationId: orgId, isCustom: false }));
  }
  return categories;
});

// POST /api/accounting/categories
fastify.post('/api/accounting/categories', async (request: any, reply: any) => {
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  const body = request.body as any;
  const newCat = await db.insert(accountingSchema.transactionCategory).values({
    id: crypto.randomUUID(),
    organizationId: orgId as string,
    type: body.type || 'expense',
    name: body.name,
    isCustom: true,
    color: body.color,
  }).returning();
  return newCat[0];
});

// GET /api/accounting/transactions
fastify.get('/api/accounting/transactions', async (request: any, reply: any) => {
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  const type = request.query.type as string;
  const txs = await db.select().from(accountingSchema.transaction).where(eq(accountingSchema.transaction.organizationId, orgId as string));
  return type ? txs.filter((t: any) => t.type === type) : txs;
});

// POST /api/accounting/transactions
fastify.post('/api/accounting/transactions', async (request: any, reply: any) => {
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  const body = request.body as any;
  const newTx = await db.insert(accountingSchema.transaction).values({
    id: crypto.randomUUID(),
    organizationId: orgId as string,
    type: body.type || 'expense',
    amount: body.amount,
    description: body.description || '',
    vendorOrSource: body.vendorOrSource,
    currency: body.currency || 'KES',
    date: body.date ? new Date(body.date) : new Date(),
    categoryId: body.categoryId,
    notes: body.notes,
  }).returning();
  return newTx[0];
});

// GET /api/accounting/transactions/summary
fastify.get('/api/accounting/transactions/summary', async (request: any, reply: any) => {
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  const txs = await db.select().from(accountingSchema.transaction).where(eq(accountingSchema.transaction.organizationId, orgId as string));
  let income = 0;
  let expenses = 0;
  txs.forEach((t: any) => {
    if (t.type === 'income') income += parseFloat(t.amount || '0');
    if (t.type === 'expense') expenses += parseFloat(t.amount || '0');
  });
  return { income, expenses, balance: income - expenses };
});

// DELETE /api/accounting/transactions/:id
fastify.delete('/api/accounting/transactions/:id', async (request: any, reply: any) => {
  const { id } = request.params;
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  await db.delete(accountingSchema.transaction).where(and(eq(accountingSchema.transaction.id, id), eq(accountingSchema.transaction.organizationId, orgId as string)));
  return { success: true };
});

// POST /api/accounting/transactions/scan (AI receipt scanning stub)
fastify.post('/api/accounting/transactions/scan', async (request: any, reply: any) => {
  return { success: false, message: 'AI scanning not yet configured' };
});

}
