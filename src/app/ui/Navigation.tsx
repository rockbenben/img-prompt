"use client";
import React, { useState, useEffect, useContext } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Row, Col, Space, Grid, Switch, Dropdown, Button } from "antd";
import type { MenuProps } from "antd";
import { GithubOutlined, TranslationOutlined, SunOutlined, MoonOutlined } from "@ant-design/icons";
import { useTheme } from "next-themes";
import { DataContext } from "../utils/DataContext";

// Language options
const LANGUAGES = [
  { key: "en", label: "English" },
  { key: "zh", label: "中文" },
  { key: "zh-hant", label: "繁体中文" },
  { key: "pt", label: "Português" },
  { key: "it", label: "Italiano" },
  { key: "de", label: "Deutsch" },
  { key: "ru", label: "Русский" },
  { key: "es", label: "Español" },
  { key: "fr", label: "Français" },
  { key: "ja", label: "日本語" },
  { key: "ko", label: "한국어" },
  { key: "hi", label: "हिन्दी" },
  { key: "ar", label: "العربية" },
  { key: "bn", label: "বাংলা" },
];

const GITHUB_LINK = "https://github.com/rockbenben/img-prompt";
const DISCORD_LINK = "https://discord.gg/PZTQfJ4GjX";
const DISCORD_BADGE_SRC = "https://img.shields.io/discord/1048780149899939881?color=%2385c8c8&label=Discord&logo=discord&style=for-the-badge";

export function Navigation() {
  const MENU_ITEMS = useContext(DataContext);
  const pathname = usePathname();
  const router = useRouter();
  const screens = Grid.useBreakpoint();
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Extract language from pathname
  const extractLanguageFromPath = (path: string) => {
    const match = path.match(/^\/([a-z]{2}(-[a-z]+)?)/);
    return match ? match[1] : "en";
  };

  // Initialize language state based on current pathname
  const [language, setLanguage] = useState(() => extractLanguageFromPath(pathname));
  const [current, setCurrent] = useState(pathname);

  useEffect(() => {
    setMounted(true);

    // Update language if pathname changes
    const currentLang = extractLanguageFromPath(pathname);
    setLanguage(currentLang);
  }, [pathname]);

  // Avoid hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const onClick: MenuProps["onClick"] = (e) => {
    setCurrent(e.key);
  };

  // Language change handler
  const handleLanguageChange = (lang: string) => {
    const newPath = pathname.replace(/^\/[a-z]{2}(-[a-z]+)?/, `/${lang}`);
    router.push(newPath);
    setLanguage(lang);
  };

  // Language dropdown menu
  const languageMenu = {
    items: LANGUAGES.map((lang) => ({
      key: lang.key,
      label: <div onClick={() => handleLanguageChange(lang.key)}>{lang.label}</div>,
    })),
  };

  return (
    <Row
      justify="space-between"
      align="middle"
      gutter={[16, 16]}
      wrap={false}
      style={{
        width: "100%",
        backgroundColor: theme === "light" ? "#fff" : "#141414",
        padding: "0 24px",
      }}>
      <Col flex="auto">
        <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={MENU_ITEMS} />
      </Col>
      <Col>
        <Space>
          <Dropdown menu={languageMenu} placement="bottomRight">
            <Button type="text" icon={<TranslationOutlined />}>
              {LANGUAGES.find((l) => l.key === language)?.label || "English"}
            </Button>
          </Dropdown>
          <Switch checked={theme === "dark"} onChange={toggleTheme} checkedChildren={<MoonOutlined />} unCheckedChildren={<SunOutlined />} />
          {screens.md && (
            <a href={DISCORD_LINK} target="_blank" rel="noopener noreferrer">
              <img src={DISCORD_BADGE_SRC} alt="chat on Discord" style={{ height: "24px" }} />
            </a>
          )}
          <a href={GITHUB_LINK} target="_blank" rel="noopener noreferrer">
            <GithubOutlined
              style={{
                color: theme === "light" ? "#141414" : "#fff",
                fontSize: "24px",
                padding: "4px",
              }}
            />
          </a>
        </Space>
      </Col>
    </Row>
  );
}

export default Navigation;
