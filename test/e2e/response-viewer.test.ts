import { test, expect } from '@playwright/test';

test.describe('Response Viewer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForSelector('rundocs-tag-group');

    // Select first endpoint and send request
    const item = page.locator('rundocs-endpoint-item').first();
    await item.click();
    await page.locator('rundocs-request-bar .send-btn').click();
    await page.waitForSelector('rundocs-response-meta', { timeout: 15000 });
  });

  test('response body is displayed', async ({ page }) => {
    await expect(page.locator('rundocs-response-body')).toBeVisible();
  });

  test('Pretty/Raw toggle exists', async ({ page }) => {
    const prettyBtn = page.locator('rundocs-response-body .view-btn');
    await expect(prettyBtn.first()).toBeVisible();
  });

  test('Headers tab shows response headers', async ({ page }) => {
    const headersTab = page.locator('rundocs-response button', { hasText: 'Headers' });
    await headersTab.click();

    await expect(page.locator('rundocs-response-headers')).toBeVisible();
    await expect(page.locator('rundocs-response-headers .headers-table')).toBeVisible();
  });

  test('status badge has color', async ({ page }) => {
    const badge = page.locator('rundocs-response-meta rundocs-status-badge');
    await expect(badge).toBeVisible();
  });

  test('response meta shows time and size', async ({ page }) => {
    const meta = page.locator('rundocs-response-meta');
    await expect(meta).toContainText('ms');
  });

  test('word wrap toggle exists', async ({ page }) => {
    const wrapBtn = page.locator('rundocs-response-body .wrap-toggle');
    await expect(wrapBtn).toBeVisible();
  });
});
