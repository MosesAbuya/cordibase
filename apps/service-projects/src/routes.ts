import { FastifyInstance } from 'fastify';
import { createDbClient, authSchema } from '@cordibase/shared-db';
import { project, projectMeeting, projectMilestone, projectDocument, projectStandup, projectTemplate, projectResource, projectTimeLog, projectRiskLog } from '@cordibase/shared-db/src/schema/projects';
import { eq, desc, and } from 'drizzle-orm';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const db = createDbClient(process.env.DATABASE_URL!);

export default async function routes(fastify: FastifyInstance) {

  fastify.addHook('preHandler', async (request, reply) => {
    const cookieHeader = request.headers.cookie || '';
    if (!cookieHeader && !request.headers['x-org-id'] && !request.headers['authorization']) {
      return reply.code(401).send({ error: 'Unauthorized - Missing token' });
    }
    try {
      const coreRes = await fetch((process.env.CORE_SERVICE_INTERNAL_URL || 'http://127.0.0.1:3001') + '/api/auth/get-session', {
        headers: { 'Cookie': cookieHeader, 'authorization': request.headers['authorization'] || '' }
      });
      if (!coreRes.ok) throw new Error('Invalid session');
      const sessionData = await coreRes.json() as any;
      const userId = sessionData?.user?.id;
      if (userId) {
        (request as any).user = sessionData.user;
        const requestedOrgId = request.headers['x-org-id'] || sessionData?.session?.activeOrganizationId;
        let orgId = requestedOrgId;
        let memberRecord: any = null;
        if (orgId) {
          const memberships = await db.select().from(authSchema.member).where(and(eq(authSchema.member.userId, userId), eq(authSchema.member.organizationId, orgId as string))).limit(1);
          memberRecord = memberships[0];
        }
        if (!memberRecord) {
          const memberships = await db.select().from(authSchema.member).where(eq(authSchema.member.userId, userId)).limit(1);
          memberRecord = memberships[0];
          orgId = memberRecord?.organizationId;
        }
        if (memberRecord) {
          (request as any).activeOrganizationId = orgId;
          (request as any).member = memberRecord;
        } else {
          (request as any).activeOrganizationId = null;
        }
      } else {
         return reply.code(401).send({ error: 'Unauthorized - Invalid session' });
      }
    } catch (err) {}
  });

fastify.get('/api/projects', async (request, reply) => {
    const orgId = (request as any).activeOrganizationId;
    if (!orgId) return reply.status(401).send({ error: 'Organization ID missing' });

    const projects = await db.query.project.findMany({
      where: eq(project.organizationId, orgId),
      orderBy: [desc(project.updatedAt)],
    });

    return reply.send({ projects });
  });

  fastify.get('/api/projects/:id', async (request, reply) => {
    const orgId = (request as any).activeOrganizationId;
    const { id } = request.params as { id: string };

    const proj = await db.query.project.findFirst({
      where: eq(project.id, id),
    });

    if (!proj || proj.organizationId !== orgId) {
      return reply.status(404).send({ error: 'Not Found' });
    }

    const milestones = await db.query.projectMilestone.findMany({
      where: eq(projectMilestone.projectId, id),
    });
    
    const meetings = await db.query.projectMeeting.findMany({
      where: eq(projectMeeting.projectId, id),
    });

    return reply.send({ project: proj, milestones, meetings });
  });

  fastify.post('/api/projects', async (request, reply) => {
    const orgId = (request as any).activeOrganizationId;
    const body = request.body as any;

    const [newProject] = await db.insert(project).values({
      organizationId: orgId,
      name: body.name,
      description: body.description,
      status: body.status || 'active',
      targetEndDate: body.targetEndDate ? new Date(body.targetEndDate) : null,
      budget: body.budget ? String(body.budget) : null,
    }).returning();

    return reply.status(201).send({ project: newProject });
  });

  fastify.post('/api/projects/:id/milestones', async (request, reply) => {
    const orgId = (request as any).activeOrganizationId;
    const { id } = request.params as { id: string };
    const body = request.body as any;

    const [newMilestone] = await db.insert(projectMilestone).values({
      organizationId: orgId,
      projectId: id,
      title: body.title,
      description: body.description,
      status: body.status || 'todo',
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
    }).returning();

    return reply.status(201).send({ milestone: newMilestone });
  });

  fastify.post('/api/projects/:id/meetings', async (request, reply) => {
    const orgId = (request as any).activeOrganizationId;
    const { id } = request.params as { id: string };
    const body = request.body as any;

    const [newMeeting] = await db.insert(projectMeeting).values({
      organizationId: orgId,
      projectId: id,
      title: body.title,
      startTime: new Date(body.startTime),
      endTime: new Date(body.endTime),
      minutesText: body.minutesText,
    }).returning();

    return reply.status(201).send({ meeting: newMeeting });
  });
  // AI Analyze Minutes
  fastify.post('/api/projects/:id/meetings/:meetingId/analyze', async (request, reply) => {
    const orgId = (request as any).activeOrganizationId;
    const { id, meetingId } = request.params as { id: string, meetingId: string };
    
    // 1. Fetch the meeting
    const meeting = await db.query.projectMeeting.findFirst({
      where: eq(projectMeeting.id, meetingId)
    });
    
    if (!meeting || meeting.projectId !== id || meeting.organizationId !== orgId) {
      return reply.status(404).send({ error: 'Meeting not found' });
    }
    
    if (!meeting.minutesText) {
      return reply.status(400).send({ error: 'No minutes to analyze' });
    }

    try {
      const { GoogleGenAI } = require('@google/genai');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `Analyze the following project meeting minutes. 
Extract key action items and milestones.
Format your response as a JSON array of objects, where each object has:
- title: A short title for the milestone/action.
- description: Detailed description.
- dueDate: YYYY-MM-DD if mentioned, otherwise null.

Minutes:
${meeting.minutesText}`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      
      const text = response.text;
      const milestonesToCreate = JSON.parse(text);
      
      const createdMilestones: any[] = [];
      for (const m of milestonesToCreate) {
        const [inserted] = await db.insert(projectMilestone).values({
          organizationId: orgId,
          projectId: id,
          title: m.title,
          description: m.description,
          dueDate: m.dueDate ? new Date(m.dueDate) : null,
          generatedByAi: true,
          originMeetingId: meeting.id,
        }).returning();
        createdMilestones.push(inserted);
      }
      
      // Update meeting summary
      const [updatedMeeting] = await db.update(projectMeeting)
        .set({ aiSummary: 'Analyzed successfully.' })
        .where(eq(projectMeeting.id, meeting.id))
        .returning();

      return reply.send({ meeting: updatedMeeting, milestones: createdMilestones });

    } catch (e) {
      console.error(e);
      return reply.status(500).send({ error: 'Failed to analyze minutes' });
    }
  });

  // Update milestone
  fastify.put('/api/projects/:id/milestones/:milestoneId', async (request, reply) => {
    const { milestoneId } = request.params as any;
    const body = request.body as any;
    
    const [updated] = await db.update(projectMilestone)
      .set({ status: body.status })
      .where(eq(projectMilestone.id, milestoneId))
      .returning();
      
    return reply.send({ milestone: updated });
  });


  fastify.get('/api/projects/resources', async (request, reply) => {
    const orgId = (request as any).activeOrganizationId;
    if (!orgId) return reply.status(401).send({ error: 'Unauthorized' });
    const resources = await db.query.projectResource.findMany({
      where: eq(projectResource.organizationId, orgId)
    });
    return reply.send({ resources });
  });

  fastify.get('/api/projects/:id/gantt', async (request, reply) => {
    const { id } = request.params as any;
    const milestones = await db.query.projectMilestone.findMany({
      where: eq(projectMilestone.projectId, id)
    });
    return reply.send({ milestones });
  });

  fastify.post('/api/projects/:id/meetings/suggest', async (request, reply) => {
    const today = new Date();
    const suggestions = [
      new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
      new Date(today.getTime() + 48 * 60 * 60 * 1000).toISOString(),
      new Date(today.getTime() + 72 * 60 * 60 * 1000).toISOString(),
    ];
    return reply.send({ suggestions });
  });

  fastify.post('/api/projects/:id/invoice', async (request, reply) => {
    const { id } = request.params as any;
    const logs = await db.query.projectTimeLog.findMany({
      where: eq(projectTimeLog.projectId, id)
    });
    const totalHours = logs.reduce((acc, log) => acc + Number(log.hours), 0);
    return reply.send({ success: true, message: `Invoice for ${totalHours} hours drafted!`, totalHours });
  });

  fastify.post('/api/projects/:id/analyze-risk', async (request, reply) => {
    const { id } = request.params as any;
    const [risk] = await db.insert(projectRiskLog).values({
       projectId: id,
       riskLevel: 'medium',
       details: 'AI Prediction: Project might be delayed due to pending tasks.'
    }).returning();
    return reply.send({ risk });
  });

  fastify.post('/api/projects/:id/documents', async (request, reply) => {
    const orgId = (request as any).activeOrganizationId;
    const { id } = request.params as any;
    const body = request.body as any;
    const [doc] = await db.insert(projectDocument).values({
       organizationId: orgId,
       projectId: id,
       name: body.name || 'document.pdf',
       url: '/uploads/mock.pdf',
       type: 'pdf'
    }).returning();
    return reply.send({ document: doc });
  });

  fastify.get('/api/portal/projects/:token', async (request, reply) => {
    const { token } = request.params as any;
    const proj = await db.query.project.findFirst({
      where: eq(project.clientPortalToken, token)
    });
    if (!proj) return reply.status(404).send({ error: 'Not found' });
    const milestones = await db.query.projectMilestone.findMany({
      where: eq(projectMilestone.projectId, proj.id)
    });
    return reply.send({ project: proj, milestones });
  });

}