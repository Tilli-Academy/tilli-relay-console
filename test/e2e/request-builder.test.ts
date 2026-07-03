import { test, expect } from '@playwright/test';

test.describe('Request Builder', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.waitForSelector('rundocs-tag-group');
    // Select an endpoint with path param
    const paramItem = page.locator('rundocs-endpoint-item .path', { hasText: '{id}' }).first();
    await paramItem.click();
    await page.waitForSelector('rundocs-endpoint');
  });

  test('request bar shows method dropdown, URL input, and Send button', async ({ page }) => {
    await expect(page.locator('rundocs-request-bar .method-select')).toBeVisible();
    await expect(page.locator('rundocs-request-bar .url-input')).toBeVisible();
    await expect(page.locator('rundocs-request-bar .send-btn')).toBeVisible();
  });

  test('URL input has constructed URL', async ({ page }) => {
    const url = await page.locator('rundocs-request-bar .url-input').inputValue();
    expect(url).toContain('fakerestapi.azurewebsites.net');
  });

  test('typing path param updates code samples', async ({ page }) => {
    // Fill path param input
    const paramInput = page.locator('rundocs-params-editor input').first();
    await paramInput.fill('42');

    // Verify the param value is reflected in code samples
    const codeTab = page.locator('.docs-tab-bar .tab', { hasText: 'Code' });
    await codeTab.click();

    await expect(page.locator('rundocs-code-block')).toContainText('/42');
  });

  test('Headers tab shows key-value editor', async ({ page }) => {
    const headersTab = page.locator('rundocs-request-tabs button', { hasText: 'Headers' });
    await headersTab.click();

    await expect(page.locator('rundocs-headers-editor')).toBeVisible();
  });

  test('Body tab appears for POST endpoint', async ({ page }) => {
    const postItem = page.locator('rundocs-endpoint-item[method="post"]').first();
    await postItem.click();

    const bodyTab = page.locator('rundocs-request-tabs button', { hasText: 'Body' });
    await expect(bodyTab).toBeVisible();
  });

  test('Body tab has editor with line numbers', async ({ page }) => {
    const postItem = page.locator('rundocs-endpoint-item[method="post"]').first();
    await postItem.click();

    const bodyTab = page.locator('rundocs-request-tabs button', { hasText: 'Body' });
    await bodyTab.click();

    await expect(page.locator('rundocs-body-editor')).toBeVisible();
  });

  test('switching from POST to GET hides Body tab', async ({ page }) => {
    // Select POST first
    const postItem = page.locator('rundocs-endpoint-item[method="post"]').first();
    await postItem.click();
    await expect(page.locator('rundocs-request-tabs button', { hasText: 'Body' })).toBeVisible();

    // Select GET
    const getItem = page.locator('rundocs-endpoint-item[method="get"]').first();
    await getItem.click();
    await expect(page.locator('rundocs-request-tabs button', { hasText: 'Body' })).toBeHidden();
  });
});
