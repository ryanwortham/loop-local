type OperatorEnv = Record<string, string | undefined>;

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function operatorFallbackEnabled(env: OperatorEnv = process.env): boolean {
  return env.LOOP_LOCAL_OPERATOR_TOKEN_FALLBACK_ENABLED === 'true';
}

export function operatorFallbackActorId(env: OperatorEnv = process.env): string | undefined {
  const value = env.LOOP_LOCAL_OPERATOR_FALLBACK_ACTOR_USER_ID?.trim();
  return value && UUID_PATTERN.test(value) ? value : undefined;
}

export function authorizationBearerToken(headers: Pick<Headers, 'get'>): string | undefined {
  const value = headers.get('authorization')?.trim();
  if (!value?.startsWith('Bearer ')) return undefined;
  const token = value.slice('Bearer '.length).trim();
  return token || undefined;
}
