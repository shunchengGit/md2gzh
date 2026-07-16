import { describe, expect, it } from 'vitest';
import { mdToWechat } from './mdToWechat';

describe('mdToWechat', () => {
  it('removes raw HTML', () => {
    const html = mdToWechat('<script>alert(1)</script><img src=x onerror=alert(1)>');

    expect(html).not.toContain('<script>');
    expect(html).not.toContain('onerror=');
    expect(html).not.toContain('<img src=x');
  });

  it('escapes code content and image attributes', () => {
    const html = mdToWechat('`<img onerror=alert(1)>`\n\n![<>&](https://example.com/image.png "<>&")');

    expect(html).toContain('&lt;img onerror=alert(1)&gt;');
    expect(html).toContain('alt="&lt;&gt;&amp;"');
    expect(html).toContain('title="&lt;&gt;&amp;"');
  });

  it('rejects unsafe URLs while keeping safe URLs', () => {
    const html = mdToWechat('[bad](javascript:alert(1))\n\n![bad](data:text/html,test)\n\n[good](https://example.com)');

    expect(html).not.toContain('javascript:');
    expect(html).not.toContain('data:text/html');
    expect(html).toContain('href="https://example.com"');
  });

  it('keeps renderer settings isolated between conversions', () => {
    const forest = mdToWechat('### 标题', 'small', 'hiragino', 'block', 'forest');
    const indigo = mdToWechat('### 标题', 'large', 'song', 'double', 'indigo');

    expect(forest).toContain('background:#07c160');
    expect(forest).toContain('font-size:15.3px');
    expect(indigo).toContain('border-top:2px solid #4a6cf7');
    expect(indigo).toContain('font-size:20.7px');
  });

  it('preserves code content while fixing CJK prose line breaks', () => {
    const html = mdToWechat('正文，继续\n\n`代码，内容`\n\n```txt\n代码，内容\n```');

    expect(html).toContain('正文&#x2060;，继续');
    expect(html).toContain('>代码，内容</code>');
    expect(html).not.toContain('代码&#x2060;，内容');
  });
});
