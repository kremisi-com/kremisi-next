// Opt-in Node preload for the isolated local QA server only.
// Runs the actual application action/helpers; intercepts provider transport.
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

if (process.env.NODE_ENV === 'production') throw new Error('The isolated contact fixture cannot run in production');

const expected = {
  KREMISI_CONTACT_QA: 'isolated',
  RESEND_API_KEY: 'qa-local-not-a-real-key',
  RESEND_FROM_EMAIL: 'QA <sender@example.invalid>',
  CONTACT_EMAIL_TO: 'inbox@example.invalid',
  CLOUDFLARE_TURNSTILE_SECRET_KEY: 'qa-local-not-a-real-secret',
  OPENAI_ADS_CONVERSIONS_API_KEY: 'qa-local-not-a-real-key',
  OPENAI_ADS_VALIDATE_ONLY: 'true',
};
for (const [key, value] of Object.entries(expected)) {
  if (process.env[key] !== value) throw new Error(`Isolated QA requires the dummy configuration for ${key}`);
}
const output = path.resolve(process.env.KREMISI_QA_LOG_FILE || '');
const root = path.resolve('docs/landing-automation/audit-evidence') + path.sep;
if (!output.startsWith(root) || path.extname(output) !== '.jsonl') throw new Error('QA provider log must stay inside audit-evidence');
fs.mkdirSync(path.dirname(output), { recursive: true });
function trace(record) { fs.appendFileSync(output, JSON.stringify({ at: new Date().toISOString(), ...record }) + '\n'); }
function json(body, status = 200) { return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } }); }
const originalFetch = globalThis.fetch;
const acceptedMail = new Map();
const failingConversions = new Set();
globalThis.fetch = async function isolatedProviderFetch(input, init) {
  const request = new Request(input, init);
  const url = new URL(request.url);
  if (url.origin === 'https://challenges.cloudflare.com' && url.pathname === '/turnstile/v0/siteverify') {
    const body = new URLSearchParams(await request.text());
    if (body.get('secret') !== expected.CLOUDFLARE_TURNSTILE_SECRET_KEY) throw new Error('Unexpected verification secret');
    const success = body.get('response') === 'qa-local-valid-token';
    trace({ provider: 'turnstile', success });
    return json({ success, 'error-codes': success ? [] : ['invalid-input-response'] });
  }
  if (url.origin === 'https://api.resend.com' && url.pathname === '/emails') {
    const payload = await request.json();
    const recipients = Array.isArray(payload.to) ? payload.to : [payload.to];
    if (recipients.some(email => email !== expected.CONTACT_EMAIL_TO) || payload.from !== expected.RESEND_FROM_EMAIL || !payload.reply_to?.endsWith('@example.invalid')) throw new Error('Only synthetic QA mail is allowed');
    const rejected = payload.subject.includes('QA Provider Error');
    const key = request.headers.get('idempotency-key');
    const duplicate = !!key && acceptedMail.has(key);
    const id = duplicate ? acceptedMail.get(key) : `qa-email-${randomUUID()}`;
    if (!rejected && key) acceptedMail.set(key, id);
    if (payload.subject.includes('QA CAPI Error')) failingConversions.add(key);
    // Delay makes the browser's pending/disabled state observable.
    await new Promise(resolve => setTimeout(resolve, 200));
    trace({ provider: 'resend', accepted: !rejected, duplicate, idempotencyKey: key, sourcePreserved: payload.text.includes('Origine: Landing automazioni aziendali'), budgetOmitted: !payload.text.includes('Budget:'), replyToSynthetic: true });
    return rejected ? json({ name: 'application_error', message: 'QA simulated provider unavailable', statusCode: 503 }, 503) : json({ id });
  }
  if (url.origin === 'https://bzr.openai.com' && url.pathname === '/v1/events') {
    const payload = await request.json();
    if (payload.validate_only !== true) throw new Error('QA conversions must be validate-only');
    const event = payload.events?.[0];
    const rejected = failingConversions.has(event?.id);
    trace({ provider: 'openai-capi', eventId: event?.id, type: event?.type, accepted: !rejected, validateOnly: true, hashedEmail: /^[a-f0-9]{64}$/.test(event?.user?.emails_sha256?.[0] || ''), sourceUrl: event?.source_url });
    return rejected ? json({ error: 'QA CAPI unavailable' }, 503) : json({ accepted: true }, 202);
  }
  if (!['GET', 'HEAD'].includes(request.method)) {
    trace({ provider: 'blocked-unexpected-write', origin: url.origin, pathname: url.pathname });
    throw new Error('External writes are disabled in isolated contact QA');
  }
  return originalFetch(input, init);
};
