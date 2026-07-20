export function authorizationBearerToken(headers: Pick<Headers, 'get'>): string | undefined {
  const value = headers.get('authorization')?.trim();
  if (!value?.startsWith('Bearer ')) return undefined;
  const token = value.slice('Bearer '.length).trim();
  return token || undefined;
}
