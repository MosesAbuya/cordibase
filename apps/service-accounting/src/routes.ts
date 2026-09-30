import { GoogleGenAI } from "@google/genai";
import { createDbClient, accountingSchema, authSchema } from '@cordibase/shared-db';
import { eq, and } from 'drizzle-orm';
import dotenv from 'dotenv';
import path from 'path';
import { FastifyInstance } from 'fastify';

export default async function pluginRoutes(fastify: FastifyInstance, opts: any) {

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const db = createDbClient(process.env.DATABASE_URL!);

fastify.addHook('preHandler', async (request, reply) => {
  if (request.method === 'OPTIONS') return;

  const cookieHeader = request.headers.cookie;
  if (!cookieHeader && !request.headers['x-org-id']) {
    return reply.code(401).send({ error: 'Unauthorized: No session cookie or org header provided' });
  }

  try {
    const authRes = await fetch((process.env.BETTER_AUTH_URL ? process.env.BETTER_AUTH_URL.replace('/api/auth', '') : (process.env.CORE_SERVICE_INTERNAL_URL || 'http://127.0.0.1:3000')) + '/api/auth/get-session', {
      headers: { cookie: cookieHeader || '' }
    });
    const sessionData = await authRes.json() as any;

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

// GET /api/accounting/documents
fastify.get('/api/accounting/documents', async (request: any, reply: any) => {
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  if (!orgId) return reply.code(403).send({ error: 'Forbidden' });
  const type = request.query.type as string;
  const allDocs = await db.select().from(accountingSchema.document).where(eq(accountingSchema.document.organizationId, orgId as string));
  const filtered = type ? allDocs.filter((d: any) => d.type === type) : allDocs;
  // Return wrapped in { documents } since frontend does data.documents
  return { documents: filtered };
});

// GET /api/accounting/documents/:id
fastify.get('/api/accounting/documents/:id', async (request: any, reply: any) => {
  const { id } = request.params;
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  const doc = await db.select().from(accountingSchema.document).where(and(eq(accountingSchema.document.id, id), eq(accountingSchema.document.organizationId, orgId as string))).limit(1);
  if (!doc.length) return reply.code(404).send({ error: 'Not Found' });

  const lineItems = await db.select().from(accountingSchema.documentLineItem).where(eq(accountingSchema.documentLineItem.documentId, id));
  const template = await db.select().from(accountingSchema.documentTemplate).where(eq(accountingSchema.documentTemplate.organizationId, orgId as string)).limit(1);

  return { document: doc[0], lineItems, template: template[0] || {} };
});

// POST /api/accounting/documents
fastify.post('/api/accounting/documents', async (request: any, reply: any) => {
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  const body = request.body as any; 
  
  // Use a reference format or fallback
  const refNum = body.refNumber || 'DOC-001';

  const newDoc = await db.insert(accountingSchema.document).values({
    id: crypto.randomUUID(),
    organizationId: orgId as string,
    type: body.type || 'invoice',
    refNumber: refNum,
    clientName: body.clientName || 'Unknown',
    total: body.total || '0',
    subtotal: body.subtotal || '0',
    vatAmount: body.vatAmount || '0',
    vatRate: body.vatRate || '16.00',
    amountPaid: body.amountPaid || '0',
    balanceDue: body.balanceDue || '0',
    currency: body.currency || 'KES',
    issueDate: body.issueDate ? new Date(body.issueDate) : new Date(),
    dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    clientCo: body.clientCo,
    clientSpec: body.clientSpec,
    clientAddress: body.clientAddress,
    notes: body.notes,
    status: 'draft',
    sequenceId: 1,
  }).returning();

  const docId = newDoc[0].id;
  const items = body.items || [];
  for (let i = 0; i < items.length; i++) {
    await db.insert(accountingSchema.documentLineItem).values({
      id: crypto.randomUUID(),
      documentId: docId,
      sortOrder: i,
      particulars: items[i].particulars || 'Item',
      price: items[i].price || '0',
      qty: items[i].qty || '1',
      total: items[i].total || '0'
    });
  }

  return newDoc[0];
});

// DELETE /api/accounting/documents/:id
fastify.delete('/api/accounting/documents/:id', async (request: any, reply: any) => {
  const { id } = request.params;
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  await db.delete(accountingSchema.documentLineItem).where(eq(accountingSchema.documentLineItem.documentId, id));
  await db.delete(accountingSchema.document).where(and(eq(accountingSchema.document.id, id), eq(accountingSchema.document.organizationId, orgId as string)));
  return { success: true };
});

// GET /api/accounting/template
fastify.get('/api/accounting/template', async (request: any, reply: any) => {
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  const template = await db.select().from(accountingSchema.documentTemplate).where(eq(accountingSchema.documentTemplate.organizationId, orgId as string)).limit(1);
  return template[0] || {};
});

// POST /api/accounting/template
fastify.post('/api/accounting/template', async (request: any, reply: any) => {
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  const body = request.body as any; 
  const existing = await db.select().from(accountingSchema.documentTemplate).where(eq(accountingSchema.documentTemplate.organizationId, orgId as string)).limit(1);
  if (existing.length) {
    return (await db.update(accountingSchema.documentTemplate).set(body).where(eq(accountingSchema.documentTemplate.id, existing[0].id)).returning())[0];
  } else {
    return (await db.insert(accountingSchema.documentTemplate).values({ id: crypto.randomUUID(), organizationId: orgId as string, ...body }).returning())[0];
  }
});

// GET /api/accounting/settings
fastify.get('/api/accounting/settings', async (request: any, reply: any) => {
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  const settings = await db.select().from(accountingSchema.accountingSettings).where(eq(accountingSchema.accountingSettings.organizationId, orgId as string)).limit(1);
  return settings[0] || {};
});

// POST /api/accounting/settings
fastify.post('/api/accounting/settings', async (request: any, reply: any) => {
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  const body = request.body as any; 
  const existing = await db.select().from(accountingSchema.accountingSettings).where(eq(accountingSchema.accountingSettings.organizationId, orgId as string)).limit(1);
  if (existing.length) {
    return (await db.update(accountingSchema.accountingSettings).set(body).where(eq(accountingSchema.accountingSettings.id, existing[0].id)).returning())[0];
  } else {
    return (await db.insert(accountingSchema.accountingSettings).values({ id: crypto.randomUUID(), organizationId: orgId as string, ...body }).returning())[0];
  }
});

// GET /api/accounting/categories
fastify.get('/api/accounting/categories', async (request: any, reply: any) => {
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  const type = request.query.type as string;

  const where = type
    ? and(eq(accountingSchema.transactionCategory.organizationId, orgId as string), eq(accountingSchema.transactionCategory.type, type))
    : eq(accountingSchema.transactionCategory.organizationId, orgId as string);

  const categories = await db.select().from(accountingSchema.transactionCategory).where(where);

  if (!categories.length) {
    const defaults = type === 'income'
      ? ['Sales', 'Services', 'Consulting', 'Grants', 'Other Income']
      : ['Rent', 'Salaries', 'Utilities', 'Supplies', 'Marketing', 'Travel', 'Other Expense'];
    const insertedCategories: any[] = []; for (const name of defaults) { const newCat = await db.insert(accountingSchema.transactionCategory).values({ id: crypto.randomUUID(), organizationId: orgId as string, name, type: type || 'expense', isCustom: false }).returning(); insertedCategories.push(newCat[0]); } return insertedCategories;
  }
  return categories;
});

// POST /api/accounting/categories
fastify.post('/api/accounting/categories', async (request: any, reply: any) => {
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  const body = request.body as any; 
  const newCat = await db.insert(accountingSchema.transactionCategory).values({
    id: crypto.randomUUID(),
    organizationId: orgId as string,
    type: body.type || 'expense',
    name: body.name,
    isCustom: true,
    color: body.color,
  }).returning();
  return newCat[0];
});

// GET /api/accounting/transactions
fastify.get('/api/accounting/transactions', async (request: any, reply: any) => {
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  const type = request.query.type as string;
  const txs = await db.select().from(accountingSchema.transaction).where(eq(accountingSchema.transaction.organizationId, orgId as string));
  const filtered = type ? txs.filter((t: any) => t.type === type) : txs;
  // Return wrapped in { transactions } since frontend does data.transactions
  return { transactions: filtered };
});

// POST /api/accounting/transactions
fastify.post('/api/accounting/transactions', async (request: any, reply: any) => {
  try {
    const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
    const body = request.body as any;

    // Validate categoryId against DB to prevent foreign key violations
    let validCategoryId: string | null = body.categoryId || null;
    if (validCategoryId) {
      const existingCat = await db
        .select({ id: accountingSchema.transactionCategory.id })
        .from(accountingSchema.transactionCategory)
        .where(eq(accountingSchema.transactionCategory.id, validCategoryId))
        .limit(1);
      if (!existingCat.length) {
        validCategoryId = null;
      }
    }

    const insertData: any = {
      id: crypto.randomUUID(),
      organizationId: orgId as string,
      type: body.type || 'expense',
      amount: (parseFloat(body.amount) || 0).toString(),
      description: body.description || '',
      vendorOrSource: body.vendorOrSource || null,
      currency: body.currency || 'KES',
      date: body.date ? new Date(body.date) : new Date(),
      categoryId: validCategoryId,
      notes: body.notes || null,
    };

    const newTx = await db.insert(accountingSchema.transaction).values(insertData).returning();
    return newTx[0];
  } catch (err: any) {
    request.log.error(err);
    return reply.status(500).send({ error: err.message });
  }
});

// GET /api/accounting/transactions/summary
fastify.get('/api/accounting/transactions/summary', async (request: any, reply: any) => {
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  const txs = await db.select().from(accountingSchema.transaction).where(eq(accountingSchema.transaction.organizationId, orgId as string));
  let totalIncome = 0;
  let totalExpenses = 0;
  txs.forEach((t: any) => {
    if (t.type === 'income') totalIncome += parseFloat(t.amount || '0');
    if (t.type === 'expense') totalExpenses += parseFloat(t.amount || '0');
  });
  return { totalIncome, totalExpenses, netPL: totalIncome - totalExpenses };
});

// DELETE /api/accounting/transactions/:id
fastify.delete('/api/accounting/transactions/:id', async (request: any, reply: any) => {
  const { id } = request.params;
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  await db.delete(accountingSchema.transaction).where(and(eq(accountingSchema.transaction.id, id), eq(accountingSchema.transaction.organizationId, orgId as string)));
  return { success: true };
});

// PATCH /api/accounting/transactions/:id
fastify.patch('/api/accounting/transactions/:id', async (request: any, reply: any) => {
  const { id } = request.params;
  const orgId = request.headers['x-org-id'] || request.activeOrganizationId;
  const body = request.body as any;
  
  const setData: any = {};
  if (body.status !== undefined) setData.status = body.status;
  if (body.description !== undefined) setData.description = body.description;
  if (body.notes !== undefined) setData.notes = body.notes;
  
  const updatedTx = await db.update(accountingSchema.transaction)
    .set(setData)
    .where(and(eq(accountingSchema.transaction.id, id), eq(accountingSchema.transaction.organizationId, orgId as string)))
    .returning();
    
  return updatedTx[0];
});

// POST /api/accounting/transactions/scan (AI receipt scanning)
fastify.post('/api/accounting/transactions/scan', async (request: any, reply: any) => {
  try {
    const { imageBase64, mimeType } = request.body;
    if (!imageBase64) return reply.status(400).send({ error: 'No image provided' });
    
    // Fallback if not configured
    if (!process.env.GEMINI_API_KEY) {
      return reply.status(500).send({ error: "AI scanning requires GEMINI_API_KEY" });
    }

    const ai = new GoogleGenAI({});
    const prompt = `
You are an expert accountant scanning a receipt.
Extract the info from this receipt image.
Return EXACTLY a JSON object with this schema and NO markdown formatting:
{
  "vendor_name": "string (name of the store/vendor)",
  "total_amount": "number (the final total amount, numbers only)",
  "currency": "string (3 letter code, guess from symbol, default USD)",
  "date": "string (YYYY-MM-DD)",
  "description": "string (brief summary of items)",
  "suggested_category": "string (e.g. 'Office Supplies', 'Software Subscriptions', 'Travel & Transport', 'Meals & Entertainment', 'Utilities', 'Marketing & Advertising', 'Professional Services', 'Rent & Lease', 'Other')"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        prompt,
        {
          inlineData: {
            data: imageBase64,
            mimeType: mimeType || 'image/jpeg'
          }
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
             vendor_name: { type: "STRING" },
             total_amount: { type: "NUMBER" },
             currency: { type: "STRING" },
             date: { type: "STRING" },
             description: { type: "STRING" },
             suggested_category: { type: "STRING" }
          },
          required: ["vendor_name", "total_amount", "currency", "date", "description", "suggested_category"]
        }
      }
    });

    let text = response.text;
    if (!text) {
      console.error("Gemini returned empty text! Full response:", JSON.stringify(response, null, 2));
      text = "{}";
    }
    
    text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let extracted: any = {};
    try {
      extracted = JSON.parse(text);
    } catch (parseError) {
      console.error("Failed to parse Gemini output:", text);
      throw new Error("AI returned invalid data format");
    }
    
    // Ensure it's not totally empty if Gemini failed strictly
    if (!extracted.vendor_name) extracted.vendor_name = "N/A";
    if (extracted.total_amount === undefined) extracted.total_amount = 0;

    return { success: true, extracted };
  } catch (e: any) {
    console.error("AI Scan Error:", e);
    return reply.status(500).send({ error: e.message || "Failed to scan receipt" });
  }
});

}
