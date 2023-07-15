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
import { useRouter } from "next/router";
import Link from "next/link";
import Head from "next/head";
import { AppProps } from "next/app";
import "../app/globals.css";

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
        href='https://tools.newzone.top/'
        target='_blank'
        rel='noopener noreferrer'>
        文本处理工具
      </a>
    ),
    key: "Tools",
    icon: <ToolOutlined />,
  },
];

const App: React.FC<AppProps> = ({ Component, pageProps }) => {
  const router = useRouter();
  const [current, setCurrent] = useState(router.pathname);

  const onClick: MenuProps["onClick"] = (e) => {
    console.log("click ", e);
    setCurrent(e.key);
  };

  return (
    <>
      <Head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
                var _paq = window._paq = window._paq || [];
                _paq.push(['trackPageView']);
                _paq.push(['enableLinkTracking']);
                (function() {
                    var u="https://piwik.seoipo.com/";
                    _paq.push(['setTrackerUrl', u+'matomo.php']);
                    _paq.push(['setSiteId', '10']);
                    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
                    g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
                })();
            `,
          }}
        />
      </Head>
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
      <Component {...pageProps} />
    </>
  );
};

export default App;
