"use client";
import { useState, useMemo, useCallback, useEffect, useRef, FC } from "react";
import { useSearchParams } from "next/navigation";
import { Row, Col, Flex, Segmented } from "antd";

import tagsData2 from "@/app/data/prompt-custom.json";

import CategoryRadio from "@/app/components/CategoryRadio";
import TagSection from "@/app/components/TagSection";
import SelectedTagsSection from "@/app/components/SelectedTagsSection";
import ResultSection from "@/app/components/ResultSection";
import { TagItem } from "@/app/components/types";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";
import { useObjectTags } from "@/app/hooks/useObjectTags";

import { useLocale, useTranslations } from "next-intl";

interface SectionTitleProps {
  index: number;
  title: React.ReactNode;
  gloss: string;
}

// 托盘头：candy 编号徽章 + 标题 + 英文小注（装饰性，不进 i18n）
const SectionTitle: FC<SectionTitleProps> = ({ index, title, gloss }) => (
  <Flex align="center" gap={10}>
    <span aria-hidden="true" className={`pp-badge pp-badge-${index}`}>
      {index}
    </span>
    <span className="pp-sec-title">{title}</span>
    <span className="pp-sec-gloss" aria-hidden="true">
      {gloss}
    </span>
  </Flex>
);

interface HomeClientProps {
  objects: string[];
  attributes: Record<string, string[]>;
  firstChunk: TagItem[];
}

// 分享链接参数解析：索引（新格式，locale 无关）→ 对应名字；
// 非数字按名字匹配（旧格式兼容）；无效一律 null
const resolveCategoryParam = (param: string | null, list: string[]): string | null => {
  if (!param) return null;
  if (/^\d+$/.test(param)) return list[Number(param)] ?? null;
  return list.includes(param) ? param : null;
};

