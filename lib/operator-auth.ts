import { timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getPublicEnv } from '@/lib/env';
import {
  authorizationBearerToken,
  operatorFallbackActorId,
  operatorFallbackEnabled,
} from '@/lib/operator-auth-config';

export type OperatorAuthMethod = 'supabase' | 'token_fallback';

export type OperatorAccess = {
  authorized: boolean;
  authenticated: boolean;
  operator: boolean;
  actorUserId?: string;
  authMethod?: OperatorAuthMethod;
  email?: string;
  fallbackEnabled: boolean;
};

function configuredFallbackAvailable(): boolean {
  return Boolean(
    operatorFallbackEnabled()
      && process.env.LOOP_LOCAL_OPERATOR_TOKEN?.trim()
      && operatorFallbackActorId(),
  );
}

function equalSecret(candidate: string | null, expected: string): boolean {
  if (!candidate) return false;
  const candidateBuffer = Buffer.from(candidate);
  const expectedBuffer = Buffer.from(expected);
  return candidateBuffer.length === expectedBuffer.length && timingSafeEqual(candidateBuffer, expectedBuffer);
}

function fallbackAccess(request: NextRequest): OperatorAccess | null {
  const fallbackEnabled = configuredFallbackAvailable();
  const expected = process.env.LOOP_LOCAL_OPERATOR_TOKEN?.trim();
  const actorUserId = operatorFallbackActorId();
  if (!fallbackEnabled || !expected || !actorUserId) return null;
  if (!equalSecret(request.headers.get('x-loop-local-operator-token'), expected)) return null;
  return {
    authorized: true,
    authenticated: false,
    operator: true,
    actorUserId,
    authMethod: 'token_fallback',
    fallbackEnabled: true,
  };
}

async function supabaseAccess(request: NextRequest): Promise<OperatorAccess | null> {
  const token = authorizationBearerToken(request.headers);
  if (!token) return null;

  const { supabaseUrl, supabaseAnonKey } = getPublicEnv();
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: userError } = await supabase.auth.getUser(token);
  const user = userData.user;
  if (userError || !user) return null;

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('app_role,is_admin')
    .eq('id', user.id)
    .maybeSingle();
  const operator = !profileError && Boolean(profile && (profile.app_role === 'operator' || profile.is_admin === true));
  return {
    authorized: operator,
    authenticated: true,
    operator,
    actorUserId: operator ? user.id : undefined,
    authMethod: operator ? 'supabase' : undefined,
    email: user.email,
    fallbackEnabled: configuredFallbackAvailable(),
  };
}

export async function resolveOperatorAccess(request: NextRequest): Promise<OperatorAccess> {
  const session = await supabaseAccess(request);
  if (session?.authorized) return session;
  const fallback = fallbackAccess(request);
  if (fallback) return fallback;
  return session || {
    authorized: false,
    authenticated: false,
    operator: false,
    fallbackEnabled: configuredFallbackAvailable(),
  };
}

export function operatorAccessError(access: OperatorAccess): NextResponse {
  return NextResponse.json(
    { ok: false, error: access.authenticated ? 'operator role required' : 'operator authentication required' },
    { status: access.authenticated ? 403 : 401 },
  );
}

export async function hasOperatorAccess(request: NextRequest): Promise<boolean> {
  return (await resolveOperatorAccess(request)).authorized;
}

export async function requireOperatorAccess(request: NextRequest): Promise<{
  access: OperatorAccess;
  response: NextResponse | null;
}> {
  const access = await resolveOperatorAccess(request);
  return { access, response: access.authorized ? null : operatorAccessError(access) };
}
