"use client";
import { useState, useMemo, useCallback, useEffect, useRef, FC } from "react";
import { useSearchParams } from "next/navigation";
import { Row, Col, Typography, Card, Flex, Grid, Segmented, theme } from "antd";
import { CheckSquareOutlined } from "@ant-design/icons";

import tagsData2 from "@/app/data/prompt-custom.json";

import ObjectSection from "@/app/components/ObjectSection";
import AttributeSection from "@/app/components/AttributeSection";
import TagSection from "@/app/components/TagSection";
import TagSectionMulticolor from "@/app/components/TagSectionMulticolor";
import SelectedTagsSection from "@/app/components/SelectedTagsSection";
import ResultSection from "@/app/components/ResultSection";
import { TagItem } from "@/app/components/types";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";

import { useTranslations } from "next-intl";

const { Title, Paragraph } = Typography;

const getObjects = (data: TagItem[]): string[] => {
  const objectsSet = new Set(data.map((tag) => tag.object));
  return Array.from(objectsSet);
};

const getAttributes = (currentObject: string, data: TagItem[]): string[] => {
  const attributesSet = new Set(data.filter((tag) => tag.object === currentObject).map((tag) => tag.attribute));
  return Array.from(attributesSet);
};

interface SectionTitleProps {
  index: number;
  title: React.ReactNode;
}

const SectionTitle: FC<SectionTitleProps> = ({ index, title }) => {
  const { token } = theme.useToken();
  return (
    <Flex align="center" gap={8}>
      <span
        aria-hidden="true"
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 22,
          height: 22,
          borderRadius: "50%",
          backgroundColor: token.colorPrimary,
          color: token.colorTextLightSolid,
          fontSize: token.fontSize,
          fontWeight: 600,
          lineHeight: 1,
          flexShrink: 0,
        }}>
        {index}
      </span>
      <Title level={5} style={{ margin: 0 }}>
        {title}
      </Title>
    </Flex>
  );
};

interface HomeClientProps {
  tagsData: TagItem[];
}

