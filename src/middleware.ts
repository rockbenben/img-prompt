import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  matcher: ["/", "/(en|zh|zh-hant|pt|it|de|ru|es|fr|ja|ko|hi|ar|bn)/:path*"],
};
