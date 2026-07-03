import { test, expect } from '@playwright/test';

test.describe('Sidebar Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForSelector('rundocs-tag-group');
  });

  test('click History tab switches panel', async ({ page }) => {
    const historyTab = page.locator('rundocs-sidebar button[role="tab"]', { hasText: 'History' });
    await historyTab.click();
    await expect(historyTab).toHaveAttribute('aria-selected', 'true');
  });

  test('click Endpoints tab switches back', async ({ page }) => {
    const historyTab = page.locator('rundocs-sidebar button[role="tab"]', { hasText: 'History' });
    const endpointsTab = page.locator('rundocs-sidebar button[role="tab"]', { hasText: 'Endpoints' });

    await historyTab.click();
    await endpointsTab.click();
    await expect(endpointsTab).toHaveAttribute('aria-selected', 'true');
  });

  test('sidebar toggle collapses and expands sidebar', async ({ page }) => {
    const toggleBtn = page.locator('button[aria-label="Toggle sidebar"]');
    await toggleBtn.click();
    // Sidebar should be hidden after collapse
    await expect(page.locator('rundocs-sidebar')).toBeHidden();

    await toggleBtn.click();
    await expect(page.locator('rundocs-sidebar')).toBeVisible();
  });

  test('tag group collapses and expands', async ({ page }) => {
    const firstTag = page.locator('rundocs-tag-group').first();
    const header = firstTag.locator('.group-header');
    const items = firstTag.locator('rundocs-endpoint-item');

    // Initially expanded
    await expect(items.first()).toBeVisible();

    // Collapse
    await header.click();
    await expect(items.first()).toBeHidden();

    // Expand
    await header.click();
    await expect(items.first()).toBeVisible();
  });

  test('endpoint items show method badge and path', async ({ page }) => {
    const item = page.locator('rundocs-endpoint-item').first();
    await expect(item.locator('rundocs-method-badge')).toBeVisible();
    await expect(item.locator('.path')).toBeVisible();
  });

  test('clicking endpoint selects it with accent border', async ({ page }) => {
    const item = page.locator('rundocs-endpoint-item').first();
    await item.click();
    await expect(item.locator('[aria-selected="true"]')).toBeVisible();
  });

  test('clicking endpoint loads detail view', async ({ page }) => {
    const item = page.locator('rundocs-endpoint-item').first();
    await item.click();
    await expect(page.locator('rundocs-endpoint')).toBeVisible();
  });

  test('split pane divider exists', async ({ page }) => {
    await expect(page.locator('rundocs-split-pane [role="separator"]')).toBeVisible();
  });
});
