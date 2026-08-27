import { defineRouting } from "next-intl/routing";

// 应用【支持】的全部语言 —— 类型上的单一事实源。
export const ALL_LOCALES = ["en", "zh", "zh-hant", "pt", "es", "hi", "ar", "fr", "de", "ja", "ko", "ru", "vi", "tr", "bn", "id", "it", "th"] as const;
type AppLocale = (typeof ALL_LOCALES)[number];

// 单语言构建开关：scripts/buildWithLang.js 用它把本次【构建产出】收敛到一个 locale，
// 不再靠正则改写本文件再还原（那套办法在组件重构后会静默失效，踩过两次）。
// 不设时就是全集 —— next dev 与常规 next build 完全不受影响。
// ⚠ 必须带 NEXT_PUBLIC_ 前缀：本文件也被客户端组件 import（ui/navigation/
//   LanguageSelector 等），只有这个前缀的 process.env 会被 Next 内联进客户端 bundle。
const buildLocale = process.env.NEXT_PUBLIC_BUILD_LOCALE as AppLocale | undefined;
if (buildLocale && !(ALL_LOCALES as readonly string[]).includes(buildLocale)) {
  throw new Error(`NEXT_PUBLIC_BUILD_LOCALE="${buildLocale}" 不在 locales 里。可用：${ALL_LOCALES.join(", ")}`);
}

// 运行时可能是子集，但【类型】保持全集的联合：类型说的是「本应用支持哪些语言」，
// 数组说的是「这次构建产出哪些」，两者本就不是一回事。这样 hasLocale()、next-intl
// 的 Locale、以及各处按 locale 收窄的判断都不受影响。
const locales: readonly AppLocale[] = buildLocale ? [buildLocale] : ALL_LOCALES;

export const routing = defineRouting({
  locales,
  defaultLocale: buildLocale ?? "en",
});
