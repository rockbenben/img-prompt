"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { ConfigProvider, App, theme } from "antd";
import { ReactNode } from "react";

export default function ThemesProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="light">
      <AntdConfigProvider>{children}</AntdConfigProvider>
    </NextThemesProvider>
  );
}

function AntdConfigProvider({ children }: { children: ReactNode }) {
  const { resolvedTheme } = useTheme();

  // 使用 resolvedTheme，SSR 时为 undefined，默认使用 light（与默认主题一致）
  const algorithms = resolvedTheme === "dark" ? [theme.darkAlgorithm] : [theme.defaultAlgorithm];

  return (
    <ConfigProvider
      theme={{
        zeroRuntime: true,
        hashed: false,
        algorithm: algorithms,
      }}>
      <App>{children}</App>
    </ConfigProvider>
  );
}
