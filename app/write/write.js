// «Писать» — its scripts in one place (v174), each in its own scope as before.

// ——— v35-keyboard-bridge
(function(){
 const frame=()=>document.getElementById('v35SheetFrame');
 function keyText(btn){
   const code=btn.dataset.code||'';
   if(code==='Backspace')return 'Backspace';
   if(code==='Enter')return 'Enter';
   if(code==='Tab')return 'Tab';
   if(code==='Space')return ' ';
   const cap=btn.querySelector('.editor-cap');
   if(!cap)return '';
   const raw=(cap.innerText||'').trim();
   // Caps on the key caps are only labels: letters are lowercase unless CAPS
   // is on or SHIFT was pressed for the next key.
   const upper=capsOn!==shiftOnce;
   if(/^Key/.test(code)) return upper?raw.charAt(0).toLocaleUpperCase('ru'):raw.charAt(0).toLocaleLowerCase('ru');
   if(/^Digit/.test(code)){const parts=raw.split(/\s+/);return (shiftOnce?parts[0]:parts.pop())||'';}
   if(code==='Comma')return ',';
   if(code==='Period')return '.';
   if(code==='Slash')return '/';
   if(code==='Semicolon')return ';';
   if(code==='Quote')return "'";
   if(code==='Minus')return '-';
   if(code==='Equal')return '=';
   return raw.charAt(0);
 }
 let capsOn=false,shiftOnce=false;
 const showModifiers=()=>{
   document.querySelectorAll('.editor-key[data-code="CapsLock"]').forEach(k=>k.classList.toggle('is-latched',capsOn));
   document.querySelectorAll('.editor-key[data-code^="Shift"]').forEach(k=>k.classList.toggle('is-latched',shiftOnce));
 };
 document.addEventListener('click',e=>{
   const b=e.target.closest('.editor-key'); if(!b)return;
   const code=b.dataset.code||'';
   if(code==='CapsLock'){capsOn=!capsOn;showModifiers();return;}
   if(/^Shift/.test(code)){shiftOnce=!shiftOnce;showModifiers();return;}
   const key=keyText(b); if(!key)return;
   try{frame()?.contentWindow?.postMessage({type:'ocherki-key',key},'*')}catch(_){}
   if(shiftOnce&&key.length===1){shiftOnce=false;showModifiers();}
 });
})();


// ——— keyboard-rests-controller
(()=>{
  const shell=document.querySelector('.shell');let timer=0;
  const rest=()=>{if(!document.querySelector('#editorKeyboardWrap:hover'))shell.classList.add('is-keyboard-resting');else timer=setTimeout(rest,2000);};
  const wake=()=>{shell.classList.remove('is-keyboard-resting');clearTimeout(timer);timer=setTimeout(rest,5000);};
  window.addEventListener('message',event=>{const d=event.data||{};if(d.type==='OCHERKI_PHYSICAL_KEY'&&d.phase==='down')wake();});
  document.addEventListener('keydown',wake);
  document.getElementById('editorKeyboardWrap')?.addEventListener('pointerdown',wake);
  // After the constructor has settled it rests until the first key.
  window.addEventListener('message',event=>{if((event.data||{}).type==='OCHERKI_BOOT_START'){clearTimeout(timer);timer=setTimeout(rest,6000);}});
})();


