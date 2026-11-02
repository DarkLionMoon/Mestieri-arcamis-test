// Browser measurements for comparison; not a substitute for visitor telemetry.
const { chromium } = require('@playwright/test');
(async () => {
  const browser = await chromium.launch();
  const results = [];
  const target = process.argv[2] || 'http://127.0.0.1:4176';
  const baseline = process.env.PERF_BASELINE_REF
    ? require('node:child_process').execFileSync('git', ['show', `${process.env.PERF_BASELINE_REF}:index.html`], { encoding: 'utf8' })
    : null;
  for (let run = 0; run < 3; run++) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    if (baseline) {
      await page.route(target, route => route.fulfill({ contentType: 'text/html; charset=utf-8', body: baseline }));
    }
    const session = await page.context().newCDPSession(page);
    await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
    await page.addInitScript(() => {
      window.perfVitals = { lcp: 0, cls: 0 };
      new PerformanceObserver(list => { for (const e of list.getEntries()) window.perfVitals.lcp = e.startTime; }).observe({ type: 'largest-contentful-paint', buffered: true });
      new PerformanceObserver(list => { for (const e of list.getEntries()) if (!e.hadRecentInput) window.perfVitals.cls += e.value; }).observe({ type: 'layout-shift', buffered: true });
    });
    await page.goto(target);
    await page.waitForTimeout(1200);
    const load = await page.evaluate(() => ({ ...window.perfVitals, fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime, dom: performance.getEntriesByType('navigation')[0].domContentLoadedEventEnd }));
    const search = await page.evaluate(() => {
      const measure = fn => { const start = performance.now(); fn(); return Math.round((performance.now() - start) * 10) / 10; };
      const result = {};
      for (const scope of ['global', 'alchimista']) {
        if (scope === 'global') setHome(); else vaiAlMestiere(scope);
        result[scope] = [];
        for (const query of ['p', 'po', 'pot', 'poti', 'potio', 'potion']) {
          const total = measure(() => doSearch(query));
          const suggestions = measure(() => renderSearchSuggestions(query));
          result[scope].push({ query, total, suggestions });
        }
      }
      return result;
    });
    results.push({ run, load, search });
    await page.close();
  }
  console.log(JSON.stringify(results, null, 2));
  await browser.close();
})().catch(error => { console.error(error); process.exitCode = 1; });
