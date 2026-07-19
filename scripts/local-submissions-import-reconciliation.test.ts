import assert from 'node:assert/strict';
import test from 'node:test';
import {
  canonicalRepositoryState,
  reconcileRepositoryStates,
  repositoryStateHash,
} from '../lib/local-submissions/import-reconciliation.ts';

const source = {
  version: 1 as const,
  pendingSubmissions: [{
    id: '11111111-1111-4111-8111-111111111111',
    status: 'pending_review',
    statusToken: 'plaintext-capability',
    eventTitle: 'Import fixture',
    statusHistory: [{ action: 'submitted', at: '2026-07-19T12:00:00.000Z' }],
  }],
  publishedLocalEvents: [{ id: 'local-approved-22222222-2222-4222-8222-222222222222', title: 'Published fixture' }],
  eventCategoryOverrides: { '33333333-3333-4333-8333-333333333333': { category: 'Music', sourceCategory: 'Community' } },
  operatorAuditLog: [{ id: '44444444-4444-4444-8444-444444444444', action: 'update_submission', actorUserId: '55555555-5555-4555-8555-555555555555', targetType: 'local_submission', targetId: '11111111-1111-4111-8111-111111111111', at: '2026-07-19T12:05:00.000Z' }],
};

test('canonical import state strips plaintext status capabilities', () => {
  const canonical = canonicalRepositoryState(source);
  assert.equal(JSON.stringify(canonical).includes('plaintext-capability'), false);
  assert.equal((canonical.pendingSubmissions[0] as Record<string, unknown>).statusToken, undefined);
});

test('repository state hashing is deterministic across object key order', () => {
  const reordered = {
    operatorAuditLog: source.operatorAuditLog,
    eventCategoryOverrides: source.eventCategoryOverrides,
    publishedLocalEvents: source.publishedLocalEvents,
    pendingSubmissions: source.pendingSubmissions,
    version: 1 as const,
  };
  assert.equal(repositoryStateHash(source), repositoryStateHash(reordered));
  assert.match(repositoryStateHash(source), /^[0-9a-f]{64}$/);
});

test('reconciliation rejects content drift even when IDs, statuses, and histories match', () => {
  const destination = canonicalRepositoryState(source);
  destination.pendingSubmissions = [{
    ...(destination.pendingSubmissions[0] as Record<string, unknown>),
    eventTitle: 'Different title with the same identity',
  }];
  const report = reconcileRepositoryStates(source, destination);
  assert.equal(report.matches, false);
  assert.notEqual(report.sourceHash, report.destinationHash);
});

test('reconciliation reports exact queue and history mismatches without exposing capabilities', () => {
  const destination = canonicalRepositoryState(source);
  destination.pendingSubmissions = [{ ...(destination.pendingSubmissions[0] as Record<string, unknown>), status: 'needs_changes', statusHistory: [] }];
  destination.publishedLocalEvents = [];
  const report = reconcileRepositoryStates(source, destination);
  assert.equal(report.matches, false);
  assert.deepEqual(report.missingPublishedIds, ['local-approved-22222222-2222-4222-8222-222222222222']);
  assert.deepEqual(report.statusMismatches, ['11111111-1111-4111-8111-111111111111']);
  assert.deepEqual(report.historyMismatches, ['11111111-1111-4111-8111-111111111111']);
  assert.equal(JSON.stringify(report).includes('plaintext-capability'), false);
});

test('reconciliation treats governed media references as the canonical form of valid embedded media', () => {
  const png = 'data:image/png;base64,iVBORw0KGgo=';
  const pendingId = '11111111-1111-4111-8111-111111111111';
  const eventId = 'local-approved-22222222-2222-4222-8222-222222222222';
  const withEmbeddedMedia = {
    version: 1 as const,
    pendingSubmissions: [{ id: pendingId, status: 'pending_review', eventImageDataUrl: png }],
    publishedLocalEvents: [{ id: eventId, image_url: png }],
  };
  const canonical = canonicalRepositoryState(withEmbeddedMedia);
  const destination = {
    ...canonical,
    publishedLocalEvents: [{ id: eventId, image_url: `https://project.supabase.co/storage/v1/object/public/event-media/${eventId}/event-image.png` }],
  };
  const report = reconcileRepositoryStates(withEmbeddedMedia, destination);
  assert.equal(report.matches, true);
  const pending = canonical.pendingSubmissions[0] as Record<string, unknown>;
  assert.equal(pending.eventImageDataUrl, undefined);
  assert.match(JSON.stringify(pending.eventImageMedia), /submission-media/);
});
