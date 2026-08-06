export function authorizationBearerToken(headers: Pick<Headers, 'get'>): string | undefined {
  const value = headers.get('authorization')?.trim();
  if (!value?.startsWith('Bearer ')) return undefined;
  const token = value.slice('Bearer '.length).trim();
  return token || undefined;
}

export function configuredOperatorEmails(raw = process.env.LOOP_LOCAL_OPERATOR_EMAILS || ''): Set<string> {
  return new Set(
    raw
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}
