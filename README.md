# IMGPrompt

**IMGPrompt** 是一款专为 Stable Diffusion、Midjourney、DALL·E 和 FLUX 打造的 AI 图像提示词编辑器。其界面简洁直观，用户可以轻松查看并组合所需的提示词文本。每个提示词都附有中文翻译，用户仅需点击即可快速选取或组合，从而大大简化了文本组合的过程。

本工具完全本地化，无需依赖任何数据库或第三方服务。

立即体验：<https://prompt.newzone.top/>

![IMGPrompt 界面预览](https://github.com/rockbenben/img-prompt/assets/28252913/5e455cc2-2184-4d7e-ac51-f960e6aaa3d1)

## 核心特点

- **提示词标签化：** 通过逗号分隔将提示词标签化，支持标签的自动去重和匹配，并附有中文翻译显示，方便用户理解和应用。
- **互动式编辑：** 点击标签即可快速插入或删除对应提示词文本。
- **分类标签展示：** 选定的标签会根据类别进行展示，提高查找和编辑的效率。
- **相关标签推荐：** 根据用户最后输入的词汇，提供 10 个相关标签推荐（支持中英文）。
- **提示词翻译：** 将任何提示词快速翻译成英文，以满足文生图的语言要求。
- **字符统计：** 内置提示词字符统计功能，建议用户将提示词长度控制在 380 字符以内，以获得最佳效果。

IMGPrompt 的提示词翻译采用 DeepL/Google Translate API，欢迎用户反馈和抓虫。

此外，IMGPrompt 适用于多种数据编辑场景。通过使用 [IMGPrompt 数据转换器](https://tools.newzone.top/data-parser/img-prompt)，用户可以轻松实现数据的批量导入和转换。

## 下载客户端

除了网页版，你还可以在 [Github Release](https://github.com/rockbenben/img-prompt/releases/latest) 下载最新的桌面客户端，支持 Windows、MacOS 和 Linux 系统。请根据你的操作系统选择合适的文件进行下载：

- **Windows**：选择 `x64-setup.exe` 或 `x64_en-US.msi` 文件。
- **Mac（Intel 版本）**：选择 `x64.dmg` 或 `x64.app.tar.gz` 文件。
- **Mac（Apple Silicon 版本，如 M1/M2）**：选择 `aarch64.dmg` 或 `aarch64.app.tar.gz` 文件。
- **Linux（Debian/Ubuntu）**：选择 `amd64.deb` 文件。

## 使用 Docker 容器

如果你更倾向于在容器环境中运行应用程序，可以使用以下方法通过 Docker 容器运行 IMGPrompt：

```shell
# 拉取 Docker 容器镜像
docker pull ghcr.io/rockbenben/img-prompt:latest

# 运行容器
docker run -d -p 5666:5666 --name imgprompt ghcr.io/rockbenben/img-prompt:latest
```

运行容器后，你可以在浏览器中访问 [http://localhost:5666](http://localhost:5666) 来使用该应用。

## 自定义提示词

建议不要修改 `prompt.json` 文件内容，因为可能会不定期更新该文件，修改后可能会导致更新时出现冲突。

如需要自定义提示词，请按下方样例修改 `src/app/prompt-custom.json` 文件：

```json
[
  {
    "displayName": "prompt1",
    "langName": "提示词 1 翻译",
    "object": "定制对象 1",
    "attribute": "定制属性"
  },
  {
    "displayName": "prompt2",
    "langName": "提示词 2 翻译",
    "object": "定制对象 1",
    "attribute": "定制属性"
  }
]
```

## 提示词来源

IMGPrompt 的提示词资源来源于网络搜集、[promptoMANIA](https://promptomania.com/midjourney-prompt-builder/)，以及 [sd-webui-prompt-all-in-one](https://github.com/Physton/sd-webui-prompt-all-in-one/blob/main/group_tags/zh_CN.yaml)。在标签样式设计上，我们借鉴了 [OpenPromptStudio](https://moonvy.com/apps/ops/)。

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
