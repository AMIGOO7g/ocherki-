// topbar — scripts in one place (v176), each in its own scope as before.

// ——— 048-v30-hanging-tooltip-controller
(()=>{
  const tip=document.createElement('div');
  tip.className='hanging-tip';
  document.body.appendChild(tip);
  let timer=0;

  let autoHide=0;
  function place(btn,show=true){
    clearTimeout(timer);clearTimeout(autoHide);
    autoHide=setTimeout(()=>{if(!btn.matches(':hover'))tip.classList.remove('show');},2500);
    if(btn.id==='powerBtn'||btn.closest('.hanging,.bd-rail-item')?.querySelector('.oc-klab')){tip.classList.remove('show');tip.textContent='';return;}
    const r=btn.getBoundingClientRect();
    tip.textContent=btn.getAttribute('aria-label')||'';
    tip.style.left=(r.left+r.width/2)+'px';
    tip.style.top=(r.bottom+14)+'px';
    tip.style.transform='translate(-50%,6px)';
    requestAnimationFrame(()=>{
      const tr=tip.getBoundingClientRect();
      const pad=14;
      let dx=0;
      if(tr.left<pad) dx=pad-tr.left;
      else if(tr.right>innerWidth-pad) dx=(innerWidth-pad)-tr.right;
      tip.style.left=(r.left+r.width/2+dx)+'px';
      if(show) requestAnimationFrame(()=>tip.classList.add('show'));
    });
  }

  // Every hanging key, including the ones that appear later (composition
  // keys in the book, «Написать нам»), gets the same quiet caption.
  let hoverKey=null;
  document.addEventListener('mouseover',e=>{const btn=e.target.closest?.('.hanging .key[aria-label]');if(!btn||btn===hoverKey||btn.dataset.tipBound==='1')return;hoverKey=btn;place(btn,true);setTimeout(()=>place(btn,true),120);});
  document.addEventListener('mouseout',e=>{const btn=e.target.closest?.('.hanging .key[aria-label]');if(!btn||btn.dataset.tipBound==='1'||btn.contains(e.relatedTarget))return;hoverKey=null;tip.classList.remove('show');timer=setTimeout(()=>{tip.textContent=''},430);});
  document.querySelectorAll('.hanging .key[aria-label]').forEach(btn=>{btn.dataset.tipBound='1';
    btn.addEventListener('mouseenter',()=>{place(btn,true);setTimeout(()=>place(btn,true),120);});
    btn.addEventListener('mouseleave',()=>{
      tip.classList.remove('show');
      timer=setTimeout(()=>{tip.textContent=''},430);
    });
    btn.addEventListener('focus',()=>place(btn,true));
    btn.addEventListener('click',()=>{tip.classList.remove('show');});
    btn.addEventListener('blur',()=>tip.classList.remove('show'));
  });
  addEventListener('resize',()=>{
    if(tip.classList.contains('show')) tip.classList.remove('show');
  });
})();


// ——— 049-block
window.LifeBookPageBlocks = {
  normalize(page){
    if(!page) return [];
    if(!Array.isArray(page.blocks)){
      page.blocks=[];
      if(page.text){
        page.blocks.push({type:"text", content:page.text});
      }
      if(Array.isArray(page.photos)){
        page.photos.forEach(photo=>{
          page.blocks.push({
            type:"photo",
            photoId:photo.id||null,
            src:photo.src||""
          });
        });
      }
    }
    return page.blocks;
  },
  add(page,type,data){
    return this.normalize(page).push(Object.assign({type:type},data||{}));
  },
  addPhoto(page,photo){
    return this.add(page,"photo",{photoId:photo?.id||null,src:photo?.src||""});
  },
  addQuote(page,text){
    return this.add(page,"quote",{content:text||""});
  },
  addCaption(page,text){
    return this.add(page,"caption",{content:text||""});
  },
  addDate(page,text){
    return this.add(page,"date",{content:text||""});
  }
};

function clampHangingTooltips(){
 document.querySelectorAll('.hanging .tooltip,.key .tooltip').forEach(t=>{
   const r=t.getBoundingClientRect();
   t.style.left='';
   t.style.right='';
   if(r.left<8) t.style.left='0';
   if(r.right>window.innerWidth-8) t.style.right='0';
 });
}
window.addEventListener('resize',clampHangingTooltips);
setTimeout(clampHangingTooltips,500);

