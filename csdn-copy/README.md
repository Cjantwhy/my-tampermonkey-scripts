# CSDN 代码块自由复制

解除 CSDN 博客的代码块复制限制：自动展开被折叠的长代码块，点代码块右上角红色「复制」按钮即可一键复制完整代码。

**版本**：1.3 ｜ **许可**：MIT ｜ **作者**：[Cjantwhy](https://github.com/Cjantwhy)

## 安装

- [点击安装](https://raw.githubusercontent.com/Cjantwhy/my-tampermonkey-scripts/main/csdn-copy/csdn-copy.user.js)（需已安装 [Tampermonkey](https://www.tampermonkey.net/)，点击后按提示确认即可）
- 或手动安装：复制 [`csdn-copy.user.js`](./csdn-copy.user.js) 全部内容，在 Tampermonkey 的「添加新脚本」中粘贴保存

## 功能

- **解除复制限制**：在 `window` 捕获阶段拦截页面对复制、剪切、选中、右键事件的屏蔽，并清除页面内联的 `oncopy` / `onselectstart` 处理器
- **展开折叠代码块**：强制展开 CSDN 压成小滚动窗的长代码（`set-code-hide` / `set-code-height`），并隐藏 CSDN 自带的「登录后复制」按钮，避免误点
- **一键复制按钮**：给每个代码块右上角挂一个红色「复制」按钮，无需手动选中
- **完整换行**：按行号 `ol > li` 逐行提取代码，避免 `textContent` 丢失换行；提取前剔除行号列和工具栏，不混入多余文字
- **可靠的剪贴板写入**：优先 `navigator.clipboard.writeText`（结果可验证），失败降级 `execCommand`，最后才用 `GM_setClipboard`；按钮如实反馈「已复制 ✓」或「复制失败，请用 Ctrl+C」
- **动态内容**：通过 `MutationObserver` 监听并处理懒加载 / 翻页后新出现的代码块

## 使用方法

1. 安装脚本后打开任意 CSDN 博客文章
2. 被折叠的代码块会自动完整展开
3. 点击代码块右上角的「复制」按钮，按钮变绿显示「已复制 ✓」即成功

## 适用网站

- `blog.csdn.net`（含子域名）
