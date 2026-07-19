import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { FileLocalSubmissionsRepository } from '../lib/local-submissions/file-repository.ts';
import type { RepositoryStoreShape } from '../lib/local-submissions/repository.ts';

type SubmissionFixture = {
  id: string;
  eventTitle: string;
  status: string;
  statusToken?: string;
  requestId: string;
  statusHistory: Array<{ action: string; at: string }>;
};

function emptyStore(): RepositoryStoreShape {
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
    requestId: `request-${id}`,
    statusHistory: [{ action: 'submitted', at: '2026-07-19T12:00:00.000Z' }],
  };
}

async function withFileRepository(run: (repository: FileLocalSubmissionsRepository) => Promise<void>) {
  const runtimePath = path.join(tmpdir(), `loop-local-repository-contract-${randomUUID()}.json`);
  const repository = new FileLocalSubmissionsRepository({ runtimePath });
  try {
    await run(repository);
  } finally {
    await rm(runtimePath, { force: true });
  }
}

test('file repository returns an empty durable store before the first write', async () => {
  await withFileRepository(async (repository) => {
    assert.deepEqual(await repository.read(), emptyStore());
  });
});

test('file repository preserves omitted optional maps for legacy domain defaults', async () => {
  const runtimePath = path.join(tmpdir(), `loop-local-repository-legacy-${randomUUID()}.json`);
  await writeFile(runtimePath, JSON.stringify({ version: 1, pendingSubmissions: [], publishedLocalEvents: [] }), 'utf8');
  try {
    const repository = new FileLocalSubmissionsRepository({ runtimePath });
    const store = await repository.read();
    assert.equal(Object.prototype.hasOwnProperty.call(store, 'eventCategoryOverrides'), false);
    assert.equal(Object.prototype.hasOwnProperty.call(store, 'operatorAuditLog'), false);
  } finally {
    await rm(runtimePath, { force: true });
  }
});

test('file repository surfaces corrupt data instead of treating it as an empty store', async () => {
  const runtimePath = path.join(tmpdir(), `loop-local-repository-corrupt-${randomUUID()}.json`);
  await writeFile(runtimePath, '{not-valid-json', 'utf8');
  try {
    const repository = new FileLocalSubmissionsRepository({ runtimePath });
    await assert.rejects(repository.read(), /JSON|Unexpected|position/i);
  } finally {
    await rm(runtimePath, { force: true });
  }
});

test('repository mutation lifecycle preserves review history, publication, overrides, and capability authorization', async () => {
  await withFileRepository(async (repository) => {
    const submissionId = randomUUID();
    const token = 'contract-status-capability-token';
    await repository.write({ ...emptyStore(), pendingSubmissions: [pending(submissionId, token)] });
    assert.equal(await repository.authorizeStatusCapability(submissionId, token), true);
    assert.equal(await repository.authorizeStatusCapability(submissionId, 'wrong-token'), false);

    await repository.mutate((store) => {
      const item = store.pendingSubmissions[0] as SubmissionFixture;
      return {
        store: {
          ...store,
          pendingSubmissions: [{
            ...item,
            status: 'needs_changes',
            statusHistory: [...item.statusHistory, { action: 'needs_changes', at: '2026-07-19T12:05:00.000Z' }],
          }],
          eventCategoryOverrides: {
            [submissionId]: {
              category: 'Arts & Culture', sourceCategory: 'Local', eventTitle: item.eventTitle, reviewedAt: '2026-07-19T12:05:00.000Z',
            },
          },
        },
        result: 'updated',
      };
    });

    const updateStore = await repository.read();
    assert.equal((updateStore.pendingSubmissions[0] as SubmissionFixture).statusHistory.length, 2);
    assert.equal(Object.keys(updateStore.eventCategoryOverrides || {}).length, 1);

    await repository.mutate((store) => ({
      store: {
        ...store,
        pendingSubmissions: [],
        publishedLocalEvents: [{ id: `local-approved-${submissionId}`, title: 'Published contract event' }],
      },
      result: undefined,
    }));
    assert.equal(await repository.authorizeStatusCapability(submissionId, token), true, 'publication must not discard the submitter capability hash');

    await repository.mutate((store) => ({
      store: { ...store, publishedLocalEvents: [], eventCategoryOverrides: {} },
      result: undefined,
    }));
    assert.equal(await repository.authorizeStatusCapability(submissionId, token), false, 'deletion must prune the capability hash');
  });
});

test('repository replay is idempotent when the mutation uses a stable request id', async () => {
  await withFileRepository(async (repository) => {
    const fixture = pending(randomUUID(), 'idempotent-token');
    const replay = () => repository.mutate((store) => {
      const exists = store.pendingSubmissions.some((item) => (item as SubmissionFixture).requestId === fixture.requestId);
      return {
        store: exists ? store : { ...store, pendingSubmissions: [...store.pendingSubmissions, fixture] },
        result: fixture.id,
      };
    });
    assert.equal(await replay(), fixture.id);
    assert.equal(await replay(), fixture.id);
    assert.equal((await repository.read()).pendingSubmissions.length, 1);
  });
});

test('repository serializes concurrent mutations without dropping submissions', async () => {
  await withFileRepository(async (repository) => {
    const fixtures = Array.from({ length: 12 }, (_, index) => pending(randomUUID(), `concurrent-token-${index}`));
    await Promise.all(fixtures.map((fixture) => repository.mutate((store) => ({
      store: { ...store, pendingSubmissions: [...store.pendingSubmissions, fixture] },
      result: fixture.id,
    }))));
    const ids = (await repository.read()).pendingSubmissions.map((item) => (item as SubmissionFixture).id).sort();
    assert.deepEqual(ids, fixtures.map((item) => item.id).sort());
  });
});
