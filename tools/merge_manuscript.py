#!/usr/bin/env python3
"""v171 — «Рукопись» in two clean files: app/manuscript/manuscript.css and app/manuscript/manuscript.js.

CSS: every manuscript stylesheet (in the order shell.html loaded them) and the manuscript rules that lay in other
blocks go into one file, loaded last. Then a declaration that a later rule with the very same selector overrides
is dropped, rules of things the screen no longer has are dropped, and empty rules go.
JS: the manuscript scripts go into one file, in their order, loaded where the screen's own script stood.

    python3 tools/merge_manuscript.py
"""
import re, os, json

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHELL = os.path.join(ROOT, 'shell.html')
MS = 'app/manuscript/'
CSS_FILES = ['087-ms-ghost-v102.css', '092-ms-verge-v161.css', '095-ms-done-v162.css', '135-manuscript-screen-style.css',
             '137-ms-sections-v88.css', '139-ms-same-backdrop.css', '145-v99-small.css', '148-manuscript-photos-style.css',
             '152-manuscript-v84.css', '158-ms-v85.css', '163-ms-photo-card-v86.css', '176-manuscript-v124.css', '206-ms-v142.css',
             '960-ms-quiet.css']
JS_FILES = ['096-ms-done-v162-js.js', '136-manuscript-screen-script.js', '149-manuscript-photos-script.js', '961-ms-quiet.js']
# other blocks: their pure manuscript rules move over (in shell order, so each lands where it stood among the others)
FOREIGN = ['app/write/086-contrast-v102.css', 'app/archive/074-archive-v105.css', 'app/write/133-switch-v87.css',
           'app/common/159-ms-no-native-drag.css', 'app/write/162-v86-misc.css', 'app/write/179-v125.css', 'app/archive/203-hub-v142.css']
# what the quiet screen no longer has
DEAD = re.compile(r'(?<!:not\()\.ms-(hint|tray-note|tray-clear|aside|done-key|label|sections-open)\b')
# their elements stay (the scripts read them), unseen: one rule says so instead of all the old dressing
HIDE = '.ms-hint,.ms-tray-note,.ms-tray-clear,.ms-aside,.ms-done-key,.ms-label,.ms-sections-open{display:none!important}'


def strip_comments(s):
    return re.sub(r'/\*.*?\*/', '', s, flags=re.S)


def statements(css):
    """top-level statements: ('rule', selector, body) or ('at', text)"""
    out, i, n = [], 0, len(css)
    while i < n:
        while i < n and css[i] in ' \t\r\n':
            i += 1
        if i >= n:
            break
        j, depth, q = i, 0, None
        while j < n:
            c = css[j]
            if q:
                if c == '\\':
                    j += 1
                elif c == q:
                    q = None
            elif c in '"\'':
                q = c
            elif c == '{':
                depth += 1
            elif c == '}':
                depth -= 1
                if depth == 0:
                    break
            elif c == ';' and depth == 0:
                break
            j += 1
        text = css[i:j + 1].strip()
        i = j + 1
        if not text or text == ';':
            continue
        if text.startswith('@'):
            out.append(('at', text))
        else:
            k = text.index('{')
            out.append(('rule', ' '.join(text[:k].split()), text[k + 1:-1]))
    return out


def decls(body):
    out, cur, depth, q = [], '', 0, None
    for c in body:
        if q:
            cur += c
            if c == q:
                q = None
            continue
        if c in '"\'':
            q = c
        elif c == '(':
            depth += 1
        elif c == ')':
            depth -= 1
        if c == ';' and depth == 0:
            out.append(cur)
            cur = ''
        else:
            cur += c
    out.append(cur)
    res = []
    for d in out:
        d = d.strip()
        if ':' not in d:
            continue
        p, v = d.split(':', 1)
        v = v.strip()
        imp = bool(re.search(r'!\s*important\s*$', v))
        res.append([p.strip().lower(), v, imp])
    return res


def is_ms(sel):
    parts = [p.strip() for p in sel.split(',')]
    return all('ms-' in p for p in parts)


