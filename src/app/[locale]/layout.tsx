import React from "react";
import "@/app/globals.css";
import { Navigation } from "@/app/ui/navigation";
import { getLangDir } from "rtl-detect";
import { setRequestLocale, getTranslations, getMessages } from "next-intl/server";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import ThemesProvider from "@/app/ThemesProvider";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

// autocorrect: false
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  const title = t("title");
  const description = t("description");
  const ogTitle = t("ogTitle");
  const ogDescription = t("ogDescription");
  const authorName = t("authorName");
  const authorUrl = t("authorUrl");

  return {
    metadataBase: new URL(t("ogUrl")),
    title,
    description,
    author: {
      name: authorName,
      url: authorUrl,
    },
    alternates: {
      canonical: "/",
      languages: routing.locales.reduce((acc, lang) => {
        acc[lang] = `/${lang}`;
        return acc;
      }, {} as Record<string, string>),
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: "./",
      siteName: t("ogSiteName"),
      images: [
        {
          url: "og-image.png",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: ["og-image.png"],
    },
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  // Enable static rendering
  setRequestLocale(locale);
  const direction = getLangDir(locale);
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "Metadata" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        url: t("ogUrl"),
        logo: t("ogLogo"),
        name: t("ogSiteName"),
      },
      {
        "@type": "WebSite",
        url: t("ogUrl"),
        name: t("ogSiteName"),
        publisher: {
          "@type": "Organization",
          name: t("ogSiteName"),
          logo: t("ogLogo"),
        },
      },
    ],
  };

  return (
    <html lang={locale} dir={direction} suppressHydrationWarning>
      <body>
        <AntdRegistry>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
          <NextIntlClientProvider messages={messages}>
            <ThemesProvider>
              <Navigation />
              <div className="max-w-7xl mt-2 mx-auto p-4">{children}</div>
            </ThemesProvider>
          </NextIntlClientProvider>
        </AntdRegistry>
      </body>
    </html>
  );
}
