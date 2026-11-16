// «Книга» — its screen scripts in one place (v172), each in its own scope as before. The assembly engine is 044-v103-book-assembly-controller.js.

// ——— right-rail-script
(()=>{
  const panel=document.getElementById('bookDesignShell');if(!panel)return;
  const sections=[...panel.querySelectorAll(':scope > .bd-section')];
  const find=selector=>sections.find(section=>section.querySelector(selector));
  const icons={
    book:'<path d="M3 5.5c3-1.4 6-1.4 9 .6 3-2 6-2 9-.6V19c-3-1.4-6-1.4-9 .6-3-2-6-2-9-.6Z"/><path d="M12 6.1v13.5"/>',
    tips:'<path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.7.6 1.1 1.3 1.1 2.2h5c0-.9.4-1.6 1.1-2.2A6 6 0 0 0 12 3Z"/>',
    design:'<path d="M4 20c4 0 6-2 6-5"/><path d="M10 15 19 6a2 2 0 0 0-3-3l-9 9"/><path d="M7 12l3 3"/>',
    format:'<rect x="4" y="6" width="8" height="12" rx="1"/><rect x="14" y="8" width="7" height="7" rx="1"/>',
    photo:'<rect x="3" y="6" width="18" height="13" rx="2"/><circle cx="12" cy="12.5" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/>'
  };
  // The same gentle pendulum as the hanging keys at the top (≈1° at most).
  function swingKey(el){
    let angle=0,velocity=0,raf=0,hovering=false;
    const step=()=>{velocity+=-.010*angle;velocity*=.991;angle+=velocity;if(angle>1.1){angle=1.1;velocity*=-.12;}if(angle<-1.1){angle=-1.1;velocity*=-.12;}
      el.style.transform=`rotate(${angle.toFixed(2)}deg)`;
      if(!hovering&&Math.abs(angle)<.01&&Math.abs(velocity)<.002){angle=0;velocity=0;el.style.transform='';raf=0;return;}
      raf=requestAnimationFrame(step);};
    const kick=dir=>{velocity=Math.max(-.2,Math.min(.2,velocity+.11*dir));if(!raf)raf=requestAnimationFrame(step);};
    el.addEventListener('pointerenter',e=>{hovering=true;kick(e.movementX<0?-1:1);});
    el.addEventListener('pointerleave',()=>{hovering=false;if(!raf)raf=requestAnimationFrame(step);});
  }
  const items=[
    {id:'book',tip:'Посмотреть книгу',run:()=>document.getElementById('buildBookBtn')?.click()},
    {id:'tips',tip:'Что улучшить в книге',section:find('#bdSpreadRows')},
    {id:'design',tip:'Дизайн книги',section:find('#bdDesignGrid')},
    {id:'format',tip:'Формат книги',section:find('#bdFormatGrid')},
    {id:'photo',tip:'Фото в книге',section:find('#bdPhotoMode')}
  ];
  const rail=document.createElement('div');rail.className='bd-rail';rail.style.cssText='display:flex;flex-direction:column;gap:18px;align-items:center';
  for(const item of items){
    const key=document.createElement('button');key.type='button';key.className='key bd-rail-key';key.dataset.rail=item.id;key.setAttribute('aria-label',item.tip);
    key.innerHTML=`<span class="cap"><svg viewBox="0 0 24 24">${icons[item.id]}</svg></span>`;
    // The label sits beside the key, outside it, so it never sways with it.
    const wrap=document.createElement('div');wrap.className='bd-rail-item';wrap.innerHTML=`<span class="bd-rail-tip">${item.tip}</span>`;wrap.prepend(key);swingKey(key);
    key.addEventListener('click',event=>{
      event.stopPropagation();
      if(item.run){close();item.run();return;}
      const open=item.section?.classList.contains('is-rail-open');
      close();
      if(!open&&item.section){item.section.classList.add('is-rail-open');key.classList.add('is-active');document.querySelector('.shell')?.classList.add('oc-rail-open');}
    });
    item.key=key;rail.appendChild(wrap);
  }
  const close=()=>{sections.forEach(section=>section.classList.remove('is-rail-open'));document.querySelector('.shell')?.classList.remove('oc-rail-open');rail.querySelectorAll('.bd-rail-key').forEach(key=>key.classList.remove('is-active'));};
  panel.prepend(rail);panel.classList.add('is-rail');
  // Design, format and photo choices open without a panel: their cards slide
  // in from the right one after another.
  items.slice(2).forEach(item=>item.section?.classList.add('is-carousel'));
  document.addEventListener('click',event=>{if(!panel.contains(event.target))close();});
  document.addEventListener('keydown',event=>{if(event.key==='Escape')close();});
  // The tips key shows how many steps are left before a good book.
  const tipsKey=items[1].key,rows=document.getElementById('bdSpreadRows');
  const updateBadge=()=>{
    if(window.__ocherkiReadyLeft&&window.__ocherkiReadyLeft()>=0)return;
    const steps=rows?.querySelectorAll('.bd-book-tips li').length||0;
    let badge=tipsKey.querySelector('.bd-rail-badge');
    if(!steps){badge?.remove();return;}
    if(!badge){badge=document.createElement('span');badge.className='bd-rail-badge';tipsKey.appendChild(badge);}
    badge.textContent=String(steps);
  };
  // The advice comes one at a time, like the design cards: it slides in,
  // and the small arrows bring the next one («2 из 5»).
  let tipAt=0,tipDir=1;
  const tipsCarousel=()=>{
    const list=rows?.querySelector('.bd-book-tips');if(!list)return;
    const lis=[...list.children].filter(li=>li.tagName==='LI');
    let nav=list.parentElement.querySelector(':scope > .bd-tips-nav');
    if(lis.length<2){nav?.remove();lis.forEach(li=>li.classList.add('is-current'));return;}
    tipAt=Math.max(0,Math.min(tipAt,lis.length-1));
    lis.forEach((li,k)=>{li.classList.toggle('is-current',k===tipAt);li.classList.toggle('from-left',tipDir<0);});
    if(!nav){nav=document.createElement('div');nav.className='bd-tips-nav';nav.innerHTML='<button type="button" data-tip-step="-1" aria-label="Предыдущий совет">‹</button><span></span><button type="button" data-tip-step="1" aria-label="Следующий совет">›</button>';list.after(nav);}
    const label=`${tipAt+1} из ${lis.length}`;if(nav.querySelector('span').textContent!==label)nav.querySelector('span').textContent=label;
  };
  rows?.addEventListener('click',event=>{const step=event.target.closest('[data-tip-step]');if(!step)return;event.stopPropagation();
    const n=rows.querySelectorAll('.bd-book-tips > li').length;if(!n)return;tipDir=+step.dataset.tipStep;tipAt=(tipAt+tipDir+n)%n;tipsCarousel();});
  tipsKey.addEventListener('click',()=>{tipAt=0;tipDir=1;tipsCarousel();});
  if(rows)new MutationObserver(()=>{updateBadge();tipsCarousel();}).observe(rows,{childList:true,subtree:true});
  updateBadge();tipsCarousel();
})();


