// common — scripts in one place (v176), each in its own scope as before.

// ——— 029-v16-swing-patch
(function(){
  function attachSwing(hanger, trigger){
    if(!hanger || hanger.dataset.v16Bound==='1') return;
    hanger.dataset.v16Bound='1';
    trigger = trigger || hanger;
    let raf = null, angle = 0, velocity = 0, lastX = 0, hovering = false;
    const gravity = .010, damping = .991, maxAngle = 1.18;
    function apply(){ hanger.style.setProperty('transform', 'rotate(' + angle.toFixed(2) + 'deg)', 'important'); }
    function step(){ velocity += -gravity * angle; velocity *= damping; angle += velocity; if(angle > maxAngle){ angle = maxAngle; velocity *= -0.12; } if(angle < -maxAngle){ angle = -maxAngle; velocity *= -0.12; } apply(); if(!hovering && Math.abs(angle) < .01 && Math.abs(velocity) < .002){ angle = 0; velocity = 0; apply(); raf = null; return; } raf = requestAnimationFrame(step); }
    function push(x, amp){ let dir = 1; if(lastX) dir = x > lastX ? 1 : -1; lastX = x; velocity = velocity * .35 + (amp || .14) * dir * .72; if(!raf) raf = requestAnimationFrame(step); }
    trigger.addEventListener('pointerenter', e => { hovering = true; push(e.clientX, .16); });
    trigger.addEventListener('pointermove', e => { if(Math.abs(e.clientX - lastX) > 18) push(e.clientX, .12); });
    trigger.addEventListener('pointerleave', () => { hovering = false; lastX = 0; if(!raf) raf = requestAnimationFrame(step); });
    trigger.addEventListener('click', e => { push(e.clientX || lastX || 1, .20); });
    apply();
  }
  attachSwing(document.getElementById('projectHanger'), document.getElementById('projectBtn'));
  attachSwing(document.getElementById('pagesHanger'), document.getElementById('pagesBtn'));
})();


// ——— 031-v17-swing
(function(){
  function attachSwing(hanger, trigger){
    if(!hanger || hanger.dataset.v17Bound==='1') return;
    hanger.dataset.v17Bound='1';
    trigger = trigger || hanger;
    let raf = null, angle = 0, velocity = 0, lastX = 0, hovering = false;
    const gravity = .0105, damping = .992, maxAngle = 1.12;
    function apply(){ hanger.style.setProperty('transform', 'rotate(' + angle.toFixed(2) + 'deg)', 'important'); }
    function step(){ velocity += -gravity * angle; velocity *= damping; angle += velocity; if(angle > maxAngle){ angle = maxAngle; velocity *= -0.14; } if(angle < -maxAngle){ angle = -maxAngle; velocity *= -0.14; } apply(); if(!hovering && Math.abs(angle) < .01 && Math.abs(velocity) < .002){ angle = 0; velocity = 0; apply(); raf = null; return; } raf = requestAnimationFrame(step); }
    function push(x, amp){ let dir = 1; if(lastX) dir = x > lastX ? 1 : -1; lastX = x; velocity = velocity * .35 + (amp || .14) * dir * .72; if(!raf) raf = requestAnimationFrame(step); }
    ['pointerenter','click'].forEach(ev => trigger.addEventListener(ev, e => { hovering = true; push(e.clientX || 1, ev==='click' ? .18 : .15); }));
    trigger.addEventListener('pointermove', e => { hovering = true; if(Math.abs(e.clientX - lastX) > 16) push(e.clientX, .11); });
    trigger.addEventListener('pointerleave', () => { hovering = false; lastX = 0; if(!raf) raf = requestAnimationFrame(step); });
    apply();
  }
  window.addEventListener('load', function(){
    attachSwing(document.getElementById('projectHanger'), document.getElementById('projectBtn'));
    attachSwing(document.getElementById('pagesHanger'), document.getElementById('pagesBtn'));
  });
})();


// ——— 045-v35-remove-stray-icon-label
/* Remove any fallback label left by a failed decorative asset. It is not
   book content and must never appear in the workshop. */
