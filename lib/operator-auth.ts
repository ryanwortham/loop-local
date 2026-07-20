import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { getPublicEnv } from '@/lib/env';
import { authorizationBearerToken } from '@/lib/operator-auth-config';

export type OperatorAuthMethod = 'supabase';

export type OperatorAccess = {
  authorized: boolean;
  authenticated: boolean;
  operator: boolean;
  actorUserId?: string;
  authMethod?: OperatorAuthMethod;
  email?: string;
};

async function supabaseAccess(request: NextRequest): Promise<OperatorAccess | null> {
  const token = authorizationBearerToken(request.headers);
  if (!token) return null;

  const publicEnv = getPublicEnv();
  const authSupabaseUrl = process.env.LOOP_LOCAL_OPERATOR_AUTH_SUPABASE_URL?.trim() || publicEnv.supabaseUrl;
  const authSupabaseAnonKey = process.env.LOOP_LOCAL_OPERATOR_AUTH_SUPABASE_ANON_KEY?.trim() || publicEnv.supabaseAnonKey;
  const supabase = createClient(authSupabaseUrl, authSupabaseAnonKey, {
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
  };
}

export async function resolveOperatorAccess(request: NextRequest): Promise<OperatorAccess> {
  return await supabaseAccess(request) || {
    authorized: false,
    authenticated: false,
    operator: false,
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