// ——— ready-v102-js
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  let state=null;addEventListener('message',e=>{const d=e.data||{};if(d.type==='OCHERKI_STRUCTURE_STATE'){state=d.payload;paint();}});
  const words=t=>String(t||'').replace(/<[^>]+>/g,' ').trim().split(/\s+/).filter(w=>/\p{L}/u.test(w)).length;
  const own=p=>p&&!p.sample;
  const store=(k,v)=>{try{if(v===undefined)return localStorage.getItem('ocherki_ready_'+k);localStorage.setItem('ocherki_ready_'+k,v);}catch(_){return null;}};
  function steps(){const S=state?.sections||[],out=[];
    const cover=S.find(s=>s.type==='cover'),cp=(cover?.pages||[])[0];
    out.push({t:'обложка: название и автор',ok:!!(cp&&own(cp)&&words(cp.text)>=2),go:cover&&{sectionId:cover.id},how:'Впишите на обложке название книги и автора — пункт отметится сам'});
    const ch=S.filter(s=>s.type==='chapter'&&s.included!==false&&!s.sample);
    const wc=ch.map(s=>({s,n:(s.pages||[]).filter(own).reduce((a,p)=>a+words(p.text),0)}));
    const full=wc.filter(x=>x.n>=300).length;
    {const short=wc.find(x=>x.n<300);out.push({t:`три главы по 300 слов`,e:full<3?`готово ${full} из 3`:'',ok:full>=3,go:short&&{sectionId:short.s.id},how:'Пишите главы: когда в трёх будет по 300 слов, пункт отметится сам'});}
    const photos=S.flatMap(s=>(s.pages||[]).flatMap(p=>(p.photos||[]).map(ph=>({ph,s,p}))));
    out.push({t:'портрет героя',e:'в карточке фото — «портрет героя»',ok:photos.some(x=>x.ph.portraitHero),go:photos[0]&&{sectionId:photos[0].s.id,pageUid:photos[0].p.uid||photos[0].p.id},how:'Откройте карточку фото героя и отметьте «портрет героя»'});
    const ded=S.find(s=>s.type==='dedication');out.push({t:'посвящение',ok:!!(ded&&ded.included!==false&&(ded.pages||[]).some(p=>own(p)&&words(p.text)>=2)),go:ded&&{sectionId:ded.id},how:'Напишите пару строк посвящения — кому эта книга'});
    const unc=photos.filter(x=>!String(x.ph.caption||x.ph.people||'').trim());
    out.push({t:unc.length?`подписать ${unc.length} фото`:'все фото подписаны',e:unc.length?'кто на них и какой год':'',ok:!unc.length,go:unc[0]&&{sectionId:unc[0].s.id,pageUid:unc[0].p.uid||unc[0].p.id},how:'Откройте фото на листе и напишите в карточке, кто на нём и какой год — пункт отметится сам'});
    wc.filter(x=>x.n>0&&x.n<300).slice(0,2).forEach(x=>out.push({t:`глава «${String(x.s.title||'').replace(/^Глава\s+\d+\.\s*/,'')}» — расскажите ещё`,e:`пока ${x.n} слов`,ok:false,go:{sectionId:x.s.id},how:'Допишите главу — хотя бы до 300 слов'}));
    out.push({t:'вычитать текст',e:'нажмите, когда перечитали всю книгу',ok:store('proof')==='1',proof:1});
    // v107: the book's own advice (the lamp used to show it apart) joins the same list.
    document.querySelectorAll('#bdSpreadRows .bd-book-tips li').forEach(li=>{const t=String(li.textContent||'').trim();if(t)out.push({t,ok:false,tip:1});});
    return out;}
  const line=document.createElement('div');line.className='rd-line';line.innerHTML='<b></b><span class="rd-tip">что осталось до книги</span>';
  const veil=document.createElement('div');veil.className='rd-veil';const box=document.createElement('div');box.className='rd-box';
  document.querySelector('.mode-switch')?document.body.append(line,veil,box):document.body.append(line,veil,box);
  // v108: the panel stands still in the middle of the screen (it no longer follows the swinging lamp).
  const place=()=>{};
  const lamp=()=>document.querySelector('.bd-rail-key[data-rail="tips"]');
  let lastLeft=-1;
  function dressLamp(st){const k=lamp();if(!k)return;const done=st.filter(x=>x.ok).length,left=st.length-done;
    let ring=k.querySelector('.rd-ring');if(!ring){ring=document.createElementNS('http://www.w3.org/2000/svg','svg');ring.setAttribute('class','rd-ring');ring.setAttribute('viewBox','0 0 60 60');ring.innerHTML='<circle class="bg" cx="30" cy="30" r="27"/><circle class="fg" cx="30" cy="30" r="27" pathLength="100"/>';k.appendChild(ring);
      k.addEventListener('click',e=>{e.stopImmediatePropagation();e.preventDefault();box.classList.contains('on')?close():open();},true);}
    ring.querySelector('.fg').style.strokeDasharray=`${Math.round(100*done/Math.max(1,st.length))} 100`;
    k.classList.toggle('rd-glow',left>0);k.setAttribute('aria-label',left?`До книги — ${left}`:'Книга готова');
    let badge=k.querySelector('.bd-rail-badge');if(!left){badge?.remove();}else{if(!badge){badge=document.createElement('span');badge.className='bd-rail-badge';k.appendChild(badge);}badge.textContent=String(left);}
    lastLeft=left;}
  window.__ocherkiReadyLeft=()=>lastLeft;
  function paint(){const st=steps(),done=st.filter(x=>x.ok).length;line.querySelector('b').style.width=Math.round(100*done/st.length)+'%';dressLamp(st);
    if(!box.classList.contains('on'))return;const left=st.length-done,ru=n=>n===1?'шаг':n<5?'шага':'шагов';
    const hint=x=>x.e&&!x.ok?x.e:(x.how&&!x.ok?x.how:'');
    const li=(x,i)=>`<li class="${x.ok?'ok':''} ${x.tip?'is-tip':''}" ${x.go||x.proof||x.tip?`data-i="${i}" data-go="1"`:''}><i class="mk"></i><div><span>${x.t}</span>${hint(x)?`<em>${hint(x)}</em>`:''}</div></li>`;
    const todo=st.map((x,i)=>[x,i]).filter(([x])=>!x.ok),have=st.map((x,i)=>[x,i]).filter(([x])=>x.ok);
    const frac=Math.round(100*done/Math.max(1,st.length));
    // v127: no panel — the room darkens and blurs, and the steps lie on it as one list with dots.
    const next=st.findIndex(x=>!x.ok);
    const li2=(x,i)=>`<li class="${x.ok?'ok':''} ${i===next?'is-next':''} ${x.tip?'is-tip':''}" ${x.go||x.proof||x.tip?`data-i="${i}" data-go="1"`:''}><i class="dot"></i><div><span>${x.t}</span>${hint(x)?`<em>${hint(x)}</em>`:''}</div></li>`;
    const html=`<span class="rd3-x" data-close="1" aria-label="Закрыть">×</span>
      <div class="rd3-k">до книги</div><h4>${left?`Осталось ${left} ${ru(left)}`:'Книга готова'}</h4><div class="rd3-s">${done} из ${st.length} уже готово</div>
      <ul class="rd3-list">${st.map((x,i)=>li2(x,i)).join('')}</ul>
      <div class="rd3-foot"><span class="oc-btn go ${left?'':'ready is-main'}">Заказать печать</span></div>`;
    // v142: rebuilt only when something changed — the list no longer re-cascades every few seconds
    if(box._html!==html){box._html=html;box.innerHTML=html;}
    box._st=st;}
  const open=()=>{box._html='';box.classList.add('on');veil.classList.add('on');paint();place();};
  setInterval(()=>{if(!document.hidden)paint();},4000);
  const close=()=>{box.classList.remove('on');veil.classList.remove('on');};
  line.addEventListener('click',open);veil.addEventListener('click',close);addEventListener('keydown',e=>{if(e.key==='Escape'&&box.classList.contains('on'))close();});
  box.addEventListener('click',e=>{if(e.target.closest('[data-close]')){close();return;}const li=e.target.closest('li[data-go]');if(li){const x=box._st?.[+li.dataset.i];if(!x)return;
      if(x.proof){const on=store('proof')!=='1';store('proof',on?'1':'0');paint();window.OCHERKI_SAY?.(on?'Отмечено: текст вычитан. Нажмите ещё раз, чтобы снять отметку':'Отметка снята');return;}
      if(x.tip){close();try{window.OCHERKI_SAY?.(x.t);}catch(_){}return;}
      close();if(window.OCHERKI_MANUSCRIPT?.isOpen?.())window.OCHERKI_SET_MODE?.('write');
      try{document.getElementById('v35SheetFrame')?.contentWindow?.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',action:'select',...x.go},'*');}catch(_){}
      if(x.how)setTimeout(()=>window.OCHERKI_SAY?.(x.how),500);return;}
    if(e.target.closest('.go.ready'))try{window.OCHERKI_SHOW_TOAST?.('Заказ печати откроется после подключения сервера');}catch(_){}});
  // The line follows the title smoothly frame by frame (no late jumps when the keys move).

  // Once, the first time it appears: it glows and says what it is.
  try{if(!localStorage.getItem('ocherki_ready_hinted')){setTimeout(()=>{line.classList.add('hint');localStorage.setItem('ocherki_ready_hinted','1');setTimeout(()=>line.classList.remove('hint'),6000);},4000);}}catch(_){}
  window.OCHERKI_READY={open,close};
})();


