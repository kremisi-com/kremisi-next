import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import test from "node:test";
import { createContactConversion } from "../src/server/openai-ads-capi.mjs";
import { ADS_CONSENT_GRANTED } from "../src/lib/openai-ads-config.mjs";
import { IUBENDA_CONSENT_COOKIE } from "../src/lib/cookie-consent.mjs";

// Execute the actual server action/helper with framework and provider adapters
// replaced. No Turnstile challenges, emails, or conversion pings leave the tests.
function loadModule(path, dependencies, exportName) {
  const source = readFileSync(new URL(path, import.meta.url), "utf8")
    .replace(/^import .*;\r?$/gm, "")
    .replace(/export async function/g, "async function");
  return runInNewContext(`${source}\n${exportName}`, {
    ...dependencies,
    console: { info() {}, warn() {}, error() {} },
    Date,
  });
}

function contactForm() {
  const form = new FormData();
  for (const [key, value] of Object.entries({
    locale: "it", service: "information", details: "Test contact request",
    name: "Test User", email: "user@example.com", privacy: "on",
    "cf-turnstile-response": "placeholder",
    openaiAdsConsent: ADS_CONSENT_GRANTED,
    openaiAdsSourceUrl: "https://kremisi.com/it/contacts",
  })) form.set(key, value);
  return form;
}

function action(dependencies) {
  return loadModule("../src/components/contact-form/actions.js", {
    randomUUID: () => "00000000-0000-4000-8000-000000000000",
    verifyTurnstileToken: async () => ({ success: true }),
    sendContactEmail: async () => "accepted-email",
    scheduleOpenAIAdsLead: async () => ({ eventId: "lead" }),
    ...dependencies,
  }, "submitContact");
}

test("only Resend-accepted contacts schedule conversion and return the same server event ID to Pixel", async () => {
  const calls = [];
  const submit = action({
    sendContactEmail: async () => { calls.push("email-accepted"); return "accepted-email"; },
    scheduleOpenAIAdsLead: async ({ eventId }) => {
      calls.push("conversion");
      return { eventId };
    },
  });
  const result = await submit(null, contactForm());
  assert.equal(result.success, true);
  assert.deepEqual(calls, ["email-accepted", "conversion"]);
  assert.match(result.openaiAds.eventId, /^contact-\d+-00000000$/);
});

test("spam, failed security, invalid forms, and rejected emails never schedule a conversion", async () => {
  for (const scenario of ["honeypot", "security", "validation", "email"]) {
    let conversions = 0;
    const submit = action({
      verifyTurnstileToken: async () => ({ success: scenario !== "security" }),
      sendContactEmail: async () => {
        if (scenario === "email") throw new Error("provider unavailable");
        return "accepted-email";
      },
      scheduleOpenAIAdsLead: async () => { conversions += 1; },
    });
    const form = contactForm();
    if (scenario === "honeypot") form.set("krs_x9q4", "bot");
    if (scenario === "validation") form.set("email", "invalid");
    const result = await submit(null, form);
    assert.equal(conversions, 0, scenario);
    assert.equal(result.success, scenario === "honeypot", scenario);
    assert.equal(result.openaiAds, undefined, scenario);
  }
});

test("automation landing uses the simple contact contract and preserves its source and conversion context", async () => {
  let received;
  let measuredSource;
  const submit = action({
    sendContactEmail: async (payload) => { received = payload; return "accepted-email"; },
    scheduleOpenAIAdsLead: async ({ formData, eventId }) => {
      measuredSource = formData.get("openaiAdsSourceUrl");
      return { eventId };
    },
  });
  const form = contactForm();
  form.set("source", "automation_landing");
  form.set("company", "Example company");
  form.set("openaiAdsSourceUrl", "https://kremisi.com/it/automazioni-aziendali");
  const result = await submit(null, form);
  assert.equal(result.success, true);
  assert.equal(received.source, "automation_landing");
  assert.equal(received.company, "Example company");
  assert.equal(received.budget, "");
  assert.equal(received.delivery, "");
  assert.equal(measuredSource, "https://kremisi.com/it/automazioni-aziendali");
  form.set("source", "untrusted-source");
  await submit(null, form);
  assert.equal(received.source, "");
});

test("simple landing contacts still require privacy, valid details, name, email and optional phone", async () => {
  for (const [field, value] of [
    ["privacy", ""], ["details", "abc"], ["name", "A"],
    ["email", "invalid"], ["phone", "invalid-phone"],
  ]) {
    let emails = 0;
    let conversions = 0;
    const submit = action({
      sendContactEmail: async () => { emails += 1; return "accepted-email"; },
      scheduleOpenAIAdsLead: async () => { conversions += 1; },
    });
    const form = contactForm();
    form.set("source", "automation_landing");
    form.set(field, value);
    const result = await submit(null, form);
    assert.equal(result.success, false, field);
    assert.equal(emails, 0, field);
    assert.equal(conversions, 0, field);
    assert.ok(result.error, field);
  }
});

function scheduler(dependencies) {
  return loadModule("../src/server/openai-ads.js", {
    headers: async () => new Headers({
      cookie: `${IUBENDA_CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify({ purposes: { 5: true } }))}; __oppref=raw%2F=+`,
      origin: "https://kremisi.com",
      "user-agent": "Test browser",
    }),
    after() {}, createContactConversion,
    sendContactConversion: async () => {}, ADS_CONSENT_GRANTED,
    process: { env: { OPENAI_ADS_CONVERSIONS_API_KEY: "placeholder" } },
    ...dependencies,
  }, "scheduleOpenAIAdsLead");
}

test("CAPI dispatch is deferred, with a shared event ID and consent checked on the server", async () => {
  let callback;
  const events = [];
  const schedule = scheduler({
    after: (task) => { callback = task; },
    sendContactConversion: async (event) => events.push(event),
  });
  const pixel = await schedule({ formData: contactForm(), email: "user@example.com", eventId: "lead-1", locale: "it" });
  assert.equal(events.length, 0);
  assert.equal(pixel.eventId, "lead-1");
  await callback();
  assert.equal(events[0].id, pixel.eventId);
  assert.equal(events[0].oppref, "raw%2F=+");
  const denied = scheduler({ headers: async () => new Headers() });
  assert.equal(await denied({ formData: contactForm(), email: "user@example.com", eventId: "lead-2" }), undefined);
  const gpc = scheduler({ headers: async () => new Headers({
    cookie: `${IUBENDA_CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify({ purposes: { 5: true } }))}`,
    "sec-gpc": "1",
  }) });
  assert.equal(await gpc({ formData: contactForm(), email: "user@example.com", eventId: "lead-3" }), undefined);
});

test("headers, hashing, form-context, and scheduler failures cannot fail an accepted contact", async () => {
  const failures = [
    { headers: async () => { throw new Error("headers failed"); } },
    { createContactConversion() { throw new Error("hashing/URL failed"); } },
    { after() { throw new Error("scheduler failed"); } },
  ];
  for (const failure of failures) {
    const submit = action({ scheduleOpenAIAdsLead: scheduler(failure) });
    const result = await submit(null, contactForm());
    assert.equal(result.success, true);
  }
});
