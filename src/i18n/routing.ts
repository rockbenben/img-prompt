import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["en", "zh", "zh-hant", "pt", "es", "hi", "ar", "fr", "de", "ja", "ko", "ru", "vi", "tr", "bn", "id", "it", "th"],
  defaultLocale: "en",
});