// ——— write-peek-v113-js
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  const IB='<svg viewBox="0 0 24 24"><path d="M12 6c-2.6-1.8-5.6-1.9-8.5-1.3v13.5c2.9-.6 5.9-.5 8.5 1.3 2.6-1.8 5.6-1.9 8.5-1.3V4.7C17.6 4.1 14.6 4.2 12 6zM12 6v13.5"/></svg>';
  const IX='<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
  const IR='<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v5h-5"/></svg>';
  const pane=document.createElement('div');pane.className='wp-pane';pane.innerHTML='<div class="wp-cap">так ляжет в книге</div><div class="wp-page"><div class="wp-host"></div><div class="wp-wait"><span>собираю страницу…</span></div><i class="wp-lamp"></i></div><button type="button" class="wp-day" aria-pressed="false">☀ дневной свет</button>';
  // v187: at night the page lies under the lamp too; «дневной свет» shows the true print colours while it is pressed in
  pane.querySelector('.wp-day').addEventListener('click',e=>{e.stopPropagation();const on=pane.classList.toggle('show-day');e.currentTarget.setAttribute('aria-pressed',String(on));});
  const keys=document.createElement('div');keys.className='wp-keys k-closed';
  keys.innerHTML=`<div class="wp-item tog"><button type="button" class="key" aria-label="Показать в книге"><span class="cap">${IB}</span></button><span class="lab">в книге</span></div>`;
  const keys2=document.createElement('div');keys2.className='wp-keys k-open';
  keys2.innerHTML=`<div class="wp-item back"><button type="button" class="key" aria-label="Вернуть один лист"><span class="cap">${IX}</span></button><span class="lab">вернуть</span></div>
    <div class="wp-pg"><button type="button" data-pg="-1" aria-label="Предыдущая страница листа">‹</button><span></span><button type="button" data-pg="1" aria-label="Следующая страница листа">›</button></div>
    <div class="wp-item ref"><button type="button" class="key" aria-label="Обновить страницу"><i class="wp-halo"></i><span class="cap">${IR}</span></button><span class="lab">обновить</span></div>`;
  const note=document.createElement('div');note.className='wp-note';note.setAttribute('role','status');note.innerHTML='<i></i><span>Собираю страницу книги… <small>несколько секунд</small></span>';
  shell.append(pane,keys,keys2,note);
  const wrap=()=>document.getElementById('editorPaperWrap');
  // where the sheet begins on screen: its top line in sight (the author reads the sheet from there)
  const topRatio=()=>{try{const d=document.getElementById('v35SheetFrame').contentDocument,ed=d.getElementById('editor');if(!ed)return 0;const total=ed.textContent.length;if(!total)return 0;
    const box=(ed.closest('.editor-scroll,.page-content,.paper')||ed.parentElement).getBoundingClientRect();let before=0;
    for(const n of ed.childNodes){const rr=n.nodeType===1?n.getBoundingClientRect():null;if(rr&&rr.bottom>box.top+8)break;before+=(n.textContent||'').length;}
    return Math.min(1,(before+1)/total);}catch(_){return 0;}};
  const tog=keys.querySelector('.tog'),ref=keys2.querySelector('.ref'),pg=keys2.querySelector('.wp-pg');
  let on=false,uid='',stale=false,busy=false,shown=-1,tAuto=0,pick=null,count=1;
  // the paper and the sheets of the chapter lying behind it, to its right
  const stackRight=()=>{let m=0;try{const f=document.getElementById('v35SheetFrame'),fr=f.getBoundingClientRect();f.contentDocument.querySelectorAll('.sheet-stack .sheet').forEach(el=>{const r=el.getBoundingClientRect();if(r.width>50)m=Math.max(m,fr.left+r.right);});}catch(_){}return m;};
  const usable=()=>shell.classList.contains('is-open')&&!['is-manuscript','is-book-preview','is-start-screen','is-ms-to-book'].some(c=>shell.classList.contains(c))&&!document.getElementById('bookPreviewModal')?.classList.contains('open');
  const shift=()=>{const w=wrap();return w?parseFloat(getComputedStyle(w).translate)||0:0;};
  function geo(){const w=wrap();if(!w)return null;const r=w.getBoundingClientRect();if(!r.width)return null;
    const sh=shift(),base={left:r.left-sh,top:r.top,width:r.width,height:r.height};
    const extra=Math.max(0,Math.min(160,(stackRight()-sh)-(base.left+base.width)));
    const [pw,ph]=window.__ocherkiPageSize?.()||[1,1];const G=64+extra,room=innerWidth-2*180;
    let H=base.height*.8,W=H*pw/ph;if(base.width+G+W>room){W=Math.max(0,room-base.width-G);H=W*ph/pw;}
    let d=(W+G)/2;
    // v119: the sheet stays where it is — the book's page comes out on its right.
    if(shell.classList.contains('oc-w')){const ws=window.__ocWsRoom?.();
      // v205: on the desk the page keeps clear of the chapter's sheets fanned out behind the open one (room for all three of them,
      // so it never moves when a sheet is added) and stands under the book's plate, level with the stack's tabs
      const G2=ws?84+24:G;const r2=innerWidth-(base.left+base.width)-G2-(ws?20:40);
      const tb=ws?document.querySelector('.ws-tabs')?.getBoundingClientRect():null,top0=tb&&tb.height?tb.bottom+16:0,bot0=innerHeight-150;
      const hMax=ws&&top0?Math.min(base.height*.8,bot0-top0):base.height*.8;H=hMax;W=H*pw/ph;if(W>r2){W=Math.max(0,r2);H=W*ph/pw;}d=0;
      if(ws)return {base,W,H,G:G2,d,extra:0,top0,ok:W>=200};}
    return {base,W,H,G,d,extra,ok:W>=260};}
  // v221: whole pixels — on a fractional edge the page's shade (::after) left a pale line at its left edge once it stopped
  function place(){const g=geo();if(!g)return;g.W=Math.round(g.W);g.H=Math.round(g.H);const b=g.base,L=Math.round(b.left-g.d+b.width+g.G),T=Math.round(g.top0?g.top0:b.top+(b.height-g.H)/2-10);
    const css=on?`left:${L}px;top:${T}px;width:${g.W}px;height:${g.H}px`:`left:${b.left+b.width+g.extra-g.W*.7}px;top:${T}px;width:${g.W}px;height:${g.H}px`;
    if((on||!shell.classList.contains('wp-closing'))&&pane._css!==css){pane._css=css;pane.style.cssText=css;}
    keys2.style.left=(L+g.W/2)+'px';keys2.style.top=(T+g.H+(g.top0?50:22))+'px';
    keys.style.left=(b.left+b.width+g.extra+30)+'px';keys.style.top=(b.top+b.height-96)+'px';}
  function setOpen(v){const w=wrap();if(!w)return;
    if(v){const g=geo();if(!g||!g.ok){window.OCHERKI_SAY?.('Окно узковато для двух листов — откройте «Книгу»','открыть',()=>window.OCHERKI_SET_MODE?.('book'));return;}
      // the page is laid out first, while nothing moves — then everything glides without a stall
      if(!setOpen.ready){tog.classList.add('is-busy');{const k=document.querySelector('.wc.on [data-c="peek"]'),r=(k||w).getBoundingClientRect();note.style.left=Math.round(r.left+r.width/2)+'px';note.style.top=Math.round(r.bottom+(k?22:-60))+'px';}note.classList.add('on');try{document.getElementById('v35SheetFrame')?.contentWindow?.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',action:'flush'},'*');}catch(_){}const t0=Date.now();setTimeout(()=>{pick=null;try{paint(true);}catch(_){}setOpen.ready=true;setTimeout(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{tog.classList.remove('is-busy');note.classList.remove('on');setOpen(true);setOpen.ready=false;})),Math.max(0,900-(Date.now()-t0)));},260);return;}}
    on=v;const g=geo();w.style.translate=on&&g?`${-g.d}px 0`:'';shell.classList.toggle('wp-on',on);
    clearTimeout(setOpen.u);shell.classList.remove('wp-up');if(on)setOpen.u=setTimeout(()=>{if(on)shell.classList.add('wp-up');},1600);
    clearTimeout(setOpen.c);if(!on){shell.classList.add('wp-closing');setOpen.c=setTimeout(()=>shell.classList.remove('wp-closing'),1500);}else shell.classList.remove('wp-closing');
    place();
  }
  // lays the page into the pane at once (the book is usually prepared in the background already)
  // v254: the next page is laid under the one shown and comes over it once its pictures are ready — the shown page never goes
  // blank in between (it blinked at every change of sheet: the cover's photo was loaded anew on an empty page)
  function swapHost(html){const host=pane.querySelector('.wp-host:not(.wp-next)');if(!host)return;
    pane.querySelectorAll('.wp-host.wp-next').forEach(n=>n.remove());
    if(!host.firstElementChild||host.querySelector('.wp-none')&&(!/<img/.test(html)||/wp-wait/.test(html))){if(host.innerHTML!==html)host.innerHTML=html;return;}
    const nx=host.cloneNode(false);nx.classList.add('wp-next');nx.innerHTML=html;host.after(nx);window.__ocherkiScalePages?.();
    const ims=[...nx.querySelectorAll('img')].map(i=>i.complete?(i.decode?i.decode().catch(()=>{}):null):new Promise(r=>{i.addEventListener('load',r,{once:true});i.addEventListener('error',r,{once:true});}));
    Promise.race([Promise.all(ims),new Promise(r=>setTimeout(r,900))]).then(()=>{if(!nx.isConnected)return;requestAnimationFrame(()=>{nx.classList.add('in');
      setTimeout(()=>{if(!nx.isConnected)return;host.remove();nx.style.transition='none';nx.classList.remove('wp-next','in');void nx.offsetWidth;nx.style.transition='';},1300);});});}
  function paint(force){let res=null;const ratio=topRatio();try{res=window.__ocherkiPeekPage?.(uid,ratio,pick,force);}catch(_){res=null;}
    const host=pane.querySelector('.wp-host');
    count=res?.n||1;pg.classList.toggle('on',count>1);if(res){pick=res.k;pg.querySelector('span').textContent=`${res.k+1} из ${count}`;pg.querySelector('[data-pg="-1"]').disabled=res.k<=0;pg.querySelector('[data-pg="1"]').disabled=res.k>=count-1;}
    if(res){swapHost(res.html);shown=res.spread;pane.querySelector('.wp-cap').textContent=`так ляжет в книге${res.pageNo?' · страница '+res.pageNo:''}`;}
    // v256: while the page is still being laid out (the book's structure has not come yet, or it is being put together) the boy
    // with the kite stands on the page; «появится в книге» only once the page has been asked for several times in vain
    else{const waiting=(paint.n||0)<6;
      swapHost(waiting?'<div class="wp-none wp-wait"><img src="assets/book/kite.webp" alt="" draggable="false"><span>Собирается страница</span></div>':'<div class="wp-none">Этот раздел появится в книге,<br>когда в нём будет текст или фото</div>');pane.querySelector('.wp-cap').textContent='так ляжет в книге';}
    // v215: right after loading the book's structure may not have come yet: the page is asked for again a few times (it stayed
    // empty until «обновить» was pressed)
    clearTimeout(paint.r);if(res)paint.n=0;else if((paint.n=(paint.n||0)+1)<=8)paint.r=setTimeout(function again(){if(!on||busy){paint.r=setTimeout(again,400);return;}refresh(false);},paint.n<4?700:1500);
    // v250: a page shown from a book laid out before the latest changes keeps «обновить» lit
    place();window.__ocherkiScalePages?.();stale=false;try{stale=!window.__ocherkiBook?.fresh?.();}catch(_){}ref.classList.toggle('is-stale',stale);}
  // v202: the book's page is laid out again only once the hands rest a moment (a layout in the middle of taking the next sheet
  // made the desk stall); the picture of the old page stays meanwhile
  let lastHand=0;['pointerdown','pointermove','keydown'].forEach(t=>addEventListener(t,()=>{lastHand=performance.now();},{passive:true,capture:true}));
  const quietRefresh=()=>{const q=performance.now()-lastHand;if(q<1100){clearTimeout(tAuto);tAuto=setTimeout(quietRefresh,1150-q);return;}
    (window.requestIdleCallback||(f=>setTimeout(f,0)))(()=>refresh(false),{timeout:900});};
  function refresh(first,force){if(!on||busy)return;busy=true;if(force)pane.classList.add('is-busy');ref.classList.remove('is-stale');stale=false;
    ref.classList.remove('is-spin');void ref.offsetWidth;ref.classList.add('is-spin');clearTimeout(refresh.s);refresh.s=setTimeout(()=>ref.classList.remove('is-spin'),950);
    setTimeout(()=>{paint(force);requestAnimationFrame(()=>window.__ocherkiScalePages?.());
      setTimeout(()=>{pane.classList.remove('is-busy');busy=false;},160);},60);}
  tog.querySelector('button').addEventListener('click',()=>{if(!on){try{localStorage.removeItem('ocherkiPeekOff');}catch(_){}}setOpen(!on);});keys2.querySelector('.back button').addEventListener('click',()=>{try{localStorage.setItem('ocherkiPeekOff','1');}catch(_){}setOpen(false);});
  ref.querySelector('button').addEventListener('click',()=>{pick=null;refresh(false,true);});
  pg.addEventListener('click',e=>{const b=e.target.closest('[data-pg]');if(!b||b.disabled)return;pick=Math.max(0,Math.min(count-1,(pick||0)+(+b.dataset.pg)));refresh(false);});
  addEventListener('message',e=>{const d=e.data||{};
    if(d.type==='OCHERKI_ACTIVE_STATE'&&d.payload?.pageUid){const u=d.payload.pageUid;if(u!==uid){uid=u;pick=null;if(on){clearTimeout(tAuto);tAuto=setTimeout(quietRefresh,450);}}}
    else if(d.type==='OCHERKI_STRUCTURE_STATE'){let a='';(d.payload?.sections||[]).forEach(s=>(s.pages||[]).forEach(p=>{if(p.active)a=p.uid||p.id||'';}));
      if(a&&a!==uid){uid=a;pick=null;if(on){clearTimeout(tAuto);tAuto=setTimeout(quietRefresh,450);}}
      else if(on&&!busy){stale=true;ref.classList.add('is-stale');}}});
  const sync=()=>{const ok=usable();shell.classList.toggle('wp-ready',ok);
    // v202: leaving for the book the page, its keys, the book's name and the clock slide off to the left with the sheets
    if(!ok&&on&&!document.documentElement.classList.contains('rk-on')){on=false;const w=wrap();if(w){w.style.setProperty('transition','none','important');w.style.translate='';void w.offsetWidth;requestAnimationFrame(()=>requestAnimationFrame(()=>w.style.removeProperty('transition')));}
      shell.classList.remove('wp-on','wp-up','wp-closing');}
    if(ok)place();};
  new MutationObserver(sync).observe(shell,{attributes:true,attributeFilter:['class']});
  const modal=document.getElementById('bookPreviewModal');if(modal)new MutationObserver(sync).observe(modal,{attributes:true,attributeFilter:['class']});
  addEventListener('resize',()=>{if(on){const w=wrap(),g=geo();if(w&&g)w.style.translate=`${-g.d}px 0`;}place();requestAnimationFrame(()=>window.__ocherkiScalePages?.());});
  [1200,2600,4500].forEach(t=>setTimeout(sync,t));
  // v202: leaving for the book the page, its keys, the book's name and the clock slide off to the left with the sheets
  // The book is laid out in one go and holds the page for about a second: were it started at once, the move had no frames and
  // everything seemed to vanish. So the desk is cleared first — the sheets, the page, its keys go off to the left — and only
  // then the book is opened and slides in.
  let leaving=false;
  document.addEventListener('click',e=>{const k=e.target.closest?.('.oct .k[data-k="book"]');if(!k||k.__go||leaving||!shell.classList.contains('oc-ws'))return;
    e.stopImmediatePropagation();e.preventDefault();leaving=true;
    {const l=document.querySelector('.ws-left');if(l){l.style.animation='none';void l.offsetWidth;}}// its entrance holds no transform any more: the move starts from where it lies
    shell.classList.add('ws-leaving','ws-off');
    setTimeout(()=>{k.__go=true;k.click();k.__go=false;},1000);
    setTimeout(()=>{shell.classList.remove('ws-leaving','ws-off');leaving=false;const l=document.querySelector('.ws-left');if(l)l.style.animation='';},2600);},true);
  // v195: the desk of three sheets reaches the page from outside
  window.__ocWp={open:()=>{if(!on)setOpen(true);},isOn:()=>on,geo,place,pane,keys2,usable};
})();


// ——— write-carriage
// v168 — «Писать»: the carriage on the sheet (what belongs to the sheet), the Keeper in the corner, the keyboard rising while one types
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  const S='<svg viewBox="0 0 24 24">',E='</svg>';
  const IC={back:'<path d="M15 5l-7 7 7 7"/>',book:'<path d="M12 6c-2.6-1.8-5.6-1.9-8.5-1.3v13.5c2.9-.6 5.9-.5 8.5 1.3 2.6-1.8 5.6-1.9 8.5-1.3V4.7C17.6 4.1 14.6 4.2 12 6zM12 6v13.5"/>',
    mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',aa:'<path d="M3 18l5-12 5 12M5 14h6M15 18l3-7 3 7M16 16h4"/>',plus:'<path d="M12 5v14M5 12h14"/>',
    bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z"/>',
    play:'<path d="M8 5l11 7-11 7z"/>',pause:'<path d="M9 5v14M15 5v14"/>',photo:'<rect x="3" y="6" width="18" height="13" rx="1.5"/><circle cx="12" cy="12.5" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/>',episode:'<path d="M7 3h10v18l-5-4-5 4z"/>',
    document:'<path d="M6 3h9l3 3v15H6z"/><path d="M9 9h6M9 13h6M9 17h4"/>',quote:'<path d="M5 17c2.5-1 4-3 4-6V7H5v4h3M13 17c2.5-1 4-3 4-6V7h-4v4h3"/>',
    date:'<rect x="4" y="5" width="16" height="15" rx="1.5"/><path d="M4 10h16M8 3v4M16 3v4"/>',page:'<path d="M6 3h8l4 4v14H6Z"/><path d="M14 3v4h4"/>',layout:'<rect x="3" y="5" width="18" height="14" rx="1"/><path d="M12 5v14M14.5 9h4M14.5 12h4M14.5 15h3"/><rect x="5" y="8" width="5" height="6"/>'};
  const sv=n=>S+IC[n]+E;
  const wc=document.createElement('div');wc.className='wc wc-w';
  const bt=(c,ic,tip,cls='')=>`<button class="${cls}" data-c="${c}" aria-label="${tip}" data-tip="${tip}">${sv(ic)}${c==='tips'?'<em></em>':''}</button>`;
  wc.innerHTML=`<i class="nf"></i>`+bt('back','back','Назад')
    +`<span class="grow"></span><span class="t"><b></b><span class="sv"></span></span>`
    +bt('mic','mic','Говорить вместо печати')+bt('aa','aa','Шрифт и размер')+bt('add','plus','Добавить')+bt('cprev','back','Предыдущая композиция','bkc')+bt('comp','layout','Композиция разворота','bkc')+bt('cnext','back','Следующая композиция','bkc bkn')+bt('music','play','Музыка: играть / пауза')+bt('tips','bulb','До книги — что улучшить');
  document.body.appendChild(wc);
  // v204: the music's key on the bar: play ▸ / pause ‖ as the music goes
  addEventListener('message',e=>{const d=e.data||{};if(d.type!=='OCHERKI_AUDIO_STATE')return;const on=d.state==='playing'&&!d.muted;const k=wc.querySelector('[data-c="music"]');if(!k)return;
    k.classList.toggle('on',on);k.innerHTML=sv(on?'pause':'play');k.setAttribute('aria-label',on?'Музыка: пауза':'Музыка: играть');k.dataset.tip=k.getAttribute('aria-label');});
  const add=document.createElement('div');add.className='wc-add';
  add.innerHTML=[['photo','фото'],['episode','эпизод'],['document','документ'],['quote','цитата'],['date','дата'],['page','новый лист']].map(([a,l])=>`<button data-a="${a}">${sv(a)}${l}</button>`).join('');
  document.body.appendChild(add);
  const F=()=>document.getElementById('v35SheetFrame');const FD=()=>{try{return F()?.contentDocument;}catch(_){return null;}};const FW=()=>F()?.contentWindow;
  const isWrite=()=>shell.classList.contains('oc-w')&&shell.classList.contains('is-open')&&!shell.classList.contains('is-manuscript')&&!shell.classList.contains('is-book-preview')&&!document.documentElement.classList.contains('bk-on')&&!document.getElementById('bookPreviewModal')?.classList.contains('open')&&!window.OcherkiBookcase?.isOpen?.()&&!window.OcherkiArchive?.isOpen;
  // inside the sheet: its own top line and the light keys give way to the carriage; the foot reads in our italic
  const dress=()=>{const d=FD();if(!d||d.getElementById('wc-css'))return;const st=d.createElement('style');st.id='wc-css';
    st.textContent=`.topbar .tl>button,.topbar .tr>button,.topbar .chapter,.page-no{visibility:hidden!important;pointer-events:none!important}
      html body .footer #saveState,html body .footer .next-step .ns-label,html body .footer .next-step .ns-text,html body .footer #nsBook{font:italic 14px/1.3 Georgia,serif!important;letter-spacing:.01em!important}html body .footer #saveState{visibility:hidden!important}`;
    d.head.appendChild(st);
    d.addEventListener('keydown',e=>{if(e.key.length===1||e.key==='Enter'||e.key==='Backspace')typing(true);},true);
    d.addEventListener('input',()=>feed());d.addEventListener('selectionchange',()=>feed());};
  wc.addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(!b)return;e.stopPropagation();const c=b.dataset.c,d=FD();
    // in «Рукопись» the back key goes from an opened chapter to all the chapters, and from there back to writing
    if(c==='back'){if(document.documentElement.classList.contains('rk-on')){if(!window.OCHERKI_MANUSCRIPT?.back?.())window.OCHERKI_SET_MODE?.('write');}else d?.getElementById('backBtn')?.click();}
    else if(c==='mic')d?.getElementById('voiceBtn')?.click();
    else if(c==='aa')d?.getElementById('textBtn')?.click();
    else if(c==='tips')document.querySelector('.bd-rail-key[data-rail="tips"]')?.click();
    // v180: the page as it will lie in the book slides out from under the sheet (and back)
    else if(c==='music'){try{(window.parent!==window?window.parent:window).postMessage({type:'OCHERKI_AUDIO_COMMAND',action:'toggle'},'*');}catch(_){}}
    else if(c==='peek'){if(shell.classList.contains('wp-on'))document.querySelector('.wp-keys.k-open .back button')?.click();else document.querySelector('.wp-keys.k-closed .tog button')?.click();}
    else if(c==='add'){const r=b.getBoundingClientRect();add.style.left=Math.round(r.left-60)+'px';add.style.top=Math.round(r.bottom+10)+'px';add.classList.toggle('on');}});
  add.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;e.stopPropagation();add.classList.remove('on');
    try{FW()?.postMessage({type:'OCHERKI_SHEET_ACTION',act:b.dataset.a},'*');}catch(_){}});
  document.addEventListener('click',e=>{if(!add.contains(e.target)&&!wc.contains(e.target))add.classList.remove('on');});
  // it rides on the head of the sheet, wherever the sheet goes
  let lastKey='';
  // v220: in «Рукопись» the bar stays where it is (the sheet under it has gone off the screen; the bar does not follow it)
  const follow=()=>{requestAnimationFrame(follow);const rk=document.documentElement.classList.contains('rk-on')||document.documentElement.classList.contains('bk-on');const on=isWrite()||rk;wc.classList.toggle('on',on);if(rk){add.classList.remove('on');return;}if(!on){add.classList.remove('on');return;}
    const f=F(),d=FD();if(!f||!d)return;const sh=d.querySelector('.sheet.active');if(!sh)return;dress();if(shell.classList.contains('ws-off'))return;
    const fr=f.getBoundingClientRect();
    // v192: the sheet's place in the layout, not its animated box — a sheet that is being laid or swapped must not drag the bar
    let x=sh.offsetLeft,y=sh.offsetTop,e=sh.offsetParent;while(e&&e!==d.body){x+=e.offsetLeft+e.clientLeft-e.scrollLeft;y+=e.offsetTop+e.clientTop-e.scrollTop;e=e.offsetParent;}
    const L=fr.left+f.clientLeft+x,T=fr.top+f.clientTop+y,W=sh.offsetWidth;
    const k=[L,T,W].map(Math.round).join();if(k!==lastKey){lastKey=k;wc.style.left=Math.round(L-96)+'px';wc.style.top=Math.round(T-19)+'px';wc.style.width=Math.round(W+192)+'px';
      const R=document.documentElement.style;R.setProperty('--bar-l',Math.round(L-96)+'px');R.setProperty('--bar-t',Math.round(T-19)+'px');R.setProperty('--bar-w',Math.round(W+192)+'px');}};
  requestAnimationFrame(follow);
  // v183 — the lamp under the bar: its beam starts at the bar's own ends and spreads a third of the bar's width each way by the
  // foot of the screen; it lights up last, a moment after the bar has come
  const cone=document.querySelector('.desk-cone'),beam=cone?.querySelector('i'),clk=document.querySelector('.master-clock');
  let lit=false;
  const isBookQ=()=>shell.classList.contains('is-book-preview')&&document.body.classList.contains('oct-book')&&!!document.querySelector('.bq-car');
  const lamp=()=>{const night=shell.classList.contains('is-night'),ms=isMsQ(),bk=!ms&&isBookQ(),on=isWrite()||ms||bk;
    if(!lit&&on&&shell.classList.contains('oc-ready')&&document.documentElement.classList.contains('oc-shown')){lit=true;setTimeout(()=>shell.classList.add('oc-lit'),1300);}// v213: the lamp lights last, once the things on the desk have come
    const bar=ms?document.querySelector('.mq-car'):bk?document.querySelector('.bq-car'):wc;const r=bar.getBoundingClientRect(),W=innerWidth,H=innerHeight;if(!r.width||!beam)return;
    const x0=r.left+(ms?20:44),x1=r.right-(ms?20:44),y=r.top+r.height*.9,sp=r.width*(ms?.6:.3),P=(x,h)=>`${x}px ${h}px`;
    {const cp=`polygon(${P(Math.round(x0),Math.round(y))},${P(Math.round(x1),Math.round(y))},${P(Math.round(x1+sp),Math.round(H*1.04))},${P(Math.round(x0-sp),Math.round(H*1.04))})`;if(beam._cp!==cp){beam._cp=cp;beam.style.clipPath=cp;}}
    // v205: under the beam the desk's own toile is seen, warm, fading to dusk at the foot: a soft (blurred) mask of the beam's shape
    {const dl=document.querySelector('.desk-lit');if(dl){const pts=[[x0,y],[x1,y],[x1+sp,H*1.04],[x0-sp,H*1.04]].map(([a,b])=>Math.round(a)+','+Math.round(b)).join(' ');
      const k=pts+'|'+W+'x'+H;
      if(dl._k!==k){dl._k=k;const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${W}' height='${H}' viewBox='0 0 ${W} ${H}'><defs><filter id='b' x='-10%' y='-10%' width='120%' height='120%'><feGaussianBlur stdDeviation='26'/></filter><linearGradient id='g' x1='0' y1='0' x2='0' y2='1'><stop offset='${(y/H).toFixed(3)}' stop-color='#fff' stop-opacity='.95'/><stop offset='.5' stop-color='#fff' stop-opacity='.55'/><stop offset='.78' stop-color='#fff' stop-opacity='.14'/><stop offset='1' stop-color='#fff' stop-opacity='0'/></linearGradient></defs><polygon points='${pts}' fill='url(#g)' filter='url(#b)'/></svg>`;
        const u=`url("data:image/svg+xml,${encodeURIComponent(svg)}")`;dl.style.webkitMaskImage=dl.style.maskImage=u;}}}
    // v190: bright right under the bar, a short soft edge; the light falls on all that lies under it, the screen keys too
    const m=`linear-gradient(180deg,transparent ${Math.round(y-8)}px,#000 ${Math.round(y+26)}px)`;if(cone._m!==m){cone._m=m;cone.style.webkitMaskImage=cone.style.maskImage=m;}
    // «Как ляжет в книге»: the page is lit only where the beam falls — its right edge runs from the bar's end down and out
    const pg=document.querySelector('.wp-page'),lm=pg?.querySelector('.wp-lamp');
    if(lm&&shell.classList.contains('wp-on')){const q=pg.getBoundingClientRect();if(q.width){let dx=sp,dy=H*1.04-y;const l=Math.hypot(dx,dy);dx/=l;dy/=l;const nx=dy,ny=-dx,A=Math.atan2(nx,-ny),
        L=Math.abs(q.width*Math.sin(A))+Math.abs(q.height*Math.cos(A)),t=50+((x1-(q.left+q.width/2))*nx+(y-(q.top+q.height/2))*ny)/L*100;
      const bg=`linear-gradient(${(A*180/Math.PI).toFixed(1)}deg,rgba(150,100,50,.14) ${(t-4).toFixed(1)}%,rgba(110,74,42,.5) ${(t+14).toFixed(1)}%,rgba(46,28,12,.66) ${(t+38).toFixed(1)}%),linear-gradient(180deg,rgba(160,105,50,.06) 0%,rgba(140,90,42,.26) 50%,rgba(95,60,28,.52) 100%)`;if(lm._bg!==bg){lm._bg=bg;lm.style.background=bg;}}}
    // v199: the book on the desk is lit by the same beam — its middle under the bar bright, both its sides beyond the beam's edges dusky
    const bq=document.querySelector('.bq-book'),bl=bq?.querySelector('.bq-lamp');
    if(bl&&night&&bk&&!bq.classList.contains('is-curling')){const q=bq.getBoundingClientRect();if(q.width){const edge=(ex,dxs)=>{let dx=dxs,dy=H*1.04-y;const l=Math.hypot(dx,dy);dx/=l;dy/=l;const nx=dxs>0?dy:-dy,ny=dxs>0?-dx:dx,A=Math.atan2(nx,-ny),
          L=Math.abs(q.width*Math.sin(A))+Math.abs(q.height*Math.cos(A)),t=50+((ex-(q.left+q.width/2))*nx+(y-(q.top+q.height/2))*ny)/L*100;
          return `linear-gradient(${(A*180/Math.PI).toFixed(1)}deg,rgba(20,10,2,0) ${(t-6).toFixed(1)}%,rgba(20,10,2,.4) ${(t+8).toFixed(1)}%,rgba(14,7,2,.62) ${(t+26).toFixed(1)}%)`;};
        const bg=edge(x1,sp)+','+edge(x0,-sp)+',radial-gradient(ellipse 70% 95% at 50% 0%,rgba(20,10,2,0) 0%,rgba(20,10,2,.1) 45%,rgba(20,10,2,.36) 100%)';// the book lit by the beam itself: the sides beyond its diagonal edges in the dusk, the foot a little dimmer
       if(bl._bg!==bg){bl._bg=bg;bl.style.background=bg;}}}
    // v197: the clean stack on the left is lit the same way — only where the beam falls, its left edge running from the bar's
    // other end down and out (the same light as on the book's page, mirrored)
    const wl=document.querySelector('.ws-left');
    if(wl&&shell.classList.contains('oc-ws')){const q=wl.getBoundingClientRect();if(q.width){let dx=-sp,dy=H*1.04-y;const l=Math.hypot(dx,dy);dx/=l;dy/=l;const nx=-dy,ny=dx,A=Math.atan2(nx,-ny),
        L=Math.abs(q.width*Math.sin(A))+Math.abs(q.height*Math.cos(A)),t=50+((x0-(q.left+q.width/2))*nx+(y-(q.top+q.height/2))*ny)/L*100;
      const bg=`linear-gradient(${(A*180/Math.PI).toFixed(1)}deg,rgba(150,100,50,.14) ${(t-4).toFixed(1)}%,rgba(110,74,42,.5) ${(t+14).toFixed(1)}%,rgba(46,28,12,.66) ${(t+38).toFixed(1)}%),linear-gradient(180deg,rgba(160,105,50,.06) 0%,rgba(140,90,42,.26) 50%,rgba(95,60,28,.52) 100%)`;if(wl._bg!==bg){wl._bg=bg;wl.style.setProperty('--ws-nbg',bg);}}}
    // v186: the clock keeps its own look at night (it hardly lies in the beam)
    if(clk&&clk.style.maskImage){clk.style.webkitMaskImage=clk.style.maskImage='';}};
  // every frame: the light keeps to the bar and to the page while they move (no steps, no blinking)
  // (every frame only while something moves — the bar, the page, the keys; otherwise a few times a second)
  let busyTill=0,fr=0,lampKey='',kick=true;new MutationObserver(()=>{kick=true;}).observe(shell,{attributes:true,attributeFilter:['class']});
  requestAnimationFrame(function loop(t){requestAnimationFrame(loop);const r=(isMsQ()?document.querySelector('.mq-car'):wc)?.getBoundingClientRect();
    // v221: the book's page and the stack count too — while either moves the beam on them is laid every frame (it caught up in steps)
    const pq=document.querySelector('.wp-page')?.getBoundingClientRect(),lq=document.querySelector('.ws-left')?.getBoundingClientRect();
    const k=(r?`${Math.round(r.left)},${Math.round(r.top)},${Math.round(r.width)}`:'')+(pq?`|${Math.round(pq.left)},${Math.round(pq.top)},${Math.round(pq.width)}`:'')+(lq?`|${Math.round(lq.left)},${Math.round(lq.top)}`:'');if(k!==lampKey||kick){lampKey=k;kick=false;busyTill=t+2200;}
    if(t<busyTill||++fr%15===0)lamp();});
  // what it says: where we are, «до книги», saved
  // v211: the name over the sheet — the name written for a document or an episode; without one, «Эпизод N · документ» (the
  // empty «Архивный документ» / «Новый эпизод» read as mistakes)
  const barName=d=>{const raw=(d?.querySelector('.topbar .chapter')?.textContent||'').trim();try{const W=F()?.contentWindow,pg=W?.currentPage?.();if(!pg)return raw;
      const ep=String(pg.episode||'').match(/^Эпизод\s*\d+/)?.[0]||'',t=String(pg.title||'').trim();
      if(pg.type==='document')return t&&t!=='Архивный документ'?t:[ep,'документ'].filter(Boolean).join(' · ');
      if(t==='Новый эпизод')return ep||raw;}catch(_){}return raw;};
  // the bar follows day and night everywhere it stands (in «Рукопись» too); the rest only while writing
  const tick=()=>{wc.classList.toggle('night',shell.classList.contains('is-night'));if(!isWrite())return;wc.querySelector('[data-c="peek"]')?.classList.toggle('on',shell.classList.contains('wp-on'));const d=FD();
    const ch=barName(d),n=(d?.getElementById('pageNo')?.textContent||'').trim(),all=(document.getElementById('pageCount')?.textContent||'').trim();
    // v212: names in italic, the rest upright — «Глава 5 · Какой он был человек · лист 3 из 36»
    const esc=x=>String(x).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));const cm=ch.match(/^(Глава\s+\d+)\.?\s*(.*)$/);
    const ED='<button type="button" class="ed" aria-label="Изменить название" data-tip="изменить название"><svg viewBox="0 0 24 24"><path d="M4 20l1-4L16 5l3 3L8 19z"/><path d="M14 7l3 3"/></svg></button>';
    const nm=cm?`<span class="up">${esc(cm[1])}</span>${cm[2]?` · <i>${esc(cm[2])}</i>${ED}`:''}`:(/·/.test(ch)?`<span class="up">${esc(ch)}</span>`:(ch?`<i>${esc(ch)}</i>${ED}`:''));
    const t=[nm,n&&all?`<span class="up">лист ${n} из ${all}</span>`:''].filter(Boolean).join(' · ');const te=wc.querySelector('.t b');if(te._h!==t&&!te.querySelector('[contenteditable]')){te._h=t;te.innerHTML=t;}
    const tk=document.querySelector('.bd-rail-key[data-rail="tips"]');const m=(tk?.getAttribute('aria-label')||'').match(/(\d+)/);const em=wc.querySelector('[data-c="tips"] em');em.textContent=m?m[1]:'';wc.querySelector('[data-c="tips"]').classList.toggle('on',!!m);
    const ss=(d?.getElementById('saveState')?.textContent||'');const dot=wc.querySelector('.sv');dot.classList.toggle('busy',/Сохраня/i.test(ss));dot.title=ss||'Черновик сохранён';};
  setInterval(tick,500);
  // v213: the name lies between «назад» and the keys, never under them; too long, it ends in «…»
  {const room=()=>{const r=wc.getBoundingClientRect();if(!r.width)return;const bk=wc.querySelector('[data-c="back"]').getBoundingClientRect(),mic=wc.querySelector('[data-c="mic"]').getBoundingClientRect();
      const m=Math.round(Math.max(bk.right-r.left,r.right-mic.left)+10),L=m+'px',R=m+'px',pad=L+R;// v228: the same room on both sides — the title stands in the bar's middle (it stood left of it)
      const t=wc.querySelector('.t');if(t._p!==pad){t._p=pad;t.style.setProperty('left',L,'important');t.style.setProperty('right',R,'important');}};
    addEventListener('resize',room);setInterval(room,1000);room();}
  // v212: the name of the chapter (or of the sheet) is changed right in the bar — a press on it, Enter to keep, Esc to leave
  wc.querySelector('.t b').addEventListener('click',e=>{const ed=e.target.closest('.ed');const i=ed?ed.previousElementSibling:e.target.closest('i');if(!i||i.tagName!=='I'||i.isContentEditable)return;e.stopPropagation();
    i.contentEditable='true';i.spellcheck=false;i.focus();const r=document.createRange();r.selectNodeContents(i);const sel=getSelection();sel.removeAllRanges();sel.addRange(r);
    const done=keep=>{i.removeEventListener('blur',onBlur);i.contentEditable='false';const v=i.textContent.trim();wc.querySelector('.t b')._h='';if(keep&&v)try{F()?.contentWindow?.OC_SHEET?.renameChapter(v);}catch(_){}tick();};
    const onBlur=()=>done(true);i.addEventListener('blur',onBlur);
    i.addEventListener('keydown',k=>{k.stopPropagation();if(k.key==='Enter'){k.preventDefault();i.blur();}if(k.key==='Escape'){k.preventDefault();i.removeEventListener('blur',onBlur);done(false);}});});
  // the keyboard: it comes up with the first key, the sheet steps up to make room, then all goes back after a pause
  const typing=on=>{if(on&&!isWrite())return;if(on&&!shell.classList.contains('wc-typing')){lift();requestAnimationFrame(()=>{if(isWrite())shell.classList.add('wc-typing');});return;}shell.classList.toggle('wc-typing',on);if(on)lift();};
  const lift=()=>{const kb=document.getElementById('editorKeyboardWrap'),f=F(),d=FD();if(!kb||!f||!d)return;const sh=d.querySelector('.sheet.active');if(!sh)return;
    const R=document.documentElement.style;
    const s=Math.max(.5,Math.min(1,(innerWidth*.72)/(kb.offsetWidth||1080),(innerHeight*.34)/(kb.offsetHeight||258)));R.setProperty('--wkb',s.toFixed(3));
    // where the keyboard really stands (its stage is transformed): measure it in place, then bring its foot to the bottom of the screen, centred
    const was=kb.style.transition;kb.style.setProperty('transition','none','important');kb.style.setProperty('translate','0px 0px','important');
    const r0=kb.getBoundingClientRect();kb.style.removeProperty('translate');void kb.offsetWidth;kb.style.transition=was;
    R.setProperty('--wkx',Math.round(innerWidth/2-(r0.left+r0.width/2))+'px');R.setProperty('--wky',Math.round(innerHeight-10-r0.bottom)+'px');
    kbTop=innerHeight-10-r0.height*1;feed();};
  // as on a typewriter: the line being typed stays at one height just above the keys, the paper rolls up
  let kbTop=0,feedRaf=0;
  const feed=()=>{if(feedRaf)return;feedRaf=requestAnimationFrame(()=>{feedRaf=0;if(!shell.classList.contains('wc-typing'))return;const f=F(),d=FD();if(!f||!d)return;
    const fr=f.getBoundingClientRect(),mt=parseFloat(getComputedStyle(f).marginTop)||0;let y=null;
    try{const sel=d.getSelection();if(sel&&sel.rangeCount){const rg=sel.getRangeAt(0).cloneRange();rg.collapse(true);const rc=rg.getClientRects()[0]||rg.startContainer.parentElement?.getBoundingClientRect?.();if(rc&&rc.height)y=rc.bottom;}}catch(_){}
    if(y==null){const sh=d.querySelector('.sheet.active');if(!sh)return;y=sh.getBoundingClientRect().top+120;}
    const natural=fr.top-mt+y,line=kbTop-28;document.documentElement.style.setProperty('--wlift',Math.round(Math.max(0,natural-line))+'px');});};
  addEventListener('message',e=>{const d=e.data||{};if(d.type==='OCHERKI_PHYSICAL_KEY'&&d.phase==='down'){typing(true);setTimeout(feed,30);}});
  document.addEventListener('keydown',e=>{if(e.key.length===1||e.key==='Enter'||e.key==='Backspace')typing(true);});
  new MutationObserver(()=>{if(shell.classList.contains('is-keyboard-resting')||!isWrite())typing(false);}).observe(shell,{attributes:true,attributeFilter:['class']});
  addEventListener('resize',()=>{if(shell.classList.contains('wc-typing'))lift();});
  // the Keeper in the corner: once, he says what this place is for; a click on him says it again
  // v170: the same Keeper says one thing on «Писать» and one on «Рукопись», each once
  const isMsQ=()=>shell.classList.contains('is-manuscript')&&!!document.querySelector('.ms-screen.on');
  const where=()=>isWrite()&&!shell.classList.contains('wc-typing')?'w':isMsQ()?'m':window.OcherkiBookcase?.isOpen?.()?'b':'';
  const HKS={w:'ocherkiWriteHints',m:'ocherkiMsHints',b:'ocherkiShelfHints'},HINTS={w:'',m:'Крутите колёсико — пойдёте по главам дальше. Фото — на кнопке с фотоаппаратом',b:'Нажмите на книгу — откроется её карточка. Колёсико — листать полку'};
  let HK=HKS.w,HINT=HINTS.w;
  const wk=document.createElement('div');wk.className='wk';wk.innerHTML='<canvas></canvas>';document.body.appendChild(wk);
  const hint=document.createElement('div');hint.className='wk-hint';document.body.appendChild(hint);
  let K=null,ht=0;
  // v221: on «Писать» the Keeper says nothing (its line in the corner was in the way of the clock)
  const say=force=>{if(!HINT){rest();return;}let m={};try{m=JSON.parse(localStorage.getItem(HK)||'{}');}catch(_){}if(!force&&(m.off||m.seen))return;m.seen=1;try{localStorage.setItem(HK,JSON.stringify(m));}catch(_){}
    hint.innerHTML=HINT.split(' ').map((w,i)=>`<span style="--i:${i}">${w}</span>`).join(' ')+'<u data-off>больше не показывать</u>';hint.classList.remove('on');void hint.offsetWidth;hint.classList.add('on');
    try{K?.setMode('idle');setTimeout(()=>{K?.talk(2400);K?.mood?.('joy',2000);},400);}catch(_){}clearTimeout(ht);ht=setTimeout(()=>{hint.classList.remove('on');rest();},9000);};
  const rest=()=>{try{K?.flyAway(0,-.15);}catch(_){}};
  hint.addEventListener('click',e=>{if(e.target.closest('[data-off]')){try{localStorage.setItem(HK,JSON.stringify({off:1,seen:1}));}catch(_){}hint.classList.remove('on');}});
  wk.querySelector('canvas').addEventListener('click',()=>say(true));
  const show=()=>{const w=where(),on=!!w;wk.classList.toggle('on',on&&!!K);if(!on)hint.classList.remove('on');
    if(w&&w!==show.w){show.w=w;HK=HKS[w];HINT=HINTS[w];show.said=0;hint.classList.remove('on');}
    if(on&&K&&!show.said){show.said=1;setTimeout(()=>{let m={};try{m=JSON.parse(localStorage.getItem(HK)||'{}');}catch(_){}if(m.off||m.seen)rest();else say(false);},1800);}};
  setInterval(show,600);
  const boot=()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const L=window.OcherkiTour?.loadKeeper;if(!L){setTimeout(boot,1500);return;}
    L().then(()=>{if(K||!window.OcherkiKeeper3D)return;K=OcherkiKeeper3D.create(wk.querySelector('canvas'),{size:1.05,dust:8,quick:1.6});if(K){K.start();K.resize?.();}}).catch(()=>{});};
  setTimeout(boot,4000);
})();


