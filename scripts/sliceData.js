const fs = require("fs");
const path = require("path");

// 源数据：你手写的提示词 JSON，提交进 git
const SRC_DIR = path.join(__dirname, "..", "src", "app", "data", "prompt");
// SSG 首屏 bootstrap 数据：objects/attributes 元数据 + 首屏内联 firstChunk。
// 留在 src/ 内供 page.tsx 用 webpack dynamic import 静态注入。gitignore。
const BOOTSTRAP_DIR = path.join(__dirname, "..", "src", "app", "data", "prompt-bootstrap");
// 运行时按需 fetch 的分块。放 public/ 才能从浏览器拿到。gitignore。
// 命名故意区别于 SRC_DIR，避免 src/.../prompt/ 与 public/.../prompt/ 镜像混淆。
const CHUNK_BASE = path.join(__dirname, "..", "public", "data", "prompt-chunks");

const locales = [
  "en", "zh", "zh-hant", "pt", "es", "hi", "ar", "fr", "de",
  "ja", "ko", "ru", "vi", "tr", "bn", "id", "it", "th",
];

function sliceLocale(locale, referenceObjectCount) {
  const srcPath = path.join(SRC_DIR, `prompt-${locale}.json`);
  const data = JSON.parse(fs.readFileSync(srcPath, "utf8"));

  // 1. 收集 object 出现顺序
  const objectOrder = [];
  const seen = new Set();
  for (const tag of data) {
    if (!seen.has(tag.object)) {
      seen.add(tag.object);
      objectOrder.push(tag.object);
    }
  }

  if (referenceObjectCount !== null && objectOrder.length !== referenceObjectCount) {
    throw new Error(
      `Locale ${locale} has ${objectOrder.length} objects, expected ${referenceObjectCount} (matching en)`,
    );
  }

  // 2. displayName 重复检测
  const counts = new Map();
  for (const tag of data) counts.set(tag.displayName, (counts.get(tag.displayName) ?? 0) + 1);
  const dups = [...counts.entries()].filter(([, c]) => c > 1);
  if (dups.length > 0) {
    console.error(`[sliceData] [${locale}] duplicate displayName values (showing first 10):`);
    for (const [name, c] of dups.slice(0, 10)) console.error(`  - "${name}" x${c}`);
    throw new Error(`Locale ${locale} has duplicate displayName values`);
  }

  // 3. 逗号契约：", "（逗号+空格）是应用的标签分隔符，displayName 内部的
  // 聚合只能用 ","（无空格）。违例会在提交管道里被切碎（选中即损坏），
  // 必须在构建期拦下。
  const commaViolations = data.filter((t) => /[，]|,\s|\s,/.test(t.displayName));
  if (commaViolations.length > 0) {
    console.error(`[sliceData] [${locale}] displayName 含 ", "/全角逗号（聚合请用无空格 ","，showing first 10）:`);
    for (const t of commaViolations.slice(0, 10)) console.error(`  - "${t.displayName.slice(0, 80)}"`);
    throw new Error(`Locale ${locale} has ${commaViolations.length} displayName(s) violating the comma convention`);
  }

  // 4. 切 chunk 与 attributes 索引
  const chunks = objectOrder.map((obj) => data.filter((t) => t.object === obj));
  const attributes = {};
  for (let i = 0; i < objectOrder.length; i++) {
    const obj = objectOrder[i];
    const attrSeen = new Set();
    const attrOrder = [];
    for (const tag of chunks[i]) {
      if (!attrSeen.has(tag.attribute)) {
        attrSeen.add(tag.attribute);
        attrOrder.push(tag.attribute);
      }
    }
    attributes[obj] = attrOrder;
  }

  // 5. chunks 写到 public/
  const chunkDir = path.join(CHUNK_BASE, locale);
  fs.mkdirSync(chunkDir, { recursive: true });
  for (let i = 0; i < chunks.length; i++) {
    fs.writeFileSync(path.join(chunkDir, `${i}.json`), JSON.stringify(chunks[i]));
  }

  // 6. bootstrap 写到 src/（供 SSG 内联）
  const bootstrapPayload = {
    objects: objectOrder,
    attributes,
    firstChunk: chunks[0],
  };
  fs.mkdirSync(BOOTSTRAP_DIR, { recursive: true });
  fs.writeFileSync(path.join(BOOTSTRAP_DIR, `${locale}.json`), JSON.stringify(bootstrapPayload));

  return objectOrder.length;
}

function main() {
  fs.rmSync(CHUNK_BASE, { recursive: true, force: true });
  fs.rmSync(BOOTSTRAP_DIR, { recursive: true, force: true });

  const refCount = sliceLocale("en", null);
  console.log(`[sliceData] en: ${refCount} objects`);
  for (const locale of locales) {
    if (locale === "en") continue;
    sliceLocale(locale, refCount);
    console.log(`[sliceData] ${locale}: ok`);
  }
  console.log(`[sliceData] done`);
  console.log(`[sliceData]   chunks    -> ${CHUNK_BASE}`);
  console.log(`[sliceData]   bootstrap -> ${BOOTSTRAP_DIR}`);
}

main();
