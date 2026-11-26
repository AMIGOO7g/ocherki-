// «Старт»: включение, вход, знакомство — scripts in one place (v177), each in its own scope as before.

// ——— 054-v162-final-exact-fixes
(function(){
  function purgeLegacyLightTitle(){
    document.querySelectorAll('.power-title').forEach(function(el){ el.remove(); });
    var btn=document.getElementById('powerBtn');
    /* power button keeps its accessible label; visual tooltip is disabled above */
  }
  purgeLegacyLightTitle();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',purgeLegacyLightTitle,{once:true});
})();


// ——— 174-more-corner-v141-js
// v141 — «Ещё» (light, large type, the tour, write to us) hangs in the corner beside the music: it belongs to the whole constructor, not to the archive
(()=>{const shell=document.querySelector('.shell');if(!shell)return;const T=()=>window.OCHERKI_TOPBAR;
  const S='<svg viewBox="0 0 24 24">',E='</svg>';
  const IC={more:'<circle cx="6" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18" cy="12" r="1"/>',moon:'<path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',tour:'<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
    mail:'<rect x="3" y="6" width="18" height="13" rx="1.5"/><path d="M3 7l9 6 9-6"/>',big:'<path d="M4 18l4.5-12L13 18M6 14h5M15 18l2.5-7 2.5 7M15.8 16h3.4"/>'};
  const box=document.createElement('div');box.className='oc-mus oc-more2 oct';
  const th=(x,y1,y2)=>`<i class="th" style="left:${x}px;top:${y1}px;height:${y2-y1}px"></i>`;
  const kb=(id,ic)=>`<button type="button" class="k" data-a="${id}" style="--s:44px"><i class="gl"></i><i class="nf"></i><span class="c">${S}${IC[ic]}${E}</span></button>`;
  const draw=()=>{const night=shell.classList.contains('is-night'),big=shell.classList.contains('is-large-ui');
    const L=[['light',night?'sun':'moon',night?'Дневной свет':'Ночной свет'],['big','big',big?'Обычный интерфейс':'Крупный интерфейс'],['mail','mail','Написать нам']];
    box.innerHTML=`<div class="sw hg" style="left:0;top:0;width:44px;height:84px">${th(22,0,40)}${kb('more','more')}</div><span class="lbx" style="left:22px;top:91px">Ещё</span>`
      +L.map((m,i)=>`<div class="mm" style="transition-delay:${i*60}ms"><div class="sw hg" style="left:0;top:${110+i*58-14}px;width:44px;height:58px">${th(22,0,14)}${kb(m[0],m[1])}</div><span class="ml" style="top:${110+i*58+22}px">${m[2]}</span></div>`).join('');
    box.querySelectorAll('.sw').forEach(x=>T()?.attach?.(x));};
  document.body.appendChild(box);draw();
  let closeT=0;const open=on=>{clearTimeout(closeT);if(on&&!box.classList.contains('open')){draw();void box.offsetWidth;document.dispatchEvent(new CustomEvent('oc-cascade',{detail:box}));}box.classList.toggle('open',on);};
  document.addEventListener('oc-cascade',e=>{if(e.detail!==box&&box.classList.contains('open')){clearTimeout(closeT);box.classList.remove('open');}});
  box.addEventListener('pointerenter',()=>open(true));
  box.addEventListener('pointerleave',()=>{clearTimeout(closeT);closeT=setTimeout(()=>open(false),700);});
  box.addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;e.stopPropagation();const a=b.dataset.a;
    if(a==='more'){open(!box.classList.contains('open'));return;}open(false);
    const click=id=>document.getElementById(id)?.click();
    if(a==='light')click(shell.classList.contains('is-night')?'dayBtn':'nightBtn');else if(a==='big')click('largeUiKey');else if(a==='mail')click('contactBtn');else if(a==='tour')window.OCHERKI_KEEPER?.open?.();});
  document.addEventListener('click',e=>{if(!box.contains(e.target))open(false);});
  const sync=()=>{const on=shell.classList.contains('is-open')&&!shell.classList.contains('is-start-screen');box.classList.toggle('on',on);box.classList.toggle('is-night',shell.classList.contains('is-night'));};
  new MutationObserver(sync).observe(shell,{attributes:true,attributeFilter:['class']});sync();
})();


