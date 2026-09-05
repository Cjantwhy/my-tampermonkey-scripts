#!/usr/bin/env node
/**
 * 扫描仓库内各脚本目录中的 *.user.js，解析 ==UserScript== 元数据块，
 * 自动重建根 README.md 中 scripts 标记区段内的索引表格。
 * 标记区段之外的手写内容不会被改动。
 *
 * 用法：
 *   node tools/build-readme.mjs           生成并写入 README.md
 *   node tools/build-readme.mjs --check   只校验 README 索引是否为最新，不写入（可用于 CI）
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const readmePath = join(root, 'README.md');
const START = '<!-- scripts:start -->';
const END = '<!-- scripts:end -->';

function parseMeta(code) {
  const meta = { match: [] };
  const block = code.match(/\/\/ ==UserScript==([\s\S]*?)\/\/ ==\/UserScript==/);
  if (!block) return meta;
  for (const line of block[1].split('\n')) {
    const m = line.match(/^\s*\/\/\s*@([\w-]+)\s+(.*?)\s*$/);
    if (!m) continue;
    if (m[1] === 'match' || m[1] === 'include') meta.match.push(m[2]);
    else meta[m[1]] = m[2];
  }
  return meta;
}

/** 从 @match 模式提取显示用域名，去掉 *. 前缀并去重 */
function hostsOf(patterns) {
  const hosts = new Set();
  for (const p of patterns) {
    const m = p.match(/^[\w*]+:\/\/([^/]+)\//);
    if (m) hosts.add(m[1].replace(/^\*\./, ''));
  }
  return [...hosts];
}

/** 从 origin 远程解析 owner/repo，供 raw 安装链接使用 */
function githubSlug() {
  try {
    const url = execFileSync('git', ['remote', 'get-url', 'origin'], {
      cwd: root,
      encoding: 'utf8',
    }).trim();
    const m = url.match(/github\.com[/:]([^/]+\/[^/]+?)(?:\.git)?$/i);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

function findScripts() {
  const out = [];
  for (const name of readdirSync(root)) {
    if (name.startsWith('.') || name === 'tools' || name === 'node_modules') continue;
    const dir = join(root, name);
    if (!statSync(dir).isDirectory()) continue;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith('.user.js')) continue;
      const file = join(name, f).split(sep).join('/');
      const meta = parseMeta(readFileSync(join(root, file), 'utf8'));
      out.push({
        dir: name,
        file,
        name: meta.name || name,
        description: meta.description || '',
        version: meta.version || '',
        hosts: hostsOf(meta.match),
      });
    }
  }
  out.sort((a, b) => a.name.localeCompare(b.name, 'zh'));
  return out;
}

const esc = (s) => s.replace(/\|/g, '\\|');

function buildTable(scripts, slug) {
  const rows = scripts.map((s) => {
    const doc = `[${esc(s.name)}](./${s.dir}/README.md)`;
    const install = slug
      ? `[安装](https://raw.githubusercontent.com/${slug}/main/${s.file})`
      : `[${s.file.split('/').pop()}](./${s.file})`;
    const hosts = s.hosts.length ? s.hosts.map((h) => `\`${h}\``).join('、') : '—';
    return `| ${doc} | ${esc(s.description)} | ${s.version || '—'} | ${hosts} | ${install} |`;
  });
  return ['| 脚本 | 描述 | 版本 | 适用网站 | 安装 |', '| --- | --- | --- | --- | --- |', ...rows].join(
    '\n',
  );
}

const readme = readFileSync(readmePath, 'utf8');
const startIdx = readme.indexOf(START);
const endIdx = readme.indexOf(END);
if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
  console.error(`错误：README.md 中缺少成对标记 ${START} / ${END}`);
  process.exit(1);
}

const scripts = findScripts();
if (scripts.length === 0) {
  console.error('错误：未在任何脚本目录中找到 .user.js 文件');
  process.exit(1);
}

const slug = githubSlug();
const table = buildTable(scripts, slug);
const currentRegion = readme.slice(startIdx, endIdx + END.length);
const generatedRegion = `${START}\n${table}\n${END}`;

if (process.argv.includes('--check')) {
  if (currentRegion === generatedRegion) {
    console.log(`README.md 索引已是最新（${scripts.length} 个脚本）`);
  } else {
    console.error('README.md 索引已过期，请运行 node tools/build-readme.mjs');
    process.exit(1);
  }
} else {
  writeFileSync(readmePath, readme.slice(0, startIdx) + generatedRegion + readme.slice(endIdx + END.length), 'utf8');
  console.log(`已更新 README.md 索引（${scripts.length} 个脚本）：`);
  for (const s of scripts) console.log(`  - ${s.name} v${s.version} [${s.file}]`);
  if (!slug) console.log('提示：未能从 git remote 解析 GitHub 仓库，安装列已退化为文件链接');
}