// ——— preview-arc-script
(()=>{
  const modal=document.getElementById('bookPreviewModal');if(!modal)return;
  const api=()=>window.__ocherkiArcApi;
  const arc=document.createElement('div');arc.className='preview-arc';arc.id='previewArc';modal.appendChild(arc);
  const STEP=15,SIZE=[190,156,128,106,90,78,68,60],FADE=[1,.9,.8,.7,.55,.38,.2,.08],WINDOW=SIZE.length;
  let turn=0,spreadsRef=null,items=new Map(),prevTurn=null,prevSigs=null,changedSpreads=new Set(),changedTimer=0;
  // Size and place the book so the composition keys above it and the arc
  // below it fit on any screen.
  function geometry(){
    const a=api();if(!a)return null;
    const W=innerWidth,H=innerHeight,[pw,ph]=a.pageSize(),ratio=(pw*2)/ph;
    // The book and the arc under it sit in the middle of the screen; the
    // composition keys above the book always have room.
    const maxH=Math.max(220,H-210-24-30-190);
    const bw=Math.round(Math.min(W*.56,maxH*ratio,1500)),bh=bw/ratio;
    const T=Math.round(Math.max(210,(H-(bh+30+190))/2+30));
    modal.style.setProperty('--arc-book-w',bw+'px');modal.style.setProperty('--arc-stage-top',T+'px');
    return {W,H,ratio,pw,ph};
  }
  function render(i){
    const a=api(),sp=a.spreads()[i];if(!sp)return null;
    const el=document.createElement('div');el.className='pa-item';el.dataset.i=i;
    const [pw,ph]=a.pageSize();el.style.setProperty('--pa-page',`${pw}/${ph}`);
    const blank='<div class="pa-blank"></div>';
    const left=sp.single==='right'?blank:(sp.left?a.host(sp.left,'left'):blank),right=sp.single==='left'?blank:(sp.right?a.host(sp.right,'right'):blank);
    const info=a.label(i);
    if(info.chapter)el.dataset.ch=info.chapter;
    el.innerHTML=`<div class="pa-spread${sp.single?' is-cover':''}">${left}${right}</div><div class="pa-tip">${info.name?a.esc(info.name):''}<small>${a.esc(info.pages)}</small></div>`;
    el.addEventListener('click',e=>{e.stopPropagation();a.go(i);});
    return el;
  }
  // v107: every spread of the arc is drawn once, quietly, right after the book
  // opens; turning forward then only moves ready pictures (no stutter).
  const arcCache=new Map();let warmToken=0;
  function warmArc(list){const token=++warmToken;let i=0;
    const idle=window.requestIdleCallback||(f=>setTimeout(()=>f({timeRemaining:()=>8}),30));
    const step=deadline=>{if(token!==warmToken||spreadsRef!==list)return;
      while(i<list.length&&(deadline.timeRemaining?.()??8)>4){if(!arcCache.has(i)){const el=render(i);if(el){arcCache.set(i,el);el.querySelectorAll('img').forEach(im=>{try{im.decode?.().catch(()=>{});}catch(_){}});}}i++;}
      if(i<list.length)idle(step,{timeout:600});};
    idle(step,{timeout:600});}
  function layout(){
    const a=api();if(!a)return;const list=a.spreads();
    const on=modal.classList.contains('open')&&a.built()&&list.length>0;
    modal.classList.toggle('has-arc',on);if(!on){arc.replaceChildren();items.clear();prevTurn=null;return;}
    if(spreadsRef!==list){
      // After a rebuild the spreads that came out different glow for a few seconds in the arc.
      const sig=sp=>[sp?.left,sp?.right].map(p=>p?[p.layout,p.photoIndex??'',p.sourceRange?.start??'',String(p.text||'').length,p.p01Variant||''].join(':'):'0').join('|');
      const now=list.map(sig),diff=new Set();if(prevSigs&&modal.classList.contains('open'))now.forEach((x,i)=>{if(prevSigs[i]!==x)diff.add(i);});prevSigs=now;
      if(diff.size&&diff.size<=list.length*.6){changedSpreads=diff;clearTimeout(changedTimer);}
      if(diff.size)changedTimer=setTimeout(()=>{changedSpreads.clear();arc.querySelectorAll('.pa-item.is-changed').forEach(x=>x.classList.remove('is-changed'));},3500);
      spreadsRef=list;arc.replaceChildren();items.clear();prevTurn=null;arcCache.clear();warmArc(list);}
    const g=geometry();
    const book=document.getElementById('bookPreviewSpread')?.getBoundingClientRect();if(!book||!book.width)return;
    const cx=book.left+book.width/2,cy=book.top+book.height/2;
    modal.style.setProperty('--arc-info-top',Math.round(book.bottom+14)+'px');
    const rx=Math.min(g.W/2-150,Math.max(book.width/2+170,g.W*.40)),ry=book.height/2+Math.min(g.H*.2,175);
    // Smaller screens get smaller spreads; the step keeps neighbours apart.
    const k=Math.max(.7,Math.min(1.15,g.H/1050));
    const step=Math.max(STEP,Math.asin(Math.min(.6,((SIZE[0]+SIZE[1])/2+30)*k/rx))*180/Math.PI);
    const active=a.active();
    // Every spread has its place on the arc for any turn; spreads beyond the
    // window continue the arc, smallest and invisible. So on a jump of
    // several spreads the newcomers glide in from the end of the arc and
    // the leaving ones glide out — the whole arc moves together.
    // Beyond the window a spread waits at the last place of the arc (unseen),
    // so nothing ever travels past the ends of the arc.
    const place=(el,i,t)=>{const n=Math.abs(i-t),m=Math.min(n,WINDOW-1),th=(Math.sign(i-t)*m*step)*Math.PI/180,w=Math.round(SIZE[m]*k),h=w/g.ratio;
      el.style.width=w+'px';el.style.transform=`translate(${Math.round(cx+rx*Math.sin(th)-w/2)}px,${Math.round(cy+ry*Math.cos(th)-h/2)}px)`;
      el.style.opacity=n<WINDOW?FADE[n]:0;el.style.zIndex=String(100-m);el.style.pointerEvents=n<WINDOW-1?'auto':'none';};
    const from=prevTurn==null?turn:prevTurn;prevTurn=turn;
    for(const [i,el] of items){if(Math.abs(i-turn)>=WINDOW){items.delete(i);place(el,i,turn);el.style.pointerEvents='none';setTimeout(()=>{if(!items.has(i)||items.get(i)!==el)el.remove();},750);}}
    let added=false;const fresh=[];
    for(let i=Math.max(0,turn-WINDOW+1);i<=Math.min(list.length-1,turn+WINDOW-1);i++){
      let el=items.get(i);if(!el){el=arcCache.get(i)||render(i);if(!el)continue;arcCache.set(i,el);el.style.transition='none';place(el,i,from);if(from===turn)el.style.opacity=0;arc.appendChild(el);items.set(i,el);added=true;fresh.push(el);}
      el.classList.toggle('is-on',i===active);el.classList.toggle('is-changed',changedSpreads.has(i));
    }
    if(fresh.length)void arc.offsetWidth;
    fresh.forEach(el=>el.style.transition='');
    for(const [i,el] of items)place(el,i,turn);
    if(added)a.scale();
  }
  // Wheel or drag turns the arc; pressing a spread opens it in the book.
  // One notch of the wheel = one spread; the book turns to it a moment
  // after the wheel rests.
  let acc=0,lastStep=0,accQuiet=0,pendingFlip=false;
  // The book follows the arc once the wheel has rested a moment.
  setInterval(()=>{if(!pendingFlip||Date.now()-lastStep<420)return;const a=api();if(!a||a.paging())return;pendingFlip=false;if(turn!==a.active())a.go(turn);},140);
  const arcWheel=window.__ocherkiWheel();
  addEventListener('wheel',e=>{if(!modal.classList.contains('has-arc')||!modal.classList.contains('open')||modal.classList.contains('is-closing')||modal.classList.contains('is-to-ms')||document.querySelector('.shell')?.classList.contains('is-manuscript'))return;if(e.target.closest?.('#bookPreviewSpread,.composition-menu,.book-design-shell'))return;
    const dir=arcWheel(e);if(!dir)return;const n=api().spreads().length;const t=Math.max(0,Math.min(n-1,turn+dir));
    lastStep=Date.now();if(t===turn)return;turn=t;layout();pendingFlip=true;},{passive:true});
  let sx=null,st=0,moved=false;
  arc.addEventListener('pointerdown',e=>{sx=e.clientX;st=turn;moved=false;});
  addEventListener('pointermove',e=>{if(sx==null||!(e.buttons&1))return;const t=Math.round(st-(e.clientX-sx)/90);const n=api()?.spreads().length||0;if(t!==turn&&n){moved=true;turn=Math.max(0,Math.min(n-1,t));layout();}});
  addEventListener('pointerup',()=>{sx=null;});
  arc.addEventListener('click',e=>{if(moved){e.stopPropagation();e.preventDefault();moved=false;}},true);
  window.__ocherkiArcRefresh=i=>{const el=items.get(i);if(el){el.remove();items.delete(i);}requestAnimationFrame(layout);};
  window.__ocherkiArcSync=(follow=true)=>{const a=api();if(!a)return;if(follow&&Date.now()-lastStep>900)turn=a.active();requestAnimationFrame(layout);};
  addEventListener('resize',()=>requestAnimationFrame(layout));
  new MutationObserver(()=>window.__ocherkiArcSync(true)).observe(modal,{attributes:true,attributeFilter:['class']});
})();


