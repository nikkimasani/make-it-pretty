import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('loads and shows all 5 workspace links', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Make It Pretty')).toBeVisible();
    await expect(page.getByText('Beautify')).toBeVisible();
    await expect(page.getByText('Format')).toBeVisible();
    await expect(page.getByText('Tabulate')).toBeVisible();
    await expect(page.getByText('Reader')).toBeVisible();
    await expect(page.getByText('Code Beautifier')).toBeVisible();
  });

  test('navigates to Format workspace', async ({ page }) => {
    await page.goto('/');
    await page.getByText('Format').first().click();
    await expect(page).toHaveURL('/format');
    await expect(page.getByText('Format Data')).toBeVisible();
  });
});

test.describe('Format workspace', () => {
  test('formats JSON content', async ({ page }) => {
    await page.goto('/format');
    await page.getByPlaceholder(/Paste.*JSON/).fill('{"name":"Alice","age":30}');
    await page.getByRole('button', { name: /Format/ }).click();
    await expect(page.getByText(/Alice/)).toBeVisible();
  });

  test('uploads a JSON file', async ({ page }) => {
    await page.goto('/format');
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.getByLabel('Upload file').click();
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: 'test.json',
      mimeType: 'application/json',
      buffer: Buffer.from('{"hello":"world"}'),
    });
    await page.getByRole('button', { name: /Format/ }).click();
    await expect(page.getByText(/world/)).toBeVisible();
  });
});

test.describe('Home page keyboard nav', () => {
  test('renders hero section badges', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('100% Local')).toBeVisible();
    await expect(page.getByText('No AI')).toBeVisible();
    await expect(page.getByText('Privacy First')).toBeVisible();
    await expect(page.getByText('Dark Mode')).toBeVisible();
  });
});
