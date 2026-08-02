/**
 * Navigation Configuration Constants
 * 导航栏配置常量 - 方便复用到其他项目
 */
import { routing } from "@/i18n/routing";

// ============ 语言配置 ============

export interface Language {
  key: string;
  label: string;
}

// 键序 = 语言选择器展示顺序；是否展示由 routing.locales 决定——
// 新增语言只改 routing.ts + 这里的名称，buildWithLang 单语言构建也会自动只剩一项。
const LABELS: Record<string, string> = {
  zh: "中文",
  en: "English",
  es: "Español",
  hi: "हिन्दी",
  ar: "العربية",
  pt: "Português",
  fr: "Français",
  de: "Deutsch",
  ja: "日本語",
  ko: "한국어",
  ru: "Русский",
  vi: "Tiếng Việt",
  th: "ไทย",
  tr: "Türkçe",
  "zh-hant": "繁體中文",
  bn: "বাংলা",
  id: "Indonesia",
  it: "Italiano",
};

export const LANGUAGES: readonly Language[] = Object.keys(LABELS)
  .filter((key) => (routing.locales as readonly string[]).includes(key))
  .map((key) => ({ key, label: LABELS[key] }));

// ============ 社交链接配置 ============

/**
 * 社交链接配置
 * Social links configuration
 */
export const SOCIAL_LINKS = {
  github: "https://github.com/rockbenben/img-prompt",
  discord: "https://discord.gg/PZTQfJ4GjX",
  telegram: "https://t.me/aishort_top",
  qq: "https://qm.qq.com/q/uWsUSnyivm",
} as const;
