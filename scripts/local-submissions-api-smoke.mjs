#!/usr/bin/env node
// local-submissions-api-smoke-pass: direct CRUD/publish smoke for /api/local-submissions.

const baseURL = process.env.LOOP_LOCAL_API_SMOKE_URL || 'http://127.0.0.1:3002';
const endpoint = `${baseURL}/api/local-submissions`;

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function assertStatus(response, expected, label) {
  assert(response.status === expected, `${label} expected ${expected}, got ${response.status}`);
}

async function json(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    fail(`invalid JSON response: ${text.slice(0, 200)}`);
  }
}

async function request(path = '', init = {}) {
  return fetch(`${endpoint}${path}`, {
    ...init,
    headers: {
      accept: 'application/json',
      ...(init.body ? { 'content-type': 'application/json' } : {}),
      ...(init.headers || {}),
    },
  });
}

async function main() {
  const mediaSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32"><rect width="32" height="32" fill="#2563eb"/><text x="6" y="21" font-size="12" fill="white">LL</text></svg>';
  const mediaDataUrl = `data:image/svg+xml;base64,${Buffer.from(mediaSvg).toString('base64')}`;
  // post-local-media-persistence-pass: API Direct Smoke Media verifies eventImageDataUrl/logoDataUrl survives publish.
  let response = await request('', {
    method: 'POST',
    body: JSON.stringify({ action: 'replace', pendingSubmissions: [], publishedLocalEvents: [] }),
  });
  assertStatus(response, 200, 'reset store');
  let data = await json(response);
  assert(data.ok === true, 'reset should be ok');
  assert(Array.isArray(data.pendingSubmissions) && data.pendingSubmissions.length === 0, 'reset pending should be empty');
  assert(Array.isArray(data.publishedLocalEvents) && data.publishedLocalEvents.length === 0, 'reset published should be empty');

  response = await request('', { method: 'POST', body: JSON.stringify({}) });
  assertStatus(response, 400, 'missing create payload');

  response = await request('', {
    method: 'POST',
    body: JSON.stringify({
      entityName: 'API Direct Smoke Bakery',
      contactName: 'Casey API',
      email: 'casey-api@example.com',
      eventTitle: 'API Direct Smoke Night',
      eventDate: '2026-09-21',
      startTime: '19:00',
      locationName: 'Direct API Hall',
      eventCity: 'St. Louis',
      eventState: 'MO',
      eventCategory: 'Community',
      eventDescription: 'Direct API smoke test submission.',
      logoDataUrl: mediaDataUrl,
      logoFileName: 'api-direct-smoke-logo.svg',
      eventImageDataUrl: mediaDataUrl,
      eventImageFileName: 'api-direct-smoke-event.svg',
    }),
  });
  assertStatus(response, 201, 'create submission');
  data = await json(response);
  const id = data.submission?.id;
  assert(id, 'created submission should have id');
  assert(data.submission.status === 'pending_review', 'created submission should be pending_review');
  assert(data.pendingSubmissions.some((item) => item.id === id), 'created submission should appear in queue');

  response = await request('', {
    method: 'PATCH',
    body: JSON.stringify({ id, status: 'needs_changes', reviewerNote: 'reviewerNote: needs stronger event photo' }),
  });
  assertStatus(response, 200, 'update submission');
  data = await json(response);
  assert(data.submission.status === 'needs_changes', 'patched status should be needs_changes');
  assert(data.submission.reviewerNote?.includes('reviewerNote'), 'patched reviewer note should persist');

  response = await request('', {
    method: 'PATCH',
    body: JSON.stringify({ id, action: 'publish' }),
  });
  assertStatus(response, 200, 'publish submission');
  data = await json(response);
  assert(data.submission.status === 'published_local', 'published submission should be marked published_local');
  assert(data.published?.title === 'API Direct Smoke Night', 'published feed item should use event title');
  // Contract markers: published.image_url?.startsWith('data:image/svg+xml;base64,') and published.imageState === 'photo'
  assert(data.published.image_url?.startsWith('data:image/svg+xml;base64,'), 'published image_url should preserve event media data URL');
  assert(data.published.imageState === 'photo', 'published imageState should be photo');
  assert(Array.isArray(data.publishedLocalEvents) && data.publishedLocalEvents.some((item) => item.title === 'API Direct Smoke Night'), 'publishedLocalEvents should include published event');
  assert(!data.pendingSubmissions.some((item) => item.id === id), 'published submission should leave pending queue');

  response = await request('', {
    method: 'POST',
    body: JSON.stringify({ entityName: 'Delete Smoke Org', eventTitle: 'Delete Smoke Event' }),
  });
  assertStatus(response, 201, 'create delete target');
  data = await json(response);
  const deleteId = data.submission?.id;
  assert(deleteId, 'delete target should have id');

  response = await request(`?id=${encodeURIComponent(deleteId)}`, { method: 'DELETE' });
  assertStatus(response, 200, 'DELETE submission');
  data = await json(response);
  assert(!data.pendingSubmissions.some((item) => item.id === deleteId), 'DELETE should remove pending submission');

  response = await request('', { method: 'GET' });
  assertStatus(response, 200, 'GET store');
  data = await json(response);
  assert(data.ok === true, 'GET should be ok');
  assert(data.publishedLocalEvents.some((item) => item.title === 'API Direct Smoke Night'), 'GET should keep published event');

  response = await request('', {
    method: 'POST',
    body: JSON.stringify({ action: 'replace', pendingSubmissions: [], publishedLocalEvents: [] }),
  });
  assertStatus(response, 200, 'final reset');

  console.log('loop_local_local_submissions_api_smoke_ok');
}

main().catch((error) => {
  console.error(error?.stack || error?.message || error);
  process.exit(1);
});
