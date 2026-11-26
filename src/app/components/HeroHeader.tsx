import { getTranslations } from "next-intl/server";

export default async function HeroHeader({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Home" });
  return (
    <header className="pp-hero">
      <h1 className="pp-hero-h1">
        {t.rich("h1", { hl: (chunks) => <span className="pp-hl">{chunks}</span> })}
      </h1>
      <p className="pp-hero-sub">{t("tagline")}</p>
    </header>
  );
}
