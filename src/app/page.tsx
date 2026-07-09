import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

// 裸域名根页：仅兜底跳转到默认 locale。用 next 的 redirect()（客户端软跳转，无整页白闪；
// 与 web-tools 一致）。noindex 防止爬虫索引这个无内容的中转页。
export const metadata: Metadata = {
  robots: { index: false, follow: true },
};

export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}
