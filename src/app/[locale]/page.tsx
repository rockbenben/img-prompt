"use client";
import { useState, useEffect, useContext, FC, useMemo, useCallback } from "react";
import { Row, Col, Typography } from "antd";

import { DataContext } from "../utils/DataContext";
import tagsData2 from "../data/prompt-custom.json";

import ObjectSection from "../components/ObjectSection";
import AttributeSection from "../components/AttributeSection";
import TagSection from "../components/TagSection";
import SelectedTagsSection from "../components/SelectedTagsSection";
import ResultSection from "../components/ResultSection";
import { TagItem } from "../components/types";

import { useTranslations } from "next-intl";

const { Title } = Typography;

const getObjects = (data: TagItem[]): string[] => {
  const objectsSet = new Set(data.map((tag) => tag.object));
  return Array.from(objectsSet);
};

const getAttributes = (currentObject: string, data: TagItem[]): string[] => {
  const attributesSet = new Set(data.filter((tag) => tag.object === currentObject).map((tag) => tag.attribute));
  return Array.from(attributesSet);
};

const Home: FC = () => {
  const tagsData1 = useContext(DataContext);
  const t = useTranslations("ToolPage");
  const combinedTagsData: TagItem[] = useMemo(() => [...tagsData1, ...tagsData2], [tagsData1]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const objects = useMemo(() => getObjects(combinedTagsData), []);
  const [activeObject, setActiveObject] = useState(objects[0]);
  const [selectedTags, setSelectedTags] = useState<TagItem[]>([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const attributes = useMemo(() => getAttributes(activeObject, combinedTagsData), [activeObject]);

  useEffect(() => {
    if (attributes.length > 0) {
      setActiveAttribute(attributes[0]);
    }
  }, [attributes]);

  const [activeAttribute, setActiveAttribute] = useState(attributes[0]);

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

  return (
    <>
      <Title level={2} className="flex justify-center items-center">
        IMGPrompt
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={18}>
          <Title level={5} className="m-2">
            1️⃣{t("section1")}
          </Title>
          <ObjectSection objects={objects} activeObject={activeObject} onObjectClick={handleObjectClick} />
          <Title level={5} className="m-2">
            2️⃣{t("section2")}
          </Title>
          <AttributeSection attributes={attributes} selectedAttribute={activeAttribute} onAttributeClick={handleAttributeClick} />
          <Title level={5} className="m-2">
            3️⃣{t("section3")}
          </Title>
          <TagSection tags={combinedTagsData.filter((tag) => tag.object === activeObject && tag.attribute === activeAttribute)} selectedTags={selectedTags} onTagClick={handleTagClick} />
          <Title level={5} className="m-2">
            {t("section4")}
          </Title>
          <SelectedTagsSection selectedTags={selectedTags} onTagClick={handleTagClick} />
        </Col>
        <Col xs={24} lg={6}>
          <ResultSection selectedTags={selectedTags} setSelectedTags={setSelectedTags} tagsData={combinedTagsData} />
        </Col>
      </Row>
    </>
  );
};

export default Home;