// ——— write-v119-js
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  const modal=document.getElementById('bookPreviewModal');
  const qk=document.createElement('button');qk.type='button';qk.className='oc-qk';qk.setAttribute('aria-label','Другой вопрос');qk.innerHTML='<span>?</span>';
  const acts=document.querySelector('#writingPrompt .writing-prompt-actions');if(acts)acts.appendChild(qk);
  qk.addEventListener('click',e=>{e.stopPropagation();document.getElementById('writingPromptNext')?.click();});
  // v228: «Рукопись» lies on the same desk — the desk keeps its places (the clock, the signature) while it is open
  const isWrite=()=>shell.classList.contains('is-open')&&!shell.classList.contains('is-start-screen')&&(!shell.classList.contains('is-manuscript')||document.documentElement.classList.contains('rk-on'))&&!modal?.classList.contains('open');
  const root=document.documentElement.style;
  let last='';
  function layout(){const on=isWrite();shell.classList.toggle('oc-w',on);if(!on)return;
    const ed=document.querySelector('.editor-paper')?.getBoundingClientRect();if(!ed||ed.width<200)return;
    const sh=parseFloat(getComputedStyle(document.getElementById('editorPaperWrap')||document.body).translate)||0;
    const L=ed.left-sh,R=ed.right-sh,T=Math.max(ed.top,60),H=Math.min(ed.height,innerHeight-T);
    // one proportion for the whole desk: a laptop sees the same picture, only smaller
    const K=Math.max(.6,Math.min(1,innerHeight/1080,innerWidth/1920));root.setProperty('--oc-k',K.toFixed(3));
    const key=[L,R,T,H,innerWidth].map(Math.round).join();
    root.setProperty('--oc-qx',Math.round(L/2)+'px');root.setProperty('--oc-qy',Math.round(T+H/2)+'px');
    // the two keys over the sheet
    const mid=(L+R)/2;root.setProperty('--oc-ky','30px');// the three keys over the sheet share its free width evenly, clear of the top bar on a small screen
    {let r0=0;document.querySelectorAll('.oct[role="navigation"] .row .k,.oct[role="navigation"] .lbx').forEach(k=>{const r=k.getBoundingClientRect();if(r.width&&r.top<140)r0=Math.max(r0,r.right);});
     // v142: equal margins at both edges of the sheet and equal gaps between the three keys, measured with their labels
     const left=Math.max(L+46,r0+28),right=R-150,span=Math.max(240,right-left);
     {const l=document.querySelector('.wp-keys.k-closed .lab');if(l)l.textContent=span<560?'в книге':'показать в книге';}
     // each key with its label: beside it when the sheet is wide enough, under it when it is narrow
     const G=[['.wp-keys.k-closed','.wp-keys.k-closed .key','.wp-keys.k-closed .lab'],['.book-design-shell.is-rail','.bd-rail-key[data-rail="tips"]','.book-design-shell.is-rail .oc-klab'],['.oc-add2','.oc-add2 [data-a="add"]','.oc-add2 .it.main .lab']]
       .map(([g,k,l])=>{const ge=document.querySelector(g),ke=document.querySelector(k),le=document.querySelector(l);if(!ge||!ke||!le)return null;const kr=ke.getBoundingClientRect();
         return{off:kr.left-ge.getBoundingClientRect().left,kw:kr.width,lw:le.scrollWidth||le.getBoundingClientRect().width};});
     const fit=tight=>{const W=G.map(g=>tight?Math.max(g.kw,g.lw):g.kw+10+g.lw);const free=(R-L)-W.reduce((x,y)=>x+y,0);let side=free/4,gap=free/4;const need=r0+28-L;if(side<need){side=need;gap=(free-2*side)/2;}return{W,side,gap};};
     if(G.every(Boolean)){let tight=false,f=fit(false);if(f.gap<18){tight=true;f=fit(true);}
       shell.classList.toggle('oc-ktight',tight);
       if(f.gap>=10){let x=L+f.side;['--oc-k1x','--oc-k2x','--oc-k3x'].forEach((v,i)=>{const g=G[i],lead=tight?(f.W[i]-g.kw)/2:0;root.setProperty(v,Math.round(x+lead-g.off)+'px');x+=f.W[i]+f.gap;});}
       else{root.setProperty('--oc-k1x',Math.round(left)+'px');root.setProperty('--oc-k2x',Math.round(left+span*.46)+'px');root.setProperty('--oc-k3x',Math.round(left+span*.86)+'px');}}
     else{root.setProperty('--oc-k1x',Math.round(left)+'px');root.setProperty('--oc-k2x',Math.round(left+span*.46)+'px');root.setProperty('--oc-k3x',Math.round(left+span*.86)+'px');}}
    if(key!==last){last=key;}}
  const kick=()=>requestAnimationFrame(layout);
  new MutationObserver(kick).observe(shell,{attributes:true,attributeFilter:['class']});
  if(modal)new MutationObserver(kick).observe(modal,{attributes:true,attributeFilter:['class']});
  const pt=document.getElementById('projectTitle');if(pt)new MutationObserver(kick).observe(pt,{childList:true,characterData:true,subtree:true});
  const pc=document.getElementById('pageCount');if(pc)new MutationObserver(kick).observe(pc,{childList:true,characterData:true,subtree:true});
  addEventListener('resize',kick);setInterval(layout,1500);[400,1500,3500,7000].forEach(t=>setTimeout(layout,t));

})();


