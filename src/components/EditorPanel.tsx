interface EditorPanelProps {
  value: string;
  onChange: (value: string) => void;
}

const placeholder = `# 欢迎使用 MD 转公众号工具

在左侧输入 **Markdown**，右侧实时预览。

---

## 支持的语法

- **加粗** / *斜体* / ~~删除线~~ / \`行内代码\`
- [链接](https://example.com) / ![图片](https://via.placeholder.com/150)
- 引用块和代码块

> 这是一段引用文字

\`\`\`javascript
console.log('hello, wechat');
\`\`\`

### 表格

| 姓名 | 年龄 | 城市 |
|------|------|------|
| 张三 | 28   | 北京 |
| 李四 | 32   | 上海 |

### 列表

1. 有序列表项一
2. 有序列表项二

- 无序列表项 A
- 无序列表项 B

---

点击右上角 **一键复制** 即可粘贴到公众号编辑器。`;

export default function EditorPanel({ value, onChange }: EditorPanelProps) {
  return (
    <div className="panel editor-panel">
      <textarea
        className="editor"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
      />
    </div>
  );
}
