#!/usr/bin/env node
/**
 * Next 16 静态导出的 RSC 分段预取修复。
 *
 * 客户端 <Link> 预取请求的是「点号扁平」文件名：
 *   /ar/guide/pick-tags/__next.$d$locale.guide.$d$slug.__PAGE__.txt
 * 而 `next build`（output: "export"）把同一份内容写成「目录嵌套」：
 *   out/ar/guide/pick-tags/__next.$d$locale/guide/$d$slug/__PAGE__.txt
 *
 * 静态托管（EdgeOne / Cloudflare Pages / 任意静态服务器）不会把 URL 里的点
 * 映射成路径分隔符，于是每次 hover 链接都打出一串 404、预取完全失效，
 * 导航退化成整页请求。这里在构建后为每个嵌套文件补一份扁平同名副本，
 * 两种形态都能命中。原目录保留，不改动 Next 的产物。
 *
 * 幂等：重复执行只会用同样的内容覆写同名文件。
 */
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "out");

// 收集 out 下所有名为 __next.<seg> 的目录（Next 只在这一种目录里放分段负载）
const findSegmentDirs = (dir, acc = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!e.isDirectory()) continue;
    const p = path.join(dir, e.name);
    if (e.name.startsWith("__next.")) acc.push(p);
    else if (e.name !== "_next") findSegmentDirs(p, acc);
  }
  return acc;
};

const walkFiles = (dir, acc = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkFiles(p, acc);
    else acc.push(p);
  }
  return acc;
};

if (!fs.existsSync(OUT)) {
  console.log("[flattenRscSegments] 没有 out/，跳过");
  process.exit(0);
}

let written = 0;
for (const segDir of findSegmentDirs(OUT)) {
  const parent = path.dirname(segDir);
  const prefix = path.basename(segDir); // "__next.$d$locale"
  for (const file of walkFiles(segDir)) {
    // segDir 内的相对路径就是 URL 里点号连接的那几段
    const rel = path.relative(segDir, file).split(path.sep).join(".");
    const flat = path.join(parent, `${prefix}.${rel}`);
    // 无条件覆写。这里原本有一层 if (!fs.existsSync(flat))，但 next build 每次都会
    // 清空 out/，那个分支从来没有生效过（连续 12 次构建都报「补齐 415 个」）。
    // 它唯一可能起作用的时候，恰恰是 out/ 哪天变成增量的——那时它会把上一轮的
    // 陈旧副本留下来继续当预取负载发出去。留着只有坏处。
    fs.copyFileSync(file, flat);
    written++;
  }
}
console.log(`[flattenRscSegments] 补齐 ${written} 个扁平分段文件`);
