// «Архив семьи» (v248: the rooms behind the things are in rooms.js; Правки — the feather, Вопрос недели — the paper plane) (v246) — its first room on the same desk. The bar stays as in every room and carries the archive's sections:
// Голоса · Запись · Письма · Правки · Вопрос недели; a press marks the section (its own room comes next). On the desk five things
// lie in a row, each its own door, small, with room between them; under each only its count (text). They lie in the room's
// light (the window's by day, the evening's, the lamp's at night: the light stays where it is). Under the hand each answers and
// stops when the hand goes; nothing grows. The record turns (its label turns, the shine stays still, as on a real record); two
// small waves come from the microphone; the letter comes up out of the envelope; a red line is drawn under one line of the sheet
// and a tick comes; the telephone's screen wakes and a note rises on it.
// (v243 laid the things large with their names under them, lifted the envelope's flap, grew a thing under the hand and hid the bar.)
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  const H=document.documentElement,A='assets/',ABS=new URL('assets/',location.href).href,RM=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
  let open=false,busy=false,sect='';
  const LT='<i class="ar-lt"><b class="ar-sun"></b><b class="ar-eve"></b><b class="ar-beam"></b></i>';
  const WAVES=side=>`<svg class="ar-waves ${side}" viewBox="0 0 60 120" aria-hidden="true">${[0,1].map(k=>`<path style="--d:${k*.42}s" d="${side==='l'?`M${46-k*16} ${30-k*12} Q${30-k*18} 60 ${46-k*16} ${90+k*12}`:`M${14+k*16} ${30-k*12} Q${30+k*18} 60 ${14+k*16} ${90+k*12}`}"/>`).join('')}</svg>`;
  const SECTS=[['voices','Голоса'],['record','Запись'],['letters','Письма'],['fixes','Правки'],['question','Вопрос недели']];
  const board=document.createElement('div');board.className='ar-board';
  board.innerHTML=`<header class="ar-h"><div class="ar-t"><i class="ar-orn"></i><h1>Архив</h1><i class="ar-orn r"></i></div><p>материалы семейной истории</p></header>
  <div class="ar-row">
    <button type="button" class="ar-it" data-k="voices" aria-label="Голоса — слушать записи родных">
      <div class="ar-vis ar-vinyl" style="--m:url('${ABS}keeper/desk-vinyl-disc.webp')"><div class="ar-spin"><img src="${A}keeper/desk-vinyl-disc.webp" alt="" draggable="false"><img class="ar-label" src="${A}archive/label.webp" alt="" draggable="false"></div>
        <img class="ar-shine" src="${A}keeper/desk-vinyl-shine.webp" alt="" draggable="false">${LT}</div>
      <span class="ar-pill" data-c="voices"></span></button>
    <button type="button" class="ar-it" data-k="record" aria-label="Запись — записать воспоминания">
      <div class="ar-vis ar-mic" style="--m:url('${ABS}archive/mic2.webp')">${WAVES('l')}<img src="${A}archive/mic2.webp" alt="" draggable="false">${WAVES('r')}${LT}</div>
      <span class="ar-pill ar-rec"><em></em>записать</span></button>
    <button type="button" class="ar-it" data-k="letters" aria-label="Письма — полученные сообщения">
      <div class="ar-vis ar-env" style="--m:url('${ABS}archive/envelope.webp')"><img class="ar-letter" src="${A}archive/letter.webp" alt="" draggable="false"><img class="ar-body" src="${A}archive/envelope.webp" alt="" draggable="false">${LT}</div>
      <span class="ar-pill" data-c="letters"></span></button>
    <button type="button" class="ar-it" data-k="fixes" aria-label="Правки — что нужно исправить">
      <div class="ar-vis ar-feather" style="--m:url('${ABS}archive/feather.webp')"><img src="${A}archive/feather.webp" alt="" draggable="false">
        <svg class="ar-ink" viewBox="0 0 100 30" aria-hidden="true"><path d="M4 20 C18 8 26 26 40 14 S62 8 74 16 S88 22 96 12"/></svg>${LT}</div>
      <span class="ar-pill" data-c="fixes"></span></button>
    <button type="button" class="ar-it" data-k="question" aria-label="Вопрос недели — ответы семьи">
      <div class="ar-vis ar-plane" style="--m:url('${ABS}archive/plane.webp')"><img src="${A}archive/plane.webp" alt="" draggable="false">${LT}</div>
      <span class="ar-pill" data-c="question"></span></button>
  </div>`;
  document.body.appendChild(board);
  const $=s=>board.querySelector(s),$$=s=>[...board.querySelectorAll(s)];
  // ——— the sections on the bar (it stays, as in every room; its own keys step aside while the archive lies there)
  const nav=document.createElement('div');nav.className='ar-nav';nav.innerHTML=SECTS.map(([k,t])=>`<button type="button" data-k="${k}">${t}<i></i></button>`).join('');document.body.appendChild(nav);
  {let last='';const put=()=>{requestAnimationFrame(put);if(!open&&!nav.classList.contains('on'))return;const b=document.querySelector('.wc.wc-w:not(.bq-car)');const r=b?.getBoundingClientRect();if(!r||!r.width)return;
    const k=[r.left,r.top,r.width,r.height].map(Math.round).join();if(k===last)return;last=k;Object.assign(nav.style,{left:Math.round(r.left+70)+'px',top:Math.round(r.top)+'px',width:Math.round(r.width-140)+'px',height:Math.round(r.height)+'px'});};requestAnimationFrame(put);}
  const mark=k=>{if(k&&k===sect)k='';sect=k;nav.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b.dataset.k===k));$$('.ar-it').forEach(x=>x.classList.toggle('cur',x.dataset.k===k));
    try{dispatchEvent(new CustomEvent('ar-room',{detail:{k,board}}));}catch(_){}};
  const soon=(el)=>{const r=el.getBoundingClientRect(),tip=document.querySelector('.oc-soon-tip')||Object.assign(document.createElement('div'),{className:'oc-soon-tip'});if(!tip.parentNode)document.body.appendChild(tip);
    tip.textContent='этот раздел откроется в следующей сборке';tip.style.left=Math.round(r.left+r.width/2)+'px';tip.style.top=Math.round(r.bottom+16)+'px';tip.classList.add('on');clearTimeout(tip._t);tip._t=setTimeout(()=>tip.classList.remove('on'),1600);};
  nav.addEventListener('click',e=>{const b=e.target.closest('[data-k]');if(!b)return;mark(b.dataset.k);});

  // ——— the counts (text): nothing yet — said so; when something comes, its number
  const plural=(n,a,b,c)=>{const m=n%10,h=n%100;return m===1&&h!==11?a:m>=2&&m<=4&&(h<12||h>14)?b:c;};
  function counts(){const st=window.OCHERKI_ARCHIVE_STATE||{};const c={voices:st.voices|0,letters:st.letters|0,fixes:st.fixes|0,question:st.answers|0};
    const t={voices:c.voices?`${c.voices} ${plural(c.voices,'запись','записи','записей')}`:'записей пока нет',
      letters:c.letters?`${c.letters} ${plural(c.letters,'письмо','письма','писем')}`:'писем пока нет',
      fixes:c.fixes?`${c.fixes} ${plural(c.fixes,'исправление','исправления','исправлений')}`:'исправлений нет',
      question:c.question?`${c.question} ${plural(c.question,'новый ответ','новых ответа','новых ответов')}`:'ответов пока нет'};
    $$('.ar-pill[data-c]').forEach(p=>{p.textContent=t[p.dataset.c];p.classList.toggle('has',!!c[p.dataset.c]);});
    nav.querySelectorAll('button').forEach(b=>{const n=c[b.dataset.k]||0;b.querySelector('i').textContent=n?String(n):'';});
    }

  // ——— the room's light on each thing: the room's own pictures laid from where the thing lies (it never moves with it)
  function light(){try{board.style.setProperty('--rk-beam',window.OCHERKI_DESK_LIGHT?.beam()||'none');}catch(_){}
    $$('.ar-lt').forEach(l=>{const r=l.parentElement.getBoundingClientRect();l.style.backgroundPosition=`${-Math.round(r.left)}px ${-Math.round(r.top)}px`;});}
  addEventListener('resize',()=>{if(open)light();});

  // ——— the record: it turns while the hand is on it (one turn in four seconds), starts and stops softly; the shine stands still
  {const it=$('[data-k="voices"]'),sp=$('.ar-spin');let want=0,v=0,a=0,last=0,run=false;const W=360/4000;
    const step=t=>{const dt=Math.min(50,t-(last||t));last=t;v+=(want*W-v)*Math.min(1,dt/320);a=(a+v*dt)%360;sp.style.transform=`rotate(${a.toFixed(2)}deg)`;
      if(want||v>.0004)requestAnimationFrame(step);else{run=false;last=0;}};
    const go=on=>{if(RM())return;want=on?1:0;if(!run){run=true;last=0;requestAnimationFrame(step);}};
    it.addEventListener('pointerenter',()=>go(true));it.addEventListener('pointerleave',()=>go(false));it.addEventListener('focus',()=>go(true));it.addEventListener('blur',()=>go(false));}
  // on a touch screen the first touch shows the thing's motion, the second opens it
  let touched=null;
  board.addEventListener('pointerdown',e=>{if(e.pointerType!=='touch')return;const it=e.target.closest('.ar-it');if(it&&touched!==it){$$('.ar-it').forEach(x=>x.classList.toggle('hov',x===it));touched=it;it._first=true;}});
  board.addEventListener('click',e=>{const it=e.target.closest('.ar-it');if(!it)return;if(it._first){it._first=false;return;}mark(it.dataset.k);});

  // ——— coming and going: the editor's desk fades aside (its places kept), the things come up one after another; the bar stays
  const away=['#editorPaperWrap .editor-paper','.ws-left','#writingPrompt','.wp-keys','.ws-ttl','.wp-pane','.photo-stack'];let anims=[];
  function aside(on,ms){anims.forEach(x=>{try{x.cancel();}catch(_){}});anims=[];
    away.forEach(s=>document.querySelectorAll(s).forEach(el=>{const k=[{opacity:1,filter:'blur(0px)'},{opacity:0,filter:'blur(2px)'}];if(!on)k.reverse();
      try{anims.push(el.animate(k,{duration:ms,easing:'cubic-bezier(.45,.05,.55,.95)',fill:on?'forwards':'none'}));}catch(_){}}));
    try{const f=document.getElementById('v35SheetFrame');if(f){const k=[{opacity:1},{opacity:0}];if(!on)k.reverse();anims.push(f.animate(k,{duration:ms,easing:'ease',fill:on?'forwards':'none'}));}}catch(_){}}
  function openA(){if(open||busy)return;const B=window.OCHERKI_DESKBOOK;
    // from the book or «Рукопись»: back to the desk first, then the archive
    if(B?.isOpen?.()){B.close('write',()=>setTimeout(openA,120));return;}
    if(H.classList.contains('rk-on')){window.OCHERKI_SET_MODE?.('write');setTimeout(openA,900);return;}
    open=true;busy=true;H.classList.add('ar-on');sect='x';mark('x');counts();aside(true,520);board.classList.add('on');nav.classList.add('on');light();
    $$('.ar-h,.ar-it').forEach((el,i)=>el.animate([{opacity:0,translate:'0px 14px'},{opacity:1,translate:'0px 0px'}],{duration:620,delay:140+i*70,easing:'cubic-bezier(.2,.75,.25,1)',fill:'backwards'}));
    setTimeout(()=>{busy=false;light();},900);}
  // going: the things go aside and fade at once (another room comes over them at the same time — nothing waits)
  function closeA(after,toBook){if(!open){after?.();return;}busy=true;nav.classList.remove('on');
    const out=$$('.ar-h,.ar-it').map((el,i)=>el.animate([{opacity:1,translate:'0px 0px'},{opacity:0,translate:toBook?'-6vw 0px':'0px 12px'}],{duration:toBook?420:360,delay:i*25,easing:'ease-in',fill:'forwards'}));
    if(!toBook)aside(false,560);
    if(toBook){anims.forEach(x=>{try{x.cancel();}catch(_){}});anims=[];}
    const done=()=>{board.classList.remove('on');H.classList.remove('ar-on');out.forEach(a=>{try{a.cancel();}catch(_){}});open=false;busy=false;};
    if(toBook){after?.();setTimeout(done,460);}else setTimeout(()=>{done();after?.();},480);}
  setInterval(()=>{if(open)counts();},2000);
  // (keys.js asks OcherkiArchive.open; isOpen stays false for the editor's own keeping — the desk keeps its places underneath)
  window.OcherkiArchive={open:()=>openA(),close:closeA,get isOpen(){return false;},shown:()=>open,newCount:0};
  window.OCHERKI_ARCHIVE_DESK={open:openA,close:closeA,isOpen:()=>open};
  // any other key on the bar takes the archive away first
  addEventListener('click',e=>{if(!open)return;const k=e.target.closest?.('.oct .k[data-k]');if(!k||k.dataset.k==='archive'||k.__arGo)return;
    if(!['write','manuscript','logo'].includes(k.dataset.k))return;e.preventDefault();e.stopImmediatePropagation();
    closeA(()=>{k.__arGo=true;k.click();k.__arGo=false;});},true);
  addEventListener('keydown',e=>{if(open&&e.key==='Escape')closeA();});
})();
