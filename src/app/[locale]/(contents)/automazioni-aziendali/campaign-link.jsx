"use client";

import { trackEvent } from "@/lib/analytics";

export default function CampaignLink({ href, placement, className, children }) {
    return (
        <a
            href={href}
            className={className}
            onClick={() => trackEvent("automation_cta_click", {
                placement,
                destination: href,
            })}
        >
            {children}
        </a>
    );
}