(()=>{
  const bad=/^\s*окно\s+из\s+значка\s*$/i;
  const clean=()=>{
    document.querySelectorAll('[alt],[title],[aria-label]').forEach(el=>{
      ['alt','title','aria-label'].forEach(name=>{
        const value=el.getAttribute(name)||'';
        if(!bad.test(value))return;
        /* A broken asset can still have a src and therefore keep its alt
           text visible as a browser fallback. Remove the label first; only a
           genuinely empty image node is removed entirely. */
        if(el.tagName==='IMG'){
          el.removeAttribute(name);
          if(!el.getAttribute('src'))el.remove();
        }else el.removeAttribute(name);
      });
    });
    document.querySelectorAll('body *').forEach(el=>{
      if(/^(SCRIPT|STYLE|NOSCRIPT)$/.test(el.tagName))return;
      if(el.children.length===0 && bad.test(el.textContent||''))el.remove();
    });
  };
  clean();
  /* v143: only the nodes that were added or relabelled are checked — scanning the whole page after every change cost a lot */
  const fix=el=>{if(!el||el.nodeType!==1||/^(SCRIPT|STYLE|NOSCRIPT)$/.test(el.tagName))return;
    ['alt','title','aria-label'].forEach(name=>{const v=el.getAttribute(name);if(v&&bad.test(v)){el.removeAttribute(name);if(el.tagName==='IMG'&&!el.getAttribute('src'))el.remove();}});
    if(el.children.length===0&&bad.test(el.textContent||''))el.remove();};
  new MutationObserver(L=>{for(const m of L){if(m.type==='attributes'){fix(m.target);continue;}
      m.addedNodes.forEach(n=>{if(n.nodeType!==1)return;fix(n);if(!n.firstElementChild)return;n.querySelectorAll('[alt*="значка" i],[title*="значка" i],[aria-label*="значка" i]').forEach(fix);if(/значка/i.test(n.textContent||''))n.querySelectorAll('*').forEach(fix);});}
  }).observe(document.body,{subtree:true,childList:true,attributes:true,attributeFilter:['alt','title','aria-label']});
})();


// ——— 065-block
(()=>{const apply=on=>{document.querySelector('.shell')?.classList.toggle('is-large-ui',!!on);document.body.classList.toggle('is-large-ui',!!on);};
try{apply(localStorage.getItem('ocherkiLargeUI')==='1');}catch(e){}
addEventListener('message',e=>{if(e.data&&e.data.type==='OCHERKI_LARGE_UI'){apply(e.data.on);requestAnimationFrame(()=>window.dispatchEvent(new Event('resize')));}});})();


