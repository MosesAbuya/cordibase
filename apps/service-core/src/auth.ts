import { betterAuth, APIError } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { organization } from "better-auth/plugins";
import { createDbClient, schema } from "@cordibase/shared-db";
import { eq } from "drizzle-orm";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const dbUrl = process.env.DATABASE_URL!;
export const db = createDbClient(dbUrl);

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", 
        schema: schema
    }),
    emailAndPassword: {
        enabled: true
    },
    
    plugins: [
        organization({
            schema: {
                member: {
                    additionalFields: {
                        modules: { type: "string" }
                    }
                },
                invitation: {
                    additionalFields: {
                        modules: { type: "string" }
                    }
                }
            },
            sendInvitationEmail: async (data, request) => {
                const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
                const inviteLink = `${frontendUrl}/invite/${data.id}`;
                try {
                    // Fetch the Default SMTP configuration for this organization (isGlobal = true in emailAccount)
                    const settings = await db.select().from(schema.emailAccount)
                        .where(
                            eq(schema.emailAccount.organizationId, data.organization.id)
                        );
                    const defaultSmtp = settings.find((s: any) => s.isGlobal);

                    if (!defaultSmtp) {
                        throw new APIError("BAD_REQUEST", { message: "No default SMTP configured. Please set a default email first in your workspace Email Config." });
                    }
                    
                    const host = defaultSmtp.smtpHost;
                    const port = defaultSmtp.smtpPort || 465;
                    const user = defaultSmtp.smtpUser;
                    const pass = defaultSmtp.smtpPassword;
                    const from = defaultSmtp.fromEmail || user;

                    const transporter = nodemailer.createTransport({
                        host,
                        port,
                        secure: port === 465,
                        auth: {
                            user,
                            pass
                        }
                    });

                    const brandingQuery = await db.select().from(schema.accountingSettings).where(eq(schema.accountingSettings.organizationId, data.organization.id));
                    const branding = brandingQuery[0] || {};
                    const logoUrl = (branding as any).logoUrl || null;
                    const primaryColor = (branding as any).primaryColor || "#A83C2E";

                    const htmlBody = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #F8FAFC; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); border: 1px solid #EAECF0;">
    <div style="background-color: ${primaryColor}; padding: 32px 24px; text-align: center;">
      ${logoUrl ? `<img src="${logoUrl}" alt="${data.organization.name}" style="max-height: 48px; margin-bottom: 16px;" />` : ''}
      <h1 style="color: #FFFFFF; margin: 0; font-size: 24px; font-weight: 600;">You've been invited!</h1>
    </div>
    <div style="padding: 32px 24px; color: #344054;">
      <p style="font-size: 16px; line-height: 1.5; margin-top: 0;">Hello,</p>
      <p style="font-size: 16px; line-height: 1.5;">You have been invited to join <strong>${data.organization.name}</strong> as a <strong>${data.role}</strong>.</p>
      <p style="font-size: 16px; line-height: 1.5; margin-bottom: 32px;">Click the button below to accept the invitation and set up your account.</p>
      
      <div style="text-align: center;">
        <a href="${inviteLink}" style="display: inline-block; background-color: ${primaryColor}; color: #FFFFFF; text-decoration: none; font-weight: 600; padding: 14px 28px; border-radius: 8px; font-size: 16px;">Accept Invitation</a>
      </div>
      
      <p style="font-size: 14px; color: #667085; line-height: 1.5; margin-top: 32px; margin-bottom: 0;">
        If you did not expect this invitation, you can safely ignore this email.
      </p>
    </div>
    <div style="background-color: #F8FAFC; padding: 20px 24px; text-align: center; border-top: 1px solid #EAECF0;">
      <p style="font-size: 12px; color: #98A2B3; margin: 0;">
        Secured by Cordibase Identity
      </p>
    </div>
  </div>
</div>
`;

                    await transporter.sendMail({
                        from,
                        to: data.email,
                        subject: `You have been invited to join ${data.organization.name} on Cordibase`,
                        text: `You have been invited to join ${data.organization.name}. Click here to join: ${inviteLink}`,
                        html: htmlBody
                    });
                    console.log("Invite email sent to", data.email);
                } catch (e) {
                    console.error("Failed to send invite email:", e);
                }
            }
        })
    ],
    
        advanced: {
        crossSubDomainCookies: { enabled: false },
        defaultCookieAttributes: {
            sameSite: "lax",
            secure: process.env.NODE_ENV === "production"
        }
    },
    baseURL: process.env.BETTER_AUTH_URL || "http://127.0.0.1:3001/api/auth",
    trustedOrigins: process.env.NODE_ENV === "production" 
        ? [process.env.FRONTEND_URL || ""] 
        : ["http://localhost:3000", "http://127.0.0.1:3000", process.env.FRONTEND_URL || ""].filter(Boolean)
});

