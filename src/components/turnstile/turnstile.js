"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

const TURNSTILE_SCRIPT_ID = "cloudflare-turnstile-script";
const TURNSTILE_SCRIPT_SRC =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

function loadTurnstileScript() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Turnstile requires a browser environment."));
  }

  if (window.turnstile) {
    return Promise.resolve(window.turnstile);
  }

  if (window.__turnstileLoadPromise) {
    return window.__turnstileLoadPromise;
  }

  window.__turnstileLoadPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(TURNSTILE_SCRIPT_ID);

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(window.turnstile), {
        once: true,
      });
      existingScript.addEventListener(
        "error",
        () => reject(new Error("Unable to load Turnstile script.")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = TURNSTILE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.turnstile);
    script.onerror = () => reject(new Error("Unable to load Turnstile script."));
    document.head.appendChild(script);
  });

  return window.__turnstileLoadPromise;
}

const Turnstile = forwardRef(function Turnstile(
  { className, onTokenChange, theme = "auto", size = "normal" },
  ref,
) {
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const onTokenChangeRef = useRef(onTokenChange);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    onTokenChangeRef.current = onTokenChange;
  }, [onTokenChange]);

  useEffect(() => {
    if (!siteKey || !containerRef.current) {
      return undefined;
    }

    let cancelled = false;

    loadTurnstileScript()
      .then((turnstile) => {
        if (cancelled || !containerRef.current || !turnstile) {
          return;
        }

        widgetIdRef.current = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          size,
          callback(token) {
            setLoadError("");
            onTokenChangeRef.current?.(token);
          },
          "expired-callback"() {
            onTokenChangeRef.current?.("");
          },
          "error-callback"() {
            onTokenChangeRef.current?.("");
            setLoadError("Security check unavailable. Reload and try again.");
          },
        });
      })
      .catch(() => {
        setLoadError("Security check unavailable. Reload and try again.");
      });

    return () => {
      cancelled = true;

      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, size, theme]);

  useImperativeHandle(ref, () => ({
    reset() {
      onTokenChangeRef.current?.("");

      if (window.turnstile && widgetIdRef.current !== null) {
        window.turnstile.reset(widgetIdRef.current);
      }
    },
  }));

  if (!siteKey) {
    return (
      <p className={className} role="alert">
        Turnstile site key missing.
      </p>
    );
  }

  return (
    <div className={className}>
      <div ref={containerRef} />
      {loadError ? (
        <p role="alert" style={{ marginTop: "10px", fontSize: "1.2rem" }}>
          {loadError}
        </p>
      ) : null}
    </div>
  );
});

export default Turnstile;
