import { useState, useEffect, useMemo, useRef, useCallback, createElement } from "react";
import { App, Button } from "antd";
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
  const { message, notification } = App.useApp();
  const t = useTranslations("ResultSection");
  const locale = useLocale();

  const { scanEntries, findTagData, ensureLoaded } = useFullTagsData(locale, firstChunk, objectCount);

  const [draftText, setDraftText] = useState<string | null>(null);
  // 提示词的两份存档，按 locale 分键（标签的 langName/object/attribute 是语言
  // 相关数据，跨语言恢复会把 zh 的中文注释带进 en 界面）：
  //   imgprompt-selected-tags:<locale>  已提交的标签（带分类与母语注释）
  //   imgprompt-prompt-draft:<locale>  提示词框里的完整内容（已提交 + 未提交）
  // 两份存档的读写都收在这个 hook 里，不再拆到 HomeClient：拆开写就会出现
  // 「谁先恢复」的隐式顺序依赖——子组件的 effect 更早跑，父组件的恢复会把它覆盖。
  const tagStoreKey = `imgprompt-selected-tags:${locale}`;
  const draftStoreKey = `imgprompt-prompt-draft:${locale}`;
  const draftKeyRef = useRef<string | null>(null);
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

  // 用户开始挑标签 = 已经在用这个工具了：把全量语料拉起来，推荐词条才有数据源。
  // 原来只有「点进提示词框」才触发（handleFocus: ensureLoaded），于是纯点选流程里
  // 推荐行永远不出现——README 与指南都宣传了「智能推荐」，用户却看不到它。
  // ensureLoaded 内部是 idle 调度 + 2 并发队列，不与分类抓取抢带宽；tagCache 里
  // 已有的分块直接命中，不再重下。聚焦提示词框仍照旧触发，两条路径共用同一个
  // loadingRef，不会重复拉取。
  useEffect(() => {
    if (selectedTags.length > 0) ensureLoaded();
  }, [selectedTags.length, ensureLoaded]);

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
      if (!lastTagName || !scanEntries) {
        // Empty input, or full data not loaded yet (will retrigger when scanEntries arrives)
        setSuggestedTags([]);
        setExactMatchTag(null);
        return;
      }

      // 全量扫描（~5000 条 × 防抖 150ms；归一化已预计算，纯 includes 扫描毫秒级，
      // 实测前台输入到推荐出现 ~177ms 里防抖占大头）。曾用首两字符分桶加速，
      // 但包含式命中只要不与查询词同前缀就整体漏掉（"seductive_smile" 搜
      // "smile" 不中、"迷人的微笑" 搜 "微笑" 不中），召回比速度重要。
      const computeMatches = (key: "dn" | "ln") => {
        let exact: TagItem | null = null;
        const matches: { tag: TagItem; norm: string }[] = [];
        for (const entry of scanEntries) {
          const norm = entry[key];
          if (norm === lastTagName) {
            exact = entry.tag;
          } else if (norm.includes(lastTagName)) {
            matches.push({ tag: entry.tag, norm });
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
      const dn = computeMatches("dn");
      const ln = computeMatches("ln");
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
  }, [displayedText, scanEntries]);

  // Handlers — draft text is the editing buffer

  // Re-deriving tags from the prompt text uses findTagData, which only sees the
  // currently-loaded tag data. fullTags is lazy (an idle-time load, triggered by
  // focusing the prompt box or by picking the first tag); until then only the
  // bootstrap firstChunk = the leading slice
  // of object 0 is searchable. Without this fallback, committing
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

  // ---------- 持久化：已选标签 + 提示词草稿 ----------
  //
  // 恢复：标签与草稿一次读完、一次提交。有草稿时草稿才是权威的——它是提示词
  // 框里的完整内容（已提交部分 + 未提交部分），存档标签只是它的一部分；按草稿
  // 重建选择集，用户手写的字就此落进「已选」，之后的行为与「手打后失焦」完全
  // 一致。早前把草稿留成「待提交」的做法有个致命处：刷新后提示词框里看得到自己
  // 写的字，但点第一个标签时它会被 setDraftText(null) 清掉（框没获得过焦点，
  // 等不到那次会先提交草稿的 blur）——手写的内容无声消失。
  useEffect(() => {
    if (draftKeyRef.current === draftStoreKey) return;
    draftKeyRef.current = draftStoreKey;
    let storedDraft: string | null = null;
    let storedTags: TagItem[] = [];
    try {
      storedDraft = sessionStorage.getItem(draftStoreKey);
      const rawTags = sessionStorage.getItem(tagStoreKey);
      const parsed = rawTags ? JSON.parse(rawTags) : null;
      if (Array.isArray(parsed)) storedTags = parsed;
    } catch {
      /* 损坏的存档直接忽略 */
    }
    if (storedDraft !== null) {
      // 存档标签当富数据源：草稿里已提交的那几段还能带回 object/attribute/
      // 母语注释，不会退化成没有注释的「其他」分组。
      const prevByName = new Map(storedTags.map((tag) => [commitKey(tag.displayName), tag]));
      commitNames(splitPreservingSelected(normalizeCommitText(storedDraft), prevByName), prevByName);
    } else if (storedTags.length > 0) {
      setSelectedTags(storedTags);
    }
  }, [draftStoreKey, tagStoreKey, commitNames, setSelectedTags]);

  // 草稿存档：提示词框里还没提交的内容（正在打字的部分）。
  // 恢复时它已经被折进选择集了，所以恢复之后 draftText 是 null → 存档被清掉，
  // 下次刷新读到的就是「已提交」那一份。
  useEffect(() => {
    if (draftKeyRef.current !== draftStoreKey) return;
    try {
      if (draftText === null) sessionStorage.removeItem(draftStoreKey);
      else sessionStorage.setItem(draftStoreKey, draftText);
    } catch {
      /* 配额/隐私模式下静默放弃 */
    }
  }, [draftStoreKey, draftText]);

  // 已选标签存档：站内往返（指南页）与误刷新不丢编辑现场；新标签页/新会话从空开始。
  useEffect(() => {
    try {
      sessionStorage.setItem(tagStoreKey, JSON.stringify(selectedTags));
    } catch {
      /* 配额/隐私模式下静默放弃 */
    }
  }, [tagStoreKey, selectedTags]);

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
      // 只有「最后一个词是用户手打的、词库里还没有的自由文本」才被替换——那
      // 是正在打的半截词，推荐词是来补全它的。其它情况（从标签云里挑好的
      // 成品标签、已提交的完整词条）一律【追加】：原逻辑无条件替换最后一段，
      // 于是「点标签云 → 点推荐词」会把这个动作变成"把刚挑的标签顶掉"，而
      // 推荐词长得和标签芯片一模一样，用户只会以为自己多加了一个词。
      const lastIsFreeText = parsed.length > 0 && !parsed[parsed.length - 1].object;
      if (lastIsFreeText) {
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
    // 清空是全站唯一不可逆的破坏性操作：攒了半天的标签一次误点就没了。
    // 提示条上挂一个「撤销」，误点的人一步就能拿回来——比确认框好：
    // 正常路径不多一步，误点也不用重新点几十个标签。
    const previous = selectedTags;
    setSelectedTags([]);
    const key = `clear-undo-${Date.now()}`;
    notification.open({
      key,
      message: t("clearSuccess"),
      duration: 8,
      actions: createElement(
        Button,
        {
          size: "small",
          onClick: () => {
            setSelectedTags(previous);
            notification.destroy(key);
          },
        },
        t("undo"),
      ),
    });
  }, [selectedTags, setSelectedTags, notification, t]);

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
    if (!inputText.trim()) {
      message.info(t("translateEmptyError"));
      return;
    }
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
