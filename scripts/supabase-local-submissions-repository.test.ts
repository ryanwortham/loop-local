import assert from 'node:assert/strict';
import test from 'node:test';
import {
  hashStatusCapability,
  resolveSupabaseRepositoryConfig,
  submissionDataForStorage,
  SupabaseLocalSubmissionsRepository,
} from '../lib/local-submissions/supabase-repository.ts';

test('Supabase repository configuration requires an explicit server-only credential', () => {
  assert.throws(
    () => resolveSupabaseRepositoryConfig({ NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co' }),
    /SUPABASE_SERVICE_ROLE_KEY is required/,
  );
  assert.throws(
    () => resolveSupabaseRepositoryConfig({ NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'anon-only' }),
    /SUPABASE_SERVICE_ROLE_KEY is required/,
  );
  assert.deepEqual(resolveSupabaseRepositoryConfig({
    NEXT_PUBLIC_SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'server-secret-value',
  }), {
    supabaseUrl: 'https://example.supabase.co',
    serviceRoleKey: 'server-secret-value',
  });
});

test('status capabilities are represented only by a deterministic SHA-256 hash', () => {
  const token = 'never-store-this-plaintext-capability';
  const digest = hashStatusCapability(token);
  assert.match(digest, /^[0-9a-f]{64}$/);
  assert.equal(digest, hashStatusCapability(token));
  assert(!digest.includes(token));
});

test('submission JSON written to Supabase strips plaintext capability material', () => {
  const stored = submissionDataForStorage({
    id: '11111111-1111-4111-8111-111111111111',
    eventTitle: 'Safe storage fixture',
    statusToken: 'plaintext-status-token',
    statusHistory: [{ action: 'submitted', at: '2026-07-19T12:00:00.000Z' }],
  });
  assert.equal(stored.statusToken, undefined);
  assert.equal(stored.statusHistory, undefined);
  assert.equal(stored.eventTitle, 'Safe storage fixture');
  assert(!JSON.stringify(stored).includes('plaintext-status-token'));
});

test('Supabase repository retries compare-and-swap conflicts without dropping concurrent state', async () => {
  const calls: Array<{ url: string; body?: Record<string, unknown> }> = [];
  const responses = [
    { revision: 0, store: { version: 1, pendingSubmissions: [], publishedLocalEvents: [] } },
    { applied: false, revision: 1 },
    { revision: 1, store: { version: 1, pendingSubmissions: [{ id: 'external' }], publishedLocalEvents: [] } },
    { applied: true, revision: 2 },
  ];
  const fetchImpl: typeof fetch = async (input, init) => {
    calls.push({ url: String(input), body: init?.body ? JSON.parse(String(init.body)) : undefined });
    return new Response(JSON.stringify(responses.shift()), { status: 200, headers: { 'content-type': 'application/json' } });
  };
  const repository = new SupabaseLocalSubmissionsRepository(
    { supabaseUrl: 'https://project.supabase.co', serviceRoleKey: 'server-secret' },
    { fetchImpl, maxMutationAttempts: 3 },
  );

  const count = await repository.mutate((store) => ({
    store: { ...store, pendingSubmissions: [...store.pendingSubmissions, { id: 'ours' }] },
    result: store.pendingSubmissions.length + 1,
  }));

  assert.equal(count, 2);
  const writes = calls.filter((call) => call.url.includes('replace_local_submission_repository_state'));
  assert.deepEqual(writes.map((call) => call.body?.expected_revision), [0, 1]);
  assert.equal(JSON.stringify(writes[1].body).includes('external'), true);
  assert.equal(JSON.stringify(writes[1].body).includes('ours'), true);
});

test('Supabase capability authorization sends only a hash to the server', async () => {
  const token = 'never-send-this-capability';
  let requestedUrl = '';
  const fetchImpl: typeof fetch = async (input) => {
    requestedUrl = String(input);
    return new Response('[{"id":"55555555-5555-4555-8555-555555555555"}]', { status: 200 });
  };
  const repository = new SupabaseLocalSubmissionsRepository(
    { supabaseUrl: 'https://project.supabase.co', serviceRoleKey: 'server-secret' },
    { fetchImpl },
  );
  assert.equal(await repository.authorizeStatusCapability('55555555-5555-4555-8555-555555555555', token), true);
  assert.equal(requestedUrl.includes(token), false);
  assert.equal(requestedUrl.includes(hashStatusCapability(token)), true);
});
