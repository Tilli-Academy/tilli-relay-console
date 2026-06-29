import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForSelector('rundocs-tag-group');
    // Select any endpoint
    const item = page.locator('rundocs-endpoint-item').first();
    await item.click();
    await page.waitForSelector('rundocs-endpoint');

    // Click Auth tab
    const authTab = page.locator('rundocs-request-tabs button', { hasText: 'Auth' });
    await authTab.click();
  });

  test('default is No Auth with message', async ({ page }) => {
    await expect(page.locator('rundocs-auth-editor')).toContainText(/does not use any authorization/i);
  });

  test('Bearer Token shows token input', async ({ page }) => {
    const select = page.locator('rundocs-auth-editor select');
    await select.selectOption('bearer');

    await expect(page.locator('rundocs-auth-editor input[type="text"]')).toBeVisible();
  });

  test('Basic Auth shows username and password inputs', async ({ page }) => {
    const select = page.locator('rundocs-auth-editor select');
    await select.selectOption('basic');

    await expect(page.locator('rundocs-auth-editor input').first()).toBeVisible();
    const passwordInput = page.locator('rundocs-auth-editor input[type="password"]');
    await expect(passwordInput).toBeVisible();
  });

  test('API Key shows name, value inputs and Header radio', async ({ page }) => {
    const select = page.locator('rundocs-auth-editor select');
    await select.selectOption('apiKey');

    const inputs = page.locator('rundocs-auth-editor input[type="text"]');
    await expect(inputs).toHaveCount(2);

    // Header radio should be checked by default
    const headerRadio = page.locator('rundocs-auth-editor input[type="radio"][value="header"]');
    await expect(headerRadio).toBeChecked();
  });

  test('API Key Query radio switches', async ({ page }) => {
    const select = page.locator('rundocs-auth-editor select');
    await select.selectOption('apiKey');

    const queryRadio = page.locator('rundocs-auth-editor input[type="radio"][value="query"]');
    await queryRadio.click();
    await expect(queryRadio).toBeChecked();
  });

  test('Bearer token reflects in code samples', async ({ page }) => {
    const select = page.locator('rundocs-auth-editor select');
    await select.selectOption('bearer');

    const tokenInput = page.locator('rundocs-auth-editor input[type="text"]');
    await tokenInput.fill('mytoken123');

    // Check code samples for Authorization header
    const codeTab = page.locator('.docs-tab-bar').getByRole('tab', { name: 'Code' });
    await codeTab.click();

    await expect(page.locator('rundocs-code-samples')).toContainText('mytoken123');
  });

  test('auth inputs have labels', async ({ page }) => {
    const select = page.locator('rundocs-auth-editor select');
    await select.selectOption('bearer');

    const label = page.locator('rundocs-auth-editor label');
    await expect(label.first()).toBeVisible();
  });
});