// ——— 185-keeper-help-v140-js
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  const load=()=>window.OcherkiTour?OcherkiTour.loadKeeper():Promise.reject(new Error('no tour'));
  // what he says depends on where you are
  const TIPS={
    write:'Пишите, как говорите. Вопросы к главе — слева. «Добавить» — фото, новый эпизод или документ. «Показать в книге» — как этот лист ляжет в книгу.',
    manuscript:'Здесь все листы книги. Перетащите лист, чтобы поменять порядок; фото из стопки кладите прямо на лист.',
    book:'Листайте развороты. Под книгой — другая композиция разворота, справа — дизайн и формат. Когда всё готово — «До книги».',
    archive:'Архив семьи: голоса, фото, тексты и письма родных. Любое из них одним касанием ложится в книгу.',
    week:'Вопрос недели уходит родным на телефон. Они отвечают голосом, словами или фото — ответы придут в архив.'};
  const where=()=>{if(window.OcherkiArchive?.isOpen)return 'archive';
    if(document.getElementById('bookPreviewModal')?.classList.contains('open'))return 'book';
    if(shell.classList.contains('oc-w'))return 'write';return document.querySelector('.ms-screen.is-on,.ms-screen.on')?'manuscript':'write';};
  const dot=document.createElement('button');dot.type='button';dot.className='okh-dot';dot.setAttribute('aria-label','Хранитель — подсказка');dot.innerHTML='<i></i><b></b><b></b><b></b><span>Хранитель — подсказать?</span>';
  const ov=document.createElement('div');ov.className='okh';ov.innerHTML='<canvas></canvas><div class="txt"><b>Хранитель</b><p></p><div class="acts"><span data-a="tour">Показать всё по порядку</span><span data-a="ok">Понятно</span></div></div>';
  shell.after(dot);document.body.appendChild(ov);
  const cv=ov.querySelector('canvas'),txt=ov.querySelector('.txt');let K=null,ts=[];const later=(f,ms)=>ts.push(setTimeout(f,ms));
  const dotN=()=>{const r=dot.getBoundingClientRect();return[(r.left+r.width/2)/innerWidth*2-1,1-(r.top+r.height/2)/innerHeight*2];};
  function open(){ts.forEach(clearTimeout);ts=[];ov.querySelector('p').textContent=TIPS[where()]||TIPS.write;ov.classList.remove('say');ov.classList.add('on');dot.style.opacity='0';
    load().then(()=>{if(!K&&window.OcherkiKeeper3D)K=window.OcherkiKeeper3D.create(cv,{size:.3,dust:18,quick:1.9});if(!K){ov.classList.add('say');return;}
      K.start();K.resize();const[dx,dy]=dotN();K.placeSparkAt(dx,dy);K.awayTo(dx,dy);
      // the spark rises from the corner and he unfolds a little above it
      later(()=>K.moveTo(-.62,-.18,1),250);
      const lit=()=>{if(!ov.classList.contains('on')||!K)return;const p=K.screenOf(0,0.6);ov.style.setProperty('--hx',Math.round(p.x)+'px');ov.style.setProperty('--hy',Math.round(p.y)+'px');requestAnimationFrame(lit);};lit();
      const wait=()=>{if(!ov.classList.contains('on'))return;if(K.state.form>.86&&K.state.mode==='free'){const p=K.screenOf(1.9,1.4);txt.style.left=Math.round(Math.min(innerWidth-txt.offsetWidth-24,p.x))+'px';txt.style.top=Math.round(Math.max(24,p.y-txt.offsetHeight/2))+'px';ov.classList.add('say');K.talk(4500);K.lookAt(.9,0);}else later(wait,200);};later(wait,1200);
    }).catch(()=>ov.classList.add('say'));}
  // the spark flies all the way back into the ember, and only then the dusk lifts
  function close(){ts.forEach(clearTimeout);ts=[];ov.classList.remove('say');if(!K){ov.classList.remove('on');dot.style.opacity='';return;}
    const[dx,dy]=dotN();K.awayTo(dx,dy);K.lookAt(null);K.setMode('away');const t0=Date.now();
    const home=()=>{const st=K.state,w=K.toWorld(dx,dy);const near=Math.hypot(st.ex-w.x,st.ey-w.y)<.25*K.halfW()/6;
      if((near&&Date.now()-t0>900)||Date.now()-t0>3200){dot.style.opacity='';dot.classList.add('wake');setTimeout(()=>dot.classList.remove('wake'),1200);ov.classList.remove('on');later(()=>K.stop(),900);}else later(home,60);};later(home,400);}
  dot.addEventListener('click',e=>{e.stopPropagation();if(ov.classList.contains('on'))close();else open();});
  ov.addEventListener('click',e=>{const a=e.target.closest('[data-a]')?.dataset.a;if(a==='tour'){close();setTimeout(()=>window.OCHERKI_KEEPER?.open?.(),900);return;}close();});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&ov.classList.contains('on'))close();});
  window.OCHERKI_KEEPER_HELP={open,close};
})();


