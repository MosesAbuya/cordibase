import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { schema } from '@cordibase/shared-db';
import { eq, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { reference, orgId } = await req.json();

    if (!orgId) {
      return NextResponse.json({ error: 'Missing orgId' }, { status: 400 });
    }

    const paystackSecret = process.env.PAYSTACK_SECRET_KEY || 'sk_test_placeholder';

    // 1. Verify transaction
    const verifyRes = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${paystackSecret}` }
    });
    
    const verifyData = await verifyRes.json();
    if (!verifyData.status || verifyData.data.status !== 'success') {
      // For local development without real Paystack keys, simulate success
      if (paystackSecret === 'sk_test_placeholder') {
         console.warn("Using placeholder Paystack keys. Simulating success.");
         verifyData.data = {
            authorization: { authorization_code: 'AUTH_TEST_123' },
            customer: { customer_code: 'CUS_TEST_123' },
            amount: 300
         };
      } else {
         return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
      }
    }

    const { authorization, customer, amount } = verifyData.data;

    // 2. Refund the transaction immediately (since we just needed the auth code)
    if (paystackSecret !== 'sk_test_placeholder') {
      await fetch(`https://api.paystack.co/refund`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${paystackSecret}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          transaction: reference,
          amount: amount // refund the full 3 KES
        })
      });
    }

    // 3. Update Organization
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 7);

    await db.update(schema.organization)
      .set({
        onboardingStatus: 'trialing',
        trialEndsAt: trialEnd,
        paystackAuthorizationCode: authorization.authorization_code,
        paystackCustomerCode: customer.customer_code,
      })
      .where(eq(schema.organization.id, orgId));

    // Ensure there is a moduleSubscription record
    const existingSub = await db.query.moduleSubscription.findFirst({
       where: and(eq(schema.moduleSubscription.organizationId, orgId), eq(schema.moduleSubscription.moduleSlug, 'core'))
    });

    if (existingSub) {
       await db.update(schema.moduleSubscription).set({
          status: 'trialing',
          trialEndsAt: trialEnd,
          paystackCustomerCode: customer.customer_code
       }).where(eq(schema.moduleSubscription.id, existingSub.id));
    } else {
       await db.insert(schema.moduleSubscription).values({
          id: uuidv4(),
          organizationId: orgId,
          moduleSlug: 'core',
          status: 'trialing',
          trialEndsAt: trialEnd,
          paystackCustomerCode: customer.customer_code
       });
    }

        // --- EMAIL NOTIFICATION LOGIC ---
    try {
       // Find the owner of this organization
       const member = await db.query.member.findFirst({
         where: and(eq(schema.member.organizationId, orgId), eq(schema.member.role, 'owner')),
         with: { user: true }
       });

       const platformConfig = await db.query.platformSettings.findFirst({
         where: eq(schema.platformSettings.id, 'global')
       });

       if (member?.user?.email && platformConfig?.smtpHost) {
          const transporter = nodemailer.createTransport({
            host: platformConfig.smtpHost,
            port: platformConfig.smtpPort || 465,
            secure: platformConfig.smtpPort === 465,
            auth: {
              user: platformConfig.smtpUser,
              pass: platformConfig.smtpPassword,
            },
          } as any);

          const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #EAECF0; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #A83C2E; padding: 24px; text-align: center;">
                <h1 style="color: white; margin: 0; font-size: 24px;">Welcome to Cordibase!</h1>
              </div>
              <div style="padding: 32px; background-color: #FFFFFF; color: #1D2939;">
                <p>Hi ${member.user.name || 'there'},</p>
                <p>Your account has been successfully created and your payment details have been verified.</p>
                <p>You are now on a 7-day free trial of the <strong>Cordibase Standard</strong> package. Your card will be charged KES 3,000/month once the trial ends.</p>
                <p>Get started by exploring your new dashboard.</p>
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="display: inline-block; background-color: #1D2939; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin-top: 16px;">Go to Dashboard</a>
              </div>
            </div>
          `;

          await transporter.sendMail({
            from: `"${platformConfig.fromName}" <${platformConfig.fromEmail}>`,
            to: member.user.email,
            subject: "Welcome to Cordibase! Payment Verified.",
            html: html,
          });
       }
    } catch (emailErr) {
       console.error("Failed to send welcome email", emailErr);
    }
    // --------------------------------

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

