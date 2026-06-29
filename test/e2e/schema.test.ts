import { test, expect } from '@playwright/test';

test.describe('Schema Viewer', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForSelector('rundocs-tag-group');

    // Select GET /api/v1/Activities/{id} — returns a single object (not array)
    const paramItem = page.locator('rundocs-endpoint-item .path', { hasText: '{id}' }).first();
    await paramItem.click();
    await page.waitForSelector('rundocs-endpoint');

    // Click Responses tab
    const responsesTab = page.locator('.docs-tab-bar .tab', { hasText: 'Responses' });
    await responsesTab.click();
  });

  test('schema view is visible in Responses tab', async ({ page }) => {
    await expect(page.locator('rundocs-schema-view').first()).toBeVisible();
  });

  test('Schema tab shows property tree', async ({ page }) => {
    const schemaView = page.locator('rundocs-schema-view').first();
    const schemaTab = schemaView.locator('.tab', { hasText: 'Schema' });
    if (await schemaTab.isVisible()) {
      await schemaTab.click();
    }
    await expect(schemaView.locator('rundocs-schema-property').first()).toBeVisible();
  });

  test('property shows name and type', async ({ page }) => {
    const schemaView = page.locator('rundocs-schema-view').first();
    const schemaTab = schemaView.locator('.tab', { hasText: 'Schema' });
    if (await schemaTab.isVisible()) {
      await schemaTab.click();
    }
    const prop = schemaView.locator('rundocs-schema-property').first();
    await expect(prop).toBeVisible();
    await expect(prop.locator('.prop-type')).toBeVisible();
  });

  test('Example tab shows generated JSON', async ({ page }) => {
    const schemaView = page.locator('rundocs-schema-view').first();
    const exampleTab = schemaView.locator('.tab', { hasText: 'Example' });
    await exampleTab.click();

    await expect(schemaView.locator('.example-code')).toBeVisible();
  });

  test('Example tab has copy button', async ({ page }) => {
    const schemaView = page.locator('rundocs-schema-view').first();
    const exampleTab = schemaView.locator('.tab', { hasText: 'Example' });
    await exampleTab.click();

    await expect(schemaView.locator('rundocs-copy-button')).toBeVisible();
  });

  test('type labels are displayed in monospace', async ({ page }) => {
    const schemaView = page.locator('rundocs-schema-view').first();
    const schemaTab = schemaView.locator('.tab', { hasText: 'Schema' });
    if (await schemaTab.isVisible()) {
      await schemaTab.click();
    }
    const prop = schemaView.locator('rundocs-schema-property').first();
    await expect(prop).toBeVisible();
    const typeLabel = prop.locator('.prop-type');
    await expect(typeLabel).toBeVisible();
    const fontFamily = await typeLabel.evaluate((el) => getComputedStyle(el).fontFamily);
    expect(fontFamily.toLowerCase()).toContain('mono');
  });
});
