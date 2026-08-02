// 多服务降级翻译链。优先级：GTX Free（translate-pa，Google 网页翻译挂件的
// 新网关）→ Edge Free（Edge 内置翻译的免费后端）→ 旧版 gtx → Youdao → MyMemory。
// 旧版 translate_a/single?client=gtx 自 2026-06 起对大量 IP 302 到反滥用墙
// （浏览器表现为 CORS 错误），保留作备用；前两个服务均为开放 CORS、免 key。
// 端点协议参考 web-tools-by-ai 项目，2026-06 实测可用。

// 源语言一律交给服务端自动检测（全站唯一的调用形态），只需映射目标语言。
// Google NMT 后端的语言码与本项目 locale 的差异映射
const GOOGLE_LANG_MAP: Record<string, string> = {
  zh: "zh-CN",
  "zh-hant": "zh-TW",
};
const toGoogleCode = (lang: string): string => GOOGLE_LANG_MAP[lang] ?? lang;

// 单服务超时：挂起的端点不能无限卡住降级链（手动翻译期间输入框是禁用的）。
// 与调用方 signal 合并，两者任一触发即中止本次尝试。
// 特性检测分级：AbortSignal.timeout 需 Chrome 103+、AbortSignal.any 需 116+，
// 大陆常见的 Chromium 套壳内核普遍更旧——缺失时降级（无超时/不合并），
// 绝不能让能力探测本身炸掉整条翻译链。
const PER_SERVICE_TIMEOUT_MS = 10_000;
const attemptSignal = (outer?: AbortSignal): AbortSignal | undefined => {
  if (typeof AbortSignal === "undefined" || typeof AbortSignal.timeout !== "function") {
    return outer; // 老浏览器：放弃超时，保持链路可用
  }
  const timeout = AbortSignal.timeout(PER_SERVICE_TIMEOUT_MS);
  if (!outer) return timeout;
  // 无 .any 时取超时信号：外层取消由 translateText 的 aborted 检查
  // 与调用方的 canceled 守卫兜底，只损失"在途请求即时中止"
  return typeof AbortSignal.any === "function" ? AbortSignal.any([outer, timeout]) : timeout;
};

// ===== GTX Free（translate-pa）=====
// translate-pa 是 Google 网站翻译挂件（Translate Element / te_lib）背后的
// API 网关：正规 CORS（ACAO 反射 Origin），对被 translate_a 拦的 IP 也返回 200。
// 公钥内嵌于 Google te_lib 加载器，语义同旧 client=gtx 参数（共享免费后端），
// 不是用户机密。
const GTX_ENDPOINT = "https://translate-pa.googleapis.com/v1/translateHtml";
const GTX_PUBLIC_KEY = "AIzaSyATBXajvzQLTDHEQbcpq0Ihe0vWDHmO520";

// translateHtml 按 HTML 解析输入：裸 & / < 会被当标记干扰翻译（"5 < 6" 会错译）。
// 进站转义，出站把实体还原。
const escapeHtml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const unescapeHtml = (s: string) =>
  s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");

const translateWithGtxFree = async (text: string, targetLanguage: string, signal?: AbortSignal) => {
  // HTML 语义会把 \n 压成空格；translateHtml 原生接收文本数组，
  // 按行拆发、按位回填（空行直传，发空元素会 400）。
  const lines = text.split("\n");
  const sentIndices: number[] = [];
  const payload: string[] = [];
  lines.forEach((line, i) => {
    if (line.trim()) {
      sentIndices.push(i);
      payload.push(escapeHtml(line));
    }
  });
  if (payload.length === 0) return text;

  const response = await fetch(GTX_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json+protobuf", "X-Goog-API-Key": GTX_PUBLIC_KEY },
    body: JSON.stringify([[payload, "auto", toGoogleCode(targetLanguage)], "te_lib"]),
    signal,
  });
  if (!response.ok) throw new Error(`GTX Free HTTP ${response.status}`);

  const data = await response.json();
  // 响应：data[0] = 与请求 payload 平行的译文数组（data[1] 是 sl=auto 时的
  // 检测语言）。根节点非数组（auth 墙/结构漂移）按失败处理走下一服务。
  const translated = Array.isArray(data?.[0]) ? data[0] : null;
  if (!translated) throw new Error("GTX Free: unexpected response shape");
  const out = [...lines];
  sentIndices.forEach((lineIdx, j) => {
    if (typeof translated[j] !== "string") throw new Error("GTX Free: missing translation segment");
    out[lineIdx] = unescapeHtml(translated[j]);
  });
  return out.join("\n");
};

// ===== Edge Free（Microsoft Edge 内置翻译后端）=====
// 引擎同 Azure Translator：GET edge.microsoft.com/translate/auth 发 ~10 分钟
// JWT，api-edge.cognitive.microsofttranslator.com 接受。两端 CORS 全开
// （ACAO *），\n 保留、纯文本模式不动 & / <，zh / zh-hant 直接接受。
const EDGE_AUTH_ENDPOINT = "https://edge.microsoft.com/translate/auth";
const EDGE_TRANSLATE_ENDPOINT = "https://api-edge.cognitive.microsofttranslator.com/translate?api-version=3.0";

