import { trackOpenAIAdsLead } from "./openai-ads-browser.mjs";
import { hasCookiePurpose, MEASUREMENT_PURPOSE } from "./cookie-consent.mjs";

export const GA_TRACKING_ID = "G-TK345YVSSJ";

// https://developers.google.com/analytics/devguides/collection/gtagjs/events
export const trackEvent = (action, params) => {
    if (typeof window !== "undefined" && hasCookiePurpose(MEASUREMENT_PURPOSE) && window.gtag) {
        window.gtag("event", action, params);
    }
};

// Common funnel events
export const trackLead = (params, openaiAds) => {
    trackOpenAIAdsLead(openaiAds);
    trackEvent("generate_lead", params);
};

export const trackContactFormStart = () => {
    trackEvent("contact_form_start");
};

export const trackViewContactForm = () => {
    trackEvent("view_contact_form");
};

export const trackSelectItem = (item_name, item_id) => {
    trackEvent("select_item", {
        items: [
            {
                item_name,
                item_id,
            },
        ],
    });
};

export const trackViewItemList = (item_list_name) => {
    trackEvent("view_item_list", {
        item_list_name,
    });
};
