import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('homepage renders the title, search and profession tabs', async ({ page }) => {
  await expect(page).toHaveTitle(/Mestieri di Arcamis/i);
  await expect(page.locator('#searchInput')).toBeVisible();
  await expect(page.locator('#tabs .tab-btn')).toHaveCount(10);
  await expect(page.locator('#content')).not.toBeEmpty();
});

test('profession tabs switch content and keep the selected tab active', async ({ page }) => {
  const osteTab = page.locator('#tabs .tab-btn', { hasText: 'Oste' });
  await osteTab.click();
  await expect(osteTab).toHaveClass(/active/);
  await expect(page.locator('#content')).toContainText(/Oste/i);

  const alchimistaTab = page.locator('#tabs .tab-btn', { hasText: 'Alchimista' });
  await alchimistaTab.click();
  await expect(alchimistaTab).toHaveClass(/active/);
  await expect(page.locator('#content')).toContainText(/Alchimista/i);
});

test('search updates results and clearing it restores the page', async ({ page }) => {
  const search = page.locator('#searchInput');
  await search.fill('pozione');
  await expect(page.locator('#content')).toContainText(/Risultati per/i);
  await search.fill('');
  await expect(page.locator('#content')).not.toBeEmpty();
});

test('mobile navigation drawer opens and closes', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile'), 'Test specifico mobile');
  const openButton = page.locator('#mobileNavBtn');
  await expect(openButton).toBeVisible();

  await page.locator('#tabs .tab-btn', { hasText: 'Alchimista' }).click();
  await openButton.click();
  await expect(page.locator('#mobileDrawer')).toHaveClass(/open/);
  await expect(page.locator('#drawerOverlay')).toHaveClass(/open/);

  await page.locator('#mobileDrawer .mobile-drawer-close').click();
  await expect(page.locator('#mobileDrawer')).not.toHaveClass(/open/);
  await expect(page.locator('#drawerOverlay')).not.toHaveClass(/open/);
});

test('desktop navigation sidebar is visible after choosing a profession', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('desktop'), 'Test specifico desktop');
  await page.locator('#tabs .tab-btn', { hasText: 'Alchimista' }).click();
  await expect(page.locator('#sidenav')).toBeVisible();
  await expect(page.locator('#sidenav .sidenav-btn').first()).toBeVisible();
});