function waitPreviewReady(cb){
  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    if(typeof bookSpreads!=="undefined" && bookSpreads.length){
      clearInterval(timer);
      cb();
    }
    if(tries>40) clearInterval(timer);
  },50);
}


// ——— 059-music-key
(()=>{
  const shell=document.querySelector('.shell'),btn=document.getElementById('musicBtn');
  btn?.addEventListener('click',event=>{event.stopPropagation();const open=!shell.classList.contains('is-music-open');shell.classList.toggle('is-music-open',open);btn.setAttribute('aria-expanded',String(open));});
  document.addEventListener('click',event=>{if(shell.classList.contains('is-music-open')&&!event.target.closest('.mode-controls')&&!event.target.closest('#soundPanel')){shell.classList.remove('is-music-open');btn?.setAttribute('aria-expanded','false');}});
})();


// ——— 082-topbar-v111-js
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  const lab=(el,t)=>{if(!el||el.querySelector(':scope > .oc-klab'))return;const s=document.createElement('span');s.className='oc-klab';s.textContent=t;el.appendChild(s);};
  // «Ещё»: the same hanging key as «Отменить», with three dots.
  const undoH=document.getElementById('undoBtn')?.closest('.hanging'),redoH=document.getElementById('redoBtn')?.closest('.hanging');
  if(!undoH||!redoH)return;
  const moreH=undoH.cloneNode(true);moreH.querySelectorAll('.oc-klab').forEach(x=>x.remove());const mk=moreH.querySelector('button');mk.id='moreKey';mk.setAttribute('aria-label','Ещё');mk.removeAttribute('data-tip-bound');
  mk.querySelector('.cap').innerHTML='<svg viewBox="0 0 48 48"><circle cx="15" cy="24" r="2.4"/><circle cx="24" cy="24" r="2.4"/><circle cx="33" cy="24" r="2.4"/></svg>';
  redoH.after(moreH);
  lab(document.getElementById('powerBtn')?.closest('.hanging')||document.getElementById('powerBtn')?.parentElement,'Свет');
  lab(document.getElementById('booksBtn')?.closest('.hanging'),'Мои книги');lab(undoH,'Отменить');lab(redoH,'Вернуть');lab(moreH,'Ещё');
  const lampLab=()=>{const k=document.querySelector('.bd-rail-key[data-rail="tips"]');if(k)lab(k.closest('.bd-rail-item'),'До книги');else setTimeout(lampLab,800);};lampLab();
  const I={sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',moon:'<path d="M20 14A8 8 0 1110 4a6 6 0 0010 10z"/>',note:'<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',big:'<path d="M4 18L9 6l5 12M6 14h6M15 18l3-7 3 7M16 16h4"/>',pdf:'<path d="M6 3h9l4 4v14H6z"/><path d="M15 3v4h4M9 13h6M9 17h6"/>',mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',tour:'<circle cx="12" cy="12" r="9"/><path d="M12 8v5M12 16h.01"/>',hash:'<path d="M5 9h14M5 15h14M10 4L8 20M16 4l-2 16"/>'};
  const menu=document.createElement('div');menu.className='oc-more';document.body.appendChild(menu);
  const click=id=>{const b=document.getElementById(id);if(b)b.click();};
  const musicOn=()=>/pause|❚|stop/i.test(document.getElementById('transportPlayBtn')?.getAttribute('aria-label')||'')||document.getElementById('musicBtn')?.getAttribute('aria-expanded')==='true';
  const draw=()=>{const night=shell.classList.contains('is-night'),big=shell.classList.contains('is-large-ui'),n=(document.getElementById('pageCount')?.textContent||'').trim();
    const it=(a,i,t,on)=>`<div class="it ${on?'on':''}" data-a="${a}"><svg viewBox="0 0 24 24">${I[i]}</svg>${t}</div>`;
    menu.innerHTML=`<span class="k">Вид</span>${it('day','sun','Дневной свет',!night)}${it('night','moon','Ночной свет',night)}${it('big','big','Крупный интерфейс',big)}<hr>${it('music','note',musicOn()?'Музыка — выключить':'Музыка — включить',musicOn())}<hr>${it('pdf','pdf','Сохранить в PDF')}${it('tour','tour','Показать знакомство')}${it('mail','mail','Написать нам')}`;};
  const place=()=>{const r=mk.getBoundingClientRect();menu.style.right=Math.max(16,innerWidth-r.right-10)+'px';menu.style.top=(r.bottom+44)+'px';};
  const open=()=>{draw();place();menu.classList.add('on');};const close=()=>menu.classList.remove('on');
  mk.addEventListener('click',e=>{e.stopPropagation();menu.classList.contains('on')?close():open();});
  menu.addEventListener('click',e=>{const a=e.target.closest('[data-a]')?.dataset.a;if(!a)return;e.stopPropagation();close();
    if(a==='day')click('dayBtn');else if(a==='night')click('nightBtn');else if(a==='big')click('largeUiKey');
    else if(a==='music'){click('musicBtn');setTimeout(()=>{if(document.getElementById('musicBtn')?.getAttribute('aria-expanded')==='true')click('transportPlayBtn');},120);}
    else if(a==='pdf')click('pdfBtn');else if(a==='pages')click('pagesBtn');else if(a==='mail')click('contactBtn');
    else if(a==='tour'){const room=shell.classList.contains('is-manuscript')?'manuscript':shell.classList.contains('is-book-preview')?'book':'write';window.OCHERKI_TOUR?.start?.(room,true);}});
  addEventListener('click',e=>{if(menu.classList.contains('on')&&!menu.contains(e.target))close();});
  addEventListener('keydown',e=>{if(e.key==='Escape')close();});
  setTimeout(()=>dispatchEvent(new Event('resize')),300);
})();


