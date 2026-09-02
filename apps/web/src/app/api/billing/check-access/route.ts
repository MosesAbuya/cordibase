import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { schema } from '@cordibase/shared-db';
import { eq } from 'drizzle-orm';

export async function GET(req: Request) {
  try {
    const orgId = req.headers.get('x-org-id') || req.headers.get('x-active-org-id');
    if (!orgId) {
      return NextResponse.json({ redirect: '/select-organization' });
    }

    const org = await db.query.organization.findFirst({
      where: eq(schema.organization.id, orgId),
    });

    if (!org) {
      return NextResponse.json({ redirect: '/select-organization' });
    }

    if (org.onboardingStatus === 'pending_payment_method') {
      return NextResponse.json({ redirect: '/onboarding/payment' });
    }

    if (org.onboardingStatus === 'pending_details') {
      return NextResponse.json({ redirect: '/onboarding' });
    }

    if (org.onboardingStatus === 'past_due' || org.onboardingStatus === 'canceled') {
      return NextResponse.json({ redirect: '/dashboard/settings/billing' });
    }

    return NextResponse.json({ allowed: true, org });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
