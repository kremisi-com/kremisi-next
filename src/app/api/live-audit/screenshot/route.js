import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import { NextResponse } from "next/server";
import { chromium } from "playwright-core";

export const runtime = "nodejs";

const SCREENSHOT_WIDTH = 1440;
const SCREENSHOT_HEIGHT = 900;
const BROWSERLESS_TIMEOUT_MS = 20_000;
const DEFAULT_BROWSERLESS_BASE_URL = "https://production-sfo.browserless.io";

function normalizeAuditUrl(input) {
  const trimmed = typeof input === "string" ? input.trim() : "";

  if (!trimmed) {
    throw new Error("Enter a website URL to preview.");
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  const parsedUrl = new URL(withProtocol);

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("Only HTTP and HTTPS URLs can be previewed.");
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new Error("URLs with credentials cannot be previewed.");
  }

  if (!parsedUrl.hostname.includes(".") && parsedUrl.hostname !== "localhost") {
    throw new Error("Enter a valid website URL to preview.");
  }

  return parsedUrl;
}

function isPrivateIPv4(address) {
  const parts = address.split(".").map((part) => Number(part));

  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part))) {
    return true;
  }

  const [first, second] = parts;

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    first >= 224 ||
    (first === 100 && second >= 64 && second <= 127) ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168) ||
    (first === 198 && (second === 18 || second === 19))
  );
}

function isPrivateIPv6(address) {
  const normalized = address.toLowerCase();

  return (
    normalized === "::1" ||
    normalized === "::" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:") ||
    normalized.startsWith("::ffff:127.") ||
    normalized.startsWith("::ffff:10.") ||
    normalized.startsWith("::ffff:192.168.")
  );
}

function isBlockedAddress(address) {
  const ipVersion = isIP(address);

  if (ipVersion === 4) {
    return isPrivateIPv4(address);
  }

  if (ipVersion === 6) {
    return isPrivateIPv6(address);
  }

  return true;
}

async function assertPublicHostname(hostname) {
  const normalizedHostname = hostname.toLowerCase();

  if (
    normalizedHostname === "localhost" ||
    normalizedHostname.endsWith(".localhost")
  ) {
    throw new Error("Localhost URLs cannot be previewed.");
  }

  if (isIP(normalizedHostname)) {
    if (isBlockedAddress(normalizedHostname)) {
      throw new Error("Private network URLs cannot be previewed.");
    }

    return;
  }

  const addresses = await lookup(normalizedHostname, { all: true });

  if (!addresses.length || addresses.some(({ address }) => isBlockedAddress(address))) {
    throw new Error("Private network URLs cannot be previewed.");
  }
}

function getBrowserlessWebSocketEndpoint() {
  const baseUrl =
    process.env.BROWSERLESS_BASE_URL || DEFAULT_BROWSERLESS_BASE_URL;
  const endpoint = new URL(baseUrl);

  endpoint.protocol = endpoint.protocol === "http:" ? "ws:" : "wss:";
  endpoint.searchParams.set("token", process.env.BROWSERLESS_API_KEY);

  return endpoint.toString();
}

function createErrorResponse(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

async function autoScrollPage(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      const distance = Math.max(240, Math.floor(window.innerHeight * 0.75));
      const delay = 260;
      let totalHeight = 0;
      let stalledSteps = 0;
      let previousScrollHeight = document.documentElement.scrollHeight;

      const timer = window.setInterval(() => {
        window.scrollBy(0, distance);
        totalHeight += distance;

        const currentScrollHeight = document.documentElement.scrollHeight;
        const reachedBottom =
          window.scrollY + window.innerHeight >= currentScrollHeight - 4;

        if (currentScrollHeight === previousScrollHeight) {
          stalledSteps += 1;
        } else {
          stalledSteps = 0;
          previousScrollHeight = currentScrollHeight;
        }

        if (reachedBottom || totalHeight > 40_000 || stalledSteps > 8) {
          window.clearInterval(timer);
          resolve();
        }
      }, delay);
    });
  });
}

function withTimeout(promise, timeoutMs) {
  let timeout;

  const timeoutPromise = new Promise((_, reject) => {
    timeout = setTimeout(() => {
      const error = new Error("The screenshot request timed out.");
      error.name = "TimeoutError";
      reject(error);
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeout);
  });
}

async function captureFullPageScreenshot(normalizedUrl) {
  let browser;
  let context;

  try {
    browser = await chromium.connectOverCDP(getBrowserlessWebSocketEndpoint());
    context = await browser.newContext({
      viewport: {
        width: SCREENSHOT_WIDTH,
        height: SCREENSHOT_HEIGHT,
      },
      deviceScaleFactor: 1,
      reducedMotion: "reduce",
    });

    const page = await context.newPage();

    await page.goto(normalizedUrl.toString(), {
      waitUntil: "domcontentloaded",
      timeout: 15_000,
    });

    await page.waitForLoadState("networkidle", { timeout: 7_500 }).catch(() => {});
    await page.waitForTimeout(900);
    await autoScrollPage(page);
    await page.waitForTimeout(900);
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);

    const screenshot = await page.screenshot({
      fullPage: true,
      type: "jpeg",
      quality: 82,
      timeout: 10_000,
    });

    const screenshotSize = await page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
    }));

    return {
      screenshot,
      width: screenshotSize.width || SCREENSHOT_WIDTH,
      height: screenshotSize.height || SCREENSHOT_HEIGHT,
    };
  } finally {
    if (context) {
      await context.close().catch(() => {});
    }

    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

export async function POST(request) {
  let payload;

  try {
    payload = await request.json();
  } catch {
    return createErrorResponse("Invalid request body.");
  }

  let normalizedUrl;

  try {
    normalizedUrl = normalizeAuditUrl(payload?.url);
    await assertPublicHostname(normalizedUrl.hostname);
  } catch (error) {
    return createErrorResponse(error.message);
  }

  const browserlessApiKey = process.env.BROWSERLESS_API_KEY;

  if (!browserlessApiKey) {
    return createErrorResponse("Browserless is not configured.", 500);
  }

  try {
    const { screenshot, width, height } = await withTimeout(
      captureFullPageScreenshot(normalizedUrl),
      BROWSERLESS_TIMEOUT_MS,
    );

    return NextResponse.json({
      image: `data:image/jpeg;base64,${screenshot.toString("base64")}`,
      url: normalizedUrl.toString(),
      width,
      height,
      viewportHeight: SCREENSHOT_HEIGHT,
    });
  } catch (error) {
    if (error.name === "TimeoutError") {
      return createErrorResponse("The screenshot request timed out.", 504);
    }

    return createErrorResponse("The screenshot could not be generated.", 502);
  }
}