// ——— write-add-v141-js
// v141 — «добавить» is the third key over the sheet, made like «показать в книге» and «До книги» and hung at the same height;
// its choices open to the right, along the top edge, never over the white page
(()=>{const shell=document.querySelector('.shell');if(!shell)return;const T=()=>window.OCHERKI_TOPBAR;
  const S='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">',E='</svg>';
  const IC={add:'<path d="M12 5v14M5 12h14"/>',photo:'<rect x="3" y="6" width="18" height="13" rx="1.5"/><circle cx="12" cy="12.5" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/>',
    episode:'<path d="M7 3h10v18l-5-4-5 4z"/>',document:'<path d="M6 3h9l3 3v15H6z"/><path d="M9 9h6M9 13h6M9 17h4"/>',quote:'<path d="M5 17c2.5-1 4-3 4-6V7H5v4h3M13 17c2.5-1 4-3 4-6V7h-4v4h3"/>',
    date:'<rect x="4" y="5" width="16" height="15" rx="1.5"/><path d="M4 10h16M8 3v4M16 3v4"/>',page:'<path d="M6 3h8l4 4v14H6Z"/><path d="M14 3v4h4"/>'};
  const L=[['photo','фото'],['episode','эпизод'],['document','документ'],['quote','цитата'],['date','дата'],['page','лист']];
  const box=document.createElement('div');box.className='oc-add2';
  box.innerHTML=`<div class="it main"><button type="button" class="key" data-a="add" aria-label="Добавить"><i class="oc-thr"></i><span class="cap">${S}${IC.add}${E}</span></button><span class="lab">добавить</span></div><div class="row"></div>`;
  shell.appendChild(box);
  const row=box.querySelector('.row');let hidden={};
  const draw=()=>{row.innerHTML=L.filter(m=>!hidden[m[0]]).map((m,i)=>`<div class="it sm" style="--i:${i}"><button type="button" class="key" data-a="${m[0]}" aria-label="${m[1]}"><span class="cap">${S}${IC[m[0]]}${E}</span></button><span class="lab">${m[1]}</span></div>`).join('');};
  draw();
  const key=box.querySelector('[data-a="add"]');const hang=()=>{const a=T()?.attach;if(!a){setTimeout(hang,500);return;}key.style.transformOrigin='50% calc(-1 * var(--oc-ky,30px))';a(key);};hang();
  let closeT=0;const open=on=>{clearTimeout(closeT);if(on&&!box.classList.contains('open')){draw();void row.offsetWidth;document.dispatchEvent(new CustomEvent('oc-cascade',{detail:box}));}box.classList.toggle('open',on);};
  document.addEventListener('oc-cascade',e=>{if(e.detail!==box&&box.classList.contains('open')){clearTimeout(closeT);box.classList.remove('open');}});
  box.addEventListener('pointerenter',()=>open(true));
  box.addEventListener('pointerleave',()=>{clearTimeout(closeT);closeT=setTimeout(()=>open(false),700);});
  box.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;e.stopPropagation();const a=b.dataset.a;
    if(a==='add'){open(!box.classList.contains('open'));return;}
    open(false);try{document.getElementById('v35SheetFrame')?.contentWindow?.postMessage({type:'OCHERKI_SHEET_ACTION',act:a},'*');}catch(_){}});
  document.addEventListener('click',e=>{if(!box.contains(e.target))open(false);});
  addEventListener('message',e=>{const d=e.data||{};if(d.type==='OCHERKI_SHEET_TOOLS'&&d.hidden){const k=JSON.stringify(d.hidden);if(k===box._hk)return;box._hk=k;hidden=d.hidden;if(!box.classList.contains('open'))draw();}});/* v143: the editor sends this on every key; redraw only on a real change */
})();


