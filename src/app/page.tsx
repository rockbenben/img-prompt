import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

// 裸域名根页：兜底跳转到默认 locale。noindex 防止爬虫索引这个无内容的中转页。
//
// 这里曾用 next/navigation 的 redirect()，但静态导出下它不产出任何构建期跳转手段
// （实测 out/index.html 里既无 meta refresh 也无 noscript，body 只有 Next 的 JS
// 引导负载）：跳转要等整个 bundle 下载并 hydrate 之后才发生——慢网白屏数秒、
// 禁 JS 永久白屏，而这是全站访问量最大的那个 URL。
// 同一个坑 not-found.tsx 里已经踩过并改成了 meta refresh，这里对齐同一套做法。
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function RootPage() {
  const home = `/${routing.defaultLocale}`;
  return (
    <>
      <meta httpEquiv="refresh" content={`0;url=${home}`} />
      <p style={{ fontFamily: "sans-serif", padding: 24 }}>
        <a href={home}>Redirecting…</a>
      </p>
    </>
  );
}
