import type { ReactNode } from "react";
import { ExperimentOutlined, ToolOutlined, AppstoreOutlined, MessageOutlined, CompassOutlined, BookOutlined } from "@ant-design/icons";
import { useTranslations, useLocale } from "next-intl";

// 导航菜单（桌面/打包版）：本站入口（指南/反馈，外链至线上网站）+ 姊妹工具。
// 外露：指南 · AI Short · AI 工具箱 · 反馈；「更多工具」收 LegendTalk / 千世书(zh) / LearnData(zh)。全部走 i18n。
// 全部外链，新标签页打开。
export const useAppMenu = () => {
  const t = useTranslations();
  const locale = useLocale();
  const isChinese = locale === "zh" || locale === "zh-hant";

  const aishortHref = locale === "zh" ? "https://www.aishort.top/" : locale === "zh-hant" ? "https://www.aishort.top/zh-Hant" : locale === "id" ? "https://www.aishort.top/ind" : `https://www.aishort.top/${locale}`;

  // 外链项（新标签打开；mark=true 追加 ↗）
  const ext = (key: string, href: string, label: ReactNode, icon?: ReactNode, mark = false) => ({
    key,
    icon,
    label: (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {label}
        {mark && (
          <span className="pp-ext" aria-hidden="true">
            ↗
          </span>
        )}
      </a>
    ),
  });

  const otherToolsChildren = [
    ext("legendtalk", `https://talk.newzone.top/${locale}`, t("Nav.legendtalk"), <MessageOutlined />),
    ...(isChinese
      ? [ext("lives", "https://lives.newzone.top/", "千世书 人生模拟", <CompassOutlined />), ext("learndata", "https://newzone.top/", "LearnData 开源笔记", <BookOutlined />)]
      : []),
  ];

  return [
    ext("guide", `https://prompt.newzone.top/${locale}/guide`, t("Nav.guide"), undefined, true),
    ext("aishort", aishortHref, t("Nav.aishort"), <ExperimentOutlined />, true),
    ext("tools", `https://tools.newzone.top/${locale}`, t("Nav.tools"), <ToolOutlined />, true),
    { key: "otherTools", icon: <AppstoreOutlined />, label: t("Nav.otherTools"), children: otherToolsChildren },
    ext("feedback", `https://prompt.newzone.top/${locale}/feedback`, t("feedback.feedback1"), undefined, true),
  ];
};
