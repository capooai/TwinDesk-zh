#!/usr/bin/env python3
"""Build shared/i18n.js: dictionary (EN -> zh-CN) + the UI engine.

Sources: tools/zh/*.json (each a flat {english: chinese} object, generated from the
translation chunks). Run from the repo root: python3 tools/build-i18n.py
"""
import glob
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'shared', 'i18n.js')
ENGINE = os.path.join(ROOT, 'tools', 'i18n-engine.js')

HEADER = """// TwinDesk — 简体中文界面 / Simplified Chinese UI. GPL-3.0, see LICENSE.
// 生成文件：不要手改；改 tools/zh/*.json 后运行 python3 tools/build-i18n.py
// Generated file: edit tools/zh/*.json and run python3 tools/build-i18n.py instead.
"""


def main():
    zh = {}
    for p in sorted(glob.glob(os.path.join(ROOT, 'tools', 'zh', '*.json'))):
        with open(p, encoding='utf-8') as f:
            part = json.load(f)
        for k, v in part.items():
            if not isinstance(k, str) or not isinstance(v, str):
                continue
            if not k.strip() or not v.strip():
                continue
            if k == v:
                continue  # untranslated / code string: leave it out
            zh[k] = v
    # Longest first so the engine's exact lookup is unambiguous when keys overlap.
    items = sorted(zh.items(), key=lambda kv: (-len(kv[0]), kv[0]))
    body = ',\n'.join('%s: %s' % (json.dumps(k, ensure_ascii=False), json.dumps(v, ensure_ascii=False)) for k, v in items)
    with open(ENGINE, encoding='utf-8') as f:
        engine = f.read()
    text = HEADER + 'const TD_ZH = {\n' + body + '\n};\n' + engine
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(text)
    print('shared/i18n.js: %d entries, %d bytes' % (len(items), len(text)))


if __name__ == '__main__':
    main()
