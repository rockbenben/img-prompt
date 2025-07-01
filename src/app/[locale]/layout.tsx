import React from "react";
import "@/app/globals.css";
import { Navigation } from "@/app/ui/Navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getLangDir } from "rtl-detect";
import { setRequestLocale, getTranslations, getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import ThemesProvider from "@/app/ThemesProvider";
import { DataProvider } from "@/app/utils/DataContext";

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  // Ensure that the incoming `locale` is valid
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  // Enable static rendering
  setRequestLocale(locale);
  const direction = getLangDir(locale);
  const messages = await getMessages();
  const tagsData = await import(`@/app/data/prompt/prompt-${locale}.json`);
  return (
    <html lang={locale} dir={direction}>
      <body>
        <NextIntlClientProvider messages={messages}>
          <ThemesProvider>
            <Navigation />
            <div className="max-w-7xl mt-2 mx-auto p-4">
              <DataProvider data={tagsData.default}>{children}</DataProvider>
            </div>
          </ThemesProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
