import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { schema } from '@cordibase/shared-db';

export async function GET() {
  try {
    const orgs = await db.query.organization.findMany({
      orderBy: (orgs, { desc }) => [desc(orgs.createdAt)],
      with: {
        members: true
      }
    });

    return NextResponse.json({ organizations: orgs });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
