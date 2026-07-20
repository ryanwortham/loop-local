import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type {
  LocalSubmissionsRepository,
  RepositoryStoreShape,
} from '../lib/local-submissions/repository.ts';

type SubmissionFixture = {
  id: string;
  eventTitle: string;
  status: string;
  statusToken?: string;
  requestId: string;
  submittedAt: string;
  statusHistory: Array<{
    action: string;
    at: string;
    label?: string;
  }>;
};

export type LocalSubmissionsRepositoryContractContext = {
  primary: LocalSubmissionsRepository;
  secondary: LocalSubmissionsRepository;
  operatorActorUserId: string;
};

export const LOCAL_SUBMISSIONS_REPOSITORY_CONTRACT_IDS = {
  lifecycle: '2c000000-0000-4000-8000-000000000001',
  audit: '2c000000-0000-4000-8000-000000000002',
  replay: '2c000000-0000-4000-8000-000000000003',
  concurrent: Array.from(
    { length: 12 },
    (_, index) => `2c000000-0000-4000-8000-${(index + 16).toString(16).padStart(12, '0')}`,
  ),
} as const;

export function emptyRepositoryContractStore(): RepositoryStoreShape {
  return {
    version: 1,
    pendingSubmissions: [],
    publishedLocalEvents: [],
    eventCategoryOverrides: {},
    operatorAuditLog: [],
  };
}

function pending(id: string, token: string): SubmissionFixture {
  return {
    id,
    eventTitle: `Repository contract ${id}`,
    status: 'pending_review',
    statusToken: token,
    requestId: randomUUID(),
    submittedAt: '2026-07-19T12:00:00.000Z',
    statusHistory: [{
      action: 'submitted',
      label: 'Submitted for review',
      at: '2026-07-19T12:00:00.000Z',
    }],
  };
}

/**
 * One adapter-neutral behavior contract used unchanged by file and Supabase.
 * Covers: empty durable store, capability authorization, review history,
 * category overrides, publication mapping, idempotent replay,
 * concurrent mutations, and deletion prunes capability authorization.
 */
