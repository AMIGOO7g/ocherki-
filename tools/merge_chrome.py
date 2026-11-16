#!/usr/bin/env python3
"""v176 — «Верх» и «Общее» in clean files.

CSS: the stylesheets of both folders were interleaved in shell.html (a key's rule here, a shared patch there), so they go
into ONE file, app/common/chrome.css, in the very order they stood — their mutual cascade stays exactly as it was.
The base stylesheet (001-base.css) stays first and alone.
JS: the keys' scripts → app/topbar/topbar.js (where the last of them stood); the shared scripts → common-early.js (where the
wheel gesture stood: the manuscript reads it as it starts) and common-late.js (where the last of them stood).
The shell's core scripts (021 calm DOM, 025 shell core, 042 boot and map) stay in their own places.

    python3 tools/merge_chrome.py
"""
import re, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import merge_manuscript as M   # its CSS reading and de-duplication

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHELL = os.path.join(ROOT, 'shell.html')
KEEP = {'app/common/001-base.css', 'app/common/021-calm-dom-v142.js', 'app/common/025-shell-core.js', 'app/common/042-boot-and-map.js'}


def main():
    shell = open(SHELL, encoding='utf-8').read()
    tags = re.findall(r'(?:href|src)="(app/(?:topbar|common)/[^"?]+)', shell)
    css = [f for f in tags if f.endswith('.css') and f not in KEEP]
    js = [f for f in tags if f.endswith('.js') and f not in KEEP]
    stmts = []
    for f in css:
        stmts += M.statements(M.strip_comments(open(os.path.join(ROOT, f), encoding='utf-8').read()))
    rules = []
    for st in stmts:
        rules.append(['rule', ','.join(x.strip() for x in st[1].split(',')), M.decls(st[2])] if st[0] == 'rule' else ['at', st[1]])
    last = {}
    for ri, r in enumerate(rules):
        if r[0] != 'rule':
            continue
        for di, (p, v, imp) in enumerate(r[2]):
            key = (r[1], p)
            if key in last:
                pri, pdi, pimp = last[key]
                if imp or not pimp:
                    rules[pri][2][pdi] = None
                else:
                    r[2][di] = None
                    continue
            last[key] = (ri, di, imp)
    out = ['/* «Верх» и «Общее» — their styles in one place, in the order they always stood (v176). Written by tools/merge_chrome.py, then kept by hand. */']
    for r in rules:
        if r[0] == 'at':
            out.append(r[1]); continue
        ds = [d for d in r[2] if d]
        if ds:
            out.append(r[1] + '{' + ';'.join(f'{p}:{v}' for p, v, _ in ds) + '}')
    open(os.path.join(ROOT, 'app/common/chrome.css'), 'w', encoding='utf-8').write('\n'.join(out) + '\n')
    groups = {'app/topbar/topbar.js': [f for f in js if f.startswith('app/topbar/')],
              'app/common/common-early.js': [f for f in js if f.startswith('app/common/') and f.split('/')[-1] < '129'],
              'app/common/common-late.js': [f for f in js if f.startswith('app/common/') and f.split('/')[-1] > '129']}
    for name, group in groups.items():
        text = [f'// {name.split("/")[1]} — scripts in one place (v176), each in its own scope as before.']
        for f in group:
            t = re.sub(r'^/\*@block .*?\*/', '', open(os.path.join(ROOT, f), encoding='utf-8').read())
            text.append(f'\n// ——— {f.split("/")[-1][:-3]}\n' + t.strip() + '\n')
        open(os.path.join(ROOT, name), 'w', encoding='utf-8').write('\n'.join(text))
    ver = re.search(r'\?v=(\d{8}-v\d+)', shell).group(1)
    for f in css:
        shell = re.sub(r'<link rel="stylesheet" href="' + re.escape(f) + r'[^>]*>\n?', '', shell)
    for name, group in groups.items():
        for f in group:
            pat = r'<script src="' + re.escape(f) + r'[^>]*></script>\n?'
            shell = re.sub(pat, f'<script src="{name}?v={ver}"></script>\n' if f == group[-1] else '', shell)
    anchor = re.search(r'<link rel="stylesheet" href="app/(?:write|book|manuscript|shelf)/[a-z]+\.css', shell)
    shell = shell[:anchor.start()] + f'<link rel="stylesheet" href="app/common/chrome.css?v={ver}">\n' + shell[anchor.start():]
    open(SHELL, 'w', encoding='utf-8').write(shell)
    for f in css + js:
        os.remove(os.path.join(ROOT, f))
    print('css', len(css), 'js', len(js), 'rules', len(out) - 1)


if __name__ == '__main__':
    main()
