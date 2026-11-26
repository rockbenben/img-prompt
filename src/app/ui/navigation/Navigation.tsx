"use client";
import React, { useState, useSyncExternalStore, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layout, Menu, Space, Button, Dropdown, Drawer, Flex } from "antd";
import { GithubOutlined, QqOutlined, DiscordOutlined, SunOutlined, MoonOutlined, TeamOutlined, SendOutlined, MenuOutlined } from "@ant-design/icons";
import { useTheme } from "next-themes";
import { useLocale, useTranslations } from "next-intl";
import { useAppMenu } from "@/app/components/projects";
import { useMounted } from "@/app/hooks/useMounted";
import { SOCIAL_LINKS } from "./config";
import { LanguageSelector } from "./LanguageSelector";
import { ToolsDropdown } from "./ToolsDropdown";

const { Header } = Layout;

// 图标样式
const iconStyle = { fontSize: 18 };

// 与 globals.css 中直达链接的显示断点一致。
const WIDE_NAV_QUERY = "(min-width: 1240px)";
const FEATURED_TOOLS = new Set(["aishort", "tools"]);

function subscribeToWideNav(onChange: () => void) {
  const query = window.matchMedia(WIDE_NAV_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

function DesktopNav({
  items, currentKey, label,
}: { items: ReturnType<typeof useAppMenu>; currentKey: string; label: string }) {
  const wideNav = useSyncExternalStore(subscribeToWideNav, () => window.matchMedia(WIDE_NAV_QUERY).matches, () => false);

  return (
    <nav className="pp-nav" aria-label={label}>
      {items.map((item) => {
        if (!("children" in item) || !item.children) {
          return <span className="pp-nav-link" data-current={item.key === currentKey || undefined} key={item.key}>{item.label}</span>;
        }

        const featured = item.children.filter((tool) => FEATURED_TOOLS.has(tool.key));
        const dropdownItems = wideNav ? item.children.filter((tool) => !FEATURED_TOOLS.has(tool.key)) : item.children;
        return (
          <React.Fragment key={item.key}>
            {featured.map((tool) => (
              <span className="pp-nav-link pp-nav-featured" key={tool.key}>
                {React.cloneElement(tool.label, undefined, tool.label.props.children, <span className="pp-ext" aria-hidden="true">↗</span>)}
              </span>
            ))}
            <ToolsDropdown label={item.label} items={dropdownItems} />
          </React.Fragment>
        );
      })}
    </nav>
  );
}

export function Navigation() {
  const menuItems = useAppMenu();
  const pathname = usePathname();
  const { resolvedTheme, setTheme } = useTheme();
  const locale = useLocale();
  // 顶栏几个图标按钮只有 aria-label 可读，原来全是硬编码英文——读屏用户
  // 无论界面什么语言都听到 "Community links"
  const t = useTranslations("Nav");

  // mounted 状态用于主题图标的 hydration 安全渲染（next-themes 推荐模式）
  const mounted = useMounted();

  const isChinese = locale === "zh" || locale === "zh-hant";

  const [drawerOpen, setDrawerOpen] = useState(false);

  // 路由变化时关抽屉，走渲染期派生（React「prop 变化时调整 state」模式）：
  // 若挂在 Menu.onClick 上，内部链接会先导航、抽屉在 newly mounted 页面上多留一帧，
  // 表现为闪烁。React 丢弃进行中的渲染并立即以新 state 重跑，不需要 effect。
  const [prevPathname, setPrevPathname] = useState(pathname);
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setDrawerOpen(false);
  }

  // 抽屉从触发它的一侧滑出。antd 的 placement 是物理方向，不会随 dir=rtl 翻面：
  // 写死 "left" 的话，阿拉伯语用户点右上角汉堡，菜单会从左边滑出来。
  // RTL 口径与 [locale]/layout.tsx 的 RTL_LOCALES 一致（18 语言里只有 ar）。
  const drawerSide = locale === "ar" ? "right" : "left";

  const handleThemeToggle = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };

  // 从路径中提取当前菜单项的 key（取 locale 后的首段——guide 子页
  // 如 /zh/guide/pick-tags 也要命中 "guide"，整段 join 会丢高亮）
  const pathSegments = pathname.split("/").filter(Boolean);
  const currentMenuKey = pathSegments[1] ?? "home";

  // 主题切换图标：SSR 和 hydration 前显示 MoonOutlined，挂载后显示正确图标
  const themeIcon = mounted && resolvedTheme === "dark" ? <SunOutlined style={iconStyle} /> : <MoonOutlined style={iconStyle} />;

  return (
    <Header className="pp-site-header" data-compact-nav={menuItems.length <= 3 || undefined}>
      <Flex className="pp-topbar" justify="space-between" align="center">
        <Flex align="center" className="pp-nav-left" style={{ flex: 1, minWidth: 0 }}>
          {/* 汉堡/横排的取舍交给 CSS 媒体查询（.pp-nav 一节），不走 JS 断点 */}
          <Button
            className="pp-nav-burger"
            type="text"
            icon={<MenuOutlined style={iconStyle} />}
            onClick={() => setDrawerOpen(true)}
            aria-label={t("primary")}
            aria-haspopup="true"
            aria-expanded={drawerOpen}
          />
          <Link href={`/${locale}`} className="pp-wordmark" aria-current={currentMenuKey === "home" ? "page" : undefined}>
            <span className="pp-brand-mark" aria-hidden="true" />
            IMGPrompt
          </Link>
          <DesktopNav key={pathname} items={menuItems} currentKey={currentMenuKey} label={t("primary")} />
        </Flex>
        {/* 抽屉按需渲染，未打开时不挂载 rc-drawer / Menu 节点 */}
        {drawerOpen && (
        <Drawer
          title={t("primary")}
          placement={drawerSide}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          closable={{ "aria-label": t("close") }}
          destroyOnHidden
          styles={{ body: { padding: 0 } }}>
          <nav aria-label={t("primary")}>
            {/* onClick 只为外部链接兜底（点外链不改 pathname，路由派生接不住）；
                内部链接此刻已被 pathname 派生关掉，这里再 set false 是无操作 */}
            <Menu selectedKeys={[currentMenuKey]} defaultOpenKeys={["otherTools"]} mode="inline" items={menuItems} style={{ border: "none" }} onClick={() => setDrawerOpen(false)} />
          </nav>
        </Drawer>
        )}
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
                            {t("qq")}
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
          <Button href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer" className="pp-nav-github" type="text" icon={<GithubOutlined style={iconStyle} />} aria-label={t("github")} />

          <Button type="text" icon={themeIcon} onClick={handleThemeToggle} aria-label={t("theme")} />
        </Space>
      </Flex>
    </Header>
  );
}

export default memo(Navigation);
