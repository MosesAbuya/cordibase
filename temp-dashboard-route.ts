  fastify.get('/api/crm/dashboard/summary', async (request: any, reply) => {
      console.log("HIT /api/crm/dashboard/summary");
      const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
      console.log("orgId:", orgId);
      if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
      
      // Revenue & Transactions
      let txns: any[] = [];
      try {
        txns = await db.select().from((accountingSchema as any).transaction).where(eq((accountingSchema as any).transaction.organizationId, orgId));
      } catch(e) {
        console.error("Txns error:", e);
      }
      
      let totalIncome = 0;
      for (const t of txns) {
        if (t.type === 'income') totalIncome += Number(t.amount);
      }
      
      // Deals
      const deals = await db.select().from(crmSchema.deal).where(eq(crmSchema.deal.organizationId, orgId));
      const activeDeals = deals.filter(d => d.stage !== 'closed_won' && d.stage !== 'closed_lost').length;
      
      // Conversion Rate
      const wonDeals = deals.filter(d => d.stage === 'closed_won').length;
      const conversionRate = deals.length > 0 ? ((wonDeals / deals.length) * 100).toFixed(1) : "0.0";
      
      // Contacts
      const contacts = await db.select().from(crmSchema.contact).where(eq(crmSchema.contact.organizationId, orgId));
      const totalContacts = contacts.length;
      
      console.log("Returning:", { revenue: totalIncome, activeDeals, conversionRate, totalContacts });
      return {
        revenue: totalIncome,
        activeDeals,
        conversionRate,
        totalContacts
      };
    });
