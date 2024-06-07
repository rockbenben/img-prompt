import React from "react";
import Script from "next/script";
import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "./ui/Navigation";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import ClientScripts from "./ClientScripts";

export const metadata: Metadata = {
  title: "IMGPrompt - Stable Diffusion、Midjourney 和 DALL·E 的图像提示词生成工具",
  description:
    "IMGPrompt 是一个直观的图像提示词生成工具，可以方便地在 Stable Diffusion、Midjourney 和 DALL·E 的流程中使用，使图像提示词的创建变得简单而有效，轻松激发创意并获得更好的图片结果。通过 IMGPrompt，你可以将自己的创意想法转化为视觉现实。",
  keywords: "IMGPrompt, Stable Diffusion, Midjourney, DALL·E, Image prompt generation, Visual creativity toolprompt, ai, prompt, 提示词",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hans">
      <body>
        <Navigation />
        <ClientScripts />
        <AntdRegistry>
          <main>{children}</main>
        </AntdRegistry>
        <Script src="https://oss.newzone.top/instantpage.min.js" type="module" strategy="lazyOnload" />
      </body>
    </html>
  );
}