// ——— 071-tour-v99-js
// v99: a short first look — the lamp lights one thing at a time. Each room
// (write, manuscript, book) shows its own part only on the first visit;
// «Аа → Показать знакомство» brings it back.
(()=>{const shell=document.querySelector('.shell'),modal=document.getElementById('bookPreviewModal');if(!shell)return;
  const frameDoc=()=>{try{return document.getElementById('v35SheetFrame')?.contentDocument;}catch(_){return null;}};
  const inFrame=sel=>{const f=document.getElementById('v35SheetFrame'),d=frameDoc();const el=d?.querySelector(sel);if(!el||!f)return null;const a=f.getBoundingClientRect(),r=el.getBoundingClientRect();return {left:a.left+r.left,top:a.top+r.top,width:r.width,height:r.height};};
  const box=sel=>{if(typeof sel==='function')return sel();const el=document.querySelector(sel);if(!el)return null;const r=el.getBoundingClientRect();return r.width&&r.height?r:null;};
  const TOURS={
    write:[
      ['.mode-switch','Три комнаты мастерской','<b>Писать</b> — лист, на котором вы рассказываете.<br><b>Рукопись</b> — все листы книги на одном столе.<br><b>Книга</b> — как это будет напечатано.'],
      ['.editor-paper','Ваш лист','Пишите как в обычном письме. Всё сохраняется само, каждую секунду.'],
      [()=>inFrame('#voiceBtn'),'Можно говорить','Нажмите микрофон и рассказывайте — слова сами лягут на лист.'],
      ['#writingPrompt','Вопросы к главе','Если не знаете, с чего начать, — ответьте на вопрос. «Дальше» покажет следующий.'],
      ['#bookMapShell','Карта книги','Главы и листы. Нажмите на главу, чтобы перейти к ней.'],
      ['.mode-controls','Свет, крупный шрифт, музыка','Ночь и день, крупный интерфейс и тихая музыка для работы.'],
      ['.rd-line','Сколько осталось до книги','Нажмите золотую линию под названием — увидите, что ещё нужно сделать, и перейдёте прямо к этому месту.'],
      ['#booksBtn','Мои книги','Здесь хранятся все ваши книги — можно вести несколько.'],
      ['#pdfBtn','Сохранить','Черновик книги в PDF — посмотреть или показать родным.'],
      ['#contactBtn','Написать нам','Вопрос, идея или помощь — открытка придёт в мастерскую.']],
    manuscript:[
      ['.ms-space','Все листы на одном столе','Колесо — листать главы. Нажмите лист — откроется для письма. Потяните — переставите.'],
      ['.mq-car','Плашка главы','‹ › — соседняя глава. Справа: новый лист, фото, «готово» для открытого листа, корзина.'],
      ['.mq-name','Название главы','Нажмите — откроется список глав, «＋ Новая глава» и разделы книги.']],
    book:[
      ['#bookPreviewSpread','Ваша книга','Так она будет напечатана. Листайте стрелками или колесом.'],
      ['#bookPreviewLayoutHanger','Композиция разворота','Стрелки меняют расположение фото и текста на этом развороте.'],
      ['.bq-car','Плашка книги','‹ ⟳ › — композиция разворота. Справа: дизайн, формат, фото в книге и PDF. Листать — за уголок страницы или по превью внизу.'],
      ['.preview-arc','Лента разворотов','Нажмите на любой разворот, чтобы перейти к нему.']]};
  const key=n=>'ocherki_tour_'+n;
  const seen=n=>{try{return localStorage.getItem(key(n))==='1';}catch(_){return true;}};
  const mark=n=>{try{localStorage.setItem(key(n),'1');}catch(_){}};
  let dim,ring,card,cur=null,idx=0,steps=[];
  function ensure(){if(dim)return;dim=document.createElement('div');dim.className='tr-dim';ring=document.createElement('div');ring.className='tr-ring';card=document.createElement('div');card.className='tr-card';document.body.append(dim,ring,card);
    // A press anywhere outside closes the tour — nothing stays blocked.
    dim.addEventListener('click',e=>{e.stopPropagation();end();});}
  function place(){const st=steps[idx];if(!st)return end();const r=box(st[0]);if(!r){idx++;return place();}
    const pad=10,cx=r.left+r.width/2,cy=r.top+r.height/2;
    dim.style.setProperty('--x',cx+'px');dim.style.setProperty('--y',cy+'px');dim.style.setProperty('--rw',Math.max(70,r.width*.62)+'px');dim.style.setProperty('--rh',Math.max(46,r.height*.75)+'px');
    ring.style.cssText=`left:${r.left-pad}px;top:${r.top-pad}px;width:${r.width+2*pad}px;height:${r.height+2*pad}px;border-radius:${Math.min(40,(r.height+2*pad)/2)}px`;ring.classList.add('on');
    const total=steps.length;card.innerHTML=`<small>Знакомство · ${idx+1} из ${total}</small><h3>${st[1]}</h3><p>${st[2]}</p><div class="tr-row"><span class="tr-dots">${steps.map((_,i)=>`<i class="${i===idx?'on':''}"></i>`).join('')}</span><span><button class="tr-skip" type="button">пропустить</button><button class="tr-btn" type="button">${idx===total-1?'Понятно':'Далее →'}</button></span></div>`;
    card.querySelector('.tr-btn').onclick=e=>{e.stopPropagation();idx++;place();};card.querySelector('.tr-skip').onclick=e=>{e.stopPropagation();end();};
    const W=360,H=card.offsetHeight||220;let left=cx-W/2,top=r.bottom+22;
    if(top+H>innerHeight-16){top=r.top-H-22;}if(top<16){top=Math.min(innerHeight-H-16,cy-H/2);left=r.right+26;if(left+W>innerWidth-16)left=r.left-W-26;}
    left=Math.max(16,Math.min(innerWidth-W-16,left));top=Math.max(16,Math.min(innerHeight-H-16,top));
    card.style.left=left+'px';card.style.top=top+'px';requestAnimationFrame(()=>{dim.classList.add('on');card.classList.add('on');});}
  function start(name,force){if(cur||(!force&&seen(name)))return;const list=TOURS[name];if(!list)return;ensure();cur=name;idx=0;steps=list;mark(name);place();}
  function end(){if(!cur)return;cur=null;dim.classList.remove('on');ring.classList.remove('on');card.classList.remove('on');}
  addEventListener('keydown',e=>{if(!cur)return;if(e.key==='Escape')end();if(e.key==='Enter'||e.key==='ArrowRight'){e.preventDefault();idx++;place();}},true);
  addEventListener('resize',()=>{if(cur)place();});
  const room=()=>shell.classList.contains('is-start-screen')||shell.classList.contains('is-family-room')?'':shell.classList.contains('is-manuscript')?'manuscript':modal?.classList.contains('open')?'book':shell.classList.contains('is-open')?'write':'';
  // Automated checks (tests) are not greeted.
  const quiet=navigator.webdriver&&!/[?&]tour=1/.test(location.search+(parent!==window?parent.location.search:''));
  let t=0;const check=()=>{if(quiet)return;clearTimeout(t);t=setTimeout(()=>{const r=room();if(r&&!cur)start(r);},r0()==='book'?2600:1500);};const r0=room;
  new MutationObserver(check).observe(shell,{attributes:true,attributeFilter:['class']});
  if(modal)new MutationObserver(check).observe(modal,{attributes:true,attributeFilter:['class']});
  addEventListener('message',e=>{if(e.data?.type==='OCHERKI_TOUR_AGAIN'){const r=room()||'write';end();setTimeout(()=>start(r,true),300);}});
  window.OCHERKI_TOUR={start:(n,f)=>start(n||room(),f),end};
})();


