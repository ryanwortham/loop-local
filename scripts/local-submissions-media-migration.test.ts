import assert from 'node:assert/strict';
import test from 'node:test';
import { buildMediaMigrationManifest, reconcileMediaMigration } from '../lib/local-submissions/media-migration.ts';

const png = 'data:image/png;base64,iVBORw0KGgo=';
const pendingId = '11111111-1111-4111-8111-111111111111';
const eventId = 'local-approved-22222222-2222-4222-8222-222222222222';

const source = {
  version: 1 as const,
  pendingSubmissions: [{ id: pendingId, logoDataUrl: png, eventImageDataUrl: png }],
  publishedLocalEvents: [{ id: eventId, image_url: png }],
};

const metadata = { generatedAt: '2026-07-19T20:00:00.000Z', sourcePath: '/immutable/source.json', sourceFileSha256: 'a'.repeat(64) };

test('media migration manifest inventories private and public embedded bytes deterministically', () => {
  const manifest = buildMediaMigrationManifest(source, metadata);
  assert.equal(manifest.items.length, 3);
  assert.deepEqual(manifest.items.map((item) => `${item.bucket}/${item.objectPath}`), [
    `event-media/${eventId}/event-image.png`,
    `submission-media/${pendingId}/event-image.png`,
    `submission-media/${pendingId}/logo.png`,
  ]);
  assert.equal(new Set(manifest.items.map((item) => item.sha256)).size, 1);
  assert.equal(manifest.sourceFileSha256, 'a'.repeat(64));
});

test('media reconciliation requires durable references, object checksums, and no remaining data URLs', () => {
  const manifest = buildMediaMigrationManifest(source, metadata);
  const byPath = Object.fromEntries(manifest.items.map((item) => [`${item.bucket}/${item.objectPath}`, item.sha256]));
  const pendingItems = manifest.items.filter((item) => item.bucket === 'submission-media');
  const eventItem = manifest.items.find((item) => item.bucket === 'event-media')!;
  const destination = {
    version: 1 as const,
    pendingSubmissions: [{
      id: pendingId,
      logoMedia: { ...pendingItems.find((item) => item.kind === 'logo') },
      eventImageMedia: { ...pendingItems.find((item) => item.kind === 'eventImage') },
    }],
    publishedLocalEvents: [{
      id: eventId,
      image_url: `https://project.supabase.co/storage/v1/object/public/event-media/${eventItem.objectPath}`,
    }],
  };
  assert.equal(reconcileMediaMigration(manifest, destination, byPath).matches, true);
  const drift = reconcileMediaMigration(manifest, destination, { ...byPath, [`event-media/${eventItem.objectPath}`]: '0'.repeat(64) });
  assert.equal(drift.matches, false);
  assert.deepEqual(drift.checksumMismatches, [`event-media/${eventItem.objectPath}`]);
});

test('media reconciliation rejects references while any embedded data survives', () => {
  const manifest = buildMediaMigrationManifest(source, metadata);
  const report = reconcileMediaMigration(manifest, source, {});
  assert.equal(report.matches, false);
  assert.equal(report.embeddedMediaRemaining.length, 3);
  assert.equal(report.missingReferences.length, 3);
  assert.equal(report.checksumMismatches.length, 3);
});
