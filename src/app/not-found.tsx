import { routing } from "@/i18n/routing";

// Fallback for unmatched routes — go to the default locale.
// 静态导出下 redirect() 不会产出 meta refresh，404.html 会是纯空白页，
// 跳转要等全部 JS 加载并 hydrate 后才发生（慢网白屏数秒、禁 JS 永久白屏）。
// 用构建期就生效的 meta refresh + 兜底链接代替。
export default function RootNotFound() {
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
