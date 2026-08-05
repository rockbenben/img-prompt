"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { ConfigProvider, App, theme, Layout, type ThemeConfig } from "antd";
import { ReactNode, useEffect } from "react";

// 画布本色，与 globals.css 的 --pp-canvas 一致
const CANVAS_LIGHT = "#faf9f4";
const CANVAS_DARK = "#131419";

export default function ThemesProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light">
      <AntdConfigProvider>{children}</AntdConfigProvider>
    </NextThemesProvider>
  );
}

// Pigment Lab：candy 调色板 + 墨色描边。antd 只当交互底座，
// 颜色/圆角/描边全部走 token；细节层在 globals.css 的 --pp-* 变量。
const INK = "#16171c";
const PAPER_INK = "#ecebe2";

const sharedToken: ThemeConfig["token"] = {
  fontFamily: 'var(--font-display, "Bricolage Grotesque"), -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
  borderRadius: 10,
  borderRadiusSM: 8,
  borderRadiusLG: 14,
  controlHeight: 34,
  lineWidth: 1.5,
  fontSize: 14,
};

const lightTheme: ThemeConfig = {
  cssVar: {},
  hashed: false,
  algorithm: [theme.defaultAlgorithm],
  token: {
    ...sharedToken,
    colorPrimary: INK,
    colorInfo: "#5ab8ff",
    colorSuccess: "#3dbd85",
    colorWarning: "#f4c91d",
    colorError: "#e8553d",
    colorTextBase: INK,
    colorBgBase: "#faf9f4",
    colorBgContainer: "#ffffff",
    colorBgElevated: "#ffffff",
    colorBorder: INK,
    colorBorderSecondary: "#e7e5dc",
    colorTextSecondary: "#565963",
    colorTextTertiary: "#9b9da6",
    boxShadow: "3px 3px 0 rgba(22,23,28,0.92)",
    boxShadowSecondary: "4px 4px 0 rgba(22,23,28,0.92)",
  },
  components: {
    Button: {
      fontWeight: 600,
      defaultBorderColor: INK,
      defaultShadow: "none", // 硬投影由 globals.css 统一接管（含按压动效）
      primaryShadow: "none",
      contentFontSize: 13,
    },
    Card: {
      colorBorderSecondary: INK,
      lineWidth: 2,
    },
    Segmented: {
      itemSelectedBg: INK,
      itemSelectedColor: "#faf9f4",
      trackBg: "#f0eee6",
      borderRadius: 9,
    },
    Input: {
      activeBorderColor: INK,
      hoverBorderColor: INK,
      activeShadow: "2px 2px 0 #5ab8ff",
    },
    Collapse: {
      headerPadding: "8px 4px",
      contentPadding: "8px 4px",
    },
    Tooltip: {
      colorBgSpotlight: INK,
      borderRadius: 9,
    },
    Menu: {
      horizontalItemSelectedColor: INK,
      activeBarHeight: 3,
      colorPrimary: INK,
    },
    Dropdown: {
      borderRadiusLG: 12,
    },
    Drawer: {
      borderRadiusLG: 14,
    },
  },
};

const darkTheme: ThemeConfig = {
  cssVar: {},
  hashed: false,
  algorithm: [theme.darkAlgorithm],
  token: {
    ...sharedToken,
    colorPrimary: PAPER_INK,
    colorInfo: "#4dabf5",
    colorSuccess: "#4fd09c",
    colorWarning: "#e0b813",
    colorError: "#f5704e",
    colorTextBase: PAPER_INK,
    colorBgBase: "#131419",
    colorBgContainer: "#1c1e24",
    colorBgElevated: "#22242b",
    colorBorder: "#43464e",
    colorBorderSecondary: "#2d3038",
    colorTextSecondary: "#a9abb3",
    colorTextTertiary: "#71747d",
    boxShadow: "3px 3px 0 rgba(0,0,0,0.85)",
    boxShadowSecondary: "4px 4px 0 rgba(0,0,0,0.85)",
  },
  components: {
    Button: {
      fontWeight: 600,
      defaultBorderColor: "#4a4d55",
      defaultShadow: "none",
      primaryShadow: "none",
      primaryColor: "#16171c",
      contentFontSize: 13,
    },
    Card: {
      colorBorderSecondary: "#3a3d45",
      lineWidth: 2,
    },
    Segmented: {
      itemSelectedBg: PAPER_INK,
      itemSelectedColor: "#16171c",
      trackBg: "#101115",
      borderRadius: 9,
    },
    Input: {
      activeBorderColor: PAPER_INK,
      hoverBorderColor: PAPER_INK,
      activeShadow: "2px 2px 0 #4dabf5",
    },
    Collapse: {
      headerPadding: "8px 4px",
      contentPadding: "8px 4px",
    },
    Tooltip: {
      colorBgSpotlight: "#26282f",
      borderRadius: 9,
    },
    Menu: {
      horizontalItemSelectedColor: PAPER_INK,
      activeBarHeight: 3,
      colorPrimary: PAPER_INK,
    },
    Dropdown: {
      borderRadiusLG: 12,
    },
    Drawer: {
      borderRadiusLG: 14,
    },
  },
};

function AntdConfigProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();

  // SSR 时 resolvedTheme 为 undefined，默认 light（与 defaultTheme 一致）
  const isDark = resolvedTheme === "dark";

  // 手机地址栏 / PWA 标题栏跟随实际主题。静态 meta 只能给首屏一个值，
  // 用户手动切换后必须在运行时改写，否则页面变暗而浏览器边框还亮着。
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta) meta.content = isDark ? CANVAS_DARK : CANVAS_LIGHT;
  }, [isDark]);

  return (
    <ConfigProvider theme={isDark ? darkTheme : lightTheme}>
      <App>
        <Layout style={{ minHeight: "100vh", background: "transparent" }}>{children}</Layout>
      </App>
    </ConfigProvider>
  );
}
