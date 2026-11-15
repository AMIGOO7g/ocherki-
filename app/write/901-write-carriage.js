// v168 — «Писать»: the carriage on the sheet (what belongs to the sheet), the Keeper in the corner, the keyboard rising while one types
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  const S='<svg viewBox="0 0 24 24">',E='</svg>';
  const IC={back:'<path d="M15 5l-7 7 7 7"/>',lamp:'<path d="M8 21h8M12 21v-8M12 13l-4-5M8 8l5-4 4 3-4 5"/>',type:'<rect x="3" y="11" width="18" height="8" rx="2"/><path d="M7 11V6h10v5M7 15h10"/>',
    mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>',aa:'<path d="M3 18l5-12 5 12M5 14h6M15 18l3-7 3 7M16 16h4"/>',plus:'<path d="M12 5v14M5 12h14"/>',
    bulb:'<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z"/>',
    photo:'<rect x="3" y="6" width="18" height="13" rx="1.5"/><circle cx="12" cy="12.5" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/>',episode:'<path d="M7 3h10v18l-5-4-5 4z"/>',
    document:'<path d="M6 3h9l3 3v15H6z"/><path d="M9 9h6M9 13h6M9 17h4"/>',quote:'<path d="M5 17c2.5-1 4-3 4-6V7H5v4h3M13 17c2.5-1 4-3 4-6V7h-4v4h3"/>',
    date:'<rect x="4" y="5" width="16" height="15" rx="1.5"/><path d="M4 10h16M8 3v4M16 3v4"/>',page:'<path d="M6 3h8l4 4v14H6Z"/><path d="M14 3v4h4"/>'};
  const sv=n=>S+IC[n]+E;
  const wc=document.createElement('div');wc.className='wc';
  const bt=(c,ic,tip,cls='')=>`<button class="${cls}" data-c="${c}" aria-label="${tip}" data-tip="${tip}">${sv(ic)}${c==='tips'?'<em></em>':''}</button>`;
  wc.innerHTML=`<i class="nf"></i>`+bt('back','back','Назад')+bt('lamp','lamp','Лампа · ровный свет','lt')+bt('type','type','Машинка · свет за строкой','lt')
    +`<span class="grow"></span><span class="t"><b></b><span class="sv"></span></span>`
    +bt('mic','mic','Говорить вместо печати')+bt('aa','aa','Шрифт и размер')+bt('add','plus','Добавить')+bt('tips','bulb','До книги — что улучшить');
  document.body.appendChild(wc);
  const add=document.createElement('div');add.className='wc-add';
  add.innerHTML=[['photo','фото'],['episode','эпизод'],['document','документ'],['quote','цитата'],['date','дата'],['page','новый лист']].map(([a,l])=>`<button data-a="${a}">${sv(a)}${l}</button>`).join('');
  document.body.appendChild(add);
  const F=()=>document.getElementById('v35SheetFrame');const FD=()=>{try{return F()?.contentDocument;}catch(_){return null;}};const FW=()=>F()?.contentWindow;
  const isWrite=()=>shell.classList.contains('oc-w')&&shell.classList.contains('is-open')&&!shell.classList.contains('is-manuscript')&&!shell.classList.contains('is-book-preview')&&!document.getElementById('bookPreviewModal')?.classList.contains('open')&&!window.OcherkiBookcase?.isOpen?.()&&!window.OcherkiArchive?.isOpen;
  // inside the sheet: its own top line and the light keys give way to the carriage; the foot reads in our italic
  const dress=()=>{const d=FD();if(!d||d.getElementById('wc-css'))return;const st=d.createElement('style');st.id='wc-css';
    st.textContent=`.topbar .tl>button,.topbar .tr>button,.topbar .chapter,.page-no,#lightKeys{visibility:hidden!important;pointer-events:none!important}
      html body .footer #saveState,html body .footer .next-step .ns-label,html body .footer .next-step .ns-text,html body .footer #nsBook{font:italic 14px/1.3 Georgia,serif!important;letter-spacing:.01em!important}html body .footer #saveState{visibility:hidden!important}`;
    d.head.appendChild(st);
    d.addEventListener('keydown',e=>{if(e.key.length===1||e.key==='Enter'||e.key==='Backspace')typing(true);},true);
    d.addEventListener('input',()=>feed());d.addEventListener('selectionchange',()=>feed());};
  wc.addEventListener('click',e=>{const b=e.target.closest('[data-c]');if(!b)return;e.stopPropagation();const c=b.dataset.c,d=FD();
    if(c==='back')d?.getElementById('backBtn')?.click();
    else if(c==='lamp'||c==='type'){FW()?.OCHERKI_SHEET_LIGHT?.mode(c);}
    else if(c==='mic')d?.getElementById('voiceBtn')?.click();
    else if(c==='aa')d?.getElementById('textBtn')?.click();
    else if(c==='tips')document.querySelector('.bd-rail-key[data-rail="tips"]')?.click();
    else if(c==='add'){const r=b.getBoundingClientRect();add.style.left=Math.round(r.left-60)+'px';add.style.top=Math.round(r.bottom+10)+'px';add.classList.toggle('on');}});
  add.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;e.stopPropagation();add.classList.remove('on');
    try{FW()?.postMessage({type:'OCHERKI_SHEET_ACTION',act:b.dataset.a},'*');}catch(_){}});
  document.addEventListener('click',e=>{if(!add.contains(e.target)&&!wc.contains(e.target))add.classList.remove('on');});
  // it rides on the head of the sheet, wherever the sheet goes
  let lastKey='';
  const follow=()=>{requestAnimationFrame(follow);const on=isWrite();wc.classList.toggle('on',on);if(!on){add.classList.remove('on');return;}
    const f=F(),d=FD();if(!f||!d)return;const sh=d.querySelector('.sheet.active');if(!sh)return;dress();
    const fr=f.getBoundingClientRect(),r=sh.getBoundingClientRect();const L=fr.left+r.left,T=fr.top+r.top,W=r.width;
    const k=[L,T,W].map(Math.round).join();if(k!==lastKey){lastKey=k;wc.style.left=Math.round(L-14)+'px';wc.style.top=Math.round(T-19)+'px';wc.style.width=Math.round(W+28)+'px';}};
  requestAnimationFrame(follow);
  // what it says: where we are, the light, «до книги», saved
  const tick=()=>{if(!isWrite())return;const d=FD();const night=shell.classList.contains('is-night');wc.classList.toggle('night',night);
    const ch=(d?.querySelector('.topbar .chapter')?.textContent||'').trim(),n=(d?.getElementById('pageNo')?.textContent||'').trim(),all=(document.getElementById('pageCount')?.textContent||'').trim();
    const t=[ch,n&&all?`лист ${n} из ${all}`:''].filter(Boolean).join(' · ');const te=wc.querySelector('.t b');if(te.textContent!==t)te.textContent=t;
    const mode=FW()?.OCHERKI_SHEET_LIGHT?.current;wc.querySelector('[data-c="lamp"]').classList.toggle('on',mode!=='type');wc.querySelector('[data-c="type"]').classList.toggle('on',mode==='type');
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
  const HK='ocherkiWriteHints',HINT='Пишите, как говорите — книга сложится сама';
  const wk=document.createElement('div');wk.className='wk';wk.innerHTML='<canvas></canvas>';document.body.appendChild(wk);
  const hint=document.createElement('div');hint.className='wk-hint';document.body.appendChild(hint);
  let K=null,ht=0;
  const say=force=>{let m={};try{m=JSON.parse(localStorage.getItem(HK)||'{}');}catch(_){}if(!force&&(m.off||m.seen))return;m.seen=1;try{localStorage.setItem(HK,JSON.stringify(m));}catch(_){}
    hint.innerHTML=HINT.split(' ').map((w,i)=>`<span style="--i:${i}">${w}</span>`).join(' ')+'<u data-off>больше не показывать</u>';hint.classList.remove('on');void hint.offsetWidth;hint.classList.add('on');
    try{K?.setMode('idle');setTimeout(()=>{K?.talk(2400);K?.mood?.('joy',2000);},400);}catch(_){}clearTimeout(ht);ht=setTimeout(()=>{hint.classList.remove('on');rest();},9000);};
  const rest=()=>{try{K?.flyAway(0,-.15);}catch(_){}};
  hint.addEventListener('click',e=>{if(e.target.closest('[data-off]')){try{localStorage.setItem(HK,JSON.stringify({off:1,seen:1}));}catch(_){}hint.classList.remove('on');}});
  wk.querySelector('canvas').addEventListener('click',()=>say(true));
  const show=()=>{const on=isWrite()&&!shell.classList.contains('wc-typing');wk.classList.toggle('on',on&&!!K);if(!on)hint.classList.remove('on');
    if(on&&K&&!show.said){show.said=1;setTimeout(()=>{let m={};try{m=JSON.parse(localStorage.getItem(HK)||'{}');}catch(_){}if(m.off||m.seen)rest();else say(false);},1800);}};
  setInterval(show,600);
  const boot=()=>{if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const L=window.OcherkiTour?.loadKeeper;if(!L){setTimeout(boot,1500);return;}
    L().then(()=>{if(K||!window.OcherkiKeeper3D)return;K=OcherkiKeeper3D.create(wk.querySelector('canvas'),{size:1.05,dust:8,quick:1.6});if(K){K.start();K.resize?.();}}).catch(()=>{});};
  setTimeout(boot,4000);
})();
