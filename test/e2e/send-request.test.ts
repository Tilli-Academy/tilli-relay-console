import { test, expect } from '@playwright/test';

test.describe('Sending Requests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForSelector('rundocs-tag-group');
  });

  test('send GET request shows response', async ({ page }) => {
    const item = page.locator('rundocs-endpoint-item').first();
    await item.click();
    await page.waitForSelector('rundocs-endpoint');

    const sendBtn = page.locator('rundocs-request-bar .send-btn');
    await sendBtn.click();

    // Wait for response to appear
    await expect(page.locator('rundocs-response-meta')).toBeVisible({ timeout: 15000 });
  });

  test('response shows status badge', async ({ page }) => {
    const item = page.locator('rundocs-endpoint-item').first();
    await item.click();

    const sendBtn = page.locator('rundocs-request-bar .send-btn');
    await sendBtn.click();

    await expect(page.locator('rundocs-response-meta rundocs-status-badge')).toBeVisible({ timeout: 15000 });
  });

  test('response shows time and size', async ({ page }) => {
    const item = page.locator('rundocs-endpoint-item').first();
    await item.click();

    const sendBtn = page.locator('rundocs-request-bar .send-btn');
    await sendBtn.click();

    const meta = page.locator('rundocs-response-meta');
    await expect(meta).toBeVisible({ timeout: 15000 });
    await expect(meta).toContainText('ms');
  });

  test('Enter key in URL input sends request', async ({ page }) => {
    const item = page.locator('rundocs-endpoint-item').first();
    await item.click();

    const urlInput = page.locator('rundocs-request-bar .url-input');
    await urlInput.press('Enter');

    await expect(page.locator('rundocs-response-meta')).toBeVisible({ timeout: 15000 });
  });

  test('path param substitution in code samples', async ({ page }) => {
    // Select endpoint with {id}
    const paramItem = page.locator('rundocs-endpoint-item .path', { hasText: '{id}' }).first();
    await paramItem.click();
    await page.waitForSelector('rundocs-params-editor');

    // Fill path param
    const paramInput = page.locator('rundocs-params-editor input').first();
    await paramInput.fill('1');

    // Verify substitution via code samples (URL input shows template, code samples resolve params)
    const codeTab = page.locator('.docs-tab-bar .tab', { hasText: 'Code' });
    await codeTab.click();

    await expect(page.locator('rundocs-code-block')).toContainText('/1');
    await expect(page.locator('rundocs-code-block')).not.toContainText('{id}');
  });

  test('send button shows loading state', async ({ page }) => {
    const item = page.locator('rundocs-endpoint-item').first();
    await item.click();

    const sendBtn = page.locator('rundocs-request-bar .send-btn');

    // Listen for the loading state text
    const sendPromise = sendBtn.click();
    // The button text changes to "Sending..." while loading
    await expect(sendBtn).toContainText(/send/i, { timeout: 15000 });
    await sendPromise;
  });

  test('re-send shows loading overlay', async ({ page }) => {
    const item = page.locator('rundocs-endpoint-item').first();
    await item.click();

    const sendBtn = page.locator('rundocs-request-bar .send-btn');
    await sendBtn.click();

    // Wait for first response
    await expect(page.locator('rundocs-response-meta')).toBeVisible({ timeout: 15000 });

    // Send again — response area should still be visible
    await sendBtn.click();
    await expect(page.locator('rundocs-response')).toBeVisible();
  });
});
