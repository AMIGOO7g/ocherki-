/* v271 — footnotes on the sheet: «пояснение к слову».
 *
 * A footnote is kept on its sheet as {id, word, occ, text}: the explained word,
 * which of its occurrences on the sheet it is (0 — the first) and the
 * explanation. The book puts a small number after the word and gathers the
 * explanations in «Примечания» at the end, by chapter.
 *
 * On the sheet the word is dotted and carries its number (drawn by CSS: the
 * text itself is never changed). A tag «1» is pulled from the left plate onto a
 * word (or the tag is pressed and then the word); a paper slip opens between the
 * paragraphs, pinned with the tag and tied to the word with a thread. Over a
 * dotted word a dark tip shows the explanation with «изменить · убрать».
 * Uses the sheet's own globals: editor, sections, currentPage, currentSection,
 * textFromEditor, syncSemanticHtml, editorShowsSample, persistSoon. */
(function () {
  'use strict';
  const LETTER = /[\p{L}\p{N}]/u, WORDCH = /[\p{L}\p{N}́-]/u;
  const D = document;
  const emit = () => { try { persistSoon(); } catch (_) {} try { window.__OCHERKI_EMIT_STRUCTURE?.(); } catch (_) {} };

  // where the explained word ends in a sheet's text (the same rule as the book engine)
  function findEnd(text, word, occ) {
    word = String(word || '').trim(); if (!word) return -1;
    const source = String(text || ''), wanted = Math.max(0, Number(occ) || 0);
    for (let from = 0, seen = 0; ;) {
      const at = source.indexOf(word, from); if (at < 0) return -1;
      const end = at + word.length;
      if (!LETTER.test(source.charAt(at - 1) || ' ') && !LETTER.test(source.charAt(end) || ' ')) { if (seen === wanted) return end; seen++; }
      from = at + 1;
    }
  }
  const canHere = () => {
    try {
      const s = currentSection(), p = currentPage();
      return !!s && !!p && s.type === 'chapter' && p.type !== 'document' && p.bookRole !== 'document' && !p.sample && !editorShowsSample();
    } catch (_) { return false; }
  };
  // the book's numbers, in reading order (a note still being written counts too)
  function numbers(pendingId) {
    const out = new Map(); let n = 0;
    (sections || []).forEach(section => {
      if (section.type !== 'chapter' || section.included === false) return;
      (section.pages || []).forEach(page => {
        if (page.included === false) return;
        (page.footnotes || []).map(f => ({ f, at: findEnd(page.text, f.word, f.occ) }))
          .filter(x => x.at >= 0 && (String(x.f.text || '').trim() || x.f.id === pendingId))
          .sort((a, b) => a.at - b.at).forEach(x => out.set(x.f.id, ++n));
      });
    });
    return out;
  }
  const syncText = () => {
    const p = currentPage();
    if (p && (!editor.dataset.pageUid || editor.dataset.pageUid === String(p.uid || p.id || ''))) { p.text = textFromEditor(); syncSemanticHtml(p); }
  };

  // ——— the words on the sheet
  const textNodes = () => {
    const walker = D.createTreeWalker(editor, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement?.closest('.semantic-inline,[data-sample]') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
    const list = []; while (walker.nextNode()) list.push(walker.currentNode); return list;
  };
  const wholeAt = (value, at, len) => !LETTER.test(value.charAt(at - 1) || ' ') && !LETTER.test(value.charAt(at + len) || ' ');
  // the occ-th whole occurrence of the word in the sheet
  function locate(word, occ) {
    let seen = 0;
    for (const node of textNodes()) {
      const value = node.nodeValue;
      for (let from = 0; ;) {
        const at = value.indexOf(word, from); if (at < 0) break;
        if (wholeAt(value, at, word.length)) { if (seen === occ) return { node, start: at, end: at + word.length }; seen++; }
        from = at + 1;
      }
    }
    return null;
  }
  // which occurrence of the word stands at this place
  function occurrenceAt(word, node, start) {
    let seen = 0;
    for (const n of textNodes()) {
      const value = n.nodeValue;
      for (let from = 0; ;) {
        const at = value.indexOf(word, from); if (at < 0) break;
        if (n === node && at >= start) return seen;
        if (wholeAt(value, at, word.length)) seen++;
        from = at + 1;
      }
      if (n === node) return seen;
    }
    return seen;
  }
  // the word under a point of the sheet's window
  function wordAt(x, y) {
    let node = null, offset = 0;
    if (D.caretRangeFromPoint) { const r = D.caretRangeFromPoint(x, y); if (r) { node = r.startContainer; offset = r.startOffset; } }
    else if (D.caretPositionFromPoint) { const p = D.caretPositionFromPoint(x, y); if (p) { node = p.offsetNode; offset = p.offset; } }
    if (!node || node.nodeType !== 3 || !editor.contains(node) || node.parentElement?.closest('.semantic-inline,[data-sample]')) return null;
    const value = node.nodeValue; let a = offset, b = offset;
    while (a > 0 && WORDCH.test(value.charAt(a - 1))) a--;
    while (b < value.length && WORDCH.test(value.charAt(b))) b++;
    while (a < b && value.charAt(a) === '-') a++; while (b > a && value.charAt(b - 1) === '-') b--;
    const word = value.slice(a, b); if (!word || !LETTER.test(word)) return null;
    const range = D.createRange(); range.setStart(node, a); range.setEnd(node, b);
    const rect = range.getBoundingClientRect();
    // the point must be over the word itself, not beside it at the end of a line
    if (x < rect.left - 4 || x > rect.right + 4 || y < rect.top - 4 || y > rect.bottom + 4) return null;
    return { node, start: a, end: b, word, rect };
  }

  // ——— the dotted words
  function unwrap() {
    editor.querySelectorAll('.fn-mark').forEach(mark => { const parent = mark.parentNode; while (mark.firstChild) parent.insertBefore(mark.firstChild, mark); parent.removeChild(mark); parent.normalize(); });
  }
  function decorate() {
    if (!editor) return;
    unwrap();
    const p = currentPage(), list = p?.footnotes || [];
    if (!list.length || !canHere()) return;
    const nums = numbers(card.note?.id);
    for (const f of list) {
      const hit = locate(f.word, f.occ); if (!hit) continue;
      const range = D.createRange(); range.setStart(hit.node, hit.start); range.setEnd(hit.node, hit.end);
      const mark = D.createElement('span'); mark.className = 'fn-mark'; mark.dataset.fn = f.id; mark.dataset.n = String(nums.get(f.id) || '');
      try { range.surroundContents(mark); } catch (_) {}
    }
  }
  const markOf = id => editor.querySelector(`.fn-mark[data-fn="${CSS.escape(id)}"]`);
  // marks come back once the hand leaves the text; while typing they are left alone
  editor?.addEventListener('focusout', () => setTimeout(() => { if (D.activeElement !== editor) decorate(); }, 160));

  // ——— the word lit under the hand (a tag carried over it, or the picking mode)
  const lit = D.createElement('div'); lit.className = 'fn-lit'; D.body.appendChild(lit);
  const light = hit => {
    if (!hit) { lit.classList.remove('on'); return; }
    const r = hit.rect; Object.assign(lit.style, { left: (r.left + scrollX - 4) + 'px', top: (r.top + scrollY - 2) + 'px', width: (r.width + 8) + 'px', height: (r.height + 4) + 'px' });
    lit.classList.add('on');
  };

  // ——— a new footnote on a word
  function pinTo(hit) {
    syncText();
    const p = currentPage(); if (!p) return false;
    const occ = occurrenceAt(hit.word, hit.node, hit.start);
    if (!Array.isArray(p.footnotes)) p.footnotes = [];
    const existing = p.footnotes.find(f => f.word === hit.word && (Number(f.occ) || 0) === occ);
    if (existing) { decorate(); openCard(existing, false); return true; }
    const note = { id: 'fn_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), word: hit.word, occ, text: '' };
    p.footnotes.push(note);
    card.note = note; decorate(); openCard(note, true);
    return true;
  }

  // ——— the paper slip
  const card = { note: null, isNew: false, el: null, thread: null, para: null };
  function build() {
    const el = D.createElement('div'); el.className = 'fn-card'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-label', 'Пояснение к слову');
    el.innerHTML = '<div class="fn-pin"><span></span></div><div class="fn-word"></div><div class="fn-ask">что это значит? — напишите своими словами</div>'
      + '<textarea class="fn-lines" rows="3" spellcheck="true" placeholder="например: так называли…"></textarea>'
      + '<div class="fn-pv"><small>в книге, в «Примечаниях»</small><div></div></div>'
      + '<div class="fn-bt"><button type="button" class="fn-x">убрать пояснение</button><button type="button" class="fn-ok">приколоть</button></div>';
    D.body.appendChild(el);
    const thread = D.createElementNS('http://www.w3.org/2000/svg', 'svg'); thread.setAttribute('class', 'fn-thread'); D.body.appendChild(thread);
    const ta = el.querySelector('textarea');
    ta.addEventListener('input', () => { preview(); grow(); });
    ta.addEventListener('keydown', e => {
      e.stopPropagation();
      if (e.key === 'Escape') { e.preventDefault(); closeCard(true); }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); closeCard(true); }
    });
    el.querySelector('.fn-ok').addEventListener('click', () => closeCard(true));
    el.querySelector('.fn-x').addEventListener('click', () => removeNote(card.note));
    el.addEventListener('pointerdown', e => e.stopPropagation());
    D.addEventListener('pointerdown', e => { if (card.el?.classList.contains('open') && !e.target.closest('.fn-card,.fn-tip')) closeCard(true); }, true);
    card.el = el; card.thread = thread; card.ta = ta;
  }
  const upper = v => v.charAt(0).toLocaleUpperCase('ru') + v.slice(1);
  function preview() {
    const n = card.el.querySelector('.fn-pin span').textContent, t = card.ta.value.trim();
    card.el.querySelector('.fn-pv div').innerHTML = `<sup>${n}</sup> <i>${esc(upper(card.note.word))}</i> — ${t ? esc(t) : '<span class="fn-empty">ваше пояснение</span>'}`;
  }
  const grow = () => { card.ta.style.height = 'auto'; card.ta.style.height = Math.max(102, card.ta.scrollHeight) + 'px'; place(); };
  // the slip opens under the paragraph of its word; the paragraphs below make room for it
  function place() {
    const mark = markOf(card.note.id); if (!mark || !card.el) return;
    const para = mark.closest('p') || mark.parentElement, paper = editor.getBoundingClientRect();
    if (card.para !== para) { if (card.para) card.para.style.marginBottom = ''; card.para = para; }
    const h = card.el.offsetHeight;
    para.style.marginBottom = (h + 46) + 'px';
    const pr = para.getBoundingClientRect(), mr = mark.getBoundingClientRect();
    const width = card.el.offsetWidth, left = Math.max(paper.left - 10, Math.min(paper.right - width + 10, mr.left + mr.width / 2 - 70));
    const top = pr.bottom + 28; // getBoundingClientRect leaves the margin out: the slip lies in the room it makes
    Object.assign(card.el.style, { left: (left + scrollX) + 'px', top: (top + scrollY) + 'px' });
    // the thread: from under the word down to the tag
    const x1 = mr.left + mr.width / 2 + scrollX, y1 = mr.bottom + 3 + scrollY, x2 = left + 48 + scrollX, y2 = top - 8 + scrollY;
    const minX = Math.min(x1, x2) - 20, minY = Math.min(y1, y2) - 10, W = Math.abs(x2 - x1) + 40, H = Math.abs(y2 - y1) + 20;
    Object.assign(card.thread.style, { left: minX + 'px', top: minY + 'px', width: W + 'px', height: H + 'px' });
    card.thread.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const a = [x1 - minX, y1 - minY], b = [x2 - minX, y2 - minY];
    card.thread.innerHTML = `<path d="M${a[0]} ${a[1]} C ${a[0] + 4} ${a[1] + 22}, ${b[0] + 14} ${b[1] - 22}, ${b[0]} ${b[1]}"/><circle cx="${a[0]}" cy="${a[1]}" r="2.6"/>`;
  }
  function openCard(note, isNew) {
    if (!card.el) build();
    if (card.el.classList.contains('open') && card.note && card.note !== note) closeCard(true, true);
    card.note = note; card.isNew = isNew; hideTip();
    window.OcherkiFootnotes.holding = true;
    decorate();
    const mark = markOf(note.id); if (!mark) return;
    mark.classList.add('fn-active');
    card.el.querySelector('.fn-pin span').textContent = mark.dataset.n || '';
    card.el.querySelector('.fn-word').textContent = note.word;
    card.ta.value = note.text || ''; preview();
    card.el.classList.remove('closing', 'pinned'); card.el.style.transition = 'none';
    card.el.classList.add('open'); grow();
    // it unfolds from the tag: the paragraphs part, the slip comes down, the thread is drawn
    requestAnimationFrame(() => { card.el.style.transition = ''; card.el.classList.add('shown'); card.thread.classList.add('shown'); setTimeout(() => card.ta.focus({ preventScroll: true }), 260); });
  }
  function closeCard(save, quick) {
    if (!card.el?.classList.contains('open')) return;
    const note = card.note, text = card.ta.value.trim();
    if (save) { if (text) note.text = text; else if (card.isNew || !note.text) { removeNote(note, true); return; } }
    const mark = markOf(note.id);
    card.el.classList.add(text ? 'pinned' : 'closing'); card.el.classList.remove('shown'); card.thread.classList.remove('shown');
    if (card.para) card.para.style.marginBottom = '';
    const done = () => {
      card.el.classList.remove('open', 'pinned', 'closing'); card.para = null; card.note = null;
      window.OcherkiFootnotes.holding = false;
      decorate();
      const fresh = markOf(note.id); if (fresh && text) { fresh.classList.add('fn-pop'); setTimeout(() => fresh.classList.remove('fn-pop'), 900); }
    };
    mark?.classList.remove('fn-active');
    if (quick) done(); else setTimeout(done, 380);
    emit();
  }
  function removeNote(note, fromClose) {
    const p = currentPage(); if (!p || !note) return;
    p.footnotes = (p.footnotes || []).filter(f => f.id !== note.id);
    if (card.note === note && card.el?.classList.contains('open')) {
      card.el.classList.add('closing'); card.el.classList.remove('shown'); card.thread.classList.remove('shown');
      if (card.para) card.para.style.marginBottom = '';
      setTimeout(() => { card.el.classList.remove('open', 'closing'); card.para = null; card.note = null; window.OcherkiFootnotes.holding = false; decorate(); }, fromClose ? 300 : 380);
    } else decorate();
    hideTip(); emit();
  }

  // ——— the dark tip over a dotted word
  const tip = D.createElement('div'); tip.className = 'fn-tip'; tip.innerHTML = '<div class="fn-tip-t"></div><div class="fn-tip-a"><button type="button" data-a="edit">изменить</button><button type="button" data-a="drop">убрать</button></div><i class="fn-tail"></i>';
  D.body.appendChild(tip);
  let tipFor = null, tipTimer = 0;
  function showTip(mark) {
    const p = currentPage(), note = (p?.footnotes || []).find(f => f.id === mark.dataset.fn); if (!note || card.el?.classList.contains('open')) return;
    clearTimeout(tipTimer); tipFor = note;
    tip.querySelector('.fn-tip-t').innerHTML = `<b>${esc(mark.dataset.n || '')} ${esc(upper(note.word))}</b> — ${esc(note.text || '')}`;
    editor.querySelectorAll('.fn-mark.fn-hover').forEach(m => m.classList.remove('fn-hover')); mark.classList.add('fn-hover');
    tip.classList.add('on'); tip.style.left = '0px'; tip.style.top = '0px';
    const r = mark.getBoundingClientRect(), w = tip.offsetWidth, h = tip.offsetHeight, cx = r.left + r.width / 2;
    const left = Math.max(8, Math.min(innerWidth - w - 8, cx - Math.min(110, w / 2)));
    // above the word's line; under it when there is no room above
    const below = r.top - h - 16 < 6, top = below ? r.bottom + 14 : r.top - h - 14;
    tip.classList.toggle('below', below);
    Object.assign(tip.style, { left: (left + scrollX) + 'px', top: (top + scrollY) + 'px' });
    tip.querySelector('.fn-tail').style.left = (cx - left - 9) + 'px';
  }
  function hideTip(now) {
    clearTimeout(tipTimer);
    const go = () => { tip.classList.remove('on'); editor?.querySelectorAll('.fn-mark.fn-hover').forEach(m => m.classList.remove('fn-hover')); tipFor = null; };
    if (now === false) tipTimer = setTimeout(go, 260); else go();
  }
  editor?.addEventListener('mouseover', e => { const m = e.target.closest?.('.fn-mark'); if (m && !picking) showTip(m); });
  editor?.addEventListener('mouseout', e => { if (e.target.closest?.('.fn-mark') && !e.relatedTarget?.closest?.('.fn-tip')) hideTip(false); });
  tip.addEventListener('mouseenter', () => clearTimeout(tipTimer));
  tip.addEventListener('mouseleave', () => hideTip(false));
  tip.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || !tipFor) return; const note = tipFor; hideTip();
    if (b.dataset.a === 'edit') openCard(note, false); else removeNote(note);
  });

  // ——— picking a word with a click (the tag was pressed, not pulled)
  let picking = null;
  function pick(on, done) {
    if (!on) { if (picking) { D.body.classList.remove('fn-picking'); light(null); const cb = picking.done; picking = null; cb?.(false); } return false; }
    if (!canHere()) return false;
    picking = { done }; D.body.classList.add('fn-picking'); hideTip(); return true;
  }
  D.addEventListener('mousemove', e => { if (picking) light(wordAt(e.clientX, e.clientY)); });
  D.addEventListener('click', e => {
    if (!picking) return; const hit = wordAt(e.clientX, e.clientY); e.preventDefault(); e.stopPropagation();
    const cb = picking.done; picking = null; D.body.classList.remove('fn-picking'); light(null);
    const ok = !!hit && pinTo(hit); cb?.(ok);
  }, true);
  D.addEventListener('keydown', e => { if (e.key === 'Escape' && picking) { e.preventDefault(); pick(false); } });

  window.OcherkiFootnotes = { holding: false, decorate, findEnd, numbers, close: () => closeCard(true, true) };
  Object.assign(window.OC_SHEET || (window.OC_SHEET = {}), {
    // a tag carried over the sheet (coordinates of the sheet's window): the word under it lights up
    fnCan: canHere,
    fnHover(x, y) { if (!canHere()) { light(null); return null; } const hit = wordAt(x, y); light(hit); return hit ? { left: hit.rect.left, top: hit.rect.top, width: hit.rect.width, height: hit.rect.height } : null; },
    fnDrop(x, y) { light(null); if (!canHere()) return false; const hit = wordAt(x, y); return !!hit && pinTo(hit); },
    fnPick: pick,
    fnNext() { const p = currentPage(); const n = numbers(); let before = 0; (sections || []).some(s => { if (s.type !== 'chapter') return false; return (s.pages || []).some(pg => { if (pg === p) return true; before += (pg.footnotes || []).filter(f => n.has(f.id)).length; return false; }); }); return before + (p?.footnotes || []).filter(f => n.has(f.id)).length + 1; }
  });
  decorate();
})();
