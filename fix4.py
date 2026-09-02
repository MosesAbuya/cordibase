import re
with open('apps/service-crm/src/index.ts', 'r', encoding='utf-8') as f:
    content = f.read()

pattern = r"fastify\.delete\('/api/crm/tickets/:id', async \(request, reply\) => \{\r?\n  const orgId = request\.headers\['x-org-id'\] \|\| \(request as any\)\.activeOrganizationId;\r?\n  if \(\!orgId\) return reply\.code\(403\)\.send\(\{ error: 'Forbidden' \}\);\r?\n  const \{ id \} = request\.params as \{ id: string \};\r?\n  await db\.delete\(crmSchema\.ticket\)\.where\(and\(eq\(crmSchema\.ticket\.id, id\), eq\(crmSchema\.ticket\.organizationId, orgId as string\)\)\);\r?\n  return \{ success: true \};\r?\n\}\);\r?\n\r?\nfastify\.delete\('/api/crm/tickets', async \(request, reply\) => \{\r?\n  const orgId = request\.headers\['x-org-id'\] \|\| \(request as any\)\.activeOrganizationId;\r?\n  if \(\!orgId\) return reply\.code\(403\)\.send\(\{ error: 'Forbidden' \}\);\r?\n  const body = request\.body as \{ ids: string\[\] \};\r?\n  if \(\!body\.ids \|\| body\.ids\.length === 0\) return \{ success: true \};\r?\n  await db\.delete\(crmSchema\.ticket\)\.where\(and\(inArray\(crmSchema\.ticket\.id, body\.ids\), eq\(crmSchema\.ticket\.organizationId, orgId\)\)\);\r?\n  return \{ success: true \};\r?\n\}\);"

new_content = re.sub(pattern, "", content)

with open('apps/service-crm/src/index.ts', 'w', encoding='utf-8') as f:
    f.write(new_content)
