import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Only protect /dashboard routes
  if (!request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.next();
  }

  try {
    // 1. Auth Check
    const sessionRes = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });

    if (!sessionRes.ok) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const sessionData = await sessionRes.json();
    if (!sessionData?.session) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const { session, user } = sessionData;

    // 6. Superadmin Bypass
    // If the user has platformRole === 'superadmin' and is impersonating, we might skip
    // For now, let's just proceed if they are superadmin and we implement impersonation logic later.
    // We'll check this when we build the superadmin layer.

    // 2. Active Org Check
    const activeOrganizationId = session.activeOrganizationId;
    if (!activeOrganizationId) {
      // Allow them to go to select-organization (wait, select-organization is outside /dashboard)
      return NextResponse.redirect(new URL('/select-organization', request.url));
    }

    // We can't easily query DB in edge middleware without edge drivers, 
    // so we pass the activeOrganizationId in a header to server components
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-active-org-id', activeOrganizationId);

    // Further checks (Onboarding Status, Subscription State, RBAC)
    // require DB access. Since edge middleware can't reliably run Drizzle with standard Postgres,
    // we'll enforce those checks at the Dashboard Layout level (Server Component), 
    // where full Node.js runtime and Drizzle are available.

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch (error) {
    console.error("Middleware Auth Error:", error);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
