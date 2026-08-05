import { getTranslations } from "next-intl/server";

const SWATCHES = ["var(--pp-yolk)", "var(--pp-coral)", "var(--pp-sky)", "var(--pp-mint)"] as const;

export default async function HeroHeader({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Home" });
  return (
    <header style={{ marginBottom: 22, paddingTop: 14 }}>
      {/* 用 px 而非 rem 做上下限：全站（含 antd 底座）都是 px，只有这里跟着
          浏览器默认字号变，结果是用户调大字号后只有标题膨胀、正文纹丝不动，
          层级被拉夸张却没有任何可读性收益。vw 项保留，流体缩放不受影响。 */}
      <h1 className="pp-hero-h1" style={{ margin: "0 0 10px", fontSize: "clamp(24px, 3.4vw, 40px)", lineHeight: 1.15 }}>
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
