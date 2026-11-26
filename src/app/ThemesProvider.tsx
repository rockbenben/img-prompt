"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { ConfigProvider, App, Layout } from "antd";
import { ReactNode, useEffect } from "react";
import { useLocale } from "next-intl";
import { antdThemeFor } from "./antdTheme.mjs";

type Props = { children: ReactNode; zeroRuntime?: boolean };

// 画布本色，与 globals.css 的 --pp-canvas 一致
const CANVAS_LIGHT = "#f6f7f9";
const CANVAS_DARK = "#0d1016";

export default function ThemesProvider({ children, zeroRuntime = false }: Props) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light">
      <AntdConfigProvider zeroRuntime={zeroRuntime}>{children}</AntdConfigProvider>
    </NextThemesProvider>
  );
}

function AntdConfigProvider({ children, zeroRuntime }: Props) {
  const { resolvedTheme } = useTheme();
  const locale = useLocale();

  // SSR 时 resolvedTheme 为 undefined，默认 light（与 defaultTheme 一致）
  const isDark = resolvedTheme === "dark";

  // 手机地址栏 / PWA 标题栏跟随实际主题。静态 meta 只能给首屏一个值，
  // 用户手动切换后必须在运行时改写，否则页面变暗而浏览器边框还亮着。
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (meta) meta.content = isDark ? CANVAS_DARK : CANVAS_LIGHT;
  }, [isDark]);

  return (
    // autoInsertSpace=false：antd 默认给「恰好两个汉字、且没有图标」的按钮中间
    // 插一个空格，于是同一排上「清 空」「翻 译」被撑开，而带图标的「复制」「负面词」
    // 不会 —— 同一组按钮两种字距，看着像没对齐。整站统一关掉。
    <ConfigProvider direction={locale === "ar" ? "rtl" : "ltr"} theme={{ ...antdThemeFor(isDark), zeroRuntime }} button={{ autoInsertSpace: false }}>
      <App>
        <Layout style={{ minHeight: "100vh", background: "transparent" }}>{children}</Layout>
      </App>
    </ConfigProvider>
  );
}
