#!/usr/bin/env python3
"""v177 — «Архив» (the bridge of the constructor to the archive) and «Старт» (power, entry, tour) in clean files.

CSS: app/start/start.css and app/archive/archive.css, each in the order its rules stood, both placed just before
chrome.css (where they always came before the keys' and the shared rules that follow them).
JS: app/start/start.js (where the last start script stood) and app/archive/archive.js (where the last archive script stood).
The auth gate (022, in the head) stays in its own place.

    python3 tools/merge_rooms.py
"""
import re, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import merge_manuscript as M

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHELL = os.path.join(ROOT, 'shell.html')
KEEP = {'app/start/022-v35-auth-gate-state.js'}


def clean_css(files):
    stmts = []
    for f in files:
        stmts += M.statements(M.strip_comments(open(os.path.join(ROOT, f), encoding='utf-8').read()))
    rules = [['rule', ','.join(x.strip() for x in st[1].split(',')), M.decls(st[2])] if st[0] == 'rule' else ['at', st[1]] for st in stmts]
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
    out = []
    for r in rules:
        if r[0] == 'at':
            out.append(r[1]); continue
        ds = [d for d in r[2] if d]
        if ds:
            out.append(r[1] + '{' + ';'.join(f'{p}:{v}' for p, v, _ in ds) + '}')
    return out


def main():
    shell = open(SHELL, encoding='utf-8').read()
    ver = re.search(r'\?v=(\d{8}-v\d+)', shell).group(1)
    tags = re.findall(r'(?:href|src)="(app/(?:start|archive)/[^"?]+)', shell)
    made = []
    for room, title in (('start', '«Старт»: включение, вход, знакомство'), ('archive', '«Архив»: связка конструктора с архивом')):
        css = [f for f in tags if f.startswith(f'app/{room}/') and f.endswith('.css')]
        js = [f for f in tags if f.startswith(f'app/{room}/') and f.endswith('.js') and f not in KEEP]
        out = [f'/* {title} — styles in one place (v177). Written by tools/merge_rooms.py, then kept by hand. */'] + clean_css(css)
        open(os.path.join(ROOT, f'app/{room}/{room}.css'), 'w', encoding='utf-8').write('\n'.join(out) + '\n')
        text = [f'// {title} — scripts in one place (v177), each in its own scope as before.']
        for f in js:
            t = re.sub(r'^/\*@block .*?\*/', '', open(os.path.join(ROOT, f), encoding='utf-8').read())
            text.append(f'\n// ——— {f.split("/")[-1][:-3]}\n' + t.strip() + '\n')
        open(os.path.join(ROOT, f'app/{room}/{room}.js'), 'w', encoding='utf-8').write('\n'.join(text))
        for f in css:
            shell = re.sub(r'<link rel="stylesheet" href="' + re.escape(f) + r'[^>]*>\n?', '', shell)
        for f in js:
            pat = r'<script src="' + re.escape(f) + r'[^>]*></script>\n?'
            shell = re.sub(pat, f'<script src="app/{room}/{room}.js?v={ver}"></script>\n' if f == js[-1] else '', shell)
        made += css + js
    anchor = shell.index('<link rel="stylesheet" href="app/common/chrome.css')
    shell = shell[:anchor] + f'<link rel="stylesheet" href="app/start/start.css?v={ver}">\n<link rel="stylesheet" href="app/archive/archive.css?v={ver}">\n' + shell[anchor:]
    open(SHELL, 'w', encoding='utf-8').write(shell)
    for f in made:
        os.remove(os.path.join(ROOT, f))
    print('files', len(made))


if __name__ == '__main__':
    main()