// ——— v125-js
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  // threads that belong to the keys
  const thr=()=>{let ok=0;[document.querySelector('.wp-keys.k-closed .key'),document.querySelector('.bd-rail-key[data-rail="tips"]')].forEach(k=>{if(k){ok++;if(!k.querySelector('.oc-thr')){const t=document.createElement('i');t.className='oc-thr';k.prepend(t);}}});if(ok<2)setTimeout(thr,700);};thr();
  // the first opening: one turn of the second hand backwards, the years dissolving behind it
  // v141: the years come out from under the second hand. Ahead of the hand there is nothing; as it passes a place,
  // a year shows through there, brightens, and fades again as the hand moves on — one full turn, the first time only.
  let done=false,wait=0;const years=()=>{if(done||!shell.classList.contains('oc-ready')||!shell.classList.contains('oc-w'))return;
    const pv=document.querySelector('.bottom-left .clock-pivot');const pr=pv?.getBoundingClientRect();
    const mc=document.querySelector('.bottom-left .master-clock');const vis=mc&&+getComputedStyle(mc).opacity>.9;
    if(!pr||!pr.width||!vis){clearTimeout(wait);wait=setTimeout(years,400);return;}done=true;
    const KS=+(mc.dataset.k||1),R=142*KS,N=12,Y0=new Date().getFullYear(),STEP=Math.max(1,Math.round((Y0-1950)/N));
    const box=document.createElement('div');box.className='oc-years';shell.after(box);
    /* v143: the pivot is measured once (and on resize), never in every frame: a measurement per frame forced a full layout of the page 60 times a second */
    let placed=0;const place=(force)=>{const now=performance.now();if(!force&&now-placed<1000)return;placed=now;const r=pv.getBoundingClientRect();box.style.left=(r.left+r.width/2)+'px';box.style.top=(r.top+r.height/2)+'px';};place(true);addEventListener('resize',()=>place(true));
    const handDeg=()=>{const d=new Date();const sec=d.getSeconds()+d.getMilliseconds()/1000;return -90-sec*6;};   // the real second hand, counter-clockwise
    const start=handDeg();
    // twelve places on the dial, from where the hand is now, in the direction it moves
    const marks=[...Array(N)].map((_,k)=>{const i=document.createElement('i');i.textContent=Y0-k*STEP;i.style.animation='none';i.style.opacity='0';box.appendChild(i);return{el:i,at:-(k+.5)*(360/N)};});
    const t0=performance.now();
    const step=now=>{place();const gone=Math.min(360,Math.max(0,start-handDeg()+(start-handDeg()<-1?360:0)));   // degrees the hand has travelled
      marks.forEach(m=>{const d=gone+m.at;   // >0: the hand has passed this place by d degrees
        const o=d<=0?0:d<8?d/8:Math.max(0,1-(d-8)/40);/* v142: a year lives ~48°, never more than two at once */const a=(start+m.at)*Math.PI/180;
        const op=o.toFixed(2);if(op==='0.00'&&m.o==='0.00')return;m.o=op;m.el.style.left=Math.round(Math.cos(a)*R)+'px';m.el.style.top=Math.round(Math.sin(a)*R)+'px';m.el.style.opacity=op;
        m.el.style.textShadow=o>.6?`0 0 ${Math.round(8*o)}px rgba(255,190,110,${(o*.8).toFixed(2)})`:'none';});
      if(now-t0<64000&&shell.classList.contains('oc-w'))requestAnimationFrame(step);else box.remove();};
    requestAnimationFrame(step);};
  new MutationObserver(years).observe(shell,{attributes:true,attributeFilter:['class']});
})();


// ——— clock-in-v140-js
(()=>{const shell=document.querySelector('.shell');if(!shell)return;let was=false;
  new MutationObserver(()=>{const on=shell.classList.contains('oc-w')&&shell.classList.contains('oc-ready');if(on&&!was){const mc=document.querySelector('.bottom-left .master-clock');if(mc){mc.classList.remove('oc-clk-in');void mc.offsetWidth;mc.classList.add('oc-clk-in');}}was=on;}).observe(shell,{attributes:true,attributeFilter:['class']});})();


