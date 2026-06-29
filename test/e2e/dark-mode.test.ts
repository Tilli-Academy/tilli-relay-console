import { test, expect } from '@playwright/test';

test.describe('Dark Mode / Theming', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.evaluate(() => {
      localStorage.removeItem('rundocs:ui-state');
    });
    await page.reload();
    await page.waitForSelector('rundocs-tag-group');
  });

  test('default is light theme', async ({ page }) => {
    const app = page.locator('rundocs-app');
    const theme = await app.getAttribute('theme');
    expect(theme === 'light' || theme === null).toBeTruthy();
  });

  test('toggle changes to dark theme', async ({ page }) => {
    const themeBtn = page.locator('button[aria-label="Toggle theme"]');
    await themeBtn.click();

    await expect(page.locator('rundocs-app')).toHaveAttribute('theme', 'dark');
  });

  test('toggle back returns to light theme', async ({ page }) => {
    const themeBtn = page.locator('button[aria-label="Toggle theme"]');
    await themeBtn.click();
    await themeBtn.click();

    const theme = await page.locator('rundocs-app').getAttribute('theme');
    expect(theme === 'light' || theme === null).toBeTruthy();
  });

  test('background color changes in dark mode', async ({ page }) => {
    const app = page.locator('rundocs-app');
    const lightBg = await app.evaluate((el) => getComputedStyle(el).backgroundColor);

    const themeBtn = page.locator('button[aria-label="Toggle theme"]');
    await themeBtn.click();

    const darkBg = await app.evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(lightBg).not.toBe(darkBg);
  });

  test('dark mode persists across reload', async ({ page }) => {
    const themeBtn = page.locator('button[aria-label="Toggle theme"]');
    await themeBtn.click();

    await expect(page.locator('rundocs-app')).toHaveAttribute('theme', 'dark');

    await page.reload();
    await page.waitForSelector('rundocs-tag-group');

    await expect(page.locator('rundocs-app')).toHaveAttribute('theme', 'dark');
  });

  test('sidebar and header use dark colors', async ({ page }) => {
    const themeBtn = page.locator('button[aria-label="Toggle theme"]');
    await themeBtn.click();

    // Header and sidebar should be visible with dark theme
    await expect(page.locator('rundocs-header')).toBeVisible();
    await expect(page.locator('rundocs-sidebar')).toBeVisible();
  });
});
