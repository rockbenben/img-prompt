import { BgColorsOutlined, ExperimentOutlined, ThunderboltOutlined, ToolOutlined } from "@ant-design/icons";

export const MENU_ITEMS = [
  {
    label: (
      <a href="https://prompt.newzone.top/guide/" target="_blank" rel="noopener noreferrer">
        使用指南
      </a>
    ),
    key: "guide",
    icon: <BgColorsOutlined />,
  },
  {
    label: (
      <a href="https://newzone.top/posts/2022-09-05-stable_diffusion_ai_painting.html" target="_blank" rel="noopener noreferrer">
        Stable Diffusion 入门教程
      </a>
    ),
    key: "LearnData",
    icon: <ThunderboltOutlined />,
  },
  {
    label: (
      <a href="https://www.aishort.top/" target="_blank" rel="noopener noreferrer">
        ChatGPT Shortcut
      </a>
    ),
    key: "aishort",
    icon: <ExperimentOutlined />,
  },
  {
    label: (
      <a href="https://tools.newzone.top/subtitle-translator" target="_blank" rel="noopener noreferrer">
        文本处理工具
      </a>
    ),
    key: "Tools",
    icon: <ToolOutlined />,
  },
];