// ——— book-screen-panel-close
// In «Книга» a chosen design, format or photo mode closes its panel, so the
// blur lifts and the book shows the choice.
document.addEventListener('click',e=>{
  if(!document.querySelector('.shell.is-book-preview'))return;
  const card=e.target.closest?.('.bd-section.is-carousel :is(.bd-design-card,.bd-format-card,.bd-photo-mode-option)');
  if(!card||card.matches('[disabled],.is-disabled,.is-soon'))return;
  setTimeout(()=>document.querySelector('.bd-rail-key.is-active')?.click(),420);
},true);


// ——— book-v124-js
(()=>{const modal=document.getElementById('bookPreviewModal');if(!modal)return;
  const place=()=>{const on=modal.classList.contains('open');modal.classList.toggle('oc-bk',on);if(!on){modal._ip=0;modal.classList.remove('bk-ip');return;}
    const st=modal.querySelector('.book-preview-stage'),sp=document.getElementById('bookPreviewSpread'),info=document.getElementById('bookPreviewInfo'),hg=document.getElementById('bookPreviewLayoutHanger');
    if(!st||!sp||!hg)return;const S=st.getBoundingClientRect(),P=sp.getBoundingClientRect();if(!P.width)return;
    const k=S.width?st.offsetWidth/S.width:1;
    modal.style.setProperty('--bk-ky',Math.round((P.bottom-S.top)*k+22)+'px');
    const y=Math.round(P.top-36);if(info&&modal.classList.contains('bk-ip'))modal.style.setProperty('--bk-iy',y+'px');
    // «Разворот N из M» shows only once the book has stopped moving (it opens and grows first): the line is set above
    // the finished spread and only then fades in — it never appears on the book itself and never travels up to its place
    if(!modal._ip){modal._ip=1;let last=null,still=0,n=0;const watch=()=>{if(!modal.classList.contains('open')){modal._ip=0;return;}
      const R=sp.getBoundingClientRect(),yy=Math.round(R.top-36);modal.style.setProperty('--bk-iy',yy+'px');
      // the line itself must already stand there (while the window still opens, everything in it is carried along)
      const iy=info?Math.round(info.getBoundingClientRect().top):yy,key=yy+':'+Math.round(R.width)+':'+iy;still=(key===last&&Math.abs(iy-yy)<3)?still+1:0;last=key;n++;
      if(R.width&&(still>=10||n>420)){modal.classList.add('bk-ip');return;}requestAnimationFrame(watch);};requestAnimationFrame(watch);}};
  new MutationObserver(()=>requestAnimationFrame(place)).observe(modal,{attributes:true,attributeFilter:['class']});
  addEventListener('resize',()=>requestAnimationFrame(place));setInterval(()=>{if(modal.classList.contains('open'))place();},700);
})();

