// «Рукопись» (v228) — the chapter's sheets on the same desk, as little changed as can be.
// The writing sheet stays where it is: the sheet in the middle IS it (its size, its place). The clean stack at the left becomes the
// pile of the sheets already passed (the one just before on top), its plate names the chapter — «Глава 1 · Карс · 3 из 9»; a press
// on the plate shows every sheet of the chapter by its number and first words, to go straight to one. «Так ляжет» goes off to the
// right and the sheets still to come fan out there from under the middle one, each smaller and lying deeper than the one before.
// The chapters stand as tabs along the right edge (with «Начало книги», «Конец книги» and «+ глава»). The clock and the signature
// stay. The wheel (or the arrows) moves one sheet: the middle one goes onto the pile, the next comes to the middle. A press on a
// sheet in the fan brings it to the middle; a press on the middle one opens it for writing (the desk simply comes back round it).
// A sheet is carried with the hand — the neighbours part where it would go; held over a chapter's tab the chapter opens under the
// hand; let go on a tab, it goes to that chapter's end. «переместить…» on the middle sheet does the same without carrying.
// Every move can be taken back («вернуть») for a few seconds. The bar's back key («все главы») shows all the chapters as stacks.
// By day the window's picture lies on every sheet as on the desk, the deeper sheets darker; at night the lamp's beam — the same
// edges and tones as on «Так ляжет» — lights them by where they lie.
// All is done by the sheet's own commands (OCHERKI_STRUCTURE_COMMAND).
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  const H=document.documentElement;
  const frame=()=>document.getElementById('v35SheetFrame');
  const send=cmd=>{try{frame()?.contentWindow?.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',...cmd},'*');}catch(_){}};
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const plural=(n,a,b,c)=>{const m=n%10,h=n%100;return m===1&&h!==11?a:m>=2&&m<=4&&(h<12||h>14)?b:c;};
  const sheetsWord=n=>`${n} ${plural(n,'лист','листа','листов')}`;
  const sel=u=>`.rk-sh[data-u="${CSS.escape(u)}"]`;
  const rustle=()=>{try{window.OCHERKI_PLAY_PAGE_FX?.(.45);}catch(_){}};
  const words=t=>String(t||'').replace(/\s+/g,' ').trim();
  let st=null,isOpen=false,busy=false,activeUid='',view=null,drag=null,lit='',desk=null,scroll=0,want=0;
  addEventListener('message',e=>{const d=e.data||{};
    if(d.type==='OCHERKI_STRUCTURE_STATE'){st=d.payload||st;if(isOpen&&!drag&&!busy)render();}
    if(d.type==='OCHERKI_ACTIVE_STATE'&&d.payload?.pageUid)activeUid=d.payload.pageUid;});

  const board=document.createElement('div');board.className='rk-board';
  board.innerHTML='<div class="rk-all"></div><div class="rk-ch"><div class="rk-plate" role="button"></div><div class="rk-fan"></div>'+
    '<div class="rk-tabs"></div><div class="rk-adds"><button type="button" data-a="page">+ лист</button><button type="button" data-a="episode">+ эпизод</button></div>'+
    '<div class="rk-jump" hidden></div><div class="rk-move" hidden></div></div><div class="rk-undo"><span></span><button type="button">вернуть</button></div><div class="rk-backlab">все главы</div>';
  document.body.append(board);
  const $=s=>board.querySelector(s);
  const all=$('.rk-all'),chEl=$('.rk-ch'),fan=$('.rk-fan'),plate=$('.rk-plate'),tabs=$('.rk-tabs'),adds=$('.rk-adds'),jump=$('.rk-jump'),moveEl=$('.rk-move'),undoEl=$('.rk-undo'),backLab=$('.rk-backlab');

  // ——— the book in groups: «Начало книги», each chapter, «Конец книги»
  const groups=()=>{const S=(st?.sections||[]).filter(s=>s.included!==false);const first=S.findIndex(s=>s.type==='chapter');let last=-1;S.forEach((s,i)=>{if(s.type==='chapter')last=i;});
    const sheets=list=>list.flatMap(s=>(s.pages||[]).filter(p=>p.included!==false).map(p=>({s,p})));
    const out=[],before=first<0?S:S.slice(0,first),after=last<0?[]:S.slice(last+1);let n=0;
    if(before.length)out.push({key:'begin',kind:'part',word:'Начало книги',name:'',note:before.map(s=>s.title).join(' · '),sheets:sheets(before)});
    S.forEach(s=>{if(s.type!=='chapter')return;n++;out.push({key:s.id,kind:'chapter',sec:s,word:`Глава ${n}`,name:String(s.title||'').replace(/^Глава\s*\d+\.?\s*/i,''),sheets:sheets([s])});});
    if(after.length)out.push({key:'end',kind:'part',word:'Конец книги',name:'',note:after.map(s=>s.title).join(' · '),sheets:sheets(after)});
    out.forEach(g=>{g.photos=g.sheets.flatMap(x=>(x.p.photos||[]).filter(q=>q&&q.src&&!q.isDocument)).slice(0,3);g.nph=g.sheets.reduce((a,x)=>a+(x.p.photos||[]).filter(q=>q&&q.src).length,0);
      g.first=words(g.sheets.find(x=>words(x.p.text))?.p.text).slice(0,110);});
    return out;};
  const gOf=uid=>groups().find(g=>g.sheets.some(x=>x.p.uid===uid));

  // ——— the desk's places, measured on the desk itself (the same on every screen)
  const bar=()=>document.querySelector('.wc.wc-w:not(.bq-car)');
  function measureDesk(){const w=document.getElementById('editorPaperWrap'),p=w?.querySelector('.editor-paper');const sh=w?parseFloat(getComputedStyle(w).translate)||0:0;
    const r=p?.getBoundingClientRect(),L=document.querySelector('.ws-left'),T=document.querySelector('.ws-tabs'),b=bar()?.getBoundingClientRect();
    const box=el=>{if(!el)return null;const q=el.getBoundingClientRect(),t=parseFloat(getComputedStyle(el).translate)||0;return q.width?{left:q.left-t,top:q.top,width:q.width,height:q.height}:null;};
    desk={paper:r&&r.width?{left:r.left-sh,top:r.top,width:r.width,height:r.height}:{left:innerWidth/2-330,top:110,width:660,height:900},
      pile:box(L),plate:box(T),bar:b&&b.width?{left:b.left,right:b.right,top:b.top,bottom:b.bottom,height:b.height,width:b.width}:null};
    const P=desk.paper;if(!desk.pile){const w=P.width*.52;desk.pile={left:P.left-w-108,top:P.top+P.height*.22,width:w,height:w/.707};}
    if(!desk.plate){const pl=desk.pile;desk.plate={left:pl.left-10,top:pl.top-62,width:pl.width+20,height:46};}
    // the tabs' column at the right edge, and how much of the fan fits before it
    const tw=Math.round(Math.max(118,Math.min(178,innerWidth*.085)));desk.tabs={left:innerWidth-tw-14,width:tw};
    // the sheets go under the bar's lower edge, as the writing sheet does
    board.style.setProperty('--rk-top',Math.round(desk.bar?desk.bar.bottom-14:0)+'px');return desk;}

  // ——— a sheet's place: d steps from the middle (0 the middle; below 0 — on the pile; above — the fan, each smaller and deeper)
  const SC=[1,.86,.75,.66,.58,.52],VIS=[0,.225,.177,.138,.108,.09];
  let fanN=4;
  const slot=d=>{const P=desk.paper;
    if(d===0)return{x:P.left,y:P.top,s:1,r:0,z:50,o:1};
    if(d<0){const L=desk.pile,a=-d,s=L.width/P.width;return{x:L.left+Math.min(a-1,4)*3,y:L.top+Math.min(a-1,4)*3,s,r:(a%2?-1:1)*Math.min(a-1,4)*.4,z:30-Math.min(a,9),o:a>6?0:1};}
    const a=Math.min(d,fanN+1);let edge=P.left+P.width,x=0,y=0,s=1;
    for(let k=1;k<=a;k++){s=SC[Math.min(k,5)];const w=P.width*s,h=P.height*s;x=edge+P.width*VIS[Math.min(k,5)]-w;y=P.top+(P.height-h)*.45+k*10*(P.height/944);edge=x+w;}
    return{x,y,s,r:Math.min(d,fanN)*1.2,z:50-d,o:d>fanN?0:1,depth:d};};
  const tr=p=>`translate(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px) rotate(${p.r}deg) scale(${p.s})`;
  const sheetHtml=(x,k)=>{const p=x.p,doc=p.type==='document'||p.bookRole==='document',ph=(p.photos||[]).find(q=>q&&q.src);
    const ep=doc?(p.title||'документ'):(p.isEpisodeStart?String(p.episode||'').replace(/^Эпизод\s*\d+\.?\s*/i,''):'');
    return `<div class="rk-n">${k+1}</div>${ep?`<div class="rk-ep">${esc(ep)}</div>`:''}<p>${esc(words(p.text).slice(0,900))}</p>${ph?`<img src="${esc(ph.src)}" alt="">`:''}<i class="rk-lamp"></i><button type="button" class="rk-mv">переместить…</button>`;};

  // ——— the light. By day the window's picture laid from where the sheet lies (scaled back with it) and the deeper sheets darker;
  // at night the lamp's beam: its edges run from the bar's ends down and out, as on «Так ляжет» and the stack
  function beamOf(r){const b=desk.bar;if(!b)return'';const x0=b.left+44,x1=b.right-44,y=b.top+b.height*.9,sp=b.width*.3,Hh=innerHeight*1.04;
    const edge=(ex,dxs)=>{let dx=dxs,dy=Hh-y;const l=Math.hypot(dx,dy);dx/=l;dy/=l;const nx=dxs>0?dy:-dy,ny=dxs>0?-dx:dx,A=Math.atan2(nx,-ny),
      L=Math.abs(r.w*Math.sin(A))+Math.abs(r.h*Math.cos(A)),t=50+((ex-(r.x+r.w/2))*nx+(y-(r.y+r.h/2))*ny)/L*100;
      return `linear-gradient(${(A*180/Math.PI).toFixed(1)}deg,rgba(150,100,50,0) ${(t-4).toFixed(1)}%,rgba(110,74,42,.5) ${(t+14).toFixed(1)}%,rgba(46,28,12,.7) ${(t+38).toFixed(1)}%)`;};
    return edge(x1,sp)+','+edge(x0,-sp)+',linear-gradient(180deg,rgba(160,105,50,.04) 0%,rgba(140,90,42,.2) 55%,rgba(95,60,28,.46) 100%)';}
  function lightSheet(el,p){const P=desk.paper,w=P.width*p.s,h=P.height*p.s;
    el.style.setProperty('--ox',(-p.x/p.s).toFixed(1)+'px');el.style.setProperty('--oy',(-p.y/p.s).toFixed(1)+'px');el.style.setProperty('--sc',p.s);
    el.style.setProperty('--dim',p.depth?Math.max(.8,1-.05*p.depth).toFixed(3):1);
    const lm=el.querySelector('.rk-lamp');if(lm){const bg=beamOf({x:p.x,y:p.y,w,h});if(lm._bg!==bg){lm._bg=bg;lm.style.background=bg;}}}

  // ——— the open chapter
  let G=null,center=0,order=[];
  function renderFan(keepCenter,fromMiddle){const gs=groups();G=gs.find(g=>g.key===view.key)||null;if(!G){view=null;return renderAll();}
    const n=G.sheets.length;order=G.sheets.map(x=>x.p.uid);
    {const i=view.focus?order.indexOf(view.focus):-1;if(i>=0){center=i;view.focus=null;}else if(!keepCenter){const j=order.indexOf(activeUid);center=j>=0?j:0;}}center=Math.max(0,Math.min(n-1,center));
    // how many sheets of the fan fit before the tabs
    {const P=desk.paper;let edge=P.left+P.width;fanN=0;for(let k=1;k<=5;k++){edge+=P.width*VIS[k];if(edge>desk.tabs.left-12)break;fanN=k;}fanN=Math.max(1,fanN);}
    fan.style.setProperty('--w',desk.paper.width+'px');fan.style.setProperty('--h',desk.paper.height+'px');
    const have=new Map([...fan.children].map(el=>[el.dataset.u,el]));let fresh=false;
    G.sheets.forEach((x,k)=>{let el=have.get(x.p.uid);have.delete(x.p.uid);
      if(!el){el=document.createElement('div');el.className='rk-sh';el.dataset.u=x.p.uid;fan.appendChild(el);fresh=true;
        // new sheets come out from under the middle sheet (or in from the right edge)
        el.style.transform=tr(fromMiddle?slot(0):slot(fanN+1));el.style.opacity=k===center&&fromMiddle?1:0;}
      el.dataset.s=x.s.id;el.dataset.k=k;el.classList.toggle('doc',x.p.type==='document');el.classList.toggle('rib',!!x.p.isEpisodeStart);
      const html=sheetHtml(x,k);if(el._h!==html){el._h=html;el.innerHTML=html;}});
    have.forEach(el=>el.remove());if(fresh)fan.getBoundingClientRect();
    layFan();renderPlate();renderTabs();adds.hidden=G.kind!=='chapter';setBarTitle();}
  function layFan(){const ids=drag?.fan||order,c=drag?.fan?drag.c:center;
    ids.forEach((u,k)=>{if(u==='__gap')return;const el=fan.querySelector(sel(u));if(!el||el===drag?.el)return;const p=slot(k-c);
      el._p=p;el.style.transform=tr(p);el.style.zIndex=p.z;el.style.opacity=p.o;el.style.pointerEvents=p.o?'':'none';el.classList.toggle('mid',k===c);el.classList.toggle('past',k<c);lightSheet(el,p);});
    renderPlate();}
  function go(to){if(!G)return;to=Math.max(0,Math.min(order.length-1,to));if(to===center)return;center=to;rustle();layFan();}
  // the plate over the pile: the chapter, where we are in it; a press shows all its sheets
  function renderPlate(){if(!G)return;const pl=desk.plate;Object.assign(plate.style,{left:pl.left+'px',top:pl.top+'px',width:pl.width+'px',height:pl.height+'px'});
    const h=`<b>${esc(G.word)}</b>${G.name?`<i>${esc(G.name)}</i>`:''}<span>${center+1} из ${order.length}</span>`;if(plate._h!==h){plate._h=h;plate.innerHTML=h;}}
  function renderTabs(){const gs=groups();Object.assign(tabs.style,{left:desk.tabs.left+'px',width:desk.tabs.width+'px',top:(desk.bar?desk.bar.bottom+24:140)+'px'});
    adds.style.right=Math.round(innerWidth-desk.tabs.left+28)+'px';
    tabs.innerHTML=gs.map(g=>`<div class="rk-tab${g.key===G?.key?' cur':''}${g.kind==='chapter'?' ch':''}" data-g="${esc(g.key)}"><b>${esc(g.word)}</b>${g.name?`<i>${esc(g.name)}</i>`:''}<span>${sheetsWord(g.sheets.length)}</span></div>`).join('')+'<div class="rk-tab rk-tabnew" role="button">+ глава</div>';}

  // ——— all the chapters as stacks (the bar's back key)
  const PH=[[16,6,-5],[92,12,4],[50,44,-2]];
  const stackHtml=(g,cur)=>{const n=g.sheets.length,layers=Math.max(1,Math.min(6,1+Math.ceil(n/3)));let h='';
    for(let k=layers;k>0;k--)h+=`<i class="rk-ly" style="--k:${k};--sg:${k%2?1:-1}"></i>`;
    h+=`<div class="rk-top"><b>${esc(g.word)}</b>${g.name?`<h3>${esc(g.name)}</h3>`:''}<i class="rk-orn"></i>`+
      (g.photos.length?`<div class="rk-phs">${g.photos.map((q,k)=>`<img src="${esc(q.src)}" alt="" style="left:${PH[k][0]}px;top:${PH[k][1]}px;transform:rotate(${PH[k][2]}deg)">`).join('')}</div>`
        :`<div class="rk-first">${esc(g.kind==='part'?g.note:(g.first?`«${g.first}…»`:'пока пусто'))}</div>`)+`<span>${sheetsWord(n)}${g.nph?` · ${g.nph} фото`:''}</span><i class="rk-lamp"></i></div>`;
    return `<div class="rk-st${cur?' cur':''}${g.kind==='chapter'?' ch':''}" data-g="${esc(g.key)}">${h}</div>`;};
  function renderAll(){const gs=groups(),curKey=gOf(activeUid)?.key;
    // the stacks keep clear of the clock's column at the left and of the tabs at the right
    const left=desk.pile.left+desk.pile.width+40;Object.assign(all.style,{left:left+'px',right:'28px'});
    all.innerHTML=gs.map(g=>stackHtml(g,g.key===curKey)).join('')+'<div class="rk-st rk-new" role="button">+ глава</div>';glideAll(true);lightAll();setBarTitle();}
  function glideAll(now){const t=desk.bar?desk.bar.bottom:120,max=Math.max(0,all.scrollHeight-(innerHeight-t-60));want=Math.max(0,Math.min(max,want));if(now)scroll=want;
    all.style.transform=`translateY(${Math.round(t+34-scroll)}px)`;}
  let gl=0;const glide=()=>{if(gl)return;const step=()=>{const d=want-scroll;if(Math.abs(d)<.5){scroll=want;gl=0;glideAll();lightAll();return;}scroll+=d*.18;glideAll();gl=requestAnimationFrame(step);};gl=requestAnimationFrame(step);};
  function lightAll(){all.querySelectorAll('.rk-st:not(.rk-new)').forEach(el=>{const r=el.getBoundingClientRect();if(!r.width)return;
    el.style.setProperty('--ox',(-r.left).toFixed(1)+'px');el.style.setProperty('--oy',(-r.top).toFixed(1)+'px');el.style.setProperty('--sc',1);
    const lm=el.querySelector('.rk-lamp');if(lm)lm.style.background=beamOf({x:r.left,y:r.top,w:r.width,h:r.height});});}
  new MutationObserver(()=>{if(isOpen&&G)layFan();}).observe(shell,{attributes:true,attributeFilter:['class']});

  function render(){if(!view){chEl.classList.remove('on');all.classList.add('on');renderAll();}else{all.classList.remove('on');chEl.classList.add('on');renderFan(true);}}
  // into a chapter: its sheets come out from under the middle; back to all chapters: they go back under it and the stacks come
  function openChapter(key,focus){view={key,focus};fan.innerHTML='';all.classList.remove('on');chEl.classList.add('on');renderFan(false,true);rustle();}
  function back(){if(!isOpen||busy)return false;closePops();if(!view)return false;busy=true;
    fan.querySelectorAll('.rk-sh').forEach(el=>{el.style.transform=tr(slot(0));if(!el.classList.contains('mid'))el.style.opacity=0;});rustle();
    setTimeout(()=>{view=null;G=null;fan.innerHTML='';chEl.classList.remove('on');all.classList.add('on');renderAll();busy=false;},460);return true;}

  // ——— the wheel: one sheet for one gesture; in all the chapters it glides
  let acc=0,idleT=0,inGesture=false,lastTurn=0;
  board.addEventListener('wheel',e=>{if(!isOpen)return;if(e.target.closest('.rk-jump,.rk-move,.rk-tabs'))return;e.preventDefault();const dy=e.deltaMode===1?e.deltaY*33:e.deltaY;
    if(!view){want+=dy;glide();return;}
    clearTimeout(idleT);idleT=setTimeout(()=>{inGesture=false;acc=0;},170);acc+=dy;const now=performance.now();
    if(Math.abs(acc)<36)return;if(inGesture&&now-lastTurn<650)return;inGesture=true;lastTurn=now;go(center+(acc>0?1:-1));acc=0;},{passive:false});
  addEventListener('keydown',e=>{if(!isOpen||!view||drag)return;if(e.key==='ArrowRight'||e.key==='ArrowDown')go(center+1);else if(e.key==='ArrowLeft'||e.key==='ArrowUp')go(center-1);else if(e.key==='Escape'){if(!closePops())back();}});
  addEventListener('resize',()=>{if(isOpen){const wasOn=H.classList.contains('rk-on');H.classList.remove('rk-hide');measureDesk();if(wasOn)H.classList.add('rk-hide');render();}});

  // ——— the plate's list: every sheet by its number and first words — a press goes straight to it
  plate.addEventListener('click',()=>{if(!G)return;if(!jump.hidden){jump.hidden=true;return;}closePops();
    jump.innerHTML=`<b>${esc(G.word)}${G.name?' · '+esc(G.name):''}</b>`+G.sheets.map((x,k)=>`<button type="button" data-k="${k}"${k===center?' class="cur"':''}><em>${k+1}</em>${esc(words(x.p.isEpisodeStart?(x.p.episode||''):'')||'')}${x.p.isEpisodeStart?' — ':''}${esc(words(x.p.text).slice(0,70)||'пустой лист')}</button>`).join('');
    const pl=desk.plate;Object.assign(jump.style,{left:pl.left+'px',top:(pl.top+pl.height+8)+'px',width:Math.max(pl.width,320)+'px',maxHeight:(innerHeight-pl.top-pl.height-40)+'px'});jump.hidden=false;
    jump.querySelector('.cur')?.scrollIntoView({block:'center'});});
  jump.addEventListener('click',e=>{const b=e.target.closest('button[data-k]');if(!b)return;jump.hidden=true;go(+b.dataset.k);});
  const closePops=()=>{const was=!jump.hidden||!moveEl.hidden;jump.hidden=true;moveEl.hidden=true;return was;};

  // ——— «переместить…»: to another chapter, at its beginning, after one of its sheets, or at its end — without carrying
  function openMove(el){closePops();const uid=el.dataset.u,from=G;const gs=groups().filter(g=>g.kind==='chapter');
    const list=g=>`<b>${esc(g.word)}${g.name?' · '+esc(g.name):''}</b><button type="button" data-to="${esc(g.key)}" data-at="0">в начало</button>`+
      g.sheets.map((x,k)=>x.p.uid===uid?'':`<button type="button" data-to="${esc(g.key)}" data-at="${k+1}"><em>после ${k+1}</em>${esc(words(x.p.text).slice(0,46)||'пустой лист')}</button>`).join('');
    moveEl.innerHTML=`<div class="rk-mvch">${gs.map(g=>`<button type="button" data-g="${esc(g.key)}"${g.key===from.key?' class="cur"':''}>${esc(g.word)}${g.name?`<i>${esc(g.name)}</i>`:''}</button>`).join('')}</div><div class="rk-mvat">${list(gs.find(g=>g.key===from.key)||gs[0])}</div>`;
    const r=el.getBoundingClientRect();Object.assign(moveEl.style,{left:Math.min(innerWidth-560,r.right-480)+'px',top:Math.max(80,r.bottom-460)+'px'});moveEl.hidden=false;moveEl._uid=uid;
    moveEl.querySelector('.rk-mvch').addEventListener('click',e=>{const b=e.target.closest('button[data-g]');if(!b)return;moveEl.querySelectorAll('.rk-mvch button').forEach(x=>x.classList.toggle('cur',x===b));moveEl.querySelector('.rk-mvat').innerHTML=list(gs.find(g=>g.key===b.dataset.g));});}
  moveEl.addEventListener('click',e=>{const b=e.target.closest('button[data-to]');if(!b)return;moveEl.hidden=true;const uid=moveEl._uid;let at=+b.dataset.at;
    const g=groups().find(x=>x.key===b.dataset.to);const fromG=gOf(uid);if(!g||!fromG)return;
    if(g.key===fromG.key){const ids=order.filter(u=>u!==uid);const before=order.indexOf(uid);if(at>before)at--;ids.splice(at,0,uid);commitOrder(ids,uid);}
    else carryOver(uid,fromG,g,at);});

  // ——— «вернуть»: every move can be taken back for a few seconds
  let undoFn=null,undoT=0;
  function offerUndo(text,fn){undoFn=fn;undoEl.querySelector('span').textContent=text;undoEl.classList.add('on');clearTimeout(undoT);undoT=setTimeout(()=>{undoEl.classList.remove('on');undoFn=null;},7000);}
  undoEl.querySelector('button').addEventListener('click',()=>{const f=undoFn;undoFn=null;undoEl.classList.remove('on');f?.();});
  function commitOrder(ids,uid){const prev=order.slice(),sec=G.sec;if(!sec)return;order=ids;center=ids.indexOf(uid);layFan();send({action:'reorderPages',sectionId:sec.id,ids});
    shine(uid);offerUndo('Лист переставлен',()=>{view.focus=uid;send({action:'reorderPages',sectionId:sec.id,ids:prev});});}
  function carryOver(uid,fromG,toG,at){const was=fromG.sheets.findIndex(x=>x.p.uid===uid);
    send({action:'movePage',sectionId:fromG.sec.id,toSectionId:toG.sec.id,pageUid:uid,...(at>=0?{toIndex:at}:{})});view={key:toG.key,focus:uid};fan.innerHTML='';shine(uid);
    offerUndo(`Лист перенесён в «${toG.word}${toG.name?' · '+toG.name:''}»`,()=>{view={key:fromG.key,focus:uid};fan.innerHTML='';send({action:'movePage',sectionId:toG.sec.id,toSectionId:fromG.sec.id,pageUid:uid,toIndex:was});});}
  const shine=uid=>{lit=uid;setTimeout(()=>{if(lit===uid){lit='';fan.querySelector(sel(uid))?.classList.remove('lit');}},1800);requestAnimationFrame(()=>fan.querySelector(sel(uid))?.classList.add('lit'));};

  // ——— presses and carrying
  adds.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!G?.sec)return;view.focus='__last';
    if(b.dataset.a==='page')send({action:'addPageAt',sectionId:G.sec.id});else send({action:'addEpisode',sectionId:G.sec.id,atEnd:true});});
  all.addEventListener('click',e=>{if(e.target.closest('.rk-new')){send({action:'addChapter'});want=1e9;}});
  tabs.addEventListener('click',e=>{if(e.target.closest('.rk-tabnew')){view={key:'__newch'};send({action:'addChapter'});return;}const t=e.target.closest('.rk-tab[data-g]');if(!t||t.dataset.g===G?.key)return;openChapter(t.dataset.g);});
  board.addEventListener('pointerdown',e=>{if(e.button!==0||busy)return;if(e.target.closest('.rk-mv')){e.preventDefault();openMove(e.target.closest('.rk-sh'));return;}
    if(!e.target.closest('.rk-jump,.rk-move'))closePops();
    const sh=e.target.closest('.rk-sh'),stack=e.target.closest('.rk-all .rk-st:not(.rk-new)');if(!sh&&!stack)return;e.preventDefault();const el=sh||stack;
    drag={el,sheet:!!sh,x0:e.clientX,y0:e.clientY,r:el.getBoundingClientRect(),moved:false};
    const mv=ev=>{const d=drag;if(!d)return;if(!d.moved&&Math.hypot(ev.clientX-d.x0,ev.clientY-d.y0)<7)return;
      if(!d.moved){d.moved=true;if(d.sheet?G?.kind!=='chapter':!el.classList.contains('ch')){d.dead=true;return;}startCarry();}
      if(!d.dead){d.ev=ev;if(!d.raf)d.raf=requestAnimationFrame(()=>{d.raf=0;if(drag===d)carry(d.ev);});}};
    const up=ev=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);const d=drag;
      if(!d.moved){drag=null;if(ev.type!=='pointerup')return;if(d.sheet){const k=+el.dataset.k;if(k===center)openSheet(el);else go(k);}else openChapter(el.dataset.g);return;}
      if(d.dead){drag=null;return;}drop(ev);};
    addEventListener('pointermove',mv);addEventListener('pointerup',up);addEventListener('pointercancel',up);});
  function startCarry(){const d=drag;
    if(d.sheet){d.el.classList.add('rk-carried');d.uid=d.el.dataset.u;d.fromKey=G.key;d.was=order.indexOf(d.uid);d.fan=order.filter(u=>u!==d.uid);d.c=Math.min(center,d.fan.length);d.at=d.c;d.fan.splice(d.at,0,'__gap');layFan();tabs.classList.add('drop');}
    else{d.keys=[...all.querySelectorAll('.rk-st.ch')].map(x=>x.dataset.g);d.fly=d.el.cloneNode(true);d.fly.classList.add('rk-fly');Object.assign(d.fly.style,{left:d.r.left+'px',top:d.r.top+'px',width:d.r.width+'px',height:d.r.height+'px'});
      board.appendChild(d.fly);d.el.classList.add('rk-place');d.rects=null;}}
  function carry(ev){const d=drag,dx=ev.clientX-d.x0,dy=ev.clientY-d.y0;
    if(!d.sheet){d.fly.style.transform=`translate(${dx}px,${dy}px) rotate(2deg) scale(1.04)`;
      // the stacks' places are measured once per change, not on every move (it lagged)
      if(!d.rects)d.rects=[...all.querySelectorAll('.rk-st.ch')].filter(x=>x!==d.el).map(x=>({x,r:x.getBoundingClientRect()}));
      const t=d.rects.find(o=>ev.clientX>=o.r.left&&ev.clientX<=o.r.right&&ev.clientY>=o.r.top&&ev.clientY<=o.r.bottom);if(!t)return;
      const after=ev.clientX>t.r.left+t.r.width/2,ref=after?t.x.nextSibling:t.x;if(ref===d.el||ref===d.el.nextSibling)return;flip(()=>all.insertBefore(d.el,ref));d.rects=null;return;}
    const s=d.r.width/desk.paper.width*1.04;d.el.style.transformOrigin='0 0';d.el.style.transform=`translate(${(d.r.left+dx).toFixed(1)}px,${(d.r.top+dy).toFixed(1)}px) rotate(3deg) scale(${s.toFixed(3)})`;
    const tab=document.elementsFromPoint(ev.clientX,ev.clientY).find(x=>x.classList?.contains('rk-tab'));tabs.querySelectorAll('.rk-tab.over').forEach(x=>{if(x!==tab)x.classList.remove('over');});
    if(tab){if(tab.classList.contains('ch')&&tab.dataset.g!==G.key&&!tab.classList.contains('over')){tab.classList.add('over');clearTimeout(d.dwell);d.dwell=setTimeout(()=>switchUnderHand(tab.dataset.g),650);}return;}
    clearTimeout(d.dwell);
    const ids=d.fan.filter(u=>u!=='__gap');let best=0,bd=1e9;for(let k=0;k<=ids.length;k++){const p=slot(k-d.c);const cxp=p.x+desk.paper.width*p.s/2;const dd=Math.abs(cxp-ev.clientX);if(dd<bd){bd=dd;best=k;}}
    if(best!==d.at){d.at=best;ids.splice(best,0,'__gap');d.fan=ids;layFan();}}
  function switchUnderHand(key){const d=drag;if(!d)return;const g=groups().find(x=>x.key===key);if(!g)return;rustle();
    [...fan.children].forEach(el=>{if(el!==d.el)el.remove();});view={key};G=g;order=g.sheets.map(x=>x.p.uid);
    g.sheets.forEach((x,k)=>{const el=document.createElement('div');el.className='rk-sh';el.dataset.u=x.p.uid;el.dataset.s=x.s.id;el.dataset.k=k;el.innerHTML=sheetHtml(x,k);el.style.transform=tr(slot(fanN+1));el.style.opacity=0;fan.appendChild(el);});
    fan.getBoundingClientRect();d.fan=[...order,'__gap'];d.at=order.length;d.c=order.length;renderTabs();setBarTitle();layFan();}
  function drop(ev){const d=drag;clearTimeout(d.dwell);tabs.classList.remove('drop');
    if(!d.sheet){const r=d.el.getBoundingClientRect();d.fly.style.transition='transform .32s cubic-bezier(.2,.8,.3,1)';d.fly.style.transform=`translate(${r.left-d.r.left}px,${r.top-d.r.top}px)`;
      setTimeout(()=>{d.fly.remove();d.el.classList.remove('rk-place');drag=null;const keys=[...all.querySelectorAll('.rk-st.ch')].map(x=>x.dataset.g);
        if(keys.join()!==d.keys.join()){send({action:'reorderChapters',ids:keys});const prev=d.keys;offerUndo('Главы переставлены',()=>send({action:'reorderChapters',ids:prev}));}},330);return;}
    const tab=document.elementsFromPoint(ev.clientX,ev.clientY).find(x=>x.classList?.contains('rk-tab')&&x.classList.contains('ch'));
    const fromG=groups().find(g=>g.key===d.fromKey),uid=d.uid;let at=d.fan.indexOf('__gap');drag=null;d.el.classList.remove('rk-carried');d.el.style.transformOrigin='';
    if(tab&&tab.dataset.g!==G.key){const toG=groups().find(g=>g.key===tab.dataset.g);d.el.remove();carryOver(uid,fromG,toG,-1);return;}
    if(G.key===d.fromKey){const ids=d.fan.filter(u=>u!=='__gap');ids.splice(at,0,uid);if(ids.join()===order.join()){layFan();return;}commitOrder(ids,uid);}
    else carryOver(uid,fromG,G,at);}
  const flip=fn=>{const els=[...all.querySelectorAll('.rk-st')],r0=new Map(els.map(x=>[x,x.getBoundingClientRect()]));fn();
    els.forEach(x=>{const a=r0.get(x),b=x.getBoundingClientRect();if(!a)return;const dx=a.left-b.left,dy=a.top-b.top;if(!dx&&!dy)return;x.animate([{translate:`${dx}px ${dy}px`},{translate:'0px 0px'}],{duration:320,easing:'cubic-bezier(.2,.8,.3,1)'});});};
  // a new sheet, episode or chapter: the view opens on it when the book's state comes back
  const _render=render;render=function(){if(view?.key==='__newch'){const gs=groups().filter(g=>g.kind==='chapter');const g=gs[gs.length-1];view=g?{key:g.key}:null;fan.innerHTML='';}
    if(view?.focus==='__last'){const g=groups().find(x=>x.key===view.key);if(g){view.focus=g.sheets[g.sheets.length-1]?.p.uid;lit=view.focus;}}
    _render();if(lit)fan.querySelector(sel(lit))?.classList.add('lit');};
  // a press on the middle sheet: it is the writing sheet — the desk comes back round it
  function openSheet(el){activeUid=el.dataset.u;send({action:'select',sectionId:el.dataset.s,pageUid:el.dataset.u});setTimeout(()=>window.OCHERKI_SET_MODE?.('write'),60);}

  // ——— coming and going, with as little change as can be: the writing sheet stays (the middle sheet is laid over it), the clean
  // stack turns into the pile, «Так ляжет» and its keys go off to the right, the clock and the signature stay
  const away=[['.wp-pane',1],['.wp-keys',1],['.ws-ttl',1]];let anims=[];
  function aside(on,ms){anims.forEach(a=>{try{a.cancel();}catch(_){}});anims=[];
    away.forEach(([s,dx])=>document.querySelectorAll(s).forEach(el=>{const to=`${dx*60}vw 0px`;const kf=on?[{translate:'0px 0px'},{translate:to}]:[{translate:to},{translate:'0px 0px'}];
      try{anims.push(el.animate(kf,{duration:ms,easing:on?'cubic-bezier(.55,0,.35,1)':'cubic-bezier(.2,.75,.25,1)',fill:on?'forwards':'none',composite:'add'}));}catch(_){}}));}
  function setBarTitle(){const t=bar()?.querySelector('.t b');if(!t)return;t._h='';
    // short, so it stands whole in the bar's middle (the plate over the pile says where we are in the chapter)
    const h=view&&G?`<span class="up">Рукопись</span> · <i>${esc(G.kind==='chapter'?`${G.word} · ${G.name}`:G.word)}</i>`:`<span class="up">Рукопись</span> · <i>все главы</i>`;if(t.innerHTML!==h)t.innerHTML=h;
    const bk=bar()?.querySelector('[data-c="back"]')?.getBoundingClientRect();if(bk&&bk.width)Object.assign(backLab.style,{left:Math.round(bk.left+bk.width/2)+'px',top:Math.round(bk.bottom+4)+'px'});}
  function open(){if(isOpen||busy)return;busy=true;isOpen=true;want=0;scroll=0;measureDesk();
    send({action:'flush'});send({action:'requestState'});
    // the sheet being written is asked of the editor itself (the message about it may not have come yet)
    try{const u=frame()?.contentWindow?.currentPage?.()?.uid;if(u)activeUid=u;}catch(_){}
    const g=gOf(activeUid);view=g?{key:g.key,focus:activeUid}:null;
    H.classList.add('rk-on');aside(true,640);
    if(view){chEl.classList.add('on');all.classList.remove('on');fan.innerHTML='';renderFan(false,true);}else{chEl.classList.remove('on');all.classList.add('on');renderAll();}
    H.classList.add('rk-shown');
    // the desk's own sheet and stack are put away once the middle sheet and the pile lie over them
    setTimeout(()=>{H.classList.add('rk-hide');shell.classList.add('is-manuscript');busy=false;},380);}
  function close(){window.__msFlying=false;if(!isOpen)return;isOpen=false;closePops();undoEl.classList.remove('on');
    // the fan goes back under the middle sheet, the desk's sheet and stack come back under the middle sheet and the pile, then
    // these fade, and «Так ляжет» comes back from the right
    fan.querySelectorAll('.rk-sh:not(.mid)').forEach(el=>{el.style.transform=tr(slot(0));el.style.opacity=0;});
    shell.classList.remove('is-manuscript');H.classList.remove('rk-hide');
    setTimeout(()=>{H.classList.remove('rk-shown');aside(false,700);setTimeout(()=>{H.classList.remove('rk-on');fan.innerHTML='';view=null;G=null;},520);},260);}
  setInterval(()=>{if(isOpen&&!busy)setBarTitle();},800);
  window.OCHERKI_MANUSCRIPT={open,close,back,isOpen:()=>isOpen,freeze:()=>{},activeUid:()=>activeUid,
    frontPick:()=>activeUid?{pageUid:activeUid}:null,flyToEditor:()=>false,sheetOf:()=>null};
})();
