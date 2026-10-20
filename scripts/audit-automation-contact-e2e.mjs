// Real local browser -> Next Server Action -> application helpers -> fixture transport.
// Unlike audit-automation-form.mjs, no browser action response is mocked.
import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.AUDIT_PLAYWRIGHT || 'playwright');
const base = 'http://127.0.0.1:3102';
const output = path.resolve(process.env.KREMISI_QA_OUTPUT || 'docs/landing-automation/audit-evidence/mobile-release');
const logPath = path.join(output, 'contact-provider.jsonl');
await fs.mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true, ...(process.env.AUDIT_CHROMIUM ? { executablePath: process.env.AUDIT_CHROMIUM } : {}) });
const results = { base, safety: 'Explicitly authorized isolated localhost. Real server actions; Node provider transport intercepted with dummy credentials. No external mail or conversions.', checks: [], scenarios: [] };
function check(name, pass, evidence) { results.checks.push({ name, pass, evidence }); console.log(`${pass ? 'PASS' : 'FAIL'} ${name}`); }
async function traces() { try { return (await fs.readFile(logPath, 'utf8')).trim().split('\n').filter(Boolean).map(line => JSON.parse(line)); } catch (e) { if (e.code === 'ENOENT') return []; throw e; } }
try {
  for (const scenario of ['success', 'email-error', 'security-error', 'invalid-email', 'consent-denied', 'measurement-only', 'capi-error', 'repeated', 'response-lost']) {
    const start = (await traces()).length;
    const granted = !['consent-denied', 'measurement-only'].includes(scenario);
    const analytics = scenario !== 'consent-denied';
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await context.addCookies([{ name: '_iub_cs-s4256004', value: encodeURIComponent(JSON.stringify({ purposes: { 4: analytics, 5: granted } })), url: base }]);
    await context.addInitScript(({ granted, analytics }) => {
      window._iub = [];
      window._iub.csConfiguration = { lang: 'en-GB' };
      window._iub.cs = { api: { isPreferenceExpressed: () => true, getPreferences: () => ({ purposes: { 4: analytics, 5: granted } }), openPreferences() {} } };
      window.__qaPixel = []; window.oaiq = (...args) => window.__qaPixel.push(args);
      window.__qaGA = []; window.gtag = (...args) => window.__qaGA.push(args);
    }, { granted, analytics });
    let localActions = 0;
    let actionRequest;
    await context.route('**/*', async route => {
      const req = route.request();
      if (req.url().startsWith('https://challenges.cloudflare.com/turnstile/v0/api.js')) return route.fulfill({ contentType: 'application/javascript', body: `window.turnstile={render(el,options){window.__qaCaptcha=options;setTimeout(()=>options.callback('${scenario === 'security-error' ? 'qa-local-invalid-token' : 'qa-local-valid-token'}'),10);return 'qa-widget';},reset(){setTimeout(()=>window.__qaCaptcha.callback('qa-local-valid-token'),10);},remove(){}};` });
      if (/bzrcdn\.openai\.com|googletagmanager\.com|google-analytics\.com|vercel-scripts\.com|iubenda\.com|\/_vercel\//.test(req.url())) return route.fulfill({ contentType: 'application/javascript', body: '/* Isolated QA: no telemetry dispatch */' });
      if (req.method() === 'POST' && req.url().startsWith(`${base}/`) && req.headers()['next-action']) {
        localActions++; actionRequest = { url: req.url(), headers: req.headers(), data: req.postDataBuffer() };
        if (scenario === 'response-lost' && localActions === 1) {
          const acceptedResponse = await route.fetch();
          await acceptedResponse.body();
          return route.abort('connectionreset');
        }
        return route.continue();
      }
      if (!['GET', 'HEAD'].includes(req.method())) return route.abort('blockedbyclient');
      if (!req.url().startsWith(`${base}/`)) return route.abort('blockedbyclient');
      return route.continue();
    });
    const page = await context.newPage(); const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(`${base}/it/automazioni-aziendali`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => window.__qaCaptcha);
    const form = page.locator('form'); const submit = form.locator('button[type="submit"]');
    await form.locator('[name="details"]').fill('QA locale: attività ripetitiva tra strumenti. Nessun contatto commerciale.');
    await form.locator('[name="name"]').fill(scenario === 'email-error' ? 'QA Provider Error' : scenario === 'capi-error' ? 'QA CAPI Error' : 'QA Local Test');
    await form.locator('[name="email"]').fill(scenario === 'invalid-email' ? 'invalid-email' : 'qa@example.invalid');
    await form.locator('[name="privacy"]').check();
    if (scenario === 'invalid-email') await form.evaluate(e => { e.noValidate = true; }); // Exercise server-side validation too.
    await submit.click();
    if (!['security-error', 'invalid-email'].includes(scenario)) {
      await page.waitForFunction(() => document.querySelector('form')?.getAttribute('aria-busy') === 'true');
      check(`${scenario}: pending blocks repeated click`, await submit.isDisabled(), {});
    }
    await page.waitForFunction(() => document.querySelector('form')?.getAttribute('aria-busy') === 'false' && !!document.querySelector('form [role="status"]')?.textContent);
    await page.waitForTimeout(350);
    if (scenario === 'response-lost') {
      check('response-lost: transport failure preserves fields and reports error', (await form.getByRole('status').innerText()).includes('Non è stato possibile') && await form.locator('[name="email"]').inputValue() === 'qa@example.invalid', {});
      await submit.click();
      await page.waitForFunction(() => document.querySelector('form [role="status"]')?.textContent.includes('richiesta è stata inviata'));
      await page.waitForTimeout(350);
    }
    const status = await form.getByRole('status').innerText();
    if (scenario === 'repeated') {
      const response = await context.request.post(actionRequest.url, { headers: actionRequest.headers, data: actionRequest.data });
      check('repeated: replay reaches real action', response.ok(), { httpStatus: response.status() });
      await page.waitForTimeout(350);
    }
    const calls = (await traces()).slice(start);
    const email = calls.filter(c => c.provider === 'resend');
    const conversions = calls.filter(c => c.provider === 'openai-capi');
    const pixel = await page.evaluate(() => window.__qaPixel.filter(a => a[0] === 'measure' && a[1] === 'lead_created'));
    const retried = ['repeated', 'response-lost'].includes(scenario);
    const success = ['success', 'consent-denied', 'measurement-only', 'capi-error', 'repeated', 'response-lost'].includes(scenario);
    const expectedEmailCalls = retried ? 2 : success || scenario === 'email-error' ? 1 : 0;
    const expectedConversions = retried ? 2 : success && granted ? 1 : 0;
    check(`${scenario}: expected browser action count`, localActions === (scenario === 'response-lost' ? 2 : 1), { localActions });
    check(`${scenario}: correct response rendered`, success ? status.includes('richiesta è stata inviata') : scenario === 'security-error' ? status.includes('sicurezza non riuscita') : scenario === 'invalid-email' ? status.includes('email valido') : status.includes('Non è stato possibile'), { status });
    check(`${scenario}: Turnstile helper executed`, calls.some(c => c.provider === 'turnstile' && c.success === (scenario !== 'security-error')), calls.filter(c => c.provider === 'turnstile'));
    check(`${scenario}: email accepted only after validation`, email.length === expectedEmailCalls && (!email.length || email.every(c => c.accepted === success)), email);
    check(`${scenario}: CAPI only after accepted consented email`, conversions.length === expectedConversions, conversions);
    check(`${scenario}: Pixel only after accepted consented email`, pixel.length === (success && granted ? 1 : 0), { count: pixel.length });
    const ga = await page.evaluate(() => [...window.__qaGA, ...(window.dataLayer || []).map(a => Array.from(a))].filter(a => a[0] === 'event' && a[1] === 'generate_lead'));
    check(`${scenario}: GA respects analytics purpose`, ga.length === (success && analytics ? 1 : 0), { count: ga.length });
    if (scenario === 'capi-error') check('CAPI failure: email/UI/Pixel remain successful', conversions[0]?.accepted === false && success && pixel.length === 1, conversions);
    if (retried) {
      check(`${scenario}: fixture provider delivers one logical email`, email.filter(c => !c.duplicate).length === 1 && email[1]?.duplicate && email[0]?.idempotencyKey === email[1]?.idempotencyKey, email);
      check(`${scenario}: conversion retry preserves event ID`, conversions.length === 2 && conversions[0].eventId === conversions[1].eventId && conversions[0].eventId === pixel[0]?.[3]?.event_id, conversions);
    }
    if (scenario === 'success') {
      check('success: Pixel/CAPI share actual server event ID', conversions[0]?.eventId === pixel[0]?.[3]?.event_id && /^contact-/.test(conversions[0]?.eventId || ''), { serverId: conversions[0]?.eventId, pixelId: pixel[0]?.[3]?.event_id });
      check('success: CAPI hashes email and uses validate-only', conversions[0]?.hashedEmail && conversions[0]?.validateOnly && conversions[0]?.sourceUrl === `${base}/it/automazioni-aziendali`, conversions[0]);
      check('success: source and simple form contract reach mail adapter', email[0]?.sourcePreserved && email[0]?.budgetOmitted && email[0]?.replyToSynthetic, email[0]);
    }
    check(`${scenario}: fields reset on success or preserved on error`, await form.locator('[name="email"]').inputValue() === (success ? '' : scenario === 'invalid-email' ? 'invalid-email' : 'qa@example.invalid'), { success });
    check(`${scenario}: privacy choice resets only after success`, await form.locator('[name="privacy"]').isChecked() === !success, { success });
    check(`${scenario}: no unexpected external write`, !calls.some(c => c.provider === 'blocked-unexpected-write'), calls);
    check(`${scenario}: no unhandled browser errors`, errors.length === 0, errors);
    results.scenarios.push({ scenario, status, localActions, providerCalls: calls });
    await page.screenshot({ path: path.join(output, `contact-e2e-${scenario}.png`) });
    await context.close();
  }
} catch (e) { results.exception = String(e); console.error(e); }
finally { await fs.writeFile(path.join(output, 'contact-e2e.json'), JSON.stringify(results, null, 2)); await browser.close(); }
if (results.exception || results.checks.some(c => !c.pass)) process.exitCode = 1;
