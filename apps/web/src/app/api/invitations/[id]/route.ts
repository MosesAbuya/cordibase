import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { schema } from '@cordibase/shared-db';
import { eq } from 'drizzle-orm';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: inviteId } = await params;
    if (!inviteId) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    const invite = await db.query.invitation.findFirst({
      where: eq(schema.invitation.id, inviteId),
      with: {
        organization: true,
      }
    });

    if (!invite) {
      return NextResponse.json({ error: 'Invitation not found or expired' }, { status: 404 });
    }

    const existingUser = await db.query.user.findFirst({
      where: eq(schema.user.email, invite.email)
    });

    return NextResponse.json({ 
      hasAccount: !!existingUser,
      invite: {
        id: invite.id,
        email: invite.email,
        role: invite.role,
        status: invite.status,
        orgName: invite.organization.name,
        orgSlug: invite.organization.slug,
        orgId: invite.organization.id,
        modules: invite.modules
      } 
    });
  } catch (error) {
    console.error('Error fetching invite:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
