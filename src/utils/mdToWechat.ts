import { Marked } from 'marked';
import type { RendererObject } from 'marked';

const MONO = "Consolas, Monaco, 'Courier New', monospace";

export type FontSize = 'small' | 'medium' | 'large';
export type FontFamily = 'hiragino' | 'song' | 'yahei';
export type Theme = 'double' | 'block' | 'simple';      // 标题展示策略
export type ColorScheme = 'forest' | 'indigo' | 'warm';  // 色系

const scaleMap: Record<FontSize, number> = { small: 0.85, medium: 1, large: 1.15 };

const fontMap: Record<FontFamily, string> = {
  hiragino: "Hiragino Sans GB, Noto Sans CJK SC, PingFang SC, Microsoft YaHei, sans-serif",
  song: "Songti SC, SimSun, STSong, Noto Serif CJK SC, serif",
  yahei: "Microsoft YaHei, PingFang SC, STHeiti, sans-serif",
};

// ── 色系：纯配色，独立于主题 ──

interface Colors {
  accent: string;
  link: string;
  blockquoteBg: string;
  tableHeaderBg: string;
}

const colorSchemes: Record<ColorScheme, Colors> = {
  forest: { accent: '#07c160', link: '#576b95', blockquoteBg: '#f3faf6', tableHeaderBg: '#f3faf6' },
  indigo: { accent: '#4a6cf7', link: '#4a6cf7', blockquoteBg: '#f4f6ff', tableHeaderBg: '#f4f6ff' },
  warm:  { accent: '#e67e22', link: '#e67e22', blockquoteBg: '#fef9f4', tableHeaderBg: '#fef9f4' },
};

// ── 主题：标题展示策略（H1-H2 统一，H3-H6 各自发挥） ──

interface ThemeDef {
  heading(depth: number, text: string, sans: string, scale: number, c: Colors): string;
}

function s(px: number, scale: number) { return `${(px * scale).toFixed(1)}px`; }

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[char]!);
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
}

function safeUrl(value: string, allowMailto = false): string | null {
  const normalized = [...value].filter((char) => {
    const code = char.charCodeAt(0);
    return code > 0x20 && (code < 0x7f || code > 0x9f);
  }).join('');
  const scheme = normalized.match(/^([a-z][a-z\d+.-]*):/i)?.[1]?.toLowerCase();

  if (!scheme || scheme === 'http' || scheme === 'https' || (allowMailto && scheme === 'mailto')) {
    return normalized;
  }

  return null;
}

function h1(text: string, sans: string, scale: number, accent: string) {
  return `<h1 style="font-family:${sans};font-size:${s(24, scale)};color:#111;font-weight:700;text-align:center;margin:1.6em 0 0.8em;padding-bottom:0.6em;border-bottom:2px solid ${accent};line-height:1.4;">${text}</h1>`;
}

function h2(text: string, sans: string, scale: number, accent: string) {
  return `<h2 style="font-family:${sans};font-size:${s(20, scale)};color:#222;font-weight:600;margin:1.4em 0 0.6em;padding-left:14px;border-left:3px solid ${accent};line-height:1.4;">${text}</h2>`;
}

