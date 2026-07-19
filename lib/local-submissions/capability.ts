import { randomUUID } from 'node:crypto';

export function statusCapabilityForSubmission(existing: string | undefined, createCapability: boolean): string | undefined {
  return existing || (createCapability ? randomUUID().replace(/-/g, '') : undefined);
}
