<p align="right">
<a href="./README.md">English</a> · <a href="./README.zh.md">简体中文</a>
</p>

<h1 align="center">
⚡️IMGPrompt
</h1>

<p align="center">
  <a href="https://github.com/rockbenben/img-prompt/releases">
    <img alt="GitHub Release" src="https://img.shields.io/github/v/release/rockbenben/img-prompt?style=flat-square&logo=github">
  </a>
  <a href="https://github.com/rockbenben/img-prompt/blob/main/LICENSE">
    <img alt="License" src="https://img.shields.io/github/license/rockbenben/img-prompt?style=flat-square">
  </a>
</p>

<p align="center">
<a href="https://prompt.newzone.top/app/zh">中文</a> |
<a href="https://prompt.newzone.top/app/zh-hant">繁體中文</a> |
<a href="https://prompt.newzone.top/app/en">English</a> |
<a href="https://prompt.newzone.top/app/ja">日本語</a> |
<a href="https://prompt.newzone.top/app/ko">한국어</a> |
<a href="https://prompt.newzone.top/app/pt">Português</a> |
<a href="https://prompt.newzone.top/app/it">Italiano</a> |
<a href="https://prompt.newzone.top/app/de">Deutsch</a> |
<a href="https://prompt.newzone.top/app/ru">Русский</a> |
<a href="https://prompt.newzone.top/app/es">Español</a> |
<a href="https://prompt.newzone.top/app/fr">Français</a> |
<a href="https://prompt.newzone.top/app/hi">हिन्दी</a> |
<a href="https://prompt.newzone.top/app/ar">العربية</a> |
<a href="https://prompt.newzone.top/app/bn">বাংলা</a> |
<a href="https://prompt.newzone.top/app/id">Bahasa Indonesia</a> |
<a href="https://prompt.newzone.top/app/tr">Türkçe</a> |
<a href="https://prompt.newzone.top/app/vi">Tiếng Việt</a> |
<a href="https://prompt.newzone.top/app/th">ภาษาไทย</a>
</p>
<p align="center">
    <em>用母语写提示词，让 AI 绘画触手可及</em>
    <br/>
    <br/>
    <a href="https://www.producthunt.com/posts/imgprompt?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-imgprompt" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=703738&theme=light" alt="IMGPrompt - Boost&#0032;your&#0032;creativity&#0032;with&#0032;smart&#0032;AI&#0032;prompt&#0032;editing | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>
    <br/>
    <br/>
    技术栈
    <a href="https://nextjs.org" target="_blank">
      <img alt="Next.js" src="https://img.shields.io/badge/Next.js%2016-black?style=flat-square&logo=next.js&logoColor=white" />
    </a>
    <a href="https://ant.design" target="_blank">
      <img alt="Ant Design" src="https://img.shields.io/badge/Ant%20Design%206-0170FE?style=flat-square&logo=ant-design&logoColor=white" />
    </a>
    <a href="https://tailwindcss.com" target="_blank">
      <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind%20CSS%204-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" />
    </a>
    <a href="https://react.dev" target="_blank">
      <img alt="React" src="https://img.shields.io/badge/React%2019-20232A?style=flat-square&logo=react&logoColor=61DAFB" />
    </a>
    <a href="https://www.typescriptlang.org" target="_blank">
      <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white" />
    </a>
</p>

# 项目简介

**IMGPrompt** 是一款面向非英语母语用户的 AI 图像/视频提示词编辑器，帮你无障碍为 **GPT-Image-2**、**Nano Banana**、**Midjourney**、**FLUX**、**Seedance**、**Veo**、**Kling** 等主流模型构建专业提示词（同时兼容 Stable Diffusion、DALL·E 语法）。

它的核心能力来自 **5000+ 条精心分类的提示词库**。你不用再翻字典拼凑英文关键词——直接用中文浏览、点击，系统会自动拼出 AI 模型最能理解的英文提示词。