// ——— v172: «Книга» в едином стиле — the editor's carriage (composition ‹ ⟳ ›, the place in the book, design, format, photo, PDF),
// the spread dressed as an open book (gutter, page edges, shadow, corners that turn the page), the section's name under it.
(()=>{const shell=document.querySelector('.shell'),modal=document.getElementById('bookPreviewModal');if(!shell||!modal)return;
  const S='<svg viewBox="0 0 24 24">',E='</svg>';
  const IC={prev:'<path d="M15 5l-7 7 7 7"/>',all:'<path d="M19 8a8 8 0 1 0 1 7"/><path d="M19 3v5h-5"/>',next:'<path d="M9 5l7 7-7 7"/>',
    design:'<path d="M14 4l6 6-9 9H5v-6z"/><path d="M12 6l6 6"/>',format:'<rect x="4" y="5" width="9" height="14" rx="1"/><rect x="15" y="9" width="5" height="10" rx="1"/>',
    photo:'<rect x="3" y="6" width="18" height="13" rx="1.5"/><circle cx="12" cy="12.5" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/>',pdf:'<path d="M6 3h9l3 3v15H6z"/><path d="M9 13h6M9 17h4M12 8v6M9.5 11.5L12 14l2.5-2.5"/>'};
  const bt=(c,tip)=>`<button data-c="${c}" aria-label="${tip}" data-tip="${tip}">${S+IC[c]+E}</button>`;
  const car=document.createElement('div');car.className='wc bq-car';
  car.innerHTML='<i class="nf"></i>'+bt('prev','Предыдущая композиция')+bt('all','Все композиции')+bt('next','Следующая композиция')
    +'<span class="grow"></span><span class="t"><b></b></span>'+bt('design','Дизайн книги')+bt('format','Формат книги')+bt('photo','Фото в книге')+bt('pdf','Сохранить в PDF');
  document.body.appendChild(car);
  const book=document.createElement('div');book.className='bq-book';book.innerHTML='<i class="sh"></i><i class="el"></i><i class="er"></i><i class="lit"></i><i class="gut"></i><i class="cl" title="Назад"></i><i class="cr" title="Дальше"></i>';document.body.appendChild(book);
  const name=document.createElement('div');name.className='bq-name';name.innerHTML='<b></b>';document.body.appendChild(name);
  const $=id=>document.getElementById(id);
  const isBook=()=>modal.classList.contains('open')&&document.body.classList.contains('oct-book');
  const COMP={prev:'bookPreviewLayoutPrev',all:'bookPreviewLayout',next:'bookPreviewLayoutNext'};
  const api=()=>window.__ocherkiArcApi;
  // the section of the spread in front: a page of the beginning or the end says it by its kind; a chapter's page by the chapter it opens in
  const KIND={cover:'Обложка',endpaper:'Форзац','half-title':'Титул',title:'Титул',dedication:'Посвящение',epigraph:'Посвящение',contents:'Содержание','contents-right':'Содержание',
    intro:'Вступление','author-note':'Вступление',epilogue:'Послесловие',thanks:'Послесловие',sources:'Источники и архив',colophon:'Источники и архив','notes-page':'Для тех, кто продолжит','back-cover':'Задняя обложка'};
  const section=()=>{const a=api();if(!a?.spreads)return'';const i=a.active(),sp=a.spreads()[i];if(!sp)return'';
    const k=[sp.left,sp.right].filter(Boolean).map(p=>KIND[p.kind]).find(Boolean);if(k)return k;
    for(let j=i;j>=0;j--){const l=a.label?.(j);if(l&&l.chapter)return l.name||l.chapter;}return'';};
  let lastName=null;
  const frame=()=>{requestAnimationFrame(frame);const on=isBook();car.classList.toggle('on',on);
    if(!on){book.classList.remove('on');name.classList.remove('on');return;}
    car.classList.toggle('night',shell.classList.contains('is-night'));
    const info=$('bookPreviewInfo');car.querySelector('.t b').textContent=(info?.textContent||'').trim();
    Object.entries(COMP).forEach(([c,id])=>{const b=$(id),btn=car.querySelector(`[data-c="${c}"]`);const off=!b||b.disabled;btn.classList.toggle('off',off);btn.dataset.tip=off&&b?.title?b.title:btn.getAttribute('aria-label');});
    // the dress follows the spread (it opens and grows first)
    const L=modal.querySelector('.book-preview-half.left'),R=modal.querySelector('.book-preview-half.right');
    const rs=[L,R].map(e=>e&&e.getBoundingClientRect()).filter(r=>r&&r.width>20&&r.height>20);
    // while a panel (design, format, photo) is open, the book steps back under its blur: no dress, no name
    if(!rs.length||document.querySelector('.bd-rail-key.is-active')){book.classList.remove('on');name.classList.remove('on');return;}
    const x0=Math.min(...rs.map(r=>r.left)),x1=Math.max(...rs.map(r=>r.right)),y0=Math.min(...rs.map(r=>r.top)),y1=Math.max(...rs.map(r=>r.bottom));
    Object.assign(book.style,{left:x0+'px',top:y0+'px',width:(x1-x0)+'px',height:(y1-y0)+'px'});book.classList.add('on');book.classList.toggle('single',rs.length<2);
    book.querySelector('.cl').classList.toggle('off',!!$('bookPreviewPrev')?.disabled);book.querySelector('.cr').classList.toggle('off',!!$('bookPreviewNext')?.disabled);
    name.style.top=(y1+14)+'px';const n=section();
    if(n!==lastName){const first=lastName===null;lastName=n;if(first){name.querySelector('b').textContent=n;}else{name.classList.add('swap');setTimeout(()=>{name.querySelector('b').textContent=n;name.classList.remove('swap');},350);}}
    name.classList.toggle('on',!!n);};
  requestAnimationFrame(frame);
  car.addEventListener('click',e=>{const b=e.target.closest('button[data-c]');if(!b||!isBook())return;e.stopPropagation();const c=b.dataset.c;
    if(COMP[c]){if(!b.classList.contains('off'))$(COMP[c])?.click();return;}
    document.querySelector(`.bd-rail-key[data-rail="${c}"]`)?.click();});
  book.querySelector('.cr').addEventListener('click',()=>$('bookPreviewNext')?.click());
  book.querySelector('.cl').addEventListener('click',()=>$('bookPreviewPrev')?.click());
})();
