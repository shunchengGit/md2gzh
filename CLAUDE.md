# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**md2gzh** — 一个 Markdown 转微信公众号排版工具。用户在左侧编辑器输入 Markdown，右侧实时预览公众号样式效果，支持一键复制富文本到公众号编辑器。纯前端应用，无后端。

## Commands

- `npm run dev` — 启动 Vite 开发服务器。
- `npm run build` — 运行 TypeScript project build 并产出 Vite 生产构建。
- `npm run lint` — 运行 ESLint。
- `npm run preview` — 本地预览生产构建。
- `npm run test` — 使用 Vitest 运行 Markdown 转换回归测试。

## Architecture

这是一个纯前端的 Markdown 转微信公众号富文本工具。`src/main.tsx` 挂载 React 应用；全局界面样式位于 `src/App.css`，没有 CSS Modules。

### Rendering data flow

`App` 保存 Markdown 文本和四项排版设置（字号、字体、主题、色系）。它通过 `useMemo` 调用 `mdToWechat()`，并将生成的 HTML 传给 `PreviewPanel`，后者使用 `dangerouslySetInnerHTML` 渲染文章内容。`Toolbar` 只负责修改设置和触发复制，`EditorPanel` 是受控 `textarea`。

### Markdown conversion and copying

`src/utils/mdToWechat.ts` 是核心领域模块：

- 它为独立的 `Marked` 实例设置自定义 renderer，为块级与行内 Markdown 元素生成公众号可用的全内联样式 HTML，不共享或修改全局 parser 状态。
- 字号、字体、三种主题（双线、色块、简约）与三种色系（墨绿、靛蓝、暖橙）共同决定每次转换的 renderer 输出。
- 原始 HTML 会被移除；自定义 renderer 必须按 HTML/属性上下文转义输入，并限制链接与图片 URL 为安全协议。
- `fixCjkLineBreaks()` 在中文字符和标点、以及行内标签后的标点间插入 word-joiner，避免公众号中的不当断行；它必须跳过 `code` 与 `pre` 内容。
- `copyDomToClipboard()` 选中预览 DOM 并通过 `document.execCommand('copy')` 复制富文本。它不能替换为纯 Clipboard API，否则粘贴内容会丢失格式。

## Key Constraints

- 公众号编辑器不支持外部 CSS 或 class；文章输出的全部样式必须保留为内联 `style`。
- 预览 HTML 来自用户输入的 Markdown，并直接插入 DOM。修改转换器时应保持对 `marked` 输出和 URL/属性处理的安全性审查。
- 应用自身的界面布局样式与被复制的文章样式必须分离：前者放在 `App.css`，后者留在转换器的 HTML 中。

## Deployment

生产站点为 `https://md.underpinetree.com`，部署在 `115.190.148.200`。每次发布前先本地运行 `npm run test && npm run lint && npm run build`，再将 `dist/` 同步到服务器的 `/var/www/md2gzh/current/`；该目录是当前在线版本，更新前应确认构建成功。

Nginx 站点配置位于服务器的 `/etc/nginx/conf.d/md-underpinetree.conf`。修改配置后必须先执行 `nginx -t`，再 `systemctl reload nginx`，不要改动同机其他子域的配置。

TLS 使用 Let’s Encrypt：证书位于 `/etc/letsencrypt/live/md.underpinetree.com/`，由已启用的 Certbot 自动续期任务维护。若调整 HTTP 站点配置，必须保留 `/.well-known/acme-challenge/` 路径以支持续期。
