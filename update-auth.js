
const fs = require("fs");
let content = fs.readFileSync("apps/service-core/src/auth.ts", "utf8");

if (!content.includes("sendInvitationEmail")) {
    const importReplacement = `import { createDbClient, schema } from "@cordibase/shared-db";\nimport { eq } from "drizzle-orm";\nimport nodemailer from "nodemailer";`;
    content = content.replace(`import { createDbClient, schema } from "@cordibase/shared-db";`, importReplacement);

    const pluginConfig = `
    plugins: [
        organization({
            sendInvitationEmail: async (data, request) => {
                const inviteLink = \`http://localhost:3000/invite/\${data.id}\`;
                try {
                    // Fetch SMTP settings for this org
                    const settings = await db.select().from(schema.workspaceSettings).where(eq(schema.workspaceSettings.organizationId, data.organizationId));
                    if (settings.length === 0 || !settings[0].smtpHost) {
                        console.log("No SMTP config found. Invite link: ", inviteLink);
                        return;
                    }
                    
                    const smtp = settings[0];
                    const transporter = nodemailer.createTransport({
                        host: smtp.smtpHost,
                        port: smtp.smtpPort || 465,
                        secure: smtp.smtpPort === 465,
                        auth: {
                            user: smtp.smtpUser,
                            pass: smtp.smtpPassword
                        }
                    });

                    await transporter.sendMail({
                        from: smtp.smtpFromEmail || smtp.smtpUser,
                        to: data.email,
                        subject: \`You have been invited to join \${data.role} on Cordibase\`,
                        text: \`Click here to join: \${inviteLink}\`,
                        html: \`<p>Click <a href="\${inviteLink}">here</a> to join.</p>\`
                    });
                    console.log("Invite email sent to", data.email);
                } catch (e) {
                    console.error("Failed to send invite email:", e);
                }
            }
        })
    ],
    `;
    
    // Use regex to match the exact pattern of plugins array in auth.ts
    content = content.replace(/plugins:\s*\[\s*organization\(\)\s*\],/, pluginConfig);
    fs.writeFileSync("apps/service-core/src/auth.ts", content);
    console.log("Updated auth.ts with sendInvitationEmail and nodemailer");
} else {
    console.log("sendInvitationEmail already exists");
}

