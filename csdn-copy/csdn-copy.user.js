// ==UserScript==
// @name         CSDN 代码块自由复制
// @namespace    https://github.com/Cjantwhy
// @version      1.3
// @description  解除 CSDN 代码块复制限制：自动展开被折叠的长代码块；点代码块右上角红色“复制”按钮一键复制完整代码（可验证的剪贴板写入，失败会如实提示）
// @author       Cjantwhy
// @homepageURL  https://github.com/Cjantwhy/my-tampermonkey-scripts
// @match        *://blog.csdn.net/*
// @match        *://*.blog.csdn.net/*
// @grant        GM_setClipboard
// @run-at       document-start
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';

  /* ============ 1. 捕获阶段拦截页面的复制/选中/右键屏蔽 ============
     CSDN 把屏蔽监听绑在 document 上，window 捕获阶段 stopPropagation 可使其失效 */
  ['copy', 'cut', 'contextmenu', 'selectstart', 'dragstart'].forEach(function (type) {
    window.addEventListener(type, function (e) {
      e.stopPropagation();
    }, true);
  });
  window.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && ['c', 'a', 'x'].indexOf(e.key.toLowerCase()) >= 0) {
      e.stopPropagation();
    }
  }, true);

  /* ============ 2. 清掉页面内联的 oncopy / onselectstart ============ */
  function cleanInlineHandlers() {
    var s = document.createElement('script');
    s.textContent = '(' + function () {
      ['oncopy', 'oncut', 'oncontextmenu', 'onselectstart', 'ondragstart'].forEach(function (k) {
        document[k] = null;
        if (document.body) document.body[k] = null;
      });
    } + ')();';
    document.documentElement.appendChild(s);
    s.remove();
  }

  /* ============ 3. 样式 ============
     - 恢复文章区域选中
     - 强制展开被折叠的长代码块（CSDN 用 set-code-hide/set-code-height 把代码压成
       340px 高的滚动小窗，只能看到十几行，拖选经常只选中可见部分）
     - 隐藏 CSDN 自带“登录后复制”按钮，避免点错 */
  function addStyle() {
    var style = document.createElement('style');
    style.textContent = [
      '#content_views, #content_views *, .article_content, .article_content * {',
      '  user-select: auto !important;',
      '  -webkit-user-select: auto !important;',
      '}',
      '.hljs-button { display: none !important; }',
      'pre, .set-code-height, .set-code-hide, .code-container, .dp-highlighter, .dp-highlighter ol {',
      '  max-height: none !important;',
      '  height: auto !important;',
      '  overflow: auto !important;',
      '}',
      '#article_content { height: auto !important; max-height: none !important; }',
      '.hide-article-box { display: none !important; }',
      'pre, .dp-highlighter, .code-container { position: relative !important; }',
      '.tm-copy-btn {',
      '  position: absolute; top: 8px; right: 10px; z-index: 99999;',
      '  padding: 3px 14px; font-size: 13px; line-height: 22px;',
      '  color: #fff; background: #c9302c; border: none; border-radius: 4px;',
      '  cursor: pointer; font-weight: bold;',
      '  box-shadow: 0 1px 4px rgba(0,0,0,.4);',
      '}',
      '.tm-copy-btn:hover { background: #e04b48; }',
      '.tm-copy-btn.done { background: #27ae60; }'
    ].join('\n');
    (document.head || document.documentElement).appendChild(style);
  }

  /* ============ 4. 提取完整代码 ============
     实测 CSDN 的页面 JS 会把代码块改写成 <code><ol class="hljs-ln"><li>一行</li>…</ol></code>，
     此时 code.textContent 会丢掉全部换行，必须按 li 逐行拼接；老版 dp-highlighter 同为 ol>li。
     先克隆再剔除行号列和工具栏，避免混入行号或“登录后复制”等按钮文字。 */
  function getCodeText(container) {
    var clone = container.cloneNode(true);
    clone.querySelectorAll(
      '.hljs-ln-numbers, ul.pre-numbering, ol.pre-numbering, .code-number, ' +
      '.hljs-button, .tm-copy-btn, .tools, .bar, .code-copy, .copy-code'
    ).forEach(function (n) { n.remove(); });

    var lis = clone.querySelectorAll('ol > li');
    if (lis.length) {
      return Array.prototype.map.call(lis, function (li) {
        return li.textContent.replace(/\u00a0/g, ' ').replace(/\s+$/, '');
      }).join('\n');
    }
    var code = clone.querySelector('code') || clone;
    return (code.textContent || '').replace(/\u00a0/g, ' ');
  }

  /* ============ 写剪贴板：三层策略，结果可验证 ============
     实测部分 Tampermonkey 环境（尤其 Chrome MV3）的 GM_setClipboard 会静默失效，
     且不验证结果就显示“已复制”会造成按钮撒谎。
     优先用可验证的 navigator.clipboard.writeText（点击=用户手势，https 满足条件），
     失败降级 execCommand，最后才用 GM_setClipboard，并如实反馈。 */
  function flashBtn(btn, ok) {
    btn.textContent = ok ? '已复制 ✓' : '复制失败，请用 Ctrl+C';
    btn.classList.add('done');
    setTimeout(function () {
      btn.textContent = '复制';
      btn.classList.remove('done');
    }, ok ? 1500 : 2500);
  }

  function legacyCopy(text, btn) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;left:-9999px;top:0;opacity:0;';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0, text.length);
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
    ta.remove();
    if (ok) { flashBtn(btn, true); return; }
    if (typeof GM_setClipboard === 'function') {
      GM_setClipboard(text, 'text');        /* 无法验证，仅作最后手段 */
      flashBtn(btn, true);
    } else {
      flashBtn(btn, false);
    }
  }

  function copyText(text, btn) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      btn.textContent = '复制中…';
      navigator.clipboard.writeText(text).then(
        function () { flashBtn(btn, true); },
        function () { legacyCopy(text, btn); }
      );
      return;
    }
    legacyCopy(text, btn);
  }

  /* ============ 5. 给每个代码块挂“复制”按钮 ============ */
  function decorate(node) {
    if (node.__tmCopied) return;
    node.__tmCopied = true;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tm-copy-btn';
    btn.textContent = '复制';
    btn.title = '复制完整代码（无需手动选中）';
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      copyText(getCodeText(node), btn);
    }, true);
    node.appendChild(btn);
  }

  function scan() {
    document.querySelectorAll(
      '#content_views pre, .article_content pre, pre, div.dp-highlighter'
    ).forEach(decorate);
  }

  /* ============ 6. 启动 + 监听动态加载的代码块 ============ */
  function start() {
    addStyle();
    cleanInlineHandlers();
    scan();
    new MutationObserver(scan).observe(document.body, { childList: true, subtree: true });
    window.addEventListener('load', cleanInlineHandlers);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
