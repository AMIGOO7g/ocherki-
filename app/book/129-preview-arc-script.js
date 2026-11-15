/*@block [" id=\"preview-arc-script\"", ""]*/
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
