"use client";
import { useState, useEffect, FC, useMemo, useCallback } from "react";
import { Row, Col, Typography } from "antd";

import tagsData1 from "./prompt.json";
import tagsData2 from "./prompt-custom.json";
import ObjectSection from "./components/ObjectSection";
import AttributeSection from "./components/AttributeSection";
import TagSection from "./components/TagSection";
import SelectedTagsSection from "./components/SelectedTagsSection";
import ResultSection from "./components/ResultSection";

interface Tag {
  object: string;
  attribute: string;
  displayName: string;
  langName: string;
}

const { Title } = Typography;

const getObjects = (data: Tag[]): string[] => {
  const objectsSet = new Set(data.map((tag) => tag.object));
  return Array.from(objectsSet);
};

const getAttributes = (currentObject: string, data: Tag[]): string[] => {
  const attributesSet = new Set(data.filter((tag) => tag.object === currentObject).map((tag) => tag.attribute));
  return Array.from(attributesSet);
};

const Home: FC = () => {
  const combinedTagsData: Tag[] = useMemo(() => [...tagsData1, ...tagsData2], []);
  const objects = useMemo(() => getObjects(combinedTagsData), []);
  const [activeObject, setActiveObject] = useState(objects[0]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

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

  const handleTagClick = useCallback((tag: Tag) => {
    setSelectedTags((prevSelectedTags) => {
      const isSelected = prevSelectedTags.some((t) => t.displayName === tag.displayName);
      return isSelected ? prevSelectedTags.filter((t) => t.displayName !== tag.displayName) : [...prevSelectedTags, tag];
    });
  }, []);

  return (
    <>
      <Title
        level={2}
        style={{
          marginBottom: "24px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}>
        IMGPrompt
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={18}>
          <h3 className="m-2 font-bold">1️⃣选择对象</h3>
          <ObjectSection objects={objects} activeObject={activeObject} onObjectClick={handleObjectClick} />
          <h3 className="m-2 font-bold">2️⃣选择属性</h3>
          <AttributeSection attributes={attributes} selectedAttribute={activeAttribute} onAttributeClick={handleAttributeClick} />
          <h3 className="m-2 font-bold">3️⃣选择标签</h3>
          <TagSection tags={combinedTagsData.filter((tag) => tag.object === activeObject && tag.attribute === activeAttribute)} selectedTags={selectedTags} onTagClick={handleTagClick} />
          <h3 className="m-2 font-bold">当前选中</h3>
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
