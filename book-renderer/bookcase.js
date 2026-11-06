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
  const NICHE = 172;      // height of one niche, px
  const BOARD = 6;        // thin brass shelf
  const SIDE = 22;        // inner padding of a niche

  const STYLE = `
  .bc-veil{position:fixed;inset:0;z-index:12000;background:rgba(18,14,10,0);transition:background .8s ease}
  .bc-veil.is-open{background:rgba(18,14,10,.46)}
  .bc-case{position:fixed;top:0;right:0;bottom:0;z-index:12001;width:min(430px,92vw);box-sizing:border-box;padding:14px 14px 0;
    /* Brass body: the same polished metal as the hanging keys, with a bright
       bevel along the outer edge and a dark one inside. */
    background:linear-gradient(145deg,#f3e2c2 0%,#ead4b1 8%,#c59664 30%,#a77a4f 48%,#d8b886 60%,#8e6242 78%,#4a3324 100%);
    border-radius:18px 0 0 0;
    box-shadow:-26px 0 60px rgba(0,0,0,.5),inset 0 1px 0 rgba(255,246,228,.75),inset 1px 0 0 rgba(255,246,228,.45),inset 0 -1px 0 rgba(63,43,29,.6);
    transform:translateX(104%);transition:transform .95s cubic-bezier(.18,.78,.24,1);display:flex;flex-direction:column}
  .bc-case.is-open{transform:translateX(0)}
  /* A soft glint running down the metal. */
  .bc-case::before{content:'';position:absolute;inset:0;border-radius:18px 0 0 0;pointer-events:none;
    background:linear-gradient(100deg,rgba(255,255,255,0) 18%,rgba(255,250,235,.32) 24%,rgba(255,255,255,0) 31%);mix-blend-mode:screen}
  /* The dark interior, sunk into the brass: one cavity with a deep inner shadow. */
  .bc-inner{position:relative;flex:1 1 auto;display:flex;flex-direction:column;min-height:0;border-radius:10px 10px 0 0;
    background:radial-gradient(130% 60% at 50% 0%,#2b2622 0%,#1b1816 55%,#131110 100%);
    box-shadow:inset 0 0 0 1px rgba(40,26,14,.9),inset 0 0 0 2px rgba(255,228,180,.18),inset 0 18px 34px rgba(0,0,0,.85),inset 0 0 46px rgba(0,0,0,.75),0 1px 0 rgba(255,246,228,.5)}
  .bc-head{position:relative;flex:0 0 auto;display:flex;align-items:center;justify-content:center;height:62px}
  .bc-title{color:#e9cf9d;font:italic 400 27px/1 'CormorantCy',Georgia,serif;letter-spacing:.04em;text-shadow:0 1px 2px rgba(0,0,0,.6)}
  .bc-close{position:absolute;right:10px;top:13px;width:36px;height:36px;border:0;border-radius:50%;cursor:pointer;color:#3a2a1c;font:20px/36px Georgia,serif;
    background:radial-gradient(circle at 50% 45%,#fbf3e6 0 55%,#e9dcc6 100%);box-shadow:0 0 0 2px #c9a46c,0 0 0 3px #6b4f2e,0 4px 8px rgba(0,0,0,.4)}
  .bc-close:hover{color:#b56e27}
  .bc-scroll{position:relative;flex:1 1 auto;overflow-y:auto;overflow-x:hidden;padding:4px 0 18px;scrollbar-width:thin;scrollbar-color:#6b4a2c transparent}
  .bc-niche{position:relative;height:${NICHE}px;margin:0 0 ${BOARD}px;
    background:radial-gradient(90% 70% at 50% 0%,rgba(255,196,120,.10),rgba(255,196,120,0) 65%);
    display:flex;align-items:flex-end;gap:3px;padding:0 ${SIDE}px}
  /* Shadow under the shelf above: the niche is lit from the front. */
  .bc-niche::before{content:'';position:absolute;left:0;right:0;top:0;height:26px;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.55),rgba(0,0,0,0))}
  /* The thin polished brass shelf the books stand on, running wall to wall. */
  .bc-niche::after{content:'';position:absolute;left:0;right:0;bottom:-${BOARD}px;height:${BOARD}px;
    background:linear-gradient(180deg,#fff1d2 0%,#ead4b1 22%,#c59664 50%,#8e6242 80%,#4a3324 100%);
    box-shadow:0 3px 6px rgba(0,0,0,.6),0 -1px 0 rgba(0,0,0,.35)}
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
  .bc-card{position:fixed;z-index:12004;width:300px;padding:18px 20px 16px;border-radius:14px;background:rgba(32,22,14,.97);box-shadow:0 14px 34px rgba(0,0,0,.5),inset 0 0 0 1px rgba(226,190,130,.3);color:#f1e2c8;transform:translate(-100%,-50%)}
  .bc-card[hidden]{display:none}
  .bc-card b{display:block;font:400 22px/1.2 'CormorantCy',Georgia,serif}
  .bc-card i{display:block;margin-top:4px;font:italic 14px/1.35 Georgia,serif;color:#cfb68e}
  .bc-card p{margin:12px 0 0;font:15px/1.4 Georgia,serif}
  .bc-card-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
  .bc-card button{border:0;border-radius:20px;padding:9px 16px;font:15px Georgia,serif;cursor:pointer}
  .bc-card .bc-go{background:#c9a46c;color:#2a1c10}
  .bc-card .bc-del{background:none;color:#e6a08f;box-shadow:inset 0 0 0 1px rgba(230,160,143,.55)}
  .bc-card .bc-del.is-danger{background:#a8452f;color:#fff3ea;box-shadow:none}
  .bc-card .bc-cancel{background:none;color:#f1e2c8;box-shadow:inset 0 0 0 1px rgba(241,226,200,.4)}
  .bc-book.is-leaving{transition:transform .5s ease,opacity .5s ease!important;transform:translateY(-30px) scale(.9)!important;opacity:0!important}
  .bc-tip b{display:block;font:400 19px/1.2 'CormorantCy',Georgia,serif;letter-spacing:.01em}
  .bc-tip i{display:block;margin-top:4px;font:italic 400 13px/1.3 Georgia,serif;color:#cfb68e}
  /* The brass case stays. The close key hangs on a thread in the middle of
     the top, a round brass key like the constructor's (brass rim, cream
     face, soft shadow) and swings when the pointer touches it; the title
     sits lower, clear of it. Shelves are only their bright copper edge. */
  .bc-head{height:118px!important;align-items:flex-end!important;padding-bottom:14px;box-sizing:border-box}
  .bc-close{left:50%!important;right:auto!important;top:10px!important;width:46px!important;height:46px!important;margin-left:-23px;padding:0;
    background:none!important;box-shadow:none!important;transform-origin:50% -10px;transition:none!important}
  .bc-close::before{content:'';position:absolute;left:50%;bottom:100%;width:1.2px;height:12px;background:linear-gradient(to bottom,rgba(255,236,200,.25),rgba(255,236,200,.6))}
  .bc-close i{position:absolute;inset:0;border-radius:50%;background:linear-gradient(145deg,#ead4b1 0%,#c59664 24%,#8e6242 62%,#4a3324 100%);
    box-shadow:inset 0 1px 0 rgba(255,246,228,.4),inset 0 -1px 0 rgba(63,43,29,.45),0 2px 0 rgba(62,42,29,.56),0 6px 10px rgba(0,0,0,.45)}
  .bc-close i::after{content:'';position:absolute;inset:3px;border-radius:50%;background:radial-gradient(circle at 50% 53%,rgba(255,255,255,.14) 0%,rgba(255,255,255,.05) 24%,transparent 47%),radial-gradient(circle at 50% 50%,#efe3cb 0%,#e6d5b5 43%,#d9bf98 72%,#cba777 100%);
    box-shadow:inset 0 4px 5px rgba(0,0,0,.26),inset 0 1px 1px rgba(0,0,0,.3),inset 0 0 0 1px rgba(73,52,35,.3)}
  .bc-close b{position:relative;z-index:1;display:block;font:400 22px/46px Georgia,serif;color:#4a3324;transition:color .4s}
  .bc-close:hover b{color:#b56e27}
  .bc-title{margin-top:auto}
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
    for (let i = 0; i < 26 * bands.length; i++) {
      const band = bands[i % bands.length];
      motes.push({ x: .08 + Math.random() * .84, y: band[0] + Math.random() * (band[1] - band[0]), r: .7 + Math.random() * 1.9, vx: (Math.random() - .5) * .00008, vy: -.00002 - Math.random() * .00005, a: .28 + Math.random() * .42, p: Math.random() * 6.28, band });
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

  function open({ books = [], currentId = '', currentTitle = '', onOpen, onNew, onDeleteCurrent } = {}) {
    if (current) { close(); return; }
    if (!document.getElementById('bc-style')) { const style = document.createElement('style'); style.id = 'bc-style'; style.textContent = STYLE; document.head.appendChild(style); }
    const veil = document.createElement('div'); veil.className = 'bc-veil';
    const shelf = document.createElement('aside'); shelf.className = 'bc-case'; shelf.setAttribute('aria-label', 'Мои книги');
    shelf.innerHTML = `<div class="bc-inner"><div class="bc-head"><div class="bc-title">Мои книги</div><button type="button" class="bc-close" aria-label="Закрыть"><i></i><b>×</b></button></div><div class="bc-scroll"><canvas class="bc-dust"></canvas></div></div>`;
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
    const innerW = (scroll.clientWidth || 380) - 2 * SIDE;
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
        // A long name goes on the spine in two lines instead of being cut.
        const twoLines = title.length * 7.6 > height * .7 && width >= 36;
        const fontSize = twoLines ? Math.max(10.5, Math.min(13, height * .68 * 2 / (title.length * .55))) : Math.max(11, Math.min(15, height * .68 / (title.length * .52)));
        button.innerHTML = `<span style="font-size:${fontSize.toFixed(1)}px${twoLines ? ';white-space:normal;text-align:center;line-height:1.08' : ''}">${esc(title)}</span>${book.id === currentId ? '<i class="bc-ribbon" aria-hidden="true"></i>' : ''}`;
        button.setAttribute('aria-label', title);
        button.dataset.tipTitle = title;
        button.dataset.tipNote = book.id === currentId ? 'открыта сейчас' : [when(book.savedAt) && `изменена ${when(book.savedAt)}`, book.pages && `${book.pages} ${pagesWord(book.pages)}`].filter(Boolean).join(' · ');
        // A click opens a small card: open the book, or delete it (asked twice).
        button.addEventListener('click', event => { event.stopPropagation(); showCard(button, book); });
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
    const card = document.createElement('div'); card.className = 'bc-card'; card.hidden = true; document.body.appendChild(card);
    const showCard = (button, book) => {
      tip.classList.remove('show');
      const title = String(book.title || '').trim() || 'Книга без названия', isOpen = book.id === currentId;
      const r = button.getBoundingClientRect();
      card.style.left = `${shelf.getBoundingClientRect().left - 14}px`;
      card.style.top = `${Math.max(110, Math.min(innerHeight - 110, r.top + r.height / 2))}px`;
      const main = () => {
        card.innerHTML = `<b>${esc(title)}</b><i>${esc(button.dataset.tipNote || '')}</i><div class="bc-card-actions"><button type="button" class="bc-go">${isOpen ? 'Вернуться к книге' : 'Открыть книгу'}</button><button type="button" class="bc-del">Удалить книгу</button></div>`;
        card.querySelector('.bc-go').onclick = () => { card.remove(); close(); if (!isOpen) onOpen && onOpen(book.id); };
        card.querySelector('.bc-del').onclick = ask;
      };
      const ask = () => {
        card.innerHTML = `<b>Удалить «${esc(title)}»?</b><p>Книга исчезнет с полки вместе с текстом и фотографиями. Вернуть её будет нельзя.</p><div class="bc-card-actions"><button type="button" class="bc-del is-danger">Да, удалить</button><button type="button" class="bc-cancel">Отмена</button></div>`;
        card.querySelector('.bc-cancel').onclick = main;
        card.querySelector('.bc-del').onclick = async () => {
          try { await root.OcherkiStore?.remove(book.id); } catch (_) {}
          card.hidden = true; button.classList.add('is-leaving');
          setTimeout(() => button.remove(), 500);
          if (isOpen) { card.remove(); close(); onDeleteCurrent && onDeleteCurrent(book.id); }
        };
      };
      main(); card.hidden = false;
    };
    shelf.addEventListener('click', event => { if (!event.target.closest('.bc-book')) card.hidden = true; });
    shelf.querySelector('.bc-close').addEventListener('click', () => { card.remove(); close(); });
    // The close key swings like the constructor's hanging keys.
    { const key = shelf.querySelector('.bc-close'); let ang = 0, vel = 0, raf = 0, lastX = 0;
      const step = () => { vel += -.0105 * ang; vel *= .992; ang += vel; if (Math.abs(ang) > 9) { ang = Math.sign(ang) * 9; vel *= -.14; }
        key.style.transform = `rotate(${ang.toFixed(2)}deg)`; if (Math.abs(ang) < .02 && Math.abs(vel) < .002) { key.style.transform = ''; raf = 0; return; } raf = requestAnimationFrame(step); };
      const push = (x, amp) => { const dir = lastX ? (x > lastX ? 1 : -1) : 1; lastX = x; vel = vel * .35 + amp * dir; if (!raf) raf = requestAnimationFrame(step); };
      key.addEventListener('pointerenter', e => push(e.clientX, 1.1));
      key.addEventListener('pointermove', e => { if (Math.abs(e.clientX - lastX) > 8) push(e.clientX, .5); });
      key.addEventListener('pointerleave', () => { lastX = 0; }); }
    veil.addEventListener('click', () => card.remove());
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
