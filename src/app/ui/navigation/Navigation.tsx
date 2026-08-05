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
    <Header style={{ padding: 0, background: "transparent", height: 48, lineHeight: "48px" }}>
      <Flex className="pp-topbar" justify="space-between" align="center" style={{ padding: "0 16px" }}>
        <Link href={`/${locale}`} className="pp-wordmark">
          <span className="pp-blob" aria-hidden="true" />
          IMGPrompt
        </Link>
        {/* minWidth 保底 = antd 溢出折叠触发器（···）的宽度。设 0 时窄屏下
            Menu 会被右侧图标组挤成 12px，连折叠触发器都渲染不出来——整个主导航
            在手机上不可达。 */}
        <Menu selectedKeys={[currentMenuKey]} mode="horizontal" items={menuItems} style={{ flex: 1, minWidth: 46, border: "none", background: "transparent" }} />
        <Space size="middle">
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
