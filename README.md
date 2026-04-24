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
<a href="https://prompt.newzone.top/app/en">English</a> |
<a href="https://prompt.newzone.top/app/zh">中文</a> |
<a href="https://prompt.newzone.top/app/zh-hant">繁体中文</a> |
<a href="https://prompt.newzone.top/app/pt">Português</a> |
<a href="https://prompt.newzone.top/app/it">Italiano</a> |
<a href="https://prompt.newzone.top/app/de">Deutsch</a> |
<a href="https://prompt.newzone.top/app/ru">Русский</a> |
<a href="https://prompt.newzone.top/app/es">Español</a> |
<a href="https://prompt.newzone.top/app/fr">Français</a> |
<a href="https://prompt.newzone.top/app/ja">日本語</a> |
<a href="https://prompt.newzone.top/app/ko">한국어</a> |
<a href="https://prompt.newzone.top/app/hi">हिन्दी</a> |
<a href="https://prompt.newzone.top/app/ar">العربية</a> |
<a href="https://prompt.newzone.top/app/bn">বাংলা</a> |
<a href="https://prompt.newzone.top/app/id">Bahasa Indonesia</a> |
<a href="https://prompt.newzone.top/app/tr">Türkçe</a> |
<a href="https://prompt.newzone.top/app/vi">Tiếng Việt</a> |
<a href="https://prompt.newzone.top/app/th">ภาษาไทย</a>
</p>
<p align="center">
    <em>Make AI Art Accessible in Your Native Language</em>
    <br/>
    <br/>
    <a href="https://www.producthunt.com/posts/imgprompt?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-imgprompt" target="_blank"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=703738&theme=light" alt="IMGPrompt - Boost&#0032;your&#0032;creativity&#0032;with&#0032;smart&#0032;AI&#0032;prompt&#0032;editing | Product Hunt" style="width: 250px; height: 54px;" width="250" height="54" /></a>
    <br/>
    <br/>
    Built with
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

# Introduction

**IMGPrompt** is an AI image/video prompt editor for non-native English speakers. It turns native-language clicks into clean English prompts ready for **GPT-Image-2**, **Nano Banana**, **Midjourney**, **FLUX**, **Seedance**, **Veo**, and **Kling** (also compatible with Stable Diffusion and DALL·E syntax).

The core power of IMGPrompt lies in its **5000+ curated prompt library**. Forget wrestling with English vocabulary — browse and click keywords in your own language (Chinese, Hindi, Spanish, and 15 more), and the app assembles the precise English prompt AI models actually understand.

