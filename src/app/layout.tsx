import React from "react";
import { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { Navigation } from "./ui/Navigation";

export const metadata: Metadata = {
  title: "IMGPrompt - Stable Diffusion 和 Midjourney 的图像提示词生成工具",
  description:
    "IMGPrompt 是一个直观的图像提示词生成工具，可以方便地在 Stable Diffusion 和 Midjourney 的流程中使用，使图像提示词的创建变得简单而有效，轻松激发创意并获得更好的图片结果。通过 IMGPrompt，你可以将自己的创意想法转化为视觉现实。",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='zh-Hans'>
      <body>
        <Navigation />
        <script data-ad-client="ca-pub-7585955822109216" async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"></script>
        {children}
        <Script
          id='piwik'
          dangerouslySetInnerHTML={{
            __html: `
            var _paq = window._paq = window._paq || [];
            _paq.push(['trackPageView']);
            _paq.push(['enableLinkTracking']);
            (function() {
              var u="https://piwik.seoipo.com/";
              _paq.push(['setTrackerUrl', u+'matomo.php']);
              _paq.push(['setSiteId', '10']);
              var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
              g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
            })();
          `,
          }}
        />
        <Script
          src='https://oss.newzone.top/instantpage.min.js'
          type='module'
          strategy='lazyOnload'
        />
      </body>
    </html>
  );
}
