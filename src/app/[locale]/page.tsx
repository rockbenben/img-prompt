import { setRequestLocale } from "next-intl/server";
import HomeClient from "./HomeClient";

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { default: tagsData } = await import(`@/app/data/prompt/prompt-${locale}.json`);
  return <HomeClient tagsData={tagsData} />;
}
