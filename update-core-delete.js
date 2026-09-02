
const fs = require("fs");
let content = fs.readFileSync("apps/service-core/src/index.ts", "utf8");

const deleteAPI = `
fastify.delete("/api/core/organization/members/:id", async (request, reply) => {
  const cookieHeader = request.headers.cookie;
  if (!cookieHeader) return reply.code(401).send({ error: "Unauthorized" });

  const authRes = await fetch("http://localhost:3001/api/auth/get-session", { headers: { cookie: cookieHeader } });
  const sessionData = await authRes.json();
  const userId = sessionData?.user?.id;
  if (!userId) return reply.code(401).send({ error: "Unauthorized" });

  const { id } = request.params;

  // Verify requester is admin or owner
  const requesterMembership = await db.select().from(authSchema.member).where(eq(authSchema.member.userId, userId)).limit(1);
  if (requesterMembership.length === 0 || !["owner", "admin"].includes(requesterMembership[0].role)) {
    return reply.code(403).send({ error: "Forbidden: You do not have permission to remove members." });
  }

  // Try deleting from member table first
  const deletedMember = await db.delete(authSchema.member)
    .where(eq(authSchema.member.id, id))
    .returning();

  // Try deleting from invitation table if not found in members
  if (deletedMember.length === 0) {
    await db.delete(authSchema.invitation)
      .where(eq(authSchema.invitation.id, id));
  }

  return { success: true };
});
`;

if (!content.includes("/api/core/organization/members/:id")) {
    content = content.replace("fastify.get(\"/api/core/notifications\"", `${deleteAPI}\nfastify.get("/api/core/notifications"`);
    fs.writeFileSync("apps/service-core/src/index.ts", content);
    console.log("Injected delete member API");
}

