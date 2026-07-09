import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { BASE_PATH } from "./src/app/utils/basePath";
const withNextIntl = createNextIntlPlugin();

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  basePath: BASE_PATH,
  // Prod 静态导出；dev 不开 export（否则 next-intl middleware 与 export 冲突，hydrate 失败）。
  ...(isProd ? { output: "export" as const } : {}),
  images: {
    unoptimized: true,
  },
  assetPrefix: isProd ? `${BASE_PATH}/` : undefined,
  reactCompiler: true,
};

export default withNextIntl(nextConfig);