// token 缓存：8 分钟刷新（对 ~10 分钟 JWT 留 2 分钟余量）；in-flight 共享
// （single-flight），并发请求只发一次 auth。staleToken = 调用方刚被拒的
// token，缓存未越过它就强制刷新。
let edgeTokenCache: { value: string; expiresAt: number } | null = null;
let edgeTokenInflight: Promise<string> | null = null;

const getEdgeToken = (signal?: AbortSignal, staleToken?: string): Promise<string> => {
  if (edgeTokenCache && edgeTokenCache.value !== staleToken && Date.now() < edgeTokenCache.expiresAt) {
    return Promise.resolve(edgeTokenCache.value);
  }
  if (edgeTokenInflight) return edgeTokenInflight;
  const inflight = (async () => {
    const response = await fetch(EDGE_AUTH_ENDPOINT, { signal });
    if (!response.ok) throw new Error(`Edge auth HTTP ${response.status}`);
    const value = (await response.text()).trim();
    edgeTokenCache = { value, expiresAt: Date.now() + 8 * 60_000 };
    return value;
  })().finally(() => {
    edgeTokenInflight = null;
  });
  edgeTokenInflight = inflight;
  return inflight;
};

const translateWithEdgeFree = async (text: string, targetLanguage: string, signal?: AbortSignal) => {
  // 不带 &from：Azure/Edge 后端缺省即自动检测
  const endpoint = `${EDGE_TRANSLATE_ENDPOINT}&to=${targetLanguage}`;

  const doRequest = async (token: string) =>
    fetch(endpoint, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify([{ Text: text }]),
      signal,
    });

  const token = await getEdgeToken(signal);
  let response = await doRequest(token);
  // JWT 中途过期 → 透明刷新重试一次（把被拒 token 传为 stale，刷新全局 single-flight）
  if (response.status === 401 || response.status === 403) {
    response = await doRequest(await getEdgeToken(signal, token));
  }
  if (!response.ok) throw new Error(`Edge Free HTTP ${response.status}`);

  const data = (await response.json()) as Array<{ translations?: Array<{ text?: string }> }> | null;
  const translatedText = data?.[0]?.translations?.[0]?.text;
  if (typeof translatedText !== "string") throw new Error("Edge Free: unexpected response shape");
  return translatedText;
};

// ===== 备用：旧版 gtx（translate_a/single）=====
type GoogleTranslationPart = [string, string, ...unknown[]];
type GoogleTranslationResponse = [GoogleTranslationPart[], ...unknown[]];

const translateWithGoogleLegacy = async (text: string, targetLanguage: string, signal?: AbortSignal) => {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${toGoogleCode(targetLanguage)}&dt=t&q=${encodeURIComponent(text)}`;

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("Google legacy API failed");
  const data = (await response.json()) as GoogleTranslationResponse;
  return data[0].map((part) => part[0]).join("");
};

// ===== 备用：有道（免费无需 API Key）=====
const translateWithYoudao = async (text: string, targetLanguage: string, signal?: AbortSignal) => {
  // 同时充当目标语言白名单：查不到即抛错让位下一个服务
  const langMap: { [key: string]: string } = {
    en: "en",
    zh: "zh-CHS",
    "zh-cn": "zh-CHS",
    "zh-tw": "zh-CHT",
    ja: "ja",
    ko: "ko",
    fr: "fr",
    es: "es",
    de: "de",
    ru: "ru",
    ar: "ar",
    pt: "pt",
    id: "id",
    tr: "tr",
    vi: "vi",
    "zh-hant": "zh-CHT",
  };

  const to = langMap[targetLanguage];
  // 不支持的目标语言必须抛错走下一个服务；静默回退 zh-CHS 会把
  // hi/th/bn 等用户的译文变成简体中文
  if (!to) throw new Error(`Youdao: unsupported target language "${targetLanguage}"`);

  const url = `https://aidemo.youdao.com/trans?q=${encodeURIComponent(text)}&from=auto&to=${to}`;

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("Youdao API failed");
  const data = await response.json();

  // 检查API返回的错误码
  if (data.errorCode && data.errorCode !== "0") {
    throw new Error(`Youdao API error: ${data.errorCode}`);
  }

  if (data.translation && data.translation.length > 0) {
    return data.translation[0].trim();
  }

  throw new Error("No translation result");
};

// ===== 备用：MyMemory（欧盟免费 API，最大 500 字节）=====
// 本项目 18 个 locale 中可靠靠文字系统识别的源语言；顺序即匹配优先级。
const SOURCE_SCRIPTS: [RegExp, string][] = [
  [/[ぁ-ゖァ-ヴー々〆〤]/, "ja"], // 假名，日文独有
  [/[가-힣]/, "ko"],
  [/[Ѐ-ӿ]/, "ru"],
  [/[؀-ۿ]/, "ar"],
  [/[฀-๿]/, "th"],
  [/[ऀ-ॿ]/, "hi"],
  [/[ঀ-৿]/, "bn"],
  [/[一-鿿]/, "zh-CN"], // 汉字兜底，必须最后
];

