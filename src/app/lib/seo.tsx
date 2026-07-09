export const SITE_URL = "https://prompt.newzone.top";
export const SITE_NAME = "IMGPrompt";
export const REPO_URL = "https://github.com/rockbenben/img-prompt";
export const AUTHOR = { name: "RockBen", url: "https://github.com/rockbenben" };

const OG_LOCALE: Record<string, string> = {
  en: "en_US", zh: "zh_CN", "zh-hant": "zh_TW",
  pt: "pt_BR", es: "es_ES", hi: "hi_IN", ar: "ar_AR",
  fr: "fr_FR", de: "de_DE", ja: "ja_JP", ko: "ko_KR",
  ru: "ru_RU", vi: "vi_VN", tr: "tr_TR", bn: "bn_IN",
  id: "id_ID", it: "it_IT", th: "th_TH",
};

const BCP47: Record<string, string> = {
  zh: "zh-Hans",
  "zh-hant": "zh-Hant",
};

export const ogLocale = (locale: string) => OG_LOCALE[locale] ?? locale;
export const bcp47 = (locale: string) => BCP47[locale] ?? locale;
