import createMiddleware from "next-intl/middleware";
import { routing } from "./src/i18n/routing";

export default createMiddleware(routing);

export const config = {
    // intercetta tutto tranne file statici e API
    matcher: ["/((?!api|_next|.*\\..*).*)"],
};
