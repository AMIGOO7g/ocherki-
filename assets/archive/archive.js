/* Архив семьи — the desk, its six sections, and a page for each thing (left: the thing itself; right: what it is).
   OcherkiArchive.open(where) — where: 'desk' | 'voices' | 'photos' | 'letters' | 'texts' | 'week' | 'edits' | 'record' | 'send'
   The keys of the constructor (the «Архив семьи» pill and the six archive keys) open it; ✕ or Esc goes back step by step.
   Demo things stand in for what the family has not sent yet; a voice recorded here is real (kept in this browser). */
(()=>{
const ME=(document.currentScript&&document.currentScript.src)||'';const BASE=ME?ME.replace(/assets\/archive\/archive\.js.*$/,''):'';
const VER=(ME.match(/\?v=[^&]+/)||[''])[0];
const A=BASE+'assets/',P=BASE+'qa/demo-book/photos/';
const esc=v=>String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const EXTRA=`
.oar{position:fixed;inset:0;z-index:2147483646;color:#f3e3c8;font-family:"Iowan Old Style",Georgia,serif;opacity:0;transition:opacity .6s ease}
.oar.in{opacity:1}
.oar *{box-sizing:border-box}
.oar .x,.oar .crumb{cursor:pointer}
.oar .top .crumb:hover{color:#ffe9c9}
.oar header{position:fixed;left:0;right:0;top:20px;text-align:center;z-index:5;pointer-events:none}
.oar header h1{margin:0;font:400 58px/1.1 "SignThatS",Georgia,serif;color:#ffe2bd;text-shadow:0 0 18px rgba(255,150,60,.45)}
.oar header p{margin:2px 0 0;font:italic 19px Georgia,serif;color:#e2c9a2}
.oar .desk{position:fixed;inset:150px 6vw 46px;z-index:3;display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,1fr);gap:20px 30px}
.oar .sec .obj>img{max-height:100%;max-width:80%;filter:drop-shadow(0 18px 24px rgba(0,0,0,.6))}
.oar .spread{position:fixed;inset:150px 5vw 40px;z-index:4;opacity:1;pointer-events:auto;display:flex;flex-wrap:wrap;align-content:flex-start;justify-content:center;gap:34px 40px;overflow:auto;padding:20px}
.oar .it{opacity:1;transform:rotate(var(--r,0deg));animation:oa-up .7s cubic-bezier(.2,.8,.3,1) var(--d,0s) both}
.oar .it .vis .fr{border-width:22px 18px}
.oar .it .vis .fr .pic{height:150px;max-width:220px;animation:none}
.oar .it .vis .fr::before,.oar .it .vis .fr::after{display:none}
.oar .sp-acts{position:fixed;left:0;right:0;bottom:22px;display:flex;justify-content:center;gap:12px;z-index:6}
.oar .empty{font:italic 20px Georgia,serif;color:#e2c9a2;text-align:center;margin-top:60px}
/* one reel, large, from above: the reel and its tape turn, its shine stays where the lamp is */
.oar .reel1{position:relative;width:min(70vh,42vw);aspect-ratio:1;filter:drop-shadow(0 30px 44px rgba(0,0,0,.65))}
.oar .reel1 img{position:absolute;inset:0;width:100%;height:100%}
.oar .reel1 .t{animation:oa-sp 3.4s linear infinite;animation-play-state:paused}
.oar .reel1.on .t{animation-play-state:running}
/* the record key in the manner of the hanging keys: dark, a fine copper ring, the red light inside */
.oar .recbtn{width:84px;height:84px;border-radius:50%;border:1px solid rgba(232,197,142,.65);background:radial-gradient(circle at 45% 35%,#3a281a,#170e08 70%);box-shadow:inset 0 0 0 5px rgba(0,0,0,.35),0 8px 18px rgba(0,0,0,.55),0 0 16px rgba(240,90,60,.25);display:grid;place-items:center;cursor:pointer;flex:none;transition:box-shadow .5s}
.oar .recbtn:hover{box-shadow:inset 0 0 0 5px rgba(0,0,0,.35),0 8px 18px rgba(0,0,0,.55),0 0 22px rgba(240,90,60,.55)}
.oar .recbtn::after{content:"";width:22px;height:22px;border-radius:50%;background:radial-gradient(circle at 40% 35%,#ff8a6a,#d63a24);box-shadow:0 0 12px 2px rgba(255,80,50,.7)}
.oar .recbtn.stop{border-color:#e46a4a;animation:oa-pulse-r 1.6s ease-in-out infinite}
.oar .recbtn.stop::after{border-radius:4px;width:22px;height:22px}
@keyframes oa-pulse-r{50%{box-shadow:inset 0 0 0 5px rgba(0,0,0,.35),0 0 0 8px rgba(240,90,60,.1),0 0 28px rgba(240,90,60,.6)}}
/* the phone's screen sits inside its golden edge */
.oar .obj.phn{align-items:flex-start}
.oar .ph .fri{position:absolute;inset:0;width:100%;height:100%}
.oar .phone .scr{left:4.2%;top:2.1%;width:90.6%;height:95.6%}
.oar audio{display:none}
`;
const inject=()=>{if(document.getElementById('oar-css'))return;
  const l=document.createElement('link');l.id='oar-css';l.rel='stylesheet';l.href=BASE+'assets/archive/archive.css'+VER;document.head.appendChild(l);
  const s=document.createElement('style');s.id='oar-css2';s.textContent=EXTRA;document.head.appendChild(s);
  if(!document.fonts||![...document.fonts].some(f=>/SignThatS/.test(f.family))){const f=document.createElement('style');f.textContent=`@font-face{font-family:"SignThatS";src:url("${A}fonts/SignThatS.otf") format("opentype");font-display:swap}`;document.head.appendChild(f);}};

// ---------- pieces ----------
const wf=(n,played,live,sm,seed=0)=>{let h=[];for(let k=0;k<n;k++){const e=.35+.65*Math.pow(Math.sin(Math.PI*k/n),.6);const v=e*(.35+.65*Math.abs(Math.sin((k+seed)*.53)*Math.cos((k+seed)*.21)+.25*Math.sin((k+seed)*1.7)));h.push(Math.max(.08,Math.min(1,v)));}
  const ph=Math.round(n*played);return `<div class="wf${live?' live':''}${sm?' sm':''}">${h.map((v,k)=>`<i class="${k<ph?'p':''}${Math.abs(k-ph)<6&&!live?' near':''}" style="--h:${v.toFixed(2)};--dl:-${((k*53%17)/10).toFixed(2)}s;--d:${(.35+(k*37%9)/18).toFixed(2)}s"></i>`).join('')}${live?'':`<span class="head" style="left:${(played*100).toFixed(1)}%"></span>`}</div>`;};
const keys=a=>`<div class="keys">${a.map((t,i)=>{const[x,act]=Array.isArray(t)?t:[t];return `<button class="k${i?'':' main'}" ${act?`data-act="${act}"`:''}>${esc(x)}</button>`;}).join('')}</div>`;
const dl=r=>`<dl>${r.filter(x=>x[1]).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`;
const disc=(f,play,src)=>`<div class="bigdisc${play?' playing':''}"><div class="spin"><img src="${A}keeper/desk-vinyl-disc.webp" alt=""><i class="lab" style="background-image:url('${src||P+f+'.jpg'}')"></i></div><img class="sh" src="${A}keeper/desk-vinyl-shine.webp" alt=""></div>`;
const reel=on=>`<div class="reel1${on?' on':''}"><img class="t" src="${A}archive/reel.webp" alt=""><img src="${A}archive/reel-shine.webp" alt=""></div>`;
const frame=(src,land)=>`<div class="fr${land?' land':''}"><img class="pic" src="${src}" alt=""></div>`;
const fmt=s=>{s=Math.max(0,Math.round(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};

// ---------- the things (demo until the family sends its own) ----------
const D={
 photos:[['grandma_porch','Бабушка на крыльце','Тифлис, 1956','Тифлис, Плехановский','Нина Петровна, Серёжа','тётя Варя, 3 мая','«Это наше крыльцо на Плехановском. Бабушка всегда сидела здесь по вечерам, а мы с Серёжей бегали вокруг…»'],
   ['city_tiflis','Старый Тифлис','вид на Куру, 1958','Тифлис, Метехи','','Сергей, 12 октября','«Отсюда мы смотрели на реку каждое воскресенье. Дедушка говорил, что Кура помнит всех.»',1],
   ['mother_child_bw','Я с мамой','1956','Тифлис','Нина Петровна, Анна','Анна, 2 октября',''],
   ['lake_two','На озере','лето 1961','Боржоми','','Анна, 12 октября','',1],
   ['father_son_boat','Отец и сын','1964','Батуми','Николай, Серёжа','Сергей, 5 октября',''],
   ['girl_flowers','Варя с цветами','1968','Москва','Варя','Варя, 28 сентября','']],
 voices:[['grandma_porch','Бабушка Нина','о трамвае',194,'«Мне было шесть лет, когда я впервые увидела трамвай. Мы с бабушкой шли по Головинскому…»','12 марта 2026','QR у главы «Детство»'],
   ['nikolai_portrait','Дедушка Николай','об армии',250,'«В сорок четвёртом мы шли пешком до Кутаиси и пели всю дорогу, чтобы не уснуть.»','20 октября','глава «Война»'],
   ['mother_daughter','Мама','колыбельная',112,'','3 ноября','']],
 letters:[['Нины','Тифлис → Москва, 1957','Дорогие мои, пишу вам из Тифлиса… Здесь уже настоящая весна, в садах цветут абрикосы, и воздух такой тёплый, что невольно думаешь о доме. Серёжа вырос — вы его не узнаете. Скучаю по вам, по нашей кухне и маминым пирогам.<br><br>Целую всех крепко,<br>ваша Нина','глава 2 · «Тифлис»'],
   ['Николая','с фронта, 1944','Родные мои! Жив, здоров, не волнуйтесь. Вспоминаю наш двор и грушу под окном. Скоро увидимся.<br><br>Ваш Николай',''],
   ['Варвары','Карс, 1932','Милая сестра, посылаю тебе карточку, как обещала. У нас всё по-старому, только сад разросся…<br><br>Твоя Варя','']],
 texts:[['Детство','Нина Петровна · 5 апреля','Мама впервые увидела трамвай, когда ей было шесть лет. Они с бабушкой шли по Головинскому, и вдруг из-за угла выехал красный вагон, звенящий, как колокольчик.|Мама спряталась за бабушкину юбку, а потом весь вечер рассказывала соседям, что видела «дом на колёсах».','глава 1 · «Детство»',412],
   ['Переезд','Сергей · 2 мая','В пятьдесят седьмом мы собрали всё в два чемодана и поехали в Москву. Поезд шёл трое суток…','',268],
   ['Свадьба','Мама · 9 мая','Он пришёл на танцы в чужом пиджаке, на два размера больше. Я смеялась весь вечер, а через год мы поженились.','',190]],
 week:{q:'Как вы познакомились с дедушкой?',deck:['Как вы познакомились с дедушкой?','Какое блюдо в детстве было праздничным?','Каким был ваш первый дом?','Какую песню пели в семье?'],
   ans:[['voice','grandma_porch','Нина Петровна','голос · 2:28 · вчера'],['text','mother_daughter','Мама','текст · 3 дня назад','Он пришёл на танцы в чужом пиджаке, на два размера больше. Я смеялась весь вечер, а через год мы поженились.'],['photo','girl_flowers','Варя','фото · 3 дня назад'],['voice','nikolai_portrait','Николай','голос · 1:12 · неделю назад'],['text','mountains_father_son','Сергей','текст · неделю назад','Папа всегда говорил, что увидел её первым — на мосту через Куру.']]},
 edits:[['Тифлис','Мастерская · 30 октября']]};
const store={get:()=>{try{return JSON.parse(localStorage.getItem('ocherkiArchiveMine')||'[]');}catch(_){return[];}},set:v=>{try{localStorage.setItem('ocherkiArchiveMine',JSON.stringify(v));}catch(_){}}};
// recorded voices: the sound itself in IndexedDB, its card in localStorage
const idb=()=>new Promise((ok,no)=>{const r=indexedDB.open('ocherki-archive',1);r.onupgradeneeded=()=>r.result.createObjectStore('audio');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error);});
const putAudio=async(id,blob)=>{const db=await idb();return new Promise(ok=>{const t=db.transaction('audio','readwrite');t.objectStore('audio').put(blob,id);t.oncomplete=ok;});};
const getAudio=async id=>{const db=await idb();return new Promise(ok=>{const r=db.transaction('audio').objectStore('audio').get(id);r.onsuccess=()=>ok(r.result||null);r.onerror=()=>ok(null);});};

const SECS=[
 {k:'voices',t:'Голоса',n:()=>`${D.voices.length+store.get().length} записи`,o:()=>`<div class="st3"><div class="disc" style="left:30%;top:8%"><img src="${A}keeper/desk-vinyl-disc.webp" alt=""><i class="lab" style="background-image:url('${P}nikolai_portrait.jpg')"></i><img class="sh" src="${A}keeper/desk-vinyl-shine.webp" alt=""></div><div class="disc" style="left:8%;top:22%"><img src="${A}keeper/desk-vinyl-disc.webp" alt=""><i class="lab" style="background-image:url('${P}grandma_porch.jpg')"></i><img class="sh" src="${A}keeper/desk-vinyl-shine.webp" alt=""></div></div>`},
 {k:'photos',t:'Фото',n:()=>`${D.photos.length} снимков`,o:()=>`<div class="st3">${['lake_two','grandma_porch','mother_child_bw'].map((f,i)=>`<div class="ph" style="left:${[46,12,30][i]}%;top:${[4,12,22][i]}%;rotate:${[-9,6,-3][i]}deg"><i class="pic" style="background-image:url('${P}${f}.jpg')"></i><img class="fri" src="${A}archive/frame.webp" alt=""></div>`).join('')}</div>`},
 {k:'letters',t:'Письма',n:()=>`${D.letters.length} письма`,o:()=>`<img src="${A}archive/envelopes.webp" alt="">`,nw:1},
 {k:'texts',t:'Тексты',n:()=>`${D.texts.length} рассказа`,o:()=>`<img src="${A}keeper/desk-stack.webp" alt="" style="filter:drop-shadow(0 18px 24px rgba(0,0,0,.6)) sepia(.6) saturate(1.3) hue-rotate(-10deg) brightness(.72)">`},
 {k:'week',t:'Вопрос недели',n:()=>'2 новых ответа',o:()=>`<div class="st3"><div class="card" style="left:4%;top:30%;rotate:-6deg"><i>вопрос недели</i><span>Какое блюдо было праздничным?</span></div><div class="card" style="left:18%;top:46%;rotate:3deg"><i>вопрос недели</i><span>Как вы познакомились с дедушкой?</span></div></div>`,nw:1},
 {k:'edits',t:'Правки',n:()=>'4 правки к главе',o:()=>`<div style="width:56%;aspect-ratio:1/1.3;background:url('${A}keeper/desk-paper-small.jpg') center/cover;box-shadow:0 18px 26px rgba(0,0,0,.55);rotate:-3deg;padding:12% 10%;color:#3b2a1c;font:12px/2 Georgia,serif;overflow:hidden">Отец уходил рано… <s style="color:#8a5a4a;text-decoration-color:#b0302a">В сорок четвёртом</s> <span style="font:400 18px SignThatS,Georgia;color:#b0302a">В 1944 году</span> они шли пешком до Кутаиси…</div>`}];

// ---------- items of a section (the spread) ----------
const items=k=>{
 if(k==='photos')return D.photos.map(x=>({h:frame(P+x[0]+'.jpg',x[7]),t:x[1],s:x[2]}));
 if(k==='voices')return [...store.get().map(m=>({h:disc('',0,P+'grandma_porch.jpg'),t:m.t,s:'ваша запись · '+fmt(m.len),mine:m})),...D.voices.map(x=>({h:disc(x[0]),t:x[1],s:x[2]}))];
 if(k==='letters')return D.letters.map(x=>({h:`<img src="${A}archive/envelope.webp" alt="" style="width:200px">`,t:'от '+x[0],s:x[1]}));
 if(k==='texts')return D.texts.map(x=>({h:`<div style="width:150px;height:200px;background:url('${A}keeper/desk-paper-small.jpg') center/cover;box-shadow:0 16px 22px rgba(0,0,0,.55);padding:18px 16px;text-align:left;color:#3b2a1c;font:11px/1.45 Georgia,serif;overflow:hidden"><b style="display:block;font:400 18px SignThatS,Georgia;margin-bottom:6px">${x[0]}</b>${x[2].split('|')[0]}</div>`,t:x[0],s:x[1]}));
 return [];};

// ---------- the page of one thing ----------
const qsRight=sel=>`<div class="kk">вопрос недели · эта неделя</div><h2>Ответы семьи</h2><div class="sub">5 из 8 ответили · 2 новых</div><div class="rule"></div>
  <div class="chips">${['все','голос','текст','фото'].map((c,i)=>`<span class="${i?'':'on'}" data-f="${['','voice','text','photo'][i]}">${c}</span>`).join('')}</div>
  <div class="list">${D.week.ans.map((a,i)=>`<div class="row${i===sel?' on':''}" data-ans="${i}" data-ty="${a[0]}"><b class="av" style="background-image:url('${P}${a[1]}.jpg')"></b><span class="tx">${a[2]}<small>${a[3]}</small></span><span class="ty">${{voice:'голос',text:'текст',photo:'фото'}[a[0]]}</span></div>${i===sel&&a[0]==='voice'?`<div class="pl" style="padding:4px 10px 12px 68px"><span class="pp sm" data-play></span>${wf(80,.4,false,true,i)}</div>`:''}`).join('')}</div>
  ${keys([['В книгу'],['Задать другой вопрос','cycle'],['Новый вопрос семье','send']])}`;
const ansLeft=a=>a[0]==='voice'?disc(a[1],true):a[0]==='photo'?frame(P+'city_tiflis.jpg',1):`<div class="note settle">${esc(a[4]||'')}<small>${esc(a[2])} · ответ на вопрос недели</small></div>`;
const deck=(i0=0)=>`<div class="deck" id="oaDeck">${[3,2,1,0].map(d=>`<div class="card" data-d="${d}"><i>вопрос недели</i><h3>${D.week.deck[(i0+d)%D.week.deck.length]}</h3><small>${d?'':'тема: любовь · отправлен 10 ноября'}</small></div>`).join('')}</div>`;
const page=(k,i)=>{
 if(k==='photos'){const x=D.photos[i];return{c:'Фото',l:frame(P+x[0]+'.jpg',x[7]),r:`<div class="kk">фото</div><h2>${x[1]}</h2><div class="sub">${x[2]}</div><div class="rule"></div>${dl([['место',x[3]],['на фото',x[4]],['прислал(а)',x[5]]])}${x[6]?`<p class="story">${x[6]}</p>`:''}${keys(['В книгу','Изменить','Кто на фото'])}`,n:D.photos.length};}
 if(k==='voices'){const mine=store.get();if(i<mine.length){const m=mine[i];return{c:'Голоса',l:disc('',false,P+'grandma_porch.jpg'),r:`<div class="kk">голос · ваша запись</div><h2>${esc(m.t)}</h2><div class="sub">${esc(m.when||'')}</div><div class="rule"></div><div class="pl"><span class="pp paused" data-play data-id="${m.id}"></span>${wf(110,0,false,false,7)}</div><div class="tm"><span data-cur>0:00</span><span data-left>${fmt(m.len)}</span></div>${keys(['В книгу','Изменить'])}`,n:mine.length+D.voices.length};}
   const x=D.voices[i-mine.length];return{c:'Голоса',l:disc(x[0],false),r:`<div class="kk">голос</div><h2>${x[1]}</h2><div class="sub">${x[2]}</div><div class="rule"></div><div class="pl"><span class="pp paused" data-play data-len="${x[3]}"></span>${wf(110,0,false,false,i)}</div><div class="tm"><span data-cur>0:00</span><span data-left>осталось ${fmt(x[3])}</span></div>${x[4]?`<p class="story" style="margin-bottom:22px">${x[4]}</p>`:''}${dl([['записано',x[5]],['в книге',x[6]]])}${keys(['В книгу','Изменить'])}`,n:mine.length+D.voices.length};}
 if(k==='letters'){const x=D.letters[i];return{c:'Письма',l:`<div class="lw"><img class="env" src="${A}archive/envelope.webp" alt=""><div class="sheet"><div class="hand">${x[2]}</div></div></div>`,r:`<div class="kk">письмо</div><h2>от ${x[0]}</h2><div class="sub">${x[1]}</div><div class="rule"></div>${dl([['кому','семье Евстафиади'],['в книге',x[3]]])}${keys(['В книгу','Изменить','Оригинал письма'])}`,n:D.letters.length};}
 if(k==='texts'){const x=D.texts[i];return{c:'Тексты',l:`<div class="sheet settle"><h3>${x[0]}</h3><div class="print">${x[2].split('|').map(p=>`<p>${p}</p>`).join('')}</div></div>`,r:`<div class="kk">рассказ</div><h2>${x[0]}</h2><div class="sub">${x[1]}</div><div class="rule"></div>${dl([['слов',String(x[4])],['в книге',x[3]]])}${keys(['Открыть в редакторе','В книгу'])}`,n:D.texts.length};}
 if(k==='week')return{c:'Вопрос недели',l:deck(),r:qsRight(-1),n:1};
 if(k==='edits')return{c:'Правки',l:`<div class="sheet proof settle"><h3>Тифлис</h3><div class="print"><p>Отец уходил рано, а возвращался затемно. <span class="e" data-n="0"><del>В сорок четвёртом</del><span class="over">В 1944 году</span></span> они шли пешком до Кутаиси и пели всю дорогу<span class="e" data-n="1"><span class="mark">,</span></span> чтобы не уснуть.</p><p>По субботам пекли хачапури, и весь двор пах сыром и дымом. Дом был <span class="e" data-n="2"><del>на две семьи</del><span class="over">на два хозяина</span></span>, во дворе росла старая груша.</p><p>Мама пекла <span class="e" data-n="3"><del>в ноябре месяце</del><span class="over">в ноябре</span></span> медовик, и вся улица знала, что скоро праздник…</p></div></div>`,
   r:`<div class="kk">правки · мастерская · 30 октября</div><h2>Вычитка главы</h2><div class="sub">4 правки — примите или отклоните каждую</div><div class="rule"></div><div class="list">${[['В сорок четвёртом','В 1944 году','даты — цифрами'],['всю дорогу чтобы','всю дорогу, чтобы','запятая'],['на две семьи','на два хозяина','так говорила бабушка'],['в ноябре месяце','в ноябре','лишнее слово']].map(([w,n,c],j)=>`<div class="row" data-n="${j}"><span class="tx"><span class="was">${w}</span> → <span class="now">${n}</span><small>${c}</small></span><span class="ok" data-ok>✓</span><span class="no" data-no>✕</span></div>`).join('')}</div>${keys([['Принять все','okall'],['Открыть главу']])}`,n:1};
 if(k==='record')return{c:'Записать голос',l:reel(false),r:recRight('ready'),n:1};
 if(k==='send')return{c:'Вопрос недели',ph:1,l:`<div class="phone"><img src="${A}archive/phone2.webp" alt=""><div class="scr"><div class="glow"></div><div class="time">10:00</div><div class="note"><b></b><span>Вопрос недели<small>от Нины Петровны · сейчас</small></span></div><div class="body"><i>вопрос недели</i><h4>Какое блюдо в детстве было праздничным?</h4><small>ответьте, как удобно</small><div class="mic"></div><div class="alt"><span>написать</span><span>фото</span></div></div></div></div>`,
   r:`<div class="kk">новый вопрос недели</div><h2>Кому отправить</h2><div class="sub">так вопрос увидят родные · ответят по ссылке, без регистрации</div><div class="rule"></div><div class="chips">${['детство','дом','праздники','любовь','война','работа'].map((t,j)=>`<span class="${j===2?'on':''}">${t}</span>`).join('')}</div><div class="list" style="max-height:30vh">${[['grandma_porch','Нина Петровна','бабушка · телефон'],['mother_daughter','Мама','почта'],['mountains_father_son','Сергей','телефон'],['girl_flowers','Варя','телефон'],['nikolai_portrait','Николай','почта']].map(([f,n,s])=>`<div class="row"><b class="av" style="background-image:url('${P}${f}.jpg')"></b><span class="tx">${n}<small>${s}</small></span><span class="tick">✓</span></div>`).join('')}</div>${keys(['Отправить в понедельник','Другой вопрос','+ Пригласить'])}`,n:1};
 return null;};
const recRight=(st,len)=>{const head=`<div class="kk">записать голос</div><h2 class="q">Каким был ваш первый дом?</h2><div class="rule"></div>`;
 if(st==='ready')return head+`<div class="recrow"><span class="recbtn" data-rec></span><span>Нажмите, чтобы начать запись</span></div><p class="story" style="font-size:17px">Говорите спокойно, как за столом. Паузы можно — лишнее потом вырежем. Сбились — просто продолжайте.</p>${keys([['Другой вопрос','q2'],['Без вопроса, просто рассказ','free']])}`;
 if(st==='rec')return head+`<div class="onair"><i></i>идёт запись <b data-timer>0:00</b></div><div class="recrow"><span class="recbtn stop" data-stop></span>${wf(90,0,true)}</div><p class="story" style="font-size:17px">Нажмите «стоп», когда закончите. Запись никуда не уйдёт, пока вы её не сохраните.</p>`;
 return head+`<div class="sub" style="margin-bottom:14px">Записано ${fmt(len)}</div><div class="pl"><span class="pp paused" data-play data-rec-blob></span>${wf(110,0)}</div><div class="tm"><span data-cur>0:00</span><span data-left>${fmt(len)}</span></div>${keys([['Сохранить в архив','save'],['Записать заново','again']])}`;};

// ---------- the overlay ----------
let root=null,where=null,list=[],at=0,audio=null,rec=null,recBlob=null,recLen=0,recT=0,timers=[];
const later=(f,ms)=>timers.push(setTimeout(f,ms));
const knight=`<div class="knight"><div class="nb"></div><div class="na"></div><div class="nm"></div><div class="nw"></div><div class="ni"></div><div class="nv"></div></div><div class="dim"></div>`;
const top=(crumb)=>`<div class="top"><span class="crumb" data-back>‹ ${esc(crumb)}</span><span class="x" data-close>✕</span></div>`;
const stopAudio=()=>{if(audio){audio.pause();audio=null;}root?.querySelectorAll('.bigdisc.playing').forEach(d=>d.classList.remove('playing'));root?.querySelectorAll('[data-play]').forEach(b=>b.classList.add('paused'));};
const render=html=>{stopAudio();timers.forEach(clearTimeout);timers=[];root.innerHTML=knight+html;};
const showDesk=()=>{where={v:'desk'};render(`${top('Конструктор')}<header><h1>Архив семьи</h1><p>Всё, что присылают родные, — на одном столе</p></header><div class="desk">${SECS.map(s=>`<div class="sec" data-sec="${s.k}"><div class="obj">${s.o()}</div>${s.nw?'<span class="new">новое</span>':''}<b>${s.t}</b><small>${s.n()}</small></div>`).join('')}</div>`);};
const showSec=k=>{const s=SECS.find(x=>x.k===k);if(k==='week'||k==='edits'){showPage(k,0,true);return;}
  where={v:'sec',k};list=items(k);
  render(`${top('Архив')}<header><h1>${s.t}</h1><p>${s.n()}</p></header><div class="spread">${list.length?list.map((it,i)=>`<div class="it" data-i="${i}" style="--d:${(.06*i).toFixed(2)}s;--r:${((i*37%7)-3)*.8}deg"><div class="vis">${it.h}</div><strong>${esc(it.t)}</strong><em>${esc(it.s)}</em></div>`).join(''):'<div class="empty">Здесь пока пусто</div>'}</div>${k==='voices'?`<div class="sp-acts"><button class="k main" data-go="record">● Записать голос</button></div>`:''}`);};
const showPage=(k,i,fromDesk)=>{const p=page(k,i);if(!p)return;where={v:'page',k,i,fromDesk};at=i;
  const nav=p.n>1?`<div class="nav"><b data-nav="-1">‹ предыдущее</b><span>${i+1} из ${p.n}</span><b data-nav="1">следующее ›</b></div>`:'';
  render(`${top(fromDesk?'Архив':p.c)}<div class="page"><div class="obj${p.ph?' phn':''}">${p.l}</div><div class="info">${p.r}${nav}</div></div>`);
  if(k==='edits')root.querySelectorAll('.row[data-n]').forEach(r=>r.addEventListener('mouseenter',()=>{const n=r.dataset.n;root.querySelectorAll('.row,.e').forEach(x=>x.classList.toggle(x.classList.contains('row')?'on':'hl',x.dataset.n===n));}));};
// play: a real recording plays its sound; a demo one only turns, the wave advancing in time
const play=async b=>{const d=root.querySelector('.bigdisc');const on=b.classList.contains('paused');stopAudio();if(!on)return;
  b.classList.remove('paused');d?.classList.add('playing');const cur=root.querySelector('[data-cur]'),left=root.querySelector('[data-left]'),bars=[...root.querySelectorAll('.info .wf i')],head=root.querySelector('.info .wf .head');
  let len=+b.dataset.len||recLen||60;let el=null;
  if(b.dataset.id){const blob=await getAudio(b.dataset.id);if(blob){el=new Audio(URL.createObjectURL(blob));}}
  else if(b.hasAttribute('data-rec-blob')&&recBlob){el=new Audio(URL.createObjectURL(recBlob));}
  const t0=performance.now();const fake={pause(){fake.stopped=1;}};audio=el||fake;if(el){el.play().catch(()=>{});el.onloadedmetadata=()=>{if(isFinite(el.duration))len=el.duration;};}
  const tick=()=>{if(audio!==(el||fake)||fake.stopped)return;const t=el?el.currentTime:(performance.now()-t0)/1000;const f=Math.min(1,t/len);
    if(cur)cur.textContent=fmt(t);if(left)left.textContent=(left.textContent.includes('осталось')?'осталось ':'')+fmt(len-t);
    bars.forEach((x,k)=>x.classList.toggle('p',k/bars.length<f));if(head)head.style.left=(f*100)+'%';
    if(f>=1||(el&&el.ended)){stopAudio();return;}requestAnimationFrame(tick);};requestAnimationFrame(tick);};
// recording, with the microphone
const startRec=async()=>{let st;try{st=await navigator.mediaDevices.getUserMedia({audio:true});}catch(_){alert('Нет доступа к микрофону. Разрешите его в настройках браузера.');return;}
  const ch=[];rec=new MediaRecorder(st);rec.ondataavailable=e=>e.data.size&&ch.push(e.data);
  rec.onstop=()=>{st.getTracks().forEach(t=>t.stop());recBlob=new Blob(ch,{type:rec.mimeType||'audio/webm'});recLen=(performance.now()-recT)/1000;root.querySelector('.reel1')?.classList.remove('on');root.querySelector('.info').innerHTML=recRight('done',recLen);};
  rec.start();recT=performance.now();root.querySelector('.reel1')?.classList.add('on');root.querySelector('.info').innerHTML=recRight('rec');
  const tm=()=>{const t=root?.querySelector('[data-timer]');if(!t||!rec||rec.state!=='recording')return;t.textContent=fmt((performance.now()-recT)/1000);setTimeout(tm,250);};tm();};
const saveRec=async()=>{if(!recBlob)return;const id='v'+Date.now().toString(36);await putAudio(id,recBlob);const mine=store.get();
  mine.unshift({id,t:'Каким был ваш первый дом?',len:recLen,when:new Date().toLocaleDateString('ru-RU',{day:'numeric',month:'long'})});store.set(mine);recBlob=null;showSec('voices');};
const cycle=()=>{const dk=root.querySelector('#oaDeck');if(!dk)return;const t=dk.querySelector('[data-d="0"]');t.classList.add('out');
  later(()=>{dk.querySelectorAll('.card').forEach(c=>{if(c!==t)c.dataset.d=+c.dataset.d-1;});t.dataset.d=3;requestAnimationFrame(()=>t.classList.remove('out'));},700);};
const back=()=>{if(rec&&rec.state==='recording')rec.stop();
  if(!where||where.v==='desk'){close();return;}
  if(where.v==='page'&&!where.fromDesk&&where.k!=='record'&&where.k!=='send'){showSec(where.k);return;}
  if(where.k==='record'){showSec('voices');return;}if(where.k==='send'){showPage('week',0,true);return;}showDesk();};
const onClick=e=>{const t=e.target;
  if(t.closest('[data-close]')){close();return;}if(t.closest('[data-back]')){back();return;}
  const s=t.closest('[data-sec]');if(s){showSec(s.dataset.sec);return;}
  const it=t.closest('.it[data-i]');if(it&&where.v==='sec'){showPage(where.k,+it.dataset.i);return;}
  const nv=t.closest('[data-nav]');if(nv){const p=page(where.k,0);showPage(where.k,(where.i+ +nv.dataset.nav+p.n)%p.n,where.fromDesk);return;}
  const go=t.closest('[data-go]');if(go){showPage(go.dataset.go,0);return;}
  const pl=t.closest('[data-play]');if(pl){play(pl);return;}
  if(t.closest('[data-rec]')){startRec();return;}if(t.closest('[data-stop]')){rec&&rec.stop();return;}
  const a=t.closest('[data-act]')?.dataset.act;
  if(a==='save'){saveRec();return;}if(a==='again'){recBlob=null;root.querySelector('.info').innerHTML=recRight('ready');return;}
  if(a==='cycle'){cycle();return;}if(a==='send'){showPage('send',0);return;}
  if(a==='okall'){root.querySelectorAll('.row[data-n]').forEach(r=>accept(r));return;}
  const ok=t.closest('[data-ok]');if(ok){accept(ok.closest('.row'));return;}
  const no=t.closest('[data-no]');if(no){const r=no.closest('.row');const e=root.querySelector(`.e[data-n="${r.dataset.n}"]`);e&&(e.querySelector('.over,.mark')?.remove(),e.querySelector('del')&&e.querySelector('del').replaceWith(...e.querySelector('del').childNodes));r.style.opacity=.35;return;}
  const ar=t.closest('.row[data-ans]');if(ar){const i=+ar.dataset.ans;where.sel=i;const obj=root.querySelector('.obj');obj.classList.remove('phn');obj.innerHTML=ansLeft(D.week.ans[i]);root.querySelector('.info').innerHTML=qsRight(i);return;}
  const f=t.closest('.chips [data-f]');if(f){root.querySelectorAll('.chips span').forEach(x=>x.classList.toggle('on',x===f));root.querySelectorAll('.row[data-ty]').forEach(r=>r.style.display=!f.dataset.f||r.dataset.ty===f.dataset.f?'':'none');return;}};
// accepting a correction: the red ink fades, the new word stays in the line
const accept=r=>{if(!r||r.dataset.done)return;r.dataset.done=1;const e=root.querySelector(`.e[data-n="${r.dataset.n}"]`);if(e){const o=e.querySelector('.over'),d=e.querySelector('del'),m=e.querySelector('.mark');
  if(o&&d){d.replaceWith(document.createTextNode(o.textContent));o.remove();}if(m){m.style.color='inherit';m.style.font='inherit';}}r.style.opacity=.35;r.querySelector('.ok').textContent='✓';};
const onKey=e=>{if(!root)return;if(e.key==='Escape'){e.preventDefault();back();}if(where?.v==='page'&&(e.key==='ArrowRight'||e.key==='ArrowLeft')){const p=page(where.k,0);if(p.n>1)showPage(where.k,(where.i+(e.key==='ArrowRight'?1:-1)+p.n)%p.n,where.fromDesk);}};
const open=(w='desk')=>{inject();if(!root){root=document.createElement('div');root.className='oar';document.body.appendChild(root);root.addEventListener('click',onClick);addEventListener('keydown',onKey,true);requestAnimationFrame(()=>requestAnimationFrame(()=>root.classList.add('in')));}
  if(w==='desk')showDesk();else if(['record','send'].includes(w))showPage(w,0);else if(SECS.some(s=>s.k===w))showSec(w);else showDesk();};
const close=()=>{if(!root)return;stopAudio();if(rec&&rec.state==='recording')rec.stop();const r=root;root=null;where=null;removeEventListener('keydown',onKey,true);r.classList.remove('in');setTimeout(()=>r.remove(),600);};
window.OcherkiArchive={open,close,get isOpen(){return!!root;}};
// the constructor's keys open it: the pill «Архив семьи» and the six keys under it
const MAP={voice:'voices',photo:'photos',note:'texts',letter:'letters',record:'record',week:'week'};
document.addEventListener('click',e=>{const pl=e.target.closest('button.pl[data-w="arch"]');const k=e.target.closest('button.k[data-k]');
  if(pl){e.preventDefault();e.stopImmediatePropagation();open('desk');return;}
  if(k&&MAP[k.dataset.k]){e.preventDefault();e.stopImmediatePropagation();open(MAP[k.dataset.k]);}},true);
})();
