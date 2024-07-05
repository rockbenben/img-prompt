# IMGPrompt

IMGPrompt 是专为 Stable Diffusion、Midjourney 和 DALL·E 打造的 AI 图像提示词编辑器，界面简洁直观，使用户能够轻松地查看并组合所需的提示词文本。每个提示词都附有中文翻译，用户仅需通过点击操作即可快速选取或组合，从而大大简化了文本组合的过程。

本工具完全本地化，无需依赖任何数据库或第三方服务。

立即体验：<https://prompt.newzone.top/>

![image](https://github.com/rockbenben/img-prompt/assets/28252913/5e455cc2-2184-4d7e-ac51-f960e6aaa3d1)

核心特点：

- **提示词标签化：** 通过逗号分隔将提示词标签化，支持标签的自动去重和匹配，以及提示词的中文翻译显示，便于用户理解和应用。
- **互动式编辑：** 点击标签，即可快速插入或删除对应提示词文本。
- **分类标签展示：** 选定的标签会根据类别进行展示，提高查找和编辑的效率。
- **字符统计：** 内置提示词字符统计，建议用户将提示词长度控制在 380 字符以内，以获得最佳效果。

IMGPrompt 的提示词翻译采用 DeepL/Google Translate API，欢迎抓虫。

此外，IMGPrompt 适用于多种数据编辑场景。通过使用 [IMGPrompt 数据转换器](https://tools.newzone.top/data-parser/img-prompt)，用户可以轻松实现数据的批量导入和转换。

## 自定义提示词

建议不要修改 `prompt.json` 文件内容，因为本文件作者可能会不定期更新，如果修改了本文件，可能会导致更新时出现冲突。

如需要自定义提示词，请按下方样例修改 `src/app/prompt-custom.json` 文件。

```json
[
  {
    "displayName": "prompt1",
    "langName": "提示词1翻译",
    "object": "1定制对象",
    "attribute": "2定制属性"
  },
  {
    "displayName": "prompt2",
    "langName": "提示词2翻译",
    "object": "1定制对象",
    "attribute": "2定制属性"
  }
]
```

## 提示词来源

IMGPrompt 的提示词资源来源于网络搜集、[promptoMANIA](https://promptomania.com/midjourney-prompt-builder/) 以及 [sd-webui-prompt-all-in-one](https://github.com/Physton/sd-webui-prompt-all-in-one/blob/main/group_tags/zh_CN.yaml)，同时在标签样式设计上借鉴了 [OpenPromptStudio](https://moonvy.com/apps/ops/)。

## Deploy

System Requirements:

- [Node.js 18.17](https://nodejs.org/) or later.
- macOS, Windows (including WSL), and Linux are supported.

### Deploy With Vercel

[![Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frockbenben%2Fimg-prompt%2Ftree%2Fmain)

项目框架于 2023.06.18 迁移到 Next.js。如果你之前已在 Vercel 上进行部署，请前往 Vercel 项目页面，选择「Settings」>「Build & Development Settings」，然后将 Framework Preset 更改为 Next.js。

### Installation

```shell
# Installation
yarn

# Local Development
yarn dev

# build and start
yarn build && yarn start
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`. The page auto-updates as you edit the file.
