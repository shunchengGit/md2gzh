# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**md2gzh** — 一个 Markdown 转微信公众号排版工具。用户在左侧编辑器输入 Markdown，右侧实时预览公众号样式效果，支持一键复制富文本到公众号编辑器。纯前端应用，无后端。

## Commands

- `npm run dev` — 启动开发服务器 (Vite)
- `npm run build` — TypeScript 编译 + Vite 生产构建
- `npm run lint` — ESLint 检查
- `npm run preview` — 预览生产构建结果

## Architecture

### 数据流

`App` 管理全局状态（markdown 文本、字号、字体、主题、色系），通过 `useMemo` 调用 `mdToWechat()` 生成内联样式 HTML，传给 `PreviewPanel` 用 `dangerouslySetInnerHTML` 渲染。

### 核心模块

- **`src/utils/mdToWechat.ts`** — 核心转换逻辑。使用 `marked` 库的自定义 Renderer 生成全内联样式的 HTML（公众号不支持外部 CSS）。包含：
  - 3 套主题（双线/色块/简约）— 控制标题展示策略
  - 3 套色系（墨绿/靛蓝/暖橙）— 控制配色
  - 3 种字号、3 种字体
  - `fixCjkLineBreaks()` — 在 CJK 字符与标点间插入 word-joiner 防止断行
  - `copyDomToClipboard()` — 通过 DOM Range 选区 + `execCommand('copy')` 复制富文本

### 组件结构

- `App` → `Toolbar` + `EditorPanel` + `PreviewPanel`
- `Toolbar` 包含多个 `SettingGroup` 子组件，统一渲染设置按钮组
- `EditorPanel` 是纯 textarea，`PreviewPanel` 模拟公众号文章外壳（日期头、阅读量尾）

### 样式

全部在 `App.css` 中，无 CSS Modules。公众号排版样式由 `mdToWechat.ts` 的 Renderer 以内联 style 输出，与应用自身 UI 样式完全分离。

## Key Constraints

- 公众号编辑器不支持外部 CSS / class，所有排版样式必须内联
- 复制功能使用 `document.execCommand('copy')` 而非 Clipboard API，因为需要复制富文本格式
- `marked.use()` 修改全局 renderer，代码中通过 `cacheKey` 做简单缓存避免重复注册
