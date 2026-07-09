import { getTranslations } from "next-intl/server";

const SWATCHES = ["var(--pp-yolk)", "var(--pp-coral)", "var(--pp-sky)", "var(--pp-mint)"] as const;

export default async function HeroHeader({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Home" });
  return (
    <header style={{ marginBottom: 22, paddingTop: 14 }}>
      <h1 className="pp-hero-h1" style={{ margin: "0 0 10px", fontSize: "clamp(1.5rem, 3.4vw, 2.5rem)", lineHeight: 1.15 }}>
        {t.rich("h1", { hl: (chunks) => <span className="pp-hl">{chunks}</span> })}
      </h1>
      <p style={{ margin: 0, fontSize: 14, fontWeight: 500, opacity: 0.72, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
        {t("tagline")}
        <span style={{ display: "inline-flex", gap: 4 }} aria-hidden="true">
          {SWATCHES.map((c) => (
            <span key={c} className="pp-hero-swatch" style={{ background: c }} />
          ))}
        </span>
      </p>
    </header>
  );
}
