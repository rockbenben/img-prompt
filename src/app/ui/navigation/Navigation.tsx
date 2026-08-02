"use client";
import React, { useState, useEffect, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layout, Menu, Space, Button, Dropdown, Flex } from "antd";
import { GithubOutlined, QqOutlined, DiscordOutlined, SunOutlined, MoonOutlined, TeamOutlined, SendOutlined } from "@ant-design/icons";
import { useTheme } from "next-themes";
import { useLocale } from "next-intl";
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
        <Menu selectedKeys={[currentMenuKey]} mode="horizontal" items={menuItems} style={{ flex: 1, minWidth: 0, border: "none", background: "transparent" }} />
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
            <Button type="text" icon={<TeamOutlined style={iconStyle} />} aria-label="Community links" />
          </Dropdown>

          <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer">
            <Button type="text" icon={<GithubOutlined style={iconStyle} />} aria-label="View on GitHub" />
          </a>

          <Button type="text" icon={themeIcon} onClick={handleThemeToggle} aria-label="Toggle theme" />
        </Space>
      </Flex>
    </Header>
  );
}

export default memo(Navigation);
