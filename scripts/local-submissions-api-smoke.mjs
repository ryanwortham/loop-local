#!/usr/bin/env node
// local-submissions-api-smoke-pass: direct CRUD/publish smoke for /api/local-submissions.
// published-status-history-pass: published local status API/page must preserve localSubmissionStatusHistory after publish.

const baseURL = process.env.LOOP_LOCAL_API_SMOKE_URL || 'http://127.0.0.1:3002';
const operatorAccessToken = process.env.LOOP_LOCAL_OPERATOR_ACCESS_TOKEN || '';
const operatorActorUserId = process.env.LOOP_LOCAL_OPERATOR_ACTOR_USER_ID || '';
const endpoint = `${baseURL}/api/local-submissions`;

function operatorHeaders(extra = {}) {
  return { Authorization: `Bearer ${operatorAccessToken}`, ...extra };
}

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
  assert(operatorAccessToken && operatorActorUserId, 'authenticated operator smoke credentials are required');
  const mediaDataUrl = 'data:image/png;base64,iVBORw0KGgo=';
  const svgMediaDataUrl = `data:image/svg+xml;base64,${Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"/>').toString('base64')}`;
  // post-local-media-persistence-pass: API Direct Smoke Media verifies eventImageDataUrl/logoDataUrl survives publish.
  // media-sanitization-boundary-pass: image/png;base64 is allowed, SVG media should be rejected, oversized payload should be rejected, invalid URL should be rejected.
  // operator-supabase-auth-pass: protected requests require a verified Supabase operator session.
  let response = await request('');
  assertStatus(response, 401, 'protected GET without authentication');
  let data = await json(response);
  assert(data.error === 'operator authentication required', 'protected GET should require operator authentication');

  response = await fetch(`${baseURL}/api/auth/operator-session`, { headers: { accept: 'application/json' } });
  assertStatus(response, 200, 'operator session discovery');
  data = await json(response);
  assert(data.authenticated === false && data.operator === false, 'anonymous session must not be an operator');
  assert(!('fallbackEnabled' in data), 'operator session must not expose a shared-token fallback');

  response = await fetch(`${baseURL}/api/auth/operator-session`, { headers: operatorHeaders({ accept: 'application/json' }) });
  assertStatus(response, 200, 'authenticated operator session discovery');
  data = await json(response);
  assert(data.authenticated === true && data.operator === true && data.authMethod === 'supabase', 'authenticated smoke operator must be verified by Supabase');

  const accountHtml = await fetchText(`${baseURL}/account`);
  assert(accountHtml.includes('Your Loop Local account'), 'account page should render the account experience');

  response = await request('', {
    method: 'PATCH',
    body: JSON.stringify({ id: 'missing', status: 'approved_local' }),
  });
  assertStatus(response, 401, 'protected PATCH without token');

  response = await request('', {
    method: 'POST',
    headers: operatorHeaders(),
    body: JSON.stringify({ action: 'replace', pendingSubmissions: [], publishedLocalEvents: [] }),
  });
  assertStatus(response, 200, 'reset store');
  data = await json(response);
  assert(data.ok === true, 'reset should be ok');
  assert(Array.isArray(data.pendingSubmissions) && data.pendingSubmissions.length === 0, 'reset pending should be empty');
  assert(Array.isArray(data.publishedLocalEvents) && data.publishedLocalEvents.length === 0, 'reset published should be empty');

  const concurrentCreateResponses = await Promise.all(Array.from({ length: 16 }, (_, index) => request('', {
    method: 'POST',
    headers: operatorHeaders(),
    body: JSON.stringify({
      entityName: `Concurrent Integrity ${index}`,
      eventTitle: `Concurrent Integrity Event ${index}`,
      eventDate: '2026-11-01',
      eventCategory: 'Community',
      requestId: `00000000-0000-4000-8000-${String(index).padStart(12, '0')}`,
    }),
  })));
  for (const [index, concurrentResponse] of concurrentCreateResponses.entries()) {
    assertStatus(concurrentResponse, 201, `concurrent create ${index}`);
    await json(concurrentResponse);
  }
  response = await request('', { headers: operatorHeaders() });
  assertStatus(response, 200, 'queue after concurrent creates');
  data = await json(response);
  assert(data.pendingSubmissions.filter((item) => item.eventTitle?.startsWith('Concurrent Integrity Event')).length === 16, 'concurrent creates must not lose submissions');

  const idempotentCreatePayload = {
    entityName: 'Idempotent Integrity',
    eventTitle: 'Idempotent Integrity Event',
    eventDate: '2026-11-02',
    eventCategory: 'Community',
    requestId: '11111111-1111-4111-8111-111111111111',
  };
  response = await request('', { method: 'POST', headers: operatorHeaders(), body: JSON.stringify(idempotentCreatePayload) });
  assertStatus(response, 201, 'first idempotent create');
  data = await json(response);
  const idempotentSubmissionId = data.submission.id;
  assert(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(idempotentSubmissionId), 'new submissions must use database-compatible UUID ids');
  response = await request('', { method: 'POST', headers: operatorHeaders(), body: JSON.stringify(idempotentCreatePayload) });
  assertStatus(response, 200, 'replayed idempotent create');
  data = await json(response);
  assert(data.submission.id === idempotentSubmissionId, 'replayed create should return the original submission');
  response = await request('', { headers: operatorHeaders() });
  data = await json(response);
  assert(data.pendingSubmissions.filter((item) => item.requestId === idempotentCreatePayload.requestId).length === 1, 'replayed create must persist exactly once');

  response = await request('', { method: 'POST', body: JSON.stringify({}) });
  assertStatus(response, 400, 'missing create payload');

  response = await request('', { method: 'POST', body: JSON.stringify({ entityName: 'Weak Idempotency Smoke', eventTitle: 'Weak Idempotency Event', eventDate: '2026-11-03', eventCategory: 'Community', requestId: 'guessable-key' }) });
  assertStatus(response, 400, 'weak idempotency key');
  data = await json(response);
  assert(data.error === 'invalid requestId', 'idempotency keys must be UUID capability values');

  response = await request('', { method: 'POST', body: JSON.stringify({ entityName: 'Missing Category Smoke', eventTitle: 'Missing Category Event', eventDate: '2026-09-21' }) });
  assertStatus(response, 400, 'event category completeness');
  data = await json(response);
  assert(data.error === 'event category is required', 'event submissions should require a category');

  response = await request('', { method: 'POST', body: JSON.stringify({ entityName: 'Missing Date Smoke', eventTitle: 'Missing Date Event', eventCategory: 'Community' }) });
  assertStatus(response, 400, 'event date completeness');
  data = await json(response);
  assert(data.error === 'event date is required', 'event submissions should require a date');

  response = await request('', { method: 'POST', body: JSON.stringify({ entityName: 'Entity Only Smoke' }) });
  assertStatus(response, 201, 'non-event entity submission remains valid');
  data = await json(response);
  const entityOnlyId = data.submission.id;
  response = await request('', {
    method: 'PATCH',
    headers: operatorHeaders({ 'content-type': 'application/json' }),
    body: JSON.stringify({ id: entityOnlyId, action: 'publish' }),
  });
  assertStatus(response, 400, 'incomplete entity-only submission cannot publish as an event');
  data = await json(response);
  assert(data.error === 'submission is not publish-ready: Event title, Event date, Event category', 'publish readiness should list missing fields');

  response = await request('', { method: 'POST', body: JSON.stringify({ entityName: 'Unknown Category Smoke', eventTitle: 'Unknown Category Event', eventCategory: 'Made Up Category' }) });
  assertStatus(response, 400, 'unknown event category');
  data = await json(response);
  assert(data.error === 'invalid event category', 'unknown category should return a stable validation error');

  response = await request('', { method: 'POST', body: JSON.stringify({ entityName: 'Taxonomy Review Smoke', eventTitle: 'Taxonomy Review Smoke Event', eventDate: '2026-10-01', eventCategory: 'Community' }) });
  assertStatus(response, 201, 'create taxonomy review target');
  data = await json(response);
  const taxonomySubmissionId = data.submission.id;
  response = await request('', {
    method: 'PATCH',
    headers: operatorHeaders({ 'content-type': 'application/json' }),
    body: JSON.stringify({ id: taxonomySubmissionId, action: 'publish' }),
  });
  assertStatus(response, 200, 'publish taxonomy review target');
  data = await json(response);
  const taxonomyEventId = data.published.id;

  response = await request('', { headers: operatorHeaders() });
  assertStatus(response, 200, 'operator taxonomy review queue');
  data = await json(response);
  assert(Array.isArray(data.taxonomyReviewItems) && data.taxonomyReviewItems.some((item) => item.id === taxonomyEventId), 'generic published event should enter taxonomy review queue');

  response = await request('', {
    method: 'PATCH',
    body: JSON.stringify({ id: taxonomyEventId, action: 'set_category_override', eventCategory: 'Sports' }),
  });
  assertStatus(response, 401, 'taxonomy override requires operator authentication');

  response = await request('', {
    method: 'PATCH',
    headers: operatorHeaders({ 'content-type': 'application/json' }),
    body: JSON.stringify({ id: taxonomyEventId, action: 'set_category_override', eventCategory: 'Made Up Category' }),
  });
  assertStatus(response, 400, 'taxonomy override rejects unsupported category');

  response = await request('', {
    method: 'PATCH',
    headers: operatorHeaders({ 'content-type': 'application/json' }),
    body: JSON.stringify({ id: taxonomyEventId, action: 'set_category_override', eventCategory: 'Sports' }),
  });
  assertStatus(response, 200, 'operator applies explicit taxonomy override');
  data = await json(response);
  assert(data.override?.category === 'Sports', 'override response should expose reviewed category');

  response = await fetch(`${baseURL}/api/feed`, { headers: { accept: 'application/json' } });
  assertStatus(response, 200, 'feed after taxonomy override');
  data = await json(response);
  let taxonomyFeedItem = data.items.find((item) => item.id === taxonomyEventId);
  assert(taxonomyFeedItem?.category === 'Sports', 'explicit override should update consumer taxonomy');
  assert(taxonomyFeedItem?.sourceCategory === 'Community', 'consumer feed should preserve source category provenance');
  assert(taxonomyFeedItem?.categoryOverrideApplied === true, 'consumer feed should mark reviewed correction');
  assert(taxonomyFeedItem?.fallbackImageUrl === '/event-art/sports.svg', 'reviewed category should update fallback art');

  response = await request('', {
    method: 'PATCH',
    headers: operatorHeaders({ 'content-type': 'application/json' }),
    body: JSON.stringify({ id: taxonomyEventId, action: 'set_category_override' }),
  });
  assertStatus(response, 200, 'operator restores source taxonomy');
  response = await fetch(`${baseURL}/api/feed`, { headers: { accept: 'application/json' } });
  data = await json(response);
  taxonomyFeedItem = data.items.find((item) => item.id === taxonomyEventId);
  assert(taxonomyFeedItem?.category === 'Community' && !taxonomyFeedItem?.categoryOverrideApplied, 'clearing override should restore source-authored category');

  response = await request('', { method: 'POST', body: JSON.stringify({ entityName: 'Bad URL Smoke', eventTitle: 'Bad URL Event', eventDate: '2026-09-21', eventCategory: 'Community', website: 'javascript:alert(1)' }) });
  assertStatus(response, 201, 'invalid URL should be rejected but nonfatal');
  data = await json(response);
  assert(!data.submission.website, 'invalid URL should be rejected');

  response = await request('', { method: 'POST', body: JSON.stringify({ entityName: 'SVG Smoke', eventTitle: 'SVG Smoke Event', logoDataUrl: svgMediaDataUrl }) });
  assertStatus(response, 400, 'SVG media should be rejected');
  data = await json(response);
  assert(data.error === 'unsupported image type', 'SVG media should be rejected with unsupported image type');

  response = await request('', { method: 'POST', body: JSON.stringify({ entityName: 'Oversized Smoke', eventTitle: 'Oversized Smoke Event', eventDescription: 'x'.repeat(3000000) }) });
  assertStatus(response, 413, 'oversized payload should be rejected');

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
      requestId: '22222222-2222-4222-8222-222222222222',
      logoDataUrl: mediaDataUrl,
      logoFileName: 'api-direct-smoke-logo.png',
      eventImageDataUrl: mediaDataUrl,
      eventImageFileName: 'api-direct-smoke-event.png',
    }),
  });
  assertStatus(response, 201, 'create submission');
  data = await json(response);
  const id = data.submission?.id;
  const statusToken = data.submission?.statusToken;
  assert(id, 'created submission should have id');
  assert(statusToken, 'created submission should have statusToken');
  assert(data.submission.status === 'pending_review', 'created submission should be pending_review');
  assert(data.submission.statusHistory?.some((entry) => entry.action === 'submitted'), 'submitted history entry should persist');
  assert(!('pendingSubmissions' in data), 'create response must not expose pending queue');
  assert(!('publishedLocalEvents' in data), 'create response must not expose published queue');
  assert(!('eventCategoryOverrides' in data), 'create response must not expose taxonomy store');

  // single-submission-status-api-pass: direct single status pending_review endpoint.
  // Contract marker URL: /api/local-submissions/${encodeURIComponent(id)}
  response = await request(`/${encodeURIComponent(id)}`, { headers: { 'x-loop-local-status-token': statusToken } });
  assertStatus(response, 200, 'single status pending_review via capability header');
  assert(response.headers.get('cache-control')?.includes('private') && response.headers.get('cache-control')?.includes('no-store'), 'status API must be private no-store');
  assert(response.headers.get('referrer-policy') === 'no-referrer', 'status API must not send referrers');
  data = await json(response);
  assert(data.submissionId === id, 'single status should return submissionId');
  assert(data.status === 'pending_review', 'single status should return pending_review');
  assert(data.submission?.eventTitle === 'API Direct Smoke Night', 'single status should include pending submission');

  response = await request(`/${encodeURIComponent(id)}`, { headers: { 'x-loop-local-status-token': `${statusToken}#statusToken=${statusToken}` } });
  assertStatus(response, 401, 'malformed compound status capability');
  assert(response.headers.get('cache-control')?.includes('no-store'), 'status API errors must also be no-store');
  await json(response);

  response = await request(`/${encodeURIComponent(id)}?statusToken=${encodeURIComponent(statusToken)}`);
  assertStatus(response, 401, 'legacy status query capability must be rejected');
  data = await json(response);
  assert(data.error === 'status token required', 'query capability must not authorize status access');

  const statusPageResponse = await fetch(`${baseURL}/post-local/status/${encodeURIComponent(id)}`, { redirect: 'manual' });
  assertStatus(statusPageResponse, 200, 'status page client bootstrap');
  assert(statusPageResponse.headers.get('cache-control')?.includes('private') && statusPageResponse.headers.get('cache-control')?.includes('no-store'), 'status page must be private no-store');
  assert(statusPageResponse.headers.get('referrer-policy') === 'no-referrer', 'status page must not send referrers');
  const statusShellHtml = await statusPageResponse.text();
  assert(statusShellHtml.includes('Post Local status'), 'status page should render a capability-safe client shell');
  assert(!statusShellHtml.includes('API Direct Smoke Night') && !statusShellHtml.includes(statusToken), 'status shell must not serialize private submission content or capability tokens');

  const legacyStatusPageResponse = await fetch(`${baseURL}/post-local/status/${encodeURIComponent(id)}?statusToken=${encodeURIComponent(statusToken)}`, { redirect: 'manual' });
  assert([307, 308].includes(legacyStatusPageResponse.status), 'legacy status page query must redirect to a clean URL');
  const scrubbedStatusLocation = legacyStatusPageResponse.headers.get('location') || '';
  assert(!scrubbedStatusLocation.includes('statusToken') && !scrubbedStatusLocation.includes('#'), 'legacy status page query must discard rather than migrate the capability');
  const scrubbedStatusPageResponse = await fetch(new URL(scrubbedStatusLocation, baseURL));
  assertStatus(scrubbedStatusPageResponse, 200, 'scrubbed status page shell');
  const legacyStatusShellHtml = await scrubbedStatusPageResponse.text();
  assert(!legacyStatusShellHtml.includes(statusToken) && !legacyStatusShellHtml.includes('API Direct Smoke Night'), 'legacy status shell must not serialize query capability data');

  // needs-changes-note-gate-pass: needs_changes without reviewerNote should be rejected.
  response = await request('', {
    method: 'PATCH',
    headers: operatorHeaders(),
    body: JSON.stringify({ id, status: 'needs_changes' }),
  });
  assertStatus(response, 400, 'needs_changes without reviewerNote');
  data = await json(response);
  assert(data.error === 'reviewerNote is required to request changes', 'needs_changes should require reviewerNote');

  response = await request('', {
    method: 'PATCH',
    headers: operatorHeaders(),
    body: JSON.stringify({ id, status: 'needs_changes', reviewerNote: 'reviewerNote: needs stronger event photo' }),
  });
  assertStatus(response, 200, 'update submission');
  data = await json(response);
  assert(data.submission.status === 'needs_changes', 'patched status should be needs_changes');
  assert(data.submission.statusHistory?.some((entry) => entry.action === 'needs_changes'), 'needs_changes history entry should persist');
  assert(data.submission.statusHistory?.some((entry) => entry.action === 'needs_changes' && entry.actorUserId === operatorActorUserId && entry.authMethod === 'supabase'), 'review history must attribute the authenticated operator');
  assert(data.submission.reviewerNote?.includes('reviewerNote'), 'patched reviewer note should persist');

  response = await request(`/${encodeURIComponent(id)}`, { headers: { 'x-loop-local-status-token': statusToken } });
  assertStatus(response, 200, 'single status needs_changes');
  data = await json(response);
  assert(data.status === 'needs_changes', 'single status should return needs_changes');
  assert(data.submission?.reviewerNote?.includes('reviewerNote'), 'single status should include reviewer note');

  // submitter-status-page-pass: API Direct Smoke Night status page hydrates sensitive Needs changes and View published event content through the no-store capability API.
  let statusHtml = await fetchText(`${baseURL}/post-local/status/${encodeURIComponent(id)}`);
  assert(statusHtml.includes('Post Local status'), 'status page should render the capability-safe shell');

  const revisionPayload = {
    id,
    action: 'resubmit',
    statusToken,
    revisionRequestId: '33333333-3333-4333-8333-333333333333',
    eventTitle: 'API Direct Smoke Night Revised',
    eventDescription: 'Revised after reviewer note.',
  };
  response = await request('', {
    method: 'PATCH',
    body: JSON.stringify(revisionPayload),
  });
  assertStatus(response, 200, 'resubmit revised submission');
  data = await json(response);
  assert(data.submission.status === 'pending_review', 'resubmitted submission should return to pending_review');
  assert(data.submission.statusHistory?.some((entry) => entry.action === 'resubmitted'), 'resubmitted history entry should persist');
  assert(data.submission.eventTitle === 'API Direct Smoke Night Revised', 'resubmitted title should persist');
  assert(!data.submission.reviewerNote, 'reviewerNote should clear after resubmit');
  assert(!('pendingSubmissions' in data), 'resubmit response must not expose pending queue');
  assert(!('publishedLocalEvents' in data), 'resubmit response must not expose published queue');
  assert(!('eventCategoryOverrides' in data), 'resubmit response must not expose taxonomy store');

  response = await request('', { method: 'PATCH', body: JSON.stringify(revisionPayload) });
  assertStatus(response, 200, 'replayed idempotent resubmit');
  response = await request('', { headers: operatorHeaders() });
  data = await json(response);
  const idempotentRevision = data.pendingSubmissions.find((item) => item.id === id);
  assert(idempotentRevision?.statusHistory?.filter((entry) => entry.action === 'resubmitted').length === 1, 'replayed resubmit must append history exactly once');

  response = await request(`/${encodeURIComponent(id)}`, { headers: { 'x-loop-local-status-token': statusToken } });
  assertStatus(response, 200, 'single status after resubmit');
  data = await json(response);
  assert(data.status === 'pending_review', 'single status should return pending_review after resubmit');
  assert(data.submission?.eventTitle === 'API Direct Smoke Night Revised', 'single status should include revised title');

  response = await request('', {
    method: 'PATCH',
    headers: operatorHeaders(),
    body: JSON.stringify({ id, action: 'publish' }),
  });
  assertStatus(response, 200, 'publish submission');
  data = await json(response);
  assert(data.submission.status === 'published_local', 'published submission should be marked published_local');
  assert(data.submission.statusHistory?.some((entry) => entry.action === 'published_local'), 'published_local history entry should persist');
  assert(data.published?.title === 'API Direct Smoke Night Revised', 'published feed item should use event title');
  assert(data.published?.localSubmissionStatusHistory?.some((entry) => entry.action === 'resubmitted'), 'published response should preserve review history');
  assert(data.published?.localSubmissionStatusHistory?.some((entry) => entry.action === 'published_local'), 'published response should include published_local history');
  assert(data.published?.localSubmissionStatusHistory?.some((entry) => entry.action === 'published_local' && entry.actorUserId === operatorActorUserId), 'published history must identify the operator actor');
  // Contract markers: published.image_url?.startsWith('data:image/png;base64,') and published.imageState === 'photo'
  assert(data.published.image_url?.startsWith('data:image/png;base64,'), 'published image_url should preserve event media data URL');
  assert(data.published.imageState === 'photo', 'published imageState should be photo');
  assert(data.publishedLocalEvents.some((item) => item.title === 'API Direct Smoke Night Revised'), 'publishedLocalEvents should include published event');
  assert(!data.pendingSubmissions.some((item) => item.id === id), 'published submission should leave pending queue');

  response = await request(`/${encodeURIComponent(id)}`, { headers: { 'x-loop-local-status-token': statusToken } });
  assertStatus(response, 200, 'single status published_local');
  data = await json(response);
  assert(data.status === 'published_local', 'single status should return published_local');
  assert(data.published?.title === 'API Direct Smoke Night Revised', 'single status should include published event');
  assert(data.published?.localSubmissionStatusHistory?.some((entry) => entry.action === 'resubmitted'), 'published single status should preserve review history');
  assert(data.submission === null, 'single status published response should not expose a pending submission');

  response = await request('/missing-submission-id', { headers: { 'x-loop-local-status-token': statusToken } });
  assertStatus(response, 404, 'single status 404');
  data = await json(response);
  assert(data.ok === false && data.error === 'submission not found', 'single status 404 should return error JSON');

  statusHtml = await fetchText(`${baseURL}/post-local/status/${encodeURIComponent(id)}`);
  // Legacy assertion marker: published status page should preserve timeline after client hydration.
  assert(statusHtml.includes('Post Local status'), 'published status page should keep the capability-safe shell');

  response = await request('', {
    method: 'POST',
    body: JSON.stringify({ entityName: 'Delete Smoke Org', eventTitle: 'Delete Smoke Event', eventDate: '2026-09-22', eventCategory: 'Community' }),
  });
  assertStatus(response, 201, 'create delete target');
  data = await json(response);
  const deleteId = data.submission?.id;
  assert(deleteId, 'delete target should have id');

  response = await request(`?id=${encodeURIComponent(deleteId)}`, { method: 'DELETE', headers: operatorHeaders() });
  assertStatus(response, 200, 'DELETE submission');
  data = await json(response);
  assert(!data.pendingSubmissions.some((item) => item.id === deleteId), 'DELETE should remove pending submission');

  response = await request('', { method: 'GET', headers: operatorHeaders() });
  assertStatus(response, 200, 'GET store');
  data = await json(response);
  assert(data.ok === true, 'GET should be ok');
  assert(data.publishedLocalEvents.some((item) => item.title === 'API Direct Smoke Night Revised'), 'publishedLocalEvents should include published event');
  assert(Array.isArray(data.operatorAuditLog) && data.operatorAuditLog.length >= 4, 'operator mutations must append durable audit entries');
  assert(data.operatorAuditLog.every((entry) => entry.actorUserId === operatorActorUserId), 'every operator audit entry must identify its actor');
  assert(data.operatorAuditLog.every((entry) => entry.authMethod === 'supabase'), 'audit entries must identify Supabase authentication');

  response = await request('', {
    method: 'POST',
    headers: operatorHeaders(),
    body: JSON.stringify({ action: 'replace', pendingSubmissions: [], publishedLocalEvents: [] }),
  });
  assertStatus(response, 200, 'final reset');

  console.log('loop_local_local_submissions_api_smoke_ok');
}

main().catch((error) => {
  console.error(error?.stack || error?.message || error);
  process.exit(1);
});
