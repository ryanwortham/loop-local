#!/usr/bin/env node
// local-submissions-api-smoke-pass: direct CRUD/publish smoke for /api/local-submissions.
// published-status-history-pass: published local status API/page must preserve localSubmissionStatusHistory after publish.

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

async function fetchText(url) {
  const response = await fetch(url, { headers: { accept: 'text/html' } });
  assertStatus(response, 200, url);
  return response.text();
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
  assert(data.submission.statusHistory?.some((entry) => entry.action === 'submitted'), 'submitted history entry should persist');
  assert(data.pendingSubmissions.some((item) => item.id === id), 'created submission should appear in queue');

  // single-submission-status-api-pass: direct single status pending_review endpoint.
  // Contract marker URL: /api/local-submissions/${encodeURIComponent(id)}
  response = await request(`/${encodeURIComponent(id)}`);
  assertStatus(response, 200, 'single status pending_review');
  data = await json(response);
  assert(data.submissionId === id, 'single status should return submissionId');
  assert(data.status === 'pending_review', 'single status should return pending_review');
  assert(data.submission?.eventTitle === 'API Direct Smoke Night', 'single status should include pending submission');

  // needs-changes-note-gate-pass: needs_changes without reviewerNote should be rejected.
  response = await request('', {
    method: 'PATCH',
    body: JSON.stringify({ id, status: 'needs_changes' }),
  });
  assertStatus(response, 400, 'needs_changes without reviewerNote');
  data = await json(response);
  assert(data.error === 'reviewerNote is required to request changes', 'needs_changes should require reviewerNote');

  response = await request('', {
    method: 'PATCH',
    body: JSON.stringify({ id, status: 'needs_changes', reviewerNote: 'reviewerNote: needs stronger event photo' }),
  });
  assertStatus(response, 200, 'update submission');
  data = await json(response);
  assert(data.submission.status === 'needs_changes', 'patched status should be needs_changes');
  assert(data.submission.statusHistory?.some((entry) => entry.action === 'needs_changes'), 'needs_changes history entry should persist');
  assert(data.submission.reviewerNote?.includes('reviewerNote'), 'patched reviewer note should persist');

  response = await request(`/${encodeURIComponent(id)}`);
  assertStatus(response, 200, 'single status needs_changes');
  data = await json(response);
  assert(data.status === 'needs_changes', 'single status should return needs_changes');
  assert(data.submission?.reviewerNote?.includes('reviewerNote'), 'single status should include reviewer note');

  // submitter-status-page-pass: API Direct Smoke Night status page shows reviewer feedback before publish.
  let statusHtml = await fetchText(`${baseURL}/post-local/status/${encodeURIComponent(id)}`);
  assert(statusHtml.includes('API Direct Smoke Night'), 'status page should show event title');
  assert(statusHtml.includes('Needs changes'), 'status page should show Needs changes');
  assert(statusHtml.includes('reviewerNote'), 'status page should show reviewer note');

  response = await request('', {
    method: 'PATCH',
    body: JSON.stringify({
      id,
      action: 'resubmit',
      eventTitle: 'API Direct Smoke Night Revised',
      eventDescription: 'Revised after reviewer note.',
    }),
  });
  assertStatus(response, 200, 'resubmit revised submission');
  data = await json(response);
  assert(data.submission.status === 'pending_review', 'resubmitted submission should return to pending_review');
  assert(data.submission.statusHistory?.some((entry) => entry.action === 'resubmitted'), 'resubmitted history entry should persist');
  assert(data.submission.eventTitle === 'API Direct Smoke Night Revised', 'resubmitted title should persist');
  assert(!data.submission.reviewerNote, 'reviewerNote should clear after resubmit');

  response = await request(`/${encodeURIComponent(id)}`);
  assertStatus(response, 200, 'single status after resubmit');
  data = await json(response);
  assert(data.status === 'pending_review', 'single status should return pending_review after resubmit');
  assert(data.submission?.eventTitle === 'API Direct Smoke Night Revised', 'single status should include revised title');

  response = await request('', {
    method: 'PATCH',
    body: JSON.stringify({ id, action: 'publish' }),
  });
  assertStatus(response, 200, 'publish submission');
  data = await json(response);
  assert(data.submission.status === 'published_local', 'published submission should be marked published_local');
  assert(data.submission.statusHistory?.some((entry) => entry.action === 'published_local'), 'published_local history entry should persist');
  assert(data.published?.title === 'API Direct Smoke Night Revised', 'published feed item should use event title');
  assert(data.published?.localSubmissionStatusHistory?.some((entry) => entry.action === 'resubmitted'), 'published response should preserve review history');
  assert(data.published?.localSubmissionStatusHistory?.some((entry) => entry.action === 'published_local'), 'published response should include published_local history');
  // Contract markers: published.image_url?.startsWith('data:image/svg+xml;base64,') and published.imageState === 'photo'
  assert(data.published.image_url?.startsWith('data:image/svg+xml;base64,'), 'published image_url should preserve event media data URL');
  assert(data.published.imageState === 'photo', 'published imageState should be photo');
  assert(data.publishedLocalEvents.some((item) => item.title === 'API Direct Smoke Night Revised'), 'publishedLocalEvents should include published event');
  assert(!data.pendingSubmissions.some((item) => item.id === id), 'published submission should leave pending queue');

  response = await request(`/${encodeURIComponent(id)}`);
  assertStatus(response, 200, 'single status published_local');
  data = await json(response);
  assert(data.status === 'published_local', 'single status should return published_local');
  assert(data.published?.title === 'API Direct Smoke Night Revised', 'single status should include published event');
  assert(data.published?.localSubmissionStatusHistory?.some((entry) => entry.action === 'resubmitted'), 'published single status should preserve review history');
  assert(data.submission === null, 'single status published response should not expose a pending submission');

  response = await request('/missing-submission-id');
  assertStatus(response, 404, 'single status 404');
  data = await json(response);
  assert(data.ok === false && data.error === 'submission not found', 'single status 404 should return error JSON');

  statusHtml = await fetchText(`${baseURL}/post-local/status/${encodeURIComponent(id)}`);
  assert(statusHtml.includes('Published locally'), 'published status page should show Published locally');
  assert(statusHtml.includes('Resubmitted for review'), 'published status page should preserve timeline');
  assert(statusHtml.includes('View published event'), 'published status page should show View published event');

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
  assert(data.publishedLocalEvents.some((item) => item.title === 'API Direct Smoke Night Revised'), 'publishedLocalEvents should include published event');

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