// ——— 083-archive-v105-js
(()=>{
  window.OCHERKI_SAY=(text,action,fn)=>{let el=document.getElementById('ocSay');
    if(!el){el=document.createElement('div');el.id='ocSay';el.className='oc-say';document.body.appendChild(el);}
    el.innerHTML='';const t=document.createElement('span');t.textContent=text;el.appendChild(t);
    if(action){const b=document.createElement('b');b.textContent=action;b.addEventListener('click',()=>{el.classList.remove('on');try{fn?.();}catch(_){}});el.appendChild(b);}
    el.classList.remove('on');void el.offsetWidth;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),action?5200:3200);};
  // Back to the start screen: a press on the book's title or on the signature.
  const home=e=>{const sh=document.querySelector('.shell');if(!sh||sh.classList.contains('is-start-screen'))return;e.preventDefault();e.stopPropagation();
    const F=window.OCHERKI_FAMILY;if(!F)return;F.closeRoom?.();
    const go=()=>F.showStart?.();
    if(sh.classList.contains('is-book-preview')||sh.classList.contains('is-manuscript')){window.OCHERKI_SET_MODE?.('write');setTimeout(go,700);}else go();};
  document.getElementById('projectBtn')?.addEventListener('click',home);
  document.querySelector('.brand-line')?.addEventListener('click',home);
})();


// ——— 112-design-kernel-v1-cascade-order
(()=>{const style=document.getElementById('design-kernel-v1-claude-integration');if(style)document.head.appendChild(style);})();


