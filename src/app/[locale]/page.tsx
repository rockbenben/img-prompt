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
        {/* firstChunkTotal：web 仓 sliceData 裁剪 bootstrap 后 HomeClient 必填；
            standalone 自己的 sliceData 仍产出全集，?? 回退即等价「未截断」 */}
        <HomeClient
          objects={bootstrap.objects}
          attributes={bootstrap.attributes}
          firstChunk={bootstrap.firstChunk}
          firstChunkTotal={bootstrap.firstChunkTotal ?? bootstrap.firstChunk.length}
        />
      </Suspense>
    </>
  );
}
