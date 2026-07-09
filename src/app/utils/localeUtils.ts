/**
 * Locale Utilities
 * 语言/区域相关工具函数
 */

/**
 * 判断是否为中文区域 (简体/繁体)
 * Check if locale is Chinese (Simplified or Traditional)
 */
export const isChineseLocale = (locale: string): boolean => {
  return locale === "zh" || locale === "zh-hant";
};
