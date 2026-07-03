import { test, expect } from '@playwright/test';

test.describe('Spec Loading & Initial Render', () => {
  test('page loads without errors', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('rundocs-app')).toBeVisible();
  });

  test('API title is visible in header', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('.api-title')).toHaveText('FakeRESTApi.Web V1');
  });

  test('API version is displayed', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('.api-version')).toContainText('v1');
  });

  test('all 5 tag groups render', async ({ page }) => {
    await page.goto('./');
    const tags = page.locator('rundocs-tag-group');
    await expect(tags).toHaveCount(5);
  });

  test('tag names match spec', async ({ page }) => {
    await page.goto('./');
    const tagNames = ['Activities', 'Authors', 'Books', 'CoverPhotos', 'Users'];
    for (const name of tagNames) {
      await expect(page.locator('rundocs-tag-group .group-name', { hasText: name })).toBeVisible();
    }
  });

  test('Endpoints sidebar tab is active by default', async ({ page }) => {
    await page.goto('./');
    const endpointsTab = page.locator('rundocs-sidebar button[role="tab"]', { hasText: 'Endpoints' });
    await expect(endpointsTab).toHaveAttribute('aria-selected', 'true');
  });

  test('no endpoint selected — shows empty state', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('rundocs-main rundocs-empty-state')).toBeVisible();
  });

  test('sidebar is expanded by default', async ({ page }) => {
    await page.goto('./');
    await expect(page.locator('rundocs-sidebar')).toBeVisible();
  });

  test('light theme is default', async ({ page }) => {
    await page.goto('./');
    const app = page.locator('rundocs-app');
    const theme = await app.getAttribute('theme');
    expect(theme === 'light' || theme === null).toBeTruthy();
  });
});
