import type { ReactNode } from "react";
import { ExperimentOutlined, ToolOutlined, AppstoreOutlined, MessageOutlined, BookOutlined } from "@ant-design/icons";
import { useTranslations, useLocale } from "next-intl";

// 导航菜单（桌面/打包版）：本站入口（指南/反馈，外链至线上网站）+ 姊妹工具。
// 外露：指南 · AI Short · AI 工具箱 · 反馈；「更多工具」收 LegendTalk / LearnData(zh) / 365 总入口。全部走 i18n。
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

  // 与 web 仓对齐：单项按 star 说话，系列总入口（hub365）垫后。
  const otherToolsChildren = [
    ext("legendtalk", `https://talk.newzone.top/${locale}`, t("Nav.legendtalk"), <MessageOutlined />),
    ...(isChinese ? [ext("learndata", "https://newzone.top/", "LearnData 开源笔记", <BookOutlined />)] : []),
    // 365 站只有中/英两语（SPA，?lang= 切换，无参默认中文）：简中给 zh，其余一律 en
    ext("hub365", `https://365.aishort.top/?lang=${locale === "zh" ? "zh" : "en"}`, t("Nav.hub365"), <AppstoreOutlined />),
  ];

  return [
    ext("guide", `https://prompt.newzone.top/${locale}/guide`, t("Nav.guide"), undefined, true),
    ext("aishort", aishortHref, t("Nav.aishort"), <ExperimentOutlined />, true),
    ext("tools", `https://tools.newzone.top/${locale}`, t("Nav.tools"), <ToolOutlined />, true),
    { key: "otherTools", icon: <ToolOutlined />, label: t("Nav.otherTools"), children: otherToolsChildren },
    ext("feedback", `https://prompt.newzone.top/${locale}/feedback`, t("feedback.feedback1"), undefined, true),
  ];
};