// ——— 126-tool-plate-script
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  const I=d=>`<svg viewBox="0 0 24 24" aria-hidden="true">${d}</svg>`;
  const B=(act,tip,d,cls='')=>`<button type="button" class="${cls}" data-act="${act}" data-tip="${tip}" aria-label="${tip}">${I(d)}</button>`;
  const top=document.createElement('div');top.className='tool-top';top.setAttribute('aria-label','Инструменты листа');
  top.innerHTML=`<div class="project-key tool-plate"><i class="str" style="left:22%"></i><i class="str" style="left:78%"></i>`
   +B('photo','Добавить фото','<rect x="3" y="6" width="18" height="13" rx="2"/><circle cx="12" cy="12.5" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/>')
   +B('page','Новый лист','<path d="M6 3h8l4 4v14H6Z"/><path d="M14 3v4h4"/><path d="M12 11v6M9 14h6"/>')
   +B('view','Посмотреть этот лист в книге','<path d="M3 5.5c3-1.4 6-1.4 9 .6 3-2 6-2 9-.6V19c-3-1.4-6-1.4-9 .6-3-2-6-2-9-.6Z"/><path d="M12 6.1v13.5"/>')
   +`<span class="sep"></span>`+B('more','Ещё','<path d="M7 10l5 5 5-5"/>','more')+`</div>`
   +`<div class="project-key tool-extra"><i class="str" style="left:22%"></i><i class="str" style="left:78%"></i>`
   +B('quote','Цитата','<path d="M5 17c2.5-1 4-3 4-6V7H5v4h4"/><path d="M14 17c2.5-1 4-3 4-6V7h-4v4h4"/>')
   +B('date','Дата','<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>')
   +B('episode','Новый эпизод','<path d="M7 3h10v18l-5-4-5 4Z"/>')
   +B('document','Архивный документ: письмо, справка, грамота','<path d="M6 3h12v18H6Z"/><path d="M9 8h6M9 12h6M9 16h4"/>')
   +`</div><span class="tool-tip"></span>`;
  shell.appendChild(top);
  const tip=top.querySelector('.tool-tip');
  const frame=()=>document.getElementById('v35SheetFrame');
  const setOpen=on=>{top.classList.toggle('is-open',on);top.querySelector('.more').dataset.tip=on?'Свернуть':'Ещё';};
  top.addEventListener('click',e=>{const b=e.target.closest('button[data-act]');if(!b)return;e.stopPropagation();const act=b.dataset.act;
    if(act==='more'){setOpen(!top.classList.contains('is-open'));return;}
    if(b.closest('.tool-extra'))setOpen(false);
    try{frame()?.contentWindow?.postMessage({type:'OCHERKI_SHEET_ACTION',act},'*');}catch(err){}});
  top.addEventListener('pointerover',e=>{const b=e.target.closest('button[data-act]');if(!b)return;tip.textContent=b.dataset.tip;tip.classList.toggle('is-extra',!!b.closest('.tool-extra'));
    const r=b.getBoundingClientRect(),t=top.getBoundingClientRect();tip.style.left=Math.round(r.left-t.left+r.width/2-tip.offsetWidth/2)+'px';tip.classList.add('is-on');});
  top.addEventListener('pointerout',e=>{if(!e.relatedTarget||!e.relatedTarget.closest?.('button[data-act]'))tip.classList.remove('is-on');});
  document.addEventListener('click',e=>{if(!top.contains(e.target))setOpen(false);});
  // Which tools fit the page the author is on (no photo on the contents…).
  addEventListener('message',e=>{const d=e.data||{};if(d.type!=='OCHERKI_SHEET_TOOLS')return;
    Object.entries(d.hidden||{}).forEach(([act,h])=>{const b=top.querySelector(`[data-act="${act}"]`);if(b)b.hidden=!!h;});});
})();


// ——— 128-wheel-gesture
// One gesture of the wheel = one step, for the arc of spreads and the
// manuscript. A gesture is a mouse notch, or a touchpad swipe together with
// its fading momentum. A new gesture starts after a pause, on a change of
// direction, or when the motion speeds up again after it had faded. A wheel
// turned on steadily (not fading) walks on, one step at a calm pace.
window.__ocherkiWheel=()=>{let last=-1e9,sign=0,acc=0,stepped=false,lastStep=-1e9,peak=0,trough=0;
  return e=>{const t=e.timeStamp||performance.now(),k=e.deltaMode===1?40:e.deltaMode===2?800:1;
    const d=(Math.abs(e.deltaY)>=Math.abs(e.deltaX)?e.deltaY:e.deltaX)*k;if(!d)return 0;
    const sg=Math.sign(d),a=Math.abs(d);
    const fresh=t-last>240||sg!==sign||(stepped&&t-lastStep>220&&trough<peak*.4&&a>trough*2+8);
    if(fresh){stepped=false;acc=0;peak=a;trough=a;}
    else if(a>=peak){peak=a;trough=a;}else trough=Math.min(trough,a);
    last=t;sign=sg;acc+=d;
    if(!stepped&&Math.abs(acc)>=40){stepped=true;lastStep=t;return sg;}
    if(stepped&&t-lastStep>420&&a>=peak*.8&&a>=4){lastStep=t;peak=a;trough=a;return sg;}
    return 0;};};