const HomeClient: FC<HomeClientProps> = ({ tagsData }) => {
  const t = useTranslations("ToolPage");
  const tHome = useTranslations("Home");
  const screens = Grid.useBreakpoint();
  const searchParams = useSearchParams();

  // Memoized derivations — tagsData is static (loaded once from JSON), so all derivations are stable
  const combinedTagsData = useMemo<TagItem[]>(() => [...tagsData, ...tagsData2], [tagsData]);
  const objects = useMemo(() => getObjects(combinedTagsData), [combinedTagsData]);

  const [activeObject, setActiveObject] = useState<string>(() => objects[0] ?? "");
  const attributes = useMemo(() => getAttributes(activeObject, combinedTagsData), [activeObject, combinedTagsData]);

  const [activeAttribute, setActiveAttribute] = useState<string>(() => attributes[0] ?? "");
  const [selectedTags, setSelectedTags] = useState<TagItem[]>([]);
  const [useColorBlocks, setUseColorBlocks] = useLocalStorage<boolean>("useColorBlocks", true);

  // React 19 "adjust state on dep change" pattern: reset attribute when object changes
  const [previousActiveObject, setPreviousActiveObject] = useState(activeObject);
  if (previousActiveObject !== activeObject) {
    setPreviousActiveObject(activeObject);
    setActiveAttribute(attributes[0] ?? "");
  }

  // URL ?object=xxx&attribute=yyy → state (one-time on mount, post-hydration to avoid SSR mismatch)
  const urlInitDoneRef = useRef(false);
  const [urlInitDone, setUrlInitDone] = useState(false);
  useEffect(() => {
    if (urlInitDoneRef.current) return;
    urlInitDoneRef.current = true;
    const objParam = searchParams.get("object");
    if (objParam && objects.includes(objParam)) {
      const newAttrs = getAttributes(objParam, combinedTagsData);
      const attrParam = searchParams.get("attribute");
      const validAttr = attrParam && newAttrs.includes(attrParam) ? attrParam : (newAttrs[0] ?? "");
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveObject(objParam);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviousActiveObject(objParam); // suppress the in-render reset for this initial load
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveAttribute(validAttr);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setUrlInitDone(true);
  }, [searchParams, objects, combinedTagsData]);

  // state → URL ?object=xxx&attribute=yyy (after init, so we don't overwrite the URL before reading it)
  useEffect(() => {
    if (!urlInitDone || typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (activeObject) url.searchParams.set("object", activeObject);
    else url.searchParams.delete("object");
    if (activeAttribute) url.searchParams.set("attribute", activeAttribute);
    else url.searchParams.delete("attribute");
    window.history.replaceState({}, "", url.toString());
  }, [activeObject, activeAttribute, urlInitDone]);

  const handleObjectClick = useCallback((object: string) => {
    setActiveObject(object);
  }, []);

  const handleAttributeClick = useCallback((attribute: string) => {
    setActiveAttribute(attribute);
  }, []);

  const handleTagClick = useCallback((tag: TagItem) => {
    setSelectedTags((prevSelectedTags) => {
      const isSelected = prevSelectedTags.some((t) => t.displayName === tag.displayName);
      return isSelected ? prevSelectedTags.filter((t) => t.displayName !== tag.displayName) : [...prevSelectedTags, tag];
    });
  }, []);

  const filteredTags = useMemo(
    () => combinedTagsData.filter((tag) => tag.object === activeObject && tag.attribute === activeAttribute),
    [combinedTagsData, activeObject, activeAttribute],
  );

  const tagSectionContent = useColorBlocks ? (
    <TagSectionMulticolor tags={filteredTags} selectedTags={selectedTags} onTagClick={handleTagClick} />
  ) : (
    <TagSection tags={filteredTags} selectedTags={selectedTags} onTagClick={handleTagClick} />
  );

  return (
    <>
      <header style={{ textAlign: "center", marginBottom: 12 }}>
        <Title level={1} style={{ marginBottom: 4, fontSize: "clamp(1.1rem, 3.5vw, 2rem)" }}>
          {tHome("h1")}
        </Title>
        {screens.md && (
          <Paragraph type="secondary" style={{ marginBottom: 0, fontSize: 14 }}>
            {tHome("tagline")}
          </Paragraph>
        )}
      </header>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={18}>
          <Card variant="borderless">
            <div style={{ marginBottom: 12 }}>
              <SectionTitle index={1} title={t("section1")} />
            </div>
            <ObjectSection objects={objects} activeObject={activeObject} onObjectClick={handleObjectClick} />

            <div style={{ marginTop: 16 }}>
              <div style={{ marginBottom: 12 }}>
                <SectionTitle index={2} title={t("section2")} />
              </div>
              <AttributeSection attributes={attributes} selectedAttribute={activeAttribute} onAttributeClick={handleAttributeClick} />
            </div>

            <div style={{ marginTop: 16 }}>
              <Flex justify="space-between" align="center" gap={8} style={{ marginBottom: 12 }}>
                <SectionTitle index={3} title={t("section3")} />
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
              <div style={{ maxHeight: "clamp(320px, 60vh, 720px)", overflowY: "auto" }}>{tagSectionContent}</div>
            </div>
          </Card>
          {selectedTags.length > 0 && (
            <>
              {screens.md && (
                <Title level={5} style={{ margin: "16px 8px 8px" }}>
                  <CheckSquareOutlined style={{ marginRight: 8 }} />
                  {t("currentSelection")}
                </Title>
              )}
              <SelectedTagsSection selectedTags={selectedTags} onTagClick={handleTagClick} />
            </>
          )}
        </Col>
        <Col xs={24} lg={6}>
          <ResultSection selectedTags={selectedTags} setSelectedTags={setSelectedTags} tagsData={combinedTagsData} />
        </Col>
      </Row>
    </>
  );
};

export default HomeClient;
