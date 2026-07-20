import assert from 'node:assert/strict';
import test from 'node:test';
import { authorizationBearerToken } from '../lib/operator-auth-config.ts';

test('bearer tokens are read only from the Authorization header', () => {
  assert.equal(authorizationBearerToken(new Headers()), undefined);
  assert.equal(authorizationBearerToken(new Headers({ authorization: 'Basic abc' })), undefined);
  assert.equal(authorizationBearerToken(new Headers({ authorization: 'Bearer access-token' })), 'access-token');
});

test('legacy shared-token headers cannot become bearer authorization', () => {
  assert.equal(authorizationBearerToken(new Headers({ 'x-loop-local-operator-token': 'legacy-secret' })), undefined);
});
