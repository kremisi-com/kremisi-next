This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Website Roaster Env

`src/app/api/roast/route.js` supports cost-control and model-routing env vars:

```bash
# Main cost target (0-70). Default: 40
ROASTER_COST_TARGET_PERCENT=40

# Optional overrides (if omitted, derived from target profile)
ROASTER_DEPTH_ONE_MAX_LINKS=3
ROASTER_PAGE_STAGE_ONE_MAX_CHARS=500
ROASTER_GLOBAL_SITE_CONTENT_MAX_CHARS=2200
ROASTER_BASE_MAX_TOKENS=1200
ROASTER_BASE_RETRY_MAX_TOKENS=1600
ROASTER_REVENUE_MAX_TOKENS=700
ROASTER_REVENUE_RETRY_MAX_TOKENS=1000

# In-memory cache
ROASTER_CACHE_TTL_SECONDS=86400
ROASTER_CACHE_MAX_ENTRIES=500
ROASTER_PROMPT_VERSION=1

# Model routing
ROASTER_PRIMARY_MODEL=claude-3-5-haiku-latest
ROASTER_FALLBACK_MODEL=claude-sonnet-4-20250514
ROASTER_ENABLE_MODEL_FALLBACK=true
```

### Free OpenRouter mode

For a zero-model-cost deployment, keep the OpenRouter API key server-side and
configure the Website Roaster with:

```bash
AI_API=openrouter
OPENROUTER_API_KEY=your-server-side-key
ROASTER_OPENROUTER_MODEL=openrouter/free
ROASTER_OPENROUTER_FALLBACK_MODEL=openrouter/free
ROASTER_ENABLE_OPENROUTER_MODEL_FALLBACK=true
```

`openrouter/free` selects from OpenRouter's currently available free models. The
application also falls back to this router when a specifically configured free
model is retired, removed, or becomes paid. Authentication failures do not
trigger a fallback, and equal primary/fallback model IDs are never retried in a
loop.

Do not use `openrouter/auto` for a zero-cost deployment: that router can select
paid models. Apply these values to the intended Vercel environments and create a
new deployment after changing them; existing deployments keep their previous
environment snapshot.

## OpenAI Ads conversion setup

Local Pixel+CAPI integration, added on 2026-10-20. Detected runtime: Next.js
App Router 16.2.4 (package range `^16.1.6`), React 19, Node server actions,
JavaScript, pnpm 10.33.1. No prior OpenAI Ads initialization, events, configuration,
or CAPI client was found. GA/GTM and the existing `src/lib/analytics.js` lead
helper establish the local success boundary; OpenAI lead reporting extends that
helper. Existing unrelated working-tree edits were preserved.

### Configuration and changed files

- `src/lib/openai-ads-config.mjs`: shared public Pixel ID
  `XUknsuwioN947vpX5LA4iD`, canonical origin `https://kremisi.com`, consent constants,
  and raw cookie extraction. Both browser and server import the same Pixel ID.
- `src/lib/openai-ads-browser.mjs`: browser-only SDK initialization, consent,
  page/content events, late matching initialization, and deduplicated lead events.
- `src/components/openai-ads/`: single app-level measurement component plus
  bilingual consent/preferences UI and its styles.
- `src/app/[locale]/layout.js`: mounts the app-level component once.
- `src/app/[locale]/(contents)/projects/[id]/page.js`: measures confirmed project
  detail rendering, after project lookup succeeds. Redirected case studies are
  covered by their canonical project page.
- `src/lib/analytics.js` and `src/components/contact-form/contact-form.js`:
  preserve the GA lead helper, attach consented browser context to the existing
  server action, and report the paired Pixel event on accepted submission.
- `src/components/contact-form/actions.js`: schedules CAPI only after Resend
  accepts the email and returns a nonempty email ID. The existing honeypot
  silent-drop path, security/validation failures, and delivery errors do not
  reach the conversion publisher.
- `src/server/openai-ads.js`: `server-only` boundary and Next.js `after` scheduler.
- `src/server/openai-ads-capi.mjs`: hashing, source URL validation, event creation,
  and bounded server-only HTTP dispatch, reachable only through the server helper.
- `.env.example`: empty `OPENAI_ADS_CONVERSIONS_API_KEY` server secret reference
  and `OPENAI_ADS_VALIDATE_ONLY=false`. No credential was provisioned or embedded.