const HomeClient: FC<HomeClientProps> = ({ objects, attributes: attributesByObject, firstChunk }) => {
  const t = useTranslations("ToolPage");
  const searchParams = useSearchParams();
  const locale = useLocale();

  const [activeObject, setActiveObject] = useState<string>(() => objects[0] ?? "");
  const activeObjectIndex = useMemo(
    () => Math.max(0, objects.indexOf(activeObject)),
    [objects, activeObject],
  );

  // 仅当前 object 的 tags（按需 fetch）
  const objectTags = useObjectTags(locale, activeObjectIndex, firstChunk);

  // 合并 custom 标签（小）
  const combinedTagsData = useMemo<TagItem[]>(
    () => [...objectTags, ...(tagsData2 as TagItem[]).filter((t) => t.object === activeObject)],
    [objectTags, activeObject],
  );

  const attributes = useMemo(
    () => attributesByObject[activeObject] ?? [],
    [attributesByObject, activeObject],
  );

  const [activeAttribute, setActiveAttribute] = useState<string>(() => attributes[0] ?? "");
  const [selectedTags, setSelectedTags] = useState<TagItem[]>([]);
  const [useColorBlocks, setUseColorBlocks] = useLocalStorage<boolean>("useColorBlocks", true);

  // 已选标签会话级持久化：站内往返（指南页）与误刷新不丢编辑现场；
  // 新标签页/新会话从空开始。挂载后恢复以保证 SSG hydration 一致。
  // 按 locale 分键：标签的 langName/object/attribute 是语言相关数据，
  // 跨语言恢复会把 zh 的中文注释和分组头带进 en 界面。
  const tagStoreKey = `imgprompt-selected-tags:${locale}`;
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(tagStoreKey);
      if (raw) {
        const saved = JSON.parse(raw) as TagItem[];
        if (Array.isArray(saved) && saved.length > 0) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setSelectedTags(saved);
        }
      }
    } catch {
      /* 损坏的存档直接忽略 */
    }
  }, [tagStoreKey]);
  useEffect(() => {
    try {
      sessionStorage.setItem(tagStoreKey, JSON.stringify(selectedTags));
    } catch {
      /* 配额/隐私模式下静默放弃 */
    }
  }, [tagStoreKey, selectedTags]);

  // React 19 "adjust state on dep change": object 切换重置 attribute
  const [previousActiveObject, setPreviousActiveObject] = useState(activeObject);
  if (previousActiveObject !== activeObject) {
    setPreviousActiveObject(activeObject);
    setActiveAttribute(attributes[0] ?? "");
  }

  // URL state on init: read from hash (#object=..&attribute=..) or legacy ?object=..&attribute=..
  // 哈希值是分类索引（locale 无关：同一索引在 18 语言里指向同一分类，
  // 链接跨语言可移植、CJK 不再百分号编码成乱码）；旧链接里的本地化名字
  // 与 ?object= 查询参数走名字匹配继续兼容。
  const urlInitDoneRef = useRef(false);
  const [urlInitDone, setUrlInitDone] = useState(false);
  useEffect(() => {
    if (urlInitDoneRef.current || typeof window === "undefined") return;
    urlInitDoneRef.current = true;

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const objParam = hashParams.get("object") ?? searchParams.get("object");
    const attrParam = hashParams.get("attribute") ?? searchParams.get("attribute");

    const objName = resolveCategoryParam(objParam, objects);
    if (objName) {
      const newAttrs = attributesByObject[objName] ?? [];
      const validAttr = resolveCategoryParam(attrParam, newAttrs) ?? newAttrs[0] ?? "";
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveObject(objName);
      setPreviousActiveObject(objName);
      setActiveAttribute(validAttr);
    }
    setUrlInitDone(true);
  }, [searchParams, objects, attributesByObject]);

  // 同 tab 内 hash 变化（把分享链接粘进已打开页面的地址栏 = 浏览器仅做
  // hash 跳转不重载）：init 只跑一次接不住，这里补上。分类点击走
  // replaceState 不触发 hashchange，不会自循环。
  useEffect(() => {
    const onHashChange = () => {
      const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
      const objName = resolveCategoryParam(hashParams.get("object"), objects);
      if (!objName) return;
      const newAttrs = attributesByObject[objName] ?? [];
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
    // Drop any legacy query params that the canonical doesn't include.
    url.searchParams.delete("object");
    url.searchParams.delete("attribute");
    const hashParams = new URLSearchParams();
    const objIdx = objects.indexOf(activeObject);
    const attrIdx = (attributesByObject[activeObject] ?? []).indexOf(activeAttribute);
    // 默认落点（首个 object + 首个 attribute）= 无 hash 时的状态，不写 hash，
    // 保持打开时地址栏干净；任一维非默认才写。object 必须同写——读取端缺
    // object 参数时不会单独恢复 attribute（resolveCategoryParam(null) 返回 null）。
    if (objIdx > 0 || attrIdx > 0) {
      hashParams.set("object", String(Math.max(0, objIdx)));
      hashParams.set("attribute", String(Math.max(0, attrIdx)));
    }
    url.hash = hashParams.toString() ? `#${hashParams.toString()}` : "";
    // 守卫：URL 未变则不写。避免启动时冗余 history 写入；也确保桌面版(app 分支)语言恢复的
    // router.replace 不被此处 replaceState 覆盖（读到未提交的旧 locale）。
    const nextUrl = url.toString();
    if (nextUrl !== window.location.href) {
      window.history.replaceState({}, "", nextUrl);
    }
  }, [activeObject, activeAttribute, objects, attributesByObject, urlInitDone]);

  const handleObjectClick = useCallback((object: string) => {
    setActiveObject(object);
  }, []);

  const handleAttributeClick = useCallback((attribute: string) => {
    setActiveAttribute(attribute);
  }, []);

  const handleTagClick = useCallback((tag: TagItem) => {
    setSelectedTags((prev) => {
      const isSelected = prev.some((t) => t.displayName === tag.displayName);
      return isSelected ? prev.filter((t) => t.displayName !== tag.displayName) : [...prev, tag];
    });
  }, []);

  const selectedNameSet = useMemo(
    () => new Set(selectedTags.map((t) => t.displayName)),
    [selectedTags],
  );

  const filteredTags = useMemo(
    () => combinedTagsData.filter((tag) => tag.attribute === activeAttribute),
    [combinedTagsData, activeAttribute],
  );

  return (
    <>
      <Row gutter={[18, 18]}>
        <Col xs={24} lg={18}>
          <Flex vertical gap={16}>
            <section className="pp-tray">
              <div style={{ marginBottom: 13 }}>
                <SectionTitle index={1} title={t("section1")} gloss="Subject" />
              </div>
              <CategoryRadio className="pp-cats" items={objects} value={activeObject} onChange={handleObjectClick} />
            </section>

            <section className="pp-tray">
              <div style={{ marginBottom: 13 }}>
                <SectionTitle index={2} title={t("section2")} gloss="Facet" />
              </div>
              <CategoryRadio className="pp-subs" items={attributes} value={activeAttribute} onChange={handleAttributeClick} />
            </section>

            <section className="pp-tray">
              <Flex justify="space-between" align="center" gap={8} style={{ marginBottom: 10 }}>
                <SectionTitle index={3} title={t("section3")} gloss="Pick your pigments" />
                <Segmented
                  size="small"
                  value={useColorBlocks ? "multicolor" : "monochrome"}
                  onChange={(v) => setUseColorBlocks(v === "multicolor")}
                  options={[
                    { label: t("tagMode-multicolor"), value: "multicolor" },
                    { label: t("tagMode-monochrome"), value: "monochrome" },
                  ]}
                />
              </Flex>
              <div style={{ maxHeight: "clamp(280px, 36vh, 400px)", overflowY: "auto" }}>
                <TagSection tags={filteredTags} selectedNameSet={selectedNameSet} onTagClick={handleTagClick} mono={!useColorBlocks} />
              </div>
            </section>
          </Flex>
          {selectedTags.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <SelectedTagsSection selectedTags={selectedTags} onTagClick={handleTagClick} />
            </div>
          )}
        </Col>
        <Col xs={24} lg={6}>
          <ResultSection selectedTags={selectedTags} setSelectedTags={setSelectedTags} firstChunk={firstChunk} objectCount={objects.length} />
        </Col>
      </Row>
    </>
  );
};

export default HomeClient;
