import assert from 'node:assert/strict';
import test from 'node:test';
import {
  authorizationBearerToken,
  operatorFallbackActorId,
  operatorFallbackEnabled,
} from '../lib/operator-auth-config.ts';

test('shared operator-token fallback is disabled by default and requires an explicit true flag', () => {
  assert.equal(operatorFallbackEnabled({}), false);
  assert.equal(operatorFallbackEnabled({ LOOP_LOCAL_OPERATOR_TOKEN_FALLBACK_ENABLED: 'false' }), false);
  assert.equal(operatorFallbackEnabled({ LOOP_LOCAL_OPERATOR_TOKEN_FALLBACK_ENABLED: 'true' }), true);
});

test('fallback actor identity must be a UUID before emergency access can be attributed', () => {
  assert.equal(operatorFallbackActorId({}), undefined);
  assert.equal(operatorFallbackActorId({ LOOP_LOCAL_OPERATOR_FALLBACK_ACTOR_USER_ID: 'not-a-user' }), undefined);
  assert.equal(
    operatorFallbackActorId({ LOOP_LOCAL_OPERATOR_FALLBACK_ACTOR_USER_ID: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' }),
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  );
});

test('bearer tokens are read only from the Authorization header', () => {
  assert.equal(authorizationBearerToken(new Headers()), undefined);
  assert.equal(authorizationBearerToken(new Headers({ authorization: 'Basic abc' })), undefined);
  assert.equal(authorizationBearerToken(new Headers({ authorization: 'Bearer access-token' })), 'access-token');
});
