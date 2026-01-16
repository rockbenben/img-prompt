"use client";
import { useState, useEffect, FC } from "react";
import { Row, Col, Typography, Steps, Card, Switch, Space } from "antd";
import { CheckSquareOutlined, AppstoreOutlined, TagsOutlined } from "@ant-design/icons";

import tagsData2 from "@/app/data/prompt-custom.json";

import ObjectSection from "@/app/components/ObjectSection";
import AttributeSection from "@/app/components/AttributeSection";
import TagSection from "@/app/components/TagSection";
import TagSectionCheckable from "@/app/components/TagSectionCheckable";
import SelectedTagsSection from "@/app/components/SelectedTagsSection";
import ResultSection from "@/app/components/ResultSection";
import { TagItem } from "@/app/components/types";
import { useLocalStorage } from "@/app/hooks/useLocalStorage";

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

interface HomeClientProps {
  tagsData: TagItem[];
}

const HomeClient: FC<HomeClientProps> = ({ tagsData }) => {
  const t = useTranslations("ToolPage");
  const combinedTagsData: TagItem[] = [...tagsData, ...tagsData2];
  const objects = getObjects(combinedTagsData);
  const [activeObject, setActiveObject] = useState<string>("");
  const [activeAttribute, setActiveAttribute] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<TagItem[]>([]);
  const [useColorBlocks, setUseColorBlocks] = useLocalStorage<boolean>("useColorBlocks", true);

  const attributes = getAttributes(activeObject, combinedTagsData);

  useEffect(() => {
    if (objects.length > 0 && !activeObject) {
      setActiveObject(objects[0]);
    }
  }, [objects, activeObject]);

  useEffect(() => {
    if (attributes.length > 0) {
      setActiveAttribute(attributes[0]);
    }
  }, [activeObject]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleObjectClick = (object: string) => {
    setActiveObject(object);
  };

  const handleAttributeClick = (attribute: string) => {
    setActiveAttribute(attribute);
  };

  const handleTagClick = (tag: TagItem) => {
    setSelectedTags((prevSelectedTags) => {
      const isSelected = prevSelectedTags.some((t) => t.displayName === tag.displayName);
      return isSelected ? prevSelectedTags.filter((t) => t.displayName !== tag.displayName) : [...prevSelectedTags, tag];
    });
  };

  const filteredTags = combinedTagsData.filter((tag) => tag.object === activeObject && tag.attribute === activeAttribute);

  const tagSectionContent = useColorBlocks ? (
    <TagSection tags={filteredTags} selectedTags={selectedTags} onTagClick={handleTagClick} />
  ) : (
    <TagSectionCheckable tags={filteredTags} selectedTags={selectedTags} onTagClick={handleTagClick} />
  );

  const stepsItems = [
    {
      title: t("section1"),
      content: <ObjectSection objects={objects} activeObject={activeObject} onObjectClick={handleObjectClick} />,
    },
    {
      title: t("section2"),
      content: <AttributeSection attributes={attributes} selectedAttribute={activeAttribute} onAttributeClick={handleAttributeClick} />,
    },
    {
      title: (
        <Space size="small">
          {t("section3")}
          <Switch size="small" checked={useColorBlocks} onChange={setUseColorBlocks} checkedChildren={<AppstoreOutlined />} unCheckedChildren={<TagsOutlined />} />
        </Space>
      ),
      content: tagSectionContent,
    },
  ];

  return (
    <>
      <Title level={2} style={{ textAlign: "center" }} className="hide-on-mobile">
        IMGPrompt
      </Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={18}>
          <Card variant="borderless">
            <Steps orientation="vertical" size="small" current={-1} items={stepsItems} />
          </Card>
          {selectedTags.length > 0 && (
            <>
              <Title level={5} style={{ margin: "16px 8px 8px" }} className="hide-on-mobile">
                <CheckSquareOutlined style={{ marginRight: 8 }} />
                {t("currentSelection")}
              </Title>
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
