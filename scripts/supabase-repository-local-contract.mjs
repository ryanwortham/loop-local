#!/usr/bin/env node
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { SupabaseLocalSubmissionsRepository } from '../lib/local-submissions/supabase-repository.ts';

const repositoryA = new SupabaseLocalSubmissionsRepository();
const repositoryB = new SupabaseLocalSubmissionsRepository();
const baseline = await repositoryA.read();
const firstId = randomUUID();
const secondId = randomUUID();
const firstToken = randomUUID().replaceAll('-', '');
const secondToken = randomUUID().replaceAll('-', '');
const submittedAt = new Date().toISOString();

const pending = (id, token, title) => ({
  id,
  eventTitle: title,
  status: 'pending_review',
  statusToken: token,
  submittedAt,
  statusHistory: [{ action: 'submitted', label: 'Submitted for review', at: submittedAt }],
});

try {
  await Promise.all([
    repositoryA.mutate((store) => ({
      store: { ...store, pendingSubmissions: [...store.pendingSubmissions, pending(firstId, firstToken, 'Repository instance A')] },
      result: undefined,
    })),
    repositoryB.mutate((store) => ({
      store: { ...store, pendingSubmissions: [...store.pendingSubmissions, pending(secondId, secondToken, 'Repository instance B')] },
      result: undefined,
    })),
  ]);

  let stored = await repositoryA.read();
  assert(stored.pendingSubmissions.some((item) => item?.id === firstId), 'instance A mutation was dropped');
  assert(stored.pendingSubmissions.some((item) => item?.id === secondId), 'instance B mutation was dropped');
  assert.equal(await repositoryA.authorizeStatusCapability(firstId, firstToken), true);
  assert.equal(await repositoryA.authorizeStatusCapability(firstId, 'wrong-token'), false);
  assert.equal(JSON.stringify(stored).includes(firstToken), false, 'plaintext capability leaked from normalized database state');

  await repositoryA.mutate((store) => ({
    store: {
      ...store,
      pendingSubmissions: store.pendingSubmissions.filter((item) => item?.id !== firstId),
      publishedLocalEvents: [...store.publishedLocalEvents, { id: `local-approved-${firstId}`, title: 'Repository published event', startsAt: submittedAt, city: 'Granite City' }],
    },
    result: undefined,
  }));
  stored = await repositoryB.read();
  assert(stored.publishedLocalEvents.some((item) => item?.id === `local-approved-${firstId}`), 'published mapping did not survive a second adapter instance');
  assert.equal(await repositoryB.authorizeStatusCapability(firstId, firstToken), true, 'publication discarded the capability hash');

  console.log('loop_local_supabase_repository_local_contract_ok');
} finally {
  await repositoryA.write(baseline);
}
