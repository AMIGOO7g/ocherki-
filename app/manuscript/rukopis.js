// «Рукопись» (v225) — the book on the desk, seen as it is made.
// The three sheets of «Писать» (the clean stack, the open sheet, «Так ляжет») go off the screen, and the book lies there in
// stacks: «Начало книги», each chapter, «Конец книги», and an empty «+ глава». A stack's thickness is its number of sheets; on its
// top sheet — the chapter's word, its name in handwriting, up to three of its photographs (in one sepia tone here only; in the
// book they stay as they are) or, without photographs, its first words.
// A press on a stack opens it: its sheets fan out from the middle of the screen — the very place of the sheet in «Писать» —
// the one in the middle large and readable, the others to either side, numbered. The wheel leafs through the fan (with the rustle
// of paper), a press on a side sheet brings it to the middle, a press on the middle one opens it for writing.
// A sheet is carried with the hand: its neighbours part where it would go; while it is carried, the other chapters lie in a
// row below — held over one of them for a moment, that chapter opens under the hand and the sheet is put in its place there;
// let go right on one, it goes to that chapter's end and the chapter opens on it, lit for a moment (so it is always found).
// Chapters are reordered by carrying their stacks. By day the window's light lies on the sheets; at night the lamp lights the
// middle and the sides sink into the dusk. All is done by the sheet's own commands (OCHERKI_STRUCTURE_COMMAND).
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  const H=document.documentElement;
  const frame=()=>document.getElementById('v35SheetFrame');
  const send=cmd=>{try{frame()?.contentWindow?.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',...cmd},'*');}catch(_){}};
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const url=s=>String(s).replace(/'/g,'%27');
  const plural=(n,a,b,c)=>{const m=n%10,h=n%100;return m===1&&h!==11?a:m>=2&&m<=4&&(h<12||h>14)?b:c;};
  const rustle=()=>{try{window.OCHERKI_PLAY_PAGE_FX?.(.45);}catch(_){}};
  let st=null,isOpen=false,busy=false,activeUid='',view=null,scroll=0,want=0,drag=null,cx=innerWidth/2,lit='';
  addEventListener('message',e=>{const d=e.data||{};
    if(d.type==='OCHERKI_STRUCTURE_STATE'){st=d.payload||st;if(isOpen&&!drag)render();}
    if(d.type==='OCHERKI_ACTIVE_STATE'&&d.payload?.pageUid)activeUid=d.payload.pageUid;});

  const board=document.createElement('div');board.className='rk-board';
  board.innerHTML='<div class="rk-all"></div><div class="rk-ch"><div class="rk-head"><button type="button" class="rk-back">← все главы</button><em></em><span></span></div><div class="rk-stk"></div><div class="rk-fan"></div><div class="rk-adds"><button type="button" data-a="page">+ лист</button><button type="button" data-a="episode">+ эпизод</button></div></div><div class="rk-strip"></div>';
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
  // a stack: as many sheets under the top one as the chapter is thick; on top its word, its name, its photographs or first words
  const PH=[[16,4,-5],[92,10,4],[50,40,-2]];
  const stackHtml=(g,cur)=>{const n=g.sheets.length,layers=Math.max(1,Math.min(6,1+Math.ceil(n/3)));let h='';
    for(let k=layers;k>0;k--)h+=`<i class="rk-ly" style="transform:translate(${k*3}px,${k*3}px) rotate(${(k%2?1:-1)*k*.4}deg)"></i>`;
    const meta=`${n} ${plural(n,'лист','листа','листов')}${g.nph?` · ${g.nph} фото`:''}`;
    h+=`<div class="rk-top"><b>${esc(g.word)}</b>${g.name?`<h3>${esc(g.name)}</h3>`:''}<i class="rk-orn"></i>`+
      (g.photos.length?`<div class="rk-phs">${g.photos.map((q,k)=>`<img src="${esc(q.src)}" alt="" style="left:${PH[k][0]}px;top:${PH[k][1]}px;transform:rotate(${PH[k][2]}deg)">`).join('')}</div>`
        :`<div class="rk-first">${esc(g.kind==='part'?g.note:(g.first?`«${g.first}…»`:'пока пусто'))}</div>`)+`<span>${meta}</span></div>`;
    return `<div class="rk-st${cur?' cur':''}${g.kind==='chapter'?' ch':''}" data-g="${esc(g.key)}">${h}</div>`;};

  // ——— where things stand: under the bar; the fan's middle on the middle of the writing sheet
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

  // ——— the open stack: the fan
  let geo=null;
  function measure(){const t=top0(),headH=78,fanTop=t+headH+18,Hc=Math.max(300,Math.min(660,innerHeight-fanTop-96)),Wc=Math.round(Hc*.78);
    geo={t,fanTop,Hc,Wc,s:.76,near:.52*Wc,step:.16*Wc};return geo;}
  // the place of a sheet d steps from the middle (0 the middle): its centre, turn, scale, how high it lies
  const slot=d=>{const g=geo,a=Math.abs(d);if(!d)return{x:cx,y:g.fanTop+g.Hc/2,r:0,s:1,z:30,o:1};
    const x=cx+Math.sign(d)*(g.near+(a-1)*g.step),y=g.fanTop+g.Hc/2+g.Hc*.08+a*6;return{x,y,r:d*1.6,s:g.s,z:30-a,o:a>3?0:1};};
  const sheetHtml=(x,k)=>{const p=x.p,doc=p.type==='document'||p.bookRole==='document',ph=(p.photos||[]).find(q=>q&&q.src);
    const ep=doc?(p.title||'документ'):(p.isEpisodeStart?String(p.episode||'').replace(/^Эпизод\s*\d+\.?\s*/i,''):'');
    return `<div class="rk-n">${k+1}</div>${ep?`<div class="rk-ep">${esc(ep)}</div>`:''}<p>${esc(words(p.text).slice(0,520))}</p>${ph?`<img src="${esc(ph.src)}" alt="">`:''}`;};
  let fanG=null,center=0,order=[];
  function renderFan(keepCenter){const G=groups();fanG=G.find(g=>g.key===view.key)||G[0];if(!fanG){view=null;return renderAll();}
    measure();const n=fanG.sheets.length;
    order=fanG.sheets.map(x=>x.p.uid);
    // the fan opens on the sheet it is asked to (the one carried over, a new one); else, on a first opening, on the one being written
    {const i=view.focus?order.indexOf(view.focus):-1;if(i>=0){center=i;view.focus=null;}else if(!keepCenter){const j=order.indexOf(activeUid);center=j>=0?j:0;}}center=Math.max(0,Math.min(n-1,center));
    // the head: back, the chapter's name, its count
    const hd=chEl.querySelector('.rk-head');hd.querySelector('em').textContent=fanG.kind==='chapter'?`${fanG.word} · ${fanG.name}`:fanG.word;
    hd.querySelector('span').textContent=`${n} ${plural(n,'лист','листа','листов')}`;
    chEl.querySelector('.rk-adds').hidden=fanG.kind!=='chapter';
    // the stack at the left, clear of the fan
    stk.innerHTML=stackHtml(fanG,false);const fanLeft=cx-(geo.near+2*geo.step)-geo.Wc*geo.s/2;stk.style.left=Math.max(24,Math.round(fanLeft-70-250*.78))+'px';stk.style.top=Math.round(geo.fanTop+geo.Hc*.12)+'px';
    // the sheets, kept by their uid so that they glide to their new places
    const have=new Map([...fan.children].map(el=>[el.dataset.u,el]));
    fanG.sheets.forEach((x,k)=>{let el=have.get(x.p.uid);have.delete(x.p.uid);
      if(!el){el=document.createElement('div');el.className='rk-sh';el.dataset.u=x.p.uid;fan.appendChild(el);const s0=slot(Math.sign(k-center)*4);el.style.transform=tr(s0);el.style.opacity=0;}
      el.dataset.s=x.s.id;el.dataset.k=k;el.classList.toggle('doc',x.p.type==='document');el.classList.toggle('rib',!!x.p.isEpisodeStart);el.classList.toggle('cur',x.p.uid===activeUid);
      const html=sheetHtml(x,k);if(el._h!==html){el._h=html;el.innerHTML=html;}});
    have.forEach(el=>el.remove());
    Object.assign(fan.style,{'--w':geo.Wc+'px','--h':geo.Hc+'px'});
    layFan();
    hint.textContent=fanG.kind==='chapter'?'колесо — листать · нажмите на лист сбоку — он выйдет в середину, на средний — откроется для письма · лист можно перенести в другое место или в другую главу':'колесо — листать · нажмите на средний лист — он откроется для письма';}
  const tr=p=>`translate(${(p.x-geo.Wc/2).toFixed(1)}px,${(p.y-geo.Hc/2).toFixed(1)}px) rotate(${p.r}deg) scale(${p.s})`;
  // lays the fan: the sheets by their order around the middle; while a sheet is carried — without it, a gap where it would go
  function layFan(){const ids=drag?.fan?drag.fan:order,c=drag?.fan?Math.min(center,ids.length-1):center;
    ids.forEach((u,k)=>{const el=fan.querySelector(`.rk-sh[data-u="${CSS.escape(u)}"]`);if(!el||el===drag?.el)return;const p=slot(k-c);
      el._d=Math.abs(k-c);el.style.transform=tr(p);el.style.zIndex=p.z;el.style.opacity=p.o;el.style.pointerEvents=p.o?'':'none';el.classList.toggle('mid',k===c);});
    light();}
  function go(to){if(!fanG)return;const n=order.length;to=Math.max(0,Math.min(n-1,to));if(to===center)return;center=to;rustle();layFan();}

  // ——— the light: by day the window's shadow on each sheet (the same picture as on the desk, moved to where the sheet lies);
  // at night the lamp's beam on the middle, the sides in the dusk
  function light(){const night=shell.classList.contains('is-night');
    board.querySelectorAll('.rk-sh,.rk-st:not(.rk-new)').forEach(el=>{const r=el.getBoundingClientRect();if(!r.width)return;
      el.style.setProperty('--ox',(-r.left).toFixed(0)+'px');el.style.setProperty('--oy',(-r.top).toFixed(0)+'px');
      let v=1;if(el.classList.contains('rk-sh')){const d=el._d??0;v=night?Math.max(.45,1-.14*d):Math.max(.88,1-.03*d);}
      else if(night){const x=Math.abs(r.left+r.width/2-cx)/(innerWidth/2),y=Math.max(0,(r.top-top0())/(innerHeight-top0()));v=Math.max(.45,1.04-.55*Math.max(0,x-.25)-.35*y);}
      const f=`brightness(${v.toFixed(3)})`+(night?' sepia(.1)':'');if(el._f!==f){el._f=f;el.style.filter=f;}});}
  new MutationObserver(()=>{if(isOpen)light();}).observe(shell,{attributes:true,attributeFilter:['class']});

  // ——— the view: the overview or a stack opened into its fan
  function render(){place();if(!view){chEl.classList.remove('on');all.classList.add('on');renderAll();}else{all.classList.remove('on');chEl.classList.add('on');renderFan(true);}}
  function openStack(key,focus){view={key,focus};center=0;all.classList.remove('on');chEl.classList.add('on');fan.innerHTML='';renderFan(false);rustle();}
  function backToAll(){view=null;fanG=null;chEl.classList.remove('on');all.classList.add('on');renderAll();}

  // ——— wheel: the fan leafs, the overview glides
  let acc=0,accT=0;
  board.addEventListener('wheel',e=>{if(!isOpen)return;e.preventDefault();const dy=e.deltaMode===1?e.deltaY*33:e.deltaY;
    if(!view){want+=dy;glide();return;}
    acc+=dy;clearTimeout(accT);accT=setTimeout(()=>{acc=0;},200);if(Math.abs(acc)<60)return;go(center+(acc>0?1:-1));acc=0;},{passive:false});
  addEventListener('keydown',e=>{if(!isOpen||!view)return;if(e.key==='ArrowRight')go(center+1);else if(e.key==='ArrowLeft')go(center-1);else if(e.key==='Escape')backToAll();});
  addEventListener('resize',()=>{if(isOpen){cx=paperCx();render();}});

  // ——— presses
  chEl.querySelector('.rk-back').addEventListener('click',()=>backToAll());
  chEl.querySelector('.rk-adds').addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!fanG?.sec)return;view.focus='__last';
    if(b.dataset.a==='page')send({action:'addPageAt',sectionId:fanG.sec.id});else send({action:'addEpisode',sectionId:fanG.sec.id,atEnd:true});});
  all.addEventListener('click',e=>{if(e.target.closest('.rk-new')){send({action:'addChapter'});want=1e9;return;}});

  // carrying: a sheet in the fan, or a chapter's stack in the overview
  board.addEventListener('pointerdown',e=>{if(e.button!==0||busy)return;const sh=e.target.closest('.rk-sh'),stack=e.target.closest('.rk-all .rk-st:not(.rk-new)');
    if(!sh&&!stack)return;e.preventDefault();const el=sh||stack;const r=el.getBoundingClientRect();
    drag={el,sheet:!!sh,x0:e.clientX,y0:e.clientY,r,moved:false};
    const mv=ev=>{const dx=ev.clientX-drag.x0,dy=ev.clientY-drag.y0;if(!drag.moved&&Math.hypot(dx,dy)<7)return;
      if(!drag.moved){if(drag.sheet&&fanG?.kind!=='chapter'){drag.moved=true;drag.dead=true;return;}if(!drag.sheet&&!el.classList.contains('ch')){drag.moved=true;drag.dead=true;return;}startCarry();}
      if(drag.dead)return;carry(ev);};
    const up=ev=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);
      const d=drag;if(!d.moved){drag=null;if(ev.type!=='pointerup')return;if(d.sheet){const k=+el.dataset.k;if(k===center)openSheet(el);else go(k);}else openStack(el.dataset.g);return;}
      if(d.dead){drag=null;return;}drop(ev);};
    addEventListener('pointermove',mv);addEventListener('pointerup',up);addEventListener('pointercancel',up);});
  function startCarry(){const d=drag;d.moved=true;d.el.classList.add('rk-carried');
    if(d.sheet){d.uid=d.el.dataset.u;d.fromKey=fanG.key;d.fan=order.filter(u=>u!==d.uid);d.at=center;d.fan.splice(Math.min(center,d.fan.length),0,'__gap');
      // the other chapters lie in a row below while the sheet is carried
      const G=groups().filter(g=>g.kind==='chapter');strip.innerHTML=G.map(g=>`<div class="rk-mini${g.key===fanG.key?' here':''}" data-g="${esc(g.key)}"><b>${esc(g.word)}</b><i>${esc(g.name)}</i></div>`).join('');strip.classList.add('on');layFan();}
    else{d.keys=[...all.querySelectorAll('.rk-st.ch')].map(x=>x.dataset.g);}}
  function carry(ev){const d=drag,dx=ev.clientX-d.x0,dy=ev.clientY-d.y0;
    if(d.sheet){const p=slot(0);d.el.style.transform=`translate(${(d.r.left+dx).toFixed(1)}px,${(d.r.top+dy).toFixed(1)}px) rotate(3deg) scale(${(d.r.width/geo.Wc*1.04).toFixed(3)})`;d.el.style.transformOrigin='0 0';
      // over a chapter in the row below: lit; held there a moment — that chapter opens under the hand
      const el=document.elementsFromPoint(ev.clientX,ev.clientY).find(x=>x.classList?.contains('rk-mini'));strip.querySelectorAll('.rk-mini.over').forEach(x=>{if(x!==el)x.classList.remove('over');});
      if(el&&!el.classList.contains('here')){if(!el.classList.contains('over')){el.classList.add('over');clearTimeout(d.dwell);d.dwell=setTimeout(()=>switchUnderHand(el.dataset.g),650);}return;}
      clearTimeout(d.dwell);
      // in the fan: the gap goes where the hand is (the nearest place), the neighbours part
      const ids=d.fan.filter(u=>u!=='__gap');let best=0,bd=1e9;for(let k=0;k<=ids.length;k++){const sx=slot(k-Math.min(center,ids.length)).x;const dd=Math.abs(sx-ev.clientX);if(dd<bd){bd=dd;best=k;}}
      if(best!==d.at){d.at=best;ids.splice(best,0,'__gap');d.fan=ids;layFan();}}
    else{d.el.style.translate=`${dx}px ${dy}px`;const t=document.elementsFromPoint(ev.clientX,ev.clientY).find(x=>x!==d.el&&x.classList?.contains('ch'));
      if(t&&t.dataset.g!==d.over){d.over=t.dataset.g;const r=t.getBoundingClientRect(),after=ev.clientX>r.left+r.width/2;flip(()=>{all.insertBefore(d.el,after?t.nextSibling:t);});d.el.style.translate='0px 0px';d.x0=ev.clientX;d.y0=ev.clientY;}}}
  // the chapter under the hand opens; the sheet stays in the hand
  function switchUnderHand(key){const d=drag;if(!d)return;const G=groups(),g=G.find(x=>x.key===key);if(!g)return;rustle();
    [...fan.children].forEach(el=>{if(el!==d.el)el.remove();});view={key};fanG=g;order=g.sheets.map(x=>x.p.uid);center=Math.max(0,order.length-1);
    g.sheets.forEach((x,k)=>{const el=document.createElement('div');el.className='rk-sh';el.dataset.u=x.p.uid;el.dataset.s=x.s.id;el.dataset.k=k;el.innerHTML=sheetHtml(x,k);el.style.transform=tr(slot(4));el.style.opacity=0;fan.appendChild(el);});
    d.fan=[...order,'__gap'];d.at=order.length;center=order.length;chEl.querySelector('.rk-head em').textContent=`${g.word} · ${g.name}`;stk.innerHTML=stackHtml(g,false);
    strip.querySelectorAll('.rk-mini').forEach(x=>x.classList.toggle('here',x.dataset.g===key));requestAnimationFrame(layFan);}
  function drop(ev){const d=drag;clearTimeout(d.dwell);
    if(!d.sheet){drag=null;d.el.classList.remove('rk-carried');d.el.style.translate='';const keys=[...all.querySelectorAll('.rk-st.ch')].map(x=>x.dataset.g);
      if(keys.join()!==d.keys.join())send({action:'reorderChapters',ids:keys});return;}
    strip.classList.remove('on');const S=st?.sections||[];const fromSec=S.find(s=>(s.pages||[]).some(p=>p.uid===d.uid));
    const onMini=document.elementsFromPoint(ev.clientX,ev.clientY).find(x=>x.classList?.contains('rk-mini')&&!x.classList.contains('here'));
    let toKey=view.key,at=d.fan.indexOf('__gap');
    if(onMini){toKey=onMini.dataset.g;at=-1;}
    const ids=d.fan.filter(u=>u!=='__gap');if(at>=0)ids.splice(at,0,d.uid);
    drag=null;d.el.classList.remove('rk-carried');d.el.style.transformOrigin='';
    // it is lit for a moment where it now lies, and the fan opens on it
    view={key:toKey,focus:d.uid};lit=d.uid;setTimeout(()=>{if(lit===d.uid){lit='';fan.querySelector(`.rk-sh[data-u="${CSS.escape(d.uid)}"]`)?.classList.remove('lit');}},1800);
    if(fromSec&&toKey===fromSec.id){order=ids;center=ids.indexOf(d.uid);send({action:'reorderPages',sectionId:fromSec.id,ids});layFan();}
    else if(fromSec){const to=S.find(s=>s.id===toKey);send({action:'movePage',sectionId:fromSec.id,toSectionId:toKey,pageUid:d.uid,...(at>=0?{toIndex:at}:{})});if(onMini)fan.innerHTML='';}
    requestAnimationFrame(()=>fan.querySelector(`.rk-sh[data-u="${CSS.escape(d.uid)}"]`)?.classList.add('lit'));}
  const flip=fn=>{const els=[...all.querySelectorAll('.rk-st')],r0=new Map(els.map(x=>[x,x.getBoundingClientRect()]));fn();
    els.forEach(x=>{const a=r0.get(x),b=x.getBoundingClientRect();if(x===drag?.el||!a)return;const dx=a.left-b.left,dy=a.top-b.top;if(!dx&&!dy)return;x.animate([{translate:`${dx}px ${dy}px`},{translate:'0px 0px'}],{duration:320,easing:'cubic-bezier(.2,.8,.3,1)'});});};
  // a new sheet or episode: the fan opens on it (the last one) when the book's state comes back
  const _render=render;render=function(){if(view?.focus==='__last'){const g=groups().find(x=>x.key===view.key);if(g){view.focus=g.sheets[g.sheets.length-1]?.p.uid;center=g.sheets.length-1;lit=view.focus;}}
    _render();if(lit)fan.querySelector(`.rk-sh[data-u="${CSS.escape(lit)}"]`)?.classList.add('lit');};
  function openSheet(el){activeUid=el.dataset.u;send({action:'select',sectionId:el.dataset.s,pageUid:el.dataset.u});setTimeout(()=>window.OCHERKI_SET_MODE?.('write'),60);}

  // ——— coming and going: the three sheets of «Писать» leave the screen and come back
  const away=[['.ws-left',-1,0],['.bottom-left',-1,0],['#editorPaperWrap .editor-paper',0,1],['.wp-pane',1,0],['.wp-keys',1,0],['.ws-ttl',1,0],['#writingPrompt',0,1]];
  let anims=[];
  function sheetsOut(on,ms){anims.forEach(a=>{try{a.cancel();}catch(_){}});anims=[];
    away.forEach(([sel,dx,dy])=>document.querySelectorAll(sel).forEach(el=>{const to=`${dx*110}vw ${dy*110}vh`;
      const kf=on?[{translate:'0px 0px'},{translate:to}]:[{translate:to},{translate:'0px 0px'}];
      try{anims.push(el.animate(kf,{duration:ms,easing:on?'cubic-bezier(.55,0,.35,1)':'cubic-bezier(.2,.75,.25,1)',fill:on?'forwards':'none',composite:'add'}));}catch(_){}}));}
  // the middle of the writing sheet (where the fan's middle sheet lies)
  const paperCx=()=>{const p=document.querySelector('#editorPaperWrap .editor-paper');const r=p?.getBoundingClientRect();if(!r||!r.width)return innerWidth/2;const sh=parseFloat(getComputedStyle(document.getElementById('editorPaperWrap')).translate)||0;return r.left-sh+r.width/2;};
  function setBarTitle(){const t=bar()?.querySelector('.t b');if(!t)return;const S=st?.sections||[];const n=S.reduce((a,s)=>a+(s.included!==false?(s.pages||[]).length:0),0);
    const name=document.querySelector('.ws-ttl b')?.textContent||'Очерки жизни';t._h='';t.innerHTML=`<span class="up">Рукопись</span> · <i>${esc(name)}</i> · <span class="up">${n} ${plural(n,'лист','листа','листов')}</span>`;}
  function open(){if(isOpen||busy)return;busy=true;isOpen=true;want=0;scroll=0;cx=paperCx();
    send({action:'flush'});send({action:'requestState'});
    // it opens on the chapter of the sheet that was being written
    const G=groups(),g=G.find(x=>x.sheets.some(y=>y.p.uid===activeUid));view=g?{key:g.key,focus:activeUid}:null;
    H.classList.add('rk-on');sheetsOut(true,760);
    setTimeout(()=>{shell.classList.add('is-manuscript');fan.innerHTML='';render();setBarTitle();H.classList.add('rk-shown');busy=false;},700);}
  function close(){window.__msFlying=false;if(!isOpen)return;isOpen=false;H.classList.remove('rk-shown');strip.classList.remove('on');
    setTimeout(()=>{shell.classList.remove('is-manuscript');const t0=performance.now();
      const back=()=>{if(!shell.classList.contains('oc-ws')&&performance.now()-t0<1500)return requestAnimationFrame(back);sheetsOut(false,820);H.classList.remove('rk-on');};requestAnimationFrame(back);},240);}
  setInterval(()=>{if(isOpen&&H.classList.contains('rk-shown'))setBarTitle();},800);
  window.OCHERKI_MANUSCRIPT={open,close,isOpen:()=>isOpen,freeze:()=>{},activeUid:()=>activeUid,
    frontPick:()=>activeUid?{pageUid:activeUid}:null,flyToEditor:()=>false,sheetOf:()=>null};
})();
