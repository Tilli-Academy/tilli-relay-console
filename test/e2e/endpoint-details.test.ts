import { test, expect } from '@playwright/test';

test.describe('Endpoint Detail View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForSelector('rundocs-tag-group');
  });

  test('clicking GET endpoint loads detail view', async ({ page }) => {
    const item = page.locator('rundocs-endpoint-item').first();
    await item.click();

    const endpoint = page.locator('rundocs-endpoint');
    await expect(endpoint).toBeVisible();
  });

  test('endpoint shows method badge', async ({ page }) => {
    const item = page.locator('rundocs-endpoint-item').first();
    await item.click();

    await expect(page.locator('rundocs-endpoint rundocs-method-badge')).toBeVisible();
  });

  test('endpoint shows path display', async ({ page }) => {
    const item = page.locator('rundocs-endpoint-item').first();
    await item.click();

    await expect(page.locator('rundocs-endpoint rundocs-path-display')).toBeVisible();
  });

  test('endpoint with path param highlights parameter', async ({ page }) => {
    // Find an endpoint with {id} in path
    const paramItem = page.locator('rundocs-endpoint-item .path', { hasText: '{id}' }).first();
    await paramItem.click();

    const pathParam = page.locator('rundocs-path-display .param');
    await expect(pathParam).toBeVisible();
  });

  test('documentation tabs are visible', async ({ page }) => {
    const item = page.locator('rundocs-endpoint-item').first();
    await item.click();

    await expect(page.locator('rundocs-endpoint .docs-tab-bar')).toBeVisible();
  });

  test('Responses tab shows status code badges', async ({ page }) => {
    const item = page.locator('rundocs-endpoint-item').first();
    await item.click();

    const responsesTab = page.locator('.docs-tab-bar .tab', { hasText: 'Responses' });
    await responsesTab.click();

    await expect(page.locator('.response-code').first()).toBeVisible();
  });

  test('POST endpoint shows Request Body tab', async ({ page }) => {
    const postItem = page.locator('rundocs-endpoint-item[method="post"]').first();
    await postItem.click();

    await expect(page.locator('.docs-tab-bar .tab', { hasText: 'Request Body' })).toBeVisible();
  });

  test('switching endpoints updates the view', async ({ page }) => {
    const items = page.locator('rundocs-endpoint-item');

    // Click first endpoint
    await items.nth(0).click();
    const firstPath = await page.locator('rundocs-path-display').getAttribute('path');

    // Click an endpoint from a different tag group (index 10+ should be in a different group)
    const totalItems = await items.count();
    const differentIndex = Math.min(10, totalItems - 1);
    await items.nth(differentIndex).click();
    await page.waitForTimeout(300);
    const secondPath = await page.locator('rundocs-path-display').getAttribute('path');

    expect(firstPath).not.toBe(secondPath);
  });
});
