// «Рукопись» (v226) — the book on the desk, seen as it is made.
// The three sheets of «Писать» go off the screen and the book lies there in stacks: «Начало книги», each chapter, «Конец книги»,
// and an empty «+ глава». A stack is as thick as its chapter; on its top sheet — the chapter's word, its name in handwriting, up
// to three of its photographs (one sepia tone here only) or its first words. Under the hand a stack lifts and its sheets part.
// A press on a stack opens it: its sheets come out of it into a fan whose middle sheet is the writing sheet itself — the same
// size, the same place — so a press on it simply turns «Рукопись» back into the desk with that sheet open. The sheets before it
// lie in a pile under it at the left (each showing an edge), the sheets after it fan out to the right; the chapter's own stack
// lies where the desk's clean stack lies, the same size. The wheel turns one sheet at a time, with the rustle of paper; a press
// on another sheet brings it to the middle. The bar's back key (or Esc) folds the fan back into its stack and shows all stacks.
// A sheet is carried with the hand: its neighbours part where it would go; meanwhile the other chapters lie in a row below —
// held over one, that chapter opens under the hand and the sheet is put in its place there; let go right on one, it goes to its
// end and the chapter opens on it, lit for a moment. A chapter's stack is carried to another place among the stacks.
// By day the window's light lies on every sheet exactly as on the desk; at night the lamp lights the middle, the rest in the dusk.
// All is done by the sheet's own commands (OCHERKI_STRUCTURE_COMMAND).
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  const H=document.documentElement;
  const frame=()=>document.getElementById('v35SheetFrame');
  const send=cmd=>{try{frame()?.contentWindow?.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',...cmd},'*');}catch(_){}};
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const plural=(n,a,b,c)=>{const m=n%10,h=n%100;return m===1&&h!==11?a:m>=2&&m<=4&&(h<12||h>14)?b:c;};
  const sel=u=>`.rk-sh[data-u="${CSS.escape(u)}"]`;
  const rustle=()=>{try{window.OCHERKI_PLAY_PAGE_FX?.(.45);}catch(_){}};
  let st=null,isOpen=false,busy=false,activeUid='',view=null,scroll=0,want=0,drag=null,lit='',paper=null,deskStack=null;
  addEventListener('message',e=>{const d=e.data||{};
    if(d.type==='OCHERKI_STRUCTURE_STATE'){st=d.payload||st;if(isOpen&&!drag&&!busy)render();}
    if(d.type==='OCHERKI_ACTIVE_STATE'&&d.payload?.pageUid)activeUid=d.payload.pageUid;});

  const board=document.createElement('div');board.className='rk-board';
  board.innerHTML='<div class="rk-all"></div><div class="rk-ch"><div class="rk-stk"></div><div class="rk-fan"></div><div class="rk-adds"><button type="button" data-a="page">+ лист</button><button type="button" data-a="episode">+ эпизод</button></div></div><div class="rk-strip"></div>';
  const shade=document.createElement('div');shade.className='rk-shade';
  const hint=document.createElement('div');hint.className='rk-hint';
  document.body.append(board,shade,hint);
  const all=board.querySelector('.rk-all'),chEl=board.querySelector('.rk-ch'),fan=board.querySelector('.rk-fan'),stk=board.querySelector('.rk-stk'),strip=board.querySelector('.rk-strip');

  // ——— the book in stacks
  const groups=()=>{const S=(st?.sections||[]).filter(s=>s.included!==false);const first=S.findIndex(s=>s.type==='chapter');let last=-1;S.forEach((s,i)=>{if(s.type==='chapter')last=i;});
    const sheets=list=>list.flatMap(s=>(s.pages||[]).filter(p=>p.included!==false).map(p=>({s,p})));
    const out=[],before=first<0?S:S.slice(0,first),after=last<0?[]:S.slice(last+1);let n=0;
    if(before.length)out.push({key:'begin',kind:'part',word:'Начало книги',name:'',note:before.map(s=>s.title).join(' · '),sheets:sheets(before)});
    S.forEach(s=>{if(s.type!=='chapter')return;n++;out.push({key:s.id,kind:'chapter',sec:s,word:`Глава ${n}`,name:String(s.title||'').replace(/^Глава\s*\d+\.?\s*/i,''),sheets:sheets([s])});});
    if(after.length)out.push({key:'end',kind:'part',word:'Конец книги',name:'',note:after.map(s=>s.title).join(' · '),sheets:sheets(after)});
    out.forEach(g=>{g.photos=g.sheets.flatMap(x=>(x.p.photos||[]).filter(q=>q&&q.src&&!q.isDocument)).slice(0,3);g.nph=g.sheets.reduce((a,x)=>a+(x.p.photos||[]).filter(q=>q&&q.src).length,0);
      g.first=String(g.sheets.find(x=>String(x.p.text||'').trim())?.p.text||'').replace(/\s+/g,' ').trim().slice(0,110);});
    return out;};
  const words=t=>String(t||'').replace(/\s+/g,' ').trim();
  const PH=[[16,6,-5],[92,12,4],[50,44,-2]];
  const stackHtml=(g,cur)=>{const n=g.sheets.length,layers=Math.max(1,Math.min(6,1+Math.ceil(n/3)));let h='';
    for(let k=layers;k>0;k--)h+=`<i class="rk-ly" style="--k:${k};--sg:${k%2?1:-1}"></i>`;
    h+=`<div class="rk-top"><b>${esc(g.word)}</b>${g.name?`<h3>${esc(g.name)}</h3>`:''}<i class="rk-orn"></i>`+
      (g.photos.length?`<div class="rk-phs">${g.photos.map((q,k)=>`<img src="${esc(q.src)}" alt="" style="left:${PH[k][0]}px;top:${PH[k][1]}px;transform:rotate(${PH[k][2]}deg)">`).join('')}</div>`
        :`<div class="rk-first">${esc(g.kind==='part'?g.note:(g.first?`«${g.first}…»`:'пока пусто'))}</div>`)+
      `<span>${n} ${plural(n,'лист','листа','листов')}${g.nph?` · ${g.nph} фото`:''}</span></div>`;
    return `<div class="rk-st${cur?' cur':''}${g.kind==='chapter'?' ch':''}" data-g="${esc(g.key)}">${h}</div>`;};

  const bar=()=>document.querySelector('.wc.wc-w:not(.bq-car)');
  const top0=()=>{const b=bar()?.getBoundingClientRect();return b&&b.height?b.bottom:120;};
  function place(){const t=top0(),b=bar()?.getBoundingClientRect();board.style.setProperty('--rk-top',Math.round(t)+'px');
    if(b&&b.width)Object.assign(shade.style,{left:Math.round(b.left+18)+'px',width:Math.round(b.width-36)+'px',top:Math.round(t-2)+'px'});}

  // ——— the overview
  function renderAll(){const G=groups(),curKey=G.find(g=>g.sheets.some(x=>x.p.uid===activeUid))?.key;
    all.innerHTML=G.map(g=>stackHtml(g,g.key===curKey)).join('')+'<div class="rk-st rk-new" role="button">+ глава</div>';
    hint.textContent='нажмите на стопку — её листы раскроются веером · стопку главы можно перенести на другое место';glideAll(true);light();}
  function glideAll(now){const t=top0(),max=Math.max(0,all.scrollHeight-(innerHeight-t-90));want=Math.max(0,Math.min(max,want));if(now)scroll=want;
    all.style.transform=`translateY(${Math.round(t+34-scroll)}px)`;}
  let gl=0;const glide=()=>{if(gl)return;const step=()=>{const d=want-scroll;if(Math.abs(d)<.5){scroll=want;gl=0;glideAll();light();return;}scroll+=d*.18;glideAll();light();gl=requestAnimationFrame(step);};gl=requestAnimationFrame(step);};

  // ——— the fan. The middle sheet is the writing sheet (its size and place, taken before the desk went away); the sheets before
  // it lie under it at the left, an edge of each showing; the sheets after it fan out to the right, smaller
  const slot=d=>{const P=paper,a=Math.abs(d),cx=P.left+P.width/2,cy=P.top+P.height/2;
    if(!d)return{x:cx,y:cy,r:0,s:1,z:40,o:1};
    if(d<0)return{x:cx-26*a,y:cy+a*5,r:-.7*a,s:1-.02*a,z:40-a,o:a>3?0:1};
    return{x:cx+P.width*.52+(a-1)*P.width*.16,y:cy+P.height*.06+a*6,r:1.4*a,s:.76,z:40-a,o:a>4?0:1};};
  const tr=p=>`translate(${(p.x-paper.width/2).toFixed(1)}px,${(p.y-paper.height/2).toFixed(1)}px) rotate(${p.r}deg) scale(${p.s})`;
  const sheetHtml=(x,k)=>{const p=x.p,doc=p.type==='document'||p.bookRole==='document',ph=(p.photos||[]).find(q=>q&&q.src);
    const ep=doc?(p.title||'документ'):(p.isEpisodeStart?String(p.episode||'').replace(/^Эпизод\s*\d+\.?\s*/i,''):'');
    return `<div class="rk-n">${k+1}</div>${ep?`<div class="rk-ep">${esc(ep)}</div>`:''}<p>${esc(words(p.text).slice(0,900))}</p>${ph?`<img src="${esc(ph.src)}" alt="">`:''}`;};
  let fanG=null,center=0,order=[];
  // from: where new sheets come out of (a stack's box), else from the right
  function renderFan(keepCenter,from){const G=groups();fanG=G.find(g=>g.key===view.key)||null;if(!fanG){view=null;return renderAll();}
    const n=fanG.sheets.length;order=fanG.sheets.map(x=>x.p.uid);
    {const i=view.focus?order.indexOf(view.focus):-1;if(i>=0){center=i;view.focus=null;}else if(!keepCenter){const j=order.indexOf(activeUid);center=j>=0?j:0;}}center=Math.max(0,Math.min(n-1,center));
    chEl.querySelector('.rk-adds').hidden=fanG.kind!=='chapter';
    // the chapter's stack lies where the desk's clean stack lies, as large
    stk.innerHTML=stackHtml(fanG,false);if(deskStack){Object.assign(stk.style,{left:deskStack.left+'px',top:deskStack.top+'px'});stk.style.setProperty('--k',(deskStack.width/250).toFixed(4));}
    fan.style.setProperty('--w',paper.width+'px');fan.style.setProperty('--h',paper.height+'px');
    const have=new Map([...fan.children].map(el=>[el.dataset.u,el]));let fresh=false;
    fanG.sheets.forEach((x,k)=>{let el=have.get(x.p.uid);have.delete(x.p.uid);
      if(!el){el=document.createElement('div');el.className='rk-sh';el.dataset.u=x.p.uid;fan.appendChild(el);fresh=true;
        // a new sheet starts where it comes from: out of the stack that was pressed, or in from the right
        if(from){const s=from.width/paper.width;el.style.transform=`translate(${(from.left+from.width/2-paper.width/2).toFixed(1)}px,${(from.top+from.height/2-paper.height/2).toFixed(1)}px) scale(${s.toFixed(3)})`;el.style.opacity=Math.abs(k-center)>4?0:1;}
        else{el.style.transform=tr(slot(5));el.style.opacity=0;}
        el.style.transitionDelay=from?(Math.min(6,Math.abs(k-center))*45)+'ms':'0ms';}
      el.dataset.s=x.s.id;el.dataset.k=k;el.classList.toggle('doc',x.p.type==='document');el.classList.toggle('rib',!!x.p.isEpisodeStart);el.classList.toggle('cur',x.p.uid===activeUid);
      const html=sheetHtml(x,k);if(el._h!==html){el._h=html;el.innerHTML=html;}});
    have.forEach(el=>el.remove());
    // the place they start from is painted first, so that they glide out of it (they appeared at once)
    if(fresh)fan.getBoundingClientRect();
    layFan();setTimeout(()=>fan.querySelectorAll('.rk-sh').forEach(el=>{el.style.transitionDelay='';}),700);
    setBarTitle();
    // the fan reaches the foot of the screen: no line of hints over it
    hint.textContent='';}
  // lays the fan by the order around the middle; while a sheet is carried — without it, with a gap where it would go
  function layFan(){const ids=drag?.fan||order,c=drag?.fan?drag.c:center;
    ids.forEach((u,k)=>{if(u==='__gap')return;const el=fan.querySelector(sel(u));if(!el||el===drag?.el)return;const p=slot(k-c);
      el._p=p;el.style.transform=tr(p);el.style.zIndex=p.z;el.style.opacity=p.o;el.style.pointerEvents=p.o?'':'none';el.classList.toggle('mid',k===c);});
    light();}
  function go(to){if(!fanG)return;to=Math.max(0,Math.min(order.length-1,to));if(to===center)return;center=to;rustle();layFan();}

  // ——— the light. By day the desk's window picture on each sheet, laid from where the sheet will lie (scaled back with it, so
  // it is the same picture as on the desk); at night the lamp's beam: the middle bright, the further from it the darker
  function light(){const night=shell.classList.contains('is-night');const cx=paper?paper.left+paper.width/2:innerWidth/2,half=paper?paper.width/2:330;
    board.querySelectorAll('.rk-sh').forEach(el=>{const p=el._p;if(!p)return;const s=p.s,x0=p.x-paper.width*s/2,y0=p.y-paper.height*s/2;
      el.style.setProperty('--ox',(-x0/s).toFixed(1)+'px');el.style.setProperty('--oy',(-y0/s).toFixed(1)+'px');el.style.setProperty('--sc',s);
      const dist=Math.max(0,Math.abs(p.x-cx)-half*.35);const v=night?Math.max(.42,1-dist/(half*2.6)):Math.max(.9,1-dist/(half*14));
      const f=`brightness(${v.toFixed(3)})`+(night?' sepia(.1)':'');if(el._f!==f){el._f=f;el.style.filter=f;}});
    board.querySelectorAll('.rk-st:not(.rk-new)').forEach(el=>{const r=el.getBoundingClientRect();if(!r.width)return;const k=r.width/(el.offsetWidth||r.width);
      el.style.setProperty('--ox',(-r.left/k).toFixed(1)+'px');el.style.setProperty('--oy',(-r.top/k).toFixed(1)+'px');el.style.setProperty('--sc',k);
      let v=1;if(night){const x=Math.abs(r.left+r.width/2-cx)/(innerWidth/2),y=Math.max(0,(r.top-top0())/(innerHeight-top0()));v=Math.max(.45,1.04-.55*Math.max(0,x-.25)-.35*y);}
      const f=`brightness(${v.toFixed(3)})`+(night?' sepia(.1)':'');if(el._f!==f){el._f=f;el.style.filter=f;}});}
  new MutationObserver(()=>{if(isOpen)light();}).observe(shell,{attributes:true,attributeFilter:['class']});

  // ——— the two views, with the way between them: the stack's sheets come out into the fan, and fold back into it
  function render(){place();if(!view){chEl.classList.remove('on');all.classList.add('on');renderAll();}else{all.classList.remove('on');chEl.classList.add('on');renderFan(true);}}
  function openStack(key,stackEl){if(busy)return;const from=stackEl?.getBoundingClientRect();view={key};fan.innerHTML='';
    all.classList.remove('on');chEl.classList.add('on');renderFan(false,from);rustle();}
  function back(){if(!isOpen||busy)return false;if(!view)return false;busy=true;
    // the sheets fold back into the chapter's stack, then all the stacks come in
    const r=stk.querySelector('.rk-st')?.getBoundingClientRect();
    fan.querySelectorAll('.rk-sh').forEach(el=>{const k=Math.abs(+el.dataset.k-center);el.style.transitionDelay=(Math.min(6,k)*35)+'ms';
      if(r){const s=r.width/paper.width;el.style.transform=`translate(${(r.left+r.width/2-paper.width/2).toFixed(1)}px,${(r.top+r.height/2-paper.height/2).toFixed(1)}px) scale(${s.toFixed(3)})`;}});
    rustle();setTimeout(()=>{view=null;fanG=null;fan.innerHTML='';chEl.classList.remove('on');all.classList.add('on');renderAll();setBarTitle();busy=false;},560);return true;}

  // ——— the wheel turns one sheet at a time (a run of a trackpad's small steps is one turn); the overview glides
  // one sheet for one gesture: a run of events (a trackpad's swipe and its glide, a fast run of a mouse's notches) turns one
  // sheet; a gesture held on turns the next only after a pause of .65s
  let acc=0,idleT=0,inGesture=false,lastTurn=0;
  board.addEventListener('wheel',e=>{if(!isOpen)return;e.preventDefault();const dy=e.deltaMode===1?e.deltaY*33:e.deltaY;
    if(!view){want+=dy;glide();return;}
    clearTimeout(idleT);idleT=setTimeout(()=>{inGesture=false;acc=0;},170);acc+=dy;const now=performance.now();
    if(Math.abs(acc)<36)return;if(inGesture&&now-lastTurn<650)return;inGesture=true;lastTurn=now;go(center+(acc>0?1:-1));acc=0;},{passive:false});
  addEventListener('keydown',e=>{if(!isOpen||!view||drag)return;if(e.key==='ArrowRight')go(center+1);else if(e.key==='ArrowLeft')go(center-1);else if(e.key==='Escape')back();});
  addEventListener('resize',()=>{if(isOpen)render();});

  chEl.querySelector('.rk-adds').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!fanG?.sec)return;view.focus='__last';
    if(b.dataset.a==='page')send({action:'addPageAt',sectionId:fanG.sec.id});else send({action:'addEpisode',sectionId:fanG.sec.id,atEnd:true});});
  all.addEventListener('click',e=>{if(e.target.closest('.rk-new')){send({action:'addChapter'});want=1e9;}});

  // ——— carrying: a sheet in the fan, or a chapter's stack among the stacks
  board.addEventListener('pointerdown',e=>{if(e.button!==0||busy)return;const sh=e.target.closest('.rk-sh'),stack=e.target.closest('.rk-all .rk-st:not(.rk-new)');
    if(!sh&&!stack)return;e.preventDefault();const el=sh||stack;
    drag={el,sheet:!!sh,x0:e.clientX,y0:e.clientY,r:el.getBoundingClientRect(),moved:false};
    const mv=ev=>{const d=drag;if(!d)return;const dx=ev.clientX-d.x0,dy=ev.clientY-d.y0;if(!d.moved&&Math.hypot(dx,dy)<7)return;
      if(!d.moved){d.moved=true;if(d.sheet?fanG?.kind!=='chapter':!el.classList.contains('ch')){d.dead=true;return;}startCarry();}
      if(!d.dead)carry(ev);};
    const up=ev=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);const d=drag;
      if(!d.moved){drag=null;if(ev.type!=='pointerup')return;if(d.sheet){const k=+el.dataset.k;if(k===center)openSheet(el);else go(k);}else openStack(el.dataset.g,el);return;}
      if(d.dead){drag=null;return;}drop(ev);};
    addEventListener('pointermove',mv);addEventListener('pointerup',up);addEventListener('pointercancel',up);});
  function startCarry(){const d=drag;
    if(d.sheet){d.el.classList.add('rk-carried');d.uid=d.el.dataset.u;d.fan=order.filter(u=>u!==d.uid);d.c=Math.min(center,d.fan.length);d.at=d.c;d.fan.splice(d.at,0,'__gap');
      const G=groups().filter(g=>g.kind==='chapter');strip.innerHTML=G.map(g=>`<div class="rk-mini${g.key===fanG.key?' here':''}" data-g="${esc(g.key)}"><b>${esc(g.word)}</b><i>${esc(g.name)}</i></div>`).join('');strip.classList.add('on');layFan();}
    else{// the stack is carried by its likeness; its place stays among the stacks (moved there as the hand goes), empty
      d.keys=[...all.querySelectorAll('.rk-st.ch')].map(x=>x.dataset.g);d.fly=d.el.cloneNode(true);d.fly.classList.add('rk-fly');Object.assign(d.fly.style,{left:d.r.left+'px',top:d.r.top+'px',width:d.r.width+'px',height:d.r.height+'px'});
      board.appendChild(d.fly);d.el.classList.add('rk-place');}}
  function carry(ev){const d=drag,dx=ev.clientX-d.x0,dy=ev.clientY-d.y0;
    if(!d.sheet){d.fly.style.transform=`translate(${dx}px,${dy}px) rotate(2deg) scale(1.04)`;
      const t=document.elementsFromPoint(ev.clientX,ev.clientY).find(x=>x!==d.el&&x.classList?.contains('ch')&&!x.classList.contains('rk-fly'));if(!t)return;
      const r=t.getBoundingClientRect(),after=ev.clientX>r.left+r.width/2,ref=after?t.nextSibling:t;if(ref===d.el||ref===d.el.nextSibling)return;flip(()=>all.insertBefore(d.el,ref));return;}
    const s=d.r.width/paper.width*1.04;d.el.style.transformOrigin='0 0';d.el.style.transform=`translate(${(d.r.left+dx).toFixed(1)}px,${(d.r.top+dy).toFixed(1)}px) rotate(3deg) scale(${s.toFixed(3)})`;
    const over=document.elementsFromPoint(ev.clientX,ev.clientY).find(x=>x.classList?.contains('rk-mini'));strip.querySelectorAll('.rk-mini.over').forEach(x=>{if(x!==over)x.classList.remove('over');});
    if(over&&!over.classList.contains('here')){if(!over.classList.contains('over')){over.classList.add('over');clearTimeout(d.dwell);d.dwell=setTimeout(()=>switchUnderHand(over.dataset.g),650);}return;}
    clearTimeout(d.dwell);if(over)return;
    // the gap goes to the nearest place under the hand; the neighbours part
    const ids=d.fan.filter(u=>u!=='__gap');let best=0,bd=1e9;for(let k=0;k<=ids.length;k++){const dd=Math.abs(slot(k-d.c).x-ev.clientX);if(dd<bd){bd=dd;best=k;}}
    if(best!==d.at){d.at=best;ids.splice(best,0,'__gap');d.fan=ids;layFan();}}
  function switchUnderHand(key){const d=drag;if(!d)return;const g=groups().find(x=>x.key===key);if(!g)return;rustle();
    [...fan.children].forEach(el=>{if(el!==d.el)el.remove();});view={key};fanG=g;order=g.sheets.map(x=>x.p.uid);
    g.sheets.forEach((x,k)=>{const el=document.createElement('div');el.className='rk-sh';el.dataset.u=x.p.uid;el.dataset.s=x.s.id;el.dataset.k=k;el.innerHTML=sheetHtml(x,k);el.style.transform=tr(slot(5));el.style.opacity=0;fan.appendChild(el);});
    fan.getBoundingClientRect();d.fan=[...order,'__gap'];d.at=order.length;d.c=order.length;stk.innerHTML=stackHtml(g,false);setBarTitle();
    strip.querySelectorAll('.rk-mini').forEach(x=>x.classList.toggle('here',x.dataset.g===key));layFan();}
  function drop(ev){const d=drag;clearTimeout(d.dwell);
    if(!d.sheet){const r=d.el.getBoundingClientRect();d.fly.style.transition='transform .32s cubic-bezier(.2,.8,.3,1)';d.fly.style.transform=`translate(${r.left-d.r.left}px,${r.top-d.r.top}px)`;
      setTimeout(()=>{d.fly.remove();d.el.classList.remove('rk-place');drag=null;const keys=[...all.querySelectorAll('.rk-st.ch')].map(x=>x.dataset.g);if(keys.join()!==d.keys.join())send({action:'reorderChapters',ids:keys});},330);return;}
    strip.classList.remove('on');const S=st?.sections||[];const fromSec=S.find(s=>(s.pages||[]).some(p=>p.uid===d.uid));
    const onMini=document.elementsFromPoint(ev.clientX,ev.clientY).find(x=>x.classList?.contains('rk-mini')&&!x.classList.contains('here'));
    let toKey=view.key,at=d.fan.indexOf('__gap');if(onMini){toKey=onMini.dataset.g;at=-1;}
    const ids=d.fan.filter(u=>u!=='__gap');if(at>=0)ids.splice(at,0,d.uid);
    drag=null;d.el.classList.remove('rk-carried');d.el.style.transformOrigin='';
    view={key:toKey,focus:d.uid};lit=d.uid;setTimeout(()=>{if(lit===d.uid){lit='';fan.querySelector(sel(d.uid))?.classList.remove('lit');}},1800);
    if(fromSec&&toKey===fromSec.id){order=ids;center=ids.indexOf(d.uid);view.focus=null;send({action:'reorderPages',sectionId:fromSec.id,ids});layFan();}
    else if(fromSec){send({action:'movePage',sectionId:fromSec.id,toSectionId:toKey,pageUid:d.uid,...(at>=0?{toIndex:at}:{})});if(onMini){d.el.remove();}}
    requestAnimationFrame(()=>fan.querySelector(sel(d.uid))?.classList.add('lit'));}
  const flip=fn=>{const els=[...all.querySelectorAll('.rk-st')],r0=new Map(els.map(x=>[x,x.getBoundingClientRect()]));fn();
    els.forEach(x=>{const a=r0.get(x),b=x.getBoundingClientRect();if(!a)return;const dx=a.left-b.left,dy=a.top-b.top;if(!dx&&!dy)return;x.animate([{translate:`${dx}px ${dy}px`},{translate:'0px 0px'}],{duration:320,easing:'cubic-bezier(.2,.8,.3,1)'});});};
  // a new sheet or episode: the fan opens on it (the last) when the book's state comes back, and it comes in from the right
  const _render=render;render=function(){if(view?.focus==='__last'){const g=groups().find(x=>x.key===view.key);if(g){view.focus=g.sheets[g.sheets.length-1]?.p.uid;lit=view.focus;}}
    _render();if(lit)fan.querySelector(sel(lit))?.classList.add('lit');};
  // a press on the middle sheet: it is the writing sheet already — the desk comes back around it
  function openSheet(el){activeUid=el.dataset.u;send({action:'select',sectionId:el.dataset.s,pageUid:el.dataset.u});setTimeout(()=>window.OCHERKI_SET_MODE?.('write'),60);}

  // ——— coming and going: the three sheets of «Писать» leave the screen and come back
  const away=[['.ws-left',-1,0],['.bottom-left',-1,0],['#editorPaperWrap .editor-paper',0,1],['.wp-pane',1,0],['.wp-keys',1,0],['.ws-ttl',1,0],['#writingPrompt',0,1]];
  let anims=[];
  function sheetsOut(on,ms){anims.forEach(a=>{try{a.cancel();}catch(_){}});anims=[];
    away.forEach(([s,dx,dy])=>document.querySelectorAll(s).forEach(el=>{const to=`${dx*110}vw ${dy*110}vh`;
      const kf=on?[{translate:'0px 0px'},{translate:to}]:[{translate:to},{translate:'0px 0px'}];
      try{anims.push(el.animate(kf,{duration:ms,easing:on?'cubic-bezier(.55,0,.35,1)':'cubic-bezier(.2,.75,.25,1)',fill:on?'forwards':'none',composite:'add'}));}catch(_){}}));}
  // the writing sheet's and the clean stack's places on the desk (without the sheet's own sideways shift)
  function measureDesk(){const w=document.getElementById('editorPaperWrap'),p=w?.querySelector('.editor-paper'),r=p?.getBoundingClientRect();const sh=w?parseFloat(getComputedStyle(w).translate)||0:0;
    paper=r&&r.width?{left:r.left-sh,top:r.top,width:r.width,height:r.height}:{left:innerWidth/2-330,top:110,width:660,height:900};
    const l=document.querySelector('.ws-left')?.getBoundingClientRect();deskStack=l&&l.width?{left:l.left,top:l.top,width:l.width,height:l.height}:null;}
  function setBarTitle(){const t=bar()?.querySelector('.t b');if(!t)return;t._h='';
    if(view&&fanG){const n=fanG.sheets.length;t.innerHTML=`<span class="up">Рукопись</span> · <i>${esc(fanG.kind==='chapter'?`${fanG.word} · ${fanG.name}`:fanG.word)}</i> · <span class="up">${n} ${plural(n,'лист','листа','листов')}</span>`;return;}
    const S=st?.sections||[];const n=S.reduce((a,s)=>a+(s.included!==false?(s.pages||[]).length:0),0);
    const name=document.querySelector('.ws-ttl b')?.textContent||'Очерки жизни';t.innerHTML=`<span class="up">Рукопись</span> · <i>${esc(name)}</i> · <span class="up">${n} ${plural(n,'лист','листа','листов')}</span>`;}
  function open(){if(isOpen||busy)return;busy=true;isOpen=true;want=0;scroll=0;measureDesk();
    send({action:'flush'});send({action:'requestState'});
    // it opens on the chapter of the sheet that was being written: its sheets come out of the clean stack's place
    const G=groups(),g=G.find(x=>x.sheets.some(y=>y.p.uid===activeUid));view=g?{key:g.key,focus:activeUid}:null;
    H.classList.add('rk-on');sheetsOut(true,760);
    setTimeout(()=>{shell.classList.add('is-manuscript');fan.innerHTML='';place();
      if(view){all.classList.remove('on');chEl.classList.add('on');renderFan(false,deskStack);}else{chEl.classList.remove('on');all.classList.add('on');renderAll();}
      setBarTitle();H.classList.add('rk-shown');busy=false;},700);}
  function close(){window.__msFlying=false;if(!isOpen)return;isOpen=false;H.classList.remove('rk-shown');strip.classList.remove('on');
    setTimeout(()=>{shell.classList.remove('is-manuscript');const t0=performance.now();
      const back=()=>{if(!shell.classList.contains('oc-ws')&&performance.now()-t0<1500)return requestAnimationFrame(back);sheetsOut(false,820);H.classList.remove('rk-on');};requestAnimationFrame(back);},240);}
  setInterval(()=>{if(isOpen&&H.classList.contains('rk-shown')&&!busy)setBarTitle();},800);
  window.OCHERKI_MANUSCRIPT={open,close,back,isOpen:()=>isOpen,freeze:()=>{},activeUid:()=>activeUid,
    frontPick:()=>activeUid?{pageUid:activeUid}:null,flyToEditor:()=>false,sheetOf:()=>null};
})();