def main():
    shell = open(SHELL, encoding='utf-8').read()
    # gather CSS in shell order: manuscript files and the manuscript rules of the foreign blocks
    order = []
    for m in re.finditer(r'href="(app/[^"?]+\.css)', shell):
        f = m.group(1)
        if f.startswith(MS) and f[len(MS):] in CSS_FILES:
            order.append(('ms', f))
        elif f in FOREIGN:
            order.append(('fx', f))
    stmts = []
    for kind, f in order:
        text = open(os.path.join(ROOT, f), encoding='utf-8').read()
        if kind == 'ms':
            stmts += statements(strip_comments(text))
            continue
        # a foreign block keeps its own rules and its /*@block*/ headers; only pure manuscript rules leave it
        kept, moved = [], []
        for part in re.split(r'(/\*@block .*?\*/)', text):
            if part.startswith('/*@block'):
                kept.append(part)
                continue
            body = []
            for st in statements(strip_comments(part)):
                if st[0] == 'rule' and is_ms(st[1]):
                    moved.append(st)
                else:
                    body.append(st[1] + '{' + st[2] + '}' if st[0] == 'rule' else st[1])
            kept.append('\n'.join(body) + ('\n' if body else ''))
        stmts += moved
        open(os.path.join(ROOT, f), 'w', encoding='utf-8').write(''.join(kept))
    # drop what is gone, then what a later rule with the same selector overrides
    rules = []
    for st in stmts:
        if st[0] == 'rule':
            sels = [s for s in (x.strip() for x in st[1].split(',')) if not DEAD.search(s)]
            if not sels:
                continue
            rules.append(['rule', ', '.join(sels), decls(st[2])])
        else:
            rules.append(['at', st[1]])
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
    out = ['/* «Рукопись» — all its styles in one place (v171). Written from the old blocks by tools/merge_manuscript.py, then kept by hand. */', HIDE]
    for r in rules:
        if r[0] == 'at':
            out.append(r[1])
            continue
        ds = [d for d in r[2] if d]
        if ds:
            out.append(r[1] + '{' + ';'.join(f'{p}:{v}' for p, v, _ in ds) + '}')
    open(os.path.join(ROOT, MS + 'manuscript.css'), 'w', encoding='utf-8').write('\n'.join(out) + '\n')
    # JS: one file, the scripts in their order
    js = ['// «Рукопись» — all its scripts in one place (v171), each in its own scope as before.']
    for f in JS_FILES:
        t = open(os.path.join(ROOT, MS + f), encoding='utf-8').read()
        t = re.sub(r'^/\*@block .*?\*/', '', t)
        js.append(f'\n// ——— {f[4:-3] if f[3] == "-" else f[:-3]}\n' + t.strip() + '\n')
    open(os.path.join(ROOT, MS + 'manuscript.js'), 'w', encoding='utf-8').write('\n'.join(js))
    # shell: the old tags go, the new ones stand where the screen's script stood (CSS at the very end)
    for f in CSS_FILES:
        shell = re.sub(r'<link rel="stylesheet" href="' + re.escape(MS + f) + r'[^>]*>\n?', '', shell)
    first = True
    for f in JS_FILES:
        pat = r'<script src="' + re.escape(MS + f) + r'[^>]*></script>\n?'
        if f == '136-manuscript-screen-script.js':
            shell = re.sub(pat, '<script src="app/manuscript/manuscript.js?v=VER"></script>\n', shell)
        else:
            shell = re.sub(pat, '', shell)
    shell = shell.rstrip('\n') + '\n<link rel="stylesheet" href="app/manuscript/manuscript.css?v=VER">\n'
    ver = re.search(r'\?v=(\d{8}-v\d+)', shell).group(1)
    shell = shell.replace('?v=VER', '?v=' + ver)
    open(SHELL, 'w', encoding='utf-8').write(shell)
    for f in CSS_FILES + JS_FILES:
        os.remove(os.path.join(ROOT, MS + f))
    print('rules', sum(1 for r in rules if r[0] == 'rule' and any(r[2])), 'css KB', os.path.getsize(os.path.join(ROOT, MS + 'manuscript.css')) // 1024,
          'js KB', os.path.getsize(os.path.join(ROOT, MS + 'manuscript.js')) // 1024)


if __name__ == '__main__':
    main()
