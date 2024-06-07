"use client";

import React, { useState, useEffect } from "react";
import { Menu, Row, Col, Space, Grid } from "antd";
import { usePathname } from "next/navigation";
import { GithubOutlined } from "@ant-design/icons";
import { MENU_ITEMS, DISCORD_LINK, GITHUB_LINK, DISCORD_BADGE_SRC } from "./data";

const { useBreakpoint } = Grid;

export function Navigation() {
  const pathname = usePathname();
  const [current, setCurrent] = useState(pathname);
  const screens = useBreakpoint();

  useEffect(() => {
    setCurrent(pathname);
  }, [pathname]);

  const onClick = (e) => {
    setCurrent(e.key);
  };

  return (
    <Row justify="space-between" align="middle" gutter={[16, 16]} wrap={false} style={{ backgroundColor: "#fff", padding: "0 24px" }}>
      <Col flex="auto">
        <Menu onClick={onClick} selectedKeys={[current]} mode="horizontal" items={MENU_ITEMS} />
      </Col>
      <Col>
        <Space>
          {screens.md && (
            <a href={DISCORD_LINK} target="_blank" rel="noopener noreferrer">
              <img src={DISCORD_BADGE_SRC} alt="chat on Discord" style={{ height: "24px" }} />
            </a>
          )}
          {screens.md && (
            <a href={GITHUB_LINK} target="_blank" rel="noopener noreferrer">
              <GithubOutlined style={{ color: "black", fontSize: "24px", padding: "4px" }} />
            </a>
          )}
        </Space>
      </Col>
    </Row>
  );
}
