import { test, expect } from '@playwright/test';

test.describe('Code Samples', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForSelector('rundocs-tag-group');

    // Select first endpoint
    const item = page.locator('rundocs-endpoint-item').first();
    await item.click();
    await page.waitForSelector('rundocs-endpoint');

    // Click Code tab in documentation section
    const codeTab = page.locator('.docs-tab-bar').getByRole('tab', { name: 'Code' });
    await codeTab.click();
  });

  test('language tabs are visible', async ({ page }) => {
    const codeSamples = page.locator('rundocs-code-samples');
    await expect(codeSamples).toBeVisible();

    await expect(codeSamples.locator('rundocs-tabs')).toBeVisible();
  });

  test('cURL tab shows curl command', async ({ page }) => {
    const curlTab = page.locator('rundocs-code-samples').getByRole('tab', { name: /curl/i });
    await curlTab.click();

    await expect(page.locator('rundocs-code-block')).toContainText('curl');
  });

  test('JavaScript tab shows fetch call', async ({ page }) => {
    const jsTab = page.locator('rundocs-code-samples').getByRole('tab', { name: /javascript/i });
    await jsTab.click();

    await expect(page.locator('rundocs-code-block')).toContainText('fetch');
  });

  test('Python tab shows requests call', async ({ page }) => {
    const pyTab = page.locator('rundocs-code-samples').getByRole('tab', { name: /python/i });
    await pyTab.click();

    await expect(page.locator('rundocs-code-block')).toContainText('requests');
  });

  test('Node.js tab shows axios call', async ({ page }) => {
    const nodeTab = page.locator('rundocs-code-samples').getByRole('tab', { name: /node/i });
    await nodeTab.click();

    await expect(page.locator('rundocs-code-block')).toContainText('axios');
  });

  test('code block has copy button', async ({ page }) => {
    await expect(page.locator('rundocs-code-block rundocs-copy-button')).toBeVisible();
  });

  test('path param reflected in code samples', async ({ page }) => {
    // Go to endpoint with {id}
    const paramItem = page.locator('rundocs-endpoint-item .path', { hasText: '{id}' }).first();
    await paramItem.click();

    // Fill path param
    const paramInput = page.locator('rundocs-params-editor input').first();
    await paramInput.fill('42');

    // Check code sample
    const codeTab = page.locator('.docs-tab-bar').getByRole('tab', { name: 'Code' });
    await codeTab.click();

    await expect(page.locator('rundocs-code-block')).toContainText('/42');
  });

  test('auth token reflected in code samples', async ({ page }) => {
    // Set bearer token
    const authTab = page.locator('rundocs-request-tabs button', { hasText: 'Auth' });
    await authTab.click();

    const select = page.locator('rundocs-auth-editor select');
    await select.selectOption('bearer');

    const tokenInput = page.locator('rundocs-auth-editor input[type="text"]');
    await tokenInput.fill('test-token');

    // Check code sample
    const codeTab = page.locator('.docs-tab-bar').getByRole('tab', { name: 'Code' });
    await codeTab.click();

    await expect(page.locator('rundocs-code-block')).toContainText('test-token');
  });

  test('code blocks have syntax highlighting', async ({ page }) => {
    const tokens = page.locator('rundocs-code-block .token');
    await expect(tokens.first()).toBeVisible();
  });
});
