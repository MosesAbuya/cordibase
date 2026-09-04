import Fastify from 'fastify';
import dotenv from 'dotenv';
import path from 'path';
import { auth, db } from './auth';
import { authSchema, schema } from '@cordibase/shared-db';
import { eq, and, ilike, or, desc } from 'drizzle-orm';
import crypto from 'crypto';
import { crmSchema, accountingSchema, hrmSchema } from '@cordibase/shared-db';
import { FastifyInstance } from 'fastify';

export default async function pluginRoutes(fastify: FastifyInstance, opts: any) {








dotenv.config({ path: path.resolve(__dirname, '../../../.env') }); // resolve to root .env



// Enable CORS manually
fastify.addHook('onRequest', (request, reply, done) => {
  reply.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  reply.header('Access-Control-Allow-Credentials', 'true');
  if (request.method === 'OPTIONS') {
    reply.send();
    return;
  }
  done();
});

// Mount Better Auth endpoints
fastify.all('/api/auth/*', async (request, reply) => {
  const url = `http://${request.headers.host}${request.url}`;
  
  const headers = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (Array.isArray(value)) {
      value.forEach(v => headers.append(key, v));
    } else if (typeof value === 'string') {
      headers.set(key, value);
    }
  }

  const req = new Request(url, {
    method: request.method,
    headers,
    body: (request.method === 'GET' || request.method === 'HEAD') ? undefined : JSON.stringify(request.body || {})
  });

  const response = await auth.handler(req);
  
  reply.status(response.status);
  response.headers.forEach((value, key) => {
    reply.header(key, value);
  });
  
  const text = await response.text();
  return text;
});

fastify.get('/health', async (request, reply) => {
  return { status: 'ok', service: 'service-core' };
});


fastify.post('/api/core/billing/checkout', async (request, reply) => {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) return reply.code(401).send({ error: 'Unauthorized' });

  const authRes = await fetch((process.env.CORE_SERVICE_INTERNAL_URL || 'http://127.0.0.1:3001') + '/api/auth/get-session', {
    headers: { cookie: cookieHeader }
  });
  const sessionData = await authRes.json() as any;
  if (!sessionData || !sessionData.session) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  const { moduleSlug, amount } = request.body as { moduleSlug: string, amount: number };
  const orgId = sessionData.session.activeOrganizationId;

  // Initialize Paystack transaction
  const paystackRes = await fetch('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email: sessionData.user.email,
      amount: amount * 100, // in kobo
      metadata: { orgId, moduleSlug }
    })
  });

  const paystackData = await paystackRes.json() as any;
  if (!paystackData.status) {
    return reply.code(400).send({ error: paystackData.message });
  }

  return { authorization_url: paystackData.data.authorization_url, access_code: paystackData.data.access_code };
});

fastify.post('/api/core/billing/webhook', async (request, reply) => {
  // Paystack verification
  const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!)
                     .update(JSON.stringify(request.body))
                     .digest('hex');
  if (hash !== request.headers['x-paystack-signature']) {
    return reply.code(401).send({ error: 'Invalid signature' });
  }

  const event = request.body as any;

  if (event.event === 'charge.success') {
    const { orgId, moduleSlug } = event.data.metadata;
    if (orgId && moduleSlug) {
      // Upsert subscription
      const existing = await db.select().from(authSchema.moduleSubscription)
        .where(and(eq(authSchema.moduleSubscription.organizationId, orgId), eq(authSchema.moduleSubscription.moduleSlug, moduleSlug)));
      
      if (existing.length > 0) {
        await db.update(authSchema.moduleSubscription)
          .set({ status: 'active', currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }) // 30 days
          .where(eq(authSchema.moduleSubscription.id, existing[0].id));
      } else {
        await db.insert(authSchema.moduleSubscription).values({
          id: crypto.randomUUID(),
          organizationId: orgId,
          moduleSlug,
          status: 'active',
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        });
      }
    }
  }

  return reply.send({ status: 'success' });
});

fastify.get('/api/core/billing/subscriptions', async (request, reply) => {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) return reply.code(401).send({ error: 'Unauthorized' });

  const authRes = await fetch((process.env.CORE_SERVICE_INTERNAL_URL || 'http://127.0.0.1:3001') + '/api/auth/get-session', {
    headers: { cookie: cookieHeader }
  });
  const sessionData = await authRes.json() as any;
  if (!sessionData || !sessionData.session) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  const orgId = sessionData.session.activeOrganizationId;
  const subscriptions = await db.select().from(authSchema.moduleSubscription)
    .where(eq(authSchema.moduleSubscription.organizationId, orgId));
  
  return { subscriptions };
});

