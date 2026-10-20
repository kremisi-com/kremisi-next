"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ADS_CONSENT_EVENT } from "@/lib/openai-ads-config.mjs";
import { trackOpenAIAdsPage, trackOpenAIAdsContent } from "@/lib/openai-ads-browser.mjs";

export default function OpenAIAds() {
  const pathname = usePathname();

  useEffect(() => {
    function sync() {
      trackOpenAIAdsPage(pathname);
    }
    sync();
    window.addEventListener(ADS_CONSENT_EVENT, sync);
    return () => window.removeEventListener(ADS_CONSENT_EVENT, sync);
  }, [pathname]);

  return null;
}

export function OpenAIAdsContentView({ id, name }) {
  const pathname = usePathname();
  const measuredPath = useRef(null);
  useEffect(() => {
    function measure() {
      if (measuredPath.current === pathname) return;
      if (trackOpenAIAdsContent(id, name)) measuredPath.current = pathname;
    }
    measure();
    window.addEventListener(ADS_CONSENT_EVENT, measure);
    return () => window.removeEventListener(ADS_CONSENT_EVENT, measure);
  }, [id, name, pathname]);
  return null;
}
