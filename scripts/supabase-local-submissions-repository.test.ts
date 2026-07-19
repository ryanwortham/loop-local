import assert from 'node:assert/strict';
import test from 'node:test';
import {
  hashStatusCapability,
  resolveSupabaseRepositoryConfig,
  submissionDataForStorage,
  SupabaseLocalSubmissionsRepository,
} from '../lib/local-submissions/supabase-repository.ts';
import type { StoredMediaReference } from '../lib/local-submissions/media-storage.ts';

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

test('Supabase repository uploads embedded pending media before the database compare-and-swap', async () => {
  const writes: Array<Record<string, unknown>> = [];
  const media: StoredMediaReference = {
    bucket: 'submission-media',
    objectPath: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/event-image.png',
    mimeType: 'image/png',
    byteSize: 3,
    sha256: 'a'.repeat(64),
    kind: 'eventImage',
  };
  let uploadCalls = 0;
  const mediaStorage = {
    uploadPending: async () => { uploadCalls += 1; return media; },
    promotePending: async () => { throw new Error('not expected'); },
    removePending: async () => undefined,
  };
  const responses = [
    { revision: 4, store: { version: 1, pendingSubmissions: [], publishedLocalEvents: [] } },
    { applied: true, revision: 5 },
  ];
  const repository = new SupabaseLocalSubmissionsRepository(
    { supabaseUrl: 'https://project.supabase.co', serviceRoleKey: 'server-secret' },
    {
      mediaStorage,
      fetchImpl: async (_input, init) => {
        if (init?.body && String(init.body) !== '{}') writes.push(JSON.parse(String(init.body)));
        return new Response(JSON.stringify(responses.shift()), { status: 200 });
      },
    },
  );
  const dataUrl = 'data:image/png;base64,iVBORw0KGgo=';
  await repository.mutate((store) => ({
    store: {
      ...store,
      pendingSubmissions: [{ id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', eventImageDataUrl: dataUrl }],
    },
    result: true,
  }));
  const persisted = (writes[0].next_store as { pendingSubmissions: Array<Record<string, unknown>> }).pendingSubmissions[0];
  assert.equal(uploadCalls, 1);
  assert.equal(persisted.eventImageDataUrl, undefined);
  assert.deepEqual(persisted.eventImageMedia, media);
});

test('Supabase repository signs private media only for read responses', async () => {
  const media: StoredMediaReference = {
    bucket: 'submission-media', objectPath: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/event-image.png',
    mimeType: 'image/png', byteSize: 3, sha256: 'd'.repeat(64), kind: 'eventImage',
  };
  const repository = new SupabaseLocalSubmissionsRepository(
    { supabaseUrl: 'https://project.supabase.co', serviceRoleKey: 'server-secret' },
    {
      mediaStorage: {
        uploadPending: async () => media,
        promotePending: async () => media,
        removePending: async () => undefined,
        signPending: async () => 'https://project.supabase.co/signed-private-image',
      },
      fetchImpl: async () => new Response(JSON.stringify({
        revision: 1,
        store: { version: 1, pendingSubmissions: [{ id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', eventImageMedia: media }], publishedLocalEvents: [] },
      }), { status: 200 }),
    },
  );
  const store = await repository.read();
  const submission = store.pendingSubmissions[0] as Record<string, unknown>;
  assert.equal(submission.eventImageMediaUrl, 'https://project.supabase.co/signed-private-image');
  assert.deepEqual(submission.eventImageMedia, media);
});

test('Supabase repository promotes pending media before publication and removes private media only after commit', async () => {
  const pendingMedia: StoredMediaReference = {
    bucket: 'submission-media',
    objectPath: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/event-image.png',
    mimeType: 'image/png',
    byteSize: 3,
    sha256: 'b'.repeat(64),
    kind: 'eventImage',
  };
  const publicMedia: StoredMediaReference = {
    ...pendingMedia,
    bucket: 'event-media',
    objectPath: 'local-approved-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/event-image.png',
    publicUrl: 'https://project.supabase.co/storage/v1/object/public/event-media/local-approved-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/event-image.png',
  };
  const actions: string[] = [];
  const mediaStorage = {
    uploadPending: async () => { throw new Error('not expected'); },
    promotePending: async () => { actions.push('promote'); return publicMedia; },
    removePending: async (references: StoredMediaReference[]) => { actions.push(`remove:${references.length}`); },
  };
  const snapshot = {
    version: 1 as const,
    pendingSubmissions: [{ id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', eventImageMedia: pendingMedia }],
    publishedLocalEvents: [],
  };
  let persistedEvent: Record<string, unknown> | undefined;
  const repository = new SupabaseLocalSubmissionsRepository(
    { supabaseUrl: 'https://project.supabase.co', serviceRoleKey: 'server-secret' },
    {
      mediaStorage,
      fetchImpl: async (_input, init) => {
        const body = JSON.parse(String(init?.body || '{}'));
        if ('next_store' in body) {
          persistedEvent = (body.next_store.publishedLocalEvents as Array<Record<string, unknown>>)[0];
          actions.push('compare-and-swap');
          return new Response(JSON.stringify({ applied: true, revision: 10 }), { status: 200 });
        }
        return new Response(JSON.stringify({ revision: 9, store: snapshot }), { status: 200 });
      },
    },
  );
  await repository.mutate((store) => ({
    store: {
      ...store,
      pendingSubmissions: [],
      publishedLocalEvents: [{ id: 'local-approved-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', title: 'Published' }],
    },
    result: true,
  }));
  assert.equal(persistedEvent?.image_url, publicMedia.publicUrl);
  assert.equal(persistedEvent?.imageState, 'photo');
  assert.equal(persistedEvent?.visualKey, 'local-submission-media');
  assert.deepEqual(actions, ['promote', 'compare-and-swap', 'remove:1']);
});

test('Supabase repository does not commit publication when media promotion fails', async () => {
  const pendingMedia: StoredMediaReference = {
    bucket: 'submission-media', objectPath: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/logo.png',
    mimeType: 'image/png', byteSize: 3, sha256: 'c'.repeat(64), kind: 'logo',
  };
  let writes = 0;
  const repository = new SupabaseLocalSubmissionsRepository(
    { supabaseUrl: 'https://project.supabase.co', serviceRoleKey: 'server-secret' },
    {
      mediaStorage: {
        uploadPending: async () => pendingMedia,
        promotePending: async () => { throw new Error('checksum mismatch'); },
        removePending: async () => undefined,
      },
      fetchImpl: async (_input, init) => {
        const body = JSON.parse(String(init?.body || '{}'));
        if ('next_store' in body) writes += 1;
        return new Response(JSON.stringify({ revision: 1, store: {
          version: 1,
          pendingSubmissions: [{ id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', logoMedia: pendingMedia }],
          publishedLocalEvents: [],
        } }), { status: 200 });
      },
    },
  );
  await assert.rejects(repository.mutate((store) => ({
    store: { ...store, pendingSubmissions: [], publishedLocalEvents: [{ id: 'local-approved-aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }] },
    result: true,
  })), /checksum mismatch/);
  assert.equal(writes, 0);
});