// ——— 094-light-host-v164-js
(()=>{const fr=document.getElementById('v35SheetFrame');let keys=[];const sh=document.querySelector('.shell');
  addEventListener('message',e=>{const d=e.data;if(!d||d.type!=='OCHERKI_LIGHT'||!fr)return;sh?.classList.toggle('osl-typing',!!d.on);
    if(!keys.length)keys=[...document.querySelectorAll('.oct button.k,.oct button.pl')];
    const r=fr.getBoundingClientRect(),x=r.left+d.x,y=r.top+d.y;
    keys.forEach(k=>{const b=k.getBoundingClientRect();if(!b.width)return;const dd=Math.hypot(b.left+b.width/2-x,b.top+b.height/2-y),g=d.on?Math.max(0,1-dd/760):0;
      k.style.filter=g>.02?`brightness(${(1+g*.35).toFixed(2)}) drop-shadow(0 0 ${(4+g*12).toFixed(0)}px rgba(255,190,120,${(g*.6).toFixed(2)}))`:'';});});})();


// ——— 120-v37-preview-hanging-physics
/* The three composition controls use the same small spring motion as the
   permanent hanging controls. Bind once, even while disabled, so enabling a
   control after a build never leaves it visually inert. */
(()=>{
  const bind=el=>{
    if(!el||el.dataset.hangingSwing==='1')return;
    el.dataset.hangingSwing='1';
    const key=el.querySelector('.key');
    let angle=0,velocity=0,raf=0,lastX=null,lastPush=0,hovering=false;
    // The thread is now screen-height, so the same angular impulse used by a
    // short control would throw the key far outside its hit area. Keep this
    // long pendulum within the gentle ±0.22° movement of the upper controls.
    const gravity=.010,damping=.991,maxAngle=.07,pushForce=.008,cooldown=140;
    const apply=()=>{el.style.transform=`rotate(${angle.toFixed(2)}deg)`};
    const animate=()=>{
      velocity+=-gravity*angle;
      velocity*=damping;
      angle+=velocity;
      if(angle>maxAngle){angle=maxAngle;velocity*=-.12}
      else if(angle< -maxAngle){angle=-maxAngle;velocity*=-.12}
      apply();
      if(!hovering&&Math.abs(angle)<.006&&Math.abs(velocity)<.0012){angle=0;velocity=0;apply();raf=0;return}
      raf=requestAnimationFrame(animate);
    };
    const kick=(direction,strength=pushForce)=>{
      velocity=Math.max(-.38,Math.min(.38,velocity+direction*strength));
      if(!raf)raf=requestAnimationFrame(animate);
    };
    el.addEventListener('pointerenter',e=>{if(key?.disabled)return;hovering=true;lastX=e.clientX;kick(.014)});
    el.addEventListener('pointermove',e=>{
      if(key?.disabled)return;
      const now=performance.now();
      if(lastX==null){lastX=e.clientX;return}
      const dx=e.clientX-lastX;
      if(Math.abs(dx)>24&&now-lastPush>cooldown){lastPush=now;lastX=e.clientX;kick(dx>0?1:-1)}
    });
    el.addEventListener('pointerleave',()=>{hovering=false;lastX=null;if(!raf)raf=requestAnimationFrame(animate)});
    el.addEventListener('pointerdown',e=>{if(key?.disabled)return;const r=el.getBoundingClientRect();kick(e.clientX>=r.left+r.width/2?1:-1,.006)});
  };
  document.querySelectorAll('.book-preview-layout-hanger .book-preview-control').forEach(bind);
})();


