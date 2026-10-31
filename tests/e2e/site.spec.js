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

test('profession overview rules are readable and broken into scannable points', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('desktop'), 'Verifica specifica desktop');
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator('#tabs .tab-btn', { hasText: 'Alchimista' }).click();

  const projectRule = page.locator('.rule-box').filter({ has: page.getByRole('heading', { name: '📚 Imparare un Progetto' }) });
  const collaborationRule = page.locator('.rule-box').filter({ has: page.getByRole('heading', { name: '🤝 Collaborazione' }) });
  const ruleText = page.locator('.rule-box li').first();

  expect(await ruleText.evaluate(element => parseFloat(getComputedStyle(element).fontSize))).toBeGreaterThanOrEqual(15.5);
  await expect(projectRule.locator('li')).toHaveCount(2);
  await expect(collaborationRule.locator('li')).toHaveCount(2);
});

test('desktop header and profession navigation stay compact and reachable', async ({ page }) => {
  await page.setViewportSize({ width: 1096, height: 900 });

  const header = page.locator('header');
  const tabs = page.locator('#tabs');
  await expect.poll(() => header.evaluate(element => element.getBoundingClientRect().height)).toBeLessThanOrEqual(150);
  await expect.poll(() => tabs.evaluate(element => element.getBoundingClientRect().height)).toBeLessThanOrEqual(72);
  await expect(tabs.locator('.tab-btn')).toHaveCount(11);
  await expect(page.locator('#mobileNavBtn')).toBeHidden();

  const overlaps = await page.evaluate(() => {
    const title = document.querySelector('header h1').getBoundingClientRect();
    const search = document.querySelector('#searchInput').getBoundingClientRect();
    return title.left < search.right && title.right > search.left && title.top < search.bottom && title.bottom > search.top;
  });
  expect(overlaps).toBe(false);

  const lastProfession = tabs.locator('.tab-btn', { hasText: 'Sarto' });
  await lastProfession.click();
  await expect(lastProfession).toHaveClass(/active/);
  await expect(page.locator('#content')).toContainText(/Sarto/i);
});

test('wide recipe tables are named and horizontally scrollable by keyboard', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('desktop'), 'Verifica specifica desktop');
  await page.setViewportSize({ width: 1096, height: 900 });
  await page.locator('#tabs .tab-btn', { hasText: 'Alchimista' }).click();
  await page.locator('#sidenav .sidenav-btn', { hasText: 'Livello 1' }).click();

  const tableRegion = page.locator('.table-wrap').first();
  await expect(tableRegion).toHaveAttribute('role', 'region');
  await expect(tableRegion).toHaveAttribute('tabindex', '0');
  await expect(tableRegion).toHaveAttribute('aria-label', /Alchimista.*Livello 1.*orizzontal/i);
  expect(await tableRegion.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true);

  await tableRegion.press('ArrowRight');
  await expect.poll(() => tableRegion.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
  const recipeName = tableRegion.locator('tbody tr.recipe-row td.recipe-name:visible').first();
  await expect(recipeName).toBeVisible();
  const leftEdge = await recipeName.evaluate(element => ({
    recipe: element.getBoundingClientRect().left,
    table: element.closest('.table-wrap').getBoundingClientRect().left,
  }));
  expect(Math.abs(leftEdge.recipe - leftEdge.table)).toBeLessThanOrEqual(3);
});

test('mobile recipe tables keep their card layout', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile'), 'Verifica specifica mobile');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('#tabs .tab-btn', { hasText: 'Alchimista' }).click();
  await page.locator('#mobileNavBtn').click();
  await page.locator('#mobileDrawerNav .sidenav-btn', { hasText: 'Livello 1' }).click();

  const table = page.locator('.table-wrap').first();
  const recipeRow = table.locator('tbody tr.recipe-row:not([hidden])').first();
  await expect(recipeRow).toBeVisible();
  await expect.poll(() => recipeRow.evaluate(element => getComputedStyle(element).display)).toBe('grid');
  await expect.poll(() => table.evaluate(element => element.scrollWidth - element.clientWidth)).toBeLessThanOrEqual(1);
});

test('homepage explore button keeps the full professions section heading visible on desktop, tablet and mobile', async ({ page }) => {
  const viewports = [
    { width: 375, height: 667, mobile: true },
    { width: 600, height: 800, mobile: true },
    { width: 768, height: 900, mobile: true },
    { width: 900, height: 700, mobile: false },
    { width: 926, height: 900, mobile: false },
    { width: 1096, height: 900, mobile: false },
    { width: 1280, height: 800, mobile: false },
  ];

  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto('/');
    const initialScrollY = await page.evaluate(() => window.scrollY);
    await page.getByRole('button', { name: /Esplora i mestieri/i }).click();

    const sectionHeading = page.locator('#homeProfessions .home-section-heading');
    await expect(sectionHeading).toBeVisible();
    await expect(page.locator('#homeProfessions .home-kicker')).toContainText('Scegli la tua via');
    await expect(page.locator('#content .home-page')).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(initialScrollY);
    await expect.poll(async () => page.evaluate((mobile) => {
      const heading = document.querySelector('#homeProfessions .home-kicker');
      const header = document.querySelector('header');
      const tabs = document.getElementById('tabs');
      if (!heading || !header || !tabs) return -Infinity;
      const headerBottom = header.getBoundingClientRect().bottom;
      const tabsStyle = window.getComputedStyle(tabs);
      const tabsBottom = tabsStyle.position === 'sticky'
        ? tabs.getBoundingClientRect().bottom
        : 0;
      // L'header ha z-index maggiore delle tabs: in caso di sovrapposizione
      // il titolo deve stare sotto il bordo inferiore di entrambi.
      const obstructionBottom = mobile ? headerBottom : Math.max(headerBottom, tabsBottom);
      return heading.getBoundingClientRect().top - obstructionBottom;
    }, viewport.mobile)).toBeGreaterThanOrEqual(6);
    await expect.poll(async () => page.evaluate((mobile) => {
      const kicker = document.querySelector('#homeProfessions .home-kicker');
      const header = document.querySelector('header');
      const tabs = document.getElementById('tabs');
      if (!kicker || !header || !tabs) return Infinity;
      const headerBottom = header.getBoundingClientRect().bottom;
      const tabsStyle = window.getComputedStyle(tabs);
      const tabsBottom = tabsStyle.position === 'sticky' ? tabs.getBoundingClientRect().bottom : 0;
      const obstructionBottom = mobile ? headerBottom : Math.max(headerBottom, tabsBottom);
      return kicker.getBoundingClientRect().top - obstructionBottom;
    }, viewport.mobile)).toBeLessThanOrEqual(40);
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
