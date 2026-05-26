import { useState, useCallback } from 'react';
import { copyDomToClipboard } from '../utils/mdToWechat';
import type { FontSize, FontFamily, Theme, ColorScheme } from '../utils/mdToWechat';

interface ToolbarProps {
  hasContent: boolean;
  fontSize: FontSize;
  fontFamily: FontFamily;
  theme: Theme;
  colorScheme: ColorScheme;
  onFontSizeChange: (v: FontSize) => void;
  onFontFamilyChange: (v: FontFamily) => void;
  onThemeChange: (v: Theme) => void;
  onColorSchemeChange: (v: ColorScheme) => void;
}

const sizeOptions: { value: FontSize; label: string }[] = [
  { value: 'small', label: '小' },
  { value: 'medium', label: '中' },
  { value: 'large', label: '大' },
];

const fontOptions: { value: FontFamily; label: string }[] = [
  { value: 'hiragino', label: '冬青' },
  { value: 'song', label: '宋体' },
  { value: 'yahei', label: '雅黑' },
];

const themeOptions: { value: Theme; label: string }[] = [
  { value: 'double', label: '双线' },
  { value: 'block', label: '色块' },
  { value: 'simple', label: '简约' },
];

const colorOptions: { value: ColorScheme; label: string }[] = [
  { value: 'forest', label: '墨绿' },
  { value: 'indigo', label: '靛蓝' },
  { value: 'warm', label: '暖橙' },
];

function SettingGroup({ label, options, value, onChange }: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: any) => void;
}) {
  return (
    <div className="setting-group">
      <span className="setting-label">{label}</span>
      {options.map(o => (
        <button
          key={o.value}
          className={`setting-btn${value === o.value ? ' active' : ''}`}
          onClick={() => onChange(o.value)}
        >{o.label}</button>
      ))}
    </div>
  );
}

export default function Toolbar({ hasContent, fontSize, fontFamily, theme, colorScheme, onFontSizeChange, onFontFamilyChange, onThemeChange, onColorSchemeChange }: ToolbarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    if (!hasContent) return;
    const ok = await copyDomToClipboard('preview-content');
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [hasContent]);

  return (
    <div className="toolbar">
      <div className="toolbar-left">
        <svg className="toolbar-logo" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <span className="toolbar-title">MD 转公众号</span>
      </div>
      <div className="toolbar-center">
        <SettingGroup label="字号" options={sizeOptions} value={fontSize} onChange={onFontSizeChange} />
        <div className="setting-divider" />
        <SettingGroup label="字体" options={fontOptions} value={fontFamily} onChange={onFontFamilyChange} />
        <div className="setting-divider" />
        <SettingGroup label="主题" options={themeOptions} value={theme} onChange={onThemeChange} />
        <div className="setting-divider" />
        <SettingGroup label="色系" options={colorOptions} value={colorScheme} onChange={onColorSchemeChange} />
      </div>
      <div className="toolbar-right">
        <button className={`copy-btn${hasContent ? '' : ' disabled'}`} onClick={handleCopy} disabled={!hasContent}>
          {copied ? '✓  已复制' : '一键复制'}
        </button>
        {copied && <span className="toast">复制成功，可粘贴到公众号编辑器</span>}
      </div>
    </div>
  );
}
