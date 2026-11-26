"use client";

import { useSyncExternalStore } from "react";
import { FloatButton } from "antd";
import { useTranslations } from "next-intl";

function subscribe(onResize: () => void) {
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}

function getVisibilityHeight() {
  // 短标签列表也能在滚到 FAQ 前后看到回顶入口。
  return Math.min(window.innerHeight, window.innerWidth >= 992 ? 480 : 400);
}

export default function BackToTop() {
  const t = useTranslations("ToolPage");
  const visibilityHeight = useSyncExternalStore(subscribe, getVisibilityHeight, () => 0);
  if (!visibilityHeight) return null;

  const label = t("backToTop");
  return (
    <FloatButton.BackTop
      className="pp-back-to-top"
      aria-label={label}
      tooltip={{ title: label, trigger: ["hover", "focus"] }}
      visibilityHeight={visibilityHeight}
      onClick={() => document.getElementById("pp-main")?.focus({ preventScroll: true })}
    />
  );
}