// ——— write-desk
// v195 — the desk of three sheets: on the left a stack of clean sheets (the chapter's question written on the top one; it is
// taken by the hand and laid on the desk), in the middle the sheet being written, on the right the page as it will lie in the
// book. By day the window's sun falls from the left — on the clean sheets and the edge of the open one; the book's page lies
// in the room's shade. At night the lamp under the bar lights the middle; the stacks at the sides lie in its half-light.
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  const F=()=>document.getElementById('v35SheetFrame');const FW=()=>F()?.contentWindow;const FD=()=>{try{return F()?.contentDocument;}catch(_){return null;}};
  const wrapEl=()=>document.getElementById('editorPaperWrap');
  // v207: a sheet taken from the stack rustles, and again, softly, as it is laid down (the start page's sound of paper, which
  // knows whether sounds are on; on its own the constructor plays the same file)
  const paperFx=v=>{try{const P=window.parent!==window?window.parent.OcherkiFX:null;if(P){P.play('page',v);return;}const a=new Audio('assets/audio/page.mp3');a.volume=v;a.play().catch(()=>{});}catch(_){}};
  // v205: where a sheet laid down comes to rest — the open sheet's own box (it lies under the bar's edge), not its wrapper's
  const sheetRect=()=>{try{const f=document.getElementById('v35SheetFrame'),fr=f.getBoundingClientRect(),a=f.contentDocument.getElementById('activeSheet'),q=a&&a.getBoundingClientRect();
      if(q&&q.width)return {left:fr.left+q.left,top:fr.top+q.top,width:q.width,height:q.height,right:fr.left+q.right,bottom:fr.top+q.bottom};}catch(_){}return wrapEl().getBoundingClientRect();};
  const RATIO=667/944;
  const isWrite=()=>shell.classList.contains('oc-w')&&shell.classList.contains('is-open')&&shell.classList.contains('oc-ready')&&(!shell.classList.contains('is-manuscript')||document.documentElement.classList.contains('rk-on'))&&!['is-book-preview','is-start-screen','is-ms-to-book'].some(c=>shell.classList.contains(c))&&!document.getElementById('bookPreviewModal')?.classList.contains('open')&&!window.OcherkiBookcase?.isOpen?.()&&!window.OcherkiArchive?.isOpen;
  // the place of the clean stack: as tall as the book's page, centred in the free room left of the sheet
  const leftBox=()=>{const w=wrapEl();if(!w)return null;const r=w.getBoundingClientRect();if(!r.width)return null;const sh=parseFloat(getComputedStyle(w).translate)||0;const L=r.left-sh;
    // v220: the stack lies as far from the sheet as the book's page does on the other side (it used to sit in the middle of the
    // free room: on a wide screen it went out of the lamp's beam); the clock stands under it, centred
    // v223: the stack's top (and so its tabs, and the book's plate on the right) stays where it always stood; it is a little
    // shorter than it was, so the clock under it has room
    const GAP=108;let h=r.height*.52,ww=h*RATIO;const avail=L-GAP-Math.max(20,L*.06);if(ww>avail){ww=avail;h=ww/RATIO;}if(ww<110)return null;
    return {left:Math.round(L-GAP-ww),top:Math.round(r.top+r.height*.21+14),w:Math.round(ww),h:Math.round(h)};};
  window.__ocWsRoom=()=>shell.classList.contains('oc-w')&&!!leftBox();

  // ——— the window's sun: one picture of the panes (the frame between them simply gets no sun — one even shade, no darker crossings)
  const PANES=()=>{const o=[];const W=300,H=330,G=26,x0=-130,y0=-300;for(let c=0;c<3;c++)for(let r=0;r<4;r++)o.push(`<rect x="${x0+c*(W+G)}" y="${y0+r*(H+G)}" width="${W}" height="${H}"/>`);return o.join('');};
  const SKEW='matrix(1,0.36,-0.13,1,0,0)';
  const svgUrl=s=>'url("data:image/svg+xml,'+encodeURIComponent(s).replace(/'/g,'%27')+'")';
  const SUN=svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" preserveAspectRatio="none"><defs><filter id="b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter></defs><g filter="url(#b)" fill="rgb(255,216,156)" fill-opacity=".74" transform="${SKEW}">${PANES()}</g></svg>`);
  // the same window as shade, for paper and ink (multiplied): the shade everywhere except where the sun falls
  const SHADE=col=>svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" preserveAspectRatio="none"><defs><filter id="b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter><mask id="m"><rect width="1920" height="1080" fill="#fff"/><g filter="url(#b)" fill="#000" transform="${SKEW}">${PANES()}</g></mask></defs><rect width="1920" height="1080" fill="${col}" mask="url(#m)"/></svg>`);
  const SHADE_PAPER=SHADE('rgb(238,230,218)');
  document.documentElement.style.setProperty('--ws-sun',SUN);document.documentElement.style.setProperty('--ws-shade',SHADE_PAPER);
  // v243 — the evening's window: the same window and the same slant, the sun low — every pane drawn long across the desk; its light
  // warm and softer; the room outside it dimmer. It lies over the day's in its own layers (and fades in over them)
  const EK=2.0,PANES_E=()=>{const o=[];const W=300*EK,H=330,G=26,x0=-130-(EK-1)*120,y0=-300;for(let c=0;c<3;c++)for(let r=0;r<4;r++)o.push(`<rect x="${x0+c*(W+G*EK)}" y="${y0+r*(H+G)}" width="${W}" height="${H}"/>`);return o.join('');};
  const FALL='<linearGradient id="f" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fff" stop-opacity=".85"/><stop offset=".92" stop-color="#fff" stop-opacity="0"/></linearGradient><mask id="fm"><rect width="1920" height="1080" fill="url(#f)"/></mask>';
  const BLUR='<filter id="b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="9"/></filter>';
  const SUN_E=svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" preserveAspectRatio="none"><defs>${FALL}${BLUR}</defs><g mask="url(#fm)"><g filter="url(#b)" fill="rgb(255,160,70)" fill-opacity=".5" transform="${SKEW}">${PANES_E()}</g></g></svg>`);
  // (a pair of colours: the room grows dimmer towards its far side, away from the window — the paper there lies in the evening's dusk)
  const OUT_E=col=>{const g=Array.isArray(col)?`<linearGradient id="r" x1="0" x2="1" y1="0" y2="0"><stop offset=".42" stop-color="${col[0]}"/><stop offset="1" stop-color="${col[1]}"/></linearGradient>`:'';
    return svgUrl(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1920 1080" preserveAspectRatio="none"><defs>${FALL}${BLUR}${g}<mask id="m"><rect width="1920" height="1080" fill="#fff"/><g mask="url(#fm)"><g filter="url(#b)" fill="#000" transform="${SKEW}">${PANES_E()}</g></g></mask></defs><rect width="1920" height="1080" fill="${g?'url(#r)':col}" mask="url(#m)"/></svg>`);};
  const SHADE_E=OUT_E(['rgb(212,184,154)','rgb(164,130,100)']);
  {const R=document.documentElement.style;R.setProperty('--ws-sun-e',SUN_E);R.setProperty('--ws-shade-e',SHADE_E);R.setProperty('--ws-veil-e',OUT_E('rgb(166,128,94)'));
    // the desk's own evening layer, over the day's desk (it fades in over it)
    const dd=document.querySelector('.desk-day');if(dd&&!document.querySelector('.desk-eve')){const de=document.createElement('i');de.className='desk-eve';dd.after(de);}}
  // v213: the same shade as a veil (for what lies in its own 3D layer, where a multiplied shade cannot reach: the photograph's card)
  document.documentElement.style.setProperty('--ws-shade-a',SHADE('rgba(96,66,36,.16)'));

  // ——— the clean stack
  const left=document.createElement('div');left.className='ws-left';left.setAttribute('aria-label','Чистые листы');
  const TI={page:'<path d="M6 3h8l4 4v14H6Z"/><path d="M14 3v4h4"/>',episode:'<path d="M7 3h10v18l-5-4-5 4z"/>',document:'<path d="M6 3h9l3 3v15H6z"/><path d="M9 9h6M9 13h6M9 17h4"/>',photo:'<rect x="3" y="6" width="18" height="13" rx="1.5"/><circle cx="12" cy="12.5" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/>'};
  // v197: the kinds of a clean sheet are chosen on a small brass bar over the stack, the same make as the big one
  const tabs=`<div class="ws-tabs" role="tablist"><i class="nf"></i>${[['page','лист'],['episode','эпизод'],['document','документ'],['photo','фото']].map(([k,l],i)=>`<button type="button" role="tab" data-t="${k}" class="${i?'':'on'}"><svg viewBox="0 0 24 24">${TI[k]}</svg><span>${l}</span></button>`).join('')}</div>`;
  left.innerHTML=tabs+`<i class="ws-s ws-s3"><i class="ws-lt"><b class="ws-e"></b></i></i><i class="ws-s ws-s2"><i class="ws-lt"><b class="ws-e"></b></i></i>
    <div class="ws-s ws-top" title="Потяните лист на стол"><i class="ws-lt"><b class="ws-e"></b></i>
      <div class="ws-nav"><span class="ws-cnt"></span><button type="button" data-q="-1">‹ назад</button><button type="button" data-q="1">дальше ›</button></div>
      <div class="ws-q"></div>
      <div class="ws-hint">потяните лист на стол</div>
      <div class="ws-face ws-f-episode"><div class="ws-ft">Новый эпизод</div><div class="ws-fs">заполните — или потяните на стол</div>
        <label><span>название</span><input data-f="title" autocomplete="off" placeholder="например, Лето у бабушки"></label><label><span>когда</span><input data-f="when" autocomplete="off" placeholder="например, 1960-е"></label><label><span>где</span><input data-f="where" autocomplete="off" placeholder="например, у бабушки в деревне"></label>
        <div class="ws-fh">потяните на стол — начнётся новый эпизод</div></div>
      <div class="ws-face ws-f-document"><div class="ws-ft">Документ</div><div class="ws-fs">письмо, справка, грамота, билет…</div>
        <button type="button" class="ws-scan"><b>положите сюда скан или фото документа</b><small>с компьютера</small></button>
        <label><span>что это</span><input data-f="dtitle" autocomplete="off" placeholder="например, письмо отца"></label><label class="tx"><span>расшифровка</span><textarea data-f="dtext" rows="2" placeholder="что написано в документе"></textarea></label>
        <div class="ws-fh">потяните на стол — в главе появится страница документа</div></div>
      <div class="ws-face ws-f-photo"><div class="ws-pnav"><span class="ws-pc"></span><button type="button" data-p="-1">‹ назад</button><button type="button" data-p="1">дальше ›</button></div>
        <div class="ws-grid"></div><div class="ws-fh">потяните фото на лист</div></div></div>`;
  document.body.appendChild(left);
  const top=left.querySelector('.ws-top'),qEl=left.querySelector('.ws-q'),cnt=left.querySelector('.ws-cnt');
  let kind='page';
  // the kind is chosen on the tabs
  left.querySelector('.ws-tabs').addEventListener('click',e=>{const b=e.target.closest('[data-t]');if(!b)return;e.stopPropagation();if(b.dataset.t!==kind)turnTo(b.dataset.t);});
  // v209 — each kind of clean sheet has its own face on the stack: an episode's name / when / where, a document's scan and
  // transcript, the book's photographs as a contact sheet (taken one by one onto the open sheet)
  const OC=()=>{try{return FW2()?.OC_SHEET;}catch(_){return null;}};const FW2=()=>document.getElementById('v35SheetFrame')?.contentWindow;
  const fv=n=>left.querySelector(`[data-f="${n}"]`);let docSrc='';
  const scan=left.querySelector('.ws-scan');{const inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.hidden=true;left.appendChild(inp);
    scan.addEventListener('click',e=>{e.stopPropagation();inp.click();});
    inp.addEventListener('change',()=>{const f=inp.files&&inp.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{docSrc=r.result;scan.style.backgroundImage=`url("${docSrc}")`;scan.classList.add('has');};r.readAsDataURL(f);inp.value='';});}
  left.querySelectorAll('.ws-face input,.ws-face textarea').forEach(x=>{['pointerdown','keydown','keyup','input'].forEach(t=>x.addEventListener(t,e=>e.stopPropagation()));});
  const layKind=k=>{const o=OC();
    // v212: the episode and the document are made with what was written on the stack, in one step
    if(k==='episode'){o?.newEpisode({title:fv('title').value,when:fv('when').value,where:fv('where').value});['title','when','where'].forEach(n=>fv(n).value='');return;}
    if(k==='document'){o?.newDocument({title:fv('dtitle').value,text:fv('dtext').value,src:docSrc});fv('dtitle').value='';fv('dtext').value='';docSrc='';scan.style.backgroundImage='';scan.classList.remove('has');return;}
    act(k);};
  // the contact sheet: eight photographs a page and a cell to bring more from the computer
  const grid=left.querySelector('.ws-grid'),pc=left.querySelector('.ws-pc');let pgN=0,lastSig='';
  // v211: nine photographs a sheet; «+ добавить фото» only on the last sheet (a new sheet holds it when the last one is full)
  const fillGrid=()=>{const o=OC();const all=o?(o.freePhotos?o.freePhotos():o.allPhotos()):[];const per=9,pages=Math.max(1,Math.ceil((all.length+1)/per));pgN=Math.min(pgN,pages-1);
    const sig=all.length+'|'+pgN+'|'+all.map(r=>r.id||r.src.slice(-24)).join(',');if(sig===lastSig)return;lastSig=sig;
    const part=all.slice(pgN*per,pgN*per+per);
    grid.innerHTML=part.map((r,i)=>`<i class="ws-ph" data-i="${pgN*per+i}" style="background-image:url('${String(r.src).replace(/'/g,'%27')}')"></i>`).join('')+(pgN===pages-1&&part.length<per?'<button type="button" class="ws-add">+ добавить<br>фото</button>':'');
    pc.textContent=`фото семьи · ${pgN+1} из ${pages}`;left.querySelector('.ws-pnav').classList.toggle('one',pages<2);grid._all=all;grid._pages=pages;};
  // v213: a new clean sheet slides onto the stack and settles (as the open sheets in the middle do); the contact sheet's pages the same
  const KINDS=['page','episode','document','photo'];let turning=false;
  const setKind=k=>{kind=k;left.querySelectorAll('.ws-tabs button').forEach(x=>x.classList.toggle('on',x.dataset.t===k));left.dataset.kind=k;if(k==='photo'){lastSig='';fillGrid();}};
  const turnTo=(k,after)=>{if(turning)return;turning=true;(after||setKind)(k);top.classList.remove('ws-settle');void top.offsetWidth;top.classList.add('ws-settle');
    setTimeout(()=>{top.classList.remove('ws-settle');turning=false;},560);};
  const turnGrid=d=>{const pages=grid._pages||1,n=Math.max(0,Math.min(pages-1,pgN+d));if(n===pgN||turning)return;turnTo(kind,()=>{pgN=n;lastSig='';fillGrid();});};
  left.querySelector('.ws-pnav').addEventListener('click',e=>{const b=e.target.closest('[data-p]');if(!b)return;e.stopPropagation();turnGrid(+b.dataset.p);});
  // «+ добавить фото» brings photographs into the album only — onto a sheet they go when taken there (v221: they went straight into the open chapter)
  {const inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.multiple=true;inp.hidden=true;left.appendChild(inp);
    inp.addEventListener('change',()=>{OC()?.addAlbumFiles?.(inp.files);inp.value='';});
    grid.addEventListener('click',e=>{if(e.target.closest('.ws-add')){e.stopPropagation();inp.click();}});}
  setInterval(()=>{if(kind==='photo')fillGrid();},1500);
  // a photograph taken from the contact sheet: a small print in the hand, laid on the open sheet
  grid.addEventListener('pointerdown',e=>{const c=e.target.closest('.ws-ph');if(!c||e.button!==0)return;e.preventDefault();e.stopPropagation();
    const rec=grid._all?.[+c.dataset.i];if(!rec)return;const r=c.getBoundingClientRect();const pr=document.createElement('div');pr.className='ws-print';pr.style.backgroundImage=c.style.backgroundImage;
    Object.assign(pr.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});document.body.appendChild(pr);paperFx(.35);
    const wr=wrapEl()?.getBoundingClientRect();let tx=0,ty=0,cx=0,cy=0,on=true,over=false;const x0=e.clientX,y0=e.clientY;
    const fr=()=>{if(!on)return;requestAnimationFrame(fr);cx+=(tx-cx)*.45;cy+=(ty-cy)*.45;pr.style.transform=`translate(${cx.toFixed(1)}px,${cy.toFixed(1)}px) rotate(${Math.max(-6,Math.min(6,(tx-cx)/12)).toFixed(2)}deg) scale(1.6)`;};requestAnimationFrame(fr);
    const mv=ev=>{tx=ev.clientX-x0;ty=ev.clientY-y0;over=!!wr&&ev.clientX>wr.left&&ev.clientX<wr.right&&ev.clientY>wr.top&&ev.clientY<wr.bottom;pr.classList.toggle('over',over);};
    const up=ev=>{on=false;c.removeEventListener('pointermove',mv);c.removeEventListener('pointerup',up);c.removeEventListener('pointercancel',up);
      // v212: a press without a pull opens the photograph's card (it turns over: its back to be written; back to the album or onto the sheet)
      if(ev&&ev.type==='pointerup'&&Math.hypot(ev.clientX-x0,ev.clientY-y0)<6){pr.remove();const f=document.getElementById('v35SheetFrame'),fr=f.getBoundingClientRect(),cr=c.getBoundingClientRect();
        const W=f.contentWindow;if(W?.__ocAlbumCard){c.style.visibility='hidden';paperFx(.3);W.__ocAlbumCard(rec,{left:cr.left-fr.left,top:cr.top-fr.top,width:cr.width,height:cr.height},how=>{c.style.visibility='';if(how==='laid'){lastSig='';fillGrid();}});}return;}
      if(over&&OC()?.addPhotoCopy(rec)){pr.classList.add('laid');paperFx(.25);setTimeout(()=>pr.remove(),420);}
      else{pr.classList.add('back');pr.style.transform='none';setTimeout(()=>pr.remove(),380);}};
    try{c.setPointerCapture(e.pointerId);}catch(_){}c.addEventListener('pointermove',mv);c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);});
  left.querySelector('.ws-nav').addEventListener('click',e=>{const b=e.target.closest('[data-q]');if(!b)return;e.stopPropagation();document.getElementById(b.dataset.q==='1'?'writingPromptNext':'writingPromptAgree')?.click();});
  // the chapter's question is written on the top clean sheet (the same question as beside the sheet, the same keys)
  // the chapter may have no questions (the family tree): the question beside the sheet is then hidden — the clean sheet is clean
  let goneT=0;const pe=document.getElementById('writingPrompt');
  const shown=()=>!pe||pe.classList.contains('is-visible')||pe.classList.contains('is-leaving');
  const mirror=()=>{if(!shown()){clearTimeout(goneT);goneT=setTimeout(()=>{if(!shown()){qEl.textContent='';cnt.textContent='';left.classList.add('no-q');left.querySelector('.ws-nav').classList.add('one');}},1700);return;}
    clearTimeout(goneT);const t=(document.getElementById('writingPromptText')?.textContent||'').trim();const c=(document.getElementById('writingPromptCount')?.textContent||'').trim();
    if(qEl.textContent!==t){qEl.classList.remove('in');void qEl.offsetWidth;qEl.textContent=t;qEl.style.setProperty('--qk',t.length<50?'.095':t.length<80?'.082':t.length<110?'.07':'.06');qEl.classList.add('in');}if(cnt.textContent!==c)cnt.textContent=c;
    left.classList.toggle('no-q',!t);left.querySelector('.ws-nav').classList.toggle('one',!c);};
  {const a=document.getElementById('writingPromptText'),b=document.getElementById('writingPromptCount');const mo=new MutationObserver(mirror);[a,b].forEach(x=>x&&mo.observe(x,{childList:true,characterData:true,subtree:true}));if(pe)mo.observe(pe,{attributes:true,attributeFilter:['class']});mirror();}

  // ——— taking a clean sheet to the desk
  const act=a=>{try{FW()?.postMessage({type:'OCHERKI_SHEET_ACTION',act:a},'*');}catch(_){}};
  let drag=null;
  top.addEventListener('pointerdown',e=>{if(e.button!==0||e.target.closest('button,input,textarea,label,.ws-grid')||kind==='photo'||turning)return;e.preventDefault();
    const r=top.getBoundingClientRect();const fl=top.cloneNode(true);fl.classList.add('ws-flyer');// the window's light stays on the stack: a sheet in the hand is lit as it is lifted, not as it lay
    fl.querySelectorAll(shell.classList.contains('is-night')?'.ws-tabs,.ws-nav':'.ws-tabs,.ws-nav,.ws-lt').forEach(x=>x.remove());{const nb=left.style.getPropertyValue('--ws-nbg');if(nb)fl.style.setProperty('--ws-nbg',nb);}fl.dataset.kind=kind;{const src=top.querySelectorAll('input,textarea'),dst=fl.querySelectorAll('input,textarea');src.forEach((x,i)=>{if(dst[i])dst[i].value=x.value;});}fl.querySelector('.ws-q')?.classList.remove('in');fl.style.setProperty('--ws-w',top.offsetWidth+'px');
    Object.assign(fl.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});document.body.appendChild(fl);top.classList.add('ws-away');
    // v207: everything the move needs is measured once, here: where the open sheet lies and where it can be dropped
    const sr=sheetRect(),wr=wrapEl()?.getBoundingClientRect();
    // v212: the plate — a clean sheet in the open sheet's very size. Over the open sheet the small sheet in the hand gives way
    // to it: it is never stretched, it only moves (left/top), and the window's shade on it stays where it is on the screen
    const pl=document.createElement('div');pl.className='ws-plate';Object.assign(pl.style,{width:sr.width+'px',height:sr.height+'px',left:(r.left+r.width/2-sr.width/2)+'px',top:(r.top+r.height/2-sr.height/2)+'px'});document.body.appendChild(pl);
    drag={night:shell.classList.contains('is-night'),fl,pl,r,sr,wr,x0:e.clientX,y0:e.clientY,moved:false,lx:e.clientX,ly:e.clientY,tx:0,ty:0,cx:0,cy:0,vx:0,vy:0,svx:0,svy:0,k:0,carry:false};try{top.setPointerCapture(e.pointerId);}catch(_){}
    // v198 — a live sheet: it lifts off the stack, tilts towards the hand, its shadow grows and softens
    fl.style.transformOrigin='50% 50%';fl.classList.add('ws-lift');paperFx(.5);
    requestAnimationFrame(()=>{fl.style.transform='perspective(1100px) rotateX(9deg) rotateY(-10deg) rotateZ(-1.5deg) scale(1.04)';});
    // v207: it follows the hand frame by frame (not from one mouse event to the next): a short easing, so it glides
    const d0=drag;const frame=()=>{if(drag!==d0)return;requestAnimationFrame(frame);if(!d0.carry)return;
      d0.cx+=(d0.tx-d0.cx)*.42;d0.cy+=(d0.ty-d0.cy)*.42;d0.svx+=(d0.vx-d0.svx)*.18;d0.svy+=(d0.vy-d0.svy)*.18;d0.vx*=.85;d0.vy*=.85;
      d0.k+=((d0.over?1:0)-d0.k)*.18;const k=d0.k;
      const ry=Math.max(-16,Math.min(16,-6-d0.svx*.9)),rx=Math.max(-6,Math.min(16,8+d0.svy*.6)),rz=Math.max(-5,Math.min(5,d0.cx/90));
      d0.fl.style.transform=`translate(${d0.cx.toFixed(1)}px,${d0.cy.toFixed(1)}px) perspective(1100px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotateZ(${rz.toFixed(2)}deg) scale(1.06)`;d0.fl.style.opacity=(1-k).toFixed(3);
      const ccx=d0.r.left+d0.r.width/2+d0.cx,ccy=d0.r.top+d0.r.height/2+d0.cy;d0.pl.style.left=(ccx-d0.sr.width/2).toFixed(1)+'px';d0.pl.style.top=(ccy-d0.sr.height/2).toFixed(1)+'px';d0.pl.style.opacity=k.toFixed(3);
      // v215: at night the sheet is brought under the beam little by little: it brightens as it comes over the open sheet
      if(d0.night)d0.pl.style.filter=`brightness(${(.6+.4*k*k).toFixed(3)})`;};
    requestAnimationFrame(frame);});
  top.addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.x0,dy=e.clientY-drag.y0;if(Math.hypot(dx,dy)>5)drag.moved=true;
    drag.vx=drag.vx*.6+(e.clientX-drag.lx)*.4;drag.vy=drag.vy*.6+(e.clientY-drag.ly)*.4;drag.lx=e.clientX;drag.ly=e.clientY;drag.tx=dx;drag.ty=dy;
    if(!drag.carry&&drag.moved){drag.carry=true;drag.fl.classList.remove('ws-lift');drag.fl.classList.add('ws-carry');}
    const w=drag.wr;const over=!!w&&e.clientX>w.left&&e.clientX<w.right&&e.clientY>w.top&&e.clientY<w.bottom;if(over!==drag.over){drag.over=over;shell.classList.toggle('ws-over',over);}});
  const finish=e=>{if(!drag)return;const d=drag;drag=null;shell.classList.remove('ws-over');const fl=d.fl,pl=d.pl;
    const lay=d.over||!d.moved;// a plain click lays it too: one press is enough for a hand that does not like to drag
    if(lay){const w=sheetRect();paperFx(.28);
      // it is laid down: the plate (the open sheet's very size) comes to rest exactly on the open sheet; the small sheet is gone
      fl.style.transition='opacity .2s ease';fl.style.opacity='0';setTimeout(()=>fl.remove(),240);
      pl.classList.add('landing');pl.style.opacity='1';pl.style.filter='';requestAnimationFrame(()=>{pl.style.left=w.left+'px';pl.style.top=w.top+'px';});
      top.classList.remove('ws-away');top.classList.add('ws-next');setTimeout(()=>top.classList.remove('ws-next'),700);// the next clean sheet lies there at once
      // v207: the new sheet is not laid a second time (it is the one in the hand): it is there, still, when the hand lets go
      try{FW().__ocNoLay=Date.now();}catch(_){}
      setTimeout(()=>layKind(kind),200);setTimeout(()=>{pl.classList.add('gone');setTimeout(()=>pl.remove(),340);},640);}
    else{pl.remove();fl.classList.add('ws-back');fl.style.opacity='1';fl.style.transform='none';setTimeout(()=>{fl.remove();top.classList.remove('ws-away');},420);}};
  top.addEventListener('pointerup',finish);top.addEventListener('pointercancel',finish);

  // ——— the day's icon among the page's keys (in place of the long «дневной свет» button)
  const IS='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/></svg>';
  const setupKeys=()=>{const W=window.__ocWp;if(!W||W.keys2.querySelector('.dl'))return;const it=document.createElement('div');it.className='wp-item dl';
    it.innerHTML=`<button type="button" class="key" aria-label="Дневной свет" aria-pressed="false"><span class="cap">${IS}</span></button><span class="lab">свет дня</span>`;
    W.keys2.appendChild(it);it.querySelector('button').addEventListener('click',e=>{e.stopPropagation();const on=W.pane.classList.toggle('show-day');e.currentTarget.setAttribute('aria-pressed',String(on));it.classList.toggle('on',on);});};

  // ——— keeping everything in its place
  let lastK='',autoTried=0;
  const clock=()=>document.querySelector('.bottom-left .master-clock');
  const tick=()=>{requestAnimationFrame(tick);if(drag)return;
    const ok=isWrite()&&!!leftBox();shell.classList.toggle('oc-ws',ok);
    const W=window.__ocWp;const peek=ok&&W?.isOn?.()&&shell.classList.contains('wp-on');shell.classList.toggle('oc-ws-peek',!!peek);
    if(!ok){if(lastK){lastK='';const c=clock();if(c){c.style.removeProperty('transform');}}return;}
    setupKeys();
    const b=leftBox();// v203: where the page and its keys come to rest (their set places, not their sliding boxes): the clock stands still
    const ps=W?.pane?.style,ks=W?.keys2;const pg=ps&&ps.width?{left:parseFloat(ps.left),top:parseFloat(ps.top),width:parseFloat(ps.width),height:parseFloat(ps.height)}:null;
    const k2=ks&&ks.style.top?{bottom:parseFloat(ks.style.top)+ks.offsetHeight,height:ks.offsetHeight}:null;
    const k=[b.left,b.top,b.w,b.h,peek?1:0,pg?Math.round(pg.left)+','+Math.round(pg.top)+','+Math.round(pg.width)+','+Math.round(pg.height):'',k2?Math.round(k2.bottom):''].join('|');
    if(k===lastK)return;lastK=k;
    Object.assign(left.style,{left:b.left+'px',top:b.top+'px',width:b.w+'px',height:b.h+'px'});left.style.setProperty('--ws-w',b.w+'px');// v227: the window's picture is laid from the stack's place on the desk, not from where it is seen this moment (coming back from
    // «Рукопись» it was measured while the stack was still off the screen, and the picture stayed off its place)
    {const base=left.getBoundingClientRect();left.querySelectorAll('.ws-lt').forEach(l=>{const r=l.getBoundingClientRect();l.style.setProperty('--ox',(-(b.left+r.left-base.left)).toFixed(1)+'px');l.style.setProperty('--oy',(-(b.top+r.top-base.top)).toFixed(1)+'px');});}document.documentElement.style.setProperty('--ws-bx',Math.round(b.left+b.w/2)+'px');document.documentElement.style.setProperty('--ws-by',Math.round(b.top+b.h+Math.max(26,b.h*.06))+'px');
    // the book's name above the page, the clock below its keys — the signature stays where it always is
    const c=clock();
    // v205: the book's name is a brass plate like the stack's tabs, level with them, over the page that is laid in the book;
    // it is as wide as the tabs, or as the page when the page is narrower (a tall format) — set from the page's resting place
    {let pl=document.querySelector('.ws-ttl');if(!pl){pl=document.createElement('div');pl.className='ws-ttl';pl.innerHTML='<i class="nf"></i><b>Очерки жизни</b><span>история семьи</span>';shell.after(pl);}
      const tb=left.querySelector('.ws-tabs')?.getBoundingClientRect();
      {const n=(document.getElementById('projectTitle')?.textContent||'').trim()||'Очерки жизни',bb=pl.querySelector('b');if(bb.textContent!==n)bb.textContent=n;}
      pl.style.setProperty('--ws-w',b.w+'px');if(peek&&pg&&tb&&tb.width){const w=Math.round(Math.min(tb.width,pg.width));Object.assign(pl.style,{left:Math.round(pg.left+pg.width/2-w/2)+'px',top:Math.round(tb.top)+'px',width:w+'px',height:Math.round(tb.height)+'px'});pl.classList.add('on');}
      else pl.classList.remove('on');}
    // the clock stands under the stack: it does not wait for the book's page
    if(c){const pv=c.querySelector('.clock-pivot');
      // measured, not reckoned: the clock is set to its new size with no move, the pivot is found, then moved by the difference
      c.style.setProperty('transition','none','important');
      // v223: the clock is measured at its own size (scale 1: the hand's length above the pivot, the pendulum's reach below it),
      // then made in proportion to the stack (a little over half its height: on a tall screen it grew huge), hung in the middle of the
      // room under the stack, centred under it
      const k0=parseFloat(getComputedStyle(c).scale)||1;
      c.style.transform='scale(1)';const p0=pv.getBoundingClientRect(),bob=c.querySelector('.logo-bob')?.getBoundingClientRect();
      const reach=Math.max(60,(bob?bob.bottom:p0.bottom+140)-p0.top),hr=c.querySelector('.minute-hand')?.getBoundingClientRect(),hand=Math.max(40,hr?Math.hypot(hr.width,hr.height):90);
      const room=innerHeight-(b.top+b.h),T=Math.min(room*.88,b.h*.54),gap=(room-T)/2,sb=b.top+b.h+gap,sc=Math.max(.35,T/(hand+reach));
      c.style.transform=`scale(${sc.toFixed(3)})`;const p1=pv.getBoundingClientRect();
      const tx=b.left+b.w/2,ty=sb+hand*sc;
      c.style.transform=`translate(${((tx-(p1.left+p1.width/2))/k0).toFixed(1)}px,${((ty-(p1.top+p1.height/2))/k0).toFixed(1)}px) scale(${sc.toFixed(3)})`;
      void c.offsetWidth;c.style.removeProperty('transition');}
    else if(c)c.style.removeProperty('transform');};
  requestAnimationFrame(tick);
  // the iframe learns where the screen's window lies over it (its sun and shade are laid from the screen's corner) — every
  // frame, only written when it changed (twice a second, the light on the sheet caught up with a jump after the sheet moved)
  requestAnimationFrame(function sun(){requestAnimationFrame(sun);const f=F(),d=FD();if(!f||!d?.body)return;const r=f.getBoundingClientRect();const st=d.body.style;const v=[-r.left,-r.top,innerWidth,innerHeight].map(Math.round).join();if(st._ws===v)return;st._ws=v;
    st.setProperty('--sun-x',Math.round(-r.left)+'px');st.setProperty('--sun-y',Math.round(-r.top)+'px');st.setProperty('--sun-w',innerWidth+'px');st.setProperty('--sun-h',innerHeight+'px');st.setProperty('--ws-shade',SHADE_PAPER);st.setProperty('--ws-shade-e',SHADE_E);});
  // the book's page opens by itself once the book is ready in the background (unless the hand closed it)
  setInterval(()=>{const W=window.__ocWp;if(!W||W.isOn()||!shell.classList.contains('oc-ws'))return;let off=false;try{off=localStorage.getItem('ocherkiPeekOff')==='1';}catch(_){}
    if(!W.usable())return;void off;if(Date.now()-autoTried<4000)return;autoTried=Date.now();W.open();},1000);
})();


