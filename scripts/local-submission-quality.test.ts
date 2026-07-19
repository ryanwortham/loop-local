import assert from 'node:assert/strict';
import test from 'node:test';
import { submissionPublicationQuality } from '../lib/local-submission-quality.ts';
import {
  MAX_LOCAL_SUBMISSION_DATA_IMAGE_LENGTH,
  MAX_LOCAL_SUBMISSION_PAYLOAD_BYTES,
  MAX_LOCAL_SUBMISSION_UPLOAD_BYTES,
} from '../lib/local-submission-limits.ts';
import type { LocalSubmissionRecord } from '../lib/local-submissions-store.ts';

function submission(overrides: Partial<LocalSubmissionRecord> = {}): LocalSubmissionRecord {
  return {
    id: 'quality-1',
    entityName: 'Quality Venue',
    eventTitle: 'Quality Event',
    eventDate: '2026-09-21',
    eventCategory: 'Arts & Culture',
    status: 'pending_review',
    submittedAt: '2026-07-19T00:00:00.000Z',
    ...overrides,
  };
}

test('complete submissions are publishable with an honest bundled-art fallback', () => {
  const quality = submissionPublicationQuality(submission());
  assert.equal(quality.canPublish, true);
  assert.deepEqual(quality.missingFields, []);
  assert.equal(quality.mediaMode, 'bundled');
  assert.match(quality.previewImageUrl, /^\/event-art\/arts-culture\.svg$/);
  assert.equal(quality.mediaLabel, 'Bundled fallback art');
});

test('publication readiness identifies every missing event field', () => {
  const quality = submissionPublicationQuality(submission({ eventTitle: undefined, eventDate: undefined, eventCategory: undefined }));
  assert.equal(quality.canPublish, false);
  assert.deepEqual(quality.missingFields, ['Event title', 'Event date', 'Event category']);
});

test('event imagery wins over a logo while a logo remains a visible secondary fallback', () => {
  const logo = submissionPublicationQuality(submission({ logoDataUrl: 'data:image/png;base64,logo' }));
  assert.equal(logo.mediaMode, 'logo');
  assert.equal(logo.previewImageUrl, 'data:image/png;base64,logo');
  assert.equal(logo.mediaLabel, 'Logo fallback');

  const eventImage = submissionPublicationQuality(submission({
    logoDataUrl: 'data:image/png;base64,logo',
    eventImageDataUrl: 'data:image/jpeg;base64,event',
  }));
  assert.equal(eventImage.mediaMode, 'event_image');
  assert.equal(eventImage.previewImageUrl, 'data:image/jpeg;base64,event');
  assert.equal(eventImage.mediaLabel, 'Custom event image');
});

test('governed pending media remains publishable and uses a signed preview when available', () => {
  const governed = submissionPublicationQuality(submission({
    eventImageMedia: {
      bucket: 'submission-media',
      objectPath: '11111111-1111-4111-8111-111111111111/event-image.png',
      mimeType: 'image/png',
      byteSize: 128,
      sha256: 'a'.repeat(64),
      kind: 'eventImage',
    },
    eventImageMediaUrl: 'https://example.test/signed-event-image',
  }));
  assert.equal(governed.canPublish, true);
  assert.equal(governed.mediaMode, 'event_image');
  assert.equal(governed.previewImageUrl, 'https://example.test/signed-event-image');
});

test('browser upload limits fit both encoded images inside the API payload boundary', () => {
  const encodedImageLength = Math.ceil(MAX_LOCAL_SUBMISSION_UPLOAD_BYTES / 3) * 4 + 64;
  assert.ok(encodedImageLength <= MAX_LOCAL_SUBMISSION_DATA_IMAGE_LENGTH);
  assert.ok((encodedImageLength * 2) + 100_000 <= MAX_LOCAL_SUBMISSION_PAYLOAD_BYTES);
});
