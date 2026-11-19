// «Книга» (v234) — the book on the same desk. The writing sheet and the clean stack drift off to the left and go; «Так ляжет» comes
// to the middle of the desk and grows into its place in the book, and the other page of the spread opens out from the gutter. The
// book lies open in the middle: the director's own pages, by day in the window's light, at night under the lamp — the same light as
// the writing sheet's. Brass plates at the left: the design, the format, the photographs' colour (a press lays the book out anew);
// at the right: how many pages, the print, the file. Under the book a strip of all the spreads. The arrows, the wheel (one spread
// for one turn) and the keys turn the page — the leaf lifts and turns over the gutter, crisp, without a slow tail.
// Back to the editor the book closes into «Так ляжет», and the desk comes back from the left. The pages are the director's
// (window.__ocherkiBook); the light is the desk's (window.OCHERKI_DESK_LIGHT).
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  const H=document.documentElement,BK=()=>window.__ocherkiBook,esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const plural=(n,a,b,c)=>{const m=n%10,h=n%100;return m===1&&h!==11?a:m>=2&&m<=4&&(h<12||h>14)?b:c;};
  const rustle=()=>{try{window.OCHERKI_PLAY_PAGE_FX?.(.5);}catch(_){}};
  const frame=()=>document.getElementById('v35SheetFrame');
  const bar=()=>document.querySelector('.wc.wc-w:not(.bq-car)');
  let isOpen=false,busy=false,cur=0,n=0,geo=null,flipping=false;

  const board=document.createElement('div');board.className='bk-board';
  board.innerHTML='<div class="bk-cap"></div><div class="bk-spread"><div class="bk-pg bk-l"></div><div class="bk-pg bk-r"></div><i class="bk-gutter"></i></div>'+
    '<button type="button" class="bk-arrow bk-prev" aria-label="Предыдущий разворот">‹</button><button type="button" class="bk-arrow bk-next" aria-label="Следующий разворот">›</button>'+
    '<div class="bk-stripv"><div class="bk-strip"></div></div><div class="bk-keys bk-kl"></div><div class="bk-keys bk-kr"></div>';
  document.body.append(board);
  const $=s=>board.querySelector(s),spreadEl=$('.bk-spread'),L=$('.bk-l'),R=$('.bk-r'),cap=$('.bk-cap'),strip=$('.bk-strip'),kl=$('.bk-kl'),kr=$('.bk-kr');

  // ——— where everything lies: the spread in the middle of the desk under the bar, the plates at its sides, the strip under it
  function measure(){const b=bar()?.getBoundingClientRect(),[pw,ph]=BK()?.size?.()||[280,280];const W=innerWidth,Hh=innerHeight,top=(b?b.bottom:110)+44;
    const h=Math.max(240,Math.min(Hh-top-150,(W-2*250-160)/2*ph/pw)),w=h*pw/ph,left=(W-2*w)/2;
    geo={left,top,w,h};Object.assign(spreadEl.style,{left:left+'px',top:top+'px',width:2*w+'px',height:h+'px'});
    cap.style.top=(top-30)+'px';Object.assign($('.bk-stripv').style,{left:left+'px',top:(top+h+30)+'px',width:2*w+'px'});
    strip.style.setProperty('--tw',Math.round(2*TH*pw/ph)+'px');
    $('.bk-prev').style.cssText=`left:${left-70}px;top:${top+h/2}px`;$('.bk-next').style.cssText=`left:${left+2*w+24}px;top:${top+h/2}px`;
    Object.assign(kl.style,{left:Math.max(16,left-80-190)+'px',top:top+'px'});Object.assign(kr.style,{left:(left+2*w+90)+'px',top:top+'px'});
    // the light: the desk's own picture of the lamp, laid under each page from where it lies
    try{board.style.setProperty('--rk-beam',window.OCHERKI_DESK_LIGHT?.beam()||'none');}catch(_){}
    [L,R].forEach((pg,i)=>{const lt=pg.querySelector('.bk-lt');if(lt)lt.style.transform=`translate(${-(left+i*w)}px,${-top}px)`;});}
  const light='<i class="bk-lt"><b class="bk-sun"></b><b class="bk-beam"></b></i>';
  // a page as the director draws it, fitted to its place, with the desk's light over it
  function fill(el,html,side){el.innerHTML=html?`<div class="bk-host">${html}</div>${light}`:`<div class="bk-empty"></div>${light}`;el.classList.toggle('blank',!html);
    const i=side==='left'?0:1,lt=el.querySelector('.bk-lt');if(lt&&geo)lt.style.transform=`translate(${-(geo.left+i*geo.w)}px,${-geo.top}px)`;}
  function show(i){const sp=BK()?.spread(i);if(!sp)return;cur=i;fill(L,sp.left,'left');fill(R,sp.right,'right');BK()?.scale?.();caption(sp);paintStrip();}
  function caption(sp){sp=sp||BK()?.spread(cur);const t=String(sp?.title||'').replace(/^Глава\s*(\d+)\.?\s*/i,'Глава $1 · ');
    cap.textContent=`${t?t+' · ':''}разворот ${cur+1} из ${n}`;}
  // the strip: every spread in little, as it lies in the book (the director's own pages, as on the old book's strip); the open one
  // stands in the middle; a press goes to it. They are drawn nearest first, the rest while the hands rest (turning never waits)
  const TH=64;let filled=new Set(),fillT=0;
  function buildStrip(){filled=new Set();let h='';
    for(let k=0;k<n;k++)h+=`<button type="button" class="bk-th" data-k="${k}"><i class="bk-tl"></i><i class="bk-tr"></i></button>`;
    strip.innerHTML=h;paintStrip();}
  function fillSome(){cancelIdleCallback?.(fillT);const order=[...Array(n).keys()].filter(k=>!filled.has(k)).sort((a,b)=>Math.abs(a-cur)-Math.abs(b-cur));if(!order.length)return;
    const step=dl=>{let done=0;while(order.length&&(done<2||dl.timeRemaining()>8)){const k=order.shift(),t=BK()?.thumb(k),el=strip.children[k];if(!t||!el)continue;
        el.children[0].innerHTML=t.left;el.children[1].innerHTML=t.right;el.title=`${t.title?t.title+' · ':''}с. ${t.label}`;filled.add(k);done++;}
      BK()?.scale?.();if(order.length&&isOpen)fillT=(window.requestIdleCallback||(f=>setTimeout(()=>f({timeRemaining:()=>10}),60)))(step,{timeout:400});};
    fillT=(window.requestIdleCallback||(f=>setTimeout(()=>f({timeRemaining:()=>10}),60)))(step,{timeout:200});}
  function paintStrip(){[...strip.children].forEach((el,k)=>el.classList.toggle('cur',k===cur));const el=strip.children[cur],v=$('.bk-stripv');
    if(el&&v)strip.style.translate=`${Math.round(v.clientWidth/2-(el.offsetLeft+el.offsetWidth/2))}px 0`;fillSome();}
  strip.addEventListener('click',e=>{const t=e.target.closest('[data-k]');if(!t||flipping)return;const k=+t.dataset.k;if(k===cur)return;spreadEl.classList.add('bk-fade');rustle();
    setTimeout(()=>{show(k);spreadEl.classList.remove('bk-fade');},180);});

  // ——— the plates at the sides: the book's own settings (a press lays the book out anew), and what can be done with it
  function plates(){const B=BK();if(!B)return;const fm=B.formats(),f=fm.find(x=>x.key===B.format())||fm[0],pm=B.photoModes(),m=pm.find(x=>x.key===B.photoMode())||pm[0];
    kl.innerHTML=`<div class="bk-k" aria-disabled="true"><b>дизайн</b>${esc(B.design().name)}</div>`+
      `<button type="button" class="bk-k" data-set="format"><b>формат</b>${esc(f?.name||'')}<span>${esc(f?.dims||'')}</span></button>`+
      `<button type="button" class="bk-k" data-set="photo"><b>фото</b>${esc(m?.label||'')}</button>`;
    const pages=B.pages();
    kr.innerHTML=`<div class="bk-k" aria-disabled="true"><b>в книге</b>${pages} ${plural(pages,'страница','страницы','страниц')}</div>`+
      `<div class="bk-k bk-soon" aria-disabled="true"><b>заказ</b>напечатать<span>скоро</span></div>`+
      `<div class="bk-k bk-soon" aria-disabled="true"><b>файл</b>PDF<span>скоро</span></div>`;}
  kl.addEventListener('click',e=>{const b=e.target.closest('[data-set]');if(!b||busy)return;const B=BK();
    const next=(list,now)=>{const i=list.findIndex(x=>x.key===now);return list[(i+1)%list.length].key;};
    // the book steps back a little, is laid out anew, and comes forward again
    busy=true;spreadEl.classList.add('bk-fade');rustle();
    setTimeout(()=>{if(b.dataset.set==='format')B.setFormat(next(B.formats(),B.format()));else B.setPhotoMode(next(B.photoModes(),B.photoMode()));
      n=B.ready();cur=Math.min(cur,n-1);measure();buildStrip();show(cur);plates();requestAnimationFrame(()=>{spreadEl.classList.remove('bk-fade');busy=false;});},260);});

  // ——— turning the page: the leaf lifts and turns over the gutter (crisp, no slow tail); under it the next spread is already there
  function turn(dir){if(!isOpen||flipping||busy)return;const to=cur+dir;if(to<0||to>=n)return;const now=BK().spread(cur),nx=BK().spread(to);if(!now||!nx)return;
    flipping=true;rustle();
    const leaf=document.createElement('div');leaf.className='bk-leaf '+(dir>0?'fwd':'back');
    // forward: the right page turns over to the left — its back is the next spread's left page; back: the other way round
    leaf.innerHTML=`<div class="bk-face front">${dir>0?(now.right?`<div class="bk-host">${now.right}</div>`:''):(now.left?`<div class="bk-host">${now.left}</div>`:'')}</div>`+
      `<div class="bk-face backf">${dir>0?(nx.left?`<div class="bk-host">${nx.left}</div>`:''):(nx.right?`<div class="bk-host">${nx.right}</div>`:'')}</div>`;
    spreadEl.appendChild(leaf);
    // under the leaf: the page it leaves bare is the next spread's already
    if(dir>0)fill(R,nx.right,'right');else fill(L,nx.left,'left');
    BK().scale();
    requestAnimationFrame(()=>requestAnimationFrame(()=>leaf.classList.add('go')));
    setTimeout(()=>{cur=to;if(dir>0)fill(L,nx.left,'left');else fill(R,nx.right,'right');BK().scale();leaf.remove();caption(nx);paintStrip();flipping=false;},560);}
  $('.bk-prev').addEventListener('click',()=>turn(-1));$('.bk-next').addEventListener('click',()=>turn(1));
  let lastTurn=0;
  board.addEventListener('wheel',e=>{if(!isOpen)return;e.preventDefault();const now=performance.now();if(now-lastTurn<620||Math.abs(e.deltaY)<20)return;lastTurn=now;turn(e.deltaY>0?1:-1);},{passive:false});
  addEventListener('keydown',e=>{if(!isOpen)return;if(e.key==='ArrowRight'||e.key==='PageDown')turn(1);else if(e.key==='ArrowLeft'||e.key==='PageUp')turn(-1);else if(e.key==='Escape')window.OCHERKI_SET_MODE?.('write');});
  addEventListener('resize',()=>{if(isOpen){measure();show(cur);}});

  // ——— coming and going: the desk drifts off to the left, «Так ляжет» comes to the middle and becomes its page in the book, the
  // other page opens out from the gutter; going back the same the other way
  const away=['#editorPaperWrap .editor-paper','.ws-left','#writingPrompt','.wp-keys','.ws-ttl'];let anims=[];
  function aside(on,ms){anims.forEach(a=>{try{a.cancel();}catch(_){}});anims=[];
    // the move is added to whatever the element's own place is; the fading replaces its own opacity
    away.forEach(s=>document.querySelectorAll(s).forEach(el=>{const mv=[{translate:'0px 0px'},{translate:'-34vw 0px'}],op=[{opacity:1},{opacity:0}];if(!on){mv.reverse();op.reverse();}
      const o={duration:ms,easing:'cubic-bezier(.45,.05,.55,.95)',fill:on?'forwards':'none'};
      try{anims.push(el.animate(mv,Object.assign({composite:'add'},o)),el.animate(op,o));}catch(_){}}));}
  const paneRect=()=>{const p=document.querySelector('.wp-pane .wp-page');const r=p?.getBoundingClientRect();return r&&r.width&&shell.classList.contains('wp-on')?r:null;};
  function setTitle(){const t=bar()?.querySelector('.t b');if(!t)return;t._h='';const name=String(window.OCHERKI_BOOK_META?.title||'').trim();
    const h=`<span class="up">Книга</span>${name?` · <i>${esc(name)}</i>`:''}`;if(t.innerHTML!==h)t.innerHTML=h;}
  function open(){if(isOpen||busy)return;if(H.classList.contains('rk-on')){window.OCHERKI_SET_MODE?.('write');setTimeout(open,1100);return;}
    const B=BK();n=B?.ready?.()||0;if(!n){window.OCHERKI_SAY?.('В книге пока нечего показать — напишите хотя бы несколько строк');return;}
    busy=true;isOpen=true;
    // the spread of the sheet being written (and on which side its page lies)
    let uid='';try{uid=frame()?.contentWindow?.currentPage?.()?.uid||'';}catch(_){}
    let side='right';try{const pk=window.__ocherkiPeekPage?.(uid,window.__ocherkiEditorRatio?.()??-1);if(pk){cur=Math.max(0,Math.min(n-1,pk.spread));side=pk.side;}}catch(_){cur=0;}
    H.classList.add('bk-on');measure();buildStrip();show(cur);plates();setTitle();
    const from=paneRect(),pageEl=side==='left'?L:R,other=side==='left'?R:L,to=pageEl.getBoundingClientRect();
    board.classList.add('on');aside(true,760);
    if(from){// «Так ляжет» grows into its page: the page starts where the pane's page lies and comes to its place
      const dx=from.left-to.left,dy=from.top-to.top,s=from.width/to.width;
      pageEl.animate([{translate:`${dx}px ${dy}px`,scale:s},{translate:'0px 0px',scale:1}],{duration:720,easing:'cubic-bezier(.3,.1,.2,1)',fill:'backwards'});
      document.querySelector('.wp-pane').style.visibility='hidden';
      other.animate([{transform:'perspective(2200px) rotateY('+(side==='left'?-92:92)+'deg)',opacity:0},{transform:'perspective(2200px) rotateY('+(side==='left'?-92:92)+'deg)',opacity:0,offset:.62},{transform:'none',opacity:1}],{duration:1180,easing:'cubic-bezier(.25,.1,.25,1)'});}
    else spreadEl.animate([{opacity:0,scale:.97},{opacity:1,scale:1}],{duration:600,easing:'ease-out'});
    setTimeout(()=>{busy=false;},1200);}
  function close(after){if(!isOpen){after?.();return;}if(busy){setTimeout(()=>close(after),200);return;}busy=true;
    const pane=document.querySelector('.wp-pane');const back=()=>{if(pane)pane.style.visibility='';};
    // the open spread closes: the page of the sheet goes back into «Так ляжет», the desk comes back from the left
    board.classList.remove('on');aside(false,760);back();
    const to=paneRect();if(to){const p=R.getBoundingClientRect();const dx=p.left-to.left,dy=p.top-to.top,s=p.width/to.width;
      document.querySelector('.wp-pane .wp-page')?.animate([{translate:`${dx}px ${dy}px`,scale:s,transformOrigin:'0 0'},{translate:'0px 0px',scale:1,transformOrigin:'0 0'}],{duration:720,easing:'cubic-bezier(.3,.1,.2,1)'});}
    setTimeout(()=>{H.classList.remove('bk-on');isOpen=false;busy=false;L.innerHTML='';R.innerHTML='';after?.();},780);}
  // «Книга» on the bar's keys opens the book on the desk (before the old ways under it hear the press)
  addEventListener('click',e=>{const k=e.target.closest?.('.oct .k[data-k="book"]');if(!k)return;e.preventDefault();e.stopImmediatePropagation();if(!isOpen)open();},true);
  setInterval(()=>{if(isOpen&&!busy)setTitle();},800);
  window.OCHERKI_DESKBOOK={open,close,isOpen:()=>isOpen,turn,show:i=>{if(isOpen)show(i);},cur:()=>cur};
})();
