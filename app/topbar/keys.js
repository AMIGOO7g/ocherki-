/*@block [" id=\"topbar-v118-js\"", ""]*/
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  const modal=document.getElementById('bookPreviewModal');
  const S='<svg viewBox="0 0 24 24">',E='</svg>';
  const I={vinyl:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5.5" stroke-width=".6"/><circle cx="12" cy="12" r="2.6"/><circle cx="12" cy="12" r=".5" fill="currentColor"/>',photos:'<rect x="3.5" y="6.5" width="13" height="10" rx=".6" transform="rotate(-6 10 11.5)"/><rect x="7.5" y="8" width="13" height="10" rx=".6"/><path d="M9.5 16l3-3.2 2.4 2.4 1.8-1.6 2.3 2.4"/>',texts:'<path d="M6 3h9l3 3v15H6z"/><path d="M9 9h6M9 12.5h6M9 16h4"/>',letter:'<rect x="3" y="6" width="18" height="13" rx="1.2"/><path d="M3 7l9 6.5 9-6.5"/>',pen:'<path d="M5 19l3-1 10-10-2-2L6 16z"/><path d="M14 6l2 2"/>',ms:'<rect x="5" y="4" width="11" height="15" rx="1"/><path d="M8 8h6M8 11h6M8 14h4"/><path d="M18 7v13H8"/>',
    book:'<path d="M12 6c-2.6-1.8-5.6-1.9-8.5-1.3v13.5c2.9-.6 5.9-.5 8.5 1.3 2.6-1.8 5.6-1.9 8.5-1.3V4.7C17.6 4.1 14.6 4.2 12 6zM12 6v13.5"/>',
    shelf:'<path d="M4 20h16M6 20V6h3v14M10 20V8h3v12M14.5 20l2-12 3 .6-2 11.4"/>',arch:'<rect x="3" y="7" width="18" height="13" rx="1.5"/><path d="M3 11h18M10 15h4M5 7l2-3h10l2 3"/>',
    q:'<path d="M5 6h14v10H9l-4 3z"/><path d="M10 9.5a2 2 0 1 1 2.6 1.9c-.4.2-.6.5-.6 1V13M12 15h0"/>',mic:'<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
    more:'<circle cx="6" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18" cy="12" r="1"/>',moon:'<path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
    note:'<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',tour:'<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    mail:'<rect x="3" y="6" width="18" height="13" rx="1.5"/><path d="M3 7l9 6 9-6"/>',big:'<path d="M4 18l4.5-12L13 18M6 14h5M15 18l2.5-7 2.5 7M15.8 16h3.4"/>',pdf:'<path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5M10 14h6M10 17h4"/>'};
  // Geometry of the group (its own coordinates; the whole group is moved and scaled).
  const P1=118,L=350,P2=528,PY=18,PB=0,KY=40,GAP=58,W=700;
  // v168: one row of keys over the middle of the sheet — the book's work on the left of the angel, everything else on the right
  const RL=[['write','pen','Писать',-266],['manuscript','ms','Рукопись',-188],["book","book","Книга",-110]],RR=[['archive','arch','Архив семьи',110],['shelf','shelf','Мои книги',188],['more','more','Ещё',266]];
  const ED=[['write','pen','Писать'],['manuscript','ms','Рукопись'],["book","book","Книга"],['shelf','shelf','Мои книги']];
  // v141: the archive's own rooms hang under «Архив семьи»; «Ещё» lives by the music now
  const AR=[['voice','vinyl','Голоса'],['photo','photos','Фото'],['note','texts','Тексты'],['letter','letter','Письма'],['record','mic','Запись'],['week','q','Вопрос\nнедели']];
  const top=document.createElement('div');top.className='oct';top.setAttribute('role','navigation');top.setAttribute('aria-label','Разделы');
  const th=(x,y1,y2)=>`<i class="th" style="left:${x}px;top:${y1}px;height:${y2-y1}px"></i>`;
  const kb=(id,inner,lab,s)=>`<button type="button" class="k" data-k="${id}" aria-label="${(lab||'').replace(/\n/g,' ')}" style="--s:${s}px"><i class="gl"></i><i class="nf"></i><span class="c">${inner}</span><i class="dot"></i>${lab?`<span class="lb">${lab}</span>`:''}</button>`;
  const hk=(x,id,ic,lab,s=44)=>`<div class="sw hg" data-k="${id}" style="left:${x-s/2}px;top:${PB}px;width:${s}px;height:${KY+s/2-PB}px">${th(s/2,0,KY-s/2-PB)}${kb(id,S+I[ic]+E,'',s).replace('aria-label=""',`aria-label="${lab.replace(/\n/g,' ')}"`)}</div><span class="lbx" data-for="${id}" style="left:${x}px;top:${KY+s/2+7}px">${lab}</span>`;
  const row=(keys,cx,cls)=>`<div class="row ${cls}">${keys.map((k,i)=>hk(cx+(i-(keys.length-1)/2)*(cls==='ar'?GAP:62)+0,k[0],k[1],k[2])).join('')}</div>`;
  const plate=(cx,w,lab,pw=236)=>`<div class="sw" style="left:${cx-pw/2}px;top:0;width:${pw}px;height:${PB}px">${th(48,0,PY)}${th(pw-48,0,PY)}<button type="button" class="pl" data-w="${w}"><i class="gl"></i><i class="nf"></i><span>${lab}</span></button></div>`;
  const one=(keys,cls)=>`<div class="row ${cls}">${keys.map(k=>hk(L+k[3],k[0],k[1],k[2])).join('')}</div>`;
  top.innerHTML=`<div class="sw hg" data-k="logo" style="left:${L-32}px;top:0;width:64px;height:${KY+32}px">${th(32,0,KY-32)}${kb('logo','<img alt="" class="ld" src="assets/brand/logo-day-bare.png"><img alt="" class="ln" src="assets/brand/logo-night-bare.png">','',64)}</div>`
    +one(RL,'ed')+one(RR,'ar')
    +`<div class="more" style="left:${L+266}px;top:0"></div>`;
  document.body.appendChild(top);
  const more=top.querySelector('.more');
  // ——— where we are ———
  const shelfOpen=()=>!!window.OcherkiBookcase?.isOpen?.();
  const world=()=>'ed';
  const current=()=>{if(shelfOpen())return 'shelf';if(shell.classList.contains('is-manuscript'))return 'manuscript';if(modal?.classList.contains('open'))return 'book';return 'write';};
  // ——— actions: the old switch still does the work underneath ———
  const sw=()=>document.querySelector('.mode-switch');
  const swClick=m=>{const b=sw()?.querySelector(`button[data-mode="${m}"]`);if(b){b.click();return true;}return false;};
  const vt=(m,fn)=>{const cur=current();if(!document.startViewTransition||cur===m||!['write','manuscript','book'].includes(cur)||matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.classList.contains('calm'))return fn();
    try{document.startViewTransition(()=>new Promise(r=>{fn();setTimeout(r,140);}));}catch(e){fn();}};
  const goEd=m=>vt(m,()=>goEd0(m));
  const goEd0=m=>{if(m==='write'||m==='manuscript'||m==='book'){if(!swClick(m))window.OCHERKI_SET_MODE?.(m);}};
  const act=k=>{closeMore();
    if(k==='archive'&&window.OcherkiArchive)return window.OcherkiArchive.open('desk');
    if(k==='logo'||k==='write'||k==='manuscript'||k==='book')return goEd(k==='logo'?'write':k);
    if(k==='shelf'){document.getElementById('booksBtn')?.click();return;}
    if(k==='more')return more.classList.contains('on')?closeMore():openMore();
    if(k==='pages')return document.getElementById('pagesBtn')?.click();};
  top.addEventListener('click',e=>{const b=e.target.closest('button[data-k],button[data-w]');if(!b)return;e.stopPropagation();
    if(b.dataset.w)return b.dataset.w==='ed'?act(world()==='ed'?'write':'logo'):act('archive');act(b.dataset.k);});
  // ——— «Ещё»: night·day, music, the tour, write to us ———
  const musicOn=()=>/pause|❚|stop/i.test(document.getElementById('transportPlayBtn')?.getAttribute('aria-label')||'')||document.getElementById('musicBtn')?.getAttribute('aria-expanded')==='true';
  function drawMore(){const night=shell.classList.contains('is-night');
    const big=shell.classList.contains('is-large-ui');
    const L=[['music','note','Музыка',musicOn()],['light',night?'sun':'moon',night?'День':'Ночь',false],['big','big',big?'Обычный':'Крупно',big],['tour','tour','Знакомство',false],['mail','mail','Написать',false]];
    // v168: the choices of «Ещё» open to the right, in the same row as the keys, never over the sheet
    more.innerHTML=L.map((m,i)=>`<div class="mi mi-r ${m[3]?'on':''}" style="--lx:${(i+1)*84}px;--ly:${KY+29}px;transition-delay:${i*70}ms"><div class="sw hg" data-k="m-${m[0]}" style="left:${(i+1)*84-22}px;top:0;width:44px;height:${KY+22}px">${th(22,0,KY-22)}${kb('m-'+m[0],S+I[m[1]]+E,'',44).replace('data-k="m-'+m[0]+'"','data-m="'+m[0]+'"')}</div><span class="ml" data-m="${m[0]}">${m[2]}</span></div>`).join('');
    more.querySelectorAll('.sw').forEach(attach);}
  function openMore(){drawMore();void more.offsetWidth;more.classList.add('on');top.querySelector('.k[data-k="more"]')?.classList.add('glow');
    more.querySelectorAll('.sw').forEach((h,i)=>setTimeout(()=>h._push?.(i%2?-1:1,.16),160+i*90));}
  function closeMore(){more.classList.remove('on');top.querySelector('.k[data-k="more"]')?.classList.toggle('glow',false);sync();}
  more.addEventListener('click',e=>{const m=e.target.closest('[data-m]')?.dataset.m;if(!m)return;e.stopPropagation();closeMore();
    const click=id=>document.getElementById(id)?.click();
    if(m==='light')click(shell.classList.contains('is-night')?'dayBtn':'nightBtn');
    else if(m==='music'){click('musicBtn');setTimeout(()=>{if(document.getElementById('musicBtn')?.getAttribute('aria-expanded')==='true')click('transportPlayBtn');},120);}
    else if(m==='mail')click('contactBtn');
    else if(m==='big')click('largeUiKey');
    else if(m==='tour'){const r=shell.classList.contains('is-manuscript')?'manuscript':shell.classList.contains('is-book-preview')?'book':'write';window.OCHERKI_TOUR?.start?.(r,true);}});
  addEventListener('click',e=>{if(more.classList.contains('on')&&!top.contains(e.target))closeMore();});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&more.classList.contains('on'))closeMore();});
  // ——— the sway: the same small pendulum as the old hanging keys (v17) ———
  function attach(el){if(!el||el._push)return;let a=0,v=0,raf=0,hov=false,lx=0;const G=.0105,D=.992,M=1.12;
    const apply=()=>{el.style.transform=`rotate(${a.toFixed(3)}deg)`;};
    const step=()=>{v+=-G*a;v*=D;a+=v;if(a>M){a=M;v*=-.14;}if(a<-M){a=-M;v*=-.14;}apply();if(!hov&&Math.abs(a)<.01&&Math.abs(v)<.002){a=0;v=0;apply();raf=0;return;}raf=requestAnimationFrame(step);};
    const push=(dir,amp)=>{v=v*.35+amp*dir*.72;if(!raf)raf=requestAnimationFrame(step);};
    el._push=push;const t=el.querySelector('button')||el;
    t.addEventListener('pointerenter',e=>{hov=true;const d=lx?(e.clientX>lx?1:-1):1;lx=e.clientX;push(d,.15);});
    t.addEventListener('click',e=>{hov=true;push(e.clientX>lx?1:-1,.18);});
    t.addEventListener('pointermove',e=>{hov=true;if(Math.abs(e.clientX-lx)>16){const d=e.clientX>lx?1:-1;lx=e.clientX;push(d,.11);}});
    t.addEventListener('pointerleave',()=>{hov=false;lx=0;if(!raf)raf=requestAnimationFrame(step);});}
  top.querySelectorAll('.sw').forEach(attach);
  // ——— place: left in «Редактура», middle in the archive; it moves only when the world changes ———
  let sheetLeft=null,lastWorld=null;
  const measureSheet=()=>{if(world()!=='ed'||current()!=='write')return;const r=document.querySelector('.editor-paper')?.getBoundingClientRect();
    if(!r||!r.width||r.width<200)return;const sh=parseFloat(getComputedStyle(document.getElementById('editorPaperWrap')||document.body).translate)||0;sheetLeft=r.left-sh;};
  function place(force){const w=world();if(!force&&w===lastWorld)return;lastWorld=w;
    let x,s=1;
    s=Math.max(.7,Math.min(1,(innerWidth-80)/W,innerHeight/860));x=innerWidth/2-L*s;
    // the rooms below lay out their headings from this line (laptops get a smaller bar and higher headings)
    {const sa=Math.max(.66,Math.min(1,(innerWidth-80)/W,innerHeight/1000)),ui=Math.min(1,innerHeight/1000,innerWidth/1500);
     document.documentElement.style.setProperty('--oct-b',Math.round(186*sa+6)+'px');document.documentElement.style.setProperty('--ui-s',ui.toFixed(3));}
    if(!top._placed){top._placed=performance.now();top.classList.add('no-move');setTimeout(()=>top.classList.remove('no-move'),3400);}
    top.style.transform=`translate(${Math.round(x)}px,0) scale(${s.toFixed(3)})`;
    document.body.classList.toggle('oct-on-arch',w==='arch');}
  // ——— state ———
  function sync(){const open=shell.classList.contains('is-open')&&!shell.classList.contains('is-start-screen');
    top.classList.toggle('on',open);shell.classList.toggle('oct-on',open);if(!open){closeMore0();return;}
    const w=world(),c=current(),night=shell.classList.contains('is-night')||w==='arch';
    top.classList.toggle('is-night',night);
    top.querySelectorAll('.pl').forEach(p=>p.classList.toggle('on',p.dataset.w===w));
    
    top.querySelectorAll('.row .k[data-k],.k[data-k="logo"]').forEach(k=>{if(k.dataset.k==='more'&&more.classList.contains('on'))return;k.classList.toggle('glow',k.dataset.k===c);});
    // the archive glows while something new waits in it
    top.querySelector('.k[data-k="archive"]')?.classList.toggle('has-new',(window.OcherkiArchive?.newCount||0)>0&&!window.OcherkiArchive?.isOpen);
    document.body.classList.toggle('oct-book',c==='book');
    {const n=(document.getElementById('pageCount')?.textContent||'').trim(),b=top.querySelector('.pgn');if(b&&b.textContent!==n)b.textContent=n;top.querySelector('.k[data-k="pages"]')?.setAttribute('aria-label',n?`Листов в книге: ${n}`:'Листы');}
    place();}
  const closeMore0=()=>more.classList.remove('on');
  new MutationObserver(()=>requestAnimationFrame(sync)).observe(shell,{attributes:true,attributeFilter:['class']});
  if(modal)new MutationObserver(()=>requestAnimationFrame(sync)).observe(modal,{attributes:true,attributeFilter:['class']});
  addEventListener('resize',()=>requestAnimationFrame(()=>{measureSheet();place(true);}));
  const settle=()=>{measureSheet();place(true);sync();};[300,1200,3000,6000,9000].forEach(t=>setTimeout(settle,t));
  setInterval(()=>{if(current()==='write'){const before=sheetLeft;measureSheet();if(before!=null&&sheetLeft!=null&&Math.abs(before-sheetLeft)>8)place(true);}},2500);
  sync();
  // ——— PDF lives with the book now: a fourth key in its column ———
  const addPdf=()=>{const rail=document.querySelector('.bd-rail');if(!rail){setTimeout(addPdf,800);return;}if(rail.querySelector('[data-rail="pdf"]'))return;
    const key=document.createElement('button');key.type='button';key.className='key bd-rail-key';key.dataset.rail='pdf';key.setAttribute('aria-label','Сохранить в PDF');
    key.innerHTML=`<span class="cap">${S}${I.pdf}${E}</span>`;const wrap=document.createElement('div');wrap.className='bd-rail-item';wrap.innerHTML='<span class="bd-rail-tip">Сохранить в PDF</span>';wrap.prepend(key);
    key.addEventListener('click',e=>{e.stopPropagation();document.getElementById('pdfBtn')?.click();});rail.appendChild(wrap);};
  addPdf();
  window.OCHERKI_TOPBAR={sync,place,attach};
})();