// ——— 198-intro-v142-js
(()=>{const shell=document.querySelector('.shell');if(!shell||!window.OcherkiTour)return;
  const ov=document.createElement('div');ov.className='okp';ov.innerHTML='<div class="kp2"><canvas class="kpc"></canvas></div>';document.body.appendChild(ov);
  const cv=ov.querySelector('.kpc');let K=null,T=null,ts=[];const later=(f,ms)=>ts.push(setTimeout(f,ms));
  const keeper=()=>OcherkiTour.loadKeeper().then(()=>{if(!K&&window.OcherkiKeeper3D)K=OcherkiKeeper3D.create(cv,{size:.3,dust:24,quick:2.6,writeSpeed:2.3,wordsScale:1.6});return K;}).catch(()=>null);
  function open(){ts.forEach(clearTimeout);ts=[];ov.classList.add('on');
    keeper().then(k=>{if(!ov.classList.contains('on'))return;
      T?.destroy();T=OcherkiTour.create(ov,{K:k,last:'Начать',onDone:close});
      if(k){k.start();k.resize();k.placeSpark(k.halfW()*.55,k.halfW()*.25);later(()=>k.moveTo(0,.2,1),300);}
      T.start();});}
  // he flies back into the ember in the corner and the dark lifts after him
  function close(){ts.forEach(clearTimeout);ts=[];T?.stop();
    if(K){const d=document.querySelector('.okh-dot'),r=d?.getBoundingClientRect();if(r&&r.width){const cr=cv.getBoundingClientRect();K.awayTo((r.left+r.width/2-cr.left)/cr.width*2-1,1-(r.top+r.height/2-cr.top)/cr.height*2);}K.lookAt(null);K.setMode('away');}
    later(()=>{ov.classList.remove('on');later(()=>{K&&K.stop();T?.destroy();T=null;},1200);const d=document.querySelector('.okh-dot');d?.classList.add('wake');setTimeout(()=>d?.classList.remove('wake'),6000);try{localStorage.setItem('ocherki_keeper_seen','1');}catch(_){}},K?1900:300);}
  window.OCHERKI_KEEPER={open,close};
  document.addEventListener('click',e=>{const m=e.target.closest?.('.oct .more [data-m="tour"]');if(m){e.stopImmediatePropagation();e.preventDefault();document.querySelector('.oct .more')?.classList.remove('on');open();}},true);
  // once the constructor has settled, the Keeper is fetched quietly so he never arrives to an empty dark screen
  const settle=setInterval(()=>{if(shell.classList.contains('oc-ready')){clearInterval(settle);{/* v192: the Keeper's 3D warm-up holds the page a moment — only once the hands have been off the mouse and keys for a while */
    let last=performance.now();const t=()=>{last=performance.now();};const W=[window];try{const fw=document.getElementById('v35SheetFrame')?.contentWindow;if(fw)W.push(fw);}catch(_){}
    W.forEach(w=>['pointerdown','pointermove','keydown','wheel'].forEach(e=>w.addEventListener(e,t,{passive:true,capture:true})));
    const go=()=>{if(performance.now()-last<5000)return setTimeout(go,1500);W.forEach(w=>['pointerdown','pointermove','keydown','wheel'].forEach(e=>w.removeEventListener(e,t,{capture:true})));if(!window.OCHERKI_NO_KEEPER)OcherkiTour.warm();};setTimeout(go,4000);}}},700);
})();
