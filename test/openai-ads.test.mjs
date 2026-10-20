import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import {
  ADS_CONSENT_COOKIE, ADS_CONSENT_GRANTED, ADS_CONSENT_DENIED,
  hasAdsConsent, OPENAI_ADS_PIXEL_ID, readRawCookie,
} from "../src/lib/openai-ads-config.mjs";
import { createContactConversion, getAdsSourceUrl, sendContactConversion } from "../src/server/openai-ads-capi.mjs";
import {
  appendOpenAIAdsContext, setAdsConsent, trackOpenAIAdsPage,
  trackOpenAIAdsContent, trackOpenAIAdsLead,
} from "../src/lib/openai-ads-browser.mjs";

const grantedCookie = `${ADS_CONSENT_COOKIE}=${ADS_CONSENT_GRANTED}`;

test("consent is denied unless an explicit current-version choice exists", () => {
  for (const cookie of ["", `${ADS_CONSENT_COOKIE}=true`, `${ADS_CONSENT_COOKIE}=${ADS_CONSENT_DENIED}`]) {
    assert.equal(hasAdsConsent(cookie), false);
    assert.equal(createContactConversion({ cookieHeader: cookie, measurementConsent: true }), undefined);
  }
  assert.equal(hasAdsConsent(grantedCookie), true);
  assert.equal(createContactConversion({ cookieHeader: grantedCookie, measurementConsent: false }), undefined);
});

test("raw cookie attribution preserves encoded characters and equals signs", () => {
  assert.equal(readRawCookie("a=b; __oppref=A%2FB%3D=+; c=d", "__oppref"), "A%2FB%3D=+");
  assert.equal(readRawCookie("not__oppref=x", "__oppref"), undefined);
});

test("source URL trusts canonical/request origins, strips query and fragment, and rejects other schemes", () => {
  assert.equal(getAdsSourceUrl("https://kremisi.com/it/contacts?email=private#x", "https://proxy.example", "it"), "https://kremisi.com/it/contacts");
  assert.equal(getAdsSourceUrl("http://localhost:3000/en/contacts?q=x#x", "http://localhost:3000", "en"), "http://localhost:3000/en/contacts");
  for (const url of ["https://evil.example/path", "javascript:alert(1)", "data:text/plain,x", "https://user:pass@kremisi.com/en/contacts", "bad", undefined]) {
    assert.equal(getAdsSourceUrl(url, "https://proxy.example", "it"), "https://kremisi.com/it/contacts");
  }
});

test("confirmed contact conversion pairs Pixel ID/event ID, hashes email, and uses current documented CAPI fields", () => {
  const before = Date.now();
  const conversion = createContactConversion({
    cookieHeader: `${grantedCookie}; __oppref=opaque%2F=+; __obref=browser-reference`,
    measurementConsent: true,
    sourceUrl: "https://kremisi.com/en/contacts?private=1#form",
    requestOrigin: "https://kremisi.com",
    browserObref: "ignored-client-value",
    userAgent: "Test browser",
    email: " USER@example.com ",
    eventId: "contact-unique-id",
    locale: "en",
  });
  const expectedHash = createHash("sha256").update("user@example.com").digest("hex");
  assert.deepEqual(conversion.pixel, { eventId: "contact-unique-id", emailSha256: expectedHash });
  assert.equal(conversion.event.id, conversion.pixel.eventId);
  assert.equal(conversion.event.oppref, "opaque%2F=+");
  assert.deepEqual(conversion.event.user, { emails_sha256: [expectedHash], obref: "browser-reference", user_agent: "Test browser" });
  assert.equal(conversion.event.type, "lead_created");
  assert.equal(conversion.event.data.type, "customer_action");
  assert.equal(conversion.event.source_url, "https://kremisi.com/en/contacts");
  assert.equal(conversion.event.action_source, "web");
  assert.equal(conversion.event.opt_out, true);
  assert.ok(conversion.event.timestamp_ms >= before && conversion.event.timestamp_ms <= Date.now());
  assert.equal(JSON.stringify(conversion.event).includes("USER@example.com"), false);
});

// Use property descriptors so the tests also run on Node versions without a
// global window/document, and restore them after every browser scenario.
function installBrowser(t, cookie = "") {
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const originalDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  const scripts = new Map();
  const cookieJar = new Map();
  for (const part of cookie.split(";").filter(Boolean)) {
    const index = part.indexOf("=");
    cookieJar.set(part.slice(0, index).trim(), part.slice(index + 1));
  }
  const browser = new EventTarget();
  browser.location = new URL("https://kremisi.com/it/contacts?private=1#form");
  const document = {
    get cookie() { return Array.from(cookieJar, ([key, value]) => `${key}=${value}`).join("; "); },
    set cookie(value) {
      const first = value.split(";")[0];
      const index = first.indexOf("=");
      cookieJar.set(first.slice(0, index), first.slice(index + 1));
    },
    getElementById: (id) => scripts.get(id),
    createElement: () => ({ remove() { scripts.delete(this.id); } }),
    head: { appendChild(script) { scripts.set(script.id, script); } },
  };
  Object.defineProperty(globalThis, "window", { configurable: true, value: browser });
  Object.defineProperty(globalThis, "document", { configurable: true, value: document });
  t.after(() => {
    if (originalWindow) Object.defineProperty(globalThis, "window", originalWindow);
    else delete globalThis.window;
    if (originalDocument) Object.defineProperty(globalThis, "document", originalDocument);
    else delete globalThis.document;
  });
  return { browser, scripts, cookieJar };
}