[立即体验 IMGPrompt —— 让 AI 绘画触手可及](https://prompt.newzone.top/app/zh)

## 为什么选 IMGPrompt？

- **语言不是障碍。** 中文选词，英文输出。
- **5000+ 标签，全人工整理。** 涵盖画风、艺术家、光照、构图、镜头角度，按类组织，不是一锅乱炖。
- **所见即所得。** 鼠标悬停任一标签弹出预览图；点击预览图可进入 lightbox 放大查看，支持缩放 / 旋转 / 下载。
- **状态可分享。** 你当前的筛选条件会实时写进 URL，把链接发出去，对方打开就是同一个画面。
- **GPT-Image-2 及全模型通用。** 同一套流程覆盖图像与视频：GPT-Image-2、Nano Banana、Midjourney、FLUX、Seedance、Veo、Kling。
- **桌面或浏览器，随你挑。** 在线即开即用，也可以下载 Windows、macOS（Intel + Apple Silicon）、Linux 原生客户端。

## 使用流程

三步走，界面上编号标得清清楚楚：

1. **选对象**（如角色、场景、风格）—— 区域 **①**。
2. **选属性**（如光照、姿势、镜头）—— 区域 **②**。
3. **点击标签** —— 区域 **③**。你的选择会实时拼进右侧的英文提示词面板，一键复制，粘贴到 AI 工具即可。

浏览过程中 URL 会同步更新（`?object=Character&attribute=Lighting`），收藏夹或分享链接可以直接带对方跳到同一个筛选页面。

## 功能亮点

### 🏆 5000+ 条中英对照的提示词库

数千条提示词按「对象 / 属性」双层归类。你用中文确认含义，系统给出 AI 模型识别度最好的英文写法。数据放在开放的 JSON 文件里（`src/app/data/prompt/prompt-<locale>.json`），可以自由 fork、扩展、改写。

![智能推荐演示](https://img.newzone.top/gif/imgprompt-ai-suggestions.webp)

### 🖼️ 悬停即预览，点击可放大

鼠标悬停任一标签，立刻弹出该风格对应的示意图；**点击预览图**进入 lightbox，可**缩放、旋转、下载**，关闭后浏览状态完整保留。挑选 GPT-Image-2 风格时尤其好用——光看英文标签完全没画面感，配图秒懂。

### 🎨 多彩 / 单色 标签双模式

标签区右上角可以一键切换两种视觉模式：

- **多彩模式** —— 使用 antd 的 10 色预设循环上色，类别多时一眼就能把标签分组区分开。
- **单色模式** —— 统一风格，视觉更安静。内容完全一致，只是外观不同。

你的选择会本地持久化，还能在多个浏览器标签页之间实时同步。

### 🧩 右侧提示词面板：一屏搞定所有动作

- **内联模板按钮** —— 一键追加「人像光照」「高画质」等常用模板；一键复制 Negative Prompt 模板。
- **输入即翻译** —— 防抖 1.5 秒，任意语种输入都会自动翻译成英文显示在下方。
- **标签联想** —— 输入过程中自动匹配精确 / 模糊命中的标签，直接把自由文本换成规范标签。
- **去重 + 随机换色** —— 自动清理重复 token，一键随机替换颜色 token，帮你打破思维定式。
- **复制 / 清空 并排放** —— 常用操作紧邻，不用找。

### 🔗 URL 状态可分享

当前生效的「对象 + 属性」筛选会写进 URL。把常用视图收藏起来，或者把链接甩给同事，对方打开就是同一个筛选面。不需要账号，不需要后端。

### 🌓 浅色 / 深色 / 跟随系统

默认跟随操作系统主题（基于 `next-themes`），也可以手动切换。标签配色、预览图、边框都会自动适配。

### 🖥️ 跨平台桌面客户端

想要原生体验？Windows、macOS、Linux 安装包全部在 [Releases 页面](https://github.com/rockbenben/img-prompt/releases) 发布。

### 🌍 18 种语言，界面与词库双语化

中文（简体 + 繁體）、英文、日语、韩语、葡萄牙语、意大利语、德语、俄语、西班牙语、法语、印地语、阿拉伯语、孟加拉语、印尼语、土耳其语、越南语、泰语。不光是 UI，连提示词库也全量翻译。阿拉伯语等 RTL 语种自动右向左渲染。

此外还内置了自由文本翻译工具，支持 Google / 有道 / MyMemory 三路。

## 技术栈

- **Next.js 16**（App Router + React Compiler）
- **React 19.2** + **TypeScript 5**
- **Ant Design 6**（cssVar 模式） + **Tailwind CSS 4**
- **next-intl 4.9**，按语种静态生成
- **next-themes** 实现暗色模式
- 默认语言为 `zh`，根路径 `/` 会重定向到 `/zh`。

## 快速开始

完整的本地开发与部署指南（含 Docker）请看 [部署文档](https://prompt.newzone.top/zh/guide/deploy.html)。

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # 生产构建
npm run build:lang   # 分语种静态构建（scripts/buildWithLang.js）
npm run lint
```

Node 版本需要 `>=20.9.0`。

## Star 历史

[![Star History Chart](https://api.star-history.com/svg?repos=rockbenben/img-prompt&type=Date)](https://star-history.com/#rockbenben/img-prompt&Date)

## 致谢

提示词数据汇集并整理自多个开源项目，特别感谢：

- [EvoLinkAI/awesome-gpt-image-2-prompts](https://github.com/EvoLinkAI/awesome-gpt-image-2-prompts) —— GPT-Image-2 提示词示例，遵循 [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) 协议。条目已本地化至 18 种语言；每条原作者署名保留在数据文件中。
- [Physton/sd-webui-prompt-all-in-one](https://github.com/Physton/sd-webui-prompt-all-in-one) —— 基础标签分类体系（AGPL-3.0）。
- [promptoMANIA](https://promptomania.com/midjourney-prompt-builder/) —— 结构化关键词灵感来源。

## 贡献

欢迎 PR。较大的改动建议先开 Issue 讨论方向。提示词数据相关的贡献尤其欢迎——文件都是标准 JSON，不需要额外工具链，直接改就行。
