"use client";
import { useState, useMemo, useCallback, useEffect, useId, useRef, FC } from "react";
import { Flex, Segmented, Spin, Button, Input } from "antd";
import { SearchOutlined, AppstoreOutlined, UnorderedListOutlined } from "@ant-design/icons";

import bundledCustomTags from "@/app/data/prompt-custom.json";

import CategoryRadio from "@/app/components/CategoryRadio";
import LocalTagLibrary from "@/app/components/LocalTagLibrary";
import TagSection from "@/app/components/TagSection";
import ResultSection from "@/app/components/ResultSection";
import { TagItem } from "@/app/components/types";
import { useFullTagsData } from "@/app/hooks/useFullTagsData";
import { LEGACY_LIBRARY_ID, useLocalTagLibrary } from "@/app/hooks/useLocalTagLibrary";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { useObjectTags } from "@/app/hooks/useObjectTags";
import { normalizeString } from "@/app/utils/normalizeString";

import { useLocale, useTranslations } from "next-intl";

interface HomeClientProps {
  objects: string[];
  attributes: Record<string, string[]>;
  firstChunk: TagItem[];
  // SSG 内联的 firstChunk 可能只是首块前缀（sliceData 的 FIRST_INLINE），
  // 全集长度在这里声明，供截断感知逻辑判断
  firstChunkTotal: number;
}

// 分享链接参数解析：索引（新格式，locale 无关）→ 对应名字；
// 非数字按名字匹配（旧格式兼容）；无效一律 null
const resolveCategoryParam = (param: string | null, list: string[]): string | null => {
  if (!param) return null;
  if (/^\d+$/.test(param)) return list[Number(param)] ?? null;
  return list.includes(param) ? param : null;
};

const customAttribute = (tag: TagItem) => `${tag.object} / ${tag.attribute}`;

