/* «Мои книги»: a tall walnut bookcase that slides in from the right over the
 * constructor. Every book of the account stands on a shelf spine-out in
 * linen cloth with gold lines; hover lifts it and names it, a click opens
 * it. The last spine starts a new book. Warm shelf light and a little dust
 * drifting in it; no motion when the system asks for reduced motion.
 *   OcherkiBookcase.open({books, currentId, onOpen(id), onNew()})
 * books: [{id, title, author, pages, savedAt}] */
(function (root) {
  'use strict';

  const BASE = (() => { const script = document.currentScript?.src || ''; return script ? script.replace(/book-renderer\/bookcase\.js.*$/u, '') : ''; })();
  const asset = name => `${BASE}assets/bookcase/${name}`;
  const esc = value => String(value ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // Cloth and ink per colour: cream takes brown ink, the dark cloths gold.
  const CLOTHS = [
    { name: 'burgundy', ink: '#e2c07f' },
    { name: 'green', ink: '#dcc183' },
    { name: 'cream', ink: '#7a5a34' },
    { name: 'brown', ink: '#d9b778' }
  ];
  // Shelf geometry of cabinet.jpg as fractions of its height (top of the
  // lit compartment, the board the books stand on) and of its width.
  const SHELVES = [[.058, .193], [.234, .368], [.400, .546], [.566, .712], [.748, .887]];
  const INNER = [.118, .905];
  const RATIO = 724 / 2172;

  const STYLE = `
  .bc-veil{position:fixed;inset:0;z-index:12000;background:rgba(24,16,10,.0);transition:background .8s ease;cursor:default}
  .bc-veil.is-open{background:rgba(24,16,10,.42)}
  /* The cabinet keeps its proportions at a width where spines are easy to
     read; it is taller than the screen and scrolls, books fill it from the
     top shelf down. */
  .bc-case{position:fixed;top:0;right:0;bottom:0;z-index:12001;width:min(440px,92vw);background:#1d130c;
    box-shadow:-24px 0 60px rgba(0,0,0,.45),-2px 0 0 rgba(0,0,0,.5);
    transform:translateX(104%);transition:transform .95s cubic-bezier(.18,.78,.24,1);overflow-x:hidden;overflow-y:auto;scrollbar-width:thin;scrollbar-color:#6b4a2c #1d130c}
  .bc-inner{position:relative;width:100%;aspect-ratio:${RATIO};background:url("${asset('cabinet.jpg')}") center top/100% 100% no-repeat}
  .bc-case.is-open{transform:translateX(0)}
  .bc-dust{position:absolute;inset:0;pointer-events:none;z-index:4;mix-blend-mode:screen}
  .bc-title{position:absolute;left:0;right:0;top:1.3%;z-index:5;text-align:center;color:#e9cf9d;font:italic 400 24px/1 'CormorantCy',Georgia,serif;letter-spacing:.04em;text-shadow:0 1px 2px rgba(0,0,0,.6);pointer-events:none}
  .bc-book{position:absolute;bottom:0;z-index:2;border:0;padding:0;cursor:pointer;border-radius:2px 2px 1px 1px;
    background-size:180px 180px;background-repeat:repeat;
    box-shadow:inset 3px 0 4px rgba(255,255,255,.10),inset -4px 0 6px rgba(0,0,0,.38),inset 0 -2px 3px rgba(0,0,0,.25),1px 0 0 rgba(0,0,0,.45),3px 2px 6px rgba(0,0,0,.35);
    transform-origin:50% 100%;transition:transform .38s cubic-bezier(.2,.8,.3,1),filter .38s ease;opacity:0}
  .bc-case.is-open .bc-book{opacity:1;transition:transform .38s cubic-bezier(.2,.8,.3,1),filter .38s ease,opacity .6s ease var(--bc-delay,0s)}
  .bc-book::before,.bc-book::after{content:'';position:absolute;left:12%;right:12%;height:0;border-top:1px solid var(--bc-ink);border-bottom:1px solid var(--bc-ink);padding-top:3px;opacity:.85}
  .bc-book::before{top:7%}.bc-book::after{bottom:7%}
  .bc-book span{position:absolute;left:0;right:0;top:15%;bottom:15%;display:flex;align-items:center;justify-content:center;overflow:hidden;
    writing-mode:vertical-rl;color:var(--bc-ink);font:600 15px/1.05 'CormorantCy',Georgia,serif;letter-spacing:.06em;white-space:nowrap;text-overflow:ellipsis;text-shadow:0 1px 0 rgba(0,0,0,.25)}
  .bc-book:hover,.bc-book:focus-visible{transform:translateY(-6%) scale(1.07);filter:brightness(1.1);z-index:3;outline:none}
  .bc-book.is-current::after{border-color:#f0d49a;opacity:1}
  .bc-ribbon{position:absolute;bottom:-9%;left:56%;width:5px;height:14%;background:linear-gradient(#9d2b26,#7a1d1a);clip-path:polygon(0 0,100% 0,100% 100%,50% 82%,0 100%);box-shadow:0 1px 2px rgba(0,0,0,.4)}
  .bc-book.bc-new{background:rgba(255,236,200,.05);box-shadow:inset 0 0 0 1px rgba(232,198,140,.55);--bc-ink:#e8c68c}
  .bc-book.bc-new::before,.bc-book.bc-new::after{display:none}
  .bc-book.bc-new span{font-size:30px;writing-mode:horizontal-tb;top:auto;bottom:auto;inset:0}
  .bc-tip{position:fixed;z-index:12003;pointer-events:none;max-width:260px;padding:10px 14px 11px;border-radius:10px;background:rgba(32,22,14,.92);
    box-shadow:0 10px 28px rgba(0,0,0,.4),inset 0 0 0 1px rgba(226,190,130,.28);color:#f1e2c8;text-align:center;
    opacity:0;transform:translate(-100%,-50%) translateX(8px);transition:opacity .28s ease,transform .28s ease}
  .bc-tip.show{opacity:1;transform:translate(-100%,-50%)}
  .bc-tip b{display:block;font:400 19px/1.2 'CormorantCy',Georgia,serif;letter-spacing:.01em}
  .bc-tip i{display:block;margin-top:4px;font:italic 400 13px/1.3 Georgia,serif;color:#cfb68e}
  .bc-close{position:absolute;top:.9%;right:4%;z-index:6;width:30px;height:30px;border:0;border-radius:50%;background:rgba(0,0,0,.25);color:#e9cf9d;font:20px/30px Georgia,serif;cursor:pointer}
  .bc-close:hover{background:rgba(0,0,0,.45)}
  @media (prefers-reduced-motion: reduce){.bc-case,.bc-veil,.bc-book{transition:none!important}.bc-dust{display:none}}`;

  const hash = text => { let h = 7; for (const ch of String(text)) h = (h * 31 + ch.codePointAt(0)) >>> 0; return h; };
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const when = at => { if (!at) return ''; const d = new Date(Number(at)); return `${d.getDate()} ${months[d.getMonth()]}${d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : ''}`; };
  const pagesWord = n => n % 10 === 1 && n % 100 !== 11 ? 'страница' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'страницы' : 'страниц';

  let current = null;

  // Dust: a few warm motes drifting slowly in the light under each shelf.
  function dust(canvas) {
    const ctx = canvas.getContext('2d'), motes = [];
    let raf = 0, w = 0, h = 0;
    const size = () => { w = canvas.width = canvas.clientWidth * devicePixelRatio; h = canvas.height = canvas.clientHeight * devicePixelRatio; };
    size();
    for (let i = 0; i < 46; i++) {
      const shelf = SHELVES[i % SHELVES.length];
      motes.push({ x: Math.random(), y: shelf[0] + Math.random() * (shelf[1] - shelf[0]) * .7, r: .5 + Math.random() * 1.3, vx: (Math.random() - .5) * .00006, vy: -.00002 - Math.random() * .00005, a: .15 + Math.random() * .35, p: Math.random() * 6.28, band: shelf });
    }
    const step = () => {
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.x += m.vx + Math.sin(m.p += .01) * .00004; m.y += m.vy;
        if (m.y < m.band[0]) m.y = m.band[0] + (m.band[1] - m.band[0]) * .7;
        if (m.x < INNER[0]) m.x = INNER[1]; if (m.x > INNER[1]) m.x = INNER[0];
        const glow = Math.max(0, 1 - (m.y - m.band[0]) / (m.band[1] - m.band[0]));
        ctx.beginPath(); ctx.arc(m.x * w, m.y * h, m.r * devicePixelRatio, 0, 6.283);
        ctx.fillStyle = `rgba(255,214,150,${(m.a * (.35 + .65 * glow) * (.75 + .25 * Math.sin(m.p * 2))).toFixed(3)})`; ctx.fill();
      }
      raf = requestAnimationFrame(step);
    };
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) step();
    return () => cancelAnimationFrame(raf);
  }

  function close() {
    if (!current) return;
    const { veil, shelf, tip, stopDust, onKey } = current;
    current = null;
    veil.classList.remove('is-open'); shelf.classList.remove('is-open'); tip.remove();
    document.removeEventListener('keydown', onKey);
    setTimeout(() => { stopDust(); veil.remove(); shelf.remove(); }, 950);
  }

  function open({ books = [], currentId = '', onOpen, onNew } = {}) {
    if (current) { close(); return; }
    if (!document.getElementById('bc-style')) { const style = document.createElement('style'); style.id = 'bc-style'; style.textContent = STYLE; document.head.appendChild(style); }
    const veil = document.createElement('div'); veil.className = 'bc-veil';
    const shelf = document.createElement('aside'); shelf.className = 'bc-case'; shelf.setAttribute('aria-label', 'Мои книги');
    shelf.innerHTML = `<div class="bc-inner"><div class="bc-title">Мои книги</div><button type="button" class="bc-close" aria-label="Закрыть">×</button><canvas class="bc-dust"></canvas></div>`;
    const inner = shelf.querySelector('.bc-inner');
    const tip = document.createElement('div'); tip.className = 'bc-tip';
    document.body.append(veil, shelf, tip);

    // Spines: the newest book first; width follows the page count.
    const list = [...books].sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
    const items = [...list.map(book => ({ book })), { add: true }];
    const caseW = inner.getBoundingClientRect().width || 440, caseH = inner.getBoundingClientRect().height || caseW / RATIO;
    const innerW = (INNER[1] - INNER[0]) * caseW, gap = 3;
    let shelfIndex = 0, x = 0, order = 0;
    for (const item of items) {
      const pages = Number(item.book?.pages) || 24;
      const width = item.add ? Math.round(caseW * .12) : Math.round(Math.min(caseW * .14, Math.max(caseW * .085, caseW * (.075 + pages / 2400))));
      if (x + width > innerW && x > 0) { shelfIndex++; x = 0; }
      if (shelfIndex >= SHELVES.length) break;
      const [top, floor] = SHELVES[shelfIndex], room = (floor - top) * caseH;
      const height = Math.round(room * (item.add ? .62 : .74 + (hash(item.book.id) % 12) / 100));
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'bc-book' + (item.add ? ' bc-new' : '') + (item.book?.id === currentId ? ' is-current' : '');
      button.style.cssText = `left:${INNER[0] * caseW + x}px;top:${floor * caseH - height}px;bottom:auto;width:${width}px;height:${height}px;--bc-delay:${(.25 + order * .06).toFixed(2)}s`;
      if (item.add) {
        button.innerHTML = '<span>+</span>';
        button.setAttribute('aria-label', 'Новая книга');
        button.dataset.tipTitle = 'Новая книга'; button.dataset.tipNote = 'начать с первых шагов';
        button.addEventListener('click', () => { close(); onNew && onNew(); });
      } else {
        const book = item.book, cloth = CLOTHS[hash(book.id) % CLOTHS.length];
        button.style.backgroundImage = `url("${asset(`linen-${cloth.name}.jpg`)}")`;
        button.style.setProperty('--bc-ink', cloth.ink);
        const title = String(book.title || '').trim() || 'Книга без названия';
        // The title fits the spine: the type shrinks for a long name (not
        // below 11px), the rest is cut with an ellipsis.
        const fontSize = Math.max(11, Math.min(15, height * .68 / (title.length * .52)));
        button.innerHTML = `<span style="font-size:${fontSize.toFixed(1)}px">${esc(title)}</span>${book.id === currentId ? '<i class="bc-ribbon" aria-hidden="true"></i>' : ''}`;
        button.setAttribute('aria-label', title);
        button.dataset.tipTitle = title;
        button.dataset.tipNote = book.id === currentId ? 'открыта сейчас' : [when(book.savedAt) && `изменена ${when(book.savedAt)}`, book.pages && `${book.pages} ${pagesWord(book.pages)}`].filter(Boolean).join(' · ');
        button.addEventListener('click', () => { if (book.id === currentId) { close(); return; } close(); onOpen && onOpen(book.id); });
      }
      inner.appendChild(button);
      x += width + gap; order++;
    }

    const showTip = button => {
      const r = button.getBoundingClientRect();
      tip.innerHTML = `<b>${esc(button.dataset.tipTitle)}</b>${button.dataset.tipNote ? `<i>${esc(button.dataset.tipNote)}</i>` : ''}`;
      // The note stands outside the cabinet, level with the book, so it
      // never covers other spines or the heading.
      tip.style.left = `${shelf.getBoundingClientRect().left - 14}px`;
      tip.style.top = `${Math.max(50, Math.min(innerHeight - 50, r.top + r.height / 2))}px`;
      tip.classList.add('show');
    };
    shelf.addEventListener('mouseover', event => { const button = event.target.closest('.bc-book'); if (button) showTip(button); });
    shelf.addEventListener('mouseout', event => { if (event.target.closest('.bc-book') && !event.relatedTarget?.closest?.('.bc-book')) tip.classList.remove('show'); });
    shelf.addEventListener('focusin', event => { const button = event.target.closest('.bc-book'); if (button) showTip(button); });
    shelf.querySelector('.bc-close').addEventListener('click', close);
    veil.addEventListener('click', close);
    const onKey = event => { if (event.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    const stopDust = dust(shelf.querySelector('.bc-dust'));
    current = { veil, shelf, tip, stopDust, onKey };
    requestAnimationFrame(() => requestAnimationFrame(() => { veil.classList.add('is-open'); shelf.classList.add('is-open'); }));
  }

  root.OcherkiBookcase = Object.freeze({ open, close, isOpen: () => Boolean(current) });
})(typeof window !== 'undefined' ? window : globalThis);
