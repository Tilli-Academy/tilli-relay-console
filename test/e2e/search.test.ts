import { test, expect } from '@playwright/test';

test.describe('Fuzzy Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForSelector('rundocs-tag-group');
  });

  test('search input has placeholder', async ({ page }) => {
    const input = page.locator('rundocs-search input');
    await expect(input).toHaveAttribute('placeholder', /search/i);
  });

  test('typing filters endpoints', async ({ page }) => {
    const input = page.locator('rundocs-search input');
    await input.fill('activities');

    // Only Activities tag group should remain in DOM
    const tags = page.locator('rundocs-tag-group');
    await expect(tags).toHaveCount(1);
  });

  test('clear button appears when text entered', async ({ page }) => {
    const input = page.locator('rundocs-search input');
    await input.fill('books');

    const clearBtn = page.locator('rundocs-search .clear-btn');
    await expect(clearBtn).toBeVisible();
  });

  test('clear button restores all endpoints', async ({ page }) => {
    const input = page.locator('rundocs-search input');
    await input.fill('books');

    const clearBtn = page.locator('rundocs-search .clear-btn');
    await clearBtn.click();

    await expect(input).toHaveValue('');
    const tags = page.locator('rundocs-tag-group');
    await expect(tags).toHaveCount(5);
  });

  test('no results shows empty state', async ({ page }) => {
    const input = page.locator('rundocs-search input');
    await input.fill('xyznonexistent');

    await expect(page.locator('rundocs-empty-state[title="No results"]')).toBeVisible();
  });
});
