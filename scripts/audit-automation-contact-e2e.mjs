// Real local browser -> Next Server Action -> application helpers -> fixture transport.
// Unlike audit-automation-form.mjs, no browser action response is mocked.
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.AUDIT_PLAYWRIGHT || 'playwright');
const base = 'http://127.0.0.1:3102';
const output = path.resolve('docs/landing-automation/audit-evidence/mobile-release');
const logPath = path.join(output, 'contact-provider.jsonl');
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.AUDIT_CHROMIUM ? { executablePath: process.env.AUDIT_CHROMIUM } : {}) });
const results = { base, safety: 'Explicitly authorized isolated localhost. Real server actions; Node provider transport intercepted with dummy credentials. No external mail or conversions.', checks: [], scenarios: [] };
function check(name, pass, evidence) { results.checks.push({ name, pass, evidence }); console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`); }
async function traces() { try { return (await fs.readFile(logPath, 'utf8')).trim().split('\n').filter(Boolean).map(line => JSON.parse(line)); } catch (e) { if (e.code === 'ENOENT') return []; throw e; } }
try {
  for (const scenario of ['success', 'email-error', 'security-error', 'invalid-email', 'consent-denied']) {
    const start = (await traces()).length;
    const granted = scenario !== 'consent-denied';
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await context.addCookies([{ name: '_iub_cs-s4256004', value: encodeURIComponent(JSON.stringify({ purposes: { 4: true, 5: granted } })), url: base }]);
    await context.addInitScript(({ granted }) => {
      window._iub = [];
      window._iub.csConfiguration = { lang: 'en-GB' };
      window._iub.cs = { api: { isPreferenceExpressed: () => true, getPreferences: () => ({ purposes: { 4: true, 5: granted } }), openPreferences() {} } };
      window.__qaPixel = []; window.oaiq = (...args) => window.__qaPixel.push(args);
    }, { granted });
    let localActions = 0;
    await context.route('**/*', route => {
      const req = route.request();
      if (req.url().startsWith('https://challenges.cloudflare.com/turnstile/v0/api.js')) return route.fulfill({ contentType: 'application/javascript', body: `window.turnstile={render(el,options){window.__qaCaptcha=options;setTimeout(()=>options.callback('${scenario === 'security-error' ? 'qa-local-invalid-token' : 'qa-local-valid-token'}'),10);return 'qa-widget';},reset(){},remove(){}};` });
      if (/bzrcdn\.openai\.com|googletagmanager\.com|google-analytics\.com|vercel-scripts\.com|iubenda\.com|\/_vercel\//.test(req.url())) return route.fulfill({ contentType: 'application/javascript', body: '/* Isolated QA: no telemetry dispatch */' });
      if (req.method() === 'POST' && req.url().startsWith(`${base}/`) && req.headers()['next-action']) { localActions++; return route.continue(); }
      if (!['GET', 'HEAD'].includes(req.method())) return route.abort('blockedbyclient');
      return route.continue();
    });
    const page = await context.newPage(); const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`${base}/it/automazioni-aziendali`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__qaCaptcha);
    const form = page.locator('form'); const submit = form.locator('button[type="submit"]');
    await form.locator('[name="details"]').fill('QA locale: attività ripetitiva tra strumenti. Nessun contatto commerciale.');
    await form.locator('[name="name"]').fill(scenario === 'email-error' ? 'QA Provider Error' : 'QA Local Test');
    await form.locator('[name="email"]').fill(scenario === 'invalid-email' ? 'invalid-email' : 'qa@example.invalid');
    await form.locator('[name="privacy"]').check();
    if (scenario === 'invalid-email') await form.evaluate(e => { e.noValidate = true; }); // Exercise server-side validation too.
    await submit.click();
    await page.waitForFunction(() => document.querySelector('form')?.getAttribute('aria-busy') === 'false' && !!document.querySelector('form [role="status"]')?.textContent);
    await page.waitForTimeout(350);
    const status = await form.getByRole('status').innerText();
    const calls = (await traces()).slice(start);
    const email = calls.filter(c => c.provider === 'resend');
    const conversions = calls.filter(c => c.provider === 'openai-capi');
    const pixel = await page.evaluate(() => window.__qaPixel.filter(a => a[0] === 'measure' && a[1] === 'lead_created'));
    const success = ['success', 'consent-denied'].includes(scenario);
    check(`${scenario}: real local action reached once`, localActions === 1, { localActions });
    check(`${scenario}: correct response rendered`, success ? status.includes('richiesta è stata inviata') : scenario === 'security-error' ? status.includes('sicurezza non riuscita') : scenario === 'invalid-email' ? status.includes('email valido') : status.includes('Non è stato possibile'), { status });
    check(`${scenario}: Turnstile helper executed`, calls.some(c => c.provider === 'turnstile' && c.success === (scenario !== 'security-error')), calls.filter(c => c.provider === 'turnstile'));
    check(`${scenario}: email accepted only after validation`, email.length === (['success', 'consent-denied', 'email-error'].includes(scenario) ? 1 : 0) && (!email.length || email[0].accepted === success), email);
    check(`${scenario}: CAPI only after accepted consented email`, conversions.length === (scenario === 'success' ? 1 : 0), conversions);
    check(`${scenario}: Pixel only after accepted consented email`, pixel.length === (scenario === 'success' ? 1 : 0), { count: pixel.length });
    if (scenario === 'success') {
      check('success: Pixel/CAPI share actual server event ID', conversions[0]?.eventId === pixel[0]?.[3]?.event_id && /^contact-/.test(conversions[0]?.eventId || ''), { serverId: conversions[0]?.eventId, pixelId: pixel[0]?.[3]?.event_id });
      check('success: CAPI hashes email and uses validate-only', conversions[0]?.hashedEmail && conversions[0]?.validateOnly && conversions[0]?.sourceUrl === `${base}/it/automazioni-aziendali`, conversions[0]);
      check('success: source and simple form contract reach mail adapter', email[0]?.sourcePreserved && email[0]?.budgetOmitted && email[0]?.replyToSynthetic, email[0]);
    }
    check(`${scenario}: fields reset on success or preserved on error`, await form.locator('[name="email"]').inputValue() === (success ? '' : scenario === 'invalid-email' ? 'invalid-email' : 'qa@example.invalid'), { success });
    check(`${scenario}: no unexpected external write`, !calls.some(c => c.provider === 'blocked-unexpected-write'), calls);
    check(`${scenario}: no unhandled browser errors`, errors.length === 0, errors);
    results.scenarios.push({ scenario, status, localActions, providerCalls: calls });
    await page.screenshot({ path: path.join(output, `contact-e2e-${scenario}.png`) });
    await context.close();
  }
} catch (e) { results.exception = String(e); console.error(e); }
finally { await fs.writeFile(path.join(output, 'contact-e2e.json'), JSON.stringify(results, null, 2)); await browser.close(); }
if (results.exception || results.checks.some(c => !c.pass)) process.exitCode = 1;
