import { BgColorsOutlined, ExperimentOutlined, ToolOutlined } from "@ant-design/icons";

export const MENU_ITEMS = [
  {
    label: (
      <a href="https://prompt.newzone.top/en/guide/" target="_blank" rel="noopener noreferrer">
        Guide
      </a>
    ),
    key: "guide",
    icon: <BgColorsOutlined />,
  },
  {
    label: (
      <a href="https://www.aishort.top/it/" target="_blank" rel="noopener noreferrer">
        ChatGPT Shortcut
      </a>
    ),
    key: "aishort",
    icon: <ExperimentOutlined />,
  },
  {
    label: (
      <a href="https://tools.newzone.top/it" target="_blank" rel="noopener noreferrer">
        AI Toolset
      </a>
    ),
    key: "Tools",
    icon: <ToolOutlined />,
  },
];
