interface PreviewPanelProps {
  html: string;
}

export default function PreviewPanel({ html }: PreviewPanelProps) {
  const now = new Date();
  const dateStr = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;

  return (
    <div className="panel preview-panel">
      <div className="preview-header">预览效果</div>
      <div className="preview-wrapper">
        <div className="preview-card">
          <div className="wechat-article-header">{dateStr}</div>
          <div className="preview-content" id="preview-content"
            dangerouslySetInnerHTML={{
              __html: html || '<p style="color:#bbb;text-align:center;margin-top:80px;font-size:15px;">在左侧输入 Markdown<br/>右侧实时预览公众号效果</p>'
            }}
          />
          <div className="wechat-article-footer">
            <span>阅读 1.2w</span>
            <span className="footer-divider">|</span>
            <span>赞 286</span>
          </div>
        </div>
      </div>
    </div>
  );
}
