// Starts an explicitly isolated development server. No production credential is used.
import { spawn } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const fixture = pathToFileURL(path.resolve('scripts/qa/contact-provider-fixture.mjs')).href;
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', '--port', '3102'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: `--import=${fixture}`,
    KREMISI_CONTACT_QA: 'isolated',
    NEXT_PUBLIC_TURNSTILE_SITE_KEY: 'qa-local-site-key',
    CLOUDFLARE_TURNSTILE_SECRET_KEY: 'qa-local-not-a-real-secret',
    RESEND_API_KEY: 'qa-local-not-a-real-key',
    RESEND_FROM_EMAIL: 'QA <sender@example.invalid>',
    CONTACT_EMAIL_TO: 'inbox@example.invalid',
    OPENAI_ADS_CONVERSIONS_API_KEY: 'qa-local-not-a-real-key',
    OPENAI_ADS_VALIDATE_ONLY: 'true',
    KREMISI_QA_LOG_FILE: path.resolve(process.env.KREMISI_QA_OUTPUT || 'docs/landing-automation/audit-evidence/mobile-release', 'contact-provider.jsonl'),
  },
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', code => { process.exitCode = code || 0; });
