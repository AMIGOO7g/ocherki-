// «Архив семьи» — the rooms behind the things (v248). A section pressed on the bar (or its thing on the desk) takes the things
// away and lays its room on the desk; the same section pressed again brings the things back. Everything here is shown with
// an example family (marked «пример»): what needs the server (a real recording, a letter or an answer coming from a relative,
// a question sent, corrections from relatives) moves and answers the hand, but keeps nothing yet.
//  · Голоса — the record of the chosen voice (it turns while it plays, its shine stands still), its name, the sound's line
//    filling as it plays, the time; «Все записи» — the records in rows, a press puts one on.
//  · Запись — the microphone, the sound's line, the time; «Начать запись», pause, stop.
//  · Письма — the sealed envelope, from whom and when, ‹ › through the letters; «Открыть письмо» — the letter in its hand,
//    «Оригинал / Расшифровка», «В книгу»; «Все письма» — the envelopes in rows.
//  · Правки — the feather, from whom and which chapter, how many; «Просмотреть» — «Было / Предлагается» side by side,
//    ‹ правка N из M ›, «Отклонить / Принять».
//  · Вопрос недели — the paper plane, the question (‹ › through the questions), for whom, the day; «Отправить вопрос» —
//    the plane flies off, «Вопрос отправлен».
(()=>{const A='assets/',esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const IC={play:'<path d="M8 5l11 7-11 7z"/>',pause:'<path d="M9 5v14M15 5v14"/>',stop:'<rect x="6.5" y="6.5" width="11" height="11" rx="1.5"/>',
    prev:'<path d="M15 5l-7 7 7 7"/>',next:'<path d="M9 5l7 7-7 7"/>',list:'<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1"/><circle cx="4.5" cy="12" r="1"/><circle cx="4.5" cy="18" r="1"/>',
    disc:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/>',book:'<path d="M3 5.5c3-1 6-1 9 1 3-2 6-2 9-1V19c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 6.5V20"/>',
    send:'<path d="M3 11.5L21 4l-7 17-3.2-6.8z"/><path d="M10.8 14.2L21 4"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',ok:'<path d="M5 12.5l4.5 4.5L19 7.5"/>',
    user:'<circle cx="12" cy="8" r="3.6"/><path d="M5 20c1.2-3.6 3.8-5.4 7-5.4s5.8 1.8 7 5.4"/>',cal:'<rect x="4" y="5.5" width="16" height="14.5" rx="1.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
    doc:'<path d="M6 3h9l3 3v15H6z"/><path d="M9 11h6M9 15h6"/>',back:'<path d="M14 6l-6 6 6 6"/>'};
  const I=k=>`<svg viewBox="0 0 24 24" aria-hidden="true">${IC[k]}</svg>`;
  // ——— the example family
  const VOICES=[{t:'Бабушка о детстве',who:'Бабушка Анна',d:'14 марта 1958',len:754},{t:'Как познакомились',who:'Дедушка Иван',d:'7 июня 1956',len:512},{t:'Колыбельная',who:'Мама',d:'21 октября 1963',len:188},
    {t:'Письмо из Тифлиса',who:'Нина',d:'12 мая 1958',len:401},{t:'Праздник урожая',who:'Тётя Ольга',d:'3 сентября 1960',len:633},{t:'Из поездки в Тифлис',who:'Дядя Коля',d:'18 августа 1955',len:290}];
  const LETTERS=[{from:'Нины',who:'Нина',d:'12 мая 1958',city:'Москва',
      text:'Дорогая мамочка!\nНаконец добралась до города и спешу тебе написать. Дорога была долгой, но прошла хорошо. Живу у тёти Веры — она встретила меня очень тепло, как всегда. Город мне пока кажется большим и немного шумным, но я потихоньку привыкаю.\nДумаю о нашем саде и о том, как сейчас, наверное, цветут яблони. Береги себя, не переутомляйся. Скоро напишу ещё и пришлю тебе фотографии.\nТвоя Нина.'},
    {from:'мамы',who:'Мама',d:'3 августа 1955',city:'Карс',text:'Здравствуй, сынок!\nУ нас всё по-старому: сад отцвёл, яблоки в этом году мелкие, но сладкие. Отец чинит крышу сарая и ворчит, что без тебя дело идёт вдвое дольше. Пиши чаще — каждое твоё письмо мы читаем вслух по два раза.\nЦелую. Мама.'},
    {from:'папы',who:'Папа',d:'19 июня 1957',city:'Тифлис',text:'Дорогие мои!\nСлужба идёт своим чередом. Вчера получил вашу посылку — варенье доехало целым, только одна банка треснула, но её мы съели первой. Скучаю по вашим голосам.\nВаш папа.'},
    {from:'бабушки',who:'Бабушка',d:'8 марта 1956',city:'Карс',text:'Милая моя внучка!\nПоздравляю тебя с праздником. Будь доброй и весёлой, слушайся маму и не забывай нас. Посылаю тебе платок — его вышивала ещё моя мама.\nТвоя бабушка.'}];
  const FIXES=[{was:'Мы переехали в Москву в <s>1962</s> году. Первое время жили у родственников, пока родители искали квартиру.',now:'Мы переехали в Москву в <mark>1963</mark> году, в начале осени. Сначала остановились у тёти Веры на Арбате, а затем родители нашли для нас квартиру на Садовом кольце.'},
    {was:'Дедушка работал на <s>заводе</s> всю жизнь.',now:'Дедушка работал на <mark>железной дороге</mark> всю жизнь — сначала обходчиком, потом мастером.'},
    {was:'Бабушку звали <s>Анной Петровной</s>.',now:'Бабушку звали <mark>Анной Павловной</mark>.'},
    {was:'Дом стоял у <s>реки</s>.',now:'Дом стоял у <mark>старой пекарни</mark>, на углу двух улиц.'}];
  const QUESTIONS=['Какой момент из детства запомнился вам больше всего?','Какую песню пели у вас дома?','Кто в семье лучше всех рассказывал истории?','Какое блюдо напоминает вам о доме?','Что вы помните о своём первом дне в школе?'];
  const PEOPLE=['Нины Петровны','бабушки Анны','дедушки Ивана','мамы','тёти Ольги'];
  const DAYS=['24 ноября, пн','25 ноября, вт','26 ноября, ср','27 ноября, чт','28 ноября, пт'];
  const plural=(n,a,b,c)=>{const m=n%10,h=n%100;return m===1&&h!==11?a:m>=2&&m<=4&&(h<12||h>14)?b:c;};
  const mmss=s=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(Math.floor(s%60)).padStart(2,'0')}`;
  // the sound's line: bars of a voice (the same for one record), the played part in brass
  const wave=(n,seed)=>{let x=seed||7,h='';for(let k=0;k<n;k++){x=(x*9301+49297)%233280;const r=x/233280,env=.35+.65*Math.sin(Math.PI*k/n);h+=`<i style="--h:${(8+r*64*env).toFixed(1)}%"></i>`;}return `<div class="rm-wave">${h}</div>`;};
  const disc=(cls,lab)=>`<div class="rm-disc ${cls||''}"><div class="rm-spin"><img src="${A}keeper/desk-vinyl-disc.webp" alt="" draggable="false"><img class="rm-label" src="${A}archive/label.webp" alt="" draggable="false">${lab?`<b class="rm-lab">${esc(lab)}</b>`:''}</div><img class="rm-shine" src="${A}keeper/desk-vinyl-shine.webp" alt="" draggable="false"></div>`;
  const btn=(cls,ic,t)=>`<button type="button" class="rm-btn ${cls}">${ic?I(ic):''}<span>${t}</span></button>`;
  const round=(cls,ic,lab)=>`<button type="button" class="rm-round ${cls}" aria-label="${lab}">${I(ic)}</button>`;
  const head=(t,sub,side)=>`<header class="rm-h"><div class="rm-t"><i class="ar-orn"></i><h2>${t}</h2><i class="ar-orn r"></i></div>${sub?`<p>${sub}</p>`:''}${side||''}</header>`;
  const note='<i class="rm-note">пример — заработает, когда подключим сервер</i>';

  let room=null,board=null,scene=null,st={};
  const toast=t=>{const tip=document.querySelector('.oc-soon-tip')||Object.assign(document.createElement('div'),{className:'oc-soon-tip'});if(!tip.parentNode)document.body.appendChild(tip);
    tip.textContent=t;tip.style.left='50%';tip.style.top='78%';tip.classList.add('on');clearTimeout(tip._t);tip._t=setTimeout(()=>tip.classList.remove('on'),1700);};
  const views={
    voices(){const v=VOICES[st.vi||0];return head('Голоса','записи родных',btn('rm-side','list',`Все записи (${VOICES.length})`))+
      `<div class="rm-c rm-voice">${disc('big')}<h3>${esc(v.t)}</h3><p class="rm-sub">${esc(v.who)} · ${esc(v.d)}</p>${wave(64,(st.vi||0)*31+5)}<p class="rm-time"><span class="rm-cur">${mmss(st.pos||0)}</span> / ${mmss(v.len)}</p>
       <div class="rm-row">${round('rm-prev','prev','Предыдущая')}${btn('rm-main rm-play',st.playing?'pause':'play',st.playing?'Пауза':'Слушать запись')}${round('rm-next','next','Следующая')}</div>${note}</div>`;},
    voicesAll(){return head('Все записи','аудиоархив семьи',btn('rm-side rm-back','back','Назад'))+`<div class="rm-c rm-grid">${VOICES.map((v,k)=>`<button type="button" class="rm-cell" data-i="${k}">${disc('small')}<b>${esc(v.who)}</b><span>${esc(v.d)}</span></button>`).join('')}</div>`;},
    // v251: «Запись» is a scene of its own — the dark room, the window's light on the wall, the microphone lit from the front
    record(){const bars=Array.from({length:64},(_,k)=>{const e=Math.pow(Math.sin(Math.PI*(k+.5)/64),1.4);return `<i data-e="${e.toFixed(3)}" style="--h:${Math.max(4,(.1+.12*Math.abs(Math.sin(k*1.3)))*e*100).toFixed(0)}%;--o:${(.35+.65*e).toFixed(2)}"></i>`;}).join('');
      return `<div class="rc-ttl"><i></i><h2>Запись</h2><i class="r"></i></div>
       <div class="rc-mic" data-own><div class="rc-in" style="--mm:url('${new URL(A+'archive/studio-mic.webp',location.href).href}')"><img src="${A}archive/studio-mic.webp" alt="" draggable="false"><b class="rc-front"></b><b class="rc-rim"></b><b class="rc-spec"></b></div></div>
       <div class="rm-c rc-low"><div class="rc-wave">${bars}</div><p class="rc-time"><span class="rm-cur">${mmss(st.rec||0)}</span></p>
       <div class="rm-row">${round('rm-pause','pause','Пауза')}${btn('rm-main rm-go','','<em class="rm-dot"></em><b class="rc-lab">Начать запись</b>')}${round('rm-stop','stop','Остановить')}</div>${note}</div>`;},
    letters(){const l=LETTERS[st.li||0];return head('Письма','семейная переписка',btn('rm-side','list',`Все письма (${LETTERS.length})`))+
      `<div class="rm-c rm-letter"><div class="rm-env"><img src="${A}archive/envelope.webp" alt="" draggable="false"></div><h3>Письмо от ${esc(l.from)} <i>·</i> ${esc(l.d)}</h3>
       <div class="rm-row">${round('rm-prev','prev','Предыдущее')}${btn('rm-main rm-open','book','Открыть письмо')}${round('rm-next','next','Следующее')}</div>${note}</div>`;},
    letter(){const l=LETTERS[st.li||0],raw=st.typed;return head('Письма','семейная переписка',btn('rm-side rm-back','back','К конвертам'))+
      `<div class="rm-c rm-read"><div class="rm-paper${raw?' typed':''}"><div class="rm-stamp"><b>${esc(l.city.toUpperCase())}</b><span>${esc(l.d)}</span></div>${l.text.split('\n').map(p=>`<p>${esc(p)}</p>`).join('')}</div>
       <div class="rm-row rm-split"><div class="rm-seg"><button type="button" data-v="0" class="${raw?'':'on'}">Оригинал</button><button type="button" data-v="1" class="${raw?'on':''}">Расшифровка</button></div>${btn('rm-tobook','book','В книгу')}</div></div>`;},
    lettersAll(){return head('Все письма','семейная переписка',btn('rm-side rm-back','back','Назад'))+`<div class="rm-c rm-grid env">${LETTERS.map((l,k)=>`<button type="button" class="rm-cell" data-i="${k}"><img src="${A}archive/envelope.webp" alt="" draggable="false"><b>${esc(l.who)}</b><span>${esc(l.d)}</span></button>`).join('')}</div>`;},
    fixes(){return head('Правки','что предлагают исправить родные',btn('rm-side','list',`Все правки (${FIXES.length})`))+`<div class="rm-c rm-fix"><img class="rm-feather" src="${A}archive/feather.webp" alt="" draggable="false">
       <h3><span class="rm-who">${I('user')}</span>Правки от Натальи <i>·</i> Глава 3</h3><p class="rm-caps">предложено ${FIXES.length} ${plural(FIXES.length,'изменение','изменения','изменений')}</p>
       <div class="rm-row">${btn('rm-main rm-view','doc','Просмотреть правки')}</div>${note}</div>`;},
    fix(){const k=st.fi||0,f=FIXES[k];return head('Наталья · Глава 3','',btn('rm-side rm-back','back','Назад'))+`<div class="rm-c rm-cmp">
       <div class="rm-cards"><div class="rm-card"><b class="rm-tab">Было</b><p>${f.was}</p></div><div class="rm-card"><b class="rm-tab">Предлагается</b><p>${f.now}</p></div></div>
       <div class="rm-row">${round('rm-prev','prev','Предыдущая')}<span class="rm-count">Правка ${k+1} из ${FIXES.length}</span>${round('rm-next','next','Следующая')}</div>
       <div class="rm-row">${btn('rm-no','x','Отклонить')}${btn('rm-main rm-yes','ok','Принять')}</div>${note}</div>`;},
    question(){if(st.sent)return head('Вопрос недели','')+`<div class="rm-c rm-sent"><img class="rm-plane gone" src="${A}archive/plane.webp" alt="" draggable="false"><div class="rm-check">${I('ok')}</div>
       <h3>Вопрос отправлен!</h3><p class="rm-sub">для ${esc(PEOPLE[st.pi||0])}, ${esc(DAYS[st.di||0])}</p><div class="rm-row">${btn('rm-main rm-again','send','Задать ещё')}</div>${note}</div>`;
      return head('Вопрос недели','один вопрос — ответы всей семьи')+`<div class="rm-c rm-q"><img class="rm-plane" src="${A}archive/plane.webp" alt="" draggable="false">
       <div class="rm-row rm-qrow">${round('rm-prev','prev','Предыдущий')}<h3>${esc(QUESTIONS[st.qi||0])}</h3>${round('rm-next','next','Следующий')}</div>
       <div class="rm-row">${btn('rm-pick rm-who2','user','Для '+esc(PEOPLE[st.pi||0]))}${btn('rm-pick rm-day','cal',esc(DAYS[st.di||0]))}</div>
       <div class="rm-row">${btn('rm-main rm-send','send','Отправить вопрос')}</div>${note}</div>`;}};
  function show(v,instant){if(!room)return;st.view=v;const html=views[v]();
    if(instant){room.innerHTML=html;after();return;}
    const old=room.firstElementChild?[...room.children]:[];old.forEach(el=>el.animate([{opacity:1},{opacity:0}],{duration:200,fill:'forwards'}));
    setTimeout(()=>{room.innerHTML=html;after();[...room.children].filter(el=>!el.hasAttribute('data-own')).forEach((el,i)=>el.animate([{opacity:0,translate:'0 10px'},{opacity:1,translate:'0 0'}],{duration:420,delay:i*60,easing:'cubic-bezier(.2,.75,.25,1)',fill:'backwards'}));},old.length?190:0);}
  // after a room is drawn: its moving parts
  let tick=0;
  function after(){cancelAnimationFrame(tick);const v=st.view;
    if(v==='voices'){const sp=room.querySelector('.rm-spin'),bars=[...room.querySelectorAll('.rm-wave i')],len=VOICES[st.vi||0].len;let a=st.ang||0,last=0,spd=st.playing?1:0;
      const step=t=>{const dt=last?Math.min(50,t-last):16;last=t;spd+=((st.playing?1:0)-spd)*Math.min(1,dt/350);a=(a+spd*dt*360/1800)%360;st.ang=a;if(sp)sp.style.transform=`rotate(${a.toFixed(2)}deg)`;
        if(st.playing){st.pos=Math.min(len,(st.pos||0)+dt/1000);if(st.pos>=len){st.playing=false;st.pos=0;show('voices',true);return;}}
        const k=Math.floor(bars.length*(st.pos||0)/len);bars.forEach((b,i)=>b.classList.toggle('on',i<k));const c=room.querySelector('.rm-cur');if(c)c.textContent=mmss(st.pos||0);
        if(st.playing||spd>.002)tick=requestAnimationFrame(step);};tick=requestAnimationFrame(step);}
    if(v==='record'){recUI();const bars=[...room.querySelectorAll('.rc-wave i')];let last=0,acc=0;
      const step=t=>{const dt=last?Math.min(1000,t-last):16;last=t;if(st.recording){st.rec=(st.rec||0)+dt/1000;acc+=dt;
          // the voice's line: new heights every few frames, within the line's swell (louder in the middle)
          if(acc>90){acc=0;bars.forEach(b=>{const e=+b.dataset.e;b.style.setProperty('--h',Math.max(4,(.16+Math.random()*.84)*e*100).toFixed(0)+'%');});}}
        const c=room.querySelector('.rm-cur');if(c)c.textContent=mmss(st.rec||0);if(st.recording)tick=requestAnimationFrame(step);};if(st.recording)tick=requestAnimationFrame(step);}}
  // the record room's state shown in place (no redraw: the microphone and the light stay as they are)
  function recUI(){const r=room?.querySelector('.rc-low');if(!r)return;room.classList.toggle('rc-on',!!st.recording);room.classList.toggle('rc-paused',!st.recording&&(st.rec||0)>0);
    const cur=r.querySelector('.rm-cur');if(cur)cur.textContent=mmss(st.rec||0);const lab=r.querySelector('.rc-lab');if(lab)lab.textContent=st.recording?'Идёт запись…':(st.rec||0)>0?'Продолжить запись':'Начать запись';
    if(!st.recording)r.querySelectorAll('.rc-wave i').forEach((b,k,all)=>{const e=+b.dataset.e;b.style.setProperty('--h',Math.max(4,(.1+.12*Math.abs(Math.sin(k*1.3)))*e*100).toFixed(0)+'%');});}
  // ——— the presses in the rooms
  function press(e){const b=e.target.closest('button');if(!b||!room?.contains(b))return;const v=st.view,c=b.classList;
    const cyc=(key,n,d)=>{st[key]=((st[key]||0)+d+n)%n;};
    if(v==='voices'){if(c.contains('rm-side'))return show('voicesAll');if(c.contains('rm-play')){st.playing=!st.playing;b.innerHTML=`${I(st.playing?'pause':'play')}<span>${st.playing?'Пауза':'Слушать запись'}</span>`;after();return;}
      if(c.contains('rm-prev')||c.contains('rm-next')){cyc('vi',VOICES.length,c.contains('rm-next')?1:-1);st.pos=0;st.playing=false;return show('voices');}}
    if(v==='voicesAll'){if(c.contains('rm-back'))return show('voices');if(c.contains('rm-cell')){st.vi=+b.dataset.i;st.pos=0;st.playing=false;return show('voices');}}
    if(v==='record'){if(c.contains('rm-go')){st.recording=!st.recording;return after();}if(c.contains('rm-pause')){if(st.recording){st.recording=false;after();}return;}
      if(c.contains('rm-stop')){const had=st.rec>0;st.recording=false;st.rec=0;after();if(had)toast('запись сохранится, когда подключим сервер');return;}}
    if(v==='letters'){if(c.contains('rm-side'))return show('lettersAll');if(c.contains('rm-open'))return openLetter();
      if(c.contains('rm-prev')||c.contains('rm-next')){cyc('li',LETTERS.length,c.contains('rm-next')?1:-1);return show('letters');}}
    if(v==='letter'){if(c.contains('rm-back'))return show('letters');if(b.dataset.v!=null){st.typed=b.dataset.v==='1';return show('letter',true);}if(c.contains('rm-tobook'))return toast('письмо ляжет в книгу — следующим шагом');}
    if(v==='lettersAll'){if(c.contains('rm-back'))return show('letters');if(c.contains('rm-cell')){st.li=+b.dataset.i;return show('letters');}}
    if(v==='fixes'){if(c.contains('rm-view')||c.contains('rm-side')){st.fi=0;return show('fix');}}
    if(v==='fix'){if(c.contains('rm-back'))return show('fixes');if(c.contains('rm-prev')||c.contains('rm-next')){cyc('fi',FIXES.length,c.contains('rm-next')?1:-1);return show('fix');}
      if(c.contains('rm-yes')||c.contains('rm-no')){const card=room.querySelector(c.contains('rm-yes')?'.rm-card:last-child':'.rm-card:first-child');card?.classList.add(c.contains('rm-yes')?'taken':'dropped');
        setTimeout(()=>{if((st.fi||0)<FIXES.length-1){st.fi++;show('fix');}else{toast('все правки просмотрены');show('fixes');}},520);return;}}
    if(v==='question'){if(st.sent){if(c.contains('rm-again')){st.sent=false;return show('question');}return;}
      if(c.contains('rm-prev')||c.contains('rm-next')){cyc('qi',QUESTIONS.length,c.contains('rm-next')?1:-1);return show('question',true);}
      if(c.contains('rm-who2')){cyc('pi',PEOPLE.length,1);return show('question',true);}if(c.contains('rm-day')){cyc('di',DAYS.length,1);return show('question',true);}
      if(c.contains('rm-send'))return fly();}}
  // the letter: the envelope opens (its picture rises and goes), the letter comes up in its place
  function openLetter(){const env=room.querySelector('.rm-env');if(!env)return show('letter');env.animate([{transform:'none',opacity:1},{transform:'translateY(-30px) scale(.96)',opacity:0}],{duration:380,easing:'ease-in',fill:'forwards'});setTimeout(()=>show('letter'),260);}
  // the question: the plane takes off up to the right and is gone, a thin trail behind it
  function fly(){const pl=room.querySelector('.rm-plane');if(!pl){st.sent=true;return show('question');}
    pl.animate([{transform:'translate(0,0) rotate(0deg)',opacity:1},{transform:'translate(18vw,-14vh) rotate(-8deg) scale(.7)',opacity:1,offset:.7},{transform:'translate(34vw,-26vh) rotate(-12deg) scale(.4)',opacity:0}],{duration:1100,easing:'cubic-bezier(.5,0,.6,1)',fill:'forwards'});
    setTimeout(()=>{st.sent=true;show('question');},900);}
  // ——— a section chosen (archive.js): the things step aside and its room comes; none — the things come back
  addEventListener('ar-room',e=>{const k=e.detail?.k;board=e.detail?.board;if(!board)return;
    if(!room){room=document.createElement('div');room.className='rm';board.appendChild(room);room.addEventListener('click',press);}
    // v251: the record's scene — dark, the window's light on the wall; it comes and goes slowly under the room
    if(!scene){scene=document.createElement('div');scene.className='rc-scene';scene.setAttribute('aria-hidden','true');
      scene.innerHTML='<b class="rc-wall"></b><b class="rc-shaft"></b><b class="rc-win"><i></i><i></i><i></i><i></i></b><b class="rc-halo"></b><b class="rc-dark"></b><b class="rc-vign"></b>';board.insertBefore(scene,room);}
    {const cine=k==='record';scene.classList.toggle('on',cine);room.classList.toggle('rc',cine);document.documentElement.classList.toggle('ar-cine',cine);}
    const things=board.querySelectorAll('.ar-h,.ar-row');
    if(!k||k==='x'||!views[k]){cancelAnimationFrame(tick);st.playing=false;st.recording=false;room.classList.remove('on');things.forEach(el=>el.classList.remove('ar-away'));setTimeout(()=>{if(!room.classList.contains('on'))room.innerHTML='';},400);return;}
    things.forEach(el=>el.classList.add('ar-away'));room.classList.add('on');show(k);});
  // the archive gone: the recording stops and the record's scene goes with it
  new MutationObserver(()=>{if(document.documentElement.classList.contains('ar-on'))return;if(st.recording){st.recording=false;cancelAnimationFrame(tick);recUI();}
    document.documentElement.classList.remove('ar-cine');}).observe(document.documentElement,{attributes:true,attributeFilter:['class']});
})();
