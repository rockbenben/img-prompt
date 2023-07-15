"use client"
import { useState, useEffect, FC } from "react";
import Head from "next/head";
import { Layout, Row, Col, Typography, Grid } from "antd";

import tagsData from "./prompt.json";
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

const { useBreakpoint } = Grid;
const { Title } = Typography;

const getObjects = (data: Tag[]) => {
  const objectsSet = new Set(data.map((tag) => tag.object));
  return Array.from(objectsSet);
};

const getAttributes = (currentObject: string, data: Tag[]) => {
  const attributesSet = new Set(
    data
      .filter((tag) => tag.object === currentObject)
      .map((tag) => tag.attribute)
  );
  return Array.from(attributesSet);
};

const Home: FC = () => {
  const objects = getObjects(tagsData) || [];
  const [activeObject, setActiveObject] = useState(objects[0]);
  const attributes = getAttributes(activeObject, tagsData) || [];
  const [activeAttribute, setActiveAttribute] = useState(attributes[0]);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
  const screens = useBreakpoint();

  useEffect(() => {
    const attributes = getAttributes(activeObject, tagsData);
    setActiveAttribute(attributes[0]);
  }, [activeObject]);

  const handleObjectClick = (object: string) => {
    setActiveObject(object);
  };

  const handleAttributeClick = (attribute: string) => {
    setActiveAttribute(attribute);
  };
  const updateSelectedTags = (tag: Tag) => {
    const isSelected = selectedTags.some(
      (t) => t.displayName === tag.displayName
    );

    if (isSelected) {
      return selectedTags.filter((t) => t.displayName !== tag.displayName);
    } else {
      return [...selectedTags, tag];
    }
  };

  const handleTagClick = (tag: Tag) => {
    setSelectedTags(updateSelectedTags(tag));
  };

  return (
    <>
      <Head>
        <title>
          IMGPrompt - Stable Diffusion 和 Midjourney 的图像提示词生成工具
        </title>
        <meta
          name='description'
          content='IMGPrompt 是一个直观的图像提示词生成工具，可以方便地在 Stable Diffusion 和 Midjourney 的流程中使用，使图像提示词的创建变得简单而有效，轻松激发创意并获得更好的图片结果。通过 IMGPrompt，你可以将自己的创意想法转化为视觉现实。'
        />
        <meta
          name='keywords'
          content='IMGPrompt, Stable Diffusion, Midjourney, Image prompt generation, Visual creativity toolprompt, ai, prompt, 提示词'
        />
      </Head>
      <Layout.Content
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}>
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
            <h3 className='m-2 font-bold'>对象选择区</h3>
            <ObjectSection
              objects={objects}
              activeObject={activeObject}
              onObjectClick={handleObjectClick}
            />
            <h3 className='m-2 font-bold'>属性选择区</h3>
            <AttributeSection
              attributes={getAttributes(activeObject, tagsData)}
              selectedAttribute={activeAttribute}
              onAttributeClick={handleAttributeClick}
            />
            <h3 className='m-2 font-bold'>标签选择区</h3>
            <TagSection
              tags={tagsData.filter(
                (tag) =>
                  tag.object === activeObject &&
                  tag.attribute === activeAttribute
              )}
              selectedTags={selectedTags}
              onTagClick={handleTagClick}
            />

            <h3 className='m-2 font-bold'>当前选中</h3>
            <SelectedTagsSection
              selectedTags={selectedTags}
              onTagClick={handleTagClick}
            />
          </Col>
          <Col xs={24} lg={6}>
            <ResultSection
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
              tagsData={tagsData}
            />
          </Col>
        </Row>
      </Layout.Content>
    </>
  );
};

export default Home;