[Experience IMGPrompt now - Make AI Art Accessible](https://prompt.newzone.top/app/en)

## Why IMGPrompt?

- **Language is no barrier.** Pick tags in your native language, get English output.
- **5000+ tags, curated.** Styles, artists, lighting, composition, camera angles — organized, not dumped.
- **Visual discovery.** Hover any tag to see a preview image; click the preview to zoom in a full lightbox (rotate / download included).
- **Shareable selections.** The filter you're viewing lives in the URL — send the link, land on the same view.
- **Built for GPT-Image-2 and beyond.** One workflow covers image and video models alike — GPT-Image-2, Nano Banana, Midjourney, FLUX, Seedance, Veo, Kling.
- **Desktop or browser.** Use the web app or download the native client for Windows, macOS (Intel + Apple Silicon), and Linux.

## How It Works

A three-step flow, numbered right in the UI so you always know where you are:

1. **Pick an Object** (e.g., Character, Scene, Style) — section **①**.
2. **Pick an Attribute** under that object (e.g., Lighting, Pose, Camera) — section **②**.
3. **Click the tags you want** — section **③**. Your selection builds the English prompt in the side panel. One-click copy, paste into your AI tool.

The URL updates as you browse (`?object=Character&attribute=Lighting`), so bookmarks and shared links take collaborators straight to the exact filter you're using.

## Features

### 🏆 5000+ Native-to-English Prompt Library

Thousands of prompt keywords, organized by object and attribute. Verify meaning in your language, ship the precise English term models recognize. Data lives in open JSON at `src/app/data/prompt/prompt-<locale>.json`—fork it, extend it, it's yours.

![Smart Recommendation Demo](https://img.newzone.top/gif/imgprompt-ai-suggestions.webp)

### 🖼️ Hover to Preview, Click to Zoom

Hover any tag → an example image shows up in the tooltip. Click the preview → a full lightbox opens with **zoom, rotate, and download** controls. Closing it keeps your browsing state intact. WYSIWYG prompt picking — especially useful when comparing GPT-Image-2 styles where the label alone tells you nothing.

### 🎨 Multicolor or Monochrome Tag Mode

Toggle between two visual modes from the tag area:

- **Multicolor** — 10-color antd palette cycled across tags, so large categories read as distinct groups at a glance.
- **Monochrome** — calm, uniform tag styling. Same data, less visual noise.

Your choice persists across sessions and syncs across browser tabs.

### 🧩 Smart Prompt Output Panel

The right-side output panel is the working surface:

- **Inline template buttons** — one click to append "Portrait Lighting" or "High Quality" boilerplate. Copy a Negative-prompt template in one tap.
- **Auto-translate while you type** — debounced 1.5s. Type in any language, see the English equivalent surfaced below without clicking a button.
- **Tag suggestions** — as you type, exact-match and fuzzy-match tags appear so you can swap free text for a curated tag.
- **Deduplication + random color** — cleans up duplicated tokens, swaps a random color token for quick creative breaks.
- **One-click copy and clear** — side-by-side for speed.

### 🔗 Shareable URL State

Your currently active Object and Attribute filter lives in the URL. Bookmark the view you use daily. Send a link to a teammate and they land on the same filter. No accounts, no backend.

### 🌓 Light, Dark, and System Themes

Auto-follows your OS theme (via `next-themes`), or override it manually. All tag colors, previews, and borders adapt.

### 🖥️ Cross-Platform Desktop Client

Prefer a native app? Windows, macOS, and Linux builds ship on the [Releases page](https://github.com/rockbenben/img-prompt/releases).

### 🌍 18 Languages, Everywhere

Arabic, Bengali, Chinese (Simplified + Traditional), English, French, German, Hindi, Indonesian, Italian, Japanese, Korean, Portuguese, Russian, Spanish, Thai, Turkish, Vietnamese. Both the interface and the prompt database translate. RTL languages (Arabic) render right-to-left automatically.

A translation utility is also built in for free-form text, backed by Google / Youdao / MyMemory.

## Tech Stack

- **Next.js 16** with the App Router and React Compiler
- **React 19.2** + **TypeScript 5**
- **Ant Design 6** (cssVar mode) + **Tailwind CSS 4**
- **next-intl 4.9** for i18n and static generation per locale
- **next-themes** for dark mode
- Default locale: `zh`. Root `/` redirects to `/zh`.

## Getting Started

For detailed installation, local development, and deployment instructions (including Docker support), see the [deployment guide](https://prompt.newzone.top/en/guide/deploy.html).

Quick start:

```bash
npm install
npm run dev          # http://localhost:3000
npm run build        # production build
npm run build:lang   # per-locale static build (scripts/buildWithLang.js)
npm run lint
```

Node `>=20.9.0` required.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=rockbenben/img-prompt&type=Date)](https://star-history.com/#rockbenben/img-prompt&Date)

## Credits

Prompt data is aggregated and curated from several open sources — huge thanks to:

- [EvoLinkAI/awesome-gpt-image-2-prompts](https://github.com/EvoLinkAI/awesome-gpt-image-2-prompts) — GPT-Image-2 prompt examples, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Entries are localized into 18 languages; per-entry author credits are preserved in the data file.
- [Physton/sd-webui-prompt-all-in-one](https://github.com/Physton/sd-webui-prompt-all-in-one) — baseline tag taxonomy (AGPL-3.0).
- [promptoMANIA](https://promptomania.com/midjourney-prompt-builder/) — structured keyword inspiration.

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss direction. Prompt data contributions (adding or refining tags for a language) are especially appreciated—the files are plain JSON, no tooling required.