- `test/openai-ads*.mjs`: browser, CAPI, and contact-action regression coverage.

### Events and exclusions

| Event | New coverage |
| --- | --- |
| `page_viewed` | Current localized page after measurement consent, then committed SPA pathname changes. Query/hash-only changes and repeated effects do not duplicate it. |
| `contents_viewed` | Successfully rendered project details, including the brand-identity case study. Project IDs/titles only; no form contents. |
| `lead_created` | Accepted contact email, including Information and project requests, through paired Pixel and CAPI. Uses `customer_action`; no invented lead value. |

No OpenAI events were already covered. `items_added`, `checkout_started`, and
`order_created` are skipped because the app has no commerce flow.
`registration_completed`, `appointment_scheduled`, `subscription_created`, and
`trial_started` are skipped because no corresponding confirmed account,
booking, subscription, or trial success boundary exists. `app_installed` and
`app_opened` are skipped because this is a web app with no native mobile surface.
No custom events are necessary for the confirmed flows.

Optional follow-ups: define a separate successful-use event for Website Roaster
if it is a campaign objective. Its internal notification email is not treated as
a user-created contact lead. Email/WhatsApp clicks and form starts remain intent,
not confirmed leads. No new arbitrary-event API endpoint was added.

### Consent, identity, and attribution

iubenda is the single consent manager, using the existing site `4256004` and
policy `87027585`. `src/lib/iubenda-config.mjs` enables purposes 1 (necessary),
4 (measurement), and 5 (marketing). OpenAI Ads starts denied and loads only after
iubenda validates an explicit marketing grant. The old `kremisi_ads_consent`
cookie is ignored; there is no separate banner or consent persistence. CAPI
checks iubenda's native `_iub_cs-s4256004` cookie as well as the consented form
context, and respects US opt-outs and the `Sec-GPC` request header. Malformed
or missing preferences fail closed. The required contact Privacy Policy checkbox
remains separate from optional marketing consent.

The localized Cookie preferences control reopens iubenda's own panel. When the
account requires its native widget, that same button is labeled and positioned
to match the site, preserving iubenda's icon and branding. It has a 44px target
and mobile safe-area spacing; mobile email, WhatsApp and the home CTA occupy
separate positions. If the CMP cannot load, measurement stays disabled and the
button reports the failure and offers a reload to retry.

Revocation sets OpenAI SDK consent false, removes queued measurement and matching
calls from an unloaded stub, and blocks subsequent application events. If Google
or Vercel tools were already mounted, withdrawal reloads the document to unload
their runtime. GA and Vercel tools require purpose 4; the externally managed GTM
container conservatively requires both 4 and 5. Google Consent Mode defaults to
denied before any Google script, and follows iubenda's choices. Application GA
events are gated too. No past events are replayed after a later grant.

The existing remote iubenda account currently advertises **en-GB only** and no
full banner customization. Unsupported languages disable its banner. Therefore
`NEXT_PUBLIC_IUBENDA_LANGUAGES` defaults to `en-GB`; add `it,en-GB` only after
enabling these languages in the dashboard. The site's preferences button is
localized independently. The SDK currently overrides custom banner text,
captions and colors with its account defaults; the local configuration includes
the intended short notice and expandable OpenAI/email-hash disclosure for when
the account permits it. Update the hosted policy's services and disclosures in
the dashboard; local consent wiring does not edit that hosted document.

The Pixel loads `https://bzrcdn.openai.com/sdk/oaiq.min.js`, sets consent false
before its first `init({ pixelId })`, then enables measurement. One initializer
and SDK tag are shared across route changes. Production debug is not enabled.
All Pixel options and CAPI events explicitly use `opt_out: true` to exclude future
user-level personalization. Existing page, project and accepted-contact events,
matching fields, CAPI credentials and deduplication are unchanged by CMP wiring.

After a consented contact succeeds, the server normalizes the email by trimming
and lowercasing, hashes UTF-8 with SHA-256, and returns only the hash and shared
event ID to the browser. Before `measure`, the Pixel receives a second
`init({ user: { email_sha256 } })` without repeating `pixelId`. CAPI uses the current
documented plural field `user.emails_sha256`. No name, phone, message, budget,
raw email, or external ID is sent. CAPI includes the client `user_agent` and raw
`user.obref` when available. Client IP is omitted because the repository has no
established trusted proxy/IP extraction pattern. Geography is unavailable.

