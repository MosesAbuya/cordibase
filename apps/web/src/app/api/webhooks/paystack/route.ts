import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { schema } from '@cordibase/shared-db';
import { eq, and } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');
    
    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY || 'sk_test_placeholder';
    
    // Validate signature
    if (paystackSecret !== 'sk_test_placeholder') {
      const hash = crypto.createHmac('sha512', paystackSecret).update(rawBody).digest('hex');
      if (hash !== signature) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
      }
    }

    const event = JSON.parse(rawBody);

    if (event.event === 'charge.success') {
      const authCode = event.data.authorization?.authorization_code;
      if (authCode) {
        // Find the org by auth code
        const orgs = await db.query.organization.findMany({
          where: eq(schema.organization.paystackAuthorizationCode, authCode)
        });

        for (const org of orgs) {
          const nextPeriod = new Date();
          nextPeriod.setMonth(nextPeriod.getMonth() + 1);

          await db.update(schema.organization)
            .set({ onboardingStatus: 'active' })
            .where(eq(schema.organization.id, org.id));

          await db.update(schema.moduleSubscription)
            .set({ 
              status: 'active',
              currentPeriodEnd: nextPeriod
            })
            .where(and(
              eq(schema.moduleSubscription.organizationId, org.id),
              eq(schema.moduleSubscription.moduleSlug, 'core')
            ));
        }
      }
    } else if (event.event === 'charge.failed') {
       const authCode = event.data.authorization?.authorization_code;
       if (authCode) {
         // Mark past_due
         const orgs = await db.query.organization.findMany({
           where: eq(schema.organization.paystackAuthorizationCode, authCode)
         });
         
         for (const org of orgs) {
           await db.update(schema.organization)
             .set({ onboardingStatus: 'past_due' })
             .where(eq(schema.organization.id, org.id));
             
           await db.update(schema.moduleSubscription)
             .set({ status: 'past_due' })
             .where(and(
               eq(schema.moduleSubscription.organizationId, org.id),
               eq(schema.moduleSubscription.moduleSlug, 'core')
             ));
         }
       }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Webhook error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
