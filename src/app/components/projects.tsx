import { useMemo } from "react";
import Link from "next/link";
import { ThunderboltOutlined, BgColorsOutlined, BulbOutlined, ExperimentOutlined, ToolOutlined } from "@ant-design/icons";
import { useTranslations, useLocale } from "next-intl";

export const AppMenu = () => {
  const t = useTranslations();
  const locale = useLocale();
  const isChineseLocale = locale === "zh" || locale === "zh-hant";

  // 使用 useMemo 缓存计算结果，避免每次渲染重新计算
  const menuItems = useMemo(() => {
    // 定义基础菜单项
    const baseMenuItems = [
      {
        label: <Link href={`/${locale}`}>IMGPrompt</Link>,
        key: "app",
        icon: <BgColorsOutlined />,
      },
      {
        label: (
          <a href={`https://prompt.newzone.top/${isChineseLocale ? "" : "en/"}guide/`} target="_blank" rel="noopener noreferrer">
            Guide
          </a>
        ),
        key: "guide",
        icon: <BulbOutlined />,
      },
      {
        label: (
          <a href={`https://www.aishort.top/${isChineseLocale ? "" : locale}`} target="_blank" rel="noopener noreferrer">
            ChatGPT Shortcut
          </a>
        ),
        key: "aishort",
        icon: <ExperimentOutlined />,
      },
      {
        label: (
          <a href={`https://tools.newzone.top/${locale}`} target="_blank" rel="noopener noreferrer">
            Tools By AI
          </a>
        ),
        key: "tools",
        icon: <ToolOutlined />,
      },
      {
        label: <Link href={`https://prompt.newzone.top/app/${locale}/feedback`}>{t("feedback.feedback1")}</Link>,
        key: "feedback",
      },
    ];

    // 中文专有菜单项
    const chineseOnlyItem = {
      label: (
        <a href="https://newzone.top/posts/2022-09-05-stable_diffusion_ai_painting.html" target="_blank" rel="noopener noreferrer">
          Stable Diffusion 入门教程
        </a>
      ),
      key: "stable-diffusion",
      icon: <ThunderboltOutlined />,
    };

    // 根据语言条件组装菜单项
    return isChineseLocale
      ? [
          ...baseMenuItems.slice(0, 2), // IMGPrompt 和 Guide
          chineseOnlyItem, // Stable Diffusion 教程
          ...baseMenuItems.slice(2), // 其余项目
        ]
      : baseMenuItems;
  }, [locale, t, isChineseLocale]);

  return menuItems;
};
