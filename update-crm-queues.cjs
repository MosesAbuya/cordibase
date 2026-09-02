const fs = require('fs');
let content = fs.readFileSync('apps/service-crm/src/index.ts', 'utf8');

const queuesApi = `
fastify.get('/api/crm/queues', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const records = await db.select().from(crmSchema.supportQueue).where(eq(crmSchema.supportQueue.organizationId, orgId));
  return { queues: records };
});

fastify.post('/api/crm/queues', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const body = request.body;
  const newQ = await db.insert(crmSchema.supportQueue).values({
    id: crypto.randomUUID(),
    organizationId: orgId,
    name: body.name,
    description: body.description || ''
  }).returning();
  return { queue: newQ[0] };
});
`;

content = content.replace('const start = async () => {', queuesApi + '\nconst start = async () => {');

// Update ticket PUT endpoint to allow queueId
content = content.replace(
  'assigneeId: body.assigneeId,',
  'assigneeId: body.assigneeId,\n    queueId: body.queueId,'
);
// Also in POST if it exists, but we mostly care about PUT for reassignment.

fs.writeFileSync('apps/service-crm/src/index.ts', content);
console.log('Queues API added.');
