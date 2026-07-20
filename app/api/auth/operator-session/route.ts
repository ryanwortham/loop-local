import { NextRequest, NextResponse } from 'next/server';
import { resolveOperatorAccess } from '@/lib/operator-auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const access = await resolveOperatorAccess(request);
  const response = NextResponse.json({
    authenticated: access.authenticated,
    operator: access.operator,
    email: access.email || null,
    authMethod: access.authMethod || null,
  });
  response.headers.set('Cache-Control', 'private, no-store, max-age=0');
  return response;
}