const themes: Record<Theme, ThemeDef> = {
  // ═══ 双线：H3 上下双线框、H4 底线、H5/H6 逐级减弱 ═══
  double: {
    heading(depth, text, sans, scale, c) {
      if (depth === 1) return h1(text, sans, scale, c.accent);
      if (depth === 2) return h2(text, sans, scale, c.accent);
      // H3: 上下双线，居中
      if (depth === 3) return `<h3 style="font-family:${sans};font-size:${s(18, scale)};color:#222;font-weight:600;text-align:center;margin:1.8em 0 1em;padding:0.5em 0;border-top:2px solid ${c.accent};border-bottom:2px solid ${c.accent};line-height:1.5;">${text}</h3>`;
      // H4: 底部细线
      if (depth === 4) return `<h4 style="font-family:${sans};font-size:${s(17, scale)};color:#333;font-weight:600;margin:1.3em 0 0.5em;padding-bottom:0.3em;border-bottom:1px solid ${c.accent};line-height:1.5;">${text}</h4>`;
      if (depth === 5) return `<h5 style="font-family:${sans};font-size:${s(16, scale)};color:#444;font-weight:600;margin:1em 0 0.3em;line-height:1.5;">${text}</h5>`;
      return `<h6 style="font-family:${sans};font-size:${s(15, scale)};color:#888;font-weight:500;margin:0.8em 0 0.3em;line-height:1.5;">${text}</h6>`;
    },
  },

  // ═══ 色块：背景色递进 ═══
  block: {
    heading(depth, text, sans, scale, c) {
      if (depth === 1) return h1(text, sans, scale, c.accent);
      if (depth === 2) return h2(text, sans, scale, c.accent);
      if (depth === 3) return `<h3 style="font-family:${sans};font-size:${s(18, scale)};color:#fff;font-weight:600;margin:1.3em 0 0.5em;padding:6px 12px;background:${c.accent};line-height:1.5;">${text}</h3>`;
      if (depth === 4) return `<h4 style="font-family:${sans};font-size:${s(17, scale)};color:#333;font-weight:600;margin:1.2em 0 0.4em;padding:4px 12px;background:${c.accent}15;line-height:1.5;">${text}</h4>`;
      if (depth === 5) return `<h5 style="font-family:${sans};font-size:${s(16, scale)};color:#444;font-weight:600;margin:1em 0 0.3em;padding:2px 8px;background:${c.accent}0a;line-height:1.5;">${text}</h5>`;
      return `<h6 style="font-family:${sans};font-size:${s(15, scale)};color:#888;font-weight:500;margin:0.8em 0 0.3em;line-height:1.5;">${text}</h6>`;
    },
  },

  // ═══ 简约：空间 + 底线区分 ═══
  simple: {
    heading(depth, text, sans, scale, c) {
      if (depth === 1) return `<h1 style="font-family:${sans};font-size:${s(24, scale)};color:#111;font-weight:700;text-align:center;margin:1.6em 0 0.8em;padding-bottom:0.5em;border-bottom:1px solid ${c.accent};line-height:1.4;">${text}</h1>`;
      if (depth === 2) return `<h2 style="font-family:${sans};font-size:${s(20, scale)};color:#222;font-weight:600;margin:1.4em 0 0.6em;padding-left:12px;border-left:3px solid ${c.accent};line-height:1.4;">${text}</h2>`;
      if (depth === 3) return `<h3 style="font-family:${sans};font-size:${s(18, scale)};color:#222;font-weight:600;margin:1.3em 0 0.5em;padding-left:8px;line-height:1.5;">${text}</h3>`;
      if (depth === 4) return `<h4 style="font-family:${sans};font-size:${s(17, scale)};color:#333;font-weight:600;margin:1.2em 0 0.4em;padding-bottom:4px;border-bottom:1px solid #e0e0e0;line-height:1.5;">${text}</h4>`;
      if (depth === 5) return `<h5 style="font-family:${sans};font-size:${s(16, scale)};color:#444;font-weight:600;margin:1em 0 0.3em;line-height:1.5;">${text}</h5>`;
      return `<h6 style="font-family:${sans};font-size:${s(15, scale)};color:#888;font-weight:500;margin:0.8em 0 0.3em;line-height:1.5;">${text}</h6>`;
    },
  },
};

// ── Renderer ──

