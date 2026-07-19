import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MAX_GOVERNED_MEDIA_BYTES,
  SupabaseSubmissionMediaStorage,
  governedPendingObjectPath,
  parseGovernedDataImage,
} from '../lib/local-submissions/media-storage.ts';

const submissionId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const eventId = `local-approved-${submissionId}`;
const pngBytes = Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex');
const pngDataUrl = `data:image/png;base64,${pngBytes.toString('base64')}`;

function response(status: number, body: BodyInit = '', headers: Record<string, string> = {}) {
  return new Response(body, { status, headers });
}

test('governed media parser accepts only configured raster MIME types and computes stable metadata', () => {
  const parsed = parseGovernedDataImage(pngDataUrl);
  assert.equal(parsed.mimeType, 'image/png');
  assert.equal(parsed.extension, 'png');
  assert.equal(parsed.byteSize, pngBytes.byteLength);
  assert.equal(parsed.sha256, '02a3e298f1533f62558c58e4c70edcab9af5a50d62d925fd5390942020fb0fb8');
  assert.deepEqual(parsed.bytes, pngBytes);
  assert.throws(() => parseGovernedDataImage('data:image/svg+xml;base64,PHN2Zy8+'), /JPEG, PNG, or WebP/);
  assert.throws(() => parseGovernedDataImage('data:image/png;base64,Y2hhbmdlZA=='), /does not match declared image\/png/);
  assert.throws(() => parseGovernedDataImage('data:image/png;base64,%%%%'), /valid base64/);
});

test('governed media parser enforces the byte limit after decoding', () => {
  const tooLarge = Buffer.alloc(MAX_GOVERNED_MEDIA_BYTES + 1).toString('base64');
  assert.throws(() => parseGovernedDataImage(`data:image/jpeg;base64,${tooLarge}`), /700000 bytes/);
});

test('pending paths are server-generated from canonical identity and media kind', () => {
  assert.equal(governedPendingObjectPath(submissionId, 'eventImage', 'image/webp'), `${submissionId}/event-image.webp`);
  assert.equal(governedPendingObjectPath(submissionId, 'logo', 'image/jpeg'), `${submissionId}/logo.jpg`);
  assert.throws(() => governedPendingObjectPath('../caller-path', 'logo', 'image/png'), /canonical submission UUID/);
});

test('pending upload uses the private bucket, governed headers, and returns checksum metadata', async () => {
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  const storage = new SupabaseSubmissionMediaStorage(
    { supabaseUrl: 'https://example.supabase.co', serviceRoleKey: 'server-secret' },
    { fetchImpl: async (url, init) => {
      requests.push({ url: String(url), init });
      return response(200, '{}', { 'content-type': 'application/json' });
    } },
  );
  const stored = await storage.uploadPending(submissionId, 'eventImage', pngDataUrl);
  assert.equal(stored.bucket, 'submission-media');
  assert.equal(stored.objectPath, `${submissionId}/event-image.png`);
  assert.equal(stored.sha256, parseGovernedDataImage(pngDataUrl).sha256);
  assert.equal(requests[0].url, `https://example.supabase.co/storage/v1/object/submission-media/${submissionId}/event-image.png`);
  assert.equal((requests[0].init?.headers as Record<string, string>)['Content-Type'], 'image/png');
  assert.equal((requests[0].init?.headers as Record<string, string>)['x-upsert'], 'true');
  assert.deepEqual(Buffer.from(requests[0].init?.body as Uint8Array), pngBytes);
});

test('direct published-media import validates bytes and writes only to the public canonical path', async () => {
  let requestUrl = '';
  const storage = new SupabaseSubmissionMediaStorage(
    { supabaseUrl: 'https://example.supabase.co', serviceRoleKey: 'server-secret' },
    { fetchImpl: async (url) => {
      requestUrl = String(url);
      return response(200, '{}', { 'content-type': 'application/json' });
    } },
  );
  const result = await storage.uploadPublic(`local-approved-${submissionId}`, 'eventImage', pngDataUrl);
  assert.equal(requestUrl, `https://example.supabase.co/storage/v1/object/event-media/local-approved-${submissionId}/event-image.png`);
  assert.equal(result.bucket, 'event-media');
  assert.equal(result.sha256, parseGovernedDataImage(pngDataUrl).sha256);
  assert.equal(result.publicUrl, `https://example.supabase.co/storage/v1/object/public/event-media/local-approved-${submissionId}/event-image.png`);
});

