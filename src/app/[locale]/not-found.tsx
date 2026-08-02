"use client";

import { Result } from "antd";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useEffect } from "react";

export default function NotFound() {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    const timer = setTimeout(() => router.push(`/${locale}`), 3000);
    return () => clearTimeout(timer);
  }, [router, locale]);

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Result status="404" title="404 - Page Not Found" subTitle="Sorry, the page you visited does not exist. Redirecting to home page…" />
    </div>
  );
}
