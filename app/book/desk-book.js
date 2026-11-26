// «Книга» (v247) — the book on the same desk. From the editor: the writing sheet and the clean stack drift off to the left and go,
// «Так ляжет» fades, and the book comes in closed from the right, its cover up; it opens once — straight on the spread of the sheet
// being written (one leaf, not every page). From «Рукопись» the whole book comes in from the right, open. The book's page is «Так ляжет»'s size; the pages are the director's
// own; one light lies over the open book as over the desk (the window's by day, the lamp's at night) and stays where it is while the
// leaves turn. The leaves turn as the old book's did — the paper bends (window.OCHERKI_CURL). Brass plates at the left: the design,
// the format, the photographs' colour (a press lays the book out anew in place); at the right: how many pages, the print, the file.
// Under the book the strip of all the spreads in little. The wheel (one spread for one turn), the keys and the strip turn the pages.
// The open spread and the sheet are one: the book opens on the sheet being written (or the one in the middle of «Рукопись»), and
// going back the editor and «Рукопись» open on the sheet of the open spread.
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  const H=document.documentElement,BK=()=>window.__ocherkiBook,esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const plural=(n,a,b,c)=>{const m=n%10,h=n%100;return m===1&&h!==11?a:m>=2&&m<=4&&(h<12||h>14)?b:c;};
  const rustle=()=>{try{window.OCHERKI_PLAY_PAGE_FX?.(.5);}catch(_){}};
  const frame=()=>document.getElementById('v35SheetFrame');
  const bar=()=>document.querySelector('.wc.wc-w:not(.bq-car)');
  const send=cmd=>{try{frame()?.contentWindow?.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',...cmd},'*');}catch(_){}};
  let isOpen=false,busy=false,cur=0,n=0,geo=null,flipping=false;

  const board=document.createElement('div');board.className='bk-board';
  const LT='<i class="bk-lt"><b class="bk-sun"></b><b class="bk-eve"></b><b class="bk-beam"></b></i>';
  board.innerHTML=`<div class="bk-cap"></div><div class="bk-spread"><div class="bk-pg bk-l"><div class="bk-in"></div>${LT}</div><div class="bk-pg bk-r"><div class="bk-in"></div>${LT}</div><i class="bk-gutter"></i><i class="bk-shd l"></i><i class="bk-shd r"></i></div>`+
    '<div class="bk-stripv"><div class="bk-strip"></div></div><div class="bk-keys bk-kl"></div><div class="bk-keys bk-kr"></div>';
  document.body.append(board);
  const $=s=>board.querySelector(s),shL=$('.bk-shd.l'),shR=$('.bk-shd.r'),spreadEl=$('.bk-spread'),L=$('.bk-l'),R=$('.bk-r'),cap=$('.bk-cap'),strip=$('.bk-strip'),kl=$('.bk-kl'),kr=$('.bk-kr');

  // ——— where everything lies: a page of the book is «Так ляжет»'s page (its size, its height on the desk); the spread stands in
  // the middle, the plates at its sides, the strip under it
  const paneRect=()=>{const p=document.querySelector('.wp-pane .wp-page');const r=p?.getBoundingClientRect();return r&&r.width>100&&shell.classList.contains('wp-on')?r:null;};
  const TH=86;
  function measure(){const b=bar()?.getBoundingClientRect(),[pw,ph]=BK()?.size?.()||[280,280],W=innerWidth,Hh=innerHeight,pr=paneRect();
    let top,h;if(pr){top=pr.top;h=pr.height;}else{top=(b?b.bottom:110)+60;h=Math.max(240,Math.min(Hh-top-200,(W-2*260-80)/2*ph/pw));}
    // whole pixels: the pieces of a turning leaf meet without a hair of light between them
    top=Math.round(top);h=Math.round(h);const w=Math.round(h*pw/ph),left=Math.round((W-2*w)/2);geo={left,top,w,h};
    Object.assign(spreadEl.style,{left:left+'px',top:top+'px',width:2*w+'px',height:h+'px'});
    cap.style.top=(top-32)+'px';Object.assign($('.bk-stripv').style,{left:Math.max(20,left-60)+'px',top:(top+h+26)+'px',width:Math.min(W-40,2*w+120)+'px'});
    strip.style.setProperty('--tw',Math.round(2*TH*pw/ph)+'px');
    Object.assign(kl.style,{left:Math.max(16,left-40-180)+'px',top:top+'px'});Object.assign(kr.style,{left:(left+2*w+40)+'px',top:top+'px'});
    // the light: the desk's own pictures (the window's, the lamp's) laid over the open book from where it lies; it never moves
    try{board.style.setProperty('--rk-beam',window.OCHERKI_DESK_LIGHT?.beam()||'none');}catch(_){}
    // each page's light: the desk's picture from where the page lies (a page that moves carries the opposite move in its light)
    L.querySelector('.bk-lt').style.backgroundPosition=`${2-left}px ${2-top}px`;R.querySelector('.bk-lt').style.backgroundPosition=`${2-(left+w)}px ${2-top}px`;}
  // a page as the director draws it, fitted to its place
  // the page's own paper colour (a dark page is dark to its very edge: nothing light shows round it, still or turning)
  const paperOf=host=>{let e=host;for(let d=0;d<4&&e;d++){const c=getComputedStyle(e).backgroundColor;if(c&&c!=='transparent'&&!/rgba\(0, 0, 0, 0\)/.test(c))return c;e=e.firstElementChild;}return '';};
  const fill=(el,html)=>{el.querySelector('.bk-in').innerHTML=html?`<div class="bk-host">${html}</div>`:'';el.classList.toggle('blank',!html);
    const h=el.querySelector('.bk-host');el.style.backgroundColor=h?paperOf(h.firstElementChild)||'':'';};
  // the cover and the back cover lie alone: no page beside them, no fold
  const shadows=()=>{shL.classList.toggle('on',!L.classList.contains('blank'));shR.classList.toggle('on',!R.classList.contains('blank'));};
  function show(i){const sp=BK()?.spread(i);if(!sp)return;cur=i;fill(L,sp.left);fill(R,sp.right);shadows();spreadEl.classList.toggle('single',!!sp.single);BK()?.scale?.();caption(sp);paintStrip();syncComp();}
  function caption(sp){sp=sp||BK()?.spread(cur);const m=String(sp?.title||'').match(/^(Глава\s*\d+)\.?\s*(.*)$/i);
    capText=m?`${m[1]}${m[2]?' · <i>'+esc(m[2])+'</i>':''} · ${cur+1}/${n}`:`${cur+1} из ${n}`;setTitle();}
  let capText='';

  // ——— the strip: every spread in little, as it lies in the book (the director's own pages, as on the old book's strip); the open
  // one stands in the middle; a press turns the book to it. They are drawn nearest first, the rest while the hands rest
  let filled=new Set(),fillT=0;
  const idle=(f,t)=>(window.requestIdleCallback||(g=>setTimeout(()=>g({timeRemaining:()=>10}),60)))(f,{timeout:t});
  // v243: the little spreads are made beforehand, while the hand writes (when the page is idle), for the book as it is now; the book
  // opens with its strip whole. A little spread made anew only when the book was laid out anew
  const pre={at:null,list:[],img:new Map()};window.__bkPre=pre;
  // (their photographs are fetched and decoded with them — not when they come into sight)
  const eager=t=>{if(!t)return t;const f=h=>String(h||'').replace(/\sloading="lazy"/g,'');t.left=f(t.left);t.right=f(t.right);
    String(t.left+t.right).replace(/\ssrc="([^"]+)"/g,(_,u)=>{if(!pre.img.has(u)){const im=new Image();im.decoding='async';im.src=u.replace(/&amp;/g,'&');pre.img.set(u,im.decode?im.decode().catch(()=>{}):Promise.resolve());}return _;});return t;};
  const thumbOf=k=>{const at=window.__ocherkiBuiltAt||0;if(pre.at!==at){pre.at=at;pre.list=[];}return pre.list[k]||(pre.list[k]=eager(BK()?.thumb(k)||null));};
  const putThumb=(el,k,t)=>{el.children[0].innerHTML=t.left;el.children[1].innerHTML=t.right;el.classList.toggle('single',!!t.single);
    const prev=k>0?thumbOf(k-1):null,m=t.title&&(!prev||prev.title!==t.title)?String(t.title).match(/^(Глава\s*\d+)\.?\s*(.*)$/i):null;
    el.children[2].innerHTML=(m?`<b>${esc(m[1])}</b>${m[2]?`<span>${esc(m[2])}</span>`:''}`:'')+(t.label?`<small>с. ${esc(t.label)}</small>`:'');filled.add(k);};
  // v247: only while the hand rests (3 s after the last key, press or move), only from the book as it is already laid out (it is
  // never laid out here), and only in the page's free time — one little spread at a time. (v244 laid the whole book out anew
  // every 0.7 s and drew two little spreads even when the page was busy: on a big book the constructor stopped answering.)
  let lastHand=performance.now();['keydown','pointerdown','pointermove','wheel'].forEach(t=>addEventListener(t,()=>{lastHand=performance.now();},{passive:true,capture:true}));
  setInterval(()=>{if(isOpen||document.hidden||!shell.classList.contains('oc-w')||performance.now()-lastHand<3000)return;
    idle(dl=>{if(isOpen||performance.now()-lastHand<3000)return;let nn=0;try{nn=BK()?.fresh?.()||0;}catch(_){return;}if(!nn)return;const at=window.__ocherkiBuiltAt||0;if(pre.at!==at){pre.at=at;pre.list=[];}
      for(let k=0;k<nn&&dl.timeRemaining()>12;k++)if(!pre.list[k]){try{pre.list[k]=eager(BK().thumb(k));}catch(_){}}},1000);},1500);
  function buildStrip(){filled=new Set();let h='';
    for(let k=0;k<n;k++)h+=`<button type="button" class="bk-th" data-k="${k}"><i class="bk-tl"></i><i class="bk-tr"></i><em></em></button>`;
    strip.innerHTML=h;const at=window.__ocherkiBuiltAt||0;if(pre.at===at)pre.list.forEach((t,k)=>{const el=strip.children[k];if(t&&el)putThumb(el,k,t);});paintStrip();}
  function fillSome(at){const c0=Number.isInteger(at)?at:cur;if(window.cancelIdleCallback)cancelIdleCallback(fillT);const order=[...Array(n).keys()].filter(k=>!filled.has(k)).sort((a,b)=>Math.abs(a-c0)-Math.abs(b-c0));if(!order.length)return;
    const step=dl=>{let done=0;while(order.length&&(done<2||dl.timeRemaining()>8)){const k=order.shift(),t=thumbOf(k),el=strip.children[k];if(!t||!el)continue;
        // under it: where a chapter begins, «Глава N» and its name; then its pages
        putThumb(el,k,t);done++;}
      BK()?.scale?.();if(order.length&&isOpen)fillT=idle(step,400);};
    fillT=idle(step,200);}
  // v257: the strip can be run through with the wheel, fast, without turning a page (to the cover from page 300 in a moment); a
  // press on a little spread opens it; the strip comes back to the open spread a little after the hand leaves it
  let browse=null,browseT=0,browseAcc=0;
  function paintStrip(){[...strip.children].forEach((el,k)=>el.classList.toggle('cur',k===cur));const at=browse==null?cur:browse,el=strip.children[at],v=$('.bk-stripv');
    if(el&&v)strip.style.translate=`${Math.round(v.clientWidth/2-(el.offsetLeft+el.offsetWidth/2))}px 0`;fillSome(at);}
  $('.bk-stripv').addEventListener('wheel',e=>{if(!isOpen)return;e.preventDefault();e.stopPropagation();const d=(Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY)*(e.deltaMode===1?33:1);
    // one notch — one spread; a quick spin gives more notches, so it runs faster by itself (it jumped to the book's end)
    browseAcc+=d;const step=Math.trunc(browseAcc/(Math.abs(d)>=50?Math.abs(d):60));if(!step)return;browseAcc-=step*(Math.abs(d)>=50?Math.abs(d):60);
    browse=Math.max(0,Math.min(strip.children.length-1,(browse==null?cur:browse)+Math.sign(step)*Math.min(3,Math.abs(step))));paintStrip();
    strip.querySelectorAll('.browse').forEach(x=>x.classList.remove('browse'));strip.children[browse]?.classList.add('browse');
    clearTimeout(browseT);browseT=setTimeout(()=>{browse=null;browseAcc=0;strip.querySelectorAll('.browse').forEach(x=>x.classList.remove('browse'));paintStrip();},3200);},{passive:false});
  strip.addEventListener('click',e=>{const t=e.target.closest('[data-k]');if(t){clearTimeout(browseT);browse=null;turnTo(+t.dataset.k);}});

  // ——— the plates at the sides: the book's own settings (a press lays the book out anew where it lies), and what can be done with it
  function plates(){const B=BK();if(!B)return;const fm=B.formats(),f=fm.find(x=>x.key===B.format())||fm[0],pm=B.photoModes(),m=pm.find(x=>x.key===B.photoMode())||pm[0];
    kl.innerHTML=`<div class="bk-k" aria-disabled="true"><b>дизайн</b>${esc(B.design().name)}</div>`+
      `<button type="button" class="bk-k" data-set="format"><b>формат</b>${esc(f?.name||'')}<span>${esc(f?.dims||'')}</span></button>`+
      `<button type="button" class="bk-k" data-set="photo"><b>фото</b>${esc(m?.label||'')}</button>`;
    const pages=B.pages();
    kr.innerHTML=`<div class="bk-k" aria-disabled="true"><b>в книге</b>${pages} ${plural(pages,'страница','страницы','страниц')}</div>`+
      `<div class="bk-k bk-soon" aria-disabled="true"><b>заказ</b>напечатать<span>скоро</span></div>`+
      `<button type="button" class="bk-k" data-act="pdf"><b>файл</b>PDF<span>сохранить</span></button>`;}
  kr.addEventListener('click',e=>{if(e.target.closest('[data-act="pdf"]'))BK()?.pdf?.();});
  // the format and the photographs' colour: a press opens the list beside the plate; a choice lays the book out anew where it lies.
  // That takes the director a moment: the plate says «собирается», the book dims under it and comes back laid out anew
  const pmenu=document.createElement('div');pmenu.className='bk-cmenu bk-pmenu';pmenu.hidden=true;document.body.appendChild(pmenu);
  kl.addEventListener('click',e=>{const b=e.target.closest('[data-set]');if(!b||busy||flipping)return;e.stopPropagation();const B=BK(),k=b.dataset.set;
    if(!pmenu.hidden&&pmenu.dataset.set===k){pmenu.hidden=true;return;}
    const list=k==='format'?B.formats().map(x=>({key:x.key,label:`${x.name} <small>${esc(x.dims)}</small>`})):B.photoModes().map(x=>({key:x.key,label:esc(x.label)})),now=k==='format'?B.format():B.photoMode();
    pmenu.dataset.set=k;pmenu.innerHTML=`<b>${k==='format'?'Формат книги':'Фото в книге'}</b>`+list.map(x=>`<button type="button" data-key="${esc(x.key)}"${x.key===now?' class="cur"':''}>${x.label}</button>`).join('');
    const r=b.getBoundingClientRect();Object.assign(pmenu.style,{left:Math.round(r.right+14)+'px',top:Math.round(r.top)+'px'});pmenu.hidden=false;});
  addEventListener('click',e=>{if(!pmenu.hidden&&!pmenu.contains(e.target)&&!e.target.closest?.('.bk-kl'))pmenu.hidden=true;},true);
  pmenu.addEventListener('click',e=>{const o=e.target.closest('[data-key]');if(!o)return;const k=pmenu.dataset.set,key=o.dataset.key;pmenu.hidden=true;relayout(k,key);});
  function relayout(k,key){const B=BK();if(busy||flipping||(k==='format'?B.format():B.photoMode())===key)return;busy=true;rustle();
    const plate=kl.querySelector(`[data-set="${k}"]`);plate?.classList.add('bk-busy');
    // the sheet of the open spread stays open: the book is laid out anew and opens on it again
    const keep=window.__ocherkiSheetForSpread?.(cur);
    const dim=[spreadEl,$('.bk-stripv')].map(el=>el.animate([{opacity:1},{opacity:.25}],{duration:280,easing:'ease-out',fill:'forwards'}));
    // the plate and the dimmed book are drawn first, then the director works
    requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(()=>{
      try{if(k==='format')B.setFormat(key);else B.setPhotoMode(key);n=B.ready();const pk=keep&&window.__ocherkiPeekPage?.(keep.pageUid,-1);cur=Math.max(0,Math.min(n-1,pk?pk.spread:cur));
        measure();buildStrip();show(cur);plates();}catch(err){console.warn('book relayout',err);}
      busy=false;dim.forEach(a=>{try{a.cancel();}catch(_){}});[spreadEl,$('.bk-stripv')].forEach(el=>el.animate([{opacity:.25},{opacity:1}],{duration:520,easing:'ease-out'}));},40)));}

  // ——— turning the page: the paper bends as the old book's did (the copies of the pages lie over the new spread, already drawn
  // beneath, so nothing blinks); the desk's light stays where it is over it
  function turnTo(to){if(!isOpen||flipping||busy)return;to=Math.max(0,Math.min(n-1,to));if(to===cur)return;const from=cur,fwd=to>from;
    // the light on a page is the room's: a picture of the whole room laid under the page where the page is in the room — the leaf
    // that rises carries the opposite of its move in its light (o.flap), so the light stays in the room and the paper moves under it
    const room=`translate(${-geo.left}px,${-geo.top}px)`;
    const clone=(el,i)=>{const h=el.querySelector('.bk-host')?.cloneNode(true);if(!h)return null;h.style.overflow='hidden';h.style.background=el.style.backgroundColor||'#fbf7ef';
      h.insertAdjacentHTML('beforeend',`<i class="bk-lt bk-rl" style="transform:translate(${-(geo.left+i*geo.w)}px,${-geo.top}px)"><b class="bk-sun"></b><b class="bk-eve"></b><b class="bk-beam"></b></i>`);return h;};
    const flap=(el,[a,b,c,d,e,f])=>{const lt=el.querySelector('.bk-rl');if(!lt)return;const k=a*d-b*c;if(Math.abs(k)<1e-6)return;
      lt.style.transform=`matrix(${d/k},${-b/k},${-c/k},${a/k},${(c*f-d*e)/k},${(b*e-a*f)/k}) ${room}`;};
    // the side the leaf comes down on keeps what lay there until the leaf is down (a cover's empty half stays empty)
    const landing=fwd?L:R,wasBlank=landing.classList.contains('blank'),wasSingle=spreadEl.classList.contains('single');
    const oldL=clone(L,0),oldR=clone(R,1),hadL=shL.classList.contains('on'),hadR=shR.classList.contains('on');flipping=true;rustle();show(to);
    const newL=clone(L,0),newR=clone(R,1),wantL=!L.classList.contains('blank'),wantR=!R.classList.contains('blank');
    landing.classList.toggle('blank',wasBlank);spreadEl.classList.toggle('single',wasSingle);spreadEl.classList.add('curling');
    // the shadows follow the paper: the side the leaf rises from takes its new shadow as it rises, the side it comes down on as it comes
    const lift=fwd?shR:shL,land=fwd?shL:shR,liftOn=fwd?wantR:wantL,landOn=fwd?wantL:wantR;
    shL.classList.toggle('on',hadL);shR.classList.toggle('on',hadR);
    const sT=[setTimeout(()=>lift.classList.toggle('on',liftOn),180),setTimeout(()=>{land.style.transition='opacity .32s ease-out,box-shadow 2.45s cubic-bezier(.37,0,.63,1)';land.classList.toggle('on',landOn);setTimeout(()=>land.style.removeProperty('transition'),400);},930)];
    const done=()=>{sT.forEach(clearTimeout);flipping=false;spreadEl.classList.remove('curling');const sp=BK()?.spread(cur);if(sp){L.classList.toggle('blank',!sp.left);R.classList.toggle('blank',!sp.right);spreadEl.classList.toggle('single',!!sp.single);}shadows();};
    let ok=false;try{ok=!!window.OCHERKI_CURL?.({forward:fwd,oldL,oldR,newL,newR,X0:geo.left,Y0:geo.top,S:geo.w,H:geo.h,lift:.15,soft:true,flatGutter:fwd?!BK()?.spread(to)?.single:!wasSingle,flap,back:()=>show(from),done});}catch(_){ok=false;}
    if(ok){const c=[...document.querySelectorAll('.bq-curl')].pop();if(c){c.style.zIndex='2147483085';c.classList.add('bk-curl');c.style.setProperty('--rk-beam',board.style.getPropertyValue('--rk-beam'));}}
    else done();}
  const turn=dir=>turnTo(cur+dir);
  board.addEventListener('wheel',e=>{if(!isOpen)return;e.preventDefault();if(flipping||Math.abs(e.deltaY)<20)return;turn(e.deltaY>0?1:-1);},{passive:false});
  addEventListener('keydown',e=>{if(!isOpen)return;if(e.key==='ArrowRight'||e.key==='PageDown')turn(1);else if(e.key==='ArrowLeft'||e.key==='PageUp')turn(-1);else if(e.key==='Home')turnTo(0);else if(e.key==='End')turnTo(n-1);else if(e.key==='Escape')window.OCHERKI_SET_MODE?.('write');});
  addEventListener('resize',()=>{if(isOpen){measure();show(cur);}});

  // ——— coming and going
  const away=['#editorPaperWrap .editor-paper','.ws-left','#writingPrompt','.wp-keys','.ws-ttl'];let anims=[];
  function aside(on,ms){anims.forEach(a=>{try{a.cancel();}catch(_){}});anims=[];
    // the move is added to whatever the element's own place is; the fading replaces its own opacity
    away.forEach(s=>document.querySelectorAll(s).forEach(el=>{const mv=[{translate:'0px 0px'},{translate:'-34vw 0px'}],op=[{opacity:1},{opacity:0}];if(!on){mv.reverse();op.reverse();}
      const o={duration:ms,easing:'cubic-bezier(.45,.05,.55,.95)',fill:on?'forwards':'none'};
      try{anims.push(el.animate(mv,Object.assign({composite:'add'},o)),el.animate(op,o));}catch(_){}}));}
  const pane=()=>document.querySelector('.wp-pane');let paneFade=null,paneT=0;
  function setTitle(){const t=bar()?.querySelector('.t b');if(!t)return;t._h='';const name=String(window.OCHERKI_BOOK_META?.title||'').trim();
    const h=/^Глава/.test(capText)?capText:`<span class="up">Книга</span> · ${capText||(name?`<i>${esc(name)}</i>`:'')}`;if(t.innerHTML!==h)t.innerHTML=h;}
  // the open spread's sheet becomes the sheet being written (for the editor and «Рукопись»)
  function syncSheet(){const s=window.__ocherkiSheetForSpread?.(cur);if(s?.pageUid){send({action:'select',sectionId:s.sectionId,pageUid:s.pageUid});window.OCHERKI_MANUSCRIPT?.preset?.(s.pageUid);}}
  // v250: the book is laid out only now, when it is opened. When it is not up to date the boy with the kite comes first («Собирается
  // книга») — and only once he is on the screen is the book laid out; then he goes and the book comes in
  const kite=document.createElement('div');kite.className='bk-kite';kite.setAttribute('aria-live','polite');
  kite.innerHTML='<img src="assets/book/kite.webp" alt="" draggable="false"><span>Собирается книга</span>';document.body.appendChild(kite);
  function open(){if(isOpen||busy||open.wait)return;let fresh=0;try{fresh=BK()?.fresh?.()||0;}catch(_){}
    if(fresh)return open1();
    open.wait=true;{const k=window.__ocKid?.()||'kite',im=kite.querySelector('img');im.src=`assets/book/${k==='kite'?'kite':k==='umbrella'?'girl-umbrella':'pier-jump'}.webp`;kite.dataset.kid=k;}kite.classList.add('on');
    // v258: the book is laid out in steps behind the boy (it held the page for a long time, up to «страница не отвечает»)
    setTimeout(()=>{const go=()=>{open.wait=false;open1();kite.classList.remove("on");};if(window.__ocherkiBookInSteps)window.__ocherkiBookInSteps(()=>requestAnimationFrame(()=>requestAnimationFrame(go)));else go();},700);}
  function open1(){try{open0();}catch(err){console.warn('book open',err);H.classList.remove('bk-on');board.classList.remove('on');isOpen=false;busy=false;}}
  function open0(){
    const B=BK();n=B?.ready?.()||0;if(!n){window.OCHERKI_SAY?.('В книге пока нечего показать — напишите хотя бы несколько строк');return;}
    const fromMs=H.classList.contains('rk-on');busy=true;isOpen=true;
    // the spread of the sheet being written — or of the one in the middle of «Рукопись» (and on which side its page lies)
    let uid='';try{uid=(fromMs&&window.OCHERKI_MANUSCRIPT?.centerUid?.())||frame()?.contentWindow?.currentPage?.()?.uid||'';}catch(_){}
    let side='right';cur=0;try{const pk=window.__ocherkiPeekPage?.(uid,fromMs?-1:(window.__ocherkiEditorRatio?.()??-1));if(pk){cur=Math.max(0,Math.min(n-1,pk.spread));side=pk.side;}}catch(_){}
    const from=fromMs?null:paneRect();
    H.classList.add('bk-on');measure();buildStrip();show(cur);plates();setTitle();try{BK().framing?.(spreadEl);}catch(_){}
    board.classList.add('on','bk-now');requestAnimationFrame(()=>requestAnimationFrame(()=>board.classList.remove('bk-now')));
    [cap,kl,kr].forEach(el=>el.animate([{opacity:0},{opacity:1}],{duration:600,delay:fromMs?300:520,easing:'ease-out',fill:'backwards'}));
    {const v=$('.bk-stripv'),t0=performance.now();v.style.opacity='0';
      const ims=[...strip.querySelectorAll('img')].map(i=>i.complete?(i.decode?i.decode().catch(()=>{}):null):new Promise(r=>{i.onload=i.onerror=r;}));
      Promise.race([Promise.all(ims),new Promise(r=>setTimeout(r,1400))]).then(()=>{const d=Math.max(0,(fromMs?300:520)-(performance.now()-t0));v.style.opacity='';v.animate([{opacity:0},{opacity:1}],{duration:600,delay:d,easing:'ease-out',fill:'backwards'});});}
    if(fromMs||fromAr){// from «Рукопись» (or from the archive, its things going aside at the same moment): the whole book comes in from the right
      clearTimeout(paneT);aside(true,0);H.classList.add('bk-paneoff');if(fromMs)window.OCHERKI_MANUSCRIPT?.close?.();
      board.animate([{translate:'100vw 0px'},{translate:'0px 0px'}],{duration:760,easing:'cubic-bezier(.2,.75,.25,1)'});}
    else{// from the editor: the desk goes off to the left, «Так ляжет» fades, the book comes in closed from the right (its cover up)
      // and, once it lies, opens — one leaf, straight on the spread of the sheet being written
      aside(true,760);const p=pane(),target=cur;
      if(p){paneFade=p.animate([{opacity:1},{opacity:0}],{duration:380,easing:'ease-out',fill:'forwards'});}
      if(target>0)show(0);
      const come=board.animate([{translate:'62vw 0px'},{translate:'0px 0px'}],{duration:900,easing:'cubic-bezier(.2,.7,.25,1)'});
      clearTimeout(paneT);paneT=setTimeout(()=>{if(isOpen)H.classList.add('bk-paneoff');},400);
      // the spread it opens on is made ready while the book comes in (its photographs decoded), so the leaf turns without a stumble
      let ready=Promise.resolve();if(target>0)try{const sp=BK().spread(target),tmp=document.createElement('div');
        tmp.style.cssText='position:fixed;left:-99999px;top:0;width:600px;height:600px;overflow:hidden;visibility:hidden;pointer-events:none';tmp.innerHTML=(sp?.left||'')+(sp?.right||'');document.body.appendChild(tmp);
        ready=Promise.race([Promise.all([...tmp.querySelectorAll('img')].map(i=>i.decode?i.decode().catch(()=>{}):null)),new Promise(r=>setTimeout(r,1600))]).then(()=>tmp.remove(),()=>tmp.remove());}catch(_){}
      const opened=()=>setTimeout(()=>{busy=false;if(isOpen&&target>0)turnTo(target);},140);Promise.all([come.finished.catch(()=>{}),ready]).then(opened,opened);return;}
    setTimeout(()=>{busy=false;},1300);}
  // to: 'write' — the page goes back into «Так ляжет», the desk comes back from the left; 'manuscript' — the book goes off to the
  // right whole and «Рукопись» opens on the open spread's sheet under it
  function close(to,after,tries=0){if(!isOpen){after?.();return;}if((busy||flipping)&&tries<15){setTimeout(()=>close(to,after,tries+1),200);return;}busy=true;syncSheet();pmenu.hidden=true;cmenu.hidden=true;const ft=document.querySelector('.photo-frame-tools');if(ft)ft.hidden=true;
    const p=pane(),end=ms=>setTimeout(()=>{H.classList.remove('bk-on');board.classList.remove('on');isOpen=false;busy=false;fill(L,'');fill(R,'');board.getAnimations().forEach(a=>a.cancel());},ms);
    if(to==='manuscript'){board.animate([{translate:'0px 0px'},{translate:'100vw 0px'}],{duration:700,easing:'cubic-bezier(.45,.05,.55,.95)',fill:'forwards'});
      // the desk is put back in its place under the book at once (where «Рукопись» measures the writing sheet), and «Рукопись» opens
      // over it in the same moment — its middle sheet lies on the writing sheet, the book goes off over both
      anims.forEach(x=>{try{x.cancel();}catch(_){}});anims=[];after?.();clearTimeout(paneT);paneT=setTimeout(()=>{H.classList.remove('bk-paneoff');try{paneFade?.cancel();}catch(_){}paneFade=null;},900);end(720);return;}
    board.classList.remove('on');aside(false,760);clearTimeout(paneT);H.classList.remove('bk-paneoff');try{paneFade?.cancel();}catch(_){}paneFade=null;
    const tr=paneRect();if(tr){const r=R.getBoundingClientRect();document.querySelector('.wp-pane .wp-page')?.animate([{translate:`${r.left-tr.left}px ${r.top-tr.top}px`},{translate:'0px 0px'}],{duration:760,easing:'cubic-bezier(.45,.05,.3,1)'});}
    end(780);setTimeout(()=>after?.(),790);}
  // ——— the spread's composition on the bar: ‹ › go through the ones that fit, the middle key lists them; the book is laid out anew
  // where it lies and stays on the spread of that photo
  const cmenu=document.createElement('div');cmenu.className='bk-cmenu';cmenu.hidden=true;document.body.appendChild(cmenu);
  function syncComp(){const c=BK()?.compositions?.(cur),w=bar();if(!w)return;w.querySelectorAll('.bkc').forEach(b=>b.classList.toggle('off',!c||!c.list.length));}
  function compose(id){if(!id||busy||flipping)return;busy=true;rustle();const at=BK().compose(cur,id);n=BK().ready();cur=Math.max(0,Math.min(n-1,at));
    buildStrip();show(cur);plates();busy=false;spreadEl.animate([{opacity:.35},{opacity:1}],{duration:420,easing:'ease-out'});
    const lab=BK().compositions(cur)?.list.find(x=>x.id===id)?.label;if(lab)window.OCHERKI_SHOW_TOAST?.(lab);}
  function step(dir){const c=BK()?.compositions?.(cur);if(!c||!c.list.length)return;const i=c.list.findIndex(x=>x.id===c.now);compose(c.list[((i<0?(dir>0?-1:0):i)+dir+c.list.length)%c.list.length].id);}
  addEventListener('click',e=>{if(!isOpen)return;const b=e.target.closest?.('.wc .bkc');if(!b){if(!cmenu.hidden&&!cmenu.contains(e.target))cmenu.hidden=true;return;}
    e.preventDefault();e.stopImmediatePropagation();const k=b.dataset.c;
    if(k==='cprev')step(-1);else if(k==='cnext')step(1);
    else{if(!cmenu.hidden){cmenu.hidden=true;return;}const c=BK()?.compositions?.(cur);if(!c)return;
      cmenu.innerHTML='<b>Композиция разворота</b>'+c.list.map(x=>`<button type="button" data-id="${esc(x.id)}"${x.id===c.now?' class="cur"':''}>${esc(x.label)}</button>`).join('');
      const r=b.getBoundingClientRect();Object.assign(cmenu.style,{left:Math.round(Math.min(innerWidth-260,r.left-110))+'px',top:Math.round(r.bottom+16)+'px'});cmenu.hidden=false;}},true);
  cmenu.addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(!b)return;cmenu.hidden=true;compose(b.dataset.id);});

  // «Книга» on the bar's keys opens the book on the desk (before the old ways under it hear the press)
  addEventListener('click',e=>{const k=e.target.closest?.('.oct .k[data-k="book"]');if(!k)return;e.preventDefault();e.stopImmediatePropagation();
    // from the archive: the archive goes first, then the book comes
    if(window.OCHERKI_ARCHIVE_DESK?.isOpen?.()){fromAr=true;window.OCHERKI_ARCHIVE_DESK.close(()=>{if(!isOpen)open();fromAr=false;},true);return;}if(!isOpen)open();},true);
  let fromAr=false;
  setInterval(()=>{if(isOpen&&!busy)setTitle();},800);
  // a photograph framed anew by the hand: its little spread in the strip is drawn again
  addEventListener('ocherki-photo-framed',()=>{if(!isOpen)return;pre.list[cur]=null;filled.delete(cur);fillSome();});
  window.OCHERKI_DESKBOOK={open,close,isOpen:()=>isOpen,turn,turnTo,cur:()=>cur};
})();
