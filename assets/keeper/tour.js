/* «Что умеет конструктор» — the Keeper's tour, one module for the way in (index.html) and for «Знакомство» (shell.html).
   The host gives a container (a dark stage that already holds the Keeper's canvas) and the Keeper himself;
   the tour lays its words and drawn cards over it and moves him from card to card.
   OcherkiTour.create(host, {K, script, serif, photos, greeting, last, onDone(reason)}) → {start(), stop(), back(), next()} */
(()=>{
const CSS=`
.okt{position:absolute;inset:0;font-family:var(--okt-serif);color:#f6ead8;pointer-events:none}
.okt>*{pointer-events:auto}
.okt .hd{position:absolute;left:0;right:0;top:8%;text-align:center;pointer-events:none}
.okt .hd .k{font:500 13px var(--okt-serif);letter-spacing:.42em;text-transform:uppercase;color:#d6b48a;margin-bottom:20px}
.okt .hd h2{margin:0;font:400 62px/1.32 var(--okt-script);color:#fff2dc;padding-bottom:4px}
.okt .hd p{margin:20px auto 0;max-width:720px;font:italic 23px/1.5 var(--okt-serif);color:#ead6b4}
/* words come out of the mist and go back into it */
.okt .mist{transition:opacity .9s ease,filter .9s ease}
.okt .mist.out{opacity:0;filter:blur(10px)}
.okt .say{position:absolute;left:50%;top:60%;translate:-50% 0;width:min(900px,86vw);text-align:center;pointer-events:none}
.okt .say span{display:block;font:400 42px/1.3 var(--okt-script);color:#fff2dc;text-shadow:0 0 18px rgba(255,150,60,.35)}
.okt .say span+span{font:italic 22px/1.5 var(--okt-serif);color:#ead6b4;margin-top:12px}
.okt .deck{position:absolute;left:50%;top:60%;width:0;height:0;perspective:1600px;pointer-events:none}
.okt .cd{position:absolute;left:0;top:0;transform-style:preserve-3d;transition:transform 1.2s cubic-bezier(.2,.8,.25,1),opacity 1s ease,filter 1s ease;opacity:0}
.okt .cd.in{opacity:1}.okt .cd.past{opacity:0;filter:blur(4px)}
.okt .nav{position:absolute;left:0;right:0;bottom:7%;display:flex;justify-content:center;align-items:center;gap:26px}
.okt .nav .back[hidden]{display:none}
.okt .dots[hidden]{display:none}
.okt .dots{display:flex;gap:10px}.okt .dots i{width:7px;height:7px;border-radius:50%;background:rgba(214,150,96,.35);transition:background .6s,box-shadow .6s}.okt .dots i.on{background:#ffd9a8;box-shadow:0 0 8px 2px rgba(255,150,60,.7)}
.okt .btn{height:50px;padding:0 30px;border-radius:25px;border:1px solid rgba(214,150,96,.55);background:none;color:#f2e0c2;font:italic 20px var(--okt-serif);cursor:pointer;transition:border-color .6s,box-shadow .9s,translate .3s}
.okt .btn:hover{border-color:rgba(255,206,150,.95);box-shadow:0 0 14px 2px rgba(255,150,60,.4)}
.okt .btn.main{border-color:rgba(255,206,150,.95);color:#ffe9c9;box-shadow:0 0 14px 3px rgba(255,150,60,.55),0 0 34px 8px rgba(255,120,40,.22)}
.okt .btn:active{translate:0 2px}
.okt .skip{position:absolute;right:3%;top:4%;font:italic 18px var(--okt-serif);color:#d6b48a;cursor:pointer;transition:color .5s}.okt .skip:hover{color:#ffd9a8}
/* 1 — the sheet */
.okt .sheet{width:440px;height:560px;margin:-280px 0 0 -220px;background:linear-gradient(170deg,#fbf6ec,#efe3cd);box-shadow:0 30px 60px rgba(0,0,0,.55);padding:56px 50px;box-sizing:border-box;color:#3b2a1c}
.okt .sheet .ttl{font:500 12px var(--okt-serif);letter-spacing:.3em;text-transform:uppercase;text-align:center;opacity:.7}
.okt .sheet .ln{height:9px;margin:13px 0;background:linear-gradient(90deg,rgba(59,42,28,.32),rgba(59,42,28,.22));border-radius:3px;transform-origin:0 50%;transform:scaleX(0);transition:transform .9s ease}
.okt .sheet .hw{font:400 34px/1.2 var(--okt-script);color:#8a5a36;margin:18px 0;opacity:0;transition:opacity 1s ease}
.okt .cd.play .sheet .ln,.okt .sheet.play .ln{transform:scaleX(1)}.okt .sheet.play .hw{opacity:1}
/* 2 — the record */
.okt .voice{width:0;height:0}
.okt .vin{position:absolute;left:-330px;top:-170px;width:340px;height:340px;border-radius:50%;background:repeating-radial-gradient(circle,#141010 0 1.4px,#211a16 1.4px 3px);box-shadow:0 0 0 2px rgba(255,200,140,.9),0 0 30px 6px rgba(255,150,60,.5),0 30px 60px rgba(0,0,0,.6)}
.okt .vin .sp{position:absolute;inset:0;border-radius:50%}
.okt .voice.play .vin .sp{animation:oktSpin 6s linear infinite}
@keyframes oktSpin{to{transform:rotate(360deg)}}
.okt .vin .lb{position:absolute;left:32%;top:32%;width:36%;height:36%;border-radius:50%;background:#3a2a1c center/cover;filter:sepia(.35);box-shadow:0 0 0 3px #2a201a}
.okt .vin .shine{position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 210deg,transparent 0 10%,rgba(255,235,210,.14) 14%,transparent 20% 60%,rgba(255,235,210,.09) 66%,transparent 72%)}
.okt .vin .hole{position:absolute;left:50%;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:#0b0705;box-shadow:inset 0 1px 2px rgba(0,0,0,.8),0 0 0 2px rgba(255,220,180,.25)}
.okt .voice .note{position:absolute;left:60px;top:-90px;width:300px;font:italic 21px/1.45 var(--okt-serif);color:#ead6b4}
.okt .voice .note b{display:block;font:400 34px/1.2 var(--okt-script);color:#ffe2bd;margin-bottom:10px;font-weight:400}
/* 3 — the question goes to the phone each week and the answer comes back */
.okt .week{width:0;height:0}
.okt .qcard{position:absolute;left:-360px;top:-200px;width:300px;height:380px;border-radius:16px;background:linear-gradient(170deg,#f7eedd,#e9d8b8);box-shadow:inset 0 0 0 10px rgba(255,255,255,.35),inset 0 0 0 11px rgba(120,84,50,.35),0 30px 60px rgba(0,0,0,.55);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:34px;box-sizing:border-box;text-align:center;color:#3b2a1c}
.okt .qcard b{font:500 12px var(--okt-serif);letter-spacing:.3em;text-transform:uppercase;opacity:.7;margin-bottom:22px}
.okt .qcard span{font:400 34px/1.15 var(--okt-script);color:#5a3a22}
.okt .phone{position:absolute;left:150px;top:-200px;width:180px;height:350px;border-radius:30px;background:#1b130d;box-shadow:0 0 0 2px rgba(214,150,96,.6),0 24px 50px rgba(0,0,0,.6);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;padding:18px;box-sizing:border-box}
.okt .phone em{font:500 10px var(--okt-serif);letter-spacing:.3em;text-transform:uppercase;color:#c99a6a;font-style:normal}
.okt .phone i{font:400 22px/1.15 var(--okt-script);color:#ffe2bd;text-align:center;font-style:normal;text-shadow:0 0 10px rgba(255,150,60,.6)}
.okt .week svg{position:absolute;left:-70px;top:-180px;width:230px;height:320px;overflow:visible}
.okt .week svg path{fill:none;stroke:#ffcf8e;stroke-width:2;stroke-linecap:round;stroke-dasharray:6 9;filter:drop-shadow(0 0 4px rgba(255,150,60,.8))}
.okt .week.play svg path{animation:oktDash 1.6s linear infinite}
.okt .week svg path.back{animation-direction:reverse!important}
@keyframes oktDash{to{stroke-dashoffset:-30}}
.okt .week svg text{font:italic 15px var(--okt-serif);fill:#e9c79a}
/* 4 — the envelope */
.okt .letter{width:0;height:0;translate:0 -60px}
.okt .letter .envl{position:absolute;left:-210px;top:-60px;width:420px;height:280px;filter:drop-shadow(0 26px 34px rgba(0,0,0,.55));z-index:2}
.okt .letter .envl>svg{position:absolute;inset:0;width:100%;height:100%}
.okt .letter .wax{position:absolute;left:50%;top:150px;width:86px;height:86px;margin:-44px 0 0 -43px;filter:drop-shadow(0 5px 7px rgba(0,0,0,.5))}
.okt .letter .wax img{width:100%;height:100%;display:block}
.okt .letter .wax b{position:absolute;inset:0;display:grid;place-items:center;font:400 40px/1 var(--okt-script);color:#5a0f0a;opacity:.85;padding-bottom:4px}
.okt .letter .lt{position:absolute;left:-180px;top:-40px;width:360px;height:250px;background:#fbf6ec;box-shadow:0 6px 14px rgba(0,0,0,.3);padding:26px 28px;box-sizing:border-box;font:400 25px/1.25 var(--okt-script);color:#4b3424;z-index:1;transition:transform 1.4s cubic-bezier(.2,.8,.3,1) .3s}
.okt .letter.play .lt{transform:translateY(-190px)}
.okt .letter .pol{position:absolute;width:150px;height:170px;background:#f6efe2;padding:10px 10px 30px;box-shadow:0 18px 30px rgba(0,0,0,.5)}
.okt .letter .pol img{width:100%;height:100%;object-fit:cover;filter:sepia(.3)}
.okt .letter .pol.under{left:120px;top:-20px;transform:rotate(9deg);z-index:0}
.okt .letter .pol.side{left:-370px;top:-40px;transform:rotate(-8deg);z-index:3}
/* 5 — the book: a real spread, the right page turns open once and rests */
.okt .book{width:0;height:0}
.okt .book .spread{position:absolute;left:-330px;top:-200px;width:660px;height:420px;perspective:1800px;transform:rotateX(14deg);transform-style:preserve-3d}
.okt .book .pg{position:absolute;top:0;width:330px;height:420px;box-sizing:border-box;background:linear-gradient(90deg,#efe5d2,#fbf6ec 12%,#fbf6ec);box-shadow:0 26px 50px rgba(0,0,0,.5)}
.okt .book .pg.l{left:0;background:linear-gradient(270deg,#e6d9c0,#fbf6ec 12%,#fbf6ec);padding:34px 30px}
.okt .book .pg.l img{width:100%;height:250px;object-fit:cover;filter:sepia(.25)}
.okt .book .pg.l i{display:block;margin-top:12px;font:italic 14px var(--okt-serif);color:#6a4c32;font-style:italic}
.okt .book .pg.r{left:330px;padding:44px 34px;color:#3b2a1c}
.okt .book .pg.r b{display:block;font:500 11px var(--okt-serif);letter-spacing:.3em;text-transform:uppercase;color:#8a6a48;text-align:center}
.okt .book .pg.r strong{display:block;margin:12px 0 16px;font:400 40px/1.15 var(--okt-script);color:#5a3a22;text-align:center;font-weight:400}
.okt .book .pg.r p{margin:0;height:8px;margin-bottom:12px;background:rgba(59,42,28,.25);border-radius:3px}
.okt .book .leaf{position:absolute;left:330px;top:0;width:330px;height:420px;transform-origin:0 50%;transform:rotateY(-178deg);transition:transform 2.2s cubic-bezier(.3,.6,.2,1) .4s;transform-style:preserve-3d}
.okt .book .leaf>div{position:absolute;inset:0;backface-visibility:hidden;background:linear-gradient(90deg,#efe5d2,#fbf6ec 14%);box-shadow:0 10px 30px rgba(0,0,0,.3)}
.okt .book .leaf>div.bk{transform:rotateY(180deg);background:linear-gradient(160deg,#5a2f16,#2e160a);box-shadow:inset 0 0 0 8px rgba(214,150,96,.35)}
.okt .book.play .leaf{transform:rotateY(0deg)}
.okt .book .leaf{opacity:1}.okt .book.play .leaf{opacity:0;transition:transform 2.2s cubic-bezier(.3,.6,.2,1) .4s,opacity .4s ease 2.5s}
.okt .book .glow{position:absolute;left:-360px;top:-230px;width:720px;height:480px;border-radius:50%;background:radial-gradient(ellipse,rgba(255,150,60,.22),transparent 65%);pointer-events:none}
`;
const injectCSS=()=>{if(document.getElementById('okt-css'))return;const st=document.createElement('style');st.id='okt-css';st.textContent=CSS;document.head.appendChild(st);};
function create(host,o={}){
  injectCSS();const K=o.K||null,PH=o.photos||'qa/demo-book/photos/';
  const SEAL=`<div class="wax"><img src="assets/postcard/wax-seal.webp" alt=""><b>О</b></div>`;
  const ARR=`<svg viewBox="0 0 230 320"><path d="M10 110 C 70 40, 160 40, 220 100"/><path class="back" d="M220 220 C 160 290, 70 290, 10 230"/><text x="68" y="44">каждую неделю</text><text x="70" y="300">ответ — в архив</text></svg>`;
  const S=[
    {k:'писать самим',w:'писать',h:'Пишите — книга сложится сама',p:'К каждой главе свои вопросы. Пишите как говорите — заголовки, пропись и заметки на полях появятся сами.',
     c:`<div class="cd sheet"><div class="ttl">глава 1 · начало</div><div class="ln" style="width:92%"></div><div class="ln" style="width:86%;transition-delay:.15s"></div><div class="ln" style="width:94%;transition-delay:.3s"></div><div class="hw">«Мама впервые увидела трамвай…»</div><div class="ln" style="width:90%;transition-delay:.45s"></div><div class="ln" style="width:70%;transition-delay:.6s"></div><div class="ln" style="width:88%;transition-delay:.75s"></div><div class="ln" style="width:80%;transition-delay:.9s"></div></div>`},
    {k:'голоса',w:'голоса',h:'Голоса родных',p:'Запишите ответ голосом — он станет пластинкой в архиве.',
     c:`<div class="cd voice"><div class="vin"><div class="sp"><div class="lb" style="background-image:url('${PH}grandma_porch.jpg')"></div></div><div class="shine"></div><i class="hole"></i></div>
       <div class="note"><b>И в книге тоже</b>Рядом с рассказом в книге будет код: наведёте на него телефон — и зазвучит голос.</div></div>`},
    {k:'вопрос недели',w:'вопрос',h:'Вся семья — вместе',p:'Раз в неделю вопрос уходит родным на телефон, а их ответ — голосом, словами или фото — возвращается в архив.',
     c:`<div class="cd week"><div class="qcard"><b>вопрос недели</b><span>Как вы познакомились с дедушкой?</span></div>${ARR}<div class="phone"><em>Нине Петровне</em><i>Ответить голосом</i></div></div>`},
    {k:'письма и фото',w:'архив',h:'Архив семьи',p:'Письма, фотографии и правки родных собираются в архиве — и одним касанием ложатся в книгу.',
     c:`<div class="cd letter"><div class="pol under"><img src="${PH}lake_two.jpg" alt=""></div><div class="lt">Дорогие мои, пишу вам из Тифлиса… Здесь уже весна, в садах цветут абрикосы.</div>
       <div class="envl"><svg viewBox="0 0 420 280" preserveAspectRatio="none"><defs><linearGradient id="oktEnv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f1e5ce"/><stop offset="1" stop-color="#dcc6a2"/></linearGradient><linearGradient id="oktEnvS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e3d2b2"/><stop offset="1" stop-color="#cdb48c"/></linearGradient></defs>
         <rect width="420" height="280" rx="5" fill="url(#oktEnv)"/><path d="M0 280 L210 150 L420 280Z" fill="url(#oktEnvS)"/><path d="M0 0 L190 160 Q210 176 230 160 L420 0 L420 6 L232 166 Q210 184 188 166 L0 6Z" fill="rgba(120,84,50,.18)"/>
         <path d="M0 280 L210 150 L420 280" fill="none" stroke="rgba(120,84,50,.28)" stroke-width="1.2"/></svg>${SEAL}</div>
       <div class="pol side"><img src="${PH}mother_child_bw.jpg" alt=""></div></div>`},
    {k:'книга',w:'книга',h:'Ваша книга',p:'Смотрите развороты, меняйте композиции — и, когда всё готово, заказывайте печать. История останется в семье.',
     c:`<div class="cd book"><div class="glow"></div><div class="spread"><div class="pg l"><img src="${PH}mother_child_bw.jpg" alt=""><i>Мама и я, Тифлис, 1956</i></div>
       <div class="pg r"><b>глава первая</b><strong>Детство</strong><p style="width:94%"></p><p style="width:88%"></p><p style="width:92%"></p><p style="width:70%"></p><p style="width:90%"></p><p style="width:84%"></p><p style="width:60%"></p></div>
       <div class="leaf"><div></div><div class="bk"></div></div></div></div>`}];
  const el=document.createElement('div');el.className='okt';
  el.style.setProperty('--okt-script',o.script||'"SignThatS","Sign That S",Georgia,serif');el.style.setProperty('--okt-serif',o.serif||'"CormorantCy","Iowan Old Style",Georgia,serif');
  el.innerHTML=`<div class="say mist out"><span>Здравствуйте! Я — Хранитель историй</span><span>Помогу собрать воспоминания вашей семьи в книгу. Покажу, что здесь можно делать.</span></div>
    <div class="hd mist out"><div class="k"></div><h2></h2><p></p></div><div class="deck">${S.map(s=>s.c).join('')}</div>
    <div class="nav"><button type="button" class="btn back" data-a="prev" hidden>Назад</button><span class="dots" hidden>${S.map(()=>'<i></i>').join('')}</span><button type="button" class="btn main" data-a="next">Показать</button></div>
    <span class="skip" data-a="skip">${o.skipLabel||'Пропустить'}</span>`;
  host.appendChild(el);
  const cards=[...el.querySelectorAll('.deck .cd')],hd=el.querySelector('.hd'),say=el.querySelector('.say');let i=-1,ts=[],alive=false;
  const later=(f,ms)=>ts.push(setTimeout(f,ms));
  const pose=(c,d)=>{c.classList.toggle('in',d===0);c.classList.toggle('past',d<0);c.classList.toggle('play',d===0);
    c.style.transform=d===0?'translate3d(0,0,0) rotateY(0deg) rotate(0deg)':d<0?'translate3d(-640px,40px,-300px) rotateY(38deg) rotate(-6deg)':'translate3d(680px,40px,-200px) rotateY(-42deg) rotate(8deg)';};
  cards.forEach(c=>pose(c,1));
  // where he stands: beside the card, never over it; he turns to face it and writes the step's word
  const SPOTS=[[-.5,-.3],[.52,-.32],[-.52,.14],[.52,.12],[-.5,-.34]];
  const goSpot=(k,fold)=>{if(!K)return;const sp=SPOTS[k%SPOTS.length];K.moveTo(sp[0],sp[1],.72,{fold});K.face(sp[0]<0?1:-1);K.lookAt(sp[0]<0?.9:-.9,-sp[1]*.4);
    const tryWrite=()=>{if(i!==k||!alive)return;const st=K.state;if(st.mode==='free'&&st.form>.92)K.write(S[k].w);else later(tryWrite,160);};later(tryWrite,fold?1300:650);};
  const show=k=>{const prev=i;i=Math.max(0,Math.min(S.length-1,k));hd.classList.add('out');
    later(()=>{hd.querySelector('.k').textContent=S[i].k;hd.querySelector('h2').textContent=S[i].h;hd.querySelector('p').textContent=S[i].p;hd.classList.remove('out');},prev<0?250:520);
    cards.forEach((c,j)=>pose(c,j-i));el.querySelectorAll('.dots i').forEach((d,j)=>d.classList.toggle('on',j<=i));
    el.querySelector('[data-a="next"]').textContent=i===S.length-1?(o.last||'Начать'):'Далее';el.querySelector('[data-a="prev"]').hidden=i<1;};
  const first=()=>{say.classList.add('out');el.querySelector('.dots').hidden=false;goSpot(0,true);later(()=>show(0),450);};
  const finish=r=>{alive=false;ts.forEach(clearTimeout);ts=[];hd.classList.add('out');say.classList.add('out');cards.forEach(c=>pose(c,1));o.onDone?.(r);};
  el.addEventListener('click',e=>{const a=e.target.closest('[data-a]')?.dataset.a;if(!a)return;
    if(a==='skip'){finish('skip');return;}
    if(a==='prev'){if(i>0){show(i-1);goSpot(i,false);}return;}
    if(a==='next'){if(i<0){first();return;}if(i>=S.length-1){finish('done');return;}show(i+1);goSpot(i,false);}});
  const key=e=>{if(!alive)return;if(e.key==='Escape')finish('skip');if(e.key==='ArrowRight'||e.key==='Enter')el.querySelector('[data-a="next"]').click();if(e.key==='ArrowLeft')el.querySelector('[data-a="prev"]').click();};
  addEventListener('keydown',key);
  return{el,
    // greeting:true — the Keeper greets first (he must be standing in the middle by then); false — straight to the first card
    start(){alive=true;i=-1;cards.forEach(c=>pose(c,1));hd.classList.add('out');el.querySelector('[data-a="prev"]').hidden=true;
      if(o.greeting!==false){el.querySelector('.dots').hidden=true;el.querySelector('[data-a="next"]').textContent='Показать';
        const wait=()=>{if(!alive||i>=0)return;if(!K||(K.state.form>.88&&['idle','free'].includes(K.state.mode))){say.classList.remove('out');K&&K.talk(4200);}else later(wait,160);};later(wait,600);}
      else first();},
    stop(){alive=false;ts.forEach(clearTimeout);ts=[];},
    destroy(){this.stop();removeEventListener('keydown',key);el.remove();}};
}
// three.js and the Keeper, loaded once for everyone who needs him (scripts already on the page are not loaded again)
const ME=(document.currentScript&&document.currentScript.src)||'';const VER=(ME.match(/\?v=[^&]+/)||[''])[0];const BASE=ME?ME.replace(/assets\/keeper\/tour\.js.*$/,''):'';
const V=BASE+'assets/vendor/three/',LIBS=[V+'three.min.js',V+'CopyShader.js',V+'LuminosityHighPassShader.js',V+'EffectComposer.js',V+'RenderPass.js',V+'ShaderPass.js',V+'UnrealBloomPass.js',BASE+'assets/keeper/keeper3d.js'+VER];
let libs=null;
const loadKeeper=()=>libs||(libs=window.OcherkiKeeper3D?Promise.resolve():LIBS.reduce((p,src)=>p.then(()=>{
  if(src.includes('three.min')&&window.THREE)return null;if(src.includes('keeper3d')&&window.OcherkiKeeper3D)return null;
  const nm=src.split('/').pop().split('?')[0];if(!src.includes('three.min')&&!src.includes('keeper3d')&&[...document.scripts].some(sc=>sc.src&&sc.src.includes(nm)))return null;
  return new Promise((ok,no)=>{const sc=document.createElement('script');sc.src=src;sc.onload=ok;sc.onerror=no;document.head.appendChild(sc);});}),Promise.resolve()).catch(e=>{libs=null;throw e;}));
// warm him up while nothing else happens, so the first call never shows an empty dark screen
const warm=()=>{const go=()=>loadKeeper().catch(()=>{});(window.requestIdleCallback||setTimeout)(go,{timeout:4000});};
window.OcherkiTour={create,loadKeeper,warm};
})();