CAPI reads the raw `__oppref` cookie without parsing, decoding, modifying, or
logging its value. For `obref`, the server-readable raw `__obref` cookie takes
precedence over the optional raw browser-submitted value. The Pixel handles its
own attribution, cookies, timestamps, and transport.

For web CAPI, `action_source` is `web`. Browser context captures origin plus
pathname at submission; the server accepts only HTTP(S) URLs without embedded
credentials, whose origin matches the request Origin or the configured canonical
origin. It strips query and fragment. Rejected/missing context falls back to
`https://kremisi.com/{locale}/contacts`; proxy/service origins never replace the
canonical fallback. The Pixel SDK derives its own source context (the current
documentation describes an origin); CAPI deliberately retains the sanitized
contact-page pathname as required for web event context.

The existing random per-request contact ID becomes Pixel `event_id` and CAPI `id`,
with the same Pixel ID and `lead_created` name. Pixel suppresses repeated receipt
of that ID. Each accepted request has one CAPI dispatch and a current
`timestamp_ms`; there are no retries, backfills, or browser-generated timestamps.
Email delivery remains the business success boundary, not final inbox delivery.

### Failure behavior and verification

All browser measurement helpers suppress their errors. Server context reads,
hashing, URL handling, scheduling, timeout setup, serialization, and dispatch
are inside failure boundaries. Network delivery runs through Next.js `after`
after the successful response, with a 1.5-second timeout and no new queues or
infrastructure. Redacted warnings contain no identifiers, attribution, payloads,
credentials, or response bodies. Reporting failures cannot fail an accepted
contact. Dispatch is best effort: transient failures can lose the server copy.

Local checks: `pnpm test` (34 passing tests), targeted ESLint, `pnpm build`,
`git diff --check`, both installed skill verification scripts, and production
client-bundle scan for CAPI secret references/endpoint. Browser inspection of
`/it` confirmed the real iubenda banner, marketing-only loading of OpenAI Ads,
loading of Google tools only after both required categories, and no measurement
scripts following withdrawal and reload. Responsive checks cover the home CTA,
email and the single native preferences widget. Tests stub providers and exercise deferred dispatch,
deduplication, raw attribution, trusted URLs, hashing, revocation, and successful
versus rejected contact submissions without sending emails or conversion pings.

The runtime uses the current official CAPI `emails_sha256` list and `obref`
fields rather than the older singular-only examples in the installed skill's
reference. Exact syntax was checked against the official
[Measurement Pixel](https://developers.openai.com/ads/measurement-pixel),
[Conversions API](https://developers.openai.com/ads/conversions-api), and
[Supported Events](https://developers.openai.com/ads/supported-events) documentation.
Deferred execution follows [Next.js after](https://nextjs.org/docs/app/api-reference/functions/after).

### Deployment follow-ups

1. Provision `OPENAI_ADS_CONVERSIONS_API_KEY` only in the server environment;
   never use a public env prefix. Without it, consented Pixel reporting still
   works while CAPI dispatch is disabled. Keep validation false in production.
2. The local contact form reports `Turnstile site key missing.` Existing
   Turnstile and Resend environment configuration is needed for a real contact
   submission. No production emails or real CAPI validation requests were sent.
3. In an authorized test environment, set validation true for one consented
   contact, inspect Ads Manager validation, then restore false for live delivery.
   Confirm browser/server deduplication in Ads Manager and SDK operation with the
   actual Pixel configuration. Page/content events use Pixel only.
4. In iubenda, add the actual services to the hosted privacy/cookie disclosures,
   including OpenAI Ads cookies, email-hash matching, retention and purposes.
   The remote account currently lists only two providers and purposes 1 and 2;
   this integration explicitly exposes 1, 4 and 5 locally. Enable Italian and
   banner customization in the account if desired, then set the corresponding
   public language configuration. Review externally configured GTM tags and
   automatic matching to avoid duplicate OpenAI initialization or extra fields.
5. If a CSP is introduced, allow the documented OpenAI script/connect/image
   sources. Confirm the hosting adapter supports Next.js `after`.

Before deploying, review that this implementation satisfies your privacy,
security, consent, and data handling requirements. No deployment was performed.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
