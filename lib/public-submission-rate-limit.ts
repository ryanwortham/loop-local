export type PublicSubmissionScope = 'create' | 'resubmit';

export type RateLimitBucket = {
  count: number;
  resetAt: number;
};

export type RateLimitDecision = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: number;
};

export const MAX_RATE_LIMIT_BUCKETS = 4096;
const DEFAULT_LIMIT = 20;
const DEFAULT_WINDOW_MS = 60_000;

type GlobalRateLimitState = typeof globalThis & {
  __loopLocalPublicSubmissionRateLimits?: Map<string, RateLimitBucket>;
};

function boundedInteger(value: string | undefined, fallback: number, minimum: number, maximum: number): number {
  const parsed = Number.parseInt(value || '', 10);
  return Number.isFinite(parsed) ? Math.min(maximum, Math.max(minimum, parsed)) : fallback;
}

function cleanAddress(value: string): string {
  const address = value.split(',')[0]?.trim().slice(0, 80) || '';
  return /^[a-fA-F0-9.:[\]-]+$/.test(address) ? address : '';
}

export function publicRequestIdentity(headers: Pick<Headers, 'get'>): string {
  // Deployment proxies must overwrite these client-address headers; platform-specific headers win.
  return cleanAddress(headers.get('cf-connecting-ip') || '')
    || cleanAddress(headers.get('x-vercel-forwarded-for') || '')
    || cleanAddress(headers.get('x-real-ip') || '')
    || cleanAddress(headers.get('x-forwarded-for') || '')
    || 'unknown';
}

export function consumeRateLimit(
  buckets: Map<string, RateLimitBucket>,
  key: string,
  now: number,
  limit: number,
  windowMs: number,
): RateLimitDecision {
  for (const [bucketKey, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(bucketKey);
  }
  if (!buckets.has(key) && buckets.size >= MAX_RATE_LIMIT_BUCKETS) {
    const oldestKey = buckets.keys().next().value;
    if (oldestKey) buckets.delete(oldestKey);
  }

  const current = buckets.get(key);
  const bucket = !current || current.resetAt <= now
    ? { count: 0, resetAt: now + windowMs }
    : current;
  if (bucket.count >= limit) {
    return {
      allowed: false,
      limit,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
      resetAt: bucket.resetAt,
    };
  }

  bucket.count += 1;
  buckets.delete(key);
  buckets.set(key, bucket);
  return {
    allowed: true,
    limit,
    remaining: Math.max(0, limit - bucket.count),
    retryAfterSeconds: 0,
    resetAt: bucket.resetAt,
  };
}

export function publicSubmissionRateLimit(
  headers: Pick<Headers, 'get'>,
  scope: PublicSubmissionScope,
  now = Date.now(),
): RateLimitDecision {
  const globalState = globalThis as GlobalRateLimitState;
  const buckets = globalState.__loopLocalPublicSubmissionRateLimits
    || (globalState.__loopLocalPublicSubmissionRateLimits = new Map());
  const limit = boundedInteger(process.env.LOOP_LOCAL_PUBLIC_SUBMISSION_RATE_LIMIT, DEFAULT_LIMIT, 1, 200);
  const windowMs = boundedInteger(process.env.LOOP_LOCAL_PUBLIC_SUBMISSION_RATE_WINDOW_MS, DEFAULT_WINDOW_MS, 1_000, 3_600_000);
  const identity = publicRequestIdentity(headers);
  return consumeRateLimit(buckets, `${scope}:${identity}`, now, limit, windowMs);
}
