import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { schema } from '@cordibase/shared-db';
import { lte, eq, and } from 'drizzle-orm';

export async function POST(req: Request) {
  // Validate a cron secret to ensure this is only triggered by our scheduler (e.g., Vercel Cron or a Github Action)
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = new Date();
    
    // Find organizations whose trial has ended, and are currently in "trialing" state
    const expiredTrials = await db.query.organization.findMany({
      where: and(
        lte(schema.organization.trialEndsAt, now),
        eq(schema.organization.onboardingStatus, 'trialing')
      )
    });

    const results = [];
    const paystackSecret = process.env.PAYSTACK_SECRET_KEY || 'sk_test_placeholder';

    for (const org of expiredTrials) {
      if (!org.paystackAuthorizationCode || !org.paystackCustomerCode) {
        // Missing payment info, set to past_due
        await db.update(schema.organization)
          .set({ onboardingStatus: 'past_due' })
          .where(eq(schema.organization.id, org.id));
          
        results.push({ orgId: org.id, status: 'past_due', reason: 'Missing auth code' });
        continue;
      }

      // Charge the authorization code
      let chargeSuccess = false;
      
      // Get an admin email for this org
      const adminMember = await db.query.member.findFirst({
        where: and(eq(schema.member.organizationId, org.id), eq(schema.member.role, 'admin')),
        with: { user: true }
      });
      
      const emailToCharge = adminMember?.user?.email || 'admin@' + org.slug + '.cordibase.app';

      if (paystackSecret === 'sk_test_placeholder') {
         // Simulate success
         chargeSuccess = true;
      } else {
         const chargeRes = await fetch('https://api.paystack.co/transaction/charge_authorization', {
           method: 'POST',
           headers: {
             Authorization: `Bearer ${paystackSecret}`,
             'Content-Type': 'application/json'
           },
           body: JSON.stringify({
             authorization_code: org.paystackAuthorizationCode,
             email: emailToCharge,
             amount: 500000, // E.g., 5,000 KES/month
             currency: "KES"
           })
         });
         const chargeData = await chargeRes.json();
         if (chargeData.status && chargeData.data.status === 'success') {
           chargeSuccess = true;
         }
      }

      if (chargeSuccess) {
        // Extend subscription by 1 month
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
          
        results.push({ orgId: org.id, status: 'renewed' });
      } else {
        await db.update(schema.organization)
          .set({ onboardingStatus: 'past_due' })
          .where(eq(schema.organization.id, org.id));
          
        await db.update(schema.moduleSubscription)
          .set({ status: 'past_due' })
          .where(and(
            eq(schema.moduleSubscription.organizationId, org.id),
            eq(schema.moduleSubscription.moduleSlug, 'core')
          ));

        results.push({ orgId: org.id, status: 'past_due', reason: 'Charge failed' });
      }
    }

    return NextResponse.json({ success: true, processed: results.length, results });
  } catch (err) {
    console.error('Cron billing error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
