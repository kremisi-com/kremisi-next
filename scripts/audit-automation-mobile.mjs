import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.AUDIT_PLAYWRIGHT || 'playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.AUDIT_CHROMIUM ? { executablePath: process.env.AUDIT_CHROMIUM } : {}) });
const output = path.resolve('docs/landing-automation/audit-evidence/mobile-release');
await fs.mkdir(output, { recursive: true });
const results = { checks: [], observations: [] };
function check(name, pass, evidence) { results.checks.push({ name, pass, evidence }); console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`); }
try {
  for (const [width, height, locale] of [[320, 568, 'it'], [390, 844, 'it'], [320, 568, 'en']]) {
    const context = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true });
    await context.route('**/*', route => ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort('blockedbyclient'));
    const page = await context.newPage(); const requests = [];
    page.on('request', req => requests.push(req.url()));
    await page.goto(`http://127.0.0.1:3101/${locale}/automazioni-aziendali`, { waitUntil: 'load' });
    await page.waitForTimeout(2000);
    if (await page.locator('.iubenda-cs-reject-btn').isVisible()) await page.locator('.iubenda-cs-reject-btn').click();
    await page.waitForTimeout(500);
    const aboveFold = await page.evaluate(() => {
      const cta = document.querySelector('#inizio a[href="#contatto"]');
      const button = document.querySelector('#kremisi-cookie-preferences') || [...document.querySelectorAll('button')].find(e => /cookie/i.test(e.getAttribute('aria-label') || ''));
      const r = cta.getBoundingClientRect(); const b = button.getBoundingClientRect();
      return { cta: r.toJSON(), cookie: b.toJSON(), overlap: Math.max(0, Math.min(r.right, b.right) - Math.max(r.left, b.left)) * Math.max(0, Math.min(r.bottom, b.bottom) - Math.max(r.top, b.top)), footer: getComputedStyle(document.querySelector('footer.onlyMobile')).position, cookieName: button.getAttribute('aria-label') };
    });
    const name = `${width}-${locale}`;
    check(`${name}: campaign mobile footer in document flow`, aboveFold.footer === 'relative', aboveFold);
    check(`${name}: cookie control compact and named`, aboveFold.cookie.width === 44 && aboveFold.cookie.height === 44 && !!aboveFold.cookieName, aboveFold);
    check(`${name}: primary CTA fully visible`, aboveFold.cta.top >= 70 && aboveFold.cta.bottom < height, aboveFold);
    check(`${name}: cookie control does not overlap primary CTA`, aboveFold.overlap === 0, aboveFold);
    await page.locator('#inizio a[href="#contatto"]').hover();
    await page.waitForTimeout(500);
    const touchState = await page.locator('#inizio a[href="#contatto"]').evaluate(e => ({
      hoverCapable: matchMedia('(hover: hover)').matches,
      background: getComputedStyle(e.querySelector('[class*="__button"]')).backgroundColor,
      arrows: [...e.querySelectorAll('[class*="__arrow"]')].map(a => a.getBoundingClientRect().toJSON()),
    }));
    check(`${name}: touch hover cannot move arrows outside screen`, !touchState.hoverCapable && touchState.background === 'rgb(220, 20, 60)' && touchState.arrows.every(r => r.left >= 0 && r.right <= width), touchState);
    const media = requests.filter(url => /\/(allavelli\/main.webp|gamelia\/carousel-2.webp|makuda\/main.webp)|\.mp4(?:\?|$)/.test(url));
    check(`${name}: no closing poster or video fetched above fold`, media.length === 0, media);
    await page.screenshot({ path: path.join(output, `mobile-regression-${name}-hero.png`) });
    await page.locator('#videos-cta').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll('#videos-cta video')].every(e => !!e.poster));
    check(`${name}: posters appear near closing section`, await page.locator('#videos-cta video').evaluateAll(es => es.length === 3 && es.every(e => !!e.poster)), 'Poster prefetch distance: 200px; video starts at viewport intersection.');
    await page.screenshot({ path: path.join(output, `mobile-regression-${name}-closing.png`) });
    await page.goto(`http://127.0.0.1:3101/${locale}?view=overview`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);
    const home = await page.evaluate(() => ({ footer: getComputedStyle(document.querySelector('footer.onlyMobile')).position, cookie: document.querySelector('#kremisi-cookie-preferences')?.getBoundingClientRect().toJSON() }));
    check(`${name}: homepage keeps existing fixed footer and cookie caption`, home.footer === 'fixed' && (!home.cookie || home.cookie.width > 44), home);
    results.observations.push({ name, aboveFold, home });
    await context.close();
  }
  const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await desktop.route('**/*', route => ['GET', 'HEAD'].includes(route.request().method()) ? route.continue() : route.abort('blockedbyclient'));
  await desktop.addInitScript(() => {
    window._iub = [];
    window._iub.csConfiguration = { lang: 'en-GB' };
    window._iub.cs = { api: { isPreferenceExpressed: () => true, getPreferences: () => ({ purposes: {} }), openPreferences() {} } };
  });
  const page = await desktop.newPage();
  await page.goto('http://127.0.0.1:3101/it/automazioni-aziendali', { waitUntil: 'load' });
  await page.locator('#inizio a[href="#contatto"]').hover();
  await page.waitForTimeout(600);
  const hover = await page.locator('#inizio a[href="#contatto"]').evaluate(e => ({ enabled: matchMedia('(hover: hover)').matches, background: getComputedStyle(e.querySelector('[class*="__button"]')).backgroundColor }));
  check('desktop: existing CTA hover retained', hover.enabled && hover.background === 'rgb(255, 255, 255)', hover);
  await desktop.close();
} catch (e) { results.exception = String(e); console.error(e); }
finally { await fs.writeFile(path.join(output, 'mobile-regression.json'), JSON.stringify(results, null, 2)); await browser.close(); }
if (results.exception || results.checks.some(c => !c.pass)) process.exitCode = 1;
