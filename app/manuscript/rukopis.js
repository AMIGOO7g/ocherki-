// «Рукопись» (v220) — the whole book seen from above, on the same desk.
// The three sheets of «Писать» (the clean stack, the open sheet, «Так ляжет») go off the screen — the stack to the left, the
// sheet down, the page to the right — and the book's sheets lie in rows in the middle: «Начало книги», each chapter, «Конец
// книги». The bar and the keys stay; the rows go under the bar's lower edge as they are scrolled (no fading). By day the
// window's light lies on the miniatures and the right side is darker; at night the lamp's beam lights the ones under it and
// the others sink into the dusk. The chapter's word («Глава 1») is upright, its name in handwriting under it; at night they glow.
// A press on a sheet opens it for writing; a sheet is dragged to another place (in its chapter or into another one);
// «+ лист» ends each chapter's row. Everything is done by the sheet's own commands (OCHERKI_STRUCTURE_COMMAND), the same the
// old «Рукопись» used: the book's data and the director are not touched here.
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  const H=document.documentElement;
  const frame=()=>document.getElementById('v35SheetFrame');
  const send=cmd=>{try{frame()?.contentWindow?.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',...cmd},'*');}catch(_){}};
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  let st=null,isOpen=false,frozen=false,busy=false,activeUid='',scroll=0,want=0,drag=null;
  addEventListener('message',e=>{const d=e.data||{};
    if(d.type==='OCHERKI_STRUCTURE_STATE'){st=d.payload||st;if(isOpen&&!frozen&&!drag)build();}
    if(d.type==='OCHERKI_ACTIVE_STATE'&&d.payload?.pageUid)activeUid=d.payload.pageUid;});

  const board=document.createElement('div');board.className='rk-board';board.innerHTML='<div class="rk-rows"></div>';
  const shade=document.createElement('div');shade.className='rk-shade';
  const hint=document.createElement('div');hint.className='rk-hint';hint.textContent='нажмите на лист — он откроется для письма · потяните, чтобы переставить';
  document.body.append(board,shade,hint);
  const rowsEl=board.firstChild;

  // ——— the book in groups
  const groups=()=>{const S=(st?.sections||[]).filter(s=>s.included!==false);const first=S.findIndex(s=>s.type==='chapter');let last=-1;S.forEach((s,i)=>{if(s.type==='chapter')last=i;});
    const out=[],before=first<0?S:S.slice(0,first),after=last<0?[]:S.slice(last+1);let n=0;
    const sheets=list=>list.flatMap(s=>(s.pages||[]).filter(p=>p.included!==false).map((p,i)=>({s,p,i})));
    if(before.length)out.push({kind:'begin',word:'Начало книги',name:'',meta:before.map(s=>s.title).slice(0,3).join(' · ').toLowerCase(),sheets:sheets(before)});
    S.forEach((s,i)=>{if(s.type!=='chapter')return;n++;const pages=(s.pages||[]).filter(p=>p.included!==false);const eps=pages.filter(p=>p.isEpisodeStart).length;
      out.push({kind:'chapter',sec:s,word:`Глава ${n}`,name:String(s.title||'').replace(/^Глава\s*\d+\.?\s*/i,''),meta:`${pages.length} ${plural(pages.length,'лист','листа','листов')}${eps?` · ${eps} ${plural(eps,'эпизод','эпизода','эпизодов')}`:''}`,sheets:sheets([s])});});
    if(after.length)out.push({kind:'end',word:'Конец книги',name:'',meta:after.map(s=>s.title).slice(0,3).join(' · ').toLowerCase(),sheets:sheets(after)});
    return out;};
  const plural=(n,a,b,c)=>{const m=n%10,h=n%100;return m===1&&h!==11?a:m>=2&&m<=4&&(h<12||h>14)?b:c;};
  // a miniature of a sheet: its episode's name, lines as long as its words, its first photograph, a ribbon where an episode starts
  const card=(x,k)=>{const {s,p}=x,doc=p.type==='document'||p.bookRole==='document',ph=(p.photos||[]).find(q=>q&&q.src);
    const len=String(p.text||'').replace(/\s+/g,' ').trim().length,lines=Math.max(0,Math.min(13,Math.ceil(len/90)));
    let h=`<div class="rk-ep">${esc(doc?(p.title||'Документ'):(p.episode||s.title||p.title||''))}</div>`;
    if(doc&&ph)h+=`<div class="rk-scan" style="background-image:url('${String(ph.src).replace(/'/g,'%27')}')"></div>`;
    for(let i=0;i<(doc&&ph?Math.min(3,lines):lines);i++)h+=`<i class="rk-l" style="width:${70+((i*37+k*13)%30)}%"></i>`;
    if(ph&&!doc)h+=`<div class="rk-ph" style="background-image:url('${String(ph.src).replace(/'/g,'%27')}')"></div>`;
    if(p.isEpisodeStart)h+='<i class="rk-rib"></i>';
    return `<div class="rk-card${doc?' doc':''}${(p.uid===activeUid||p.active)?' cur':''}" data-s="${esc(s.id)}" data-u="${esc(p.uid)}" style="--r:${(((k*7)%5)-2)*.5}deg">${h}</div>`;};
  function build(){if(!st)return;const G=groups();
    rowsEl.innerHTML=G.map((g,gi)=>`<div class="rk-row" data-g="${gi}" data-s="${esc(g.sec?.id||'')}"><div class="rk-lab"><b>${esc(g.word)}</b>${g.name?`<i>${esc(g.name)}</i>`:''}<span>${esc(g.meta)}</span></div>
      <div class="rk-cards">${g.sheets.map((x,k)=>card(x,k)).join('')}${g.kind==='chapter'?`<button type="button" class="rk-add" data-add="${esc(g.sec.id)}">+ лист</button>`:''}</div></div>`).join('');
    layout(true);}

  // ——— where the board stands: under the bar, the rows go under its lower edge as they are scrolled
  const bar=()=>document.querySelector('.wc.wc-w:not(.bq-car)');
  function layout(now){const b=bar()?.getBoundingClientRect();const top=b&&b.height?b.bottom:120;
    board.style.setProperty('--rk-top',Math.round(top)+'px');
    if(b&&b.width){Object.assign(shade.style,{left:Math.round(b.left+18)+'px',width:Math.round(b.width-36)+'px',top:Math.round(top-2)+'px'});}
    const max=Math.max(0,rowsEl.scrollHeight-(innerHeight-top-70));want=Math.max(0,Math.min(max,want));if(now)scroll=want;
    rowsEl.style.transform=`translateY(${Math.round(top+26-scroll)}px)`;light();}
  addEventListener('resize',()=>{if(isOpen)layout(true);});
  board.addEventListener('wheel',e=>{if(!isOpen)return;e.preventDefault();want+=e.deltaMode===1?e.deltaY*33:e.deltaY;glide();},{passive:false});
  let gl=0;const glide=()=>{if(gl)return;const step=()=>{const d=want-scroll;if(Math.abs(d)<.5){scroll=want;gl=0;layout();return;}scroll+=d*.18;layout();gl=requestAnimationFrame(step);};gl=requestAnimationFrame(step);};

  // ——— the desk's light on the miniatures, each by where it lies (cheap: a brightness per card, eased with the day/night change)
  function light(){const night=shell.classList.contains('is-night'),W=innerWidth,Hh=innerHeight,b=bar()?.getBoundingClientRect(),cx=b&&b.width?b.left+b.width/2:W/2,y0=b?b.bottom:120;
    rowsEl.querySelectorAll('.rk-card').forEach(c=>{const r=c.getBoundingClientRect();if(r.bottom<0||r.top>Hh)return;const x=(r.left+r.width/2-cx)/(W/2),y=(r.top+r.height/2-y0)/(Hh-y0);
      let v;if(night){const spread=.42+.5*Math.max(0,y);v=Math.max(.32,Math.min(1,1.06-.9*Math.max(0,Math.abs(x)-spread*.35)/(1-spread*.35+.0001)-.34*Math.max(0,y)));}
      else v=Math.max(.8,Math.min(1,1-.16*Math.max(0,x)-.05*Math.max(0,y)));
      const f=`brightness(${v.toFixed(3)})`+(night?' sepia(.12)':'');if(c._f!==f){c._f=f;c.style.filter=f;}});}
  new MutationObserver(()=>{if(isOpen)light();}).observe(shell,{attributes:true,attributeFilter:['class']});

  // ——— pressing and dragging a sheet
  rowsEl.addEventListener('click',e=>{const a=e.target.closest('.rk-add');if(a){e.stopPropagation();send({action:'addPageAt',sectionId:a.dataset.add});return;}});
  rowsEl.addEventListener('pointerdown',e=>{const c=e.target.closest('.rk-card');if(!c||e.button!==0)return;e.preventDefault();
    const r=c.getBoundingClientRect();drag={c,x0:e.clientX,y0:e.clientY,r,moved:false,fl:null,over:null};try{c.setPointerCapture(e.pointerId);}catch(_){}
    const mv=ev=>{const dx=ev.clientX-drag.x0,dy=ev.clientY-drag.y0;if(!drag.moved&&Math.hypot(dx,dy)<6)return;
      if(!drag.moved){drag.moved=true;drag.fl=c.cloneNode(true);drag.fl.classList.add('rk-fly');Object.assign(drag.fl.style,{left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px'});document.body.appendChild(drag.fl);c.classList.add('rk-gap');}
      drag.fl.style.transform=`translate(${dx}px,${dy}px) rotate(3deg) scale(1.08)`;
      // where it would go: before the card under the hand, or at the end of the row under the hand
      drag.fl.style.visibility='hidden';const el=document.elementFromPoint(ev.clientX,ev.clientY);drag.fl.style.visibility='';
      rowsEl.querySelectorAll('.rk-before,.rk-end').forEach(x=>x.classList.remove('rk-before','rk-end'));
      const tc=el?.closest?.('.rk-card'),tr=el?.closest?.('.rk-row');drag.over=null;
      if(tc&&tc!==c){tc.classList.add('rk-before');drag.over={s:tc.dataset.s,before:tc.dataset.u};}
      else if(tr&&tr.dataset.s){tr.querySelector('.rk-cards')?.classList.add('rk-end');drag.over={s:tr.dataset.s,before:null};}};
    const up=ev=>{c.removeEventListener('pointermove',mv);c.removeEventListener('pointerup',up);c.removeEventListener('pointercancel',up);
      rowsEl.querySelectorAll('.rk-before,.rk-end').forEach(x=>x.classList.remove('rk-before','rk-end'));
      const d=drag;drag=null;if(!d.moved){if(ev.type==='pointerup')openSheet(c);return;}
      d.fl.remove();c.classList.remove('rk-gap');if(d.over)place(c.dataset.s,c.dataset.u,d.over);};
    c.addEventListener('pointermove',mv);c.addEventListener('pointerup',up);c.addEventListener('pointercancel',up);});
  // a sheet put into its new place: in its own chapter — a new order; in another chapter — carried over to that place
  function place(fromS,uid,over){const S=st?.sections||[],from=S.find(s=>s.id===fromS),to=S.find(s=>s.id===over.s);if(!from||!to)return;
    if(from===to){const ids=(from.pages||[]).map(p=>p.uid).filter(u=>u!==uid);const at=over.before?ids.indexOf(over.before):ids.length;ids.splice(at<0?ids.length:at,0,uid);send({action:'reorderPages',sectionId:from.id,ids});}
    else{const at=over.before?(to.pages||[]).findIndex(p=>p.uid===over.before):-1;send({action:'movePage',sectionId:from.id,toSectionId:to.id,pageUid:uid,...(at>=0?{toIndex:at}:{})});}}
  function openSheet(c){activeUid=c.dataset.u;send({action:'select',sectionId:c.dataset.s,pageUid:c.dataset.u});setTimeout(()=>window.OCHERKI_SET_MODE?.('write'),60);}

  // ——— coming and going: the three sheets of «Писать» leave the screen and come back (added to whatever moves them already)
  const away=[['.ws-left',-1,0],['.bottom-left',-1,0],['#editorPaperWrap .editor-paper',0,1],['.wp-pane',1,0],['.wp-keys',1,0],['.ws-ttl',1,0],['#writingPrompt',0,1]];
  let anims=[];
  function sheetsOut(on,ms){anims.forEach(a=>{try{a.cancel();}catch(_){}});anims=[];
    away.forEach(([sel,dx,dy])=>document.querySelectorAll(sel).forEach(el=>{const to=`${dx*110}vw ${dy*110}vh`;
      const kf=on?[{translate:'0px 0px'},{translate:to}]:[{translate:to},{translate:'0px 0px'}];
      try{const a=el.animate(kf,{duration:ms,easing:on?'cubic-bezier(.55,0,.35,1)':'cubic-bezier(.2,.75,.25,1)',fill:on?'forwards':'none',composite:'add'});anims.push(a);}catch(_){}}));}
  function setBarTitle(){const t=bar()?.querySelector('.t b');if(!t)return;const S=st?.sections||[];const n=S.reduce((a,s)=>a+(s.included!==false?(s.pages||[]).length:0),0);
    const name=document.querySelector('.ws-ttl b')?.textContent||'Очерки жизни';t._h='';t.innerHTML=`<span class="up">Рукопись</span> · <i>${esc(name)}</i> · <span class="up">${n} ${plural(n,'лист','листа','листов')}</span>`;}
  function open(opts){if(isOpen||busy)return;busy=true;isOpen=true;frozen=false;want=0;scroll=0;
    send({action:'flush'});send({action:'requestState'});
    H.classList.add('rk-on');sheetsOut(true,760);
    setTimeout(()=>{shell.classList.add('is-manuscript');build();setBarTitle();
      // the row of the open sheet comes into view
      const cur=rowsEl.querySelector('.rk-card.cur');if(cur){const r=cur.closest('.rk-row');want=Math.max(0,r.offsetTop-40);layout(true);}
      H.classList.add('rk-shown');busy=false;},700);}
  function close(){window.__msFlying=false;if(!isOpen)return;isOpen=false;H.classList.remove('rk-shown');
    // the desk is laid out again first (still off the screen), then its sheets come back to their places
    setTimeout(()=>{shell.classList.remove('is-manuscript');const t0=performance.now();
      const back=()=>{if(!shell.classList.contains('oc-ws')&&performance.now()-t0<1500)return requestAnimationFrame(back);sheetsOut(false,820);H.classList.remove('rk-on');};requestAnimationFrame(back);},240);}
  // the bar's title is kept while «Рукопись» is open (the sheet's own title would come back on the next tick otherwise)
  setInterval(()=>{if(isOpen&&H.classList.contains('rk-shown'))setBarTitle();},800);
  window.OCHERKI_MANUSCRIPT={open,close,isOpen:()=>isOpen,freeze:()=>{frozen=true;},activeUid:()=>activeUid,
    frontPick:()=>activeUid?{pageUid:activeUid}:null,flyToEditor:()=>false,sheetOf:()=>null};
})();
