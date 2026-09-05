# My Tampermonkey Scripts

个人使用的 Tampermonkey 用户脚本集合。每个脚本放在独立目录中，内含脚本本体、详细说明和截图等资源。

## 脚本列表

<!-- scripts:start -->
| 脚本 | 描述 | 版本 | 适用网站 | 安装 |
| --- | --- | --- | --- | --- |
| [飞书表格转Markdown](./feishu-table-to-markdown/README.md) | 飞书文档中将鼠标悬停在表格上，按 Alt+M 一键复制为Markdown | 1.0 | `feishu.cn`、`larkoffice.com` | [安装](https://raw.githubusercontent.com/Cjantwhy/my-tampermonkey-scripts/main/feishu-table-to-markdown/feishu-table-to-markdown.user.js) |
| [CSDN 代码块自由复制](./csdn-copy/README.md) | 解除 CSDN 代码块复制限制：自动展开被折叠的长代码块；点代码块右上角红色“复制”按钮一键复制完整代码（可验证的剪贴板写入，失败会如实提示） | 1.3 | `blog.csdn.net` | [安装](https://raw.githubusercontent.com/Cjantwhy/my-tampermonkey-scripts/main/csdn-copy/csdn-copy.user.js) |
<!-- scripts:end -->

## 安装

需先安装 [Tampermonkey](https://www.tampermonkey.net/) 浏览器扩展，然后：

- 点击上表中的「安装」链接，按 Tampermonkey 提示确认即可。之后 Tampermonkey 会基于脚本 `@version` 自动检查并提示更新
- 或打开脚本目录中的 `.user.js` 文件，复制全部内容，在 Tampermonkey 的「添加新脚本」中粘贴保存

各脚本的详细功能与用法见其目录内的 README。

## 如何新增一个脚本

1. 新建以脚本 id 命名的目录（如 `my-script/`），放入 `my-script.user.js`
2. 在目录内写一个 `README.md`，说明功能、用法和适用网站（截图可放 `assets/` 子目录）
3. 运行 `node tools/build-readme.mjs`，上面的索引表会自动根据脚本元数据重建
4. 提交

索引表中的名称、描述、版本、适用网站均取自脚本文件头部的 `==UserScript==` 元数据块（`@name` / `@description` / `@version` / `@match`），修改脚本时请同步更新这些字段，再重新运行生成脚本。

## 许可

[MIT](./LICENSE)
