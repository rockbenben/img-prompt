import Link from "next/link";
import { ThunderboltOutlined, BgColorsOutlined, BulbOutlined, ExperimentOutlined, ToolOutlined } from "@ant-design/icons";
import { useLocale } from "next-intl";
import { useTranslations } from "use-intl";

export const AppMenu = () => {
  const t = useTranslations();
  const locale = useLocale();

  const getAishortLink = () => {
    if (locale === "zh" || locale === "zh-hant") {
      return "https://www.aishort.top/";
    }
    return `https://www.aishort.top/${locale}`;
  };

  const getGuideLink = () => {
    if (locale === "zh" || locale === "zh-hant") {
      return "https://prompt.newzone.top/guide/";
    }
    return `https://prompt.newzone.top/en/guide/`;
  };

  let guideItem = [
    {
      label: <Link href={`/${locale}`}>IMGPrompt</Link>,
      key: "app",
      icon: <BgColorsOutlined />,
    },
    {
      label: (
        <a href={getGuideLink()} target="_blank" rel="noopener noreferrer">
          Guide
        </a>
      ),
      key: "guide",
      icon: <BulbOutlined />,
    },
  ];

  // Add Stable Diffusion tutorial only for Chinese locales
  if (locale === "zh" || locale === "zh-hant") {
    guideItem.push({
      label: (
        <a href="https://newzone.top/posts/2022-09-05-stable_diffusion_ai_painting.html" target="_blank" rel="noopener noreferrer">
          Stable Diffusion 入门教程
        </a>
      ),
      key: "LearnData",
      icon: <ThunderboltOutlined />,
    });
  }

  // Add remaining menu items
  const menuItems = [
    ...guideItem,
    {
      label: (
        <a href={getAishortLink()} target="_blank" rel="noopener noreferrer">
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
      key: "Tools",
      icon: <ToolOutlined />,
    },
  ];

  return menuItems;
};