// ——— 171-write-v121-js
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  const T=()=>window.OCHERKI_TOPBAR;
  // ——— calm loading: the side texts appear once they stand where they belong ———
  let readyT=0;const arm=()=>{if(!shell.classList.contains('oc-w')){if(shell.classList.contains('oc-ready'))shell.classList.remove('oc-ready');clearTimeout(readyT);readyT=0;return;}
    if(shell.classList.contains('ui-boot'))return;
    if(!shell.classList.contains('oc-ready')&&!readyT){dispatchEvent(new Event('resize'));readyT=setTimeout(()=>{dispatchEvent(new Event('resize'));requestAnimationFrame(()=>{shell.classList.add('oc-ready');readyT=0;});},450);}};
  new MutationObserver(arm).observe(shell,{attributes:true,attributeFilter:['class']});arm();
  // ——— the sway for «в книге», the lamp and «?» ———
  const hang=()=>{const a=T()?.attach;if(!a){setTimeout(hang,500);return;}
    const w=document.querySelector('.wp-keys.k-closed .wp-item .key');if(w&&!w._push){w.style.transformOrigin='50% calc(-1 * var(--oc-ky,30px))';a(w);}
    const q=document.querySelector('.oc-qk');if(q&&!q._push){q.style.transformOrigin='50% -40px';a(q);}
    if(!w)setTimeout(hang,800);};
  hang();

  // ——— the angel on the pendulum ———
  const bob=document.querySelector('.master-clock .logo-bob');if(bob&&!bob.querySelector('.oc-bob')){const k=document.createElement('span');k.className='oc-bob';k.innerHTML='<i class="nf"></i>';bob.appendChild(k);}
  // ——— music in the corner ———
  const S='<svg viewBox="0 0 24 24">',E='</svg>';
  const IC={note:'<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>',next:'<path d="M6 6l8 6-8 6z"/><path d="M17 6v12"/>',prev:'<path d="M18 6l-8 6 8 6z"/><path d="M7 6v12"/>',play:'<path d="M8 5l11 7-11 7z"/>',pause:'<path d="M9 5v14M15 5v14"/>',mute:'<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M17 9l4 6M21 9l-4 6"/>',snd:'<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a7.5 7.5 0 0 1 0 11"/>'};
  const mus=document.createElement('div');mus.className='oc-mus oct';mus.style.cssText='position:fixed;left:auto;right:46px;top:0;width:44px;height:0;transform:none';
  const th=(x,y1,y2)=>`<i class="th" style="left:${x}px;top:${y1}px;height:${y2-y1}px"></i>`;
  const kb=(id,ic,s)=>`<button type="button" class="k" data-a="${id}" style="--s:${s}px"><i class="gl"></i><i class="nf"></i><span class="c">${S}${IC[ic]}${E}</span></button>`;
  let playing=false,muted=false;
  const draw=()=>{const L=[['next','next','Следующий трек'],['toggle',playing?'pause':'play',playing?'Пауза':'Играть'],['prev','prev','Предыдущий трек'],[muted?'mute':'mute',muted?'mute':'snd',muted?'Звуки выключены':'Звуки включены']];
    mus.innerHTML=`<div class="sw hg" style="left:0;top:0;width:44px;height:84px">${th(22,0,40)}${kb('music','note',44)}</div><span class="lbx" style="left:22px;top:91px">Музыка</span>`
      +L.map((m,i)=>`<div class="mm" style="transition-delay:${i*60}ms"><div class="sw hg" style="left:0;top:${110+i*58-14}px;width:44px;height:58px">${th(22,0,14)}${kb(m[0],m[1],44)}</div><span class="ml" style="top:${110+i*58+22}px">${m[2]}</span></div>`).join('');
    mus.querySelectorAll('.sw').forEach(x=>T()?.attach?.(x));
    mus.querySelector('[data-a="music"]')?.classList.toggle('glow',playing);
};
  document.body.appendChild(mus);
  const send=a=>{try{window.parent?.postMessage({type:'OCHERKI_AUDIO_COMMAND',action:a},'*');}catch(_){}};
  let closeT=0;
  mus.addEventListener('pointerenter',()=>{clearTimeout(closeT);if(!mus.classList.contains('open')){draw();void mus.offsetWidth;document.dispatchEvent(new CustomEvent('oc-cascade',{detail:mus}));mus.classList.add('open');}});
  document.addEventListener('oc-cascade',e=>{if(e.detail!==mus&&mus.classList.contains('open')){clearTimeout(closeT);mus.classList.remove('open');}});
  mus.addEventListener('pointerleave',()=>{clearTimeout(closeT);closeT=setTimeout(()=>mus.classList.remove('open'),700);});
  mus.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;e.stopPropagation();const a=b.dataset.a;
    if(a==='music'||a==='toggle'){send('toggle');}else if(a==='next'){send('nextTrack');}else if(a==='prev'){send('prevTrack');}else if(a==='mute')send('muteAll');});
  addEventListener('message',e=>{const d=e.data||{};if(d.type!=='OCHERKI_AUDIO_STATE')return;const p=d.state==='playing'&&!d.muted;
    if(!!d.muted!==muted){muted=!!d.muted;const t=mus.querySelector('[data-a="mute"]');if(t){t.querySelector('.c').innerHTML=S+IC[muted?'mute':'snd']+E;t.closest('.mm').querySelector('.ml').textContent=muted?'Звуки выключены':'Звуки включены';t.classList.toggle('is-off',muted);}}if(p!==playing){playing=p;const t=mus.querySelector('[data-a="toggle"]');if(t){t.querySelector('.c').innerHTML=S+IC[p?'pause':'play']+E;t.closest('.mm').querySelector('.ml').textContent=p?'Пауза':'Играть';}}
    mus.querySelector('[data-a="music"]')?.classList.toggle('glow',p);});
  draw();
  const sync=()=>{const open=shell.classList.contains('is-open')&&!shell.classList.contains('is-start-screen');mus.classList.toggle('on',open);mus.classList.toggle('is-night',shell.classList.contains('is-night'));};
  new MutationObserver(sync).observe(shell,{attributes:true,attributeFilter:['class']});sync();
})();


// ——— 205-rooms-v142-js
(()=>{let t=0;document.addEventListener('pointerdown',e=>{if(!e.target.closest?.('.oct .k[data-k="voice"],.oct .k[data-k="photo"],.oct .k[data-k="note"],.oct .k[data-k="letter"],.oct .k[data-k="record"],.oct .k[data-k="week"],.oct .k[data-k="archive"],.oct .pl[data-w="arch"]'))return;
  document.documentElement.classList.add('oc-to-room');clearTimeout(t);t=setTimeout(()=>document.documentElement.classList.remove('oc-to-room'),1800);},true);
  document.addEventListener('click',e=>{if(e.target.closest?.('.oct .k[data-k="voice"],.oct .k[data-k="photo"],.oct .k[data-k="note"],.oct .k[data-k="letter"],.oct .k[data-k="record"],.oct .k[data-k="week"]')){document.documentElement.classList.add('oc-to-room');clearTimeout(t);t=setTimeout(()=>document.documentElement.classList.remove('oc-to-room'),1800);}},true);})();
