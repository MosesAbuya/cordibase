const fs = require('fs');
let content = fs.readFileSync('apps/service-crm/src/index.ts', 'utf8');

const replacement =     id: crypto.randomUUID(),
    organizationId: orgId as string,
    name: body.name,
  }).returning();
  return { queue: newQ[0] };
});

fastify.delete('/api/crm/tickets/:id', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || (request as any).activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const { id } = request.params as { id: string };
  await db.delete(crmSchema.ticket).where(and(eq(crmSchema.ticket.id, id), eq(crmSchema.ticket.organizationId, orgId as string)));
  return { success: true };
});;

const regex = /id: crypto\.randomUUID\(\),\r?\n\s*organizationId: orgId,\r?\n\s*name: body\.name,\r?\n\s*if \(\!orgId\) return reply\.code\(403\)\.send\(\{ error: 'Forbidden' \}\);\r?\n\s*const \{ id \} = request\.params as \{ id: string \};\r?\n\s*await db\.delete\(crmSchema\.ticket\)\.where\(and\(eq\(crmSchema\.ticket\.id, id\), eq\(crmSchema\.ticket\.organizationId, orgId\)\)\);\r?\n\s*return \{ success: true \};\r?\n\}\);/s;

content = content.replace(regex, replacement);
fs.writeFileSync('apps/service-crm/src/index.ts', content);
