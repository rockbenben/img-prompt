"use client";

import React, { useState } from "react";
import {
  BgColorsOutlined,
  ExperimentOutlined,
  ThunderboltOutlined,
  GithubOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { Menu, Row, Col } from "antd";
import { usePathname } from "next/navigation";
import Link from "next/link";

const items: MenuProps["items"] = [
  {
    label: <Link href='/'>IMGPrompt</Link>,
    key: "/",
    icon: <BgColorsOutlined />,
  },
  {
    label: (
      <a
        href='https://newzone.top/posts/2022-09-05-stable_diffusion_ai_painting.html'
        target='_blank'
        rel='noopener noreferrer'>
        Stable Diffusion 入门教程
      </a>
    ),
    key: "LearnData",
    icon: <ThunderboltOutlined />,
  },
  {
    label: (
      <a
        href='https://www.aishort.top/'
        target='_blank'
        rel='noopener noreferrer'>
        ChatGPT Shortcut
      </a>
    ),
    key: "aishort",
    icon: <ExperimentOutlined />,
  },
  {
    label: (
      <a
        href='https://tools.newzone.top/json-translate'
        target='_blank'
        rel='noopener noreferrer'>
        文本处理工具
      </a>
    ),
    key: "Tools",
    icon: <ToolOutlined />,
  },
];

export function Navigation() {
  const pathname = usePathname();
  const [current, setCurrent] = useState(pathname);

  const onClick: MenuProps["onClick"] = (e) => {
    console.log("click ", e);
    setCurrent(e.key);
  };
  return (
    <Row justify='space-between' align='middle' gutter={16}>
      <Col xs={20} sm={18} md={16}>
        <Menu
          onClick={onClick}
          selectedKeys={[current]}
          mode='horizontal'
          items={items}
        />
      </Col>
      <Col>
        <Row gutter={16} wrap={false}>
          <Col xs={0} sm={0} md={18}>
            <a
              href='https://discord.gg/PZTQfJ4GjX'
              target='_blank'
              rel='noopener noreferrer'>
              <img
                src='https://img.shields.io/discord/1048780149899939881?color=%2385c8c8&label=Discord&logo=discord&style=for-the-badge'
                alt='chat on Discord'
              />
            </a>
          </Col>
          <Col>
            <a
              href='https://github.com/rockbenben/img-prompt'
              target='_blank'
              rel='noopener noreferrer'
              style={{ marginLeft: "10px" }}>
              <GithubOutlined style={{ color: "black", fontSize: "24px" }} />
            </a>
          </Col>
        </Row>
      </Col>
    </Row>
  );
}
