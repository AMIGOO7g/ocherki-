/*@block [" id=\"topbar-v111-js\"", ""]*/
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
