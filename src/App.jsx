import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet";
import { Layout, Row, Col, Typography, Menu, Grid } from "antd";
import {
  BgColorsOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
  GithubOutlined,
} from "@ant-design/icons";

import "antd/dist/reset.css";
import { tagsData } from "./data";
import ObjectSection from "./components/ObjectSection";
import AttributeSection from "./components/AttributeSection";
import TagSection from "./components/TagSection";
import SelectedTagsSection from "./components/SelectedTagsSection";
import ResultSection from "./components/ResultSection";
const { useBreakpoint } = Grid;
const { Title } = Typography;

const App = () => {
  const objects = Object.keys(tagsData);
  const [activeObject, setActiveObject] = useState(objects[0]);
  const attributes = Object.keys(tagsData[activeObject]);
  const [activeAttribute, setActiveAttribute] = useState(attributes[0]);
  const [selectedTags, setSelectedTags] = useState([]);
  const getAttributes = (currentObject) => {
    return Object.keys(tagsData[currentObject]);
  };
  const screens = useBreakpoint();

  useEffect(() => {
    const attributes = getAttributes(activeObject);
    setActiveAttribute(attributes[0]);
  }, [activeObject]);

  const handleObjectClick = (object) => {
    setActiveObject(object);
  };

  const handleAttributeClick = (attribute) => {
    setActiveAttribute(attribute);
  };

  const handleTagClick = (tag, attribute) => {
    if (selectedTags.some((t) => t.displayName === tag.displayName)) {
      setSelectedTags(
        selectedTags.filter((t) => t.displayName !== tag.displayName)
      );
    } else {
      setSelectedTags([...selectedTags, { ...tag, attribute }]);
    }
  };

  return (
    <Layout>
      <Helmet>
        <title>IMGPrompt</title>
        <meta
          name="description"
          content="用于 Stable Diffusion 和 Midjourney 的图像提示词生成"
        />
        <meta name="keywords" content="prompt, ai prompt, 提示词" />
      </Helmet>
      <Layout.Header>
        <Row justify="space-between" align="middle" gutter={16}>
          <Col xs={20} sm={18} md={16}>
            <Menu mode="horizontal" theme="dark" selectedKeys={["1"]}>
              <Menu.Item key="1" icon={<BgColorsOutlined />}>
                IMGPrompt
              </Menu.Item>
              <Menu.Item key="2" icon={<ThunderboltOutlined />}>
                <a
                  href="https://newzone.top/posts/2022-09-05-stable_diffusion_ai_painting.html"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Stable Diffusion 入门教程
                </a>
              </Menu.Item>
              <Menu.Item key="3" icon={<ExperimentOutlined />}>
                <a
                  href="https://www.aishort.top"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  ChatGPT Shortcut
                </a>
              </Menu.Item>
            </Menu>
          </Col>
          <Col>
            <Row gutter={16} wrap={false}>
              {screens.md && (
                <Col style={{ display: "flex", alignItems: "center" }}>
                  <a
                    href="https://discord.gg/PZTQfJ4GjX"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="https://img.shields.io/discord/1048780149899939881?color=%2385c8c8&label=Discord&logo=discord&style=for-the-badge"
                      alt="chat on Discord"
                    />
                  </a>
                </Col>
              )}
              <Col>
                <a
                  href="https://github.com/rockbenben/img-prompt"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <GithubOutlined
                    style={{ color: "white", fontSize: "24px" }}
                  />
                </a>
              </Col>
            </Row>
          </Col>
        </Row>
      </Layout.Header>
      <Layout.Content
        style={{ maxWidth: "1200px", margin: "0 auto", padding: "24px" }}
      >
        <Title
          level={2}
          style={{
            marginBottom: "24px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          IMGPrompt
        </Title>
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={18}>
            <h3 className="m-2 font-bold">对象选择区</h3>
            <ObjectSection
              objects={objects}
              activeObject={activeObject}
              onObjectClick={handleObjectClick}
            />
            <h3 className="m-2 font-bold">属性选择区</h3>
            <AttributeSection
              attributes={Object.keys(tagsData[activeObject])}
              selectedAttribute={activeAttribute}
              onAttributeClick={handleAttributeClick}
            />
            <h3 className="m-2 font-bold">标签选择区</h3>
            <TagSection
              tags={tagsData[activeObject][activeAttribute]}
              selectedTags={selectedTags}
              onTagClick={(tag) => handleTagClick(tag, activeAttribute)}
            />

            <h3 className="m-2 font-bold">当前选中</h3>
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
    </Layout>
  );
};

export default App;
