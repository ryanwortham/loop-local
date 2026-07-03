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

  await page.goto(`${baseURL}/`, { waitUntil: 'domcontentloaded' });
  await assertClickable(page, page.locator('.polished-bottom-nav button').filter({ hasText: 'Profile' }), 'Profile tab after API submit', { force: true });
  await page.getByRole('heading', { name: 'Review queue' }).waitFor({ timeout });
  await page.getByText('API Smoke Market Night').waitFor({ timeout });
  await assertClickable(page, page.getByRole('button', { name: 'Publish locally' }).first(), 'Publish locally API-backed submission');
  await page.getByText('Locally approved').first().waitFor({ timeout });
  await page.getByPlaceholder('Search events, artists, venues…').fill('API Smoke Market Night');
  await page.getByText('API Smoke Market Night').first().waitFor({ timeout });

  await context.close();
  await browser.close();
  console.log('loop_local_mobile_interaction_smoke_ok');
}

main().catch((error) => {
  console.error(error?.stack || error?.message || error);
  process.exit(1);
});