function buildRenderer(scale: number, sans: string, theme: ThemeDef, c: Colors): RendererObject {
  return {
    heading({ tokens, depth }) {
      const text = this.parser.parseInline(tokens);
      return theme.heading(depth, text, sans, scale, c);
    },

    paragraph({ tokens }) {
      const text = this.parser.parseInline(tokens);
      return `<p style="font-family:${sans};font-size:${s(16, scale)};color:#3f3f3f;line-height:1.9;margin:0 0 1.5em 0;">${text}</p>`;
    },

    html() {
      return '';
    },

    code({ text, lang }) {
      const langTag = lang
        ? `<div style="font-family:${MONO};font-size:${s(11, scale)};color:#999;padding:10px 14px 0;">${escapeHtml(lang)}</div>`
        : '';
      const clean = escapeHtml(text.replace(/\n$/, ''));
      return `<section style="margin:1.5em 0;border-left:3px solid ${c.accent};background:#f8f8f8;">${langTag}<pre style="margin:0;padding:12px 14px;font-family:${MONO};font-size:${s(13.5, scale)};line-height:1.7;white-space:pre-wrap;color:#333;"><code>${clean}</code></pre></section>`;
    },

    blockquote({ tokens }) {
      const text = this.parser.parse(tokens);
      return `<blockquote style="font-family:${sans};border-left:3px solid ${c.accent};background:${c.blockquoteBg};padding:0.8em 1em;margin:1.5em 0;color:#3f3f3f;font-size:${s(15, scale)};line-height:1.85;">${text}</blockquote>`;
    },

    hr() {
      return `<hr style="margin:1.5em 0;border:0;border-top:2px solid ${c.accent};">`;
    },

    list(token) {
      const tag = token.ordered ? 'ol' : 'ul';
      const sty = `list-style:none;padding-left:0;margin:0.5em 0 1.5em;font-size:${s(16, scale)};color:#3f3f3f;line-height:1.9;`;
      let counter = Number(token.start) || 1;
      let body = '';
      for (const item of token.items) {
        let text = this.parser.parse(item.tokens);
        const m = text.match(/^<p[^>]*>([\s\S]*?)<\/p>$/);
        text = m ? m[1] : text;
        text = token.ordered ? `${counter++}. ${text}` : `• ${text}`;
        body += `<li style="margin:0.3em 0;font-size:${s(16, scale)};color:#3f3f3f;line-height:1.9;">${text}</li>`;
      }
      return `<${tag} style="font-family:${sans};${sty}">${body}</${tag}>`;
    },

    listitem(item) {
      let text = this.parser.parse(item.tokens);
      const m = text.match(/^<p[^>]*>([\s\S]*?)<\/p>$/);
      text = m ? m[1] : text;
      return `<li style="margin:0.3em 0;font-size:${s(16, scale)};color:#3f3f3f;line-height:1.9;">${text}</li>`;
    },

    table(token) {
      let header = '';
      for (const cell of token.header) {
        header += `<th style="font-family:${sans};border:1px solid #e8e8e8;padding:0.6em 0.8em;background:${c.tableHeaderBg};font-weight:600;text-align:center;font-size:${s(14, scale)};color:#333;">${this.parser.parseInline(cell.tokens)}</th>`;
      }
      let body = '';
      for (const row of token.rows) {
        let rowHtml = '';
        for (let i = 0; i < row.length; i++) {
          const bg = i % 2 === 0 ? '' : 'background:#fafafa;';
          rowHtml += `<td style="font-family:${sans};border:1px solid #e8e8e8;padding:0.5em 0.8em;font-size:${s(14, scale)};color:#3f3f3f;${bg}">${this.parser.parseInline(row[i].tokens)}</td>`;
        }
        body += `<tr>${rowHtml}</tr>`;
      }
      return `<table style="font-family:${sans};border-collapse:collapse;width:100%;margin:1.5em 0;font-size:${s(14, scale)};"><thead><tr>${header}</tr></thead><tbody>${body}</tbody></table>`;
    },

    strong({ tokens }) {
      return `<strong style="font-weight:600;color:#1a1a1a;">${this.parser.parseInline(tokens)}</strong>`;
    },

    em({ tokens }) {
      return `<em style="font-style:italic;color:#555;">${this.parser.parseInline(tokens)}</em>`;
    },

    codespan({ text }) {
      return `<code style="font-family:${MONO};background:#fff0f0;padding:2px 6px;font-size:90%;color:#c7254e;">${escapeHtml(text)}</code>`;
    },

    del({ tokens }) {
      return `<del style="text-decoration:line-through;color:#aaa;">${this.parser.parseInline(tokens)}</del>`;
    },

    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const url = safeUrl(href, true);
      if (!url) return text;

      const ti = title ? ` title="${escapeAttribute(title)}"` : '';
      return `<a href="${escapeAttribute(url)}"${ti} style="color:${c.link};text-decoration:none;font-weight:500;">${text}</a>`;
    },

    image({ href, title, text }) {
      const url = safeUrl(href);
      if (!url) return `<p style="text-align:center;margin:1.5em 0;">${escapeHtml(text)}</p>`;

      const ti = title ? ` title="${escapeAttribute(title)}"` : '';
      return `<p style="text-align:center;margin:1.5em 0;"><img src="${escapeAttribute(url)}" alt="${escapeAttribute(text)}"${ti} style="max-width:100%;height:auto;"></p>`;
    },
  };
}

