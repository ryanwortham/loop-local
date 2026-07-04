#!/usr/bin/env node
// mobile-browser-smoke-pass: real mobile viewport click smoke for Loop Local.
import { chromium, devices } from '@playwright/test';

const baseURL = process.env.LOOP_LOCAL_SMOKE_URL || 'http://127.0.0.1:3002';
const device = devices['iPhone 14 Pro'];
const timeout = 15000;

function fail(message) {
  throw new Error(message);
}

async function assertClickable(page, locator, label, options = {}) {
  await locator.waitFor({ state: 'visible', timeout });
  await locator.scrollIntoViewIfNeeded({ timeout });
  const box = await locator.boundingBox();
  if (!box) fail(`${label} has no bounding box`);
  if (box.width < 32 || box.height < 32) fail(`${label} tap target too small: ${box.width}x${box.height}`);
  const center = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const hit = await page.evaluate(({ x, y }) => {
    const node = document.elementFromPoint(x, y);
    if (!node) return null;
    const target = node.closest('button,a,input,select,textarea,[role="button"]');
    return {
      tag: node.tagName,
      text: (target?.textContent || node.textContent || '').trim().slice(0, 80),
      aria: target?.getAttribute('aria-label') || node.getAttribute('aria-label') || '',
      cls: target?.className?.toString?.() || node.className?.toString?.() || '',
    };
  }, center);
  if (!hit) fail(`${label} center point is not hitting any element`);
  await locator.click({ timeout, force: Boolean(options.force) });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ ...device, viewport: { width: 393, height: 852 } });
  const page = await context.newPage();
  page.setDefaultTimeout(timeout);

  await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });
  await page.locator('.mobile-interaction-qa-pass').waitFor({ timeout });
  await page.locator('.mobile-qa-target').first().waitFor({ timeout });

  await assertClickable(page, page.getByLabel('Menu'), 'home menu button');
  await page.locator('.mobile-menu-panel').waitFor({ state: 'visible', timeout });
  await assertClickable(page, page.getByLabel('Open Review Queue'), 'Open Review Queue');
  await page.getByRole('heading', { name: 'Review queue' }).waitFor({ timeout });

  await assertClickable(page, page.getByLabel('Menu'), 'reopen home menu button');
  await page.locator('.mobile-menu-panel').waitFor({ state: 'visible', timeout });
  await page.getByLabel('Open Saved Events').waitFor({ state: 'visible', timeout });
  await assertClickable(page, page.getByText('Saved events').first(), 'Open Saved Events menu item');
  await page.getByRole('heading', { name: 'Saved events' }).waitFor({ timeout });

  await assertClickable(page, page.getByPlaceholder('Search events, artists, venues…'), 'mobile search input');
  await page.getByPlaceholder('Search events, artists, venues…').fill('music');
  await assertClickable(page, page.locator('.polished-bottom-nav button').filter({ hasText: 'Map' }), 'bottom Map tab', { force: true });
  await page.locator('#map').waitFor({ state: 'visible', timeout });
  await assertClickable(page, page.locator('.polished-bottom-nav button').filter({ hasText: 'Profile' }), 'bottom Profile tab', { force: true });
  await page.getByRole('heading', { name: 'Review queue' }).waitFor({ timeout });

  await page.request.post(`${baseURL}/api/local-submissions`, {
    data: { action: 'replace', pendingSubmissions: [], publishedLocalEvents: [] },
  });

  await page.goto(`${baseURL}/post-local`, { waitUntil: 'domcontentloaded' });
  await page.locator('.post-mobile-reference-shell.mobile-interaction-qa-pass').waitFor({ timeout });
  await page.getByLabel('Post Local mobile tabs').waitFor({ timeout });
  await assertClickable(page, page.locator('.mobile-qa-post-dock').getByText('Profile details'), 'Post Local profile dock target');
  await page.locator('#profile').waitFor({ state: 'visible', timeout });
  await assertClickable(page, page.locator('.mobile-qa-post-dock').getByText('Submit'), 'Post Local submit dock target');
  await page.locator('#submit-for-approval').waitFor({ state: 'visible', timeout });
  await assertClickable(page, page.getByRole('button', { name: 'Submit for Approval' }), 'Submit for Approval button');
  await page.getByRole('alert').waitFor({ timeout });

  // api-backed-local-submissions-pass: submit a valid item and prove it survives through Review Queue publish.
  // Submitted for API-backed review: API Smoke Bakery / API Smoke Market Night.
  await page.locator('input[name="entityName"]').fill('API Smoke Bakery');
  await page.locator('input[name="logo"]').setInputFiles('public/looplocal-logo.png');
  await page.locator('input[name="event_image"]').setInputFiles('public/looplocal-logo.png');
  await page.locator('input[name="contactName"]').fill('Riley Smoke');
  await page.locator('input[name="email"]').fill('riley@example.com');
  await page.locator('select[name="entityType"]').selectOption('Business');
  await page.locator('input[name="eventTitle"]').fill('API Smoke Market Night');
  await page.locator('input[name="eventDate"]').fill('2026-08-15');
  await page.locator('input[name="locationName"]').fill('Loop Local Test Hall');
  await page.locator('input[name="eventCity"]').fill('St. Louis');
  await page.locator('select[name="eventCategory"]').selectOption('Community');
  await page.locator('textarea[name="eventDescription"]').fill('Submitted for API-backed review from the mobile smoke test.');
  await assertClickable(page, page.getByRole('button', { name: 'Submit for Approval' }), 'valid Submit for Approval button');
  await page.getByText('Ready for review', { exact: true }).waitFor({ timeout });
  await page.locator('.post-submit-success').getByText('Submission ID').waitFor({ timeout });
  const lookupSubmissionId = (await page.locator('.post-submit-success code').first().textContent())?.trim();
  if (!lookupSubmissionId) fail('submitter-status-lookup-pass: missing lookupSubmissionId after submit');
  await Promise.all([
    page.waitForURL(/\/post-local\/status\//, { timeout }),
    page.getByRole('link', { name: 'Check submission status' }).click({ timeout }),
  ]);
  await page.getByText('Pending review', { exact: true }).first().waitFor({ timeout });
  // review-history-timeline-pass: mobile status page exposes Submitted/Changes requested/Resubmitted history.
  await page.getByText('Review timeline').first().waitFor({ timeout });
  await page.getByText('Submitted for review').first().waitFor({ timeout });
  // submitter-status-live-refresh-pass: Status auto-refresh detected reviewer update without a full page reload.
  await page.request.patch(`${baseURL}/api/local-submissions`, {
    data: { id: lookupSubmissionId, status: 'needs_changes', reviewerNote: 'Mobile smoke reviewer note' },
  });
  await page.getByText('Needs changes', { exact: true }).first().waitFor({ timeout: 12000 });
  await page.getByText('Changes requested').first().waitFor({ timeout: 12000 });
  await page.getByText('Mobile smoke reviewer note').first().waitFor({ timeout: 12000 });

  // submitter-status-lookup-pass: returning submitters can enter a Submission ID lookup from Post Local.
  await page.goto(`${baseURL}/post-local`, { waitUntil: 'domcontentloaded' });
  await page.getByLabel('Submission ID lookup').waitFor({ timeout });
  await page.getByText('Check an existing submission').waitFor({ timeout });
  await page.getByText('Enter your Submission ID', { exact: true }).waitFor({ timeout });
  await page.getByPlaceholder('local-event-name-178...').fill(lookupSubmissionId);
  await Promise.all([
    page.waitForURL(/\/post-local\/status\//, { timeout }),
    page.getByRole('button', { name: 'View status' }).click({ timeout }),
  ]);
  await page.getByText('Needs changes', { exact: true }).first().waitFor({ timeout });
  // submitter-revision-flow-pass: submitter can revise a needs_changes submission and resubmit the same ID.
  await Promise.all([
    page.waitForURL(/\/post-local\?revisionId=/, { timeout }),
    page.getByRole('link', { name: 'Revise submission' }).click({ timeout }),
  ]);
  await page.getByText('Requested changes are loaded').waitFor({ timeout });
  await page.getByRole('button', { name: 'Resubmit for Review' }).waitFor({ timeout });
  await page.locator('input[name="eventTitle"]').fill('API Smoke Market Night Revised');
  await assertClickable(page, page.getByRole('button', { name: 'Resubmit for Review' }), 'Resubmit for Review');
  await page.getByText('Updated submission returned to review queue', { exact: true }).waitFor({ timeout });
  await Promise.all([
    page.waitForURL(/\/post-local\/status\//, { timeout }),
    page.getByRole('link', { name: 'Check submission status' }).click({ timeout }),
  ]);
  await page.getByText('Pending review', { exact: true }).first().waitFor({ timeout });
  await page.getByText('Resubmitted for review').first().waitFor({ timeout });

  await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });
  await assertClickable(page, page.locator('.polished-bottom-nav button').filter({ hasText: 'Profile' }), 'Profile tab after API submit', { force: true });
  await page.getByRole('heading', { name: 'Review queue' }).waitFor({ timeout });
  await page.getByText('API Smoke Market Night Revised').waitFor({ timeout });
  // operator-submitter-link-pass: operators can copy/open the submitter status handoff URL from the review queue.
  await assertClickable(page, page.getByRole('button', { name: 'Copy submitter link' }).first(), 'Copy submitter link');
  await page.getByText(/Submitter link copied|Copy unavailable/).waitFor({ timeout });
  const operatorStatusLink = page.getByRole('link', { name: 'Open status page' }).first();
  const statusHref = await operatorStatusLink.getAttribute('href');
  if (!statusHref || !statusHref.includes('/post-local/status/')) fail('operator-submitter-link-pass: missing /post-local/status/ href');
  await Promise.all([
    page.waitForURL(/\/post-local\/status\//, { timeout }),
    operatorStatusLink.click({ timeout }),
  ]);
  await page.getByText('Pending review', { exact: true }).first().waitFor({ timeout });
  await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });
  await assertClickable(page, page.locator('.polished-bottom-nav button').filter({ hasText: 'Profile' }), 'Profile tab before publish after status handoff', { force: true });
  await page.getByRole('heading', { name: 'Review queue' }).waitFor({ timeout });
  await page.getByText('API Smoke Market Night Revised').waitFor({ timeout });
  await assertClickable(page, page.getByRole('button', { name: 'Publish locally' }).first(), 'Publish locally API-backed submission');
  await page.getByText('Locally approved').first().waitFor({ timeout });
  // published-status-history-pass: published status retains Resubmitted for review after pending queue removal.
  await page.goto(`${baseURL}/post-local/status/${encodeURIComponent(lookupSubmissionId)}`, { waitUntil: 'domcontentloaded' });
  await page.getByText('Published locally', { exact: true }).first().waitFor({ timeout });
  await page.getByText('Resubmitted for review').first().waitFor({ timeout });
  await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });
  await assertClickable(page, page.locator('.polished-bottom-nav button').filter({ hasText: 'Profile' }), 'Profile tab after published status history check', { force: true });
  await assertClickable(page, page.locator('.pending-submissions-panel').getByRole('button', { name: 'Close' }), 'Close Review Queue after publish');
  await assertClickable(page, page.locator('.polished-bottom-nav button').filter({ hasText: 'Discover' }), 'Discover tab before local detail click', { force: true });
  await page.getByPlaceholder('Search events, artists, venues…').fill('API Smoke Market Night Revised');
  await page.getByText('API Smoke Market Night Revised').first().waitFor({ timeout });
  // local-published-detail-pages-pass: API Smoke Market Night detail page legacy marker; API Smoke Market Night Revised detail page should open from discovery.
  const localDetailLink = page.locator('a[href*="api-smoke-market-night"]').first();
  await localDetailLink.waitFor({ state: 'visible', timeout });
  await Promise.all([
    page.waitForURL(/\/events\//, { timeout }),
    localDetailLink.click({ timeout }),
  ]);
  if (!page.url().includes('/events/')) fail('Published local detail click did not navigate to /events/');
  await page.getByRole('heading', { name: 'API Smoke Market Night Revised' }).waitFor({ timeout });
  await page.getByText('Plan your visit').waitFor({ timeout });
  const hasPhotoPublishedDetail = await page.locator('[data-image-state="photo"]').first().isVisible({ timeout }).catch(() => false);
  if (!hasPhotoPublishedDetail) fail('post-local-media-persistence-pass: expected published local detail to render data-image-state="photo"');

  await context.close();
  await browser.close();
  console.log('loop_local_mobile_interaction_smoke_ok');
}

main().catch((error) => {
  console.error(error?.stack || error?.message || error);
  process.exit(1);
});
