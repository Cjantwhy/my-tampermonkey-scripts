// ==UserScript==
// @name         飞书表格转Markdown
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  右键飞书文档中的表格，一键复制为Markdown
// @match        https://*.feishu.cn/*
// @match        https://*.larkoffice.com/*
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  // 判断是否在表格内
  function findTable(el) {
    while (el) {
      if (el.tagName === "TABLE") return el;
      el = el.parentElement;
    }
    return null;
  }

  // 将 <table> DOM 转为 Markdown
  function tableToMarkdown(table) {
    const rows = [];
    for (const tr of table.querySelectorAll("tr")) {
      const cells = [];
      for (const cell of tr.querySelectorAll("th, td")) {
        // 获取单元格内纯文本，保留 <br> 产生的换行为 <br>
        let text = "";
        cell.childNodes.forEach((node) => {
          if (node.nodeName === "BR") {
            text += "<br>";
          } else {
            text += node.textContent.trim();
          }
        });
        cells.push(text.replace(/\n/g, "<br>").replace(/\|/g, "\\|").trim());
      }
      rows.push(cells);
    }

    if (rows.length === 0) return "";

    const colCount = Math.max(...rows.map((r) => r.length));
    // 补齐列数
    rows.forEach((r) => {
      while (r.length < colCount) r.push("");
    });

    const header = "| " + rows[0].join(" | ") + " |";
    const sep =
      "|" +
      rows
        .slice(0, 1)[0]
        .map(() => " --- ")
        .join("|") +
      "|";
    const body = rows
      .slice(1)
      .map((r) => "| " + r.join(" | ") + " |")
      .join("\n");

    return header + "\n" + sep + "\n" + body;
  }

  // 注入右键菜单（页面内的自定义菜单）
  document.addEventListener("contextmenu", function (e) {
    const table = findTable(e.target);
    // 将找到的表格挂到 window 上供后续使用
    window.__feishuTargetTable = table;
  });

  // 快捷键：Alt+M 复制当前鼠标所在表格为 Markdown
  document.addEventListener("keydown", function (e) {
    if (e.altKey && e.key === "m") {
      // 尝试从鼠标位置找表格
      const el = document.elementFromPoint?.(
        ...(() => {
          // 取最近一次鼠标位置
          return window.__lastMousePos || [0, 0];
        })(),
      );
      const table =
        findTable(el || document.activeElement) || window.__feishuTargetTable;
      if (!table) {
        console.log("[飞书表格转MD] 未找到表格");
        return;
      }

      const md = tableToMarkdown(table);
      navigator.clipboard.writeText(md).then(() => {
        console.log("[飞书表格转MD] 已复制:\n", md);
        // 页面提示
        const toast = document.createElement("div");
        toast.textContent = "✅ 表格已复制为 Markdown！";
        Object.assign(toast.style, {
          position: "fixed",
          top: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "#4CAF50",
          color: "white",
          padding: "10px 24px",
          borderRadius: "8px",
          zIndex: "999999",
          fontSize: "14px",
        });
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2000);
      });
    }
  });

  // 记录鼠标位置
  document.addEventListener("mousemove", function (e) {
    window.__lastMousePos = [e.clientX, e.clientY];
  });

  console.log("[飞书表格转MD] 脚本已加载，将鼠标悬停在表格上按 Alt+M 复制");
})();
