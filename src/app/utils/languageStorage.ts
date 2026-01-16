"use client";

// 存储键名
const LANGUAGE_STORAGE_KEY = "imgprompt_preferred_language";

// 获取首选语言
export const getPreferredLanguage = (): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to get preferred language:", error);
    return null;
  }
};

// 设置首选语言
export const setPreferredLanguage = (language: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    console.log(`Language preference saved: ${language}`);
  } catch (error) {
    console.error("Failed to save preferred language:", error);
  }
};

// 清除首选语言
export const clearPreferredLanguage = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(LANGUAGE_STORAGE_KEY);
  } catch (error) {
    console.error("Failed to clear preferred language:", error);
  }
};

// 从 URL 提取当前语言
export const getCurrentLanguageFromPath = (pathname: string): string => {
  const match = pathname.match(/^\/([a-z]{2}(-[a-z]+)?)/);
  return match ? match[1] : "en"; // 默认返回英语
};

// 检查语言是否有效
export const isValidLanguage = (language: string, validLanguages: string[]): boolean => {
  return validLanguages.includes(language);
};