// ——— book-desk
// v199 — «Книга» lies on the same desk: the same bar in the same place, the same lamp (or window), the sheets of «Писать» pushed
// aside to the left edge (a press on them brings «Писать» back); the book lit only where the beam falls; «свет дня» shows its
// true colours at any hour.
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  const IS='<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/></svg>';
  const isBook=()=>shell.classList.contains('is-book-preview')&&document.body.classList.contains('oct-book');
  const dress=()=>{const bq=document.querySelector('.bq-book');if(bq&&!bq.querySelector('.bq-lamp')){const l=document.createElement('i');l.className='bq-lamp';bq.appendChild(l);}
    const car=document.querySelector('.bq-car');if(car&&!car.querySelector('.bq-day')){const b=document.createElement('button');b.type='button';b.className='bq-day';b.setAttribute('aria-label','Дневной свет');b.setAttribute('aria-pressed','false');b.dataset.tip='Дневной свет — книга в настоящих цветах';b.innerHTML=IS;
      b.addEventListener('click',e=>{e.stopPropagation();const on=document.body.classList.toggle('bq-true');b.setAttribute('aria-pressed',String(on));b.classList.toggle('on',on);});car.appendChild(b);}
    const left=document.querySelector('.ws-left');if(left){const a=isBook();left.classList.toggle('ws-aside',a);
      if(!left._aside){left._aside=true;left.addEventListener('click',e=>{if(!left.classList.contains('ws-aside'))return;e.stopPropagation();e.preventDefault();(window.__ocLeaveBook||(f=>f()))(()=>window.OCHERKI_SET_MODE?.('write'));},true);}}};
  setInterval(dress,400);new MutationObserver(dress).observe(shell,{attributes:true,attributeFilter:['class']});
})();


