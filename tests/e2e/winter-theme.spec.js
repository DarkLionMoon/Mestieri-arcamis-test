import { test, expect } from '@playwright/test';

test('Christmas lights stay inside the header and clear of profession names', async ({ page }) => {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/?natale=anteprima');
    const lights = page.locator('header > .arc-winter-lights');
    await expect(lights).toBeVisible();
    for (const scroll of [0, 500]) {
      await page.evaluate(y => window.scrollTo(0, y), scroll);
      const layout = await lights.evaluate(element => {
        const lights = element.getBoundingClientRect();
        const header = document.querySelector('header').getBoundingClientRect();
        const controls = [...document.querySelectorAll('#tabs .tab-btn, header input')];
        return {
          contained: lights.top >= header.top && lights.bottom <= header.bottom,
          overlaps: controls.some(control => {
            const rect = control.getBoundingClientRect();
            return lights.left < rect.right && lights.right > rect.left &&
              lights.top < rect.bottom && lights.bottom > rect.top;
          }),
        };
      });
      expect(layout.contained, `lights within header at ${width}px, scroll ${scroll}`).toBe(true);
      expect(layout.overlaps, `controls clear at ${width}px, scroll ${scroll}`).toBe(false);
    }
  }
});
