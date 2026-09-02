import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { schema } from '@cordibase/shared-db';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const { 
      orgId, 
      type,
      companySize,
      industry,
      description,
      registrationNumber,
      address,
      poBox,
      city,
      country,
      contactPhone 
    } = await req.json();

    if (!orgId) {
      return NextResponse.json({ error: 'Missing organization ID' }, { status: 400 });
    }

    // Set the organization type and onboardingStatus
    await db.update(schema.organization)
      .set({
        type: type === 'personal' ? 'personal' : 'business',
        onboardingStatus: 'pending_payment_method'
      })
      .where(eq(schema.organization.id, orgId));

    // Upsert into workspaceSettings
    const existingSettings = await db.query.workspaceSettings.findFirst({
        where: eq(schema.workspaceSettings.organizationId, orgId)
    });

    if (existingSettings) {
        await db.update(schema.workspaceSettings)
            .set({
                orgType: type,
                companySize,
                industry,
                description,
                registrationNumber,
                address,
                poBox,
                city,
                country,
                contactPhone
            })
            .where(eq(schema.workspaceSettings.organizationId, orgId));
    } else {
        await db.insert(schema.workspaceSettings).values({
            id: crypto.randomUUID(),
            organizationId: orgId,
            orgType: type,
            companySize,
            industry,
            description,
            registrationNumber,
            address,
            poBox,
            city,
            country,
            contactPhone
        });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
