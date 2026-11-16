/*@block [" id=\"three-screens-script\"", ""]*/
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  const modal=document.getElementById('bookPreviewModal');
  const sw=document.createElement('div');sw.className='project-key mode-switch';sw.setAttribute('role','tablist');sw.setAttribute('aria-label','Экраны');
  sw.innerHTML='<i class="sw-dim"></i><i class="str" style="left:18%"></i><i class="str" style="left:82%"></i><button type="button" data-mode="write">Писать</button><button type="button" data-mode="manuscript">Рукопись</button><button type="button" data-mode="book">Книга</button>';
  shell.after(sw);
  const mode=()=>shell.classList.contains('is-manuscript')?'manuscript':modal?.classList.contains('open')?'book':'write';
  let wasOpen=false,wasLarge=null;
  // v165: declared before the first sync() runs (it used to throw on a cold load and stop the rest)
  let lastPaper=null,swW=0,placed='',rowX=null,musicBase=null;
  const sync=()=>{const m=mode();
    {const lg=shell.classList.contains('is-large-ui');if(lg!==wasLarge){wasLarge=lg;setTimeout(()=>{measureRow();placed='';placeTop();},60);}}
    // Switching off from «Рукопись» or «Книга» leaves nothing of them behind.
    const open=shell.classList.contains('is-open');if(wasOpen&&!open){window.OCHERKI_MANUSCRIPT?.close?.();closeBook();}wasOpen=open;
    if(sw.dataset.mode!==m)sw.dataset.mode=m;sw.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.mode===m));
    {const night=shell.classList.contains('is-night')||darkRoom();if(sw.classList.contains('is-night')!==night){sw.classList.add('is-fading');clearTimeout(sw._fade);sw._fade=setTimeout(()=>sw.classList.remove('is-fading'),2600);}sw.classList.toggle('is-night',night);}sw.classList.toggle('is-ready',shell.classList.contains('is-open'));requestAnimationFrame(placeTop);};
  const closeBook=()=>{if(modal?.classList.contains('open'))document.getElementById('bookPreviewClose')?.click();};
  // One flight for every screen change: a clean sheet of paper travels
  // from where the page was to where it will be.
  function flyPaper(from,to,{ms=900,html='',fadeIn=false,dissolve=false,track=null}={}){
    if(!from||!to||!from.width||!to.width)return null;const f=document.createElement('div');f.className='ms-flyer';
    f.style.cssText=`left:${from.left}px;top:${from.top}px;width:${from.width}px;height:${from.height}px;transition:left ${ms}ms cubic-bezier(.3,.7,.2,1),top ${ms}ms cubic-bezier(.3,.7,.2,1),width ${ms}ms cubic-bezier(.3,.7,.2,1),height ${ms}ms cubic-bezier(.3,.7,.2,1),opacity .45s ease`;
    document.body.appendChild(f);void f.offsetWidth;requestAnimationFrame(()=>{f.style.left=to.left+'px';f.style.top=to.top+'px';f.style.width=to.width+'px';f.style.height=to.height+'px';
      // Dissolving on the way: it never stands over the page it arrives on.
      if(dissolve){f.style.transition+=`,opacity ${Math.round(ms*.55)}ms ease ${Math.round(ms*.45)}ms`;f.style.opacity='0';}});
    // The page it lands on may still be settling: follow it, so it arrives exactly there.
    if(track)[220,440,660].forEach(t=>setTimeout(()=>{const r=track();if(r&&r.width){f.style.left=r.left+'px';f.style.top=r.top+'px';f.style.width=r.width+'px';f.style.height=r.height+'px';}},t));
    setTimeout(()=>{f.style.opacity=0;setTimeout(()=>f.remove(),500);},ms+120);return f;}
  const pageRectOfBook=()=>{const sp=document.getElementById('bookPreviewSpread')?.getBoundingClientRect();if(!sp||!sp.width)return null;const half=sp.width/2;return {left:sp.left+half,top:sp.top,width:half,height:sp.height};};
  const editorTarget=()=>{const ed0=document.querySelector('.editor-paper')?.getBoundingClientRect(),sh=parseFloat(getComputedStyle(document.getElementById('editorPaperWrap')||document.body).translate)||0;const ed=ed0&&{left:ed0.left-sh,top:ed0.top,width:ed0.width,height:ed0.height,right:ed0.right-sh,bottom:ed0.bottom};if(ed&&ed.width>100&&ed.left>=0&&ed.right<=innerWidth)return ed;if(!lastPaper)return null;const w=lastPaper.right-lastPaper.left;return {left:lastPaper.left,top:lastPaper.top,width:w,height:Math.min(innerHeight-lastPaper.top-20,w*1.41)};};
  function flyBookToEditor(){flyPaper(pageRectOfBook(),editorTarget(),{ms:850});}
  // The ✕ of the book: the same flight into the editor.
  document.addEventListener('click',e=>{if(e.target.closest?.('#bookPreviewClose')&&modal?.classList.contains('open')&&!modal.classList.contains('is-to-ms'))flyBookToEditor();},true);
  window.OCHERKI_SET_MODE=target=>{
    if(target==='manuscript')sw.querySelector('[data-mode="manuscript"]').classList.remove('is-hint');
    const now=mode();if(now===target)return;
    if(target==='book'){
      // From «Рукопись» straight into the book: the manuscript stays while
      // «Собираю книгу…» turns, and fades once the book is open under it.
      if(now==='manuscript'&&window.OCHERKI_MANUSCRIPT?.isOpen()){
        const msActive=document.querySelector('.ms-sheet.is-active'),msSheet=msActive?.querySelector('.ms-paper')?.getBoundingClientRect();
        // The book opens on the sheet the manuscript shows as open.
        if(msActive?.dataset.uid)window.__ocherkiFocusPageUid=msActive.dataset.uid;
        // While the book is being made the manuscript stands still: nothing in it moves but the one sheet.
        window.OCHERKI_MANUSCRIPT.freeze?.();
        document.getElementById('buildBookBtn')?.click();const t0=Date.now();
        const iv=setInterval(()=>{if(modal?.classList.contains('open')||Date.now()-t0>20000){clearInterval(iv);window.OCHERKI_MANUSCRIPT.close({toBook:true});setTimeout(sync,60);
          // The chosen sheet flies into the open spread.
          if(msSheet)setTimeout(()=>{if(msActive){msActive.style.transition='opacity .15s';msActive.style.opacity='0';}const sp=document.getElementById('bookPreviewSpread')?.getBoundingClientRect();const target=()=>{const sp=document.getElementById('bookPreviewSpread')?.getBoundingClientRect();if(!sp||!sp.width)return null;const side=window.__ocherkiSpreadSide;if(!side)return sp;const half=sp.width/2;return {left:sp.left+(side==='right'?half:0),top:sp.top,width:half,height:sp.height};};flyPaper(msSheet,target(),{ms:800,dissolve:true,track:target});},300);}},60);
      }else{
        // From «Писать»: the open sheet goes into the book and settles on its
        // own page of the spread (the page that holds its words).
        if(!window.__ocherkiFocusPageUid)window.__ocherkiFocusRatio=window.__ocherkiEditorRatio?.()??-1;
        const ed=document.querySelector('.editor-paper')?.getBoundingClientRect();const from=ed&&ed.width>100?{left:ed.left,top:ed.top,width:ed.width,height:Math.min(ed.height,innerHeight-ed.top)}:null;
        document.getElementById('buildBookBtn')?.click();const t0=Date.now();
        if(from){const iv=setInterval(()=>{if(modal?.classList.contains('open')||Date.now()-t0>20000){clearInterval(iv);if(!modal?.classList.contains('open'))return;
          const target=()=>{const sp=document.getElementById('bookPreviewSpread')?.getBoundingClientRect();if(!sp||!sp.width)return null;const side=window.__ocherkiSpreadSide;if(!side)return sp;const half=sp.width/2;return {left:sp.left+(side==='right'?half:0),top:sp.top,width:half,height:sp.height};};
          // The sheet itself leaves the desk: the paper that flies is it.
          const wrap=document.querySelector('.editor-paper-wrap');if(wrap){wrap.style.setProperty('opacity','0','important');wrap.style.setProperty('transition','opacity .12s','important');setTimeout(()=>{wrap.style.removeProperty('opacity');wrap.style.removeProperty('transition');},1600);}
          flyPaper(from,target(),{ms:800,dissolve:true,track:target});}},50);}
      }}
    else if(target==='write'){
      if(now==='manuscript'&&!window.__msFlying){const M=window.OCHERKI_MANUSCRIPT,pick=M?.frontPick?.(),uid=pick?.pageUid||M?.activeUid?.();
        window.__msFlying=true;
        if(M?.flyToEditor?.(uid))return;}
      else if(now==='manuscript')setTimeout(()=>{window.__msFlying=false;},900);
      if(now==='book')flyBookToEditor();
      closeBook();window.OCHERKI_MANUSCRIPT?.close();}
    else if(target==='manuscript'){
      // From the book the manuscript comes over it; the book closes beneath,
      // so the editor never shows in between.
      if(now==='book'){const A=window.__ocherkiArcApi,list=A?.spreads?.()||[];let uid='';
        // The sheet behind the open spread (or the nearest one before it).
        const tgt=A&&window.__ocherkiSheetForSpread?.(A.active());uid=tgt?.pageUid||'';
        // The editor follows: «Писать» from the manuscript then opens this same sheet.
        if(tgt)try{document.getElementById('v35SheetFrame')?.contentWindow?.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',action:'select',...tgt},'*');}catch(_){}
        for(let i=A?A.active():-1;i>=0&&!uid;i--){const sp=list[i];for(const x of [sp?.left,sp?.right])if(!uid&&x)uid=x.sourcePageUid||x.source?.uid||'';}
        // The right page of the open spread (or the left one when it is alone).
        const sp=document.getElementById('bookPreviewSpread')?.getBoundingClientRect();let fromRect=null;
        if(sp&&sp.width){const half=sp.width/2;fromRect={left:sp.left+half,top:sp.top,width:half,height:sp.height};}
        window.OCHERKI_MANUSCRIPT?.open({fromBook:true,uid,fromRect});
        // The book lies above the manuscript: once the manuscript has come up
        // beneath it, the book fades away and closes unseen.
        modal?.classList.add('is-to-ms');setTimeout(()=>{closeBook();setTimeout(()=>modal?.classList.remove('is-to-ms'),1600);},780);}
      else window.OCHERKI_MANUSCRIPT?.open();}
    setTimeout(sync,60);
  };
  sw.addEventListener('click',e=>{const b=e.target.closest('button[data-mode]');if(b){e.stopPropagation();window.OCHERKI_SET_MODE(b.dataset.mode);}});
  new MutationObserver(sync).observe(shell,{attributes:true,attributeFilter:['class']});
  if(modal)new MutationObserver(sync).observe(modal,{attributes:true,attributeFilter:['class']});
  sync();
  const measure=()=>{const w=sw.offsetWidth;if(w){swW=w;placed='';}measureRow();if(w)document.documentElement.style.setProperty('--switch-half',Math.round(w/2)+'px');placeTop();};
  // The switch hangs to the left of the sheet, the book's title (with the
  // count of sheets) to the right of it; both keep clear of the corner keys.
  // On a screen too narrow for that the switch hangs centred over the sheet.
  // The switch is one of the hanging keys: in their row, right after «Аа»;
  // the music key moves to the right of it, so its five keys open away
  // from the switch. Measured only in measure(), never on a class change.
  function measureRow(){
    const aa=document.getElementById('largeUiKey'),mk=document.querySelector('.mode-controls .music-key');if(!aa||!mk)return;
    // v111: the view keys moved into «Ещё» — the switch stands right after «Свет».
    if(!aa.getBoundingClientRect().width){const pw=document.getElementById('powerBtn')?.getBoundingClientRect();if(pw&&pw.width){rowX=Math.round(pw.right+44);}return;}
    const a=aa.getBoundingClientRect();if(!a.width)return;
    if(musicBase==null){const m=mk.getBoundingClientRect();musicBase=m.left-parseFloat(getComputedStyle(mk).marginLeft||0)-a.right;}
    rowX=Math.round(a.right+34);
    const K=shell.classList.contains('is-large-ui')?1.26:1;
    mk.style.setProperty('margin-left',Math.round(rowX+(swW||285)*K+34-a.right-musicBase)+'px','important');
  }
  function placeTop(){
    if(shell.classList.contains('is-book-preview')||shell.classList.contains('is-manuscript')){if(!lastPaper)return;}
    else{const r=document.querySelector('.editor-paper')?.getBoundingClientRect();if(r&&r.width>100&&r.left>=0&&r.right<=innerWidth&&r.top>-40&&r.top<innerHeight*.5){/* v116: the sheet's own place, not where «в книге» moved it */const sh=parseFloat(getComputedStyle(document.getElementById('editorPaperWrap')||document.body).translate)||0;lastPaper={left:r.left-sh,right:r.right-sh,top:r.top,cx:r.left-sh+r.width/2};}}
    if(!lastPaper)lastPaper={left:innerWidth/2-300,right:innerWidth/2+300,top:112,cx:innerWidth/2};
    const w=swW||285,acts=document.querySelector('.project-actions')?.getBoundingClientRect();
    const rightLimit=(acts&&acts.width?acts.left:innerWidth)-28;
    // Big interface: the switch and the title grow with the keys (×1.26).
    const K=shell.classList.contains('is-large-ui')?1.26:1;sw.classList.toggle('is-large',K>1);
    // Centred on the row of keys (their middle is 67px down, 73px when big).
    const x=Math.round((rowX!=null?rowX:Math.max(24,lastPaper.left-44-w))+(K-1)*w/2),y=K>1?33:40;
    // The title plate and its count of sheets (64px more) end clear of
    // «Мои книги». Its width is fixed (320, or 262 when tight), so narrowing
    // it can never make room for itself and flip back and forth.
    const tight=rightLimit-64*K-(lastPaper.right+26)<320*K,tw=((tight?262:320)+64)*K;
    const key=[x,y,Math.round(rightLimit-tw),tight,K].join();if(key===placed)return;placed=key;
    sw.style.left=x+'px';sw.style.top=y+'px';sw.style.setProperty('--sw-thread',y+'px');
    document.documentElement.style.setProperty('--title-left',Math.round(rightLimit-tw)+'px');
    if(shell.classList.contains('is-title-tight')!==tight)shell.classList.toggle('is-title-tight',tight);
  }
  addEventListener('resize',()=>requestAnimationFrame(()=>{musicBase=null;measureRow();placed='';placeTop();}));
  // Night: the switch takes the graphite face of the other plates.
  // v106: in the start screen and the family room the switch wears its night (graphite and gold) face.
  function darkRoom(){return false;}
  let nightFace=null;
  const readNight=()=>{if(nightFace)return nightFace;const probe=document.createElement('div');probe.className='shell is-night is-open';probe.setAttribute('aria-hidden','true');probe.style.cssText='position:fixed;left:-9999px;top:0;visibility:hidden;pointer-events:none';
    probe.innerHTML='<div class="project-top"><div class="project-hanger"><button class="project-key" type="button"><span class="project-cap"><span class="project-name">x</span></span></button></div></div>';document.body.appendChild(probe);
    const r=probe.querySelector('.project-key'),b=getComputedStyle(r,'::before'),a=getComputedStyle(r,'::after'),k=getComputedStyle(r);
    nightFace={rim:b.backgroundImage,rimShadow:b.boxShadow,faceShadow:a.boxShadow,filter:k.filter};probe.remove();return nightFace;};
  function dress(){const ref=document.getElementById('projectBtn');if(!ref)return;
    if(darkRoom()&&!shell.classList.contains('is-night')){const n=readNight();sw.style.setProperty('--sw-rim',n.rim);sw.style.setProperty('--sw-rim-shadow',n.rimShadow);sw.style.setProperty('--sw-face-shadow',n.faceShadow);sw.style.setProperty('--sw-filter',n.filter);return;}
    const b=getComputedStyle(ref,'::before'),a=getComputedStyle(ref,'::after'),k=getComputedStyle(ref);
    sw.style.setProperty('--sw-rim',b.backgroundImage);sw.style.setProperty('--sw-rim-shadow',b.boxShadow);
    const night=shell.classList.contains('is-night'),cap=ref.querySelector('.project-cap'),dark=cap?getComputedStyle(cap,'::before'):null;
    sw.style.setProperty('--sw-face-shadow',a.boxShadow);sw.style.setProperty('--sw-filter',k.filter);}
  new MutationObserver(()=>{dress();setTimeout(dress,60);setTimeout(dress,2600);}).observe(shell,{attributes:true,attributeFilter:['class']});setTimeout(dress,800);
  // A gentle swing when the pointer reaches it, like the other hanging keys.
  // Same pendulum as the title plate (v17_swing): gravity, damping, limit and pushes.
  let ang=0,vel=0,raf=0,lastX=0,hov=false;
  const step=()=>{vel+=-.0105*ang;vel*=.978;ang+=vel;if(ang>.4){ang=.4;vel*=-.14;}if(ang<-.4){ang=-.4;vel*=-.14;}
    sw.style.setProperty('--sw-rot',ang.toFixed(2)+'deg');if(!hov&&Math.abs(ang)<.02&&Math.abs(vel)<.002){ang=0;vel=0;sw.style.setProperty('--sw-rot','0deg');raf=0;return;}raf=requestAnimationFrame(step);};
  const push=(x,amp)=>{let dir=1;if(lastX)dir=x>lastX?1:-1;lastX=x;vel=vel*.35+amp*dir*.16;if(!raf)raf=requestAnimationFrame(step);};
  sw.addEventListener('pointerenter',e=>{hov=true;push(e.clientX||1,.15);});
  sw.addEventListener('click',e=>{hov=true;push(e.clientX||1,.18);});
  sw.addEventListener('pointermove',e=>{hov=true;if(Math.abs(e.clientX-lastX)>16)push(e.clientX,.11);});
  sw.addEventListener('pointerleave',()=>{hov=false;lastX=0;if(!raf)raf=requestAnimationFrame(step);});
  measure();[600,1500,3000,4500,7000,10000].forEach(t=>setTimeout(measure,t));document.fonts?.ready?.then(measure);
  // «Глава 2. Тифлис · лист 3 из 7 ‹ ›» beside the sheet instead of the map.
  const nav=document.createElement('div');nav.className='write-nav';nav.innerHTML='<div class="wn-kicker"></div><div class="wn-title"></div><div class="wn-row"><button type="button" data-step="-1" aria-label="Предыдущий лист">‹</button><span class="wn-count"></span><button type="button" data-step="1" aria-label="Следующий лист">›</button></div>';
  shell.appendChild(nav);
  let flat=[],at=-1;
  const frame=()=>document.getElementById('v35SheetFrame');
  const send=cmd=>{try{frame()?.contentWindow?.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',...cmd},'*');}catch(e){}};
  addEventListener('message',e=>{const d=e.data||{};
    if(d.type==='OCHERKI_STRUCTURE_STATE'){const st=d.payload||{};flat=[];
      (st.sections||[]).forEach(s=>(s.pages||[]).forEach((p,i)=>flat.push({s,p,i,n:(s.pages||[]).length})));
      at=flat.findIndex(x=>x.p.active);render();
      // After a few written sheets «Рукопись» glows once, inviting a look at the whole book.
      let seen=false;try{seen=localStorage.getItem('ocherki_ms_seen')==='1';}catch(err){}
      const written=flat.filter(x=>x.p.userEdited&&String(x.p.text||'').trim()).length;
      sw.querySelector('[data-mode="manuscript"]').classList.toggle('is-hint',!seen&&written>=3);}
    else if(d.type==='OCHERKI_ACTIVE_STATE'){const uid=d.payload?.pageUid;const i=flat.findIndex(x=>(x.p.uid||'')===uid);if(i>=0){at=i;render();}}});
  function render(){const cur=flat[at];if(!cur)return;
    // «Глава 1» and «лист 6 из 13» in plain type, the chapter's name in script.
    const full=String(cur.s.title||''),m=full.match(/^((?:Глава|Эпизод|Часть)\s+\d+)[.:]?\s*(.*)$/i);
    nav.querySelector('.wn-kicker').textContent=m?m[1]:'';nav.querySelector('.wn-title').textContent=m?(m[2]||m[1]):full;
    nav.querySelector('.wn-count').textContent=cur.n>1?`лист ${cur.i+1} из ${cur.n}`:'';
    nav.querySelector('[data-step="-1"]').disabled=at<=0;nav.querySelector('[data-step="1"]').disabled=at>=flat.length-1;place();}
  nav.addEventListener('click',e=>{const b=e.target.closest('[data-step]');if(!b||b.disabled)return;const next=flat[at+Number(b.dataset.step)];if(next)send({action:'select',sectionId:next.s.id,pageUid:next.p.uid});});
  function place(){if(shell.classList.contains('wp-on')||shell.classList.contains('wp-closing'))return;const r=document.querySelector('.editor-paper')?.getBoundingClientRect();if(!r||!r.width)return;
    nav.style.right=Math.round(innerWidth-r.left+250)+'px';nav.style.top=Math.round(r.top+r.height/2-30)+'px';nav.classList.add('is-placed');}
  addEventListener('resize',()=>requestAnimationFrame(place));setTimeout(place,1500);setTimeout(place,4000);
})();