// ——— book-leave
// v203 — from «Книга» back to «Писать» the same way round: first the book slides off to the right and the strip of spreads
// fades, then the sheets come back in from the left (nothing overlaps, nothing just vanishes)
(()=>{const shell=document.querySelector('.shell');if(!shell)return;const H=document.documentElement;let busy=false;
  const inBook=()=>shell.classList.contains('is-book-preview')&&document.body.classList.contains('oct-book');
  window.__ocLeaveBook=go=>{if(busy)return;if(!inBook())return go();busy=true;H.classList.add('bk-out');
    setTimeout(()=>{go();setTimeout(()=>{H.classList.remove('bk-out');busy=false;},1700);},850);};
  document.addEventListener('click',e=>{const k=e.target.closest?.('.oct .k');if(!k||k.__go||!inBook()||k.dataset.k==='book')return;
    e.stopImmediatePropagation();e.preventDefault();window.__ocLeaveBook(()=>{k.__go=true;k.click();k.__go=false;});},true);
})();

// v206 — for now only the editor, «Рукопись» and (v234) «Книга» work: «Архив семьи», «Мои книги», the Keeper's tour and the return to
// the start are «скоро». Their keys stay in their places (the design is kept); a press only says so. The book is still made
// in the background for «Так ляжет».
(()=>{const SOON=['shelf','tour','logo'];const sel=SOON.map(k=>`.oct .k[data-k="${k}"],.oct .k[data-a="${k}"]`).join(',');
  let tip=null,tT=0;const say=k=>{const r=k.getBoundingClientRect();if(!tip){tip=document.createElement('div');tip.className='oc-soon-tip';document.body.appendChild(tip);}
    tip.textContent='скоро';tip.style.left=Math.round(r.left+r.width/2)+'px';tip.style.top=Math.round(r.bottom+30)+'px';tip.classList.add('on');clearTimeout(tT);tT=setTimeout(()=>tip.classList.remove('on'),1300);};
  const stop=e=>{const k=e.target.closest?.(sel);if(!k)return;e.preventDefault();e.stopImmediatePropagation();if(e.type==='click')say(k);};
  ['pointerdown','mousedown','click'].forEach(t=>document.addEventListener(t,stop,true));
  const mark=()=>document.querySelectorAll(sel).forEach(k=>k.classList.add('oc-soon'));mark();setInterval(mark,1500);
  const wrapMode=()=>{const f=window.OCHERKI_SET_MODE;if(!f||f._soon)return;const B=()=>window.OCHERKI_DESKBOOK;const g=t=>{if(t==='book')return B()?.open();if(t!=='write'&&t!=='manuscript')return undefined;if(B()?.isOpen())return B().close(t,()=>{if(t==='manuscript')f(t);});return f(t);};g._soon=true;window.OCHERKI_SET_MODE=g;};wrapMode();setInterval(wrapMode,1000);})();

// v207 — at night the desk comes in dark: until the lamp is lit everything on it (the sheets, the stack, the page) lies in the
// dusk, and as the lamp lights up the dusk lifts with it, slowly
(()=>{const sh=document.querySelector('.shell');if(!sh)return;const d=document.createElement('div');d.className='oc-dusk';document.body.appendChild(d);
  const up=()=>d.classList.toggle('on',sh.classList.contains('is-night')&&!sh.classList.contains('oc-lit'));new MutationObserver(up).observe(sh,{attributes:true,attributeFilter:['class']});up();})();

// v212 — the desk comes into view when it lies in its place: the stack, the page and the clock laid out (or after 6 s at most)
(()=>{const H=document.documentElement,sh=document.querySelector('.shell');let t0=performance.now();
  {let img=false;const im=new Image();im.onload=im.onerror=()=>{img=true;};im.src='assets/toile/desk-toile.png';const t1=performance.now();
    const veil=()=>{if(H.classList.contains('oc-desk'))return;if(img||performance.now()-t1>2500){H.classList.add('oc-desk');return;}requestAnimationFrame(veil);};veil();}
  const ready=()=>sh&&sh.classList.contains('oc-ready')&&document.querySelector('.ws-left')?.style.left&&document.querySelector('.bottom-left .master-clock')?.style.transform;
  // v256: as in a film — the lines come one by one, the verse stays a few seconds, melts away, and only then the veil lifts and
  // the things come in (the time counts from the page's very start: the verse is drawn from the first frame)
  const show=()=>{H.classList.add('oc-verse-out');setTimeout(()=>H.classList.add('oc-shown'),1900);};
  const go=()=>{if(H.classList.contains('oc-verse-out'))return;const el=performance.now();if((ready()&&el>8200)||el>13000){show();return;}requestAnimationFrame(go);};go();})();/* v255: the quatrain on the boot is given time to be read */

// v246 — «Так ляжет» learns where it lies on the screen (its evening light is the room's picture laid from that place)
(()=>{let k='';const go=()=>{requestAnimationFrame(go);const p=document.querySelector('.wp-pane .wp-page');if(!p)return;const r=p.getBoundingClientRect();
  const v=Math.round(r.left)+','+Math.round(r.top);if(v===k)return;k=v;p.style.setProperty('--wpx',(2-Math.round(r.left))+'px');p.style.setProperty('--wpy',(2-Math.round(r.top))+'px');};requestAnimationFrame(go);})();