test("Pixel stays unloaded before consent and initializes once across SPA navigation", (t) => {
  const { browser, scripts } = installBrowser(t);
  trackOpenAIAdsPage("/it");
  trackOpenAIAdsLead({ eventId: "lead" });
  assert.equal(scripts.size, 0);
  assert.equal(browser.oaiq, undefined);
  setAdsConsent(true);
  trackOpenAIAdsPage("/it");
  trackOpenAIAdsPage("/it");
  trackOpenAIAdsPage("/it/contacts");
  assert.equal(scripts.size, 1);
  assert.equal(browser.oaiq.q.filter(([command, options]) => command === "init" && options.pixelId === OPENAI_ADS_PIXEL_ID).length, 1);
  assert.equal(browser.oaiq.q.filter(([command, name]) => command === "measure" && name === "page_viewed").length, 2);
  assert.deepEqual(browser.oaiq.q.slice(0, 2), [["consent", false], ["init", { pixelId: OPENAI_ADS_PIXEL_ID }]]);
});

test("lead matching uses a late init, opt-out, and one event per server event ID", (t) => {
  const { browser } = installBrowser(t, grantedCookie);
  const conversion = { eventId: "lead-1", emailSha256: "a".repeat(64) };
  trackOpenAIAdsLead(conversion);
  trackOpenAIAdsLead(conversion);
  const measures = browser.oaiq.q.filter(([command]) => command === "measure");
  assert.deepEqual(measures, [["measure", "lead_created", { type: "customer_action" }, { event_id: "lead-1", opt_out: true }]]);
  assert.ok(browser.oaiq.q.some(([command, data]) => command === "init" && data.user?.email_sha256 === conversion.emailSha256 && !data.pixelId));
});

test("revocation purges queued events and user data, blocks future calls, and allows later consent", (t) => {
  const { browser } = installBrowser(t, grantedCookie);
  trackOpenAIAdsLead({ eventId: "lead-1", emailSha256: "a".repeat(64) });
  setAdsConsent(false);
  assert.deepEqual(browser.oaiq.q[0], ["consent", false]);
  assert.equal(browser.oaiq.q.some(([command, data]) => command === "measure" || data?.user), false);
  const calls = browser.oaiq.q.length;
  trackOpenAIAdsPage("/it/contacts");
  assert.equal(trackOpenAIAdsContent("project", "Project"), false);
  assert.equal(browser.oaiq.q.length, calls);
  setAdsConsent(true);
  trackOpenAIAdsPage("/it/contacts");
  assert.equal(browser.oaiq.q.filter(([command, data]) => command === "init" && data.pixelId).length, 1);
  assert.ok(browser.oaiq.q.some(([command]) => command === "measure"));
});

test("form context sends only sanitized current page and raw browser reference after consent", (t) => {
  installBrowser(t, `${grantedCookie}; __obref=raw%2F=+`);
  const form = new FormData();
  appendOpenAIAdsContext(form);
  assert.equal(form.get("openaiAdsSourceUrl"), "https://kremisi.com/it/contacts");
  assert.equal(form.get("openaiAdsObref"), "raw%2F=+");
  assert.equal(form.get("openaiAdsConsent"), ADS_CONSENT_GRANTED);
  setAdsConsent(false);
  appendOpenAIAdsContext(form);
  assert.equal(form.has("openaiAdsSourceUrl"), false);
  assert.equal(form.has("openaiAdsConsent"), false);
});

test("browser tracking failures cannot throw into the contact flow", (t) => {
  installBrowser(t, grantedCookie);
  window.oaiq = () => { throw new Error("SDK failure"); };
  assert.doesNotThrow(() => trackOpenAIAdsLead({ eventId: "lead" }));
  assert.doesNotThrow(() => trackOpenAIAdsPage("/it"));
  assert.doesNotThrow(() => appendOpenAIAdsContext(null));
});

test("CAPI is disabled without its server secret and suppresses network/serialization failures", async (t) => {
  const originalKey = process.env.OPENAI_ADS_CONVERSIONS_API_KEY;
  const originalValidate = process.env.OPENAI_ADS_VALIDATE_ONLY;
  t.after(() => {
    if (originalKey === undefined) delete process.env.OPENAI_ADS_CONVERSIONS_API_KEY;
    else process.env.OPENAI_ADS_CONVERSIONS_API_KEY = originalKey;
    if (originalValidate === undefined) delete process.env.OPENAI_ADS_VALIDATE_ONLY;
    else process.env.OPENAI_ADS_VALIDATE_ONLY = originalValidate;
  });
  delete process.env.OPENAI_ADS_CONVERSIONS_API_KEY;
  const fetchMock = t.mock.method(globalThis, "fetch", async () => ({ ok: true }));
  await sendContactConversion({ id: "lead" });
  assert.equal(fetchMock.mock.callCount(), 0);
  process.env.OPENAI_ADS_CONVERSIONS_API_KEY = "placeholder";
  delete process.env.OPENAI_ADS_VALIDATE_ONLY;
  await sendContactConversion({ id: "lead" });
  const [url, request] = fetchMock.mock.calls[0].arguments;
  assert.equal(url, `https://bzr.openai.com/v1/events?pid=${OPENAI_ADS_PIXEL_ID}`);
  assert.equal(JSON.parse(request.body).validate_only, false);
  assert.equal(request.signal instanceof AbortSignal, true);
  process.env.OPENAI_ADS_VALIDATE_ONLY = "true";
  await sendContactConversion({ id: "lead" });
  assert.equal(JSON.parse(fetchMock.mock.calls[1].arguments[1].body).validate_only, true);
  fetchMock.mock.mockImplementation(async () => { throw new Error("network failure"); });
  t.mock.method(console, "warn", () => {});
  await assert.doesNotReject(() => sendContactConversion({ id: "lead" }));
  const cyclic = {}; cyclic.self = cyclic;
  await assert.doesNotReject(() => sendContactConversion(cyclic));
});
