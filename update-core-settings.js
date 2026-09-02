
const fs = require("fs");
let content = fs.readFileSync("apps/service-core/src/index.ts", "utf8");

const settingsAPI = `
// === Settings ===
fastify.post("/api/settings/smtp", async (request, reply) => {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) return reply.code(401).send({ error: "Unauthorized" });

  const authRes = await fetch("http://localhost:3001/api/auth/get-session", { headers: { cookie: cookieHeader } });
  const sessionData = await authRes.json();
  const orgId = sessionData?.session?.activeOrganizationId;
  if (!orgId) return reply.code(401).send({ error: "Unauthorized" });

  const body = request.body;
  
  const existing = await db.select().from(schema.workspaceSettings).where(eq(schema.workspaceSettings.organizationId, orgId));
  
  if (existing.length > 0) {
    await db.update(schema.workspaceSettings).set({
      smtpHost: body.smtpHost,
      smtpPort: body.smtpPort,
      smtpUser: body.smtpUser,
      smtpPassword: body.smtpPassword,
      smtpFromEmail: body.smtpFromEmail
    }).where(eq(schema.workspaceSettings.id, existing[0].id));
  } else {
    await db.insert(schema.workspaceSettings).values({
      id: crypto.randomUUID(),
      organizationId: orgId,
      smtpHost: body.smtpHost,
      smtpPort: body.smtpPort,
      smtpUser: body.smtpUser,
      smtpPassword: body.smtpPassword,
      smtpFromEmail: body.smtpFromEmail
    });
  }
  
  return { success: true };
});
`;

if (!content.includes("/api/settings/smtp")) {
    content = content.replace("const start = async () => {", `${settingsAPI}\nconst start = async () => {`);
    fs.writeFileSync("apps/service-core/src/index.ts", content);
    console.log("Injected settings API");
}

