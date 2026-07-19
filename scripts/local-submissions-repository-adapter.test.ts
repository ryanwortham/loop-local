import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveLocalSubmissionsAdapter } from '../lib/local-submissions/repository.ts';

test('local submissions adapter defaults to file', () => {
  assert.equal(resolveLocalSubmissionsAdapter({}), 'file');
  assert.equal(resolveLocalSubmissionsAdapter({ LOOP_LOCAL_SUBMISSIONS_ADAPTER: '' }), 'file');
});

test('local submissions adapter accepts the explicit supabase cutover value', () => {
  assert.equal(resolveLocalSubmissionsAdapter({ LOCAL_SUBMISSIONS_ADAPTER: 'supabase' }), 'supabase');
  assert.equal(resolveLocalSubmissionsAdapter({ LOCAL_SUBMISSIONS_ADAPTER: ' file ' }), 'file');
  assert.equal(resolveLocalSubmissionsAdapter({ LOOP_LOCAL_SUBMISSIONS_ADAPTER: 'supabase' }), 'supabase');
});

test('local submissions adapter fails closed on invalid or conflicting configuration', () => {
  assert.throws(
    () => resolveLocalSubmissionsAdapter({ LOCAL_SUBMISSIONS_ADAPTER: 'memory' }),
    /LOCAL_SUBMISSIONS_ADAPTER must be file or supabase/,
  );
  assert.throws(
    () => resolveLocalSubmissionsAdapter({ LOCAL_SUBMISSIONS_ADAPTER: 'supabase', LOOP_LOCAL_SUBMISSIONS_ADAPTER: 'file' }),
    /conflicting local submissions adapter configuration/,
  );
});
