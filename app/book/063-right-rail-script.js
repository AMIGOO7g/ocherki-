/*@block [" id=\"right-rail-script\"", ""]*/
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
