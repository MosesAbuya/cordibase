import Fastify from 'fastify';

import { createDbClient, accountingSchema, crmSchema, authSchema } from '@cordibase/shared-db';
import { eq, and, inArray } from 'drizzle-orm';
import dotenv from 'dotenv';
import path from 'path';
import { createPayrollWorker } from '@cordibase/shared-events';
import { FastifyInstance } from 'fastify';

export default async function pluginRoutes(fastify: FastifyInstance, opts: any) {







// Load env from monorepo root
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });


const db = createDbClient(process.env.DATABASE_URL!);

// CORS Configuration


// Middleware to extract Active Organization ID from cross-service request
fastify.addHook('preHandler', async (request, reply) => {
  if (request.method === 'OPTIONS') return;

  const cookieHeader = request.headers.cookie;
  if (!cookieHeader && !request.headers['x-org-id']) {
    return reply.code(401).send({ error: 'Unauthorized: No session cookie or org header provided' });
  }

  try {
    const authRes = await fetch('http://localhost:3001/api/auth/get-session', {
      headers: { cookie: cookieHeader || '' }
    });
    const sessionData = await authRes.json() as any as any;

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

// GET /api/accounting/invoices
fastify.get('/api/accounting/invoices', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) {
    return reply.code(403).send({ error: 'Forbidden: No active organization context' });
  }

  const invoices = await db.select().from(accountingSchema.invoice).where(eq(accountingSchema.invoice.organizationId, orgId as string));
  return { invoices };
});

// POST /api/accounting/invoices
fastify.post('/api/accounting/invoices', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) {
    return reply.code(403).send({ error: 'Forbidden: No active organization context' });
  }

  const body = request.body as any;
  if (!body.customerId || !body.invoiceNumber) {
    return reply.code(400).send({ error: 'Bad Request: customerId and invoiceNumber are required' });
  }

  const newInvoice = await db.insert(accountingSchema.invoice).values({
    id: crypto.randomUUID(),
    organizationId: orgId as string,
    companyId: body.customerId,
    invoiceNumber: body.invoiceNumber,
    status: 'draft',
    subtotal: body.subtotal || "0",
    total: body.total || "0",
    dueDate: new Date(body.dueDate || Date.now()),
  }).returning();

  return newInvoice[0];
});

// Worker setup




}
