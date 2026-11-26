import type { ReactNode } from "react";
import { ToolOutlined, MessageOutlined, BookOutlined, AppstoreOutlined, BulbOutlined } from "@ant-design/icons";
import { useTranslations, useLocale } from "next-intl";

// 指南与反馈链接指向主站，宽屏导航单独展示常用工具。
export const useAppMenu = () => {
  const t = useTranslations();
  const locale = useLocale();
  const isChinese = locale === "zh" || locale === "zh-hant";

  const aishortHref = locale === "zh" ? "https://www.aishort.top/" : locale === "zh-hant" ? "https://www.aishort.top/zh-Hant" : locale === "id" ? "https://www.aishort.top/ind" : `https://www.aishort.top/${locale}`;

  const ext = (key: string, href: string, label: string, icon: ReactNode) => ({
    key,
    icon,
    label: (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    ),
  });

  const otherToolsChildren = [
    ext("aishort", aishortHref, t("Nav.aishort"), <BulbOutlined />),
    ext("tools", `https://tools.newzone.top/${locale}`, t("Nav.tools"), <ToolOutlined />),
    ext("legendtalk", `https://talk.newzone.top/${locale}`, t("Nav.legendtalk"), <MessageOutlined />),
    ...(isChinese ? [ext("learndata", "https://newzone.top/", t("Nav.learndata"), <BookOutlined />)] : []),
    // 365 站只有中/英两语（SPA）。站内语言决策链：?lang= > localStorage > 浏览器语言；
    // 参数最高优先，显式传参才能让落地语言跟随本站，而不是访客的浏览器。
    ext("hub365", `https://365.aishort.top/?lang=${locale.startsWith("zh") ? "zh" : "en"}`, t("Nav.hub365"), <AppstoreOutlined />),
  ];

  return [
    ext("guide", `https://prompt.newzone.top/${locale}/guide`, t("Nav.guide"), undefined),
    { key: "otherTools", icon: <AppstoreOutlined />, label: t("Nav.otherTools"), children: otherToolsChildren },
    ext("feedback", `https://prompt.newzone.top/${locale}/feedback`, t("feedback.feedback1"), undefined),
  ];
};
