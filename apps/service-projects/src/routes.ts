import { FastifyInstance } from 'fastify';
import { createDbClient } from '@cordibase/shared-db';
import { project, projectMeeting, projectMilestone, projectDocument, projectStandup } from '@cordibase/shared-db/src/schema/projects';
import { eq, desc } from 'drizzle-orm';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const db = createDbClient(process.env.DATABASE_URL!);

export default async function routes(fastify: FastifyInstance) {
  
  fastify.get('/api/projects', async (request, reply) => {
    const orgId = request.headers['x-organization-id'] as string;
    if (!orgId) return reply.status(401).send({ error: 'Organization ID missing' });

    const projects = await db.query.project.findMany({
      where: eq(project.organizationId, orgId),
      orderBy: [desc(project.updatedAt)],
    });

    return reply.send({ projects });
  });

  fastify.get('/api/projects/:id', async (request, reply) => {
    const orgId = request.headers['x-organization-id'] as string;
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
    const orgId = request.headers['x-organization-id'] as string;
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
    const orgId = request.headers['x-organization-id'] as string;
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
    const orgId = request.headers['x-organization-id'] as string;
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
    const orgId = request.headers['x-organization-id'] as string;
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

}