fastify.post('/api/core/billing/verify', async (request, reply) => {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) return reply.code(401).send({ error: 'Unauthorized' });

  const authRes = await fetch((process.env.CORE_SERVICE_INTERNAL_URL || 'http://127.0.0.1:3001') + '/api/auth/get-session', {
    headers: { cookie: cookieHeader }
  });
  const sessionData = await authRes.json() as any;
  if (!sessionData || !sessionData.session) {
    return reply.code(401).send({ error: 'Unauthorized' });
  }

  const { reference, moduleSlug } = request.body as { reference: string, moduleSlug: string };
  const orgId = sessionData.session.activeOrganizationId;

  const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
    }
  });
  
  const verifyData = await verifyRes.json() as any;
  if (verifyData.data.status === 'success') {
    // Upsert subscription
    const existing = await db.select().from(authSchema.moduleSubscription)
      .where(and(eq(authSchema.moduleSubscription.organizationId, orgId), eq(authSchema.moduleSubscription.moduleSlug, moduleSlug)));
    
    if (existing.length > 0) {
      await db.update(authSchema.moduleSubscription)
        .set({ status: 'active', currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) }) // 30 days
        .where(eq(authSchema.moduleSubscription.id, existing[0].id));
    } else {
      await db.insert(authSchema.moduleSubscription).values({
        id: crypto.randomUUID(),
        organizationId: orgId,
        moduleSlug,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      });
    }
    return { status: 'success' };
  } else {
    return reply.code(400).send({ error: 'Payment verification failed' });
  }
});




fastify.get('/api/core/organization/members', async (request, reply) => {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) return reply.code(401).send({ error: 'Unauthorized' });

  const authRes = await fetch((process.env.CORE_SERVICE_INTERNAL_URL || 'http://127.0.0.1:3001') + '/api/auth/get-session', { headers: { cookie: cookieHeader } });
  const sessionData = await authRes.json() as any;

  // Use userId from session (always present) — don't rely on activeOrganizationId
  const userId = sessionData?.user?.id;
  if (!userId) return reply.code(401).send({ error: 'Unauthorized' });

  // Check if user is admin/owner
  const requesterMembership = await db.select({ role: authSchema.member.role, organizationId: authSchema.member.organizationId })
    .from(authSchema.member)
    .where(eq(authSchema.member.userId, userId))
    .limit(1);

  if (requesterMembership.length === 0 || !['owner', 'admin'].includes(requesterMembership[0].role)) {
    return reply.code(403).send({ error: 'Forbidden' });
  }

  const orgId = requesterMembership[0].organizationId;

  // Get all active members of that org with user details
  const activeMembers = await db.select({
    id: authSchema.member.id,
    role: authSchema.member.role,
    createdAt: authSchema.member.createdAt,
    userId: authSchema.user.id,
    name: authSchema.user.name,
    email: authSchema.user.email
  }).from(authSchema.member)
    .innerJoin(authSchema.user, eq(authSchema.member.userId, authSchema.user.id))
    .where(eq(authSchema.member.organizationId, orgId));

  // Get all pending invitations for that org
  const pendingInvites = await db.select({
    id: authSchema.invitation.id,
    role: authSchema.invitation.role,
    createdAt: authSchema.invitation.createdAt,
    userId: authSchema.invitation.id, // placeholder since they don't have a user yet
    name: authSchema.invitation.email, // fallback for name
    email: authSchema.invitation.email,
    status: authSchema.invitation.status
  }).from(authSchema.invitation)
    .where(
      and(
        eq(authSchema.invitation.organizationId, orgId),
        eq(authSchema.invitation.status, 'pending')
      )
    );

  // Combine them for the frontend
  const combined = [
    ...activeMembers.map((m: any) => ({ ...m, status: 'active' })),
    ...pendingInvites.map((i: any) => ({ ...i, name: '' })) // empty name forces the UI to show 'Pending' state
  ];

  // Sort by created at
  combined.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());

  return { members: combined };
});

fastify.delete('/api/core/organization/members/:id', async (request, reply) => {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) return reply.code(401).send({ error: 'Unauthorized' });

  const authRes = await fetch((process.env.CORE_SERVICE_INTERNAL_URL || 'http://127.0.0.1:3001') + '/api/auth/get-session', { headers: { cookie: cookieHeader } });
  const sessionData = await authRes.json() as any;
  const userId = sessionData?.user?.id;
  if (!userId) return reply.code(401).send({ error: 'Unauthorized' });

  const { id } = request.params as { id: string };

  // Verify requester is admin or owner
  const requesterMembership = await db.select().from(authSchema.member).where(eq(authSchema.member.userId, userId)).limit(1);
  if (requesterMembership.length === 0 || !['owner', 'admin'].includes(requesterMembership[0].role)) {
    return reply.code(403).send({ error: 'Forbidden: You do not have permission to remove members.' });
  }

  // Try deleting from member table first
  const deletedMember = await db.delete(authSchema.member)
    .where(eq(authSchema.member.id, id))
    .returning();

  // Try deleting from invitation table if not found in members
  if (deletedMember.length === 0) {
    await db.delete(authSchema.invitation)
      .where(eq(authSchema.invitation.id, id));
  }

  return { success: true };
});

