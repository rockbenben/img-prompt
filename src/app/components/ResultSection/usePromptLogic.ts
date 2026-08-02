import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { App } from "antd";
import { useLocale, useTranslations } from "next-intl";
import { TagItem } from "../types";
import { normalizeString } from "@/app/utils/normalizeString";
import { translateText } from "@/app/utils/translateAPI";
import { colorArray } from "@/app/data/constants";
import { useFullTagsData } from "@/app/hooks/useFullTagsData";

const normalizeForTranslation = (text: string) => text.trim().replace(/[,，]\s*$/, "");
const getRandomColor = () => colorArray[Math.floor(Math.random() * colorArray.length)];
const COLOR_REGEX = new RegExp(`\\b(${colorArray.join("|")})\\b`, "gi");

// 提交管道的标点归一：全角逗号、空格+逗号 → ", "，空白折叠
const normalizeCommitText = (text: string) =>
  text
    .replace(/，/g, ", ")
    .replace(/\s+,\s*/g, ", ")
    .replace(/\s+/g, " ");

// 归一后按 ", " 切分。一方数据遵守逗号契约（聚合词条内部用无空格 ","，
// sliceData 构建期强制），永远切不到；下面的 commitKey + 贪心重组是
// 用户手动粘贴含 ", " 长文本时的兜底。commitKey 对名字做与提交管道
// 相同的改写再规范化，让切分出的片段能与已选标签名对得上。
const commitKey = (name: string) => normalizeString(name.replace(/，/g, ", ").replace(/\s+,\s*/g, ", "));

// 切分后贪心重组（粘贴兜底）：连续 token 以 ", " 连回后命中某个已选标签名
// （最长优先）时，作为一个整体保留，防止含 ", " 的已选标签在
// blur/插入/随机颜色提交时被拆碎。
const splitPreservingSelected = (text: string, prevByName: Map<string, TagItem>): string[] => {
  const tokens = text
    .split(", ")
    .map((s) => s.trim())
    .filter(Boolean);
  // 只对「可能是某个含逗号标签名开头」的 token 尝试重组（首段闸门），
  // 其余 token 走普通切分，避免长模板在场时 O(n²) 扫描造成提交卡顿
  let maxNameLen = 0;
  const firstSegmentKeys = new Set<string>();
  for (const [key, tag] of prevByName) {
    if (/[,，]/.test(tag.displayName)) {
      maxNameLen = Math.max(maxNameLen, tag.displayName.length);
      firstSegmentKeys.add(key.split(", ")[0]);
    }
  }
  if (maxNameLen === 0) return tokens; // 没有含逗号的已选标签，普通切分即可
  const candidateCap = maxNameLen * 2 + 16;
  const names: string[] = [];
  let i = 0;
  while (i < tokens.length) {
    let merged: TagItem | null = null;
    let end = i;
    if (firstSegmentKeys.has(commitKey(tokens[i]))) {
      let candidate = tokens[i];
      for (let j = i + 1; j < tokens.length; j++) {
        candidate += ", " + tokens[j];
        if (candidate.length > candidateCap) break;
        const hit = prevByName.get(commitKey(candidate));
        if (hit) {
          merged = hit;
          end = j;
        }
      }
    }
    if (merged) {
      names.push(merged.displayName);
      i = end + 1;
    } else {
      names.push(tokens[i]);
      i += 1;
    }
  }
  return names;
};

interface UsePromptLogicProps {
  selectedTags: TagItem[];
  setSelectedTags: (tags: TagItem[]) => void;
  firstChunk: TagItem[];
  objectCount: number;
}