test('promotion verifies the private checksum before writing the public object', async () => {
  const requests: string[] = [];
  const storage = new SupabaseSubmissionMediaStorage(
    { supabaseUrl: 'https://example.supabase.co', serviceRoleKey: 'server-secret' },
    { fetchImpl: async (url, init) => {
      requests.push(`${init?.method || 'GET'} ${String(url)}`);
      if ((init?.method || 'GET') === 'GET') return response(200, pngBytes, { 'content-type': 'image/png' });
      return response(200, '{}', { 'content-type': 'application/json' });
    } },
  );
  const pending = await storage.uploadPending(submissionId, 'eventImage', pngDataUrl);
  requests.length = 0;
  const published = await storage.promotePending(pending, eventId);
  assert.equal(published.bucket, 'event-media');
  assert.equal(published.objectPath, `${eventId}/event-image.png`);
  assert.equal(published.sha256, pending.sha256);
  assert.equal(published.publicUrl, `https://example.supabase.co/storage/v1/object/public/event-media/${eventId}/event-image.png`);
  assert.deepEqual(requests, [
    `GET https://example.supabase.co/storage/v1/object/authenticated/submission-media/${submissionId}/event-image.png`,
    `POST https://example.supabase.co/storage/v1/object/event-media/${eventId}/event-image.png`,
  ]);
});

test('promotion refuses checksum drift before creating a public object', async () => {
  let writes = 0;
  const storage = new SupabaseSubmissionMediaStorage(
    { supabaseUrl: 'https://example.supabase.co', serviceRoleKey: 'server-secret' },
    { fetchImpl: async (_url, init) => {
      if ((init?.method || 'GET') === 'GET') return response(200, Buffer.from('changed'));
      writes += 1;
      return response(200, '{}');
    } },
  );
  await assert.rejects(
    storage.promotePending({
      bucket: 'submission-media',
      objectPath: `${submissionId}/event-image.png`,
      mimeType: 'image/png',
      byteSize: pngBytes.byteLength,
      sha256: parseGovernedDataImage(pngDataUrl).sha256,
      kind: 'eventImage',
    }, eventId),
    /checksum mismatch/,
  );
  assert.equal(writes, 0);
});

test('private reads use short-lived server-created signed URLs', async () => {
  let body = '';
  const storage = new SupabaseSubmissionMediaStorage(
    { supabaseUrl: 'https://example.supabase.co', serviceRoleKey: 'server-secret' },
    { fetchImpl: async (_url, init) => {
      body = String(init?.body);
      return response(200, JSON.stringify({ signedURL: '/object/sign/submission-media/path.png?token=signed' }), { 'content-type': 'application/json' });
    } },
  );
  const url = await storage.signPending({
    bucket: 'submission-media', objectPath: `${submissionId}/event-image.png`, mimeType: 'image/png',
    byteSize: pngBytes.byteLength, sha256: parseGovernedDataImage(pngDataUrl).sha256, kind: 'eventImage',
  });
  assert.equal(url, 'https://example.supabase.co/storage/v1/object/sign/submission-media/path.png?token=signed');
  assert.deepEqual(JSON.parse(body), { expiresIn: 900 });
});

test('public cleanup deletes only canonical event-media URLs through the trusted batch endpoint', async () => {
  let body = '';
  const storage = new SupabaseSubmissionMediaStorage(
    { supabaseUrl: 'https://example.supabase.co', serviceRoleKey: 'server-secret' },
    { fetchImpl: async (_url, init) => { body = String(init?.body); return response(200, '[]'); } },
  );
  await storage.removePublic([
    `https://example.supabase.co/storage/v1/object/public/event-media/local-approved-${submissionId}/event-image.png`,
    'https://external.example/image.png',
  ]);
  assert.deepEqual(JSON.parse(body), { prefixes: [`local-approved-${submissionId}/event-image.png`] });
});

test('private cleanup uses the trusted batch-delete endpoint with canonical stored paths', async () => {
  let request: { url: string; init?: RequestInit } | undefined;
  const storage = new SupabaseSubmissionMediaStorage(
    { supabaseUrl: 'https://example.supabase.co', serviceRoleKey: 'server-secret' },
    { fetchImpl: async (url, init) => {
      request = { url: String(url), init };
      return response(200, '[]', { 'content-type': 'application/json' });
    } },
  );
  await storage.removePending([{
    bucket: 'submission-media',
    objectPath: `${submissionId}/logo.png`,
    mimeType: 'image/png',
    byteSize: pngBytes.byteLength,
    sha256: parseGovernedDataImage(pngDataUrl).sha256,
    kind: 'logo',
  }]);
  assert.equal(request?.url, 'https://example.supabase.co/storage/v1/object/submission-media');
  assert.equal(request?.init?.method, 'DELETE');
  assert.deepEqual(JSON.parse(String(request?.init?.body)), { prefixes: [`${submissionId}/logo.png`] });
});
