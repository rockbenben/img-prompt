import { BgColorsOutlined, BulbOutlined, ExperimentOutlined, ToolOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

interface MenuItem {
  titleKey?: string;
  title?: string;
  key: string;
  icon: React.ReactNode;
  href?: string;
  isExternal?: boolean;
  onlyzh?: boolean;
}

// 菜单项配置
const menuItems: MenuItem[] = [
  {
    title: "IMGPrompt",
    key: "app",
    icon: <BgColorsOutlined />,
  },
  {
    title: "Guide",
    key: "guide",
    icon: <BulbOutlined />,
    isExternal: true,
  },
  {
    title: "ChatGPT Shortcut",
    key: "aishort",
    icon: <ExperimentOutlined />,
    isExternal: true,
  },
  {
    title: "Tools By AI",
    key: "tools",
    icon: <ToolOutlined />,
    isExternal: true,
  },
  {
    titleKey: "feedback.feedback1",
    key: "feedback",
    icon: null as unknown as React.ReactNode,
  },
];

// 创建菜单项映射
const menuItemsMap = menuItems.reduce((acc: Record<string, MenuItem>, item) => {
  acc[item.key] = item;
  return acc;
}, {});

export const useAppMenu = () => {
  const t = useTranslations();
  const locale = useLocale();
  const isChineseLocale = locale === "zh" || locale === "zh-hant";

  // 获取动态链接
  const getHref = (key: string): string => {
    switch (key) {
      case "app":
        return `/${locale}`;
      case "guide":
        return `https://prompt.newzone.top/${isChineseLocale ? "" : "en/"}guide/`;
      case "aishort": {
        let aishortPath = "";
        if (locale === "zh") {
          aishortPath = "";
        } else if (locale === "zh-hant") {
          aishortPath = "zh-Hant";
        } else if (locale === "id") {
          aishortPath = "ind";
        } else {
          aishortPath = locale;
        }
        return `https://www.aishort.top/${aishortPath}`;
      }
      case "tools":
        return `https://tools.newzone.top/${locale}`;
      case "feedback":
        return `https://prompt.newzone.top/app/${locale}/feedback`;
      default:
        return "#";
    }
  };

  // 创建单个菜单项
  const createMenuItem = (itemKey: string) => {
    const item = menuItemsMap[itemKey];
    if (!item || (item.onlyzh && !isChineseLocale)) {
      return null;
    }

    const href = item.href || getHref(itemKey);
    const label = item.titleKey ? t(item.titleKey) : item.title;

    return {
      label: item.isExternal ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
          {label}
        </a>
      ) : (
        <Link href={href}>{label}</Link>
      ),
      key: item.key,
      icon: item.icon,
    };
  };

  // 生成菜单项列表
  const generateMenuItems = (keys: string[]) => {
    return keys.map(createMenuItem).filter(Boolean);
  };

  // 定义菜单顺序
  const menuOrder = isChineseLocale ? ["app", "guide", "aishort", "tools", "feedback"] : ["app", "guide", "aishort", "tools", "feedback"];

  return generateMenuItems(menuOrder);
};
