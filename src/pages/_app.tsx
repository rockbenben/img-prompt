import React, { useState } from "react";
import {
  BgColorsOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
  GithubOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { Menu, Row, Col } from "antd";
import { useRouter } from "next/router";
import Link from "next/link";
import { AppProps } from "next/app";
import '../app/globals.css';

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  const router = useRouter();
  const [current, setCurrent] = useState(router.pathname);
  type MenuInfo = Parameters<typeof Menu>[0];
  const onClick = (e: MenuInfo) => {
    console.log("click ", e);
    setCurrent(e.key as string);
  };

  return (
    <>
      <Row justify="space-between" align="middle" gutter={16}>
        <Col xs={20} sm={18} md={16}>
          <Menu mode="horizontal" selectedKeys={[current]} onClick={onClick}>
            <Menu.Item key="/" icon={<BgColorsOutlined />}>
              <Link href="/">IMGPrompt</Link>
            </Menu.Item>
            <Menu.Item key="LearnData" icon={<ThunderboltOutlined />}>
              <a
                href="https://newzone.top/posts/2022-09-05-stable_diffusion_ai_painting.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                Stable Diffusion 入门教程
              </a>
            </Menu.Item>
            <Menu.Item key="aishort" icon={<ExperimentOutlined />}>
              <a
                href="https://www.aishort.top/"
                target="_blank"
                rel="noopener noreferrer"
              >
                ChatGPT Shortcut
              </a>
            </Menu.Item>
            <Menu.Item key="Tools" icon={<ToolOutlined />}>
              <a
                href="https://tools.newzone.top/"
                target="_blank"
                rel="noopener noreferrer"
              >
                文本处理工具
              </a>
            </Menu.Item>
          </Menu>
        </Col>
        <Col>
          <Row gutter={16} wrap={false}>
            <Col xs={0} sm={0} md={18}>
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
            <Col>
              <a
                href="https://github.com/rockbenben/img-prompt"
                target="_blank"
                rel="noopener noreferrer"
                style={{ marginLeft: "10px" }}
              >
                <GithubOutlined style={{ color: "black", fontSize: "24px" }} />
              </a>
            </Col>
          </Row>
        </Col>
      </Row>
      <Component {...pageProps} />
    </>
  );
};

export default App;
