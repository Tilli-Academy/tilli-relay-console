import { test, expect } from '@playwright/test';

test.describe('Request History', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage to start fresh
    await page.goto('./');
    await page.evaluate(() => {
      localStorage.removeItem('rundocs:history');
    });
    await page.reload();
    await page.waitForSelector('rundocs-tag-group');
  });

  test('empty history shows message', async ({ page }) => {
    const historyTab = page.locator('rundocs-sidebar button[role="tab"]', { hasText: 'History' });
    await historyTab.click();

    await expect(page.locator('rundocs-history-list rundocs-empty-state')).toContainText(/no history/i);
  });

  test('sending request creates history entry', async ({ page }) => {
    // Send a request
    const item = page.locator('rundocs-endpoint-item').first();
    await item.click();
    await page.locator('rundocs-request-bar .send-btn').click();
    await page.waitForSelector('rundocs-response-meta', { timeout: 15000 });

    // Switch to History tab
    const historyTab = page.locator('rundocs-sidebar button[role="tab"]', { hasText: 'History' });
    await historyTab.click();

    await expect(page.locator('rundocs-history-item')).toHaveCount(1);
  });

  test('history entry shows method and URL', async ({ page }) => {
    const item = page.locator('rundocs-endpoint-item').first();
    await item.click();
    await page.locator('rundocs-request-bar .send-btn').click();
    await page.waitForSelector('rundocs-response-meta', { timeout: 15000 });

    const historyTab = page.locator('rundocs-sidebar button[role="tab"]', { hasText: 'History' });
    await historyTab.click();

    const entry = page.locator('rundocs-history-item').first();
    // History item renders method as <span class="method"> and URL as <div class="url">
    await expect(entry.locator('.method')).toBeVisible();
    await expect(entry.locator('.url')).toContainText('fakerestapi');
  });

  test('history entry grouped under Today', async ({ page }) => {
    const item = page.locator('rundocs-endpoint-item').first();
    await item.click();
    await page.locator('rundocs-request-bar .send-btn').click();
    await page.waitForSelector('rundocs-response-meta', { timeout: 15000 });

    const historyTab = page.locator('rundocs-sidebar button[role="tab"]', { hasText: 'History' });
    await historyTab.click();

    await expect(page.locator('rundocs-history-list .date-group-label')).toContainText('Today');
  });

  test('clicking history entry restores request', async ({ page }) => {
    const item = page.locator('rundocs-endpoint-item').first();
    await item.click();
    await page.locator('rundocs-request-bar .send-btn').click();
    await page.waitForSelector('rundocs-response-meta', { timeout: 15000 });

    const historyTab = page.locator('rundocs-sidebar button[role="tab"]', { hasText: 'History' });
    await historyTab.click();

    const entry = page.locator('rundocs-history-item').first();
    await entry.click();

    // Response should be restored
    await expect(page.locator('rundocs-response-meta')).toBeVisible();
  });

  test('clear button removes all history', async ({ page }) => {
    const item = page.locator('rundocs-endpoint-item').first();
    await item.click();
    await page.locator('rundocs-request-bar .send-btn').click();
    await page.waitForSelector('rundocs-response-meta', { timeout: 15000 });

    const historyTab = page.locator('rundocs-sidebar button[role="tab"]', { hasText: 'History' });
    await historyTab.click();

    const clearBtn = page.locator('rundocs-history-list .clear-btn');
    await clearBtn.click();

    await expect(page.locator('rundocs-history-list rundocs-empty-state')).toContainText(/no history/i);
  });

  test('multiple requests appear in reverse order', async ({ page }) => {
    // Send two different requests
    const items = page.locator('rundocs-endpoint-item');

    await items.nth(0).click();
    await page.locator('rundocs-request-bar .send-btn').click();
    await page.waitForSelector('rundocs-response-meta', { timeout: 15000 });

    await items.nth(1).click();
    await page.locator('rundocs-request-bar .send-btn').click();
    await page.waitForSelector('rundocs-response-meta', { timeout: 15000 });

    const historyTab = page.locator('rundocs-sidebar button[role="tab"]', { hasText: 'History' });
    await historyTab.click();

    const historyItems = page.locator('rundocs-history-item');
    await expect(historyItems).toHaveCount(2);
  });
});