const translateWithMyMemory = async (text: string, targetLanguage: string, signal?: AbortSignal) => {
  // 硬上限 500 字节：超长必然返回 200 包裹的 QUERY LENGTH LIMIT 错误，
  // 提前让位给下一个服务，省一次注定失败的往返
  if (new TextEncoder().encode(text).length > 480) {
    throw new Error("MyMemory: text exceeds 500-byte limit");
  }
  const langMap: { [key: string]: string } = {
    en: "en",
    zh: "zh-CN",
    "zh-cn": "zh-CN",
    "zh-tw": "zh-TW",
    ja: "ja",
    ko: "ko",
    fr: "fr",
    es: "es",
    de: "de",
    ru: "ru",
    ar: "ar",
    pt: "pt",
    it: "it",
    nl: "nl",
    pl: "pl",
    tr: "tr",
    id: "id",
    vi: "vi",
    "zh-hant": "zh-TW",
  };

  const to = langMap[targetLanguage] || targetLanguage;

  // MyMemory 不支持 auto，只能本地按文字系统粗判源语言。汉字必须排在最后：
  // 日文正文含汉字，先匹配汉字区间会把日文整体误判成中文。
  // 拉丁字母语言（pt/es/fr/de/vi/tr/id/it）彼此无法靠字符区分，一律按英文——
  // 提示词正文就是英文 displayName，这也是最常命中的情况。
  const from = SOURCE_SCRIPTS.find(([re]) => re.test(text))?.[1] ?? "en";

  // 猜出来的源语言与目标相同时直接让位：MyMemory 对 x|x 回 403，
  // 白跑一趟还会把降级链的最后一次机会耗掉
  if (from === to) throw new Error(`MyMemory: source and target are both "${to}"`);

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("MyMemory API failed");
  const data = await response.json();

  // 出错时 HTTP 仍是 200，responseStatus 为 "403" 等，且 translatedText
  // 装的是错误文案（如 QUERY LENGTH LIMIT EXCEEDED）——不能当译文返回
  if (Number(data.responseStatus) !== 200) {
    throw new Error(`MyMemory error: ${data.responseDetails || data.responseStatus}`);
  }
  if (data.responseData && data.responseData.translatedText) {
    return data.responseData.translatedText;
  }
  throw new Error("No translation result");
};

// 翻译服务列表（按优先级排序）
type TranslateFn = (text: string, targetLanguage: string, signal?: AbortSignal) => Promise<string>;
const translationServices: { name: string; fn: TranslateFn }[] = [
  { name: "GTX Free", fn: translateWithGtxFree },
  { name: "Edge Free", fn: translateWithEdgeFree },
  { name: "Google Legacy", fn: translateWithGoogleLegacy },
  { name: "Youdao", fn: translateWithYoudao },
  { name: "MyMemory", fn: translateWithMyMemory },
];

// 成功服务记忆：某服务在当前网络环境失败后（被墙/超时），下次从上次
// 成功的服务直接开始，不再每次都白试一轮前面的
let preferredIndex = 0;

// 结果 LRU：标签开关是核心交互，A→B→A 回到 A 时直接命中缓存，
// 不重发请求（usePromptLogic 的 lastTranslatedSource 只防连续重复）
const RESULT_CACHE_CAP = 64;
const resultCache = new Map<string, string>();
const cacheGet = (key: string): string | undefined => {
  const hit = resultCache.get(key);
  if (hit !== undefined) {
    // Map 按插入序迭代——删了重插实现"最近使用"
    resultCache.delete(key);
    resultCache.set(key, hit);
  }
  return hit;
};
const cacheSet = (key: string, value: string) => {
  resultCache.set(key, value);
  if (resultCache.size > RESULT_CACHE_CAP) {
    resultCache.delete(resultCache.keys().next().value as string);
  }
};

// 主翻译函数 - 多服务自动切换；源语言由各服务自动检测。signal 可选（调用方取消时中止在途请求）
export const translateText = async (text: string, targetLanguage: string, signal?: AbortSignal) => {
  const trimmedText = text.trim();

  // 如果文本不包含需要翻译的字符，直接返回
  if (!/[a-zA-Z\p{L}]/u.test(trimmedText)) {
    return trimmedText;
  }

  const cacheKey = `${targetLanguage}:${trimmedText}`;
  const cached = cacheGet(cacheKey);
  if (cached !== undefined) return cached;

  // 上次成功的服务优先，其余按列表序补位
  const order = [translationServices[preferredIndex], ...translationServices.filter((_, i) => i !== preferredIndex)];

  let lastError: Error | null = null;
  for (const service of order) {
    // 调用方已取消就别再换下一个服务空转了
    if (signal?.aborted) throw lastError ?? new Error("translation aborted");
    try {
      const result = await service.fn(trimmedText, targetLanguage, attemptSignal(signal));
      preferredIndex = translationServices.indexOf(service);
      cacheSet(cacheKey, result);
      return result;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      continue;
    }
  }

  // 所有服务都失败时，抛出最后一个错误
  throw new Error(`所有翻译服务都不可用。最后错误: ${lastError?.message}`);
};