export function mdToWechat(
  markdown: string,
  fontSize: FontSize = 'small',
  fontFamily: FontFamily = 'hiragino',
  theme: Theme = 'block',
  colorScheme: ColorScheme = 'forest',
): string {
  const scale = scaleMap[fontSize];
  const sans = fontMap[fontFamily];
  const parser = new Marked({
    async: false,
    renderer: buildRenderer(scale, sans, themes[theme], colorSchemes[colorScheme]),
  });
  const body = parser.parse(markdown) as string;
  const html = `<section style="font-family:${sans};font-size:${s(16, scale)};color:#3f3f3f;line-height:1.9;">${body}</section>`;
  return fixCjkLineBreaks(html);
}

// ── CJK word-joiner fix ──

const CJK = '⺀-⻿　-〿㇀-㇯㈀-㏿㐀-䶿一-鿿豈-﫿＀-￯';
const PUNCT = '：；。，、！？」』》）】〕〉」》〉）〗】';
const RE_CJK_PUNCT = new RegExp(`([${CJK}])([${PUNCT}])`, 'g');
const INLINE_TAGS = '(?:strong|em|a|code|del|span)';
const RE_TAG_PUNCT = new RegExp(`(<\\/${INLINE_TAGS}>)([${PUNCT}])`, 'g');

function fixCjkLineBreaks(html: string): string {
  const protectedFragments: string[] = [];
  const protect = (fragment: string) => {
    const index = protectedFragments.push(fragment) - 1;
    return `%%CODE_FRAGMENT_${index}%%`;
  };

  html = html.replace(/<pre\b[\s\S]*?<\/pre>/g, protect);
  html = html.replace(/<code\b[\s\S]*?<\/code>/g, protect);
  html = html.replace(/>([^<]*)</g, (_full, text: string) => {
    const fixed = text.replace(RE_CJK_PUNCT, '$1&#x2060;$2');
    return `>${fixed}<`;
  });
  html = html.replace(RE_TAG_PUNCT, '$1&#x2060;$2');
  return html.replace(/%%CODE_FRAGMENT_(\d+)%%/g, (_full, index: string) => protectedFragments[Number(index)]!);
}

// ── Clipboard ──

export function copyDomToClipboard(containerId: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const container = document.getElementById(containerId);
      if (!container) { resolve(false); return; }
      const range = document.createRange();
      range.selectNodeContents(container);
      const sel = window.getSelection()!;
      sel.removeAllRanges();
      sel.addRange(range);
      let ok = false;
      try { ok = document.execCommand('copy'); } catch { ok = false; }
      sel.removeAllRanges();
      resolve(ok);
    } catch { resolve(false); }
  });
}
