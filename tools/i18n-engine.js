// TwinDesk — 简体中文界面引擎（renderer / main 通用）
// TwinDesk — Simplified Chinese UI engine. GPL-3.0, see LICENSE.
//
// 用法（页面里）：<script src="../shared/i18n.js"></script>
// 这个文件由 tools/build-i18n.py 生成：末尾附加 window.TD_ZH 词典（英文 → 简体中文）。
// 翻译在 DOM 层面完成：静态 HTML 的文本、JS 动态插入的文本、title/placeholder/aria-label
// 等属性都会被替换，未收录的字符串原样保留（英文），不会破坏界面。
'use strict';

(function () {
  const isNode = typeof module !== 'undefined' && module.exports && typeof window === 'undefined';
  const ZH = (typeof TD_ZH !== 'undefined' && TD_ZH) || (typeof globalThis !== 'undefined' && globalThis.TD_ZH) || {};
  const CJK = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;
  const LATIN = /[A-Za-z]{2,}/;

  // ---- 语言：默认简体中文；?lang=en / localStorage td.lang=en / TWINDESK_LANG=en 可切回英文 ----
  function pickLang() {
    let v = '';
    try { if (typeof location !== 'undefined') v = new URLSearchParams(location.search).get('lang') || ''; } catch (e) {}
    if (!v) { try { v = localStorage.getItem('td.lang') || ''; } catch (e) {} }
    if (!v && typeof process !== 'undefined' && process.env && process.env.TWINDESK_LANG) v = process.env.TWINDESK_LANG;
    return /^en/i.test(v) ? 'en' : 'zh-CN';
  }

  const state = { lang: 'zh-CN' };
  state.lang = (typeof globalThis !== 'undefined' && globalThis.__tdLang) || pickLang();

  const lookup = new Map();
  for (const k in ZH) lookup.set(k, ZH[k]);

  // 省略号写法的两种形式都认
  function variants(s) {
    const out = [s];
    if (s.indexOf('…') >= 0) out.push(s.replace(/…/g, '...'));
    if (s.indexOf('...') >= 0) out.push(s.replace(/\.\.\./g, '…'));
    // 弯引号 → 直引号
    out.push(s.replace(/[’‘]/g, "'").replace(/[“”]/g, '"'));
    return out;
  }

  function dict(s) {
    for (const v of variants(s)) { const t = lookup.get(v); if (t) return t; }
    return null;
  }

  // ---- 动态串（带数字、名字）：{0} 为捕获组 ----
  const PATTERNS = [
    [/^Waiting for (.+)$/, '正在等待 {0}'],
    [/^Connecting to (.+?)…$/, '正在连接 {0}…'],
    [/^Connect(?:ing)? to (.+)$/, '正在连接 {0}'],
    [/^Connected to (.+)$/, '已连接到 {0}'],
    [/^(.+) is connected$/, '{0} 已连接'],
    [/^In use by (.+)$/, '正被 {0} 使用'],
    [/^(.+) didn’t answer\. Open TwinDesk on it\.$/, '{0} 没有响应。请在其上打开 TwinDesk。'],
    [/^Pairing didn’t work \((.+)\)\. Try a new code\.$/, '配对失败（{0}）。请换一个新代码。'],
    [/^The phone connection stopped \((.+)\)\.$/, '手机连接已中断（{0}）。'],
    [/^Installing on (.+?)…$/, '正在安装到 {0}…'],
    [/^Couldn’t install \((.+)\)$/, '无法安装（{0}）'],
    [/^Android (\d+)$/, 'Android {0}'],
    [/^(\d+) devices?$/, '{0} 台设备'],
    [/^(\d+) files?$/, '{0} 个文件'],
    [/^(\d+) folders?$/, '{0} 个文件夹'],
    [/^(\d+) minutes? ago$/, '{0} 分钟前'],
    [/^(\d+) hours? ago$/, '{0} 小时前'],
    [/^(\d+) days? ago$/, '{0} 天前'],
    [/^(\d+) seconds? ago$/, '{0} 秒前'],
    [/^Just now$/, '刚刚'],
    [/^(.+) · (\d+)$/, '{0} · {1}'],
    [/^(.+) · Charging$/, '{0} · 充电中'],
    [/^(\d+) items?$/, '{0} 个项目'],
    [/^(\d+) min ago$/, '{0} 分钟前'],
    [/^(\d+) hrs? ago$/, '{0} 小时前'],
    [/^(\d+)s ago$/, '{0} 秒前'],
    [/^(\d+)%$/, '{0}%'],
  ];

  // ---- 动词前缀（“正在发送 …”“已发送 …”）----
  const VERBS = {
    "Sending": "正在发送",
    "Sent": "已发送",
    "Sending…": "正在发送…",
    "Received": "已接收",
    "Receiving": "正在接收",
    "Getting": "正在获取",
    "Playing": "正在播放",
    "Opening": "正在打开",
    "Showing": "正在显示",
    "Copying": "正在复制",
    "Copied": "已复制",
    "Pasting": "正在粘贴",
    "Pasted": "已粘贴",
    "Downloading": "正在下载",
    "Downloaded": "已下载",
    "Uploading": "正在上传",
    "Installing": "正在安装",
    "Installed": "已安装",
    "Packaging": "正在打包",
    "Staging": "正在暂存",
    "Waking": "正在唤醒",
    "Woke": "已唤醒",
    "Removing": "正在移除",
    "Removing…": "正在移除…",
    "Changing": "正在更改",
    "Starting": "正在启动",
    "Checking": "正在检查",
    "Looking": "正在查找",
    "Reconnecting": "正在重新连接",
    "Pairing": "正在配对",
    "Loading": "正在加载",
    "Mirroring": "正在镜像",
    "Restarting": "正在重启",
    "Connecting": "正在连接",
    "Disconnecting": "正在断开",
    "Saving": "正在保存",
    "Updating": "正在更新",
    "Updating…": "正在更新…",
    "Closing": "正在关闭",
    "Opening…": "正在打开…",
    "Installing…": "正在安装…",
    "Connecting…": "正在连接…",
    "Reconnecting…": "正在重新连接…",
    "Checking…": "正在检查…",
    "Loading…": "正在加载…",
    "Pairing…": "正在配对…",
    "Starting…": "正在启动…",
    "Restarting…": "正在重启…",
    "Waking…": "正在唤醒…",
    "Staging…": "正在暂存…",
    "Looking…": "正在查找…",
    "Changing…": "正在更改…",
    "Disconnect": "断开",
    "Connect": "连接",
    "Download": "下载",
    "Install": "安装",
    "Forget": "忘记",
    "Show": "显示",
    "Open": "打开",
    "Share": "共享",
    "Receive": "接收",
    "Send": "发送",
    "Copy": "复制",
    "Paste": "粘贴",
    "Join": "加入",
    "Take Over": "接管",
    "Pair": "配对",
    "Send to": "发送到",
    "Ring": "响铃",
    "Call": "通话",
  };
  const ESC = /[.*+?^${}()|[\]\\]/g;
  const verbRe = Object.keys(VERBS).sort((a, b) => b.length - a.length)
    .map((k) => [new RegExp('^' + k.replace(ESC, '\\$&') + '(?: (.+))?$'), VERBS[k]]);

  function pattern(s) {
    for (const [re, f] of PATTERNS) {
      const m = re.exec(s);
      if (m) return f.replace(/\{(\d)\}/g, (_, i) => m[Number(i) + 1] || '');
    }
    for (const [re, zhv] of verbRe) {
      const m = re.exec(s);
      if (!m) continue;
      if (!m[1]) return zhv;
      const m2 = PATTERNS.map(([re, f]) => { const mm = re.exec(m[1]); return mm ? f.replace(/\{(\d)\}/g, (_, k) => mm[Number(k) + 1] || '') : null; }).find(Boolean);
      const rest = dict(m[1]) || m2 || m[1];   // 后半段（如“3 files”）也翻一下
      return zhv + ' ' + rest;
    }
    return null;
  }

  // ---- 核心：翻译一个字符串（保留首尾空白）----
  function t(s) {
    if (typeof s !== 'string' || !s) return s;
    if (state.lang !== 'zh-CN') return s;
    if (CJK.test(s)) return s;               // 已是中文
    if (!LATIN.test(s)) return s;            // 纯数字 / 符号
    if (/^[\s]*(\/|~\/|[A-Za-z]:\\|https?:\/\/|file:)/.test(s)) return s; // 路径 / 网址
    const lead = /^\s*/.exec(s)[0], tail = /\s*$/.exec(s)[0];
    const core = s.slice(lead.length, s.length - tail.length);
    if (!core) return s;
    let out = dict(core);
    if (!out) out = pattern(core);
    if (!out) return s;
    return lead + out + tail;
  }

  // ---- DOM：文本节点、属性 ----
  const SKIP_TAGS = { SCRIPT: 1, STYLE: 1, CODE: 1, PRE: 1, KBD: 1, SAMP: 1, TEXTAREA: 1, NOSCRIPT: 1 };
  const ATTRS = ['title', 'placeholder', 'aria-label', 'alt'];

  function inSkipped(el) {
    for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
      if (SKIP_TAGS[n.tagName]) return true;
      const ce = n.getAttribute && n.getAttribute('contenteditable');
      if (ce === '' || ce === 'true') return true;
    }
    return false;
  }

  function textNode(node) {
    const s = node.nodeValue;
    if (!s || s.length > 4000 || !LATIN.test(s) || CJK.test(s)) return;
    const out = t(s);
    if (out !== s) node.nodeValue = out;
  }

  function attrs(el) {
    if (!el.getAttribute) return;
    // <input type=button|submit|reset value="Save"> 的显示文字
    const tag = el.tagName;
    if ((tag === 'INPUT' && /^(button|submit|reset)$/i.test(el.type || '')) && el.value && LATIN.test(el.value) && !CJK.test(el.value)) {
      const v = t(el.value);
      if (v !== el.value) el.value = v;
    }
    for (const a of ATTRS) {
      if (!el.hasAttribute(a)) continue;
      const v = el.getAttribute(a);
      if (!v || !LATIN.test(v) || CJK.test(v)) continue;
      const out = t(v);
      if (out !== v) el.setAttribute(a, out);
    }
  }

  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { if (!inSkipped(root.parentNode || root)) textNode(root); return; }
    if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    if (root.nodeType === 1) { if (inSkipped(root)) return; attrs(root); }
    const it = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null);
    let n;
    while ((n = it.nextNode())) {
      if (n.nodeType === 3) { if (!inSkipped(n.parentNode)) textNode(n); }
      else { if (inSkipped(n)) { it.currentNode = n; continue; } attrs(n); }
    }
  }

  function boot() {
    if (state.lang !== 'zh-CN') return;
    try { document.documentElement.lang = 'zh-CN'; } catch (e) {}
    walk(document.body || document.documentElement);

    const mo = new MutationObserver((list) => {
      for (const m of list) {
        if (m.type === 'childList') { for (const n of m.addedNodes) walk(n); }
        else if (m.type === 'characterData') { if (!inSkipped(m.target.parentNode)) textNode(m.target); }
        else if (m.type === 'attributes' && m.target.nodeType === 1) { if (!inSkipped(m.target)) attrs(m.target); }
      }
    });
    mo.observe(document.documentElement, {
      childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: ATTRS,
    });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
    else boot();
  }

  function setLang(l) { state.lang = /^zh/i.test(l || '') ? 'zh-CN' : 'en'; return state.lang; }
  const api = { t, translate: walk, setLang, get lang() { return state.lang; }, get dict() { return ZH; } };
  if (typeof window !== 'undefined') window.tdI18n = api;
  if (isNode) module.exports = api;
  globalThis.tdI18n = api;
})();

