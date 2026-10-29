import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test('homepage renders its title, search and profession cards', async ({ page }) => {
  await expect(page).toHaveTitle(/Mestieri di Arcamis/i);
  await expect(page.locator('#searchInput')).toBeVisible();
  await expect(page.locator('.home-profession')).not.toHaveCount(0);
  await expect(page.locator('#content .home-page')).toBeVisible();
  // Top navigation is available on the homepage as well as inside profession sheets.
  await expect(page.locator('#tabs')).toBeVisible();
  await expect(page.locator('#tabs .tab-btn', { hasText: 'Home' })).toHaveClass(/active/);
  await expect(page.locator('#tabs .tab-btn', { hasText: 'Guida ai Mestieri' })).toBeVisible();
  await expect(page.locator('#tabs .tab-btn', { hasText: 'Alchimista' })).toBeVisible();
});

test('homepage explore button scrolls below the navigation at desktop, tablet and mobile widths', async ({ page }) => {
  const viewports = [
    { width: 375, height: 667, mobile: true },
    { width: 600, height: 800, mobile: true },
    { width: 768, height: 900, mobile: true },
    { width: 900, height: 700, mobile: false },
    { width: 1280, height: 800, mobile: false },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    const initialScrollY = await page.evaluate(() => window.scrollY);
    await page.getByRole('button', { name: /Esplora i mestieri/i }).click();

    const heading = page.locator('#homeProfessionsTitle');
    await expect(heading).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(initialScrollY);
    await expect.poll(async () => page.evaluate((mobile) => {
      const title = document.getElementById('homeProfessionsTitle');
      const header = document.querySelector('header');
      const tabs = document.getElementById('tabs');
      if (!title || !header || !tabs) return -Infinity;
      const obstructionBottom = mobile
        ? header.getBoundingClientRect().bottom
        : tabs.getBoundingClientRect().bottom;
      return title.getBoundingClientRect().top - obstructionBottom;
    }, viewport.mobile)).toBeGreaterThanOrEqual(8);
  }
});

test('profession navigation switches content and keeps the selected tab active', async ({ page }) => {
  await page.locator('.home-profession', { hasText: 'Alchimista' }).click();

  const osteTab = page.locator('#tabs .tab-btn', { hasText: 'Oste' });
  await expect(osteTab).toBeVisible();
  await osteTab.click();
  await expect(osteTab).toHaveClass(/active/);
  await expect(page.locator('#content')).toContainText(/Oste/i);

  const alchimistaTab = page.locator('#tabs .tab-btn', { hasText: 'Alchimista' });
  await alchimistaTab.click();
  await expect(alchimistaTab).toHaveClass(/active/);
  await expect(page.locator('#content')).toContainText(/Alchimista/i);
});

test('search updates results and clearing it restores the current view', async ({ page }) => {
  const search = page.locator('#searchInput');
  await search.fill('pozione');
  await expect(page.locator('#content')).toContainText(/Risultati per/i);
  await search.fill('');
  await expect(page.locator('#content .home-page')).toBeVisible();
});

test('mobile navigation drawer opens and closes', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile'), 'Test specifico mobile');

  await page.locator('.home-profession', { hasText: 'Alchimista' }).click();
  const openButton = page.locator('#mobileNavBtn');
  await expect(openButton).toBeVisible();
  await openButton.click();
  await expect(page.locator('#mobileDrawer')).toHaveClass(/open/);
  await expect(page.locator('#drawerOverlay')).toHaveClass(/open/);

  await page.locator('#mobileDrawer .mobile-drawer-close').click();
  await expect(page.locator('#mobileDrawer')).not.toHaveClass(/open/);
  await expect(page.locator('#drawerOverlay')).not.toHaveClass(/open/);
});

test('desktop navigation sidebar is visible after choosing a profession', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('desktop'), 'Test specifico desktop');

  await page.locator('.home-profession', { hasText: 'Alchimista' }).click();
  await expect(page.locator('#sidenav')).toBeVisible();
  await expect(page.locator('#sidenav .sidenav-btn').first()).toBeVisible();
});
