
const fs = require("fs");
let content = fs.readFileSync("apps/service-core/src/index.ts", "utf8");

const membersAPI = `
fastify.get("/api/core/organization/members", async (request, reply) => {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) return reply.code(401).send({ error: "Unauthorized" });

  const authRes = await fetch("http://localhost:3001/api/auth/get-session", { headers: { cookie: cookieHeader } });
  const sessionData = await authRes.json();
  const orgId = sessionData?.session?.activeOrganizationId;
  if (!orgId) return reply.code(401).send({ error: "Unauthorized" });

  // Get members with user details
  const membersData = await db.select({
    id: authSchema.member.id,
    role: authSchema.member.role,
    status: authSchema.member.status,
    createdAt: authSchema.member.createdAt,
    user: {
      id: authSchema.user.id,
      name: authSchema.user.name,
      email: authSchema.user.email
    }
  }).from(authSchema.member)
    .innerJoin(authSchema.user, eq(authSchema.member.userId, authSchema.user.id))
    .where(eq(authSchema.member.organizationId, orgId));

  return { members: membersData };
});
`;

if (!content.includes("/api/core/organization/members")) {
    content = content.replace("fastify.get(\"/api/core/notifications\"", `${membersAPI}\nfastify.get("/api/core/notifications"`);
    // Ensure authSchema and eq are imported if not already. They should be imported around line 133
    fs.writeFileSync("apps/service-core/src/index.ts", content);
    console.log("Injected members API");
}

