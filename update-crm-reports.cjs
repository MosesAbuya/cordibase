const fs = require('fs');
let content = fs.readFileSync('apps/service-crm/src/index.ts', 'utf8');

// Ensure reportsSchema is imported
if (!content.includes('reportsSchema')) {
    content = content.replace('import { createDbClient, crmSchema } from \'@cordibase/shared-db\';', 'import { createDbClient, crmSchema, reportsSchema } from \'@cordibase/shared-db\';');
}

const reportsEndpoints = `
// === Reports & Dashboards ===
fastify.get('/api/crm/reports/dashboards', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const dashboards = await db.select().from(reportsSchema.dashboard).where(eq(reportsSchema.dashboard.orgId, orgId));
  return { dashboards };
});

fastify.post('/api/crm/reports/query', async (request, reply) => {
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const body = request.body;
  const { collection, metrics, dimensions, timeRange } = body;
  
  // Generic Query Engine Simulator for Phase 7
  // In a full implementation, we'd map "collection" to drizzle schemas dynamically
  // and construct SQL group_by statements.
  // For the MVP, we'll build a few dynamic paths and mock the generic translation.
  
  let result = [];
  
  if (collection === 'tickets') {
    const records = await db.select().from(crmSchema.ticket).where(eq(crmSchema.ticket.organizationId, orgId));
    // Memory aggregate (MVP generic engine)
    const grouped = {};
    for (const r of records) {
      let key = dimensions.map(d => r[d]).join('-');
      if (!key) key = 'total';
      if (!grouped[key]) grouped[key] = { count: 0, _label: key };
      grouped[key].count++;
    }
    result = Object.values(grouped);
  } else if (collection === 'deals') {
    const records = await db.select().from(crmSchema.deal).where(eq(crmSchema.deal.organizationId, orgId));
    const grouped = {};
    for (const r of records) {
      let key = dimensions.map(d => r[d]).join('-');
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
`;

if (!content.includes('/api/crm/reports/query')) {
    content = content.replace(/fastify\.listen/g, `${reportsEndpoints}\nfastify.listen`);
    fs.writeFileSync('apps/service-crm/src/index.ts', content);
    console.log('Injected reports API endpoints');
} else {
    console.log('Reports API already exists');
}
