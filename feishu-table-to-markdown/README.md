# 飞书表格转 Markdown

在飞书文档页面中，将鼠标悬停在表格上，按下 **Alt+M** 即可将表格内容复制为 Markdown 格式到剪贴板。

**版本**：1.0 ｜ **许可**：MIT ｜ **作者**：[Cjantwhy](https://github.com/Cjantwhy)

## 安装

- [点击安装](https://raw.githubusercontent.com/Cjantwhy/my-tampermonkey-scripts/main/feishu-table-to-markdown/feishu-table-to-markdown.user.js)（需已安装 [Tampermonkey](https://www.tampermonkey.net/)，点击后按提示确认即可）
- 或手动安装：复制 [`feishu-table-to-markdown.user.js`](./feishu-table-to-markdown.user.js) 全部内容，在 Tampermonkey 的「添加新脚本」中粘贴保存

## 功能

- 自动识别鼠标所在的 `<table>` 元素
- 将表格转换为标准 Markdown 表格语法
- 正确处理单元格内的换行（`<br>`）和管道符转义
- 复制成功后显示页面提示

## 使用方法

1. 在 Tampermonkey 中安装此脚本
2. 打开任意飞书文档
3. 将鼠标悬停在目标表格上方
4. 按下 `Alt + M`，表格内容即以 Markdown 格式复制到剪贴板

## 适用网站

- `feishu.cn`
- `larkoffice.com`
