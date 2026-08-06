import assert from 'node:assert/strict';
import test from 'node:test';
import { authorizationBearerToken, configuredOperatorEmails } from '../lib/operator-auth-config.ts';

test('bearer tokens are read only from the Authorization header', () => {
  assert.equal(authorizationBearerToken(new Headers()), undefined);
  assert.equal(authorizationBearerToken(new Headers({ authorization: 'Basic abc' })), undefined);
  assert.equal(authorizationBearerToken(new Headers({ authorization: 'Bearer access-token' })), 'access-token');
});

test('legacy shared-token headers cannot become bearer authorization', () => {
  assert.equal(authorizationBearerToken(new Headers({ 'x-loop-local-operator-token': 'legacy-secret' })), undefined);
});

test('configured operator email allowlist is normalized and comma bounded', () => {
  const emails = configuredOperatorEmails(' Admin@TryLoopLocal.com, wilson.jed@gmail.com ,,');
  assert.equal(emails.has('admin@trylooplocal.com'), true);
  assert.equal(emails.has('wilson.jed@gmail.com'), true);
  assert.equal(emails.has(''), false);
});
