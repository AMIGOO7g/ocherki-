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
    <div class="wp-item ref"><button type="button" class="key" aria-label="Обновить страницу"><span class="cap">${IR}</span></button><span class="lab">обновить</span></div>`;
  shell.append(pane,keys,keys2);
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
    if(shell.classList.contains('oc-w')){const r2=innerWidth-(base.left+base.width)-G-40;H=base.height*.8;W=H*pw/ph;if(W>r2){W=Math.max(0,r2);H=W*ph/pw;}d=0;}
    return {base,W,H,G,d,extra,ok:W>=260};}
  function place(){const g=geo();if(!g)return;const b=g.base,L=b.left-g.d+b.width+g.G;
    const css=on?`left:${L}px;top:${b.top+(b.height-g.H)/2-10}px;width:${g.W}px;height:${g.H}px`:`left:${b.left+b.width+g.extra-g.W*.7}px;top:${b.top+(b.height-g.H)/2-10}px;width:${g.W}px;height:${g.H}px`;
    if((on||!shell.classList.contains('wp-closing'))&&pane._css!==css){pane._css=css;pane.style.cssText=css;}
    keys2.style.left=(L+g.W/2-keys2.offsetWidth/2)+'px';keys2.style.top=(b.top+(b.height+g.H)/2+12)+'px';
    keys.style.left=(b.left+b.width+g.extra+30)+'px';keys.style.top=(b.top+b.height-96)+'px';}
  function setOpen(v){const w=wrap();if(!w)return;
    if(v){const g=geo();if(!g||!g.ok){window.OCHERKI_SAY?.('Окно узковато для двух листов — откройте «Книгу»','открыть',()=>window.OCHERKI_SET_MODE?.('book'));return;}
      // the page is laid out first, while nothing moves — then everything glides without a stall
      if(!setOpen.ready){tog.classList.add('is-busy');try{document.getElementById('v35SheetFrame')?.contentWindow?.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',action:'flush'},'*');}catch(_){}const t0=Date.now();setTimeout(()=>{pick=null;try{paint(true);}catch(_){}setOpen.ready=true;setTimeout(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{tog.classList.remove('is-busy');setOpen(true);setOpen.ready=false;})),Math.max(0,900-(Date.now()-t0)));},260);return;}}
    on=v;const g=geo();w.style.translate=on&&g?`${-g.d}px 0`:'';shell.classList.toggle('wp-on',on);
    clearTimeout(setOpen.u);shell.classList.remove('wp-up');if(on)setOpen.u=setTimeout(()=>{if(on)shell.classList.add('wp-up');},1600);
    clearTimeout(setOpen.c);if(!on){shell.classList.add('wp-closing');setOpen.c=setTimeout(()=>shell.classList.remove('wp-closing'),1500);}else shell.classList.remove('wp-closing');
    place();
  }
  // lays the page into the pane at once (the book is usually prepared in the background already)
  function paint(){let res=null;const ratio=topRatio();try{res=window.__ocherkiPeekPage?.(uid,ratio,pick);}catch(_){res=null;}
    const host=pane.querySelector('.wp-host');
    count=res?.n||1;pg.classList.toggle('on',count>1);if(res){pick=res.k;pg.querySelector('span').textContent=`${res.k+1} из ${count}`;pg.querySelector('[data-pg="-1"]').disabled=res.k<=0;pg.querySelector('[data-pg="1"]').disabled=res.k>=count-1;}
    if(res){host.innerHTML=res.html;shown=res.spread;pane.querySelector('.wp-cap').textContent=`так ляжет в книге${res.pageNo?' · страница '+res.pageNo:''}`;}
    else{host.innerHTML='<div class="wp-none">Этот раздел появится в книге,<br>когда в нём будет текст или фото</div>';pane.querySelector('.wp-cap').textContent='так ляжет в книге';}
    place();window.__ocherkiScalePages?.();ref.classList.remove('is-stale');stale=false;}
  function refresh(first){if(!on||busy)return;busy=true;pane.classList.add('is-busy');ref.classList.remove('is-stale');stale=false;
    ref.classList.remove('is-spin');void ref.offsetWidth;ref.classList.add('is-spin');clearTimeout(refresh.s);refresh.s=setTimeout(()=>ref.classList.remove('is-spin'),950);
    setTimeout(()=>{paint();requestAnimationFrame(()=>window.__ocherkiScalePages?.());
      setTimeout(()=>{pane.classList.remove('is-busy');busy=false;},160);},60);}
  tog.querySelector('button').addEventListener('click',()=>setOpen(!on));keys2.querySelector('.back button').addEventListener('click',()=>setOpen(false));
  ref.querySelector('button').addEventListener('click',()=>{pick=null;refresh(false);});
  pg.addEventListener('click',e=>{const b=e.target.closest('[data-pg]');if(!b||b.disabled)return;pick=Math.max(0,Math.min(count-1,(pick||0)+(+b.dataset.pg)));refresh(false);});
  addEventListener('message',e=>{const d=e.data||{};
    if(d.type==='OCHERKI_ACTIVE_STATE'&&d.payload?.pageUid){const u=d.payload.pageUid;if(u!==uid){uid=u;pick=null;if(on){clearTimeout(tAuto);tAuto=setTimeout(()=>refresh(false),450);}}}
    else if(d.type==='OCHERKI_STRUCTURE_STATE'){let a='';(d.payload?.sections||[]).forEach(s=>(s.pages||[]).forEach(p=>{if(p.active)a=p.uid||p.id||'';}));
      if(a&&a!==uid){uid=a;pick=null;if(on){clearTimeout(tAuto);tAuto=setTimeout(()=>refresh(false),450);}}
      else if(on&&!busy){stale=true;ref.classList.add('is-stale');}}});
  const sync=()=>{const ok=usable();shell.classList.toggle('wp-ready',ok);
    if(!ok&&on){on=false;const w=wrap();if(w){w.style.setProperty('transition','none','important');w.style.translate='';void w.offsetWidth;requestAnimationFrame(()=>requestAnimationFrame(()=>w.style.removeProperty('transition')));}
      shell.classList.remove('wp-on','wp-up','wp-closing');}
    if(ok)place();};
  new MutationObserver(sync).observe(shell,{attributes:true,attributeFilter:['class']});
  const modal=document.getElementById('bookPreviewModal');if(modal)new MutationObserver(sync).observe(modal,{attributes:true,attributeFilter:['class']});
  addEventListener('resize',()=>{if(on){const w=wrap(),g=geo();if(w&&g)w.style.translate=`${-g.d}px 0`;}place();requestAnimationFrame(()=>window.__ocherkiScalePages?.());});
  [1200,2600,4500].forEach(t=>setTimeout(sync,t));
})();


// ——— write-carriage
// v168 — «Писать»: the carriage on the sheet (what belongs to the sheet), the Keeper in the corner, the keyboard rising while one types
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  const S='<svg viewBox="0 0 24 24">',E='</svg>';
  const IC={back:'<path d="M15 5l-7 7 7 7"/>',book:'<path d="M12 6c-2.6-1.8-5.6-1.9-8.5-1.3v13.5c2.9-.6 5.9-.5 8.5 1.3 2.6-1.8 5.6-1.9 8.5-1.3V4.7C17.6 4.1 14.6 4.2 12 6zM12 6v13.5"/>',
    mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',aa:'<path d="M3 18l5-12 5 12M5 14h6M15 18l3-7 3 7M16 16h4"/>',plus:'<path d="M12 5v14M5 12h14"/>',
    bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z"/>',
    photo:'<rect x="3" y="6" width="18" height="13" rx="1.5"/><circle cx="12" cy="12.5" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/>',episode:'<path d="M7 3h10v18l-5-4-5 4z"/>',
    document:'<path d="M6 3h9l3 3v15H6z"/><path d="M9 9h6M9 13h6M9 17h4"/>',quote:'<path d="M5 17c2.5-1 4-3 4-6V7H5v4h3M13 17c2.5-1 4-3 4-6V7h-4v4h3"/>',
    date:'<rect x="4" y="5" width="16" height="15" rx="1.5"/><path d="M4 10h16M8 3v4M16 3v4"/>',page:'<path d="M6 3h8l4 4v14H6Z"/><path d="M14 3v4h4"/>'};
  const sv=n=>S+IC[n]+E;
  const wc=document.createElement('div');wc.className='wc wc-w';
  const bt=(c,ic,tip,cls='')=>`<button class="${cls}" data-c="${c}" aria-label="${tip}" data-tip="${tip}">${sv(ic)}${c==='tips'?'<em></em>':''}</button>`;
  wc.innerHTML=`<i class="nf"></i>`+bt('back','back','Назад')
    +`<span class="grow"></span><span class="t"><b></b><span class="sv"></span></span>`
    +bt('mic','mic','Говорить вместо печати')+bt('aa','aa','Шрифт и размер')+bt('add','plus','Добавить')+bt('peek','book','Как ляжет в книге')+bt('tips','bulb','До книги — что улучшить');
  document.body.appendChild(wc);
  const add=document.createElement('div');add.className='wc-add';
  add.innerHTML=[['photo','фото'],['episode','эпизод'],['document','документ'],['quote','цитата'],['date','дата'],['page','новый лист']].map(([a,l])=>`<button data-a="${a}">${sv(a)}${l}</button>`).join('');
  document.body.appendChild(add);
  const F=()=>document.getElementById('v35SheetFrame');const FD=()=>{try{return F()?.contentDocument;}catch(_){return null;}};const FW=()=>F()?.contentWindow;
  const isWrite=()=>shell.classList.contains('oc-w')&&shell.classList.contains('is-open')&&!shell.classList.contains('is-manuscript')&&!shell.classList.contains('is-book-preview')&&!document.getElementById('bookPreviewModal')?.classList.contains('open')&&!window.OcherkiBookcase?.isOpen?.()&&!window.OcherkiArchive?.isOpen;
  // inside the sheet: its own top line and the light keys give way to the carriage; the foot reads in our italic
  const dress=()=>{const d=FD();if(!d||d.getElementById('wc-css'))return;const st=d.createElement('style');st.id='wc-css';
    st.textContent=`.topbar .tl>button,.topbar .tr>button,.topbar .chapter,.page-no{visibility:hidden!important;pointer-events:none!important}
      html body .footer #saveState,html body .footer .next-step .ns-label,html body .footer .next-step .ns-text,html body .footer #nsBook{font:italic 14px/1.3 Georgia,serif!important;letter-spacing:.01em!important}html body .footer #saveState{visibility:hidden!important}`;
    d.head.appendChild(st);
    d.addEventListener('keydown',e=>{if(e.key.length===1||e.key==='Enter'||e.key==='Backspace')typing(true);},true);
    d.addEventListener('input',()=>feed());d.addEventListener('selectionchange',()=>feed());};
  wc.addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(!b)return;e.stopPropagation();const c=b.dataset.c,d=FD();
    if(c==='back')d?.getElementById('backBtn')?.click();
    else if(c==='mic')d?.getElementById('voiceBtn')?.click();
    else if(c==='aa')d?.getElementById('textBtn')?.click();
    else if(c==='tips')document.querySelector('.bd-rail-key[data-rail="tips"]')?.click();
    // v180: the page as it will lie in the book slides out from under the sheet (and back)
    else if(c==='peek'){if(shell.classList.contains('wp-on'))document.querySelector('.wp-keys.k-open .back button')?.click();else document.querySelector('.wp-keys.k-closed .tog button')?.click();}
    else if(c==='add'){const r=b.getBoundingClientRect();add.style.left=Math.round(r.left-60)+'px';add.style.top=Math.round(r.bottom+10)+'px';add.classList.toggle('on');}});
  add.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;e.stopPropagation();add.classList.remove('on');
    try{FW()?.postMessage({type:'OCHERKI_SHEET_ACTION',act:b.dataset.a},'*');}catch(_){}});
  document.addEventListener('click',e=>{if(!add.contains(e.target)&&!wc.contains(e.target))add.classList.remove('on');});
  // it rides on the head of the sheet, wherever the sheet goes
  let lastKey='';
  const follow=()=>{requestAnimationFrame(follow);const on=isWrite();wc.classList.toggle('on',on);if(!on){add.classList.remove('on');return;}
    const f=F(),d=FD();if(!f||!d)return;const sh=d.querySelector('.sheet.active');if(!sh)return;dress();
    const fr=f.getBoundingClientRect(),r=sh.getBoundingClientRect();const L=fr.left+r.left,T=fr.top+r.top,W=r.width;
    const k=[L,T,W].map(Math.round).join();if(k!==lastKey){lastKey=k;wc.style.left=Math.round(L-96)+'px';wc.style.top=Math.round(T-19)+'px';wc.style.width=Math.round(W+192)+'px';
      const R=document.documentElement.style;R.setProperty('--bar-l',Math.round(L-96)+'px');R.setProperty('--bar-t',Math.round(T-19)+'px');R.setProperty('--bar-w',Math.round(W+192)+'px');}};
  requestAnimationFrame(follow);
  // v183 — the lamp under the bar: its beam starts at the bar's own ends and spreads a third of the bar's width each way by the
  // foot of the screen; it lights up last, a moment after the bar has come
  const cone=document.querySelector('.desk-cone'),beam=cone?.querySelector('i'),clk=document.querySelector('.master-clock');
  let lit=false;
  const lamp=()=>{const night=shell.classList.contains('is-night'),ms=isMsQ(),on=isWrite()||ms;
    if(!lit&&on){lit=true;setTimeout(()=>shell.classList.add('oc-lit'),900);}
    const bar=ms?document.querySelector('.mq-car'):wc;const r=bar.getBoundingClientRect(),W=innerWidth,H=innerHeight;if(!r.width||!beam)return;
    const x0=r.left+20,x1=r.right-20,y=r.top+r.height*.9,sp=r.width*(ms?.6:.33),P=(x,h)=>`${x}px ${h}px`;
    beam.style.clipPath=`polygon(${P(x0,y)},${P(x1,y)},${P(x1+sp,H*1.04)},${P(x0-sp,H*1.04)})`;
    const m=`linear-gradient(180deg,transparent ${y-20}px,#000 ${y+25}px)`;cone.style.webkitMaskImage=cone.style.maskImage=m;
    // v186: the clock keeps its own look at night (it hardly lies in the beam)
    if(clk&&clk.style.maskImage){clk.style.webkitMaskImage=clk.style.maskImage='';}};
  // v187: the lamp has a source — a thin warm line just under the bar's rim
  const lip=document.createElement('div');lip.className='desk-lip';document.body.appendChild(lip);
  // on «Писать» the line lies on the sheet itself (sheet.css .lt-lip); here it serves «Рукопись», where no sheet lies under the bar
  const lipOn=()=>{const night=shell.classList.contains('is-night'),on=isMsQ()&&shell.classList.contains('oc-lit');lip.classList.toggle('on',night&&on);
    const bar=isMsQ()?document.querySelector('.mq-car'):wc;const r=bar?.getBoundingClientRect();if(r&&r.width){lip.style.left=Math.round(r.left+22)+'px';lip.style.width=Math.round(r.width-44)+'px';lip.style.top=Math.round(r.bottom-2)+'px';}};
  setInterval(()=>{lamp();lipOn();},400);addEventListener('resize',()=>{lamp();lipOn();});
  // what it says: where we are, «до книги», saved
  const tick=()=>{if(!isWrite())return;wc.querySelector('[data-c="peek"]')?.classList.toggle('on',shell.classList.contains('wp-on'));const d=FD();const night=shell.classList.contains('is-night');wc.classList.toggle('night',night);
    const ch=(d?.querySelector('.topbar .chapter')?.textContent||'').trim(),n=(d?.getElementById('pageNo')?.textContent||'').trim(),all=(document.getElementById('pageCount')?.textContent||'').trim();
    const t=[ch,n&&all?`лист ${n} из ${all}`:''].filter(Boolean).join(' · ');const te=wc.querySelector('.t b');if(te.textContent!==t)te.textContent=t;
    const tk=document.querySelector('.bd-rail-key[data-rail="tips"]');const m=(tk?.getAttribute('aria-label')||'').match(/(\d+)/);const em=wc.querySelector('[data-c="tips"] em');em.textContent=m?m[1]:'';wc.querySelector('[data-c="tips"]').classList.toggle('on',!!m);
    const ss=(d?.getElementById('saveState')?.textContent||'');const dot=wc.querySelector('.sv');dot.classList.toggle('busy',/Сохраня/i.test(ss));dot.title=ss||'Черновик сохранён';};
  setInterval(tick,500);
  // the keyboard: it comes up with the first key, the sheet steps up to make room, then all goes back after a pause
  const typing=on=>{if(on&&!isWrite())return;shell.classList.toggle('wc-typing',on);if(on)lift();};
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
  const HKS={w:'ocherkiWriteHints',m:'ocherkiMsHints',b:'ocherkiShelfHints'},HINTS={w:'Пишите, как говорите — книга сложится сама',m:'Крутите колёсико — пойдёте по главам дальше. Фото — на кнопке с фотоаппаратом',b:'Нажмите на книгу — откроется её карточка. Колёсико — листать полку'};
  let HK=HKS.w,HINT=HINTS.w;
  const wk=document.createElement('div');wk.className='wk';wk.innerHTML='<canvas></canvas>';document.body.appendChild(wk);
  const hint=document.createElement('div');hint.className='wk-hint';document.body.appendChild(hint);
  let K=null,ht=0;
  const say=force=>{let m={};try{m=JSON.parse(localStorage.getItem(HK)||'{}');}catch(_){}if(!force&&(m.off||m.seen))return;m.seen=1;try{localStorage.setItem(HK,JSON.stringify(m));}catch(_){}
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
  const ttl=document.createElement('div');ttl.className='oc-ttl';ttl.innerHTML='<div class="k">Очерки жизни</div><div class="n"></div><div class="s">история семьи</div><div class="c"></div>';
  shell.after(ttl);
  ttl.querySelector('.n').addEventListener('click',()=>document.getElementById('booksBtn')?.click());
  const qk=document.createElement('button');qk.type='button';qk.className='oc-qk';qk.setAttribute('aria-label','Другой вопрос');qk.innerHTML='<span>?</span>';
  const acts=document.querySelector('#writingPrompt .writing-prompt-actions');if(acts)acts.appendChild(qk);
  qk.addEventListener('click',e=>{e.stopPropagation();document.getElementById('writingPromptNext')?.click();});
  const isWrite=()=>shell.classList.contains('is-open')&&!shell.classList.contains('is-start-screen')&&!shell.classList.contains('is-manuscript')&&!modal?.classList.contains('open');
  const root=document.documentElement.style;
  function words(){const t=(document.getElementById('projectTitle')?.textContent||'').trim();
    const n=ttl.querySelector('.n');if(n.textContent!==t){const v=t||'Очерки жизни';n.textContent=v;ttl.querySelector('.k').style.display=/^очерки жизни$/i.test(v)?'none':'';n.style.setProperty('--n',(v.length>22?36:v.length>14?44:v.length>10?52:60)+'px');}
    const c=(document.getElementById('pageCount')?.textContent||'').trim();const k=+c;
    const w=k%10===1&&k%100!==11?'лист':[2,3,4].includes(k%10)&&![12,13,14].includes(k%100)?'листа':'листов';
    ttl.querySelector('.c').textContent='';}
  let last='';
  function layout(){const on=isWrite();shell.classList.toggle('oc-w',on);ttl.classList.toggle('on',on&&!shell.classList.contains('wp-on'));if(!on)return;
    words();
    const ed=document.querySelector('.editor-paper')?.getBoundingClientRect();if(!ed||ed.width<200)return;
    const sh=parseFloat(getComputedStyle(document.getElementById('editorPaperWrap')||document.body).translate)||0;
    const L=ed.left-sh,R=ed.right-sh,T=Math.max(ed.top,60),H=Math.min(ed.height,innerHeight-T);
    const cx=Math.round((R+innerWidth-70)/2);
    const ty=Math.round(T+H*.34);
    // one proportion for the whole right column (title, chapter, clock): a laptop sees the same picture, only smaller
    const K=Math.max(.6,Math.min(1,innerHeight/1080,innerWidth/1920));root.setProperty('--oc-k',K.toFixed(3));
    const key=[L,R,T,H,innerWidth].map(Math.round).join();
    ttl.style.left=cx+'px';ttl.style.top=ty+'px';
    root.setProperty('--oc-cx',cx+'px');root.setProperty('--oc-ny',Math.round(ty+(ttl.offsetHeight+44)*K)+'px');
    // the clock stands under the chapter, the signature at the edge
    const nb=ty+ttl.offsetHeight+44+(document.querySelector('.write-nav')?.offsetHeight||70);
    {const bl=document.querySelector('.bottom-left'),pv=document.querySelector('.bottom-left .clock-pivot');
      const cur=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--oc-clx'))||cx-120;
      let nx=cx-120;if(pv&&shell.classList.contains('oc-w')){const pr=pv.getBoundingClientRect();if(pr.width)nx=cur+(cx-(pr.left+pr.width/2));}
      let ny=Math.min(innerHeight-300,nb+70);
      // the hands reach about 110px from the centre: the centre stands that far below the chapter's last line.
      // On a low screen everything keeps its place and the clock itself gets smaller, so it fits under the chapter whole.
      const mc=document.querySelector('.bottom-left .master-clock');
      const nv=document.querySelector('.write-nav');if(pv&&nv&&mc&&shell.classList.contains('oc-w')){const nr=nv.getBoundingClientRect();
        const k=Math.max(.5,Math.min(K,(innerHeight-14-nr.bottom)/375));
        const ok=+(mc.dataset.k||1),mr=mc.getBoundingClientRect(),pr=pv.getBoundingClientRect();
        if(pr.height&&nr.height&&mr.width){
          // the pivot's place inside the clock, unscaled — the clock shrinks around its own centre
          const ox=(pr.left+pr.width/2-mr.left)/ok,oy=(pr.top+pr.height/2-mr.top)/ok;
          if(Math.abs(k-ok)>.004){mc.style.transformOrigin=`${ox.toFixed(1)}px ${oy.toFixed(1)}px`;mc.style.scale=k.toFixed(3);mc.dataset.k=k.toFixed(3);}
          const cy=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--oc-cly'))||ny;
          ny=cy+(nr.bottom+125*k-(pr.top+pr.height/2));}}
      root.setProperty('--oc-clx',Math.round(nx)+'px');root.setProperty('--oc-cly',Math.round(ny)+'px');}
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
  // the photo card on the sheet: the question steps aside, the card stays clear of the keys above
  const watch=()=>{const f=document.getElementById('v35SheetFrame');let d=null;try{d=f?.contentDocument;}catch(_){}const m=d?.getElementById('photoModal');if(!m){setTimeout(watch,900);return;}
    const sync=()=>{const open=m.classList.contains('open');shell.classList.toggle('oc-card',open);
      if(open)requestAnimationFrame(()=>{const fr=f.getBoundingClientRect(),r=m.getBoundingClientRect(),topLimit=170;const y=fr.top+r.top;if(y<topLimit){const cur=parseFloat(m.style.top)||m.offsetTop||0;m.style.top=Math.round(cur+(topLimit-y))+'px';}});};
    new MutationObserver(sync).observe(m,{attributes:true,attributeFilter:['class','style']});sync();
    f.addEventListener('load',()=>setTimeout(watch,900),{once:true});};
  watch();
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
