import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale, request }) => {
    let requestedLocale = typeof locale === "string" ? locale : undefined;

    if (requestedLocale === "undefined" || !requestedLocale) {
        const url = request ? new URL(request.url) : null;
        const pathLocale = url?.pathname.split("/")[1];

        requestedLocale = hasLocale(routing.locales, pathLocale)
            ? pathLocale
            : undefined;
    }

    const resolvedLocale =
        requestedLocale && hasLocale(routing.locales, requestedLocale)
            ? requestedLocale
            : routing.defaultLocale;

    console.log("Locale selected:", resolvedLocale);

    return {
        locale: resolvedLocale,
        messages: (await import(`./messages/${resolvedLocale}.json`)).default,
    };
});
