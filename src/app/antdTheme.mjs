// @ts-check
import { theme } from "antd";

export const ANTD_CSS_VAR_KEY = "imgprompt-antd";

// Studio Calm：克制分层表面 + 1px 细腻描边 + 单一钴蓝主色。antd 只作交互底座，
// 颜色/圆角/描边走 token；细节层在 globals.css 的 --pp-* 变量。
const INK = "#111827";
const PAPER_INK = "#eef1f6";

/** @type {import("antd").ThemeConfig["token"]} */
const sharedToken = {
  fontFamily: 'var(--font-display, "Plus Jakarta Sans"), -apple-system, "PingFang SC", "Microsoft YaHei", sans-serif',
  borderRadius: 10,
  borderRadiusSM: 8,
  borderRadiusLG: 14,
  controlHeight: 34,
  lineWidth: 1,
  fontSize: 14,
};

/** @type {import("antd").ThemeConfig} */
const lightTheme = {
  cssVar: { key: ANTD_CSS_VAR_KEY },
  hashed: false,
  algorithm: [theme.defaultAlgorithm],
  token: {
    ...sharedToken,
    colorPrimary: "#2563eb",
    colorInfo: "#2563eb",
    colorSuccess: "#059669",
    colorWarning: "#d97706",
    colorError: "#dc2626",
    colorTextBase: INK,
    colorBgBase: "#f6f7f9",
    colorBgContainer: "#ffffff",
    colorBgElevated: "#ffffff",
    colorBorder: "#e2e6ee",
    colorBorderSecondary: "#e2e6ee",
    colorTextSecondary: "#4b5563",
    colorTextTertiary: "#8b93a1",
    boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)",
    boxShadowSecondary: "0 6px 20px rgba(15, 23, 42, 0.07), 0 1px 2px rgba(15, 23, 42, 0.04)",
  },
  components: {
    Button: {
      fontWeight: 500,
      defaultBorderColor: "#e2e6ee",
      defaultShadow: "none",
      primaryShadow: "none",
      primaryColor: "#ffffff",
      contentFontSize: 13,
    },
    Segmented: {
      itemSelectedBg: "#ffffff",
      itemSelectedColor: INK,
      trackBg: "#f0f2f6",
      borderRadius: 8,
    },
    Input: {
      activeBorderColor: "#2563eb",
      hoverBorderColor: "#cbd2df",
      activeShadow: "0 0 0 2px rgba(37, 99, 235, 0.14)",
    },
    Collapse: {
      headerPadding: "8px 0",
      contentPadding: "8px 0",
    },
    Tooltip: {
      colorBgSpotlight: INK,
      borderRadius: 8,
    },
    Menu: {
      horizontalItemSelectedColor: "#2563eb",
      activeBarHeight: 2,
      colorPrimary: "#2563eb",
    },
    Dropdown: {
      borderRadiusLG: 12,
    },
    Drawer: {
      borderRadiusLG: 14,
    },
  },
};

/** @type {import("antd").ThemeConfig} */
const darkTheme = {
  cssVar: { key: ANTD_CSS_VAR_KEY },
  hashed: false,
  algorithm: [theme.darkAlgorithm],
  token: {
    ...sharedToken,
    colorPrimary: "#60a5fa",
    colorInfo: "#60a5fa",
    colorSuccess: "#34d399",
    colorWarning: "#fbbf24",
    colorError: "#f87171",
    colorTextBase: PAPER_INK,
    colorBgBase: "#0d1016",
    colorBgContainer: "#141821",
    colorBgElevated: "#1c222e",
    colorBorder: "#252c3a",
    colorBorderSecondary: "#252c3a",
    colorTextSecondary: "#9aa3b2",
    colorTextTertiary: "#697282",
    boxShadow: "0 1px 2px rgba(0, 0, 0, 0.28)",
    boxShadowSecondary: "0 8px 24px rgba(0, 0, 0, 0.38)",
  },
  components: {
    Button: {
      fontWeight: 500,
      defaultBorderColor: "#252c3a",
      defaultShadow: "none",
      primaryShadow: "none",
      primaryColor: "#0b1120",
      contentFontSize: 13,
    },
    Segmented: {
      itemSelectedBg: "#141821",
      itemSelectedColor: PAPER_INK,
      trackBg: "#1c222e",
      borderRadius: 8,
    },
    Input: {
      activeBorderColor: "#60a5fa",
      hoverBorderColor: "#364054",
      activeShadow: "0 0 0 2px rgba(96, 165, 250, 0.2)",
    },
    Collapse: {
      headerPadding: "8px 0",
      contentPadding: "8px 0",
    },
    Tooltip: {
      colorBgSpotlight: "#1c222e",
      borderRadius: 8,
    },
    Menu: {
      horizontalItemSelectedColor: "#60a5fa",
      activeBarHeight: 2,
      colorPrimary: "#60a5fa",
    },
    Dropdown: {
      borderRadiusLG: 12,
    },
    Drawer: {
      borderRadiusLG: 14,
    },
  },
};

/** @param {boolean} isDark */
export function antdThemeFor(isDark) {
  return isDark ? darkTheme : lightTheme;
}