export async function runLocalSubmissionsRepositoryContract({
  primary,
  secondary,
  operatorActorUserId,
}: LocalSubmissionsRepositoryContractContext): Promise<void> {
  await primary.write(emptyRepositoryContractStore());
  assert.deepEqual(await secondary.read(), emptyRepositoryContractStore(), 'empty durable store');

  const lifecycleId = LOCAL_SUBMISSIONS_REPOSITORY_CONTRACT_IDS.lifecycle;
  const lifecycleToken = randomUUID().replaceAll('-', '');
  const lifecycle = pending(lifecycleId, lifecycleToken);
  await primary.write({
    ...emptyRepositoryContractStore(),
    pendingSubmissions: [lifecycle],
  });
  assert.equal(await secondary.authorizeStatusCapability(lifecycleId, lifecycleToken), true, 'capability authorization');
  assert.equal(await secondary.authorizeStatusCapability(lifecycleId, randomUUID().replaceAll('-', '')), false, 'wrong capability authorization');

  await secondary.mutate((store) => {
    const item = store.pendingSubmissions.find((candidate) => (candidate as SubmissionFixture).id === lifecycleId) as SubmissionFixture;
    return {
      store: {
        ...store,
        pendingSubmissions: store.pendingSubmissions.map((candidate) => (
          (candidate as SubmissionFixture).id === lifecycleId
            ? {
                ...item,
                status: 'needs_changes',
                statusHistory: [
                  ...item.statusHistory,
                  {
                    action: 'needs_changes',
                    label: 'Changes requested',
                    at: '2026-07-19T12:05:00.000Z',
                  },
                ],
              }
            : candidate
        )),
      },
      result: undefined,
    };
  });
  const reviewed = await primary.read();
  const reviewedSubmission = reviewed.pendingSubmissions.find((candidate) => (candidate as SubmissionFixture).id === lifecycleId) as SubmissionFixture;
  assert.equal(reviewedSubmission.statusHistory.length, 2, 'review history');

  await primary.mutate((store) => ({
    store: {
      ...store,
      pendingSubmissions: store.pendingSubmissions.filter((candidate) => (candidate as SubmissionFixture).id !== lifecycleId),
      publishedLocalEvents: [
        ...store.publishedLocalEvents,
        {
          id: `local-approved-${lifecycleId}`,
          localSubmissionId: lifecycleId,
          title: 'Published repository contract event',
          startsAt: '2026-07-19T13:00:00.000Z',
          city: 'Granite City',
        },
      ],
    },
    result: undefined,
  }));
  let published = await secondary.read();
  assert.equal(
    published.publishedLocalEvents.some((candidate) => (candidate as { id?: string }).id === `local-approved-${lifecycleId}`),
    true,
    'publication mapping',
  );
  assert.equal(await secondary.authorizeStatusCapability(lifecycleId, lifecycleToken), true, 'publication preserves capability authorization');

  await secondary.mutate((store) => ({
    store: {
      ...store,
      eventCategoryOverrides: {
        ...(store.eventCategoryOverrides || {}),
        [lifecycleId]: {
          category: 'Arts & Culture',
          sourceCategory: 'Local',
          eventTitle: 'Published repository contract event',
          reviewedAt: '2026-07-19T13:05:00.000Z',
        },
      },
      operatorAuditLog: [
        ...(store.operatorAuditLog || []),
        {
          id: LOCAL_SUBMISSIONS_REPOSITORY_CONTRACT_IDS.audit,
          action: 'set_category_override',
          targetType: 'event',
          targetId: lifecycleId,
          actorUserId: operatorActorUserId,
          authMethod: 'supabase',
          at: '2026-07-19T13:05:00.000Z',
          metadata: {},
        },
      ],
    },
    result: undefined,
  }));
  published = await primary.read();
  assert.equal(Object.prototype.hasOwnProperty.call(published.eventCategoryOverrides || {}, lifecycleId), true, 'category overrides');

  await primary.mutate((store) => ({
    store: {
      ...store,
      pendingSubmissions: [],
      publishedLocalEvents: [],
      eventCategoryOverrides: {},
    },
    result: undefined,
  }));
  assert.equal(await secondary.authorizeStatusCapability(lifecycleId, lifecycleToken), false, 'deletion prunes capability authorization');

  const replayFixture = pending(
    LOCAL_SUBMISSIONS_REPOSITORY_CONTRACT_IDS.replay,
    randomUUID().replaceAll('-', ''),
  );
  const replay = () => primary.mutate((store) => {
    const exists = store.pendingSubmissions.some((candidate) => (candidate as SubmissionFixture).requestId === replayFixture.requestId);
    return {
      store: exists ? store : {
        ...store,
        pendingSubmissions: [...store.pendingSubmissions, replayFixture],
      },
      result: replayFixture.id,
    };
  });
  assert.equal(await replay(), replayFixture.id, 'idempotent replay first result');
  assert.equal(await replay(), replayFixture.id, 'idempotent replay second result');
  assert.equal(
    (await secondary.read()).pendingSubmissions.filter((candidate) => (candidate as SubmissionFixture).requestId === replayFixture.requestId).length,
    1,
    'idempotent replay',
  );

  const concurrentFixtures = LOCAL_SUBMISSIONS_REPOSITORY_CONTRACT_IDS.concurrent.map(
    (id) => pending(id, randomUUID().replaceAll('-', '')),
  );
  await Promise.all(concurrentFixtures.map((fixture, index) => (
    (index % 2 === 0 ? primary : secondary).mutate((store) => ({
      store: {
        ...store,
        pendingSubmissions: [...store.pendingSubmissions, fixture],
      },
      result: fixture.id,
    }))
  )));
  const storedIds = new Set((await primary.read()).pendingSubmissions.map((candidate) => (candidate as SubmissionFixture).id));
  assert.equal(
    concurrentFixtures.every((fixture) => storedIds.has(fixture.id)),
    true,
    'concurrent mutations',
  );
}
