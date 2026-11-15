/*@block [" id=\"keeper-help-v140-js\"", ""]*/
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  const load=()=>window.OcherkiTour?OcherkiTour.loadKeeper():Promise.reject(new Error('no tour'));
  // what he says depends on where you are
  const TIPS={
    write:'Пишите, как говорите. Вопросы к главе — слева. «Добавить» — фото, новый эпизод или документ. «Показать в книге» — как этот лист ляжет в книгу.',
    manuscript:'Здесь все листы книги. Перетащите лист, чтобы поменять порядок; фото из стопки кладите прямо на лист.',
    book:'Листайте развороты. Под книгой — другая композиция разворота, справа — дизайн и формат. Когда всё готово — «До книги».',
    archive:'Архив семьи: голоса, фото, тексты и письма родных. Любое из них одним касанием ложится в книгу.',
    week:'Вопрос недели уходит родным на телефон. Они отвечают голосом, словами или фото — ответы придут в архив.'};
  const where=()=>{const F=window.OCHERKI_FAMILY;if(F?.isOpen?.())return F.part()===1?'week':'archive';
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
