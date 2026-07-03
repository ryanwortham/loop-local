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

  await page.goto(`${baseURL}/`, { waitUntil: 'networkidle' });
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

  await page.goto(`${baseURL}/post-local`, { waitUntil: 'networkidle' });
  await page.locator('.post-mobile-reference-shell.mobile-interaction-qa-pass').waitFor({ timeout });
  await page.getByLabel('Post Local mobile tabs').waitFor({ timeout });
  await assertClickable(page, page.locator('.mobile-qa-post-dock').getByText('Profile details'), 'Post Local profile dock target');
  await page.locator('#profile').waitFor({ state: 'visible', timeout });
  await assertClickable(page, page.locator('.mobile-qa-post-dock').getByText('Submit'), 'Post Local submit dock target');
  await page.locator('#submit-for-approval').waitFor({ state: 'visible', timeout });
  await assertClickable(page, page.getByRole('button', { name: 'Submit for Approval' }), 'Submit for Approval button');
  await page.getByRole('alert').waitFor({ timeout });

  await context.close();
  await browser.close();
  console.log('loop_local_mobile_interaction_smoke_ok');
}

main().catch((error) => {
  console.error(error?.stack || error?.message || error);
  process.exit(1);
});
