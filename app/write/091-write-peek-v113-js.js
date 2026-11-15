/*@block [" id=\"write-peek-v113-js\"", ""]*/
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  const IB='<svg viewBox="0 0 24 24"><path d="M12 6c-2.6-1.8-5.6-1.9-8.5-1.3v13.5c2.9-.6 5.9-.5 8.5 1.3 2.6-1.8 5.6-1.9 8.5-1.3V4.7C17.6 4.1 14.6 4.2 12 6zM12 6v13.5"/></svg>';
  const IX='<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>';
  const IR='<svg viewBox="0 0 24 24"><path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 4v5h-5"/></svg>';
  const pane=document.createElement('div');pane.className='wp-pane';pane.innerHTML='<div class="wp-cap">так ляжет в книге</div><div class="wp-page"><div class="wp-host"></div><div class="wp-wait"><span>собираю страницу…</span></div></div>';
  const keys=document.createElement('div');keys.className='wp-keys k-closed';
  keys.innerHTML=`<div class="wp-item tog"><button type="button" class="key" aria-label="Показать в книге"><span class="cap">${IB}</span></button><span class="lab">в книге</span></div>`;
  const keys2=document.createElement('div');keys2.className='wp-keys k-open';
  keys2.innerHTML=`<div class="wp-item back"><button type="button" class="key" aria-label="Вернуть один лист"><span class="cap">${IX}</span></button><span class="lab">вернуть</span></div>
    <div class="wp-pg"><button type="button" data-pg="-1" aria-label="Предыдущая страница листа">‹</button><span></span><button type="button" data-pg="1" aria-label="Следующая страница листа">›</button></div>
    <div class="wp-item ref"><button type="button" class="key" aria-label="Обновить страницу"><span class="cap">${IR}</span></button><span class="lab">обновить</span></div>`;
  shell.append(pane,keys,keys2);
  const wrap=()=>document.getElementById('editorPaperWrap');
  // where the sheet begins on screen: its top line in sight (the author reads the sheet from there)
  const topRatio=()=>{try{const d=document.getElementById('v35SheetFrame').contentDocument,ed=d.getElementById('editor');if(!ed)return 0;const total=ed.textContent.length;if(!total)return 0;
    const box=(ed.closest('.editor-scroll,.page-content,.paper')||ed.parentElement).getBoundingClientRect();let before=0;
    for(const n of ed.childNodes){const rr=n.nodeType===1?n.getBoundingClientRect():null;if(rr&&rr.bottom>box.top+8)break;before+=(n.textContent||'').length;}
    return Math.min(1,(before+1)/total);}catch(_){return 0;}};
  const tog=keys.querySelector('.tog'),ref=keys2.querySelector('.ref'),pg=keys2.querySelector('.wp-pg');
  let on=false,uid='',stale=false,busy=false,shown=-1,tAuto=0,pick=null,count=1;
  // the paper and the sheets of the chapter lying behind it, to its right
  const stackRight=()=>{let m=0;try{const f=document.getElementById('v35SheetFrame'),fr=f.getBoundingClientRect();f.contentDocument.querySelectorAll('.sheet-stack .sheet').forEach(el=>{const r=el.getBoundingClientRect();if(r.width>50)m=Math.max(m,fr.left+r.right);});}catch(_){}return m;};
  const usable=()=>shell.classList.contains('is-open')&&!['is-manuscript','is-book-preview','is-family-room','is-start-screen','is-ms-to-book'].some(c=>shell.classList.contains(c))&&!document.getElementById('bookPreviewModal')?.classList.contains('open');
  const shift=()=>{const w=wrap();return w?parseFloat(getComputedStyle(w).translate)||0:0;};
  function geo(){const w=wrap();if(!w)return null;const r=w.getBoundingClientRect();if(!r.width)return null;
    const sh=shift(),base={left:r.left-sh,top:r.top,width:r.width,height:r.height};
    const extra=Math.max(0,Math.min(160,(stackRight()-sh)-(base.left+base.width)));
    const [pw,ph]=window.__ocherkiPageSize?.()||[1,1];const G=64+extra,room=innerWidth-2*180;
    let H=base.height*.8,W=H*pw/ph;if(base.width+G+W>room){W=Math.max(0,room-base.width-G);H=W*ph/pw;}
    let d=(W+G)/2;
    // v119: the sheet stays where it is — the book's page comes out on its right.
    if(shell.classList.contains('oc-w')){const r2=innerWidth-(base.left+base.width)-G-40;H=base.height*.8;W=H*pw/ph;if(W>r2){W=Math.max(0,r2);H=W*ph/pw;}d=0;}
    return {base,W,H,G,d,extra,ok:W>=260};}
  function place(){const g=geo();if(!g)return;const b=g.base,L=b.left-g.d+b.width+g.G;
    const css=on?`left:${L}px;top:${b.top+(b.height-g.H)/2-10}px;width:${g.W}px;height:${g.H}px`:`left:${b.left+b.width+g.extra-g.W*.7}px;top:${b.top+(b.height-g.H)/2-10}px;width:${g.W}px;height:${g.H}px`;
    if((on||!shell.classList.contains('wp-closing'))&&pane._css!==css){pane._css=css;pane.style.cssText=css;}
    keys2.style.left=(L+g.W/2-keys2.offsetWidth/2)+'px';keys2.style.top=(b.top+(b.height+g.H)/2+12)+'px';
    keys.style.left=(b.left+b.width+g.extra+30)+'px';keys.style.top=(b.top+b.height-96)+'px';}
  function setOpen(v){const w=wrap();if(!w)return;
    if(v){const g=geo();if(!g||!g.ok){window.OCHERKI_SAY?.('Окно узковато для двух листов — откройте «Книгу»','открыть',()=>window.OCHERKI_SET_MODE?.('book'));return;}
      // the page is laid out first, while nothing moves — then everything glides without a stall
      if(!setOpen.ready){tog.classList.add('is-busy');try{document.getElementById('v35SheetFrame')?.contentWindow?.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',action:'flush'},'*');}catch(_){}const t0=Date.now();setTimeout(()=>{pick=null;try{paint(true);}catch(_){}setOpen.ready=true;setTimeout(()=>requestAnimationFrame(()=>requestAnimationFrame(()=>{tog.classList.remove('is-busy');setOpen(true);setOpen.ready=false;})),Math.max(0,900-(Date.now()-t0)));},260);return;}}
    on=v;const g=geo();w.style.translate=on&&g?`${-g.d}px 0`:'';shell.classList.toggle('wp-on',on);
    clearTimeout(setOpen.u);shell.classList.remove('wp-up');if(on)setOpen.u=setTimeout(()=>{if(on)shell.classList.add('wp-up');},1600);
    clearTimeout(setOpen.c);if(!on){shell.classList.add('wp-closing');setOpen.c=setTimeout(()=>shell.classList.remove('wp-closing'),1500);}else shell.classList.remove('wp-closing');
    place();
  }
  // lays the page into the pane at once (the book is usually prepared in the background already)
  function paint(){let res=null;const ratio=topRatio();try{res=window.__ocherkiPeekPage?.(uid,ratio,pick);}catch(_){res=null;}
    const host=pane.querySelector('.wp-host');
    count=res?.n||1;pg.classList.toggle('on',count>1);if(res){pick=res.k;pg.querySelector('span').textContent=`${res.k+1} из ${count}`;pg.querySelector('[data-pg="-1"]').disabled=res.k<=0;pg.querySelector('[data-pg="1"]').disabled=res.k>=count-1;}
    if(res){host.innerHTML=res.html;shown=res.spread;pane.querySelector('.wp-cap').textContent=`так ляжет в книге${res.pageNo?' · страница '+res.pageNo:''}`;}
    else{host.innerHTML='<div class="wp-none">Этот раздел появится в книге,<br>когда в нём будет текст или фото</div>';pane.querySelector('.wp-cap').textContent='так ляжет в книге';}
    place();window.__ocherkiScalePages?.();ref.classList.remove('is-stale');stale=false;}
  function refresh(first){if(!on||busy)return;busy=true;pane.classList.add('is-busy');ref.classList.remove('is-stale');stale=false;
    ref.classList.remove('is-spin');void ref.offsetWidth;ref.classList.add('is-spin');clearTimeout(refresh.s);refresh.s=setTimeout(()=>ref.classList.remove('is-spin'),950);
    setTimeout(()=>{paint();requestAnimationFrame(()=>window.__ocherkiScalePages?.());
      setTimeout(()=>{pane.classList.remove('is-busy');busy=false;},160);},60);}
  tog.querySelector('button').addEventListener('click',()=>setOpen(!on));keys2.querySelector('.back button').addEventListener('click',()=>setOpen(false));
  ref.querySelector('button').addEventListener('click',()=>{pick=null;refresh(false);});
  pg.addEventListener('click',e=>{const b=e.target.closest('[data-pg]');if(!b||b.disabled)return;pick=Math.max(0,Math.min(count-1,(pick||0)+(+b.dataset.pg)));refresh(false);});
  addEventListener('message',e=>{const d=e.data||{};
    if(d.type==='OCHERKI_ACTIVE_STATE'&&d.payload?.pageUid){const u=d.payload.pageUid;if(u!==uid){uid=u;pick=null;if(on){clearTimeout(tAuto);tAuto=setTimeout(()=>refresh(false),450);}}}
    else if(d.type==='OCHERKI_STRUCTURE_STATE'){let a='';(d.payload?.sections||[]).forEach(s=>(s.pages||[]).forEach(p=>{if(p.active)a=p.uid||p.id||'';}));
      if(a&&a!==uid){uid=a;pick=null;if(on){clearTimeout(tAuto);tAuto=setTimeout(()=>refresh(false),450);}}
      else if(on&&!busy){stale=true;ref.classList.add('is-stale');}}});
  const sync=()=>{const ok=usable();shell.classList.toggle('wp-ready',ok);
    if(!ok&&on){on=false;const w=wrap();if(w){w.style.setProperty('transition','none','important');w.style.translate='';void w.offsetWidth;requestAnimationFrame(()=>requestAnimationFrame(()=>w.style.removeProperty('transition')));}
      shell.classList.remove('wp-on','wp-up','wp-closing');}
    if(ok)place();};
  new MutationObserver(sync).observe(shell,{attributes:true,attributeFilter:['class']});
  const modal=document.getElementById('bookPreviewModal');if(modal)new MutationObserver(sync).observe(modal,{attributes:true,attributeFilter:['class']});
  addEventListener('resize',()=>{if(on){const w=wrap(),g=geo();if(w&&g)w.style.translate=`${-g.d}px 0`;}place();requestAnimationFrame(()=>window.__ocherkiScalePages?.());});
  [1200,2600,4500].forEach(t=>setTimeout(sync,t));
})();
