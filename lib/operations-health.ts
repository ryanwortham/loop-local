import { feedQualityGate, currentMarketDate } from './discovery-truthfulness.ts';
import type { LiveFeedResponse } from './live-feed.ts';
import type { LocalSubmissionsAdapter } from './local-submissions/repository.ts';
import type { LocalSubmissionsStore } from './local-submissions-store.ts';

export type OperationsHealthStatus = 'ok' | 'degraded' | 'down';

export type OperationsHealthPayload = {
  service: 'loop-local';
  status: OperationsHealthStatus;
  checkedAt: string;
  version: string;
  commit: string;
  environment: string;
  deployment: {
    target: string;
    publicUrlConfigured: boolean;
    monitorConfigured: boolean;
  };
  feed: {
    status: LiveFeedResponse['health']['status'];
    source: string;
    count: number;
    fetchedAt?: string;
    ageSeconds?: number;
    quality: {
      ready: boolean;
      issues: string[];
      metrics: ReturnType<typeof feedQualityGate>['metrics'];
    };
  };
  submissions: {
    adapter: LocalSubmissionsAdapter;
    pendingReviewCount: number;
    publishedLocalEventCount: number;
  };
};

type HealthEnv = Record<string, string | undefined>;

function publicUrlConfigured(env: HealthEnv): boolean {
  return Boolean(env.LOOP_LOCAL_PUBLIC_URL || env.NEXT_PUBLIC_SITE_URL || env.VERCEL_PROJECT_PRODUCTION_URL);
}

function deploymentTarget(env: HealthEnv): string {
  if (env.LOOP_LOCAL_DEPLOYMENT_TARGET) return env.LOOP_LOCAL_DEPLOYMENT_TARGET;
  if (env.VERCEL) return 'vercel';
  if (env.TAILSCALE_SERVE) return 'tailnet-preview';
  return 'local';
}

function deploymentEnvironment(env: HealthEnv): string {
  return env.VERCEL_ENV || env.NODE_ENV || 'unknown';
}

export function buildOperationsHealthPayload({
  feed,
  store,
  adapter,
  env = process.env,
  now = new Date(),
}: {
  feed: LiveFeedResponse;
  store: LocalSubmissionsStore;
  adapter: LocalSubmissionsAdapter;
  env?: HealthEnv;
  now?: Date;
}): OperationsHealthPayload {
  const quality = feedQualityGate(feed.items, { marketDate: currentMarketDate('America/Chicago') });
  const feedUnavailable = feed.health.status === 'unavailable';
  const status: OperationsHealthStatus = feedUnavailable ? 'down' : quality.ready ? 'ok' : 'degraded';

  return {
    service: 'loop-local',
    status,
    checkedAt: now.toISOString(),
    version: env.NEXT_PUBLIC_APP_VERSION || env.npm_package_version || '0.1.0',
    commit: env.VERCEL_GIT_COMMIT_SHA || env.GITHUB_SHA || env.LOOP_LOCAL_GIT_SHA || 'unknown',
    environment: deploymentEnvironment(env),
    deployment: {
      target: deploymentTarget(env),
      publicUrlConfigured: publicUrlConfigured(env),
      monitorConfigured: Boolean(env.LOOP_LOCAL_MONITOR_WEBHOOK_URL || env.LOOP_LOCAL_MONITOR_TELEGRAM_CHAT_ID),
    },
    feed: {
      status: feed.health.status,
      source: feed.source,
      count: feed.count,
      ...(feed.health.fetchedAt ? { fetchedAt: feed.health.fetchedAt } : {}),
      ...(typeof feed.health.ageSeconds === 'number' ? { ageSeconds: feed.health.ageSeconds } : {}),
      quality: {
        ready: quality.ready,
        issues: quality.issues,
        metrics: quality.metrics,
      },
    },
    submissions: {
      adapter,
      pendingReviewCount: store.pendingSubmissions.length,
      publishedLocalEventCount: store.publishedLocalEvents.length,
    },
  };
}
