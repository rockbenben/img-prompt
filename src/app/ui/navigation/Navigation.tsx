"use client";
import React, { useState, useEffect, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layout, Menu, Space, Button, Dropdown, Flex } from "antd";
import { GithubOutlined, QqOutlined, DiscordOutlined, SunOutlined, MoonOutlined, TeamOutlined, SendOutlined } from "@ant-design/icons";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { useAppMenu } from "@/app/components/projects";
import { SOCIAL_LINKS } from "./config";
import { LanguageSelector } from "./LanguageSelector";

const { Header } = Layout;

// 图标样式
const iconStyle = { fontSize: 18 };

export function Navigation() {
  const menuItems = useAppMenu();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const locale = useLocale();
  // 顶栏几个图标按钮只有 aria-label 可读，原来全是硬编码英文——读屏用户
  // 无论界面什么语言都听到 "Community links"
  const t = useTranslations("Nav");

  // mounted 状态用于主题图标的 hydration 安全渲染（next-themes 推荐模式）
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const isChinese = locale === "zh" || locale === "zh-hant";

  const handleThemeToggle = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  // 从路径中提取当前菜单项的 key（取 locale 后的首段——guide 子页
  // 如 /zh/guide/pick-tags 也要命中 "guide"，整段 join 会丢高亮）
  const pathSegments = pathname.split("/").filter(Boolean);
  const currentMenuKey = pathSegments[1] ?? "home";

  // 主题切换图标：SSR 和 hydration 前显示 MoonOutlined，挂载后显示正确图标
  const themeIcon = mounted && resolvedTheme === "light" ? <SunOutlined style={iconStyle} /> : <MoonOutlined style={iconStyle} />;

  return (
    // 实底条通栏，条内内容收进与 <main> 同一根 1280 栏。底色/边框/栏宽必须走 inline：
    // 写进 CSS 会被 antd 同权重、后注入的样式静默盖掉（详见 globals.css 顶栏一节）。
    <Header style={{ padding: 0, background: "var(--pp-card)", borderBottom: "2px solid var(--pp-line)", height: 48, lineHeight: "48px" }}>
      <Flex className="pp-topbar" justify="space-between" align="center" style={{ maxWidth: 1280, marginInline: "auto", paddingInline: "clamp(16px, 4vw, 24px)" }}>
        <Link href={`/${locale}`} className="pp-wordmark">
          <span className="pp-blob" aria-hidden="true" />
          IMGPrompt
        </Link>
        {/* 装不下时的兜底（min-width + 横滚）在 globals.css 的 `.pp-nav` 上，别删 */}
        <nav className="pp-nav" aria-label="Primary">
          <Menu selectedKeys={[currentMenuKey]} mode="horizontal" items={menuItems} style={{ flex: 1, minWidth: 0, border: "none", background: "transparent" }} />
        </nav>
        {/* size="small"：顶栏宽度是稀缺资源，四个图标按钮收紧到 8px 间距，
            每档分辨率稳定给主导航多让出 24px。按钮各 40px 宽，不影响点击区。 */}
        <Space size="small">
          <LanguageSelector />

          <Dropdown
            trigger={["click"]}
            placement="bottomRight"
            menu={{
              items: [
                ...(isChinese
                  ? [
                      {
                        key: "qq",
                        icon: <QqOutlined />,
                        label: (
                          <a href={SOCIAL_LINKS.qq} target="_blank" rel="noopener noreferrer nofollow">
                            QQ 群
                          </a>
                        ),
                      },
                    ]
                  : []),
                {
                  key: "discord",
                  icon: <DiscordOutlined />,
                  label: (
                    <a href={SOCIAL_LINKS.discord} target="_blank" rel="noopener noreferrer nofollow">
                      Discord
                    </a>
                  ),
                },
                {
                  key: "telegram",
                  icon: <SendOutlined />,
                  label: (
                    <a href={SOCIAL_LINKS.telegram} target="_blank" rel="noopener noreferrer nofollow">
                      Telegram
                    </a>
                  ),
                },
              ],
            }}>
            <Button type="text" icon={<TeamOutlined style={iconStyle} />} aria-label={t("community")} />
          </Dropdown>

          {/* 窄屏隐藏（见 globals.css）：页脚已有同一入口，让位给主导航 */}
          <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="pp-nav-github">
            <Button type="text" icon={<GithubOutlined style={iconStyle} />} aria-label={t("github")} />
          </a>

          <Button type="text" icon={themeIcon} onClick={handleThemeToggle} aria-label={t("theme")} />
        </Space>
      </Flex>
    </Header>
  );
}

export default memo(Navigation);
