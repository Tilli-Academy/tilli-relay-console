import { test, expect } from '@playwright/test';

test.describe('Environment Variables', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
    await page.evaluate(() => {
      localStorage.removeItem('rundocs:environments');
      localStorage.removeItem('rundocs:active-env');
    });
    await page.reload();
    await page.waitForSelector('rundocs-tag-group');
  });

  test('env selector shows "No Environment"', async ({ page }) => {
    const select = page.locator('rundocs-env-selector .env-select');
    await expect(select).toBeVisible();
    // The first option should be "No Environment"
    const value = await select.inputValue();
    expect(value).toBe('');
  });

  test('Manage Environments opens modal', async ({ page }) => {
    const manageBtn = page.locator('rundocs-env-selector .manage-btn');
    await manageBtn.click();

    await expect(page.locator('rundocs-modal')).toBeVisible();
    await expect(page.locator('rundocs-modal .modal-title')).toHaveText('Manage Environments');
  });

  test('create environment', async ({ page }) => {
    const manageBtn = page.locator('rundocs-env-selector .manage-btn');
    await manageBtn.click();

    const nameInput = page.locator('rundocs-env-manager .add-input');
    await nameInput.fill('Dev');

    const addBtn = page.locator('rundocs-env-manager .add-btn');
    await addBtn.click();

    await expect(page.locator('rundocs-env-manager .env-name')).toContainText('Dev');
  });

  test('select environment shows variable editor', async ({ page }) => {
    const manageBtn = page.locator('rundocs-env-selector .manage-btn');
    await manageBtn.click();

    // Create environment
    const nameInput = page.locator('rundocs-env-manager .add-input');
    await nameInput.fill('Dev');
    await page.locator('rundocs-env-manager .add-btn').click();

    // Select it
    const envItem = page.locator('rundocs-env-manager .env-item').first();
    await envItem.click();

    // Variable editor should appear
    await expect(page.locator('rundocs-env-manager .vars-section')).toBeVisible();
  });

  test('close modal with X button', async ({ page }) => {
    const manageBtn = page.locator('rundocs-env-selector .manage-btn');
    await manageBtn.click();

    const closeBtn = page.locator('rundocs-modal .close-btn');
    await closeBtn.click();

    await expect(page.locator('rundocs-modal')).toBeHidden();
  });

  test('close modal with Escape key', async ({ page }) => {
    const manageBtn = page.locator('rundocs-env-selector .manage-btn');
    await manageBtn.click();

    await page.keyboard.press('Escape');

    await expect(page.locator('rundocs-modal')).toBeHidden();
  });

  test('backdrop click does NOT close modal', async ({ page }) => {
    const manageBtn = page.locator('rundocs-env-selector .manage-btn');
    await manageBtn.click();

    // Click the backdrop area
    const backdrop = page.locator('rundocs-modal .backdrop');
    await backdrop.click({ force: true, position: { x: 5, y: 5 } });

    // Modal should still be visible
    await expect(page.locator('rundocs-modal')).toBeVisible();
  });

  test('activate environment from dropdown', async ({ page }) => {
    // Create environment via modal
    const manageBtn = page.locator('rundocs-env-selector .manage-btn');
    await manageBtn.click();

    const nameInput = page.locator('rundocs-env-manager .add-input');
    await nameInput.fill('Staging');
    await page.locator('rundocs-env-manager .add-btn').click();

    // Close modal
    await page.keyboard.press('Escape');

    // Select environment from dropdown
    const envSelect = page.locator('rundocs-env-selector .env-select');
    // Get the option value for "Staging"
    const optionValue = await envSelect.locator('option', { hasText: 'Staging' }).getAttribute('value');
    await envSelect.selectOption(optionValue!);

    // Verify the select shows Staging
    const selectedText = await envSelect.locator('option:checked').textContent();
    expect(selectedText).toContain('Staging');
  });
});
