import assert from 'node:assert/strict';
import test from 'node:test';

// The Next configuration intentionally remains JavaScript so Next can load it directly.
// @ts-expect-error The runtime contract below validates its exported shape.
import nextConfig from '../next.config.mjs';

type HeaderRule = {
  source: string;
  headers: Array<{ key: string; value: string }>;
};

async function configuredHeaders(): Promise<HeaderRule[]> {
  assert.equal(typeof nextConfig.headers, 'function', 'Next config must define response headers');
  return await nextConfig.headers() as HeaderRule[];
}

function headerMap(rule: HeaderRule): Map<string, string> {
  return new Map(rule.headers.map((header) => [header.key.toLowerCase(), header.value]));
}

test('public routes receive the launch security-header baseline', async () => {
  const rules = await configuredHeaders();
  const globalRule = rules.find((rule) => rule.source === '/:path*');
  assert.ok(globalRule, 'a global /:path* header rule is required');

  const headers = headerMap(globalRule);
  assert.equal(headers.get('x-content-type-options'), 'nosniff');
  assert.equal(headers.get('x-frame-options'), 'DENY');
  assert.equal(headers.get('cross-origin-opener-policy'), 'same-origin');
  assert.equal(headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
  assert.equal(headers.get('permissions-policy'), 'camera=(), microphone=(), geolocation=(self)');
  assert.match(headers.get('strict-transport-security') || '', /max-age=31536000/);

  const csp = headers.get('content-security-policy') || '';
  assert.match(csp, /default-src 'self'/);
  assert.match(csp, /frame-ancestors 'none'/);
  assert.match(csp, /object-src 'none'/);
  assert.match(csp, /connect-src 'self' https:\/\/\*\.supabase\.co wss:\/\/\*\.supabase\.co/);
});

test('private submission routes retain no-store and no-referrer controls', async () => {
  const rules = await configuredHeaders();
  for (const source of ['/post-local/status/:path*', '/api/local-submissions/:path*']) {
    const rule = rules.find((candidate) => candidate.source === source);
    assert.ok(rule, `missing private header rule for ${source}`);
    const headers = headerMap(rule);
    assert.equal(headers.get('cache-control'), 'private, no-store, max-age=0, must-revalidate');
    assert.equal(headers.get('referrer-policy'), 'no-referrer');
    assert.match(headers.get('x-robots-tag') || '', /noindex/);
  }
});
