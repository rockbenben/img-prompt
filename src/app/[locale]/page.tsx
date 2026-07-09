import { Suspense } from "react";
import { setRequestLocale } from "next-intl/server";
import HomeClient from "./HomeClient";
import HeroHeader from "@/app/components/HeroHeader";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { default: bootstrap } = await import(`@/app/data/prompt-bootstrap/${locale}.json`);

  return (
    <>
      <HeroHeader locale={locale} />
      <Suspense>
        <HomeClient objects={bootstrap.objects} attributes={bootstrap.attributes} firstChunk={bootstrap.firstChunk} />
      </Suspense>
    </>
  );
}
