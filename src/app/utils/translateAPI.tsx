// 有道翻译 - 免费无需API Key
const translateWithYoudao = async (text: string, sourceLanguage: string, targetLanguage: string) => {
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
  };

  const from = langMap[sourceLanguage] || "auto";
  const to = langMap[targetLanguage] || "zh-CHS";

  const url = `https://aidemo.youdao.com/trans?q=${encodeURIComponent(text)}&from=${from}&to=${to}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Youdao API failed");
    const data = await response.json();

    // 检查API返回的错误码
    if (data.errorCode && data.errorCode !== "0") {
      throw new Error(`Youdao API error: ${data.errorCode}`);
    }

    if (data.translation && data.translation.length > 0) {
      let result = data.translation[0];
      return result.trim();
    }

    throw new Error("No translation result");
  } catch (error) {
    throw error;
  }
};

// MyMemory翻译 - 欧盟免费API（最大500字节）
const translateWithMyMemory = async (text: string, sourceLanguage: string, targetLanguage: string) => {
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
  };

  let from = langMap[sourceLanguage] || sourceLanguage;
  let to = langMap[targetLanguage] || targetLanguage;

  // MyMemory不支持auto，如果是auto或未知语言，尝试检测语言
  if (from === "auto" || !langMap[sourceLanguage]) {
    // 简单的语言检测：检查是否包含中文字符
    if (/[\u4e00-\u9fff]/.test(text)) {
      from = "zh-CN";
    } else if (/[ぁ-ゖゝ-ゟァ-ヴー々〆〤]/.test(text)) {
      from = "ja"; // 日文
    } else if (/[가-힣]/.test(text)) {
      from = "ko"; // 韩文
    } else {
      from = "en"; // 默认英文
    }
  }

  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("MyMemory API failed");
    const data = await response.json();

    if (data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
    throw new Error("No translation result");
  } catch (error) {
    throw error;
  }
};

// Google翻译（内地可能不稳定）
const translateWithGoogle = async (text: string, sourceLanguage: string, targetLanguage: string) => {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLanguage}&tl=${targetLanguage}&dt=t&q=${encodeURIComponent(text)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Google API failed");
    const data = await response.json();
    return data[0].map((part: any) => part[0]).join("");
  } catch (error) {
    throw error;
  }
};

// 主翻译函数 - 支持多服务自动切换
export const translateText = async (text: string, sourceLanguage: string, targetLanguage: string) => {
  const trimmedText = text.trim();

  // 如果文本不包含需要翻译的字符，直接返回
  if (!/[a-zA-Z\p{L}]/u.test(trimmedText)) {
    return trimmedText;
  }

  // 翻译服务列表（按优先级排序）
  const translationServices = [
    { name: "Google", fn: translateWithGoogle },
    { name: "Youdao", fn: translateWithYoudao },
    { name: "MyMemory", fn: translateWithMyMemory },
  ];

  let lastError: Error | null = null;

  // 依次尝试每个翻译服务
  for (const service of translationServices) {
    try {
      console.log(`尝试使用 ${service.name} 翻译服务...`);
      const result = await service.fn(trimmedText, sourceLanguage, targetLanguage);
      console.log(`${service.name} 翻译成功`);
      return result;
    } catch (error) {
      console.warn(`${service.name} 翻译失败:`, error);
      lastError = error as Error;
      continue;
    }
  }

  // 所有服务都失败时，抛出最后一个错误
  throw new Error(`所有翻译服务都不可用。最后错误: ${lastError?.message}`);
};
