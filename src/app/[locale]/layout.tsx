import React from "react";
import type { Viewport } from "next";
import { Plus_Jakarta_Sans, IBM_Plex_Mono } from "next/font/google";
import "@/app/antd.generated.css";
import "@/app/globals.css";
import { Navigation } from "@/app/ui/navigation";
import { setRequestLocale, getTranslations, getMessages } from "next-intl/server";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import ThemesProvider from "@/app/ThemesProvider";
import {
  SITE_URL, SITE_NAME, AUTHOR, REPO_URL,
  ogLocale, bcp47,
} from "@/app/lib/seo";

// Studio Calm 字体：Plus Jakarta Sans 配 IBM Plex Mono；
// CJK 回退系统字体（变量在 globals.css 的 --pp-font-* 中消费）
const displayFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});
const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

// 支持的 locale 里只有阿拉伯语是 RTL（hi/bn/th 均为 LTR）。
// 必须声明为 readonly string[] 再用 includes：hasLocale 的类型谓词会把 locale
// 收窄成 routing.locales 的字面量联合，buildWithLang 单语言构建下那就是单个
// 字面量，写 `locale === "ar"` 会被 TS 判为「无重叠」直接编译失败。
const RTL_LOCALES: readonly string[] = ["ar"];

// autocorrect: false
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const title = t("title");
  const description = t("description");
  const ogTitle = t("ogTitle");
  const ogDescription = t("ogDescription");

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    authors: [{ name: AUTHOR.name, url: AUTHOR.url }],
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ...routing.locales.reduce(
          (acc, lang) => {
            acc[lang] = `/${lang}`;
            return acc;
          },
          {} as Record<string, string>,
        ),
        "x-default": "/en",
      },
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: `/${locale}`,
      siteName: SITE_NAME,
      images: [{ url: "/og-image.png", width: 1280, height: 640, alt: ogTitle }],
      locale: ogLocale(locale),
      alternateLocale: routing.locales.filter((l) => l !== locale).map(ogLocale),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: ["/og-image.png"],
    },
    icons: {
      icon: { url: "/icon.png", sizes: "96x96", type: "image/png" },
      apple: { url: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#f6f7f9",
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const direction = RTL_LOCALES.includes(locale) ? "rtl" : "ltr";

  const [messages, tNav, tFooter] = await Promise.all([
    getMessages(),
    getTranslations({ locale, namespace: "Nav" }),
    getTranslations({ locale, namespace: "Footer" }),
  ]);

  // Slim payload sent to the client: only namespaces hit by `'use client'` components.
  // Server-only namespaces (Metadata, Home, About, HowTo, FAQ, Tips, Compare, Terminology, Schema)
  // stay out of the JSON inlined into HTML.
  const CLIENT_NAMESPACES = ["ToolPage", "CopyToClipboard", "ResultSection", "Nav", "feedback"] as const;
  const clientMessages = Object.fromEntries(
    CLIENT_NAMESPACES.map((ns) => [ns, (messages as Record<string, unknown>)[ns]]).filter(([, v]) => v !== undefined),
  );

  return (
    <html lang={bcp47(locale)} dir={direction} className={`${displayFont.variable} ${monoFont.variable}`} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider messages={clientMessages}>
          <ThemesProvider zeroRuntime>
            {/* 跳转链接指向可聚焦的主要内容。 */}
            <a href="#pp-main" className="pp-skip">
              {tNav("skipToPrompt")}
            </a>
            <Navigation />
            <main id="pp-main" className="pp-site-main" tabIndex={-1}>{children}</main>
            <footer className="pp-footer">
              <div className="pp-footer-inner">
                <div className="pp-footer-links">
                  <a href={REPO_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
                </div>
                <div className="pp-footer-sig">
                  <b className="pp-footer-mark">IMGPROMPT</b> · {tFooter("signature")}
                </div>
              </div>
            </footer>
          </ThemesProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
