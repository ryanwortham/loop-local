import assert from 'node:assert/strict';
import test from 'node:test';
import { mergeSavedEventIds, parseGuestSavedEventIds, persistedEventId, savedEventsSyncIsCurrent } from '../lib/saved-events.ts';

test('persisted event identities accept canonical UUIDs and local-approved feed aliases', () => {
  const id = '11111111-1111-4111-8111-111111111111';
  assert.equal(persistedEventId(id), id);
  assert.equal(persistedEventId(`local-approved-${id}`), id);
  assert.equal(persistedEventId('external-slug'), null);
});

test('guest save parsing filters invalid values and deduplicates aliases', () => {
  const id = '11111111-1111-4111-8111-111111111111';
  assert.deepEqual(parseGuestSavedEventIds(JSON.stringify([id, `local-approved-${id}`, 4, 'bad'])), [id]);
  assert.deepEqual(parseGuestSavedEventIds('{broken'), []);
});

test('guest and account saves merge as a stable deduplicated union', () => {
  const first = '11111111-1111-4111-8111-111111111111';
  const second = '22222222-2222-4222-8222-222222222222';
  assert.deepEqual(mergeSavedEventIds([first], [second, first]), [second, first]);
});

test('account save synchronization accepts results only for the still-current signed-in user', () => {
  const first = '11111111-1111-4111-8111-111111111111';
  const second = '22222222-2222-4222-8222-222222222222';
  assert.equal(savedEventsSyncIsCurrent(first, first), true);
  assert.equal(savedEventsSyncIsCurrent(first, second), false);
  assert.equal(savedEventsSyncIsCurrent(first, null), false);
});