fastify.get('/api/core/notifications', async (request, reply) => {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) return { notifications: [] };

  const authRes = await fetch((process.env.CORE_SERVICE_INTERNAL_URL || 'http://127.0.0.1:3001') + '/api/auth/get-session', { headers: { cookie: cookieHeader } });
  const sessionData = await authRes.json() as any;
  const orgId = sessionData?.session?.activeOrganizationId;
  if (!orgId) return { notifications: [] };

  const notifs = await db.select().from(authSchema.notification)
    .where(eq(authSchema.notification.organizationId, orgId as string))
    .orderBy(desc(authSchema.notification.createdAt))
    .limit(20);
  
  return { notifications: notifs };
});

fastify.patch('/api/core/notifications/:id/read', async (request, reply) => {
  const { id } = request.params as { id: string };
  await db.update(authSchema.notification)
    .set({ isRead: true })
    .where(eq(authSchema.notification.id, id));
  return { success: true };
});

fastify.get('/api/core/search', async (request, reply) => {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) return { results: [] };

  const authRes = await fetch((process.env.CORE_SERVICE_INTERNAL_URL || 'http://127.0.0.1:3001') + '/api/auth/get-session', { headers: { cookie: cookieHeader } });
  const sessionData = await authRes.json() as any;
  const orgId = sessionData?.session?.activeOrganizationId;
  if (!orgId) return { results: [] };
  
  const { q } = request.query as { q: string };
  if (!q || q.length < 2) return { results: [] };

  const searchStr = `%${q}%`;
  
  // Concurrently search all 3 modules
  const [customers, invoices, employees] = await Promise.all([
    db.select().from(crmSchema.company)
      .where(and(eq(crmSchema.company.organizationId, orgId as string), ilike(crmSchema.company.name, searchStr)))
      .limit(5),
    db.select().from(accountingSchema.invoice)
      .where(and(eq(accountingSchema.invoice.organizationId, orgId as string), ilike(accountingSchema.invoice.invoiceNumber, searchStr)))
      .limit(5),
    db.select().from(hrmSchema.employee)
      .where(and(eq(hrmSchema.employee.organizationId, orgId as string), or(ilike(hrmSchema.employee.firstName, searchStr), ilike(hrmSchema.employee.lastName, searchStr))))
      .limit(5)
  ]);

  const results = [
    ...customers.map((c: any) => ({ id: c.id, title: c.name, type: 'CRM Contact', link: `/dashboard/crm` })),
    ...invoices.map((i: any) => ({ id: i.id, title: `Invoice ${i.invoiceNumber}`, subtitle: `$${i.total}`, type: 'Accounting', link: `/dashboard/accounting` })),
    ...employees.map((e: any) => ({ id: e.id, title: `${e.firstName} ${e.lastName}`, subtitle: e.jobTitle, type: 'HRM Employee', link: `/dashboard/hrm` }))
  ];

  return { results };
});


// === Settings ===
fastify.post("/api/settings/smtp", async (request, reply) => {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) return reply.code(401).send({ error: "Unauthorized" });

  const authRes = await fetch(`${process.env.CORE_SERVICE_URL || 'http://localhost:3001'}/api/auth/get-session`, { headers: { cookie: cookieHeader } });
  const sessionData = await authRes.json() as any;
  const orgId = sessionData?.session?.activeOrganizationId;
  if (!orgId) return reply.code(401).send({ error: "Unauthorized" });

  const body = request.body as any;
  
  const existing = await db.select().from(schema.workspaceSettings).where(eq(schema.workspaceSettings.organizationId, orgId));
  
  if (existing.length > 0) {
    await db.update(schema.workspaceSettings).set({
      smtpHost: body.smtpHost,
      smtpPort: body.smtpPort,
      smtpUser: body.smtpUser,
      smtpPassword: body.smtpPassword,
      smtpFromEmail: body.smtpFromEmail
    }).where(eq(schema.workspaceSettings.id, existing[0].id));
  } else {
    await db.insert(schema.workspaceSettings).values({
      id: crypto.randomUUID(),
      organizationId: orgId,
      smtpHost: body.smtpHost,
      smtpPort: body.smtpPort,
      smtpUser: body.smtpUser,
      smtpPassword: body.smtpPassword,
      smtpFromEmail: body.smtpFromEmail
    });
  }
  
  return { success: true };
});



}