export function usePromptLogic({ selectedTags, setSelectedTags, firstChunk, objectCount }: UsePromptLogicProps) {
  const { message } = App.useApp();
  const t = useTranslations("ResultSection");
  const locale = useLocale();

  const { fullTags, findTagData, ensureLoaded } = useFullTagsData(locale, firstChunk, objectCount);

  const [draftText, setDraftText] = useState<string | null>(null);
  const isComposingRef = useRef(false);
  const [translatedText, setTranslatedText] = useState("");
  // Auto-translation (debounced effect) and manual translation (bottom input) own
  // separate flags — sharing one made effect cleanup able to stomp the manual flow.
  const [isAutoTranslating, setIsAutoTranslating] = useState(false);
  const [isManualTranslating, setIsManualTranslating] = useState(false);
  const [suggestedTags, setSuggestedTags] = useState<TagItem[]>([]);
  const [exactMatchTag, setExactMatchTag] = useState<TagItem | null>(null);
  const [inputText, setInputText] = useState("");
  // Keyed by locale so a stale translation isn't reused after a locale switch
  const lastTranslatedSource = useRef("");

  const committedText = useMemo(
    () =>
      selectedTags
        .map((tag) => tag.displayName)
        .filter(Boolean)
        .join(", "),
    [selectedTags],
  );
  const displayedText = draftText ?? committedText;

  // External selectedTags change clears draft (React 19 adjust-state-on-prop-change)
  const [prevSelectedTags, setPrevSelectedTags] = useState(selectedTags);
  if (prevSelectedTags !== selectedTags) {
    setPrevSelectedTags(selectedTags);
    setDraftText(null);
  }

  // 空文本与 en 直通在渲染期派生，不进异步链（也避免 effect 内同步 setState）；
  // translatedText 状态只承载异步翻译结果
  const displayTranslation = !normalizeForTranslation(displayedText) ? "" : locale === "en" ? displayedText : translatedText;

  // Translation: debounced 1500ms, depends on displayedText + locale
  useEffect(() => {
    const normalizedText = normalizeForTranslation(displayedText);
    if (!normalizedText || locale === "en") {
      lastTranslatedSource.current = "";
      return;
    }
    const sourceKey = `${locale}:${normalizedText}`;
    if (sourceKey === lastTranslatedSource.current) return;
    let canceled = false;
    const aborter = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setIsAutoTranslating(true);
        const translated = await translateText(displayedText, locale, aborter.signal);
        if (canceled) return;
        setTranslatedText(translated);
        lastTranslatedSource.current = sourceKey;
      } catch (error) {
        if (canceled) return;
        console.warn("自动翻译失败:", error);
        // 失败清空了显示文本，last 必须一并重置——否则回退到上次成功的
        // 文本时 sourceKey 命中旧值直接 return，面板永久空白
        lastTranslatedSource.current = "";
        setTranslatedText("");
      } finally {
        if (!canceled) setIsAutoTranslating(false);
      }
    }, 1500);
    return () => {
      canceled = true;
      clearTimeout(timer);
      aborter.abort(); // 真正中止在途请求，不只是丢弃结果
      // A canceled in-flight request skips its own `finally`; the flag is owned
      // exclusively by this effect, so resetting here is always safe.
      setIsAutoTranslating(false);
    };
  }, [displayedText, locale]);

  // Recommendation: debounced 150ms, depends on displayedText + fullTags
  useEffect(() => {
    const timer = setTimeout(() => {
      const lastTagName = normalizeString(displayedText.split(", ").pop()?.trim() || "");
      if (!lastTagName || !fullTags) {
        // Empty input, or full data not loaded yet (will retrigger when fullTags arrives)
        setSuggestedTags([]);
        setExactMatchTag(null);
        return;
      }

      // 全量扫描（~5000 条 × 防抖 150ms，亚毫秒级）。曾用首两字符分桶加速，
      // 但包含式命中只要不与查询词同前缀就整体漏掉（"seductive_smile" 搜
      // "smile" 不中、"迷人的微笑" 搜 "微笑" 不中），召回比速度重要。
      const candidates: TagItem[] = fullTags;

      const computeMatches = (searchField: keyof TagItem) => {
        let exact: TagItem | null = null;
        const matches: { tag: TagItem; norm: string }[] = [];
        for (const tag of candidates) {
          const norm = normalizeString((tag[searchField] as string) || "");
          if (norm === lastTagName) {
            exact = tag;
          } else if (norm.includes(lastTagName)) {
            matches.push({ tag, norm });
          }
        }
        matches.sort((a, b) => {
          const aS = a.norm.startsWith(lastTagName);
          const bS = b.norm.startsWith(lastTagName);
          if (aS !== bS) return aS ? -1 : 1;
          // 短词条相关性更高；几百字的成品范例模板自然沉底
          if (a.norm.length !== b.norm.length) return a.norm.length - b.norm.length;
          return a.norm.localeCompare(b.norm);
        });
        return { exact, matches: matches.map((m) => m.tag) };
      };

      // 双字段都搜再合并：langName（母语，主路径）命中排前，displayName 命中补后。
      // 旧的两段式「displayName 有结果就跳过 langName」会让中文查询撞到
      // 成品范例 displayName 里的噪音命中后，把真正的母语词条整组跳过。
      const dn = computeMatches("displayName");
      const ln = computeMatches("langName");
      const exact = dn.exact ?? ln.exact;
      const seen = new Set<string>();
      const merged: TagItem[] = [];
      for (const tag of [...ln.matches, ...dn.matches]) {
        if (tag !== exact && !seen.has(tag.displayName)) {
          seen.add(tag.displayName);
          merged.push(tag);
        }
      }
      setExactMatchTag(exact);
      setSuggestedTags(merged.slice(0, 10));
    }, 150);
    return () => clearTimeout(timer);
  }, [displayedText, fullTags]);

  // Handlers — draft text is the editing buffer

  // Re-deriving tags from the prompt text uses findTagData, which only sees the
  // currently-loaded tag data. fullTags is lazy (loaded on textarea focus); until
  // then only firstChunk = object 0 is searchable. Without this fallback, committing
  // text (template insert / random color / blur) would resolve a tag picked from any
  // other object to an empty record and silently drop its object/attribute/langName.
  // Preserve the already-selected rich tag when findTagData can't resolve the name.
  const resolveTagFromText = useCallback(
    (rawName: string, prevByName: Map<string, TagItem>): TagItem => {
      const found = findTagData(rawName);
      if (found.displayName) return found;
      return prevByName.get(commitKey(rawName)) ?? { object: "", attribute: "", displayName: rawName, langName: "" };
    },
    [findTagData],
  );

  const prevTagsByName = useCallback(() => new Map(selectedTags.map((tag) => [commitKey(tag.displayName), tag])), [selectedTags]);

  // 提交尾段：去重（按规范化 key，保留首次出现的原拼写）→ 解析富数据 → 提交
  const commitNames = useCallback(
    (names: string[], prevByName: Map<string, TagItem>) => {
      const seen = new Set<string>();
      const uniqueNames: string[] = [];
      for (const name of names) {
        const key = commitKey(name);
        if (!seen.has(key)) {
          seen.add(key);
          uniqueNames.push(name);
        }
      }
      setSelectedTags(uniqueNames.map((name) => resolveTagFromText(name, prevByName)));
    },
    [resolveTagFromText, setSelectedTags],
  );

  // Single commit pipeline: normalize punctuation → split (preserving selected
  // comma-bearing tags) → dedupe → resolve rich tag data → commit.
  const commitText = useCallback(
    (text: string) => {
      const prevByName = prevTagsByName();
      commitNames(splitPreservingSelected(normalizeCommitText(text), prevByName), prevByName);
    },
    [prevTagsByName, commitNames],
  );

  const handleResultTextChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newText = e.target.value;
      // Trailing-comma normalization. Skipped mid-IME-composition (never rewrite
      // text the IME still owns) and on deletion: backspacing "cat, " yields
      // "cat," which would be rewritten right back to "cat, " — an infinite
      // loop that makes the trailing comma impossible to delete.
      const isDeletion = newText.length < displayedText.length;
      // 仅当光标就在末尾（= 这个逗号是刚敲出来的）才归一化。文本碰巧以裸逗号
      // 结尾（删除守卫的遗留态）时在中段打字，整串重写会把光标甩到末尾。
      const caretAtEnd = e.target.selectionStart === newText.length;
      if (!isComposingRef.current && !isDeletion && caretAtEnd && (newText.endsWith(",") || newText.endsWith("，"))) {
        setDraftText(newText.slice(0, -1).replace(/,\s*$/g, "") + ", ");
        return;
      }
      setDraftText(newText);
    },
    [displayedText],
  );

  const handleBlur = useCallback(() => {
    // 无编辑的 blur 不重解析——重解析是有损的（含逗号的标签等），没必要白走一遍
    if (draftText === null || draftText === committedText) {
      setDraftText(null);
      isComposingRef.current = false;
      return;
    }
    commitText(draftText);
    setDraftText(null);
    isComposingRef.current = false;
  }, [commitText, draftText, committedText]);

  const handleSuggestTagClick = useCallback(
    (tag: TagItem) => {
      const baseText = draftText ?? committedText;
      const prevByName = prevTagsByName();
      const names = splitPreservingSelected(baseText, prevByName);
      const parsed = names.map((name) => resolveTagFromText(name, prevByName));
      if (parsed.length > 0) {
        parsed[parsed.length - 1] = tag;
      } else {
        parsed.push(tag);
      }
      // 与 commitNames 同语义去重（按 key 保留首次出现）。这是唯一不走
      // commitNames 的提交路径，漏掉会造出重复标签：重复 React key、
      // 点击芯片连删两个、提示词输出重复词条。
      const seen = new Set<string>();
      const deduped = parsed.filter((p) => {
        const key = commitKey(p.displayName);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      setSelectedTags(deduped);
      // draftText cleared by the in-render prev-check when selectedTags identity changes
    },
    [draftText, committedText, prevTagsByName, resolveTagFromText, setSelectedTags],
  );

  const handleConstantText = useCallback(
    (constantText: string, successMessageKey: string) => {
      const baseText = draftText ?? committedText;
      commitText(baseText ? baseText + ", " + constantText : constantText);
      message.success(t(successMessageKey));
    },
    [draftText, committedText, commitText, message, t],
  );

  const handleClear = useCallback(() => {
    setSelectedTags([]);
    message.success(t("clearSuccess"));
  }, [setSelectedTags, message, t]);

  const handleColorReplace = useCallback(() => {
    const currentText = draftText ?? committedText;
    const matches = currentText.match(COLOR_REGEX);
    if (!matches || matches.length === 0) {
      message.info(t("randomColor-noMatch"));
      return;
    }
    // 先在未变异文本上完成保护性切分（含逗号模板的重组靠名字完全相等，
    // 必须发生在换色之前），再对每个名字单独换色——模板换色后保持单个
    // 标签（富数据失配则按自定义标签整体保留），不会被拆碎。
    // 提交而非留在草稿：草稿会被任何外部 selectedTags 变化清掉，丢失换色结果。
    const prevByName = prevTagsByName();
    const names = splitPreservingSelected(normalizeCommitText(currentText), prevByName);
    commitNames(
      names.map((name) => name.replace(COLOR_REGEX, () => getRandomColor())),
      prevByName,
    );
    message.success(t("randomColor-success", { count: matches.length }));
  }, [draftText, committedText, prevTagsByName, commitNames, message, t]);

  // 手动翻译是异步的：await 期间用户可能点选标签或继续输入。若用点击时刻的旧
  // 闭包提交，会用旧文本整体覆盖、丢掉等待期间的改动——落地时必须取最新版本。
  const latestConstantText = useRef(handleConstantText);
  useEffect(() => {
    latestConstantText.current = handleConstantText;
  });

  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return;
    try {
      setIsManualTranslating(true);
      const translated = await translateText(inputText, "en");
      if (translated.trim()) {
        latestConstantText.current(translated, "translateSuccess");
        setInputText("");
      } else {
        message.error(t("translateEmptyError"));
      }
    } catch {
      message.error(t("translateFailError"));
    } finally {
      setIsManualTranslating(false);
    }
  }, [inputText, t, message]);

  const setIsComposing = useCallback((value: boolean) => {
    isComposingRef.current = value;
    // IME 拍板后补一次尾逗号归一化：全角逗号经常在组合会话内提交
    // （input 先于 compositionend 触发），当时的 onChange 被组合守卫跳过。
    if (!value) {
      setDraftText((prev) => {
        if (prev !== null && (prev.endsWith(",") || prev.endsWith("，"))) {
          return prev.slice(0, -1).replace(/,\s*$/g, "") + ", ";
        }
        return prev;
      });
    }
  }, []);

  return {
    resultText: displayedText,
    translatedText: displayTranslation,
    isAutoTranslating,
    isManualTranslating,
    suggestedTags,
    exactMatchTag,
    setIsComposing,
    handleResultTextChange,
    handleBlur,
    handleSuggestTagClick,
    handleConstantText,
    handleClear,
    handleColorReplace,
    handleFocus: ensureLoaded,
    t,
    inputText,
    setInputText,
    handleTranslate,
  };
}
