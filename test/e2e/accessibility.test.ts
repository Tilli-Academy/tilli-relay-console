import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForSelector('rundocs-tag-group');
  });

  test('sidebar tabs have aria-selected', async ({ page }) => {
    const activeTab = page.locator('rundocs-sidebar button[role="tab"][aria-selected="true"]');
    await expect(activeTab).toBeVisible();
    await expect(activeTab).toContainText('Endpoints');
  });

  test('tag groups have aria-expanded', async ({ page }) => {
    const tagHeader = page.locator('rundocs-tag-group .group-header').first();
    await expect(tagHeader).toHaveAttribute('aria-expanded', 'true');

    await tagHeader.click();
    await expect(tagHeader).toHaveAttribute('aria-expanded', 'false');
  });

  test('auth editor inputs have labels', async ({ page }) => {
    const item = page.locator('rundocs-endpoint-item').first();
    await item.click();
    await page.waitForSelector('rundocs-endpoint');

    const authTab = page.locator('rundocs-request-tabs button', { hasText: 'Auth' });
    await authTab.click();

    const select = page.locator('rundocs-auth-editor select');
    await select.selectOption('bearer');

    const label = page.locator('rundocs-auth-editor label');
    await expect(label.first()).toBeVisible();

    // Check that label has a 'for' attribute
    const forAttr = await label.first().getAttribute('for');
    expect(forAttr).toBeTruthy();
  });

  test('keyboard Enter sends request', async ({ page }) => {
    const item = page.locator('rundocs-endpoint-item').first();
    await item.click();

    const urlInput = page.locator('rundocs-request-bar .url-input');
    await urlInput.press('Enter');

    await expect(page.locator('rundocs-response-meta')).toBeVisible({ timeout: 15000 });
  });

  test('keyboard Escape closes modal', async ({ page }) => {
    const manageBtn = page.locator('rundocs-env-selector .manage-btn');
    await manageBtn.click();

    await expect(page.locator('rundocs-modal')).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('rundocs-modal')).toBeHidden();
  });

  test('modal has dialog role', async ({ page }) => {
    const manageBtn = page.locator('rundocs-env-selector .manage-btn');
    await manageBtn.click();

    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');

    await page.keyboard.press('Escape');
  });

  test('tooltips appear on hover', async ({ page }) => {
    const themeTooltip = page.locator('rundocs-header rundocs-tooltip').first();
    const button = themeTooltip.locator('button');

    await button.hover();

    // Tooltip should have role="tooltip"
    const tooltipEl = page.locator('[role="tooltip"]');
    await expect(tooltipEl.first()).toBeVisible();
  });

  test('tabs have proper ARIA roles', async ({ page }) => {
    const tablist = page.locator('[role="tablist"]');
    await expect(tablist.first()).toBeVisible();

    const tab = page.locator('[role="tab"]');
    await expect(tab.first()).toBeVisible();
  });
});
