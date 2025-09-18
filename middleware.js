import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./next-intl.config";

export default createMiddleware({
    locales,
    defaultLocale,
});

export const config = {
    // Applica il middleware a tutte le route (eccetto _next e asset statici)
    matcher: ["/((?!_next|.*\\..*).*)"],
};
