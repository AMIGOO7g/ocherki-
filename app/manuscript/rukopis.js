// «Рукопись» (v236) — the chapter's sheets on the same desk, as little changed as can be.
// The writing sheet stays where it is: the sheet in the middle IS it (its size, its place, its shadow). The clean stack at the left
// becomes the pile of the sheets already passed (the one just before on top); its plate names the chapter — «Глава 1 · Карс · 3 из 9»
// (a press on it shows all the chapters). «Так ляжет» goes off to the right and the sheets still to come fan out there from under the
// middle one, each smaller and lying deeper than the one before; after the last one lies a dashed empty sheet: «+ лист», «+ эпизод».
// The chapters stand as brass plates along the right edge; a plate is carried up or down to put its chapter elsewhere.
// The wheel (or the arrows) moves one sheet: the middle one goes onto the pile, the next comes to the middle. A press on a sheet in
// the fan brings it to the middle; a press on the middle one opens it for writing (the desk simply comes back round it).
// Everything is moved by the hand, nothing by lists: a sheet is carried — the neighbours part where it would go; held over the pile
// or the fan's far end, the sheets turn under it; held over a chapter's plate the chapter opens under the hand; let go on a plate,
// the sheet flies into that chapter's end. Every move can be taken back («вернуть») for a few seconds.
// By day the window's picture lies on every sheet as on the desk, the deeper sheets darker; at night the lamp's beam — the same
// edges and tones as on «Так ляжет» — lights them by where they lie. Everything comes and goes by fading, never at once.
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
  let st=null,isOpen=false,busy=false,activeUid='',view=null,drag=null,tabDrag=null,lit='',litTab='',desk=null,scroll=0,want=0;
  addEventListener('message',e=>{const d=e.data||{};
    if(d.type==='OCHERKI_STRUCTURE_STATE'){st=d.payload||st;if(isOpen&&!drag&&!tabDrag&&!busy)render();}
    if(d.type==='OCHERKI_ACTIVE_STATE'&&d.payload?.pageUid)activeUid=d.payload.pageUid;});

  const board=document.createElement('div');board.className='rk-board';
  board.innerHTML='<div class="rk-all"></div><div class="rk-ch"><div class="rk-plate" role="button"></div><div class="rk-fan"></div><div class="rk-tabs"></div></div>'+
    '<div class="rk-undo"><span></span><button type="button">вернуть</button></div>';
  document.body.append(board);
  const $=s=>board.querySelector(s);
  const all=$('.rk-all'),chEl=$('.rk-ch'),fan=$('.rk-fan'),plate=$('.rk-plate'),tabs=$('.rk-tabs'),undoEl=$('.rk-undo');
  // the empty sheet after the chapter's last one
  const blank=document.createElement('div');blank.className='rk-blank';
  blank.innerHTML='<button type="button" data-a="page"><span>+ лист</span></button><button type="button" data-a="episode"><i class="rk-rib"></i><span>+ эпизод</span></button>';

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

  // ——— the desk's places, measured on the desk itself (the same on every screen). The middle sheet is the writing sheet as it is
  // seen: the editor's own sheet inside its frame (the frame's box is taller and starts higher)
  const bar=()=>document.querySelector('.wc.wc-w:not(.bq-car)');
  function measureDesk(){const w=document.getElementById('editorPaperWrap');const sh=w?parseFloat(getComputedStyle(w).translate)||0:0;
    let r=null;try{const f=frame(),a=f?.contentDocument?.getElementById('activeSheet');if(a){const q=a.getBoundingClientRect(),fr=f.getBoundingClientRect();if(q.width)r={left:fr.left+q.left,top:fr.top+q.top,width:q.width,height:q.height};}}catch(_){}
    if(!r){const q=w?.querySelector('.editor-paper')?.getBoundingClientRect();if(q&&q.width)r={left:q.left,top:q.top,width:q.width,height:q.height};}
    const L=document.querySelector('.ws-left'),T=document.querySelector('.ws-tabs'),b=bar()?.getBoundingClientRect();
    const box=el=>{if(!el)return null;const q=el.getBoundingClientRect(),t=parseFloat(getComputedStyle(el).translate)||0;return q.width?{left:q.left-t,top:q.top,width:q.width,height:q.height}:null;};
    desk={paper:r?{left:r.left-sh,top:r.top,width:r.width,height:r.height}:{left:innerWidth/2-330,top:110,width:660,height:900},
      pile:box(L),plate:box(T),bar:b&&b.width?{left:b.left,right:b.right,top:b.top,bottom:b.bottom,height:b.height,width:b.width}:null};
    const P=desk.paper;if(!desk.pile){const w=P.width*.52;desk.pile={left:P.left-w-108,top:P.top+P.height*.22,width:w,height:w/.707};}
    if(!desk.plate){const pl=desk.pile;desk.plate={left:pl.left-10,top:pl.top-62,width:pl.width+20,height:46};}
    try{if(!lookEl.textContent)lookEl.textContent=localStorage.getItem(lookKey())||'';}catch(_){}readLook();
    // the plates' column at the right edge, and how much of the fan fits before it
    const tw=Math.round(Math.max(130,Math.min(190,innerWidth*.09)));desk.tabs={left:innerWidth-tw-18,width:tw};
    // the sheets go under the bar's lower edge, as the writing sheet does
    board.style.setProperty('--rk-top',Math.round(desk.bar?desk.bar.bottom-14:0)+'px');
    // the lamp's beam is one picture of the whole screen, laid under every sheet from where it lies (as the window's picture is),
    // so a sheet moving carries its light with it frame by frame
    board.style.setProperty('--rk-beam',beamOf({x:0,y:0,w:innerWidth,h:innerHeight},{x:P.left,y:P.top,w:P.width,h:P.height}));return desk;}

  // the writing sheet's own look (its paper, episode line, text, number, its photographs' place), read off the editor's sheet and
  // given to the sheets here, so that the middle sheet is the writing sheet to the pixel, on any screen
  const lookEl=document.createElement('style');lookEl.id='rkLook';document.head.appendChild(lookEl);
  // (kept for this screen's size, so it is there before a chapter's sheet has been open this time)
  const lookKey=()=>'ocherkiRkLook:'+innerWidth+'x'+innerHeight;try{lookEl.textContent=localStorage.getItem(lookKey())||'';}catch(_){}
  // it is read off a chapter's sheet only (a cover or a title sheet is set otherwise), and kept till the next one
  function readLook(){try{const d=frame()?.contentDocument,a=d?.getElementById('activeSheet');if(!a)return;const W=d.defaultView,cs=e=>W.getComputedStyle(e),R=a.getBoundingClientRect();
    const sec=W.currentSection?.(),pg=W.currentPage?.();if(!sec||sec.type!=='chapter'||pg?.type==='document'||pg?.bookRole==='document')return;
    const rel=e=>{const r=e?.getBoundingClientRect();return r&&r.width?{l:r.left-R.left,t:r.top-R.top,w:r.width,h:r.height}:null;};
    const font=c=>`font-family:${c.fontFamily};font-size:${c.fontSize};line-height:${c.lineHeight};font-weight:${c.fontWeight};color:${c.color};letter-spacing:${c.letterSpacing};word-spacing:${c.wordSpacing};text-align:${c.textAlign};text-indent:${c.textIndent};hyphens:${c.hyphens}`;
    const S=cs(a),pa=a.querySelector('.paper'),ed=a.querySelector('.editor'),ep=a.querySelector('.episode-row'),en=a.querySelector('.episode'),pn=a.querySelector('.page-no');let css='';
    css+=`.rk-board .rk-in{background-image:${S.backgroundImage};background-color:${S.backgroundColor}}`;
    if(pa){const c=cs(pa),r=rel(pa);if(r)css+=`.rk-board .rk-paper{left:${r.l}px;top:${r.t}px;width:${r.w}px;height:${r.h}px;inset:auto;background-image:${c.backgroundImage};background-color:${c.backgroundColor};border:${c.border};box-shadow:${c.boxShadow}}`;}
    {const r=rel(ed);if(r)css+=`.rk-board .rk-txt{left:${r.l}px;top:${r.t}px;width:${r.w}px;height:${r.h}px;bottom:auto;${font(cs(ed))}}`;
      const pp=ed?.querySelector('p');if(pp){const c=cs(pp);css+=`.rk-board .rk-txt p{margin:${c.marginTop} 0 ${c.marginBottom};text-indent:${c.textIndent}}`;}}
    {const r=rel(ep);if(r&&en){const lc=W.getComputedStyle(ep,'::before');css+=`.rk-board .rk-epr{left:${r.l}px;top:${r.t}px;width:${r.w}px;height:${r.h}px;gap:${cs(ep).columnGap};${font(cs(en))};text-align:center}.rk-board .rk-epr::before,.rk-board .rk-epr::after{background:${lc.backgroundColor};max-width:${lc.width}}`;}}
    {const r=rel(pn);if(r)css+=`.rk-board .rk-pno{left:${r.l}px;top:${r.t}px;right:auto;${font(cs(pn))}}`;}
    {const img=d.querySelector('.photo-stack img'),r=rel(img);if(r)css+=`.rk-board .rk-ph{left:${r.l}px;top:${r.t}px;width:${r.w}px;height:${r.h}px}`;}
    if(lookEl.textContent!==css){lookEl.textContent=css;try{localStorage.setItem(lookKey(),css);}catch(_){}}}catch(_){}}

  // ——— a sheet's place: d steps from the middle (0 the middle; below 0 — on the pile; above — the fan, each smaller and deeper)
  const SC=[1,.86,.75,.66,.58,.52],VIS=[0,.225,.177,.138,.108,.09],PILE=[[0,0,-.5],[-12,9,-2.2],[7,4,1.5]];
  let fanN=4;
  const slot=d=>{const P=desk.paper;
    if(d===0)return{x:P.left,y:P.top,s:1,r:0,z:50,o:1};
    // the pile lies as the desk's clean stack did: the top sheet, one under it turned left, one turned right (each about its middle)
    if(d<0){const L=desk.pile,a=-d,s=L.width/P.width,[ox,oy,r]=PILE[Math.min(a,3)-1],q=r*Math.PI/180,w=P.width*s/2,h=P.height*s/2;
      return{x:L.left+ox+w-(Math.cos(q)*w-Math.sin(q)*h),y:L.top+oy+h-(Math.sin(q)*w+Math.cos(q)*h),s,r,z:30-Math.min(a,9),o:a>3?0:1};}
    const a=Math.min(d,fanN+1);let edge=P.left+P.width,x=0,y=0,s=1;
    for(let k=1;k<=a;k++){s=SC[Math.min(k,5)];const w=P.width*s,h=P.height*s;x=edge+P.width*VIS[Math.min(k,5)]-w;y=P.top+(P.height-h)*.45+k*10*(P.height/944);edge=x+w;}
    return{x,y,s,r:Math.min(d,fanN)*1.2,z:50-d,o:d>fanN?0:1,depth:d};};
  const tr=p=>`translate(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px) rotate(${p.r}deg) scale(${p.s})`;
  // a sheet as the editor draws it: its paper, the episode line (in a chapter), the text with its own line breaks, the little number;
  // its first photograph at its left edge; the large number for the pile and the fan; the light as a layer of its own
  const sheetHtml=(x,k)=>{const p=x.p,doc=p.type==='document'||p.bookRole==='document',ph=(p.photos||[]).find(q=>q&&q.src);
    // over the text: the episode's name in a chapter; elsewhere the sheet's own name (Обложка, От автора…), so each is known
    const ep=x.s.type==='chapter'?String(p.episode||'').trim():String(p.title||x.s.title||'').trim();
    return `${p.isEpisodeStart||doc?'<i class="rk-rib"></i>':''}<div class="rk-in"><i class="rk-paper"></i><div class="rk-pno">${k+1}</div>${ep?`<div class="rk-epr"><span>${esc(ep)}</span></div>`:''}`+
      `<div class="rk-txt">${textHtml(p)}</div><i class="rk-lt"><b class="rk-sun"></b><b class="rk-beam"></b></i><b class="rk-big">${k+1}</b></div>${ph?`<img class="rk-ph" src="${esc(ph.src)}" alt="">`:''}`;};
  // the sheet's text as the editor sets it: its own marked-up text when it has one, else paragraph by paragraph (an empty line
  // between them), the editor's space after each
  const textHtml=p=>{if(p.semanticHtml)return String(p.semanticHtml).replace(/\scontenteditable="[^"]*"/g,'');
    const parts=String(p.text||'').split(/\n{2,}/).map(x=>x.trim()).filter(Boolean).slice(0,40);return parts.map(t=>`<p>${esc(t)}</p>`).join('');};
  // a sheet that is no longer of the view fades where it lies, then goes
  const retire=el=>{el.dataset.u='';el.classList.add('gone');el.style.opacity=0;el.style.pointerEvents='none';setTimeout(()=>el.remove(),520);};
  const live=()=>[...fan.children].filter(el=>el.dataset.u);

  // ——— the light. By day the window's picture laid from where the sheet lies (scaled back with it) and the deeper sheets darker;
  // at night the lamp's beam: its edges run from the bar's ends down and out, as on «Так ляжет» and the stack
  // r — the box the picture is drawn for; ref — the box whose size sets how soft the beam's edges are (the writing sheet's, as on «Так
  // ляжет» and the stack); without ref, the box itself
  function beamOf(r,ref){const b=desk.bar;if(!b)return'';ref=ref||r;const x0=b.left+44,x1=b.right-44,y=b.top+b.height*.9,sp=b.width*.3,Hh=innerHeight*1.04;
    const edge=(ex,dxs)=>{let dx=dxs,dy=Hh-y;const l=Math.hypot(dx,dy);dx/=l;dy/=l;const nx=dxs>0?dy:-dy,ny=dxs>0?-dx:dx,A=Math.atan2(nx,-ny),
      L=Math.abs(r.w*Math.sin(A))+Math.abs(r.h*Math.cos(A)),Lr=Math.abs(ref.w*Math.sin(A))+Math.abs(ref.h*Math.cos(A)),k=Lr/L,t=50+((ex-(r.x+r.w/2))*nx+(y-(r.y+r.h/2))*ny)/L*100;
      return `linear-gradient(${(A*180/Math.PI).toFixed(1)}deg,rgba(150,100,50,0) ${(t-4*k).toFixed(2)}%,rgba(110,74,42,.5) ${(t+14*k).toFixed(2)}%,rgba(46,28,12,.7) ${(t+38*k).toFixed(2)}%)`;};
    // the lamp's falling off downwards, from the writing sheet's top to its foot
    const v=q=>((ref.y+ref.h*q-r.y)/r.h*100).toFixed(2)+'%';
    return edge(x1,sp)+','+edge(x0,-sp)+`,linear-gradient(180deg,rgba(160,105,50,.04) ${v(0)},rgba(140,90,42,.2) ${v(.55)},rgba(95,60,28,.46) ${v(1)})`;}
  // the light layer shows the desk's picture of light from where the sheet lies; on the way it slides by the same time and curve as the
  // sheet (now — at once, for a sheet just made). A sheet not seen draws no light
  function lightSheet(el,p,now){el.style.setProperty('--sc',p.s);el.style.setProperty('--dim',p.depth?Math.max(.8,1-.05*p.depth).toFixed(3):1);
    const lt=el.querySelector('.rk-lt');if(!lt)return;lt.style.display=p.o?'':'none';if(now)lt.style.transition='none';
    lt.style.backgroundPosition=`${(-p.x/p.s+2).toFixed(1)}px ${(-p.y/p.s+2).toFixed(1)}px`;lt.style.backgroundSize=`${(innerWidth/p.s).toFixed(1)}px ${(innerHeight/p.s).toFixed(1)}px`;
    if(now){lt.getBoundingClientRect();lt.style.transition='';}}

  // ——— the open chapter
  let G=null,center=0,order=[];
  function renderFan(keepCenter,fromMiddle,instant,from){const gs=groups();G=gs.find(g=>g.key===view.key)||null;if(!G){view=null;return renderAll();}
    const n=G.sheets.length;order=G.sheets.map(x=>x.p.uid);
    {const i=view.focus?order.indexOf(view.focus):-1;if(i>=0){center=i;view.focus=null;}else if(!keepCenter){const j=order.indexOf(activeUid);center=j>=0?j:0;}}center=Math.max(0,Math.min(n-1,center));
    // how many sheets of the fan fit before the plates
    {const P=desk.paper;let edge=P.left+P.width;fanN=0;for(let k=1;k<=5;k++){edge+=P.width*VIS[k];if(edge>desk.tabs.left-16)break;fanN=k;}fanN=Math.max(1,fanN);}
    fan.style.setProperty('--w',desk.paper.width+'px');fan.style.setProperty('--h',desk.paper.height+'px');
    const have=new Map(live().map(el=>[el.dataset.u,el]));let fresh=false;
    G.sheets.forEach((x,k)=>{let el=have.get(x.p.uid);have.delete(x.p.uid);
      if(!el){el=document.createElement('div');el.className='rk-sh';el.dataset.u=x.p.uid;fan.appendChild(el);fresh=true;
        // new sheets come out from under the middle sheet (or in from the right edge), fading in; only on the way in from the
        // editor is the middle one there at once (it lies over the writing sheet)
        // (from all the chapters they come out of the chapter's stack, its top sheet growing into the middle one)
        const p0=from||(fromMiddle?slot(0):slot(fanN+1));el.style.transform=tr(p0);el.style.opacity=(instant||from)&&k===center?1:0;el._p0=p0;}
      el.dataset.s=x.s.id;el.dataset.k=k;el.classList.toggle('doc',x.p.type==='document'||x.p.bookRole==='document');el.classList.toggle('rib',!!x.p.isEpisodeStart);
      const html=sheetHtml(x,k);if(el._h!==html){el._h=html;el.innerHTML=html;if(el._p)lightSheet(el,el._p,true);}if(el._p0){lightSheet(el,el._p0,true);el._p0=null;}});
    have.forEach(retire);
    if(blank.parentNode!==fan){blank.style.transform=tr(slot(0));blank.style.opacity=0;fan.appendChild(blank);fresh=true;}
    if(fresh)fan.getBoundingClientRect();
    layFan();renderPlate();renderTabs();setBarTitle();}
  let fanHold=false;
  function layFan(){if(fanHold){renderPlate();return;}const ids=drag?.fan||order,c=drag?.fan?drag.c:center;
    ids.forEach((u,k)=>{if(u==='__gap')return;const el=fan.querySelector(sel(u));if(!el||el===drag?.el)return;const p=slot(k-c);
      el._p=p;el.style.transform=tr(p);el.style.zIndex=p.z;el.style.opacity=p.o;el.style.pointerEvents=p.o?'':'none';el.classList.toggle('mid',k===c);el.classList.toggle('past',k<c);lightSheet(el,p);});
    // the empty sheet lies after the last one (only in a chapter, and only once the fan reaches it)
    const p=slot(Math.max(1,ids.length-c)),on=G?.kind==='chapter'&&!drag&&p.o;
    blank.style.transform=tr(p);blank.style.zIndex=p.z;blank.style.opacity=on?1:0;blank.style.pointerEvents=on?'':'none';blank.style.setProperty('--sc',p.s);
    renderPlate();}
  function go(to){if(!G)return;to=Math.max(0,Math.min(order.length-1,to));if(to===center)return;center=to;rustle();layFan();}
  // the plate over the pile: the chapter, where we are in it; a press shows all the chapters
  function renderPlate(){if(!G)return;const pl=desk.plate;Object.assign(plate.style,{left:pl.left+'px',top:pl.top+'px',width:pl.width+'px',height:pl.height+'px'});
    const h=`<b>${esc(G.word)}</b>${G.name?`<i>${esc(G.name)}</i>`:''}<span>${center+1} из ${order.length}</span>`;if(plate._h!==h){plate._h=h;plate.innerHTML=h;}}
  function renderTabs(){const gs=groups();Object.assign(tabs.style,{left:desk.tabs.left+'px',width:desk.tabs.width+'px',top:(desk.bar?desk.bar.bottom+24:140)+'px'});
    tabs.innerHTML='<div class="rk-tab rk-taball" role="button"><b>все главы</b></div>'+gs.map(g=>`<div class="rk-tab${g.key===G?.key?' cur':''}${g.kind==='chapter'?' ch':''}${g.key===litTab?' lit':''}" data-g="${esc(g.key)}"><b>${esc(g.word)}<span> · ${g.sheets.length}</span></b>${g.name?`<i>${esc(g.name)}</i>`:''}</div>`).join('')+'<div class="rk-tab rk-tabnew" role="button">+ глава</div>';}

  // ——— all the chapters as stacks (the bar's back key, or the plate)
  const PH=[[16,6,-5],[92,12,4],[50,44,-2]];
  const stackHtml=(g,cur)=>{const n=g.sheets.length,layers=Math.max(1,Math.min(6,1+Math.ceil(n/3)));let h='';
    for(let k=layers;k>0;k--)h+=`<i class="rk-ly" style="--k:${k};--sg:${k%2?1:-1}"></i>`;
    h+=`<div class="rk-top"><b>${esc(g.word)}</b>${g.name?`<h3>${esc(g.name)}</h3>`:''}<i class="rk-orn"></i>`+
      (g.photos.length?`<div class="rk-phs">${g.photos.map((q,k)=>`<img src="${esc(q.src)}" alt="" style="left:${PH[k][0]}px;top:${PH[k][1]}px;transform:rotate(${PH[k][2]}deg)">`).join('')}</div>`
        :`<div class="rk-first">${esc(g.kind==='part'?g.note:(g.first?`«${g.first}…»`:'пока пусто'))}</div>`)+`<span>${sheetsWord(n)}${g.nph?` · ${g.nph} фото`:''}</span><i class="rk-lamp"></i></div>`;
    return `<div class="rk-st${cur?' cur':''}${g.kind==='chapter'?' ch':''}" data-g="${esc(g.key)}">${h}</div>`;};
  function renderAll(){const gs=groups(),curKey=gOf(activeUid)?.key;
    // the stacks stand in the middle of the whole desk
    Object.assign(all.style,{left:'40px',right:'40px'});
    all.innerHTML=gs.map(g=>stackHtml(g,g.key===curKey)).join('')+'<div class="rk-st rk-new" role="button">+ глава</div>';glideAll(true);lightAll();setBarTitle();}
  function glideAll(now){const t=desk.bar?desk.bar.bottom:120,max=Math.max(0,all.scrollHeight-(innerHeight-t-60));want=Math.max(0,Math.min(max,want));if(now)scroll=want;
    all.style.transform=`translateY(${Math.round(t+34-scroll)}px)`;}
  let gl=0;const glide=()=>{if(gl)return;const step=()=>{const d=want-scroll;if(Math.abs(d)<.5){scroll=want;gl=0;glideAll();lightAll();return;}scroll+=d*.18;glideAll();lightAll();gl=requestAnimationFrame(step);};gl=requestAnimationFrame(step);};
  function lightAll(){all.querySelectorAll('.rk-st:not(.rk-new)').forEach(el=>{const r=el.getBoundingClientRect();if(!r.width)return;
    const t=parseFloat(el.style.translate?.split(' ')[1])||0;el.style.setProperty('--ox',(-r.left).toFixed(1)+'px');el.style.setProperty('--oy',(-(r.top-t)).toFixed(1)+'px');el.style.setProperty('--sc',1);});}
  new MutationObserver(()=>{if(isOpen&&G)layFan();}).observe(shell,{attributes:true,attributeFilter:['class']});

  function render(){if(view?.key==='__newch'){const gs=groups().filter(g=>g.kind==='chapter');const g=gs[gs.length-1];view=g?{key:g.key}:null;}
    if(view?.focus==='__last'){const g=groups().find(x=>x.key===view.key);if(g){view.focus=g.sheets[g.sheets.length-1]?.p.uid;lit=view.focus;}}
    if(!view){chEl.classList.remove('on');all.classList.add('on');renderAll();}else{all.classList.remove('on');chEl.classList.add('on');renderFan(true);}
    if(lit)fan.querySelector(sel(lit))?.classList.add('lit');}
  // into a chapter: the sheets of the one before fade where they lie, the new ones come out from under the middle and fade in;
  // back to all chapters: they go back under the middle and fade, and the stacks come
  // a stack's place as a sheet's place (the stack is a small sheet)
  const stackSlot=q=>({x:q.left,y:q.top,s:q.width/desk.paper.width,r:0,z:60,o:1});
  function openChapter(key,focus){const st=all.querySelector(`.rk-st[data-g="${CSS.escape(key)}"]`),q=all.classList.contains('on')&&st?st.getBoundingClientRect():null;
    view={key,focus};
    if(!q){all.classList.remove('on');chEl.classList.add('on');renderFan(false,true);rustle();return;}
    // from all the chapters: the stack's top sheet grows into the middle sheet, the others come out from under it
    busy=true;st.classList.add('rk-wait');all.classList.remove('on');chEl.classList.add('on');renderFan(false,false,false,stackSlot(q));rustle();
    setTimeout(()=>{st.classList.remove('rk-wait');busy=false;},600);}
  function back(){if(!isOpen||busy)return false;if(!view)return false;busy=true;const key=G?.key;
    // the sheets lie down on the pile one after another, the pile goes to its chapter's place among the stacks and becomes its stack
    const els=live(),c=center;els.forEach(el=>{const k=+el.dataset.k;el.style.transitionDelay=Math.min(Math.abs(k-c),6)*40+'ms';const p=slot(Math.min(-1,k-c-1));el.style.transform=tr(p);el.style.opacity=p.o;el.style.zIndex=30-Math.abs(k-c);lightSheet(el,p);});
    blank.style.opacity=0;chEl.classList.add('folding');rustle();
    setTimeout(()=>{view=null;G=null;renderAll();const st=all.querySelector(`.rk-st[data-g="${CSS.escape(key||'')}"]`);
      if(st){glideTo(st);st.classList.add('rk-wait');}
      const q=st?.getBoundingClientRect();chEl.classList.remove('on');all.classList.add('on');
      const E='.85s cubic-bezier(.45,0,.2,1)';
      els.forEach(el=>{el.style.transitionDelay='';el.style.transition=`transform ${E},opacity .45s ease .4s`;const lt=el.querySelector('.rk-lt');if(lt)lt.style.transition=`background-position ${E},background-size ${E}`;if(q){el.style.transform=tr(stackSlot(q));lightSheet(el,stackSlot(q));}el.style.opacity=q&&el.classList.contains('mid')?1:0;});
      setTimeout(()=>{els.forEach(el=>el.remove());st?.classList.remove('rk-wait');chEl.classList.remove('folding');busy=false;},880);},520);return true;}
  // the stacks' view scrolls (at once) so that the chapter's stack stands in sight
  function glideTo(st){const t=desk.bar?desk.bar.bottom:120,r=st.getBoundingClientRect(),y=r.top-(t+34);if(r.bottom>innerHeight-40||r.top<t){want=scroll+y-40;glideAll(true);}}

  // ——— the wheel: one sheet at a time — while a sheet is still on its way the wheel's further notches are let go (a quick flick of
  // several notches turns one sheet); in all the chapters it glides
  let acc=0,lastTurn=0;
  board.addEventListener('wheel',e=>{if(!isOpen)return;if(e.target.closest('.rk-tabs'))return;e.preventDefault();const dy=e.deltaMode===1?e.deltaY*33:e.deltaY;
    if(!view){want+=dy;glide();return;}
    const now=performance.now();if(now-lastTurn<560){acc=0;return;}acc+=dy;if(Math.abs(acc)<36)return;lastTurn=now;go(center+(acc>0?1:-1));acc=0;},{passive:false});
  addEventListener('keydown',e=>{if(!isOpen||!view||drag||tabDrag)return;if(e.key==='ArrowRight'||e.key==='ArrowDown')go(center+1);else if(e.key==='ArrowLeft'||e.key==='ArrowUp')go(center-1);else if(e.key==='Escape')back();});
  addEventListener('resize',()=>{if(isOpen){const wasOn=H.classList.contains('rk-on');H.classList.remove('rk-hide');measureDesk();if(wasOn)H.classList.add('rk-hide');render();}});
  plate.addEventListener('click',()=>back());

  // ——— «вернуть»: every move can be taken back for a few seconds
  let undoFn=null,undoT=0;
  function offerUndo(text,fn){undoFn=fn;undoEl.querySelector('span').textContent=text;undoEl.classList.add('on');clearTimeout(undoT);undoT=setTimeout(()=>{undoEl.classList.remove('on');undoFn=null;},7000);}
  undoEl.querySelector('button').addEventListener('click',()=>{const f=undoFn;undoFn=null;undoEl.classList.remove('on');f?.();});
  function commitOrder(ids,uid){const prev=order.slice(),sec=G.sec;if(!sec)return;order=ids;center=ids.indexOf(uid);layFan();send({action:'reorderPages',sectionId:sec.id,ids});
    shine(uid);offerUndo('Лист переставлен',()=>{view.focus=uid;send({action:'reorderPages',sectionId:sec.id,ids:prev});});}
  // a sheet into another chapter: «follow» — the view goes with it (it was laid among that chapter's sheets); otherwise the view
  // stays and the chapter's plate lights up (it was dropped on the plate)
  function carryOver(uid,fromG,toG,at,follow){const was=fromG.sheets.findIndex(x=>x.p.uid===uid);
    send({action:'movePage',sectionId:fromG.sec.id,toSectionId:toG.sec.id,pageUid:uid,...(at>=0?{toIndex:at}:{})});
    if(follow){view={key:toG.key,focus:uid};shine(uid);}else{view={key:fromG.key};center=Math.min(center,Math.max(0,fromG.sheets.length-2));litTab=toG.key;setTimeout(()=>{if(litTab===toG.key){litTab='';tabs.querySelector('.rk-tab.lit')?.classList.remove('lit');}},1800);}
    offerUndo(`Лист перенесён в «${toG.word}${toG.name?' · '+toG.name:''}»`,()=>{view={key:fromG.key,focus:uid};lit=uid;send({action:'movePage',sectionId:toG.sec.id,toSectionId:fromG.sec.id,pageUid:uid,toIndex:was});});}
  const shine=uid=>{lit=uid;setTimeout(()=>{if(lit===uid){lit='';fan.querySelector(sel(uid))?.classList.remove('lit');}},1800);requestAnimationFrame(()=>fan.querySelector(sel(uid))?.classList.add('lit'));};

  // ——— presses and carrying
  blank.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||!G?.sec)return;view.focus='__last';
    if(b.dataset.a==='page')send({action:'addPageAt',sectionId:G.sec.id});else send({action:'addEpisode',sectionId:G.sec.id,atEnd:true});});
  all.addEventListener('click',e=>{if(e.target.closest('.rk-new')){send({action:'addChapter'});want=1e9;}});
  board.addEventListener('pointerdown',e=>{if(e.button!==0||busy)return;
    const sh=e.target.closest('.rk-sh:not(.gone)'),stack=e.target.closest('.rk-all .rk-st:not(.rk-new)');if(!sh&&!stack)return;e.preventDefault();const el=sh||stack;
    drag={el,sheet:!!sh,x0:e.clientX,y0:e.clientY,r:el.getBoundingClientRect(),moved:false};
    const mv=ev=>{const d=drag;if(!d)return;if(!d.moved&&Math.hypot(ev.clientX-d.x0,ev.clientY-d.y0)<7)return;
      if(!d.moved){d.moved=true;if(d.sheet?G?.kind!=='chapter':!el.classList.contains('ch')){d.dead=true;return;}startCarry();}
      if(!d.dead){d.ev=ev;if(!d.raf)d.raf=requestAnimationFrame(()=>{d.raf=0;if(drag===d)carry(d.ev);});}};
    const up=ev=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);const d=drag;
      if(!d.moved){drag=null;if(ev.type!=='pointerup')return;if(d.sheet){const k=+el.dataset.k;if(k===center)openSheet(el);else go(k);}else openChapter(el.dataset.g);return;}
      if(d.dead){drag=null;return;}drop(ev);};
    addEventListener('pointermove',mv);addEventListener('pointerup',up);addEventListener('pointercancel',up);});
  function startCarry(){const d=drag;
    if(d.sheet){d.el.classList.add('rk-carried');d.uid=d.el.dataset.u;d.fromKey=G.key;d.was=order.indexOf(d.uid);d.fan=order.filter(u=>u!==d.uid);d.c=Math.min(center,d.fan.length);d.at=d.c;d.fan.splice(d.at,0,'__gap');layFan();tabs.classList.add('drop');
      // held over the pile or the fan's far end, the sheets turn under the hand, one at a time
      d.turn=setInterval(()=>{if(drag!==d||!d.ev||d.overTab)return;const ids=d.fan.filter(u=>u!=='__gap');
        if(d.zone==='pile'&&d.c>0){d.c--;rustle();carry(d.ev);}else if(d.zone==='far'&&ids.length-d.c>fanN){d.c++;rustle();carry(d.ev);}},520);}
    else{d.keys=[...all.querySelectorAll('.rk-st.ch')].map(x=>x.dataset.g);d.fly=d.el.cloneNode(true);d.fly.classList.add('rk-fly');Object.assign(d.fly.style,{left:d.r.left+'px',top:d.r.top+'px',width:d.r.width+'px',height:d.r.height+'px'});
      board.appendChild(d.fly);d.el.classList.add('rk-place');d.rects=null;}}
  function carry(ev){const d=drag,dx=ev.clientX-d.x0,dy=ev.clientY-d.y0;
    if(!d.sheet){d.fly.style.transform=`translate(${dx}px,${dy}px) rotate(2deg) scale(1.04)`;d.fly.style.setProperty('--ox',(-(d.r.left+dx)).toFixed(1)+'px');d.fly.style.setProperty('--oy',(-(d.r.top+dy)).toFixed(1)+'px');
      // the stacks' places are measured once per change, not on every move (it lagged)
      if(!d.rects)d.rects=[...all.querySelectorAll('.rk-st.ch')].filter(x=>x!==d.el).map(x=>({x,r:x.getBoundingClientRect()}));
      const t=d.rects.find(o=>ev.clientX>=o.r.left&&ev.clientX<=o.r.right&&ev.clientY>=o.r.top&&ev.clientY<=o.r.bottom);if(!t)return;
      const after=ev.clientX>t.r.left+t.r.width/2,ref=after?t.x.nextSibling:t.x;if(ref===d.el||ref===d.el.nextSibling)return;flip([...all.querySelectorAll('.rk-st')],()=>all.insertBefore(d.el,ref));d.rects=null;return;}
    const s=d.r.width/desk.paper.width*1.04;d.el.style.transformOrigin='0 0';d.el.style.transform=`translate(${(d.r.left+dx).toFixed(1)}px,${(d.r.top+dy).toFixed(1)}px) rotate(3deg) scale(${s.toFixed(3)})`;
    const tab=document.elementsFromPoint(ev.clientX,ev.clientY).find(x=>x.classList?.contains('rk-tab'));tabs.querySelectorAll('.rk-tab.over').forEach(x=>{if(x!==tab)x.classList.remove('over');});
    d.overTab=!!tab;if(tab){d.zone='';if(tab.classList.contains('ch')&&tab.dataset.g!==G.key&&!tab.classList.contains('over')){tab.classList.add('over');clearTimeout(d.dwell);d.dwell=setTimeout(()=>switchUnderHand(tab.dataset.g),650);}return;}
    clearTimeout(d.dwell);
    const ids=d.fan.filter(u=>u!=='__gap'),P=desk.paper;let best=d.c;
    if(ev.clientX<P.left-12)d.zone='pile';
    else{let bd=1e9;for(let k=d.c;k<=ids.length;k++){const p=slot(k-d.c);if(!p.o&&k>d.c)break;const dd=Math.abs(p.x+P.width*p.s/2-ev.clientX);if(dd<bd){bd=dd;best=k;}}
      d.zone=best-d.c>=fanN&&ev.clientX>P.left+P.width?'far':'';}
    if(best!==d.at||d.fan.indexOf('__gap')!==best){d.at=best;ids.splice(best,0,'__gap');d.fan=ids;layFan();}}
  function switchUnderHand(key){const d=drag;if(!d)return;const g=groups().find(x=>x.key===key);if(!g)return;rustle();
    live().forEach(el=>{if(el!==d.el)retire(el);});view={key};G=g;order=g.sheets.map(x=>x.p.uid);
    g.sheets.forEach((x,k)=>{const el=document.createElement('div');el.className='rk-sh';el.dataset.u=x.p.uid;el.dataset.s=x.s.id;el.dataset.k=k;el.innerHTML=sheetHtml(x,k);el.style.transform=tr(slot(fanN+1));el.style.opacity=0;fan.appendChild(el);lightSheet(el,slot(fanN+1),true);});
    fan.getBoundingClientRect();d.fan=[...order,'__gap'];d.at=order.length;d.c=Math.max(0,order.length-1);renderTabs();setBarTitle();layFan();}
  function drop(ev){const d=drag;clearTimeout(d.dwell);clearInterval(d.turn);tabs.classList.remove('drop');
    if(!d.sheet){const r=d.el.getBoundingClientRect();d.fly.style.transition='transform .32s cubic-bezier(.2,.8,.3,1)';d.fly.style.transform=`translate(${r.left-d.r.left}px,${r.top-d.r.top}px)`;
      setTimeout(()=>{d.fly.remove();d.el.classList.remove('rk-place');lightAll();drag=null;const keys=[...all.querySelectorAll('.rk-st.ch')].map(x=>x.dataset.g);
        if(keys.join()!==d.keys.join())reorderChapters(keys,d.keys);},330);return;}
    const tab=document.elementsFromPoint(ev.clientX,ev.clientY).find(x=>x.classList?.contains('rk-tab')&&x.classList.contains('ch'));
    const fromG=groups().find(g=>g.key===d.fromKey),uid=d.uid;let at=d.fan.indexOf('__gap');drag=null;d.el.classList.remove('rk-carried');
    if(tab&&tab.dataset.g!==G.key){
      // let go on a chapter's plate: the sheet flies into it, small, and fades
      const q=tab.getBoundingClientRect(),el=d.el,toG=groups().find(g=>g.key===tab.dataset.g);tab.classList.remove('over');
      el.dataset.u='';el.classList.add('gone');el.style.transition='transform .45s cubic-bezier(.4,0,.2,1),opacity .45s ease';
      el.style.transform=`translate(${(q.left+q.width*.2).toFixed(1)}px,${(q.top+4).toFixed(1)}px) rotate(0deg) scale(.06)`;el.style.opacity=0;setTimeout(()=>el.remove(),480);
      carryOver(uid,fromG,toG,-1,false);order=order.filter(u=>u!==uid);center=Math.min(center,Math.max(0,order.length-1));layFan();return;}
    d.el.style.transformOrigin='';
    if(G.key===d.fromKey){const ids=d.fan.filter(u=>u!=='__gap');ids.splice(at,0,uid);if(ids.join()===order.join()){layFan();return;}commitOrder(ids,uid);}
    else carryOver(uid,fromG,G,at,true);}
  const flip=(els,fn)=>{const r0=new Map(els.map(x=>[x,x.getBoundingClientRect()]));fn();if(els[0]?.classList.contains('rk-st')){all.classList.add('flipping');lightAll();clearTimeout(flip.t);flip.t=setTimeout(()=>all.classList.remove('flipping'),340);}
    els.forEach(x=>{const a=r0.get(x),b=x.getBoundingClientRect();if(!a)return;const dx=a.left-b.left,dy=a.top-b.top;if(!dx&&!dy)return;x.animate([{translate:`${dx}px ${dy}px`},{translate:'0px 0px'}],{duration:320,easing:'cubic-bezier(.2,.8,.3,1)',composite:'add'});});};
  function reorderChapters(keys,prev){send({action:'reorderChapters',ids:keys});offerUndo('Главы переставлены',()=>send({action:'reorderChapters',ids:prev}));}

  // ——— the chapters' plates: a press opens the chapter; a plate carried up or down puts its chapter there
  tabs.addEventListener('pointerdown',e=>{if(e.button!==0||busy||drag)return;const t=e.target.closest('.rk-tab');if(!t)return;e.preventDefault();
    if(t.classList.contains('rk-tabnew')){view={key:'__newch'};send({action:'addChapter'});return;}
    if(t.classList.contains('rk-taball')){back();return;}
    tabDrag={t,y0:e.clientY,grab:e.clientY-t.getBoundingClientRect().top,moved:false,keys:[...tabs.querySelectorAll('.rk-tab.ch')].map(x=>x.dataset.g)};
    const mv=ev=>{const d=tabDrag;if(!d||d.dead)return;if(!d.moved){if(Math.abs(ev.clientY-d.y0)<6)return;if(!t.classList.contains('ch')){d.dead=true;return;}d.moved=true;t.classList.add('held');tabs.classList.add('sorting');}
      d.ev=ev;if(!d.raf)d.raf=requestAnimationFrame(()=>{d.raf=0;if(tabDrag===d)sortTab(d.ev);});};
    const up=ev=>{removeEventListener('pointermove',mv);removeEventListener('pointerup',up);removeEventListener('pointercancel',up);const d=tabDrag;tabDrag=null;if(!d)return;
      if(!d.moved){if(ev.type==='pointerup'&&!d.dead&&t.dataset.g!==G?.key)openChapter(t.dataset.g);return;}
      // the plate settles into its new place
      const now=parseFloat(String(t.style.translate).split(' ')[1])||0;t.style.translate='';t.classList.remove('held');tabs.classList.remove('sorting');
      t.animate([{translate:`0px ${now}px`},{translate:'0px 0px'}],{duration:280,easing:'cubic-bezier(.2,.8,.3,1)'});
      const keys=[...tabs.querySelectorAll('.rk-tab.ch')].map(x=>x.dataset.g);
      if(keys.join()!==d.keys.join()){reorderChapters(keys,d.keys);const k=t.dataset.g;litTab=k;t.classList.add('lit');setTimeout(()=>{if(litTab===k){litTab='';tabs.querySelector('.rk-tab.lit')?.classList.remove('lit');}},1400);}};
    addEventListener('pointermove',mv);addEventListener('pointerup',up);addEventListener('pointercancel',up);});
  function sortTab(ev){const d=tabDrag,t=d.t,box=tabs.getBoundingClientRect(),y=ev.clientY-d.grab;
    // past the middle of which plate the carried one's middle has gone, it goes there; the others make way
    const others=[...tabs.querySelectorAll('.rk-tab.ch')].filter(x=>x!==t);let ref=null;
    for(const x of others){const r=x.getBoundingClientRect();if(y+t.offsetHeight/2<r.top+r.height/2){ref=x;break;}}
    if(!ref)ref=others.length?others[others.length-1].nextElementSibling:null;
    if(ref!==t&&ref!==t.nextElementSibling)flip(others,()=>tabs.insertBefore(t,ref));
    t.style.translate=`0px ${(y-(box.top+t.offsetTop-tabs.scrollTop)).toFixed(1)}px`;}
  // a press on the middle sheet: it is the writing sheet — the desk comes back round it
  function openSheet(el){activeUid=el.dataset.u;send({action:'select',sectionId:el.dataset.s,pageUid:el.dataset.u});setTimeout(()=>window.OCHERKI_SET_MODE?.('write'),60);}

  // ——— coming and going, with as little change as can be: the writing sheet stays (the middle sheet is laid over it), the clean
  // stack turns into the pile, «Так ляжет» and its keys go off to the right, the clock and the signature stay
  const away=[['.wp-pane',1],['.wp-keys',1],['.ws-ttl',1]];let anims=[];
  function aside(on,ms){anims.forEach(a=>{try{a.cancel();}catch(_){}});anims=[];
    away.forEach(([s,dx])=>document.querySelectorAll(s).forEach(el=>{const to=`${dx*60}vw 0px`;const kf=on?[{translate:'0px 0px'},{translate:to}]:[{translate:to},{translate:'0px 0px'}];
      try{anims.push(el.animate(kf,{duration:ms,easing:on?'cubic-bezier(.45,.05,.55,.95)':'cubic-bezier(.2,.75,.25,1)',fill:on?'forwards':'none',composite:'add'}));}catch(_){}}));}
  function setBarTitle(){const t=bar()?.querySelector('.t b');if(!t)return;t._h='';
    // short, so it stands whole in the bar's middle (the plate over the pile says where we are in the chapter)
    const h=view&&G?`<span class="up">Рукопись</span> · <i>${esc(G.kind==='chapter'?`${G.word} · ${G.name}`:G.word)}</i>`:`<span class="up">Рукопись</span> · <i>все главы</i>`;if(t.innerHTML!==h)t.innerHTML=h;}
  function open(){if(isOpen||busy)return;busy=true;isOpen=true;want=0;scroll=0;measureDesk();
    send({action:'flush'});send({action:'requestState'});
    // the sheet being written is asked of the editor itself (the message about it may not have come yet)
    try{const u=frame()?.contentWindow?.currentPage?.()?.uid;if(u)activeUid=u;}catch(_){}
    // (or the sheet the book was open on, given just before)
    if(preset){activeUid=preset;preset='';}
    const g=gOf(activeUid);view=g?{key:g.key,focus:activeUid}:null;
    H.classList.add('rk-on');aside(true,760);
    if(view){chEl.classList.add('on');all.classList.remove('on');fanHold=true;renderFan(false,true,true);setTimeout(()=>{fanHold=false;if(isOpen&&G)layFan();},620);}else{chEl.classList.remove('on');all.classList.add('on');renderAll();}
    H.classList.add('rk-shown');
    // the desk's own sheet and stack are put away once the middle sheet and the pile lie over them
    setTimeout(()=>{H.classList.add('rk-hide');shell.classList.add('is-manuscript');busy=false;},380);}
  function close(){window.__msFlying=false;if(!isOpen)return;isOpen=false;undoEl.classList.remove('on');
    // the fan goes back under the middle sheet, the desk's sheet and stack come back under the middle sheet and the pile, then
    // these fade, and «Так ляжет» comes back from the right
    live().forEach(el=>{if(!el.classList.contains('mid')){el.style.transform=tr(slot(0));el.style.opacity=0;}});blank.style.opacity=0;
    shell.classList.remove('is-manuscript');H.classList.remove('rk-hide');
    setTimeout(()=>{H.classList.remove('rk-shown');aside(false,700);setTimeout(()=>{H.classList.remove('rk-on');live().forEach(el=>el.remove());view=null;G=null;},520);},260);}
  setInterval(()=>{if(isOpen&&!busy)setBarTitle();},800);
  // the desk's light for the other screens on it (the book): the lamp's beam over the whole desk, its edges as soft as on the writing
  // sheet, and the writing sheet's place
  window.OCHERKI_DESK_LIGHT={beam:()=>{measureDesk();const P=desk.paper;return beamOf({x:0,y:0,w:innerWidth,h:innerHeight},{x:P.left,y:P.top,w:P.width,h:P.height});},paper:()=>{measureDesk();return Object.assign({},desk.paper);}};
  let preset='';
  window.OCHERKI_MANUSCRIPT={open,close,back,preset:u=>{preset=String(u||'');activeUid=preset||activeUid;},centerUid:()=>view&&G?order[center]||'':'',isOpen:()=>isOpen,freeze:()=>{},activeUid:()=>activeUid,
    frontPick:()=>activeUid?{pageUid:activeUid}:null,flyToEditor:()=>false,sheetOf:()=>null};
})();
