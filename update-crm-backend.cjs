const fs = require('fs');
let content = fs.readFileSync('apps/service-crm/src/index.ts', 'utf8');

const newCode = `
import { GoogleGenAI } from '@google/genai';
const ai = process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

fastify.get('/api/crm/tickets/:id/messages', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params;
  const records = await db.select().from(crmSchema.ticketMessage).where(eq(crmSchema.ticketMessage.ticketId, id)).orderBy(crmSchema.ticketMessage.createdAt);
  return { messages: records };
});

fastify.post('/api/crm/tickets/:id/messages', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params;
  const body = request.body;
  
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
  const { id } = request.params;
  
  if (!ai) return reply.code(500).send({ error: 'Gemini AI not configured' });
  
  const ticket = await db.select().from(crmSchema.ticket).where(eq(crmSchema.ticket.id, id));
  if (!ticket[0]) return reply.code(404).send({ error: 'Ticket not found' });
  
  const messages = await db.select().from(crmSchema.ticketMessage).where(eq(crmSchema.ticketMessage.ticketId, id)).orderBy(crmSchema.ticketMessage.createdAt);
  
  const prompt = \`
  You are an AI Copilot for a customer support agent.
  Draft a polite, helpful reply to the customer for the following ticket.
  
  Ticket Subject: \${ticket[0].subject}
  Ticket Description: \${ticket[0].description}
  
  Recent messages:
  \${messages.map(m => \`[\${m.senderType}]: \${m.bodyHtml}\`).join('\\n')}
  
  Provide ONLY the text of the suggested reply. Do not include introductory conversational text.\`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });
  
  return { draft: response.text };
});

const start = async () => {`;

content = content.replace('const start = async () => {', newCode);
fs.writeFileSync('apps/service-crm/src/index.ts', content);
console.log('Backend updated');
