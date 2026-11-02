import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => { await page.goto('/'); });

test('navigation reserves its layout while the catalog is still downloading', async ({ page }) => {
  let release;
  const gate = new Promise(resolve => { release = resolve; });
  await page.route('**/data/mestieri.js', async route => { await gate; await route.continue(); });
  try {
    await page.goto('/', { waitUntil: 'commit' });
    await expect(page.locator('#tabs').getByRole('button', { name: 'Home', exact: true })).toBeVisible();
    await expect(page.locator('#tabs').getByRole('button', { name: 'Guida ai Mestieri', exact: true })).toBeVisible();
    await expect(page.locator('.main')).toHaveClass(/home-mode/);
  } finally { release(); }
  await expect(page.locator('.home-page')).toBeVisible();
});

test('repeated suggestion updates reuse the profession search index', async ({ page }) => {
  const result = await page.evaluate(() => {
    vaiAlMestiere('alchimista');
    doSearch('Potion');
    const original = normalizeSearch;
    let calls = 0;
    normalizeSearch = value => { calls++; return original(value); };
    try {
      renderSearchSuggestions('zzzxxyy');
      return { calls, options: document.querySelectorAll('#searchSuggestions [role="option"]').length };
    } finally { normalizeSearch = original; }
  });
  expect(result.options).toBe(0);
  expect(result.calls).toBe(1);
});

test('filters stay independent across search result levels and counts match visible recipes', async ({ page }) => {
  await page.locator('#searchInput').fill('Potion');
  await page.locator('#searchInput').press('Escape');
  const panels = page.locator('.recipe-filter-panel');
  const secondId = await panels.nth(1).getAttribute('id');
  const second = page.locator(`#${secondId}`);
  await page.locator(`[aria-controls="${secondId}"]`).click();
  await second.getByLabel('DT max al livello corrente').fill('0');
  await second.getByRole('button', { name: 'Filtra', exact: true }).click();
  await expect(second.getByLabel('DT max al livello corrente')).toHaveValue('0');
  await expect(second.locator('[role="status"]')).toContainText('Mostrate 0');
  await expect(panels.first().getByLabel('DT max al livello corrente')).toHaveValue('');
  await expect(page.locator('#catalogSearchStatus')).toContainText(`${await page.locator('.recipe-row').count()} ricett`);
  await second.getByRole('button', { name: 'Azzera', exact: true }).click();
  await expect(second.getByLabel('DT max al livello corrente')).toHaveValue('');
  await expect(page.locator('#catalogSearchStatus')).toContainText(`${await page.locator('.recipe-row').count()} ricett`);
  const duplicateIds = await page.locator('[id]').evaluateAll(nodes => {
    const ids = nodes.map(n => n.id);
    return ids.filter((id, i) => ids.indexOf(id) !== i);
  });
  expect(duplicateIds).toEqual([]);
});

test('search summary includes existing filters and accents are optional in results and suggestions', async ({ page }) => {
  await page.evaluate(() => { vaiAlMestiere('alchimista'); setSection('lv1'); });
  await page.getByRole('button', { name: 'Filtri', exact: true }).click();
  await page.getByLabel('DT max al livello corrente').fill('0');
  await page.getByRole('button', { name: 'Filtra', exact: true }).click();
  await page.locator('#searchInput').fill('Potion of Healing');
  await expect(page.locator('#catalogSearchStatus')).toContainText('0 ricette');
  await page.getByRole('button', { name: 'Azzera', exact: true }).click();
  await expect(page.locator('#catalogSearchStatus')).toContainText('1 ricetta');
  await page.locator('#searchInput').fill('caffe');
  await expect(page.getByRole('option', { name: 'Caffè', exact: true })).toBeVisible();
  await expect(page.locator('.recipe-row')).not.toHaveCount(0);
  await expect(page.getByRole('option', { name: 'Caffè', exact: true }).locator('mark')).toHaveText('Caffè');
});

test('search can expand from one profession to the whole catalog without losing the section', async ({ page }, testInfo) => {
  await page.getByRole('button', { name: 'Alchimista', exact: true }).first().click();
  if (testInfo.project.name.startsWith('mobile')) {
    await page.locator('#mobileNavBtn').click();
    await page.locator('#mobileDrawerNav').getByRole('button', { name: 'Livello 1' }).click();
  } else {
    await page.locator('#sidenav').getByRole('button', { name: 'Livello 1' }).click();
  }
  await page.locator('#searchInput').fill('Potion');
  await expect(page.locator('#catalogSearchStatus')).toContainText(/\d+ ricett/);
  await page.getByRole('button', { name: 'Tutti i mestieri', exact: true }).click();
  await expect(page.locator('#catalogSearchStatus')).toContainText('tutti i mestieri');
  await expect(page.locator('#searchInput')).toHaveValue('Potion');
  await page.getByRole('button', { name: 'Cancella ricerca', exact: true }).click();
  await expect(page.locator('#sidenav .sidenav-btn.active')).toContainText('Livello 1');
  await expect(page.locator('.recipe-filter-form')).toHaveCount(1);
});

test('empty search offers recovery and suggestions stay inside the selected scope', async ({ page }) => {
  await page.getByRole('button', { name: 'Alchimista', exact: true }).first().click();
  await page.locator('#searchInput').fill('zzzxxyy');
  await expect(page.locator('#catalogSearchStatus')).toContainText('0 ricette');
  await expect(page.getByRole('button', { name: 'Tutti i mestieri', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Azzera ricerca', exact: true }).click();
  await expect(page.locator('.profession-intro')).toBeVisible();
  const otherRecipe = await page.evaluate(() => {
    const alchemist = MESTIERI.find(m => m.id === 'alchimista');
    const fields = alchemist.livelli.flatMap(l => l.items.flatMap(i => [i.n, i.tip, i.mp, i.ms])).filter(Boolean).join(' ').toLowerCase();
    return MESTIERI.filter(m => m.id !== 'alchimista').flatMap(m => m.livelli.flatMap(l => l.items)).find(i => i.n.length > 4 && !fields.includes(i.n.toLowerCase())).n;
  });
  await page.locator('#searchInput').fill(otherRecipe);
  await expect(page.getByRole('option', { name: otherRecipe, exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Tutti i mestieri', exact: true }).click();
  await expect(page.locator('.recipe-row')).not.toHaveCount(0);
});
