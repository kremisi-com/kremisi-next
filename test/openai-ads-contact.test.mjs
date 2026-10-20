import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import test from "node:test";
import { createContactConversion } from "../src/server/openai-ads-capi.mjs";
import { ADS_CONSENT_COOKIE, ADS_CONSENT_GRANTED } from "../src/lib/openai-ads-config.mjs";

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

function scheduler(dependencies) {
  return loadModule("../src/server/openai-ads.js", {
    headers: async () => new Headers({
      cookie: `${ADS_CONSENT_COOKIE}=${ADS_CONSENT_GRANTED}; __oppref=raw%2F=+`,
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
