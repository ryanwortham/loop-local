import { createHmac } from 'node:crypto';

export type PublicSubmissionScope = 'create' | 'resubmit' | 'unmet_demand' | 'event_intent' | 'event_feedback';

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
const DEFAULT_UNMET_DEMAND_LIMIT = 3;
const DEFAULT_UNMET_DEMAND_WINDOW_MS = 60 * 60_000;

type GlobalRateLimitState = typeof globalThis & {
  __loopLocalPublicSubmissionRateLimits?: Map<string, RateLimitBucket>;
};

type RateLimitEnv = Record<string, string | undefined>;
type PublicRateLimitOptions = { env?: RateLimitEnv; fetchImpl?: typeof fetch };

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

export function hashRateLimitIdentity(identity: string, pepper: string) {
  return createHmac('sha256', pepper).update(identity).digest('hex');
}

export async function publicSubmissionRateLimit(
  headers: Pick<Headers, 'get'>,
  scope: PublicSubmissionScope,
  now = Date.now(),
  options: PublicRateLimitOptions = {},
): Promise<RateLimitDecision> {
  const env = options.env || process.env;
  const isDemandSignal = scope === 'unmet_demand' || scope === 'event_feedback';
  const limit = boundedInteger(
    isDemandSignal ? env.LOOP_LOCAL_UNMET_DEMAND_RATE_LIMIT : env.LOOP_LOCAL_PUBLIC_SUBMISSION_RATE_LIMIT,
    isDemandSignal ? DEFAULT_UNMET_DEMAND_LIMIT : DEFAULT_LIMIT,
    1,
    200,
  );
  const windowMs = boundedInteger(
    isDemandSignal ? env.LOOP_LOCAL_UNMET_DEMAND_RATE_WINDOW_MS : env.LOOP_LOCAL_PUBLIC_SUBMISSION_RATE_WINDOW_MS,
    isDemandSignal ? DEFAULT_UNMET_DEMAND_WINDOW_MS : DEFAULT_WINDOW_MS,
    1_000,
    86_400_000,
  );
  const identity = publicRequestIdentity(headers);
  if (env.LOOP_LOCAL_SUBMISSIONS_ADAPTER === 'supabase') {
    const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
    const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) throw new Error('durable public rate limiting requires Supabase server credentials');
    const response = await (options.fetchImpl || fetch)(`${supabaseUrl}/rest/v1/rpc/consume_public_rate_limit`, {
      method: 'POST', cache: 'no-store',
      headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        p_scope: scope,
        p_identity_hash: hashRateLimitIdentity(identity, env.LOOP_LOCAL_RATE_LIMIT_IDENTITY_PEPPER || serviceRoleKey),
        p_limit: limit,
        p_window_seconds: Math.max(1, Math.ceil(windowMs / 1000)),
      }),
    });
    if (!response.ok) throw new Error(`durable public rate limit failed (${response.status})`);
    const payload = await response.json() as { allowed?: unknown; remaining?: unknown; resetAt?: unknown };
    const resetAtSeconds = Number(payload.resetAt);
    if (typeof payload.allowed !== 'boolean' || !Number.isFinite(Number(payload.remaining)) || !Number.isFinite(resetAtSeconds)) {
      throw new Error('durable public rate limit returned an invalid decision');
    }
    const resetAt = resetAtSeconds * 1000;
    return {
      allowed: payload.allowed,
      limit,
      remaining: Math.max(0, Number(payload.remaining)),
      retryAfterSeconds: payload.allowed ? 0 : Math.max(1, Math.ceil((resetAt - now) / 1000)),
      resetAt,
    };
  }
  const globalState = globalThis as GlobalRateLimitState;
  const buckets = globalState.__loopLocalPublicSubmissionRateLimits
    || (globalState.__loopLocalPublicSubmissionRateLimits = new Map());
  return consumeRateLimit(buckets, `${scope}:${identity}`, now, limit, windowMs);
}
