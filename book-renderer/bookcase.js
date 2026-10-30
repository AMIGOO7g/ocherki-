/* «Мои книги»: a tall bookcase that slides in from the right over the
 * constructor, drawn in the constructor's own language — a graphite body,
 * brass edges and brass shelves, warm light running round every niche.
 * Books stand on the shelves spine-out in linen cloth with gold lines;
 * hover lifts one and names it, a click opens it, the last spine starts a
 * new book. A little dust drifts in the light; no motion when the system
 * asks for reduced motion.
 *   OcherkiBookcase.open({books, currentId, currentTitle, onOpen(id), onNew()})
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
  const NICHE = 168;      // height of one niche, px
  const BOARD = 12;       // brass shelf board
  const SIDE = 22;        // inner padding of a niche

  const STYLE = `
  .bc-veil{position:fixed;inset:0;z-index:12000;background:rgba(18,14,10,0);transition:background .8s ease}
  .bc-veil.is-open{background:rgba(18,14,10,.46)}
  .bc-case{position:fixed;top:0;right:0;bottom:0;z-index:12001;width:min(420px,92vw);box-sizing:border-box;padding:16px 16px 0;
    background:linear-gradient(180deg,#1d1b19 0%,#151413 60%,#100f0e 100%);
    box-shadow:-26px 0 60px rgba(0,0,0,.5);
    transform:translateX(104%);transition:transform .95s cubic-bezier(.18,.78,.24,1);display:flex;flex-direction:column}
  .bc-case.is-open{transform:translateX(0)}
  /* Brass frame: the same metal as the hanging keys. */
  .bc-case::before{content:'';position:absolute;inset:6px 6px 0 6px;border-radius:14px 14px 0 0;pointer-events:none;
    padding:3px;background:linear-gradient(145deg,#f1dcb3 0%,#c9a46c 26%,#8d6a3e 62%,#5f4527 100%);
    -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask-composite:exclude;
    box-shadow:0 0 18px rgba(214,160,90,.18)}
  .bc-head{position:relative;flex:0 0 auto;display:flex;align-items:center;justify-content:center;height:58px}
  .bc-title{color:#e9cf9d;font:italic 400 26px/1 'CormorantCy',Georgia,serif;letter-spacing:.04em;text-shadow:0 1px 2px rgba(0,0,0,.6)}
  .bc-close{position:absolute;right:6px;top:12px;width:34px;height:34px;border:0;border-radius:50%;cursor:pointer;color:#3a2a1c;font:20px/34px Georgia,serif;
    background:radial-gradient(circle at 50% 45%,#fbf3e6 0 55%,#e9dcc6 100%);box-shadow:0 0 0 2px #c9a46c,0 0 0 3px #6b4f2e,0 4px 8px rgba(0,0,0,.4)}
  .bc-close:hover{color:#b56e27}
  .bc-scroll{position:relative;flex:1 1 auto;overflow-y:auto;overflow-x:hidden;padding:4px 6px 18px;scrollbar-width:thin;scrollbar-color:#6b4a2c transparent}
  .bc-niche{position:relative;height:${NICHE}px;margin:0 0 ${BOARD}px;border-radius:6px;
    background:radial-gradient(120% 90% at 50% 0%,rgba(255,196,120,.13),rgba(255,196,120,0) 60%),linear-gradient(180deg,#22201d,#191816);
    box-shadow:inset 0 0 0 1px rgba(226,183,121,.22),inset 0 0 22px rgba(255,180,100,.10),inset 0 14px 18px -10px rgba(0,0,0,.6);
    display:flex;align-items:flex-end;gap:3px;padding:0 ${SIDE}px}
  /* Warm light running round the niche, strongest along the top. */
  .bc-niche::before{content:'';position:absolute;inset:0;border-radius:6px;pointer-events:none;
    box-shadow:inset 0 2px 0 rgba(255,214,150,.55),inset 0 0 14px rgba(255,190,110,.20)}
  /* The brass board the books stand on. */
  .bc-niche::after{content:'';position:absolute;left:-4px;right:-4px;bottom:-${BOARD}px;height:${BOARD}px;border-radius:2px;
    background:linear-gradient(180deg,#f0d9ae 0%,#c69f66 35%,#8a6638 75%,#5a4124 100%);box-shadow:0 4px 8px rgba(0,0,0,.45)}
  .bc-book{position:relative;flex:0 0 auto;z-index:2;border:0;padding:0;cursor:pointer;border-radius:2px 2px 1px 1px;
    background-size:180px 180px;background-repeat:repeat;
    box-shadow:inset 3px 0 4px rgba(255,255,255,.10),inset -4px 0 6px rgba(0,0,0,.38),inset 0 -2px 3px rgba(0,0,0,.25),1px 0 0 rgba(0,0,0,.45),3px 0 6px rgba(0,0,0,.35);
    transform-origin:50% 100%;transition:transform .38s cubic-bezier(.2,.8,.3,1),filter .38s ease;opacity:0}
  .bc-case.is-open .bc-book{opacity:1;transition:transform .38s cubic-bezier(.2,.8,.3,1),filter .38s ease,opacity .6s ease var(--bc-delay,0s)}
  .bc-book::before,.bc-book::after{content:'';position:absolute;left:12%;right:12%;height:0;border-top:1px solid var(--bc-ink);border-bottom:1px solid var(--bc-ink);padding-top:3px;opacity:.85}
  .bc-book::before{top:7%}.bc-book::after{bottom:7%}
  .bc-book span{position:absolute;left:0;right:0;top:15%;bottom:15%;display:flex;align-items:center;justify-content:center;overflow:hidden;
    writing-mode:vertical-rl;color:var(--bc-ink);font:600 15px/1.05 'CormorantCy',Georgia,serif;letter-spacing:.06em;white-space:nowrap;text-overflow:ellipsis;text-shadow:0 1px 0 rgba(0,0,0,.25)}
  .bc-book:hover,.bc-book:focus-visible{transform:translateY(-8px) scale(1.06);filter:brightness(1.1);z-index:3;outline:none}
  .bc-book.is-current::after{border-color:#f0d49a;opacity:1}
  .bc-ribbon{position:absolute;bottom:-${BOARD + 6}px;left:56%;width:5px;height:24px;background:linear-gradient(#9d2b26,#7a1d1a);clip-path:polygon(0 0,100% 0,100% 100%,50% 82%,0 100%);box-shadow:0 1px 2px rgba(0,0,0,.4);z-index:4}
  .bc-book.bc-new{background:rgba(255,236,200,.04);box-shadow:inset 0 0 0 1px rgba(232,198,140,.6);--bc-ink:#e8c68c}
  .bc-book.bc-new::before,.bc-book.bc-new::after{display:none}
  .bc-book.bc-new span{font-size:30px;writing-mode:horizontal-tb;inset:0}
  .bc-dust{position:absolute;inset:0;pointer-events:none;z-index:5;mix-blend-mode:screen}
  .bc-tip{position:fixed;z-index:12003;pointer-events:none;max-width:260px;padding:10px 14px 11px;border-radius:10px;background:rgba(32,22,14,.94);
    box-shadow:0 10px 28px rgba(0,0,0,.4),inset 0 0 0 1px rgba(226,190,130,.3);color:#f1e2c8;text-align:center;
    opacity:0;transform:translate(-100%,-50%) translateX(8px);transition:opacity .28s ease,transform .28s ease}
  .bc-tip.show{opacity:1;transform:translate(-100%,-50%)}
  .bc-tip b{display:block;font:400 19px/1.2 'CormorantCy',Georgia,serif;letter-spacing:.01em}
  .bc-tip i{display:block;margin-top:4px;font:italic 400 13px/1.3 Georgia,serif;color:#cfb68e}
  @media (prefers-reduced-motion: reduce){.bc-case,.bc-veil,.bc-book{transition:none!important}.bc-dust{display:none}}`;

  const hash = text => { let h = 7; for (const ch of String(text)) h = (h * 31 + ch.codePointAt(0)) >>> 0; return h; };
  const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const when = at => { if (!at) return ''; const d = new Date(Number(at)); return `${d.getDate()} ${months[d.getMonth()]}${d.getFullYear() !== new Date().getFullYear() ? ' ' + d.getFullYear() : ''}`; };
  const pagesWord = n => n % 10 === 1 && n % 100 !== 11 ? 'страница' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'страницы' : 'страниц';

  let current = null;

  // Dust: warm motes drifting slowly in the light of the niches.
  function dust(canvas, niches) {
    const ctx = canvas.getContext('2d'), motes = [];
    let raf = 0, w = 0, h = 0;
    w = canvas.width = canvas.clientWidth * devicePixelRatio; h = canvas.height = canvas.clientHeight * devicePixelRatio;
    const bands = niches.map(niche => [niche.offsetTop / canvas.clientHeight, (niche.offsetTop + niche.offsetHeight * .75) / canvas.clientHeight]);
    for (let i = 0; i < 12 * bands.length; i++) {
      const band = bands[i % bands.length];
      motes.push({ x: .08 + Math.random() * .84, y: band[0] + Math.random() * (band[1] - band[0]), r: .5 + Math.random() * 1.2, vx: (Math.random() - .5) * .00006, vy: -.00002 - Math.random() * .00004, a: .12 + Math.random() * .3, p: Math.random() * 6.28, band });
    }
    const step = () => {
      ctx.clearRect(0, 0, w, h);
      for (const m of motes) {
        m.x += m.vx + Math.sin(m.p += .01) * .00004; m.y += m.vy;
        if (m.y < m.band[0]) m.y = m.band[1];
        if (m.x < .06) m.x = .94; if (m.x > .94) m.x = .06;
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

  function open({ books = [], currentId = '', currentTitle = '', onOpen, onNew } = {}) {
    if (current) { close(); return; }
    if (!document.getElementById('bc-style')) { const style = document.createElement('style'); style.id = 'bc-style'; style.textContent = STYLE; document.head.appendChild(style); }
    const veil = document.createElement('div'); veil.className = 'bc-veil';
    const shelf = document.createElement('aside'); shelf.className = 'bc-case'; shelf.setAttribute('aria-label', 'Мои книги');
    shelf.innerHTML = `<div class="bc-head"><div class="bc-title">Мои книги</div><button type="button" class="bc-close" aria-label="Закрыть">×</button></div><div class="bc-scroll"><canvas class="bc-dust"></canvas></div>`;
    const scroll = shelf.querySelector('.bc-scroll');
    const tip = document.createElement('div'); tip.className = 'bc-tip';
    document.body.append(veil, shelf, tip);

    // The open book always stands on the shelf, even before it was saved
    // with a title or when the store could not be read.
    const list = [...books].sort((a, b) => (b.savedAt || 0) - (a.savedAt || 0));
    if (currentId && !list.some(book => book.id === currentId)) list.unshift({ id: currentId, title: currentTitle, pages: 0, savedAt: Date.now() });
    const items = [...list.map(book => ({ book })), { add: true }];

    // Niches fill the whole height of the screen; books go on them left to
    // right, a new niche when one is full.
    const innerW = (scroll.clientWidth || 380) - 12 - 2 * SIDE;
    const makeNiche = () => { const niche = document.createElement('div'); niche.className = 'bc-niche'; scroll.appendChild(niche); return niche; };
    let niche = makeNiche(), used = 0, order = 0;
    for (const item of items) {
      const pages = Number(item.book?.pages) || 24;
      const width = item.add ? 46 : Math.round(Math.min(60, Math.max(36, 32 + pages / 6)));
      if (used + width > innerW && used > 0) { niche = makeNiche(); used = 0; }
      const height = Math.round(NICHE * (item.add ? .62 : .72 + (hash(item.book.id) % 14) / 100));
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'bc-book' + (item.add ? ' bc-new' : '') + (item.book?.id === currentId ? ' is-current' : '');
      button.style.cssText = `width:${width}px;height:${height}px;--bc-delay:${(.25 + order * .06).toFixed(2)}s`;
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
      niche.appendChild(button);
      used += width + 3; order++;
    }
    // Empty niches down to the bottom of the screen: the case is always full height.
    const nicheStep = NICHE + BOARD;
    while ((scroll.querySelectorAll('.bc-niche').length + 1) * nicheStep <= scroll.clientHeight - 20) makeNiche();

    const showTip = button => {
      const r = button.getBoundingClientRect();
      tip.innerHTML = `<b>${esc(button.dataset.tipTitle)}</b>${button.dataset.tipNote ? `<i>${esc(button.dataset.tipNote)}</i>` : ''}`;
      // The note stands outside the case, level with the book, so it never
      // covers other spines or the heading.
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
    const canvas = scroll.querySelector('.bc-dust');
    canvas.style.height = scroll.scrollHeight + 'px';
    const stopDust = dust(canvas, [...scroll.querySelectorAll('.bc-niche')]);
    current = { veil, shelf, tip, stopDust, onKey };
    requestAnimationFrame(() => requestAnimationFrame(() => { veil.classList.add('is-open'); shelf.classList.add('is-open'); }));
  }

  root.OcherkiBookcase = Object.freeze({ open, close, isOpen: () => Boolean(current) });
})(typeof window !== 'undefined' ? window : globalThis);
