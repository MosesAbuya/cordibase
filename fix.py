import re
with open('apps/service-crm/src/index.ts', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r"id: crypto\.randomUUID\(\),\s*organizationId: orgId,\s*name: body\.name,\s*if \(\!orgId\) return reply\.code\(403\)\.send\(\{ error: 'Forbidden' \}\);\s*const \{ id \} = request\.params as \{ id: string \};\s*await db\.delete\(crmSchema\.ticket\)\.where\(and\(eq\(crmSchema\.ticket\.id, id\), eq\(crmSchema\.ticket\.organizationId, orgId\)\)\);\s*return \{ success: true \};\s*\}\);"

replacement = r"""id: crypto.randomUUID(),
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
});"""

new_content = re.sub(pattern, replacement, content)
with open('apps/service-crm/src/index.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)