const HomeClient: FC<HomeClientProps> = ({ objects: builtInObjects, attributes: builtInAttributes, firstChunk, firstChunkTotal }) => {
  const t = useTranslations("ToolPage");
  const locale = useLocale();
  const { library, libraryReady } = useLocalTagLibrary();
  const libraryId = library?.id ?? null;
  const customLabel = t("customTags");

  const customTags = useMemo(() => {
    const entries = new Map<string, TagItem>();
    for (const tag of bundledCustomTags as TagItem[]) {
      const attribute = customAttribute(tag);
      entries.set(JSON.stringify([customLabel, attribute, tag.displayName]), { ...tag, object: customLabel, attribute });
    }
    if (library) {
      for (const tag of library.tags) {
        const { objectIndex, attributeIndex, ...entry } = tag;
        const legacy = library.id === LEGACY_LIBRARY_ID;
        const object = legacy ? customLabel : builtInObjects[objectIndex ?? -1] ?? entry.object;
        const attribute = legacy ? customAttribute(entry) : builtInAttributes[object]?.[attributeIndex ?? -1] ?? entry.attribute;
        entries.set(JSON.stringify([object, attribute, entry.displayName]), { ...entry, object, attribute, localLibraryId: library.id });
      }
    }
    return Array.from(entries.values());
  }, [builtInAttributes, builtInObjects, customLabel, library]);

  const attributesByObject = useMemo(() => {
    const groups = new Map(builtInObjects.map((object) => [object, new Set(builtInAttributes[object])]));
    for (const tag of customTags) {
      const group = groups.get(tag.object);
      if (group) group.add(tag.attribute);
      else groups.set(tag.object, new Set([tag.attribute]));
    }
    return new Map(Array.from(groups, ([object, attributes]) => [object, Array.from(attributes)]));
  }, [builtInAttributes, builtInObjects, customTags]);
  const objects = useMemo(() => Array.from(attributesByObject.keys()), [attributesByObject]);

  const [chosenObject, setActiveObject] = useState<string>(() => objects[0] ?? "");
  const activeObject = objects.includes(chosenObject) ? chosenObject : objects[0] ?? "";
  const builtInObjectIndex = builtInObjects.indexOf(activeObject);

  // 仅当前 object 的 tags（按需 fetch）
  const { tags: objectTags, status, retry: retryTags } = useObjectTags(locale, Math.max(0, builtInObjectIndex), firstChunk, firstChunkTotal);

  // 全局搜索与联想词共享同一份全量索引
  const fullTags = useFullTagsData(locale, firstChunk, builtInObjects.length, customTags);
  const { scanEntries, ensureLoaded, status: fullTagsStatus } = fullTags;

  const attributes = attributesByObject.get(activeObject) ?? [];

  const [chosenAttribute, setActiveAttribute] = useState<string>(() => attributes[0] ?? "");
  const activeAttribute = attributes.includes(chosenAttribute) ? chosenAttribute : attributes[0] ?? "";
  const tagsStatus = builtInObjectIndex < 0 || !builtInAttributes[activeObject]?.includes(activeAttribute) ? "ready" : status;
  const [selectedTags, setSelectedTags] = useState<TagItem[]>([]);
  if (libraryReady && selectedTags.some((tag) => tag.localLibraryId && tag.localLibraryId !== libraryId)) {
    setSelectedTags(selectedTags.filter((tag) => !tag.localLibraryId || tag.localLibraryId === libraryId));
  }

  const [viewMode, setViewMode] = useLocalStorage<"compact" | "visual">("tagViewMode", "visual");
  const [searchQuery, setSearchQuery] = useState("");
  const categoryGroupId = useId();
  const explorerControlsRef = useRef<HTMLDivElement>(null);
  const trimmedQuery = searchQuery.trim();
  const isSearching = trimmedQuery.length > 0;

  // React 19 "adjust state on dep change": object 切换重置 attribute
  const [previousActiveObject, setPreviousActiveObject] = useState(activeObject);
  if (previousActiveObject !== activeObject) {
    setPreviousActiveObject(activeObject);
    setActiveAttribute(attributes[0] ?? "");
  }

  // URL state on init: read from hash (#object=..&attribute=..) or legacy ?object=..&attribute=..
  const urlInitDoneRef = useRef(false);
  const [urlInitDone, setUrlInitDone] = useState(false);
  useEffect(() => {
    if (!libraryReady || urlInitDoneRef.current || typeof window === "undefined") return;
    urlInitDoneRef.current = true;

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const queryParams = new URLSearchParams(window.location.search);
    const objParam = hashParams.get("object") ?? queryParams.get("object");
    const attrParam = hashParams.get("attribute") ?? queryParams.get("attribute");

    const objName = resolveCategoryParam(objParam, objects);
    if (objName) {
      const newAttrs = attributesByObject.get(objName) ?? [];
      const validAttr = resolveCategoryParam(attrParam, newAttrs) ?? newAttrs[0] ?? "";
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveObject(objName);
      setPreviousActiveObject(objName);
      setActiveAttribute(validAttr);
    }
    setUrlInitDone(true);
  }, [libraryReady, objects, attributesByObject]);

  useEffect(() => {
    const onHashChange = () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const objName = resolveCategoryParam(hashParams.get("object"), objects);
      if (!objName) return;
      const newAttrs = attributesByObject.get(objName) ?? [];
      setActiveObject(objName);
      setPreviousActiveObject(objName);
      setActiveAttribute(resolveCategoryParam(hashParams.get("attribute"), newAttrs) ?? newAttrs[0] ?? "");
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [objects, attributesByObject]);

  // state → URL (write to hash, never query — keeps canonical URL clean for SEO)
  useEffect(() => {
    if (!urlInitDone || typeof window === "undefined") return;
    const url = new URL(window.location.href);
    url.searchParams.delete("object");
    url.searchParams.delete("attribute");
    const hashParams = new URLSearchParams();
    const objIdx = objects.indexOf(activeObject);
    const attrIdx = (attributesByObject.get(activeObject) ?? []).indexOf(activeAttribute);
    if (objIdx > 0 || attrIdx > 0) {
      hashParams.set("object", String(Math.max(0, objIdx)));
      hashParams.set("attribute", String(Math.max(0, attrIdx)));
    }
    url.hash = hashParams.toString() ? `#${hashParams.toString()}` : "";
    const nextUrl = url.toString();
    if (nextUrl !== window.location.href) {
      window.history.replaceState({}, "", nextUrl);
    }
  }, [activeObject, activeAttribute, objects, attributesByObject, urlInitDone]);

  const scrollToTagListStart = useCallback(() => {
    const controls = explorerControlsRef.current;
    const explorer = controls?.parentElement;
    if (!controls || !explorer) return;
    const { position, insetBlockStart } = getComputedStyle(controls);
    // 工具栏已经吸顶时，回到新列表的第一行。
    if (position === "sticky" && explorer.getBoundingClientRect().top < parseFloat(insetBlockStart)) {
      explorer.scrollIntoView({ block: "start" });
    }
  }, []);

  const handleObjectClick = useCallback((object: string) => {
    scrollToTagListStart();
    setActiveObject(object);
    setSearchQuery("");
  }, [scrollToTagListStart]);

  const handleAttributeClick = useCallback((attribute: string) => {
    scrollToTagListStart();
    setActiveAttribute(attribute);
  }, [scrollToTagListStart]);

  function updateSearchQuery(query: string) {
    scrollToTagListStart();
    setSearchQuery(query);
  }

  function showImportedTags(firstTag: TagItem) {
    scrollToTagListStart();
    setActiveObject(firstTag.object);
    setPreviousActiveObject(firstTag.object);
    setActiveAttribute(firstTag.attribute);
    setSearchQuery("");
  }

  const handleTagClick = useCallback((tag: TagItem) => {
    setSelectedTags((prev) => {
      const isSelected = prev.some((t) => t.displayName === tag.displayName);
      return isSelected ? prev.filter((t) => t.displayName !== tag.displayName) : [...prev, tag];
    });
  }, []);

  const selectedNameSet = useMemo(() => new Set(selectedTags.map((t) => t.displayName)), [selectedTags]);

  const selectedCountByObject = useMemo(() => {
    const counts = new Map<string, number>();
    for (const tag of selectedTags) {
      if (tag.object) counts.set(tag.object, (counts.get(tag.object) ?? 0) + 1);
    }
    return counts;
  }, [selectedTags]);

  const selectedCountByAttr = useMemo(() => {
    const counts = new Map<string, number>();
    for (const tag of selectedTags) {
      if (tag.object === activeObject && tag.attribute) {
        counts.set(tag.attribute, (counts.get(tag.attribute) ?? 0) + 1);
      }
    }
    return counts;
  }, [selectedTags, activeObject]);

  const filteredTags = useMemo(() => {
    const tags = new Map<string, TagItem>();
    if (builtInObjectIndex >= 0) {
      for (const tag of objectTags) if (tag.attribute === activeAttribute) tags.set(tag.displayName, tag);
    }
    for (const tag of customTags) {
      if (tag.object === activeObject && tag.attribute === activeAttribute && !tags.has(tag.displayName)) {
        tags.set(tag.displayName, tag);
      }
    }
    return Array.from(tags.values());
  }, [activeAttribute, activeObject, builtInObjectIndex, customTags, objectTags]);

  const searchResults = useMemo(() => {
    const q = normalizeString(trimmedQuery);
    if (!q) return [];
    const pool = scanEntries ?? [];
    const scored: { tag: TagItem; rank: number; len: number; norm: string }[] = [];
    const seen = new Set<string>();

    const pushCandidate = (tag: TagItem, dn: string, ln: string) => {
      if (seen.has(tag.displayName)) return;
      let rank = -1;
      let matchedNorm = dn;
      if (ln === q || dn === q) {
        rank = 0;
        matchedNorm = ln === q ? ln : dn;
      } else if (ln.startsWith(q)) {
        rank = 1;
        matchedNorm = ln;
      } else if (dn.startsWith(q)) {
        rank = 2;
        matchedNorm = dn;
      } else if (ln.includes(q)) {
        rank = 3;
        matchedNorm = ln;
      } else if (dn.includes(q)) {
        rank = 4;
        matchedNorm = dn;
      }
      if (rank < 0) return;
      seen.add(tag.displayName);
      scored.push({ tag, rank, len: matchedNorm.length, norm: matchedNorm });
    };

    for (const entry of pool) pushCandidate(entry.tag, entry.dn, entry.ln);
    for (const tag of objectTags) pushCandidate(tag, normalizeString(tag.displayName), normalizeString(tag.langName));

    scored.sort((a, b) => {
      if (a.rank !== b.rank) return a.rank - b.rank;
      if (a.len !== b.len) return a.len - b.len;
      return a.norm.localeCompare(b.norm);
    });

    return scored.slice(0, 120).map((s) => s.tag);
  }, [trimmedQuery, scanEntries, objectTags]);

  const displayedTags = isSearching ? searchResults : filteredTags;

  return (
    <div className="pp-workbench">
      {/* 桌面端左侧主体导航轨 */}
      <aside className="pp-rail" aria-label={t("section1")}>
        <div className="pp-rail-head">
          <span className="pp-rail-title">{t("section1")}</span>
          <span className="pp-rail-total">{objects.length}</span>
        </div>
        <div className="pp-rail-list" role="radiogroup" aria-label={t("section1")}>
          {objects.map((obj) => {
            const active = !isSearching && obj === activeObject;
            const count = selectedCountByObject.get(obj) ?? 0;
            return (
              <label key={obj} className={`pp-rail-item${active ? " is-active" : ""}`}>
                <input type="radio" name={categoryGroupId} checked={active} className="sr-only" onChange={() => handleObjectClick(obj)} />
                <span className="pp-rail-name">{obj}</span>
                {count > 0 && <span className="pp-rail-badge">{count}</span>}
              </label>
            );
          })}
        </div>
      </aside>

      {/* 中间选词工作区 */}
      <section className="pp-explorer" aria-label={t("section3")}>
        <div className="pp-explorer-controls" ref={explorerControlsRef}>
          {/* 平板/手机端主体分类 */}
          <div className="pp-rail-inline">
            <CategoryRadio className="pp-cats" label={t("section1")} items={objects} value={isSearching ? "" : activeObject} counts={selectedCountByObject} onChange={handleObjectClick} />
          </div>

          <div className="pp-explorer-bar">
            <Input
              allowClear
              className="pp-search-input"
              prefix={<SearchOutlined />}
              placeholder={t("searchPlaceholder")}
              aria-label={t("searchPlaceholder")}
              value={searchQuery}
              onFocus={() => ensureLoaded(true)}
              onChange={(e) => {
                ensureLoaded(true);
                updateSearchQuery(e.target.value);
              }}
            />
            <Segmented
              size="small"
              value={viewMode}
              onChange={(v) => {
                scrollToTagListStart();
                setViewMode(v as "compact" | "visual");
              }}
              options={[
                { value: "visual", icon: <AppstoreOutlined />, label: <span className="max-[480px]:sr-only">{t("tagView-visual")}</span> },
                { value: "compact", icon: <UnorderedListOutlined />, label: <span className="max-[480px]:sr-only">{t("tagView-compact")}</span> },
              ]}
            />
          </div>

          {isSearching ? (
            <Flex align="center" justify="space-between" gap={8} className="pp-search-meta">
              <Flex align="center" gap={8}>
                <span role="status">{t("searchResults", { count: searchResults.length })}</span>
                {fullTagsStatus === "loading" && <Spin size="small" />}
              </Flex>
              <Button type="link" size="small" onClick={() => updateSearchQuery("")}>
                {t("clearSearch")}
              </Button>
            </Flex>
          ) : (
            <div className="pp-cat-bar">
              <CategoryRadio className="pp-subs" label={t("section2")} items={attributes} value={activeAttribute} counts={selectedCountByAttr} onChange={handleAttributeClick} />
            </div>
          )}
        </div>

        <div className="pp-tag-stage" onFocus={(event) => {
          const controls = explorerControlsRef.current;
          if (!controls || !event.target.matches(":focus-visible") || getComputedStyle(controls).position !== "sticky") return;
          // 用键盘往回选词时，避免焦点停在工具栏后面。
          const overlap = controls.getBoundingClientRect().bottom + 6 - event.target.getBoundingClientRect().top;
          if (overlap > 0) window.scrollBy(0, -overlap);
        }}>
          {displayedTags.length > 0 && (
            <TagSection
              tags={displayedTags}
              selectedNameSet={selectedNameSet}
              onTagClick={handleTagClick}
              viewMode={viewMode}
              showPath={isSearching}
            />
          )}
          {isSearching && searchResults.length === 0 && fullTagsStatus === "ready" && (
            <div className="pp-search-empty">
              <span>{t("searchEmpty")}</span>
              <Button size="small" onClick={() => updateSearchQuery("")}>
                {t("clearSearch")}
              </Button>
            </div>
          )}
          {/* aria-live 容器必须常驻：空态由 .pp-tag-state:empty 压成 0 高 */}
          <div className="pp-tag-state" role="status" aria-live="polite">
            {!isSearching && tagsStatus === "loading" && (
              <>
                <Spin size="small" />
                <span>{t("tagsLoading")}</span>
              </>
            )}
            {(isSearching ? fullTagsStatus === "error" : tagsStatus === "error") && (
              <>
                <span>{t("tagsError")}</span>
                <Button size="small" onClick={isSearching ? () => ensureLoaded(true) : retryTags}>
                  {t("retry")}
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 右侧提示词组装台 */}
      <div className="pp-workbench-side">
        <ResultSection
          selectedTags={selectedTags}
          setSelectedTags={setSelectedTags}
          onRemoveTag={handleTagClick}
          fullTags={fullTags}
          customTags={customTags}
          libraryId={libraryId}
          libraryReady={libraryReady}
          hasLibrary={!!library}>
          <LocalTagLibrary
            hasLibrary={!!library}
            ready={libraryReady}
            objects={builtInObjects}
            attributes={builtInAttributes}
            onImported={showImportedTags}
          />
        </ResultSection>
      </div>
    </div>
  );
};

export default HomeClient;
