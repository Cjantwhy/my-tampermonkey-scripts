# My Tampermonkey Scripts

个人收集的 Tampermonkey / Greasemonkey 用户脚本。

## 脚本列表

### 飞书表格转 Markdown

**文件**: [`feishu-table-to-markdown.user.js`](feishu-table-to-markdown.user.js)

在飞书文档页面中，将鼠标悬停在表格上，按下 **Alt+M** 即可将表格内容复制为 Markdown 格式到剪贴板。

**功能**:

- 自动识别鼠标所在的 `<table>` 元素
- 将表格转换为标准 Markdown 表格语法
- 正确处理单元格内的换行（`<br>`）和管道符转义
- 复制成功后显示页面提示

**适用网站**:

- `feishu.cn`
- `larkoffice.com`

**使用方法**:

1. 在 Tampermonkey 中安装此脚本
2. 打开任意飞书文档
3. 将鼠标悬停在目标表格上方
4. 按下 `Alt + M`，表格内容即以 Markdown 格式复制到剪贴板

## 许可

MIT
