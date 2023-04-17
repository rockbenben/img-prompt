# IMGPrompt

IMGPrompt 是一个极简的图像提示词编辑器，专注于提示词文本组合，可用于 Stable Diffusion 和 Midjourney。它没有预设提示词效果图片，也不需要第三方支持。提示词来自网络收集和 [promptoMANIA](https://promptomania.com/midjourney-prompt-builder/)，标签样式参考了 [OpenPromptStudio](https://moonvy.com/apps/ops/)。

即用链接：<https://prompt.newzone.top/>

![image](https://user-images.githubusercontent.com/28252913/232390795-9e359df3-5775-49d8-88d2-d6025ae5624b.png)

特点：

- 将提示词以逗号分隔并标签化。
- 支持标签的自动去重和自动匹配。
- 标签与文本关联，点击插入文本，再次点击即可删除文本。
- 提示词字符统计，建议限制在 380 个以内。

提示词的中文翻译来自 Google Translate API，欢迎抓虫。

## Deploy

### Deploy With Vercel

[![Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frockbenben%2Fimg-prompt%2Ftree%2Fgh-pages)

### Installation

```shell
# Installation
yarn

# Local Development
yarn start

# Build: This command generates static content into the `build` directory
yarn build
```
