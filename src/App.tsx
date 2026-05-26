import { useState, useMemo } from 'react';
import Toolbar from './components/Toolbar';
import EditorPanel from './components/EditorPanel';
import PreviewPanel from './components/PreviewPanel';
import { mdToWechat } from './utils/mdToWechat';
import type { FontSize, FontFamily, Theme, ColorScheme } from './utils/mdToWechat';
import './App.css';

export default function App() {
  const [markdown, setMarkdown] = useState('');
  const [fontSize, setFontSize] = useState<FontSize>('small');
  const [fontFamily, setFontFamily] = useState<FontFamily>('hiragino');
  const [theme, setTheme] = useState<Theme>('block');
  const [colorScheme, setColorScheme] = useState<ColorScheme>('forest');

  const html = useMemo(() => {
    if (!markdown.trim()) return '';
    try {
      return mdToWechat(markdown, fontSize, fontFamily, theme, colorScheme);
    } catch {
      return '<p style="color:red;">Markdown 解析失败</p>';
    }
  }, [markdown, fontSize, fontFamily, theme, colorScheme]);

  return (
    <div className="app">
      <Toolbar
        hasContent={!!markdown.trim()}
        fontSize={fontSize}
        fontFamily={fontFamily}
        theme={theme}
        colorScheme={colorScheme}
        onFontSizeChange={setFontSize}
        onFontFamilyChange={setFontFamily}
        onThemeChange={setTheme}
        onColorSchemeChange={setColorScheme}
      />
      <div className="main">
        <EditorPanel value={markdown} onChange={setMarkdown} />
        <PreviewPanel html={html} />
      </div>
    </div>
  );
}
