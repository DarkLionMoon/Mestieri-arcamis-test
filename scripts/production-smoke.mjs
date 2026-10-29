import { performance } from 'node:perf_hooks';

const url = process.env.SMOKE_URL || 'https://mestieri-arcamis-test.pages.dev/';
const timeoutMs = 120_000;
const deadline = Date.now() + timeoutMs;
const requiredHeaders = [
  'x-content-type-options',
  'referrer-policy',
  'permissions-policy',
  'x-frame-options',
  'cross-origin-opener-policy',
];
let firstResponse;

while (Date.now() < deadline) {
  try {
    const response = await fetch(url, { headers: { 'cache-control': 'no-cache' } });
    const html = await response.text();
    const missing = requiredHeaders.filter((name) => !response.headers.get(name));
    const faviconProbe = await fetch(new URL('/favicon.svg', url), { headers: { 'cache-control': 'no-cache' } });
    const faviconPolicy = faviconProbe.headers.get('cache-control') || '';
    const faviconPolicyReady = /max-age=86400/i.test(faviconPolicy) && !/no-cache|no-store/i.test(faviconPolicy);
    if (response.ok && html.includes('Mestieri di Arcamis') && missing.length === 0 && faviconProbe.ok && faviconPolicyReady) {
      firstResponse = { response, html, missing };
      break;
    }
    console.log(`Waiting for the new deployment: status=${response.status}, missing headers=${missing.join(',') || 'none'}, favicon policy=${faviconPolicy || 'missing'}`);
  } catch (error) {
    console.log(`Waiting for the site: ${error.message}`);
  }
  await new Promise((resolve) => setTimeout(resolve, 5_000));
}

if (!firstResponse) {
  throw new Error('Production did not return the expected site and security headers within 120 seconds.');
}

const { response, html } = firstResponse;
const cacheControl = response.headers.get('cache-control') || '';
if (!/no-cache|no-store|max-age=0/i.test(cacheControl)) {
  throw new Error(`Unexpected HTML Cache-Control: ${cacheControl || '(missing)'}`);
}
if (!response.headers.get('content-type')?.includes('text/html')) {
  throw new Error(`Unexpected content type: ${response.headers.get('content-type')}`);
}

const faviconUrl = new URL('/favicon.svg', url).toString();
const faviconResponse = await fetch(faviconUrl);
const faviconBytes = await faviconResponse.arrayBuffer();
const faviconCacheControl = faviconResponse.headers.get('cache-control') || '';
if (!faviconResponse.ok || faviconBytes.byteLength === 0) {
  throw new Error(`Favicon check failed: status=${faviconResponse.status}, bytes=${faviconBytes.byteLength}`);
}
if (!/max-age=86400/i.test(faviconCacheControl) || /no-cache|no-store/i.test(faviconCacheControl)) {
  throw new Error(`Unexpected favicon Cache-Control: ${faviconCacheControl || '(missing)'}`);
}
if (!faviconResponse.headers.get('content-type')?.includes('image/svg+xml')) {
  throw new Error(`Unexpected favicon content type: ${faviconResponse.headers.get('content-type')}`);
}

console.log('Production smoke test passed.');
console.log(JSON.stringify({
  url,
  status: response.status,
  htmlBytes: Buffer.byteLength(html),
  securityHeaders: Object.fromEntries(requiredHeaders.map((name) => [name, response.headers.get(name)])),
  cacheControl,
  favicon: { status: faviconResponse.status, bytes: faviconBytes.byteLength, cacheControl: faviconCacheControl },
  contentEncoding: response.headers.get('content-encoding'),
  cfCacheStatus: response.headers.get('cf-cache-status'),
  cfRay: response.headers.get('cf-ray'),
}, null, 2));

const concurrency = 10;
const requestCount = 30;
const timings = [];
const failures = [];
let next = 0;

async function worker() {
  while (next < requestCount) {
    const index = next++;
    const started = performance.now();
    try {
      const res = await fetch(url);
      const headerMs = performance.now() - started;
      const body = await res.arrayBuffer();
      const totalMs = performance.now() - started;
      if (!res.ok || body.byteLength === 0) {
        failures.push({ index, status: res.status, bytes: body.byteLength });
      } else {
        timings.push({ headerMs, totalMs, bytes: body.byteLength, cache: res.headers.get('cf-cache-status') });
      }
    } catch (error) {
      failures.push({ index, error: error.message });
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));
if (failures.length) {
  throw new Error(`Load smoke test had ${failures.length}/${requestCount} failed requests: ${JSON.stringify(failures.slice(0, 5))}`);
}
const sorted = (key) => timings.map((x) => x[key]).sort((a, b) => a - b);
const percentile = (values, p) => values[Math.min(values.length - 1, Math.ceil(values.length * p) - 1)];
const headerTimes = sorted('headerMs');
const totalTimes = sorted('totalMs');
const summary = {
  requests: requestCount,
  concurrency,
  failures: failures.length,
  headerMs: {
    min: Number(headerTimes[0].toFixed(1)),
    median: Number(percentile(headerTimes, 0.5).toFixed(1)),
    p95: Number(percentile(headerTimes, 0.95).toFixed(1)),
    max: Number(headerTimes.at(-1).toFixed(1)),
  },
  totalMs: {
    median: Number(percentile(totalTimes, 0.5).toFixed(1)),
    p95: Number(percentile(totalTimes, 0.95).toFixed(1)),
    max: Number(totalTimes.at(-1).toFixed(1)),
  },
  cacheStatuses: [...new Set(timings.map((x) => x.cache || 'missing'))],
};
console.log('Concurrent load smoke test passed.');
console.log(JSON.stringify(summary, null, 2));
if (percentile(totalTimes, 0.95) > 5_000) {
  throw new Error(`Production p95 response time exceeded 5000 ms: ${percentile(totalTimes, 0.95).toFixed(1)} ms`);
}
