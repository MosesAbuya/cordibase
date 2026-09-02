const fs = require('fs');
let content = fs.readFileSync('apps/service-crm/src/index.ts', 'utf8');

const publicApi = `
fastify.post('/api/public/support/:orgId/tickets', async (request, reply) => {
  const { orgId } = request.params;
  const body = request.body;
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
`;

content = content.replace('const start = async () => {', publicApi + '\nconst start = async () => {');
fs.writeFileSync('apps/service-crm/src/index.ts', content);
console.log('Public Support API added.');
