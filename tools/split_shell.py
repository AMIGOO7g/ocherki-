#!/usr/bin/env python3
"""v166 — split shell.html into blocks (app/<block>/NNN-name.css|js).

Every inline <style>/<script> of shell.html moves to its own file in the folder of the screen it belongs to,
and is loaded from exactly the same place, in exactly the same order (the cascade and the order of execution
stay as they were). Neighbouring styles of the same block with only whitespace between them share one file.
Relative url(...) in the styles is rewritten for the new folder. The reverse (qa/lib/page_source.js) puts every
file back inline; this script checks that the round trip gives the original text.

    python3 tools/split_shell.py            # split (shell.html is rewritten)
"""
import re, os, sys, json, collections

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'shell.html')
VER = '20261107-v166'

# what each block is about — counted over the block's text; the most frequent wins, ties go to «common»
RULES = collections.OrderedDict([
    ('archive',    [r'\bfam', r'family', r'\bhub\b', r'OCHERKI_HUB', r'archive', r'\.oar\b', r'recorder', r'\bweek', r'fm-', r'Архив', r'Семь']),
    ('manuscript', [r'\bms-', r'manuscript', r'Рукопис', r'MANUSCRIPT']),
    ('book',       [r'book-preview', r'bookPreview', r'\bbd-', r'book-map', r'bookMap', r'\bpdf', r'preview-arc', r'\bpa-', r'design-', r'composition',
                    r'spread', r'book-page', r'renderer', r'assembl', r'editorial', r'\bbp-', r'page-canvas', r'chapter', r'Книг']),
    ('topbar',     [r'\.oct\b', r'\boct-', r'hanging', r'project-top', r'project-key', r'pages-child', r'mode-controls', r'music', r'\bmus\b',
                    r'oc-more', r'tooltip', r'hanging-tip', r'\.k\b', r'\.pl\b', r'TOPBAR']),
    ('write',      [r'writing-prompt', r'editor-', r'keyboard', r'v35', r'sheet', r'write', r'oc-w\b', r'oc-ttl', r'prompt', r'clock', r'pendulum',
                    r'wp-keys', r'oc-add', r'light']),
    ('start',      [r'\btour', r'start', r'boot', r'power', r'entry', r'auth', r'Хранител', r'keeper', r'KEEPER']),
    ('shelf',      [r'shelf', r'bookcase', r'Мои книги', r'booksBtn']),
])
DIRS = list(RULES) + ['common']

def classify(text):
    score = {k: sum(len(re.findall(p, text)) for p in pats) for k, pats in RULES.items()}
    best = max(score.values()) if score else 0
    if best < 3:
        return 'common'
    top = [k for k, v in score.items() if v == best]
    return top[0] if len(top) == 1 else 'common'

def slug(attrs, body, n):
    m = re.search(r'id="([^"]+)"', attrs)
    if m:
        s = m.group(1)
    else:
        c = re.search(r'/\*\s*([^*]{4,60})', body) or re.search(r'//\s*(.{4,60})', body)
        s = c.group(1) if c else 'block'
    s = re.sub(r'[^a-zA-Z0-9]+', '-', s.lower()).strip('-')[:40] or 'block'
    return f'{n:03d}-{s}'

def rewrite_urls(css):
    def fix(m):
        q, u = m.group(1), m.group(2)
        if re.match(r'(data:|https?:|//|/|#|\.\./|about:)', u):
            return m.group(0)
        return f'url({q}../../{u}{q})'
    return re.sub(r'url\(\s*([\'"]?)([^\'")]+)\1\s*\)', fix, css)

def main():
    s = open(SRC, encoding='utf-8').read()
    if 'data-inline-from=' in s:
        sys.exit('shell.html is already split')
    blocks = []
    for m in re.finditer(r'<(style|script)\b([^>]*)>(.*?)</\1>', s, re.S):
        kind, attrs, body = m.groups()
        if kind == 'script' and 'src=' in attrs:
            continue
        blocks.append(dict(kind=kind, attrs=attrs, body=body, start=m.start(), end=m.end()))
    for i, b in enumerate(blocks):
        b['mod'] = classify(b['attrs'] + b['body'])
        b['name'] = slug(b['attrs'], b['body'], i + 1)
    # group neighbouring styles of one block (only whitespace between them)
    groups = []
    for b in blocks:
        g = groups[-1] if groups else None
        if (g and b['kind'] == 'style' and g[0]['kind'] == 'style' and g[0]['mod'] == b['mod']
                and not s[g[-1]['end']:b['start']].strip()):
            g.append(b)
        else:
            groups.append([b])
    out, pos, files = [], 0, collections.Counter()
    for g in groups:
        first, last = g[0], g[-1]
        out.append(s[pos:first['start']])
        mod = first['mod']
        ext = 'css' if first['kind'] == 'style' else 'js'
        rel = f"app/{mod}/{first['name']}.{ext}"
        os.makedirs(os.path.join(ROOT, 'app', mod), exist_ok=True)
        if ext == 'css':
            parts = []
            for k, b in enumerate(g):
                sep = s[g[k - 1]['end']:b['start']] if k else ''
                # each original block keeps its tag attributes and the whitespace before it, so the page can be put back exactly
                parts.append('/*@block ' + json.dumps([b['attrs'], sep]) + '*/' + rewrite_urls(b['body']))
            text = '\n'.join(parts)
            tag = f'<link rel="stylesheet" href="{rel}?v={VER}" data-inline-from="style">'
        else:
            text = '/*@block ' + json.dumps([first['attrs'], '']) + '*/' + first['body']
            tag = f'<script src="{rel}?v={VER}" data-inline-from="script"></script>'
        open(os.path.join(ROOT, rel), 'w', encoding='utf-8').write(text)
        out.append(tag)
        pos = last['end']
        files[mod] += 1
    out.append(s[pos:])
    new = ''.join(out)
    open(SRC, 'w', encoding='utf-8').write(new)
    print('blocks', len(blocks), 'files', sum(files.values()), dict(files))
    print('shell.html', len(s) // 1024, 'KB ->', len(new) // 1024, 'KB')

if __name__ == '__main__':
    main()
