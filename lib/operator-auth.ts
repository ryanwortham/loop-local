import { NextRequest, NextResponse } from 'next/server';

// operator-review-token-gate-pass: protect local operator review APIs while Supabase Auth/RLS is not wired.

const operatorTokenEnv = 'LOOP_LOCAL_OPERATOR_TOKEN';
const operatorTokenHeader = 'x-loop-local-operator-token';

export function configuredOperatorToken(): string {
  return process.env[operatorTokenEnv] || '';
}

export function requestOperatorToken(request: NextRequest): string {
  return request.headers.get(operatorTokenHeader) || request.nextUrl.searchParams.get('operatorToken') || '';
}

export function hasOperatorAccess(request: NextRequest): boolean {
  const expected = configuredOperatorToken();
  return Boolean(expected && requestOperatorToken(request) === expected);
}

export function requireOperatorAccess(request: NextRequest): NextResponse | null {
  if (hasOperatorAccess(request)) return null;
  return NextResponse.json({ ok: false, error: 'operator token required' }, { status: 401 });
}

export const operatorAuthMarkers = {
  operatorTokenEnv,
  operatorTokenHeader,
};
