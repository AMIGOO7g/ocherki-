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
.oar .cr{position:relative;width:100%;height:100%;display:flex;align-items:center;justify-content:center}
.oar .info{position:relative;z-index:7}
.oar .cr .mainv{position:relative;z-index:5;width:100%;height:100%;display:flex;align-items:center;justify-content:center}
.oar .cr .mainv.from-r{animation:oa-fromr .7s cubic-bezier(.2,.8,.3,1) both}.oar .cr .mainv.from-l{animation:oa-froml .7s cubic-bezier(.2,.8,.3,1) both}
@keyframes oa-fromr{from{transform:translateX(34%) scale(.72);filter:brightness(.5)}to{transform:none;filter:none}}
@keyframes oa-froml{from{transform:translateX(-34%) scale(.72);filter:brightness(.5)}to{transform:none;filter:none}}
.oar .cr .nbr{position:absolute;left:50%;top:50%;cursor:pointer;transition:transform .7s cubic-bezier(.2,.8,.3,1),filter .5s;pointer-events:auto}
.oar .cr .nbr.l1{transform:translate(-50%,-50%) translateX(-38%) scale(.72);filter:brightness(.42);z-index:3}
.oar .cr .nbr.r1{transform:translate(-50%,-50%) translateX(38%) scale(.72);filter:brightness(.42);z-index:3}
.oar .cr .nbr.l2{transform:translate(-50%,-50%) translateX(-62%) scale(.54);filter:brightness(.24);z-index:2}
.oar .cr .nbr.r2{transform:translate(-50%,-50%) translateX(62%) scale(.54);filter:brightness(.24);z-index:2}
.oar .cr .nbr:hover{filter:brightness(.75)}
.oar .cr .nbr .fr .pic{animation:none}.oar .cr .nbr .fr::before,.oar .cr .nbr .fr::after{display:none}
.oar .cr .nbd{position:relative;width:min(62vh,40vw);aspect-ratio:1}.oar .cr .nbd img{position:absolute;inset:0;width:100%;height:100%}
.oar .cr .nbd i{position:absolute;left:28.4%;top:28.4%;width:43.2%;height:43.2%;border-radius:50%;background:center/cover;filter:sepia(.45)}
.oar .cr .nbe{width:min(560px,36vw)}
.oar .cr .nbs{width:min(480px,32vw);height:70vh;padding:48px;background:url("${A}keeper/desk-paper.jpg") center/cover;color:#2a1c12;font:17px/1.6 Georgia,serif;overflow:hidden;box-shadow:0 30px 50px rgba(0,0,0,.6)}
.oar .cr .nbs b{display:block;font:400 34px "SignThatS",Georgia;color:#4b3424;margin-bottom:12px}
.oar .cr .cnt{position:absolute;left:0;right:0;bottom:-6px;display:flex;justify-content:center;align-items:center;gap:18px;z-index:6;font:italic 16px Georgia,serif;color:#e2c9a2}
.oar .cr .cnt b{width:38px;height:38px;border-radius:50%;border:1px solid rgba(232,197,142,.45);display:grid;place-items:center;font:20px Georgia;color:#f2e0c2;cursor:pointer;transition:box-shadow .4s}
.oar .cr .cnt b:hover{box-shadow:0 0 12px 2px rgba(255,150,60,.4)}
.oar .cr .cnt em{margin-left:10px;padding:6px 14px;border-radius:16px;border:1px solid rgba(232,197,142,.35);cursor:pointer}
.oar .page{bottom:64px}
.oar .k.done{border-color:#9fd08a;color:#d9f2cc;box-shadow:0 0 12px rgba(140,210,120,.35)}
.oar [contenteditable="true"]{outline:1px dashed rgba(232,197,142,.55);outline-offset:4px;border-radius:3px;background:rgba(255,220,170,.05)}
.oar .toast{position:fixed;left:50%;top:24px;translate:-50% 0;padding:12px 22px;border-radius:22px;background:rgba(20,10,4,.92);border:1px solid rgba(232,197,142,.45);font:italic 16px Georgia,serif;color:#f2e0c2;z-index:9;animation:oa-up .5s ease both}
`;
// v167: the archive lives in its own shadow root — the constructor's styles cannot reach it, and its own cannot leak out
let host=null,SR=null;
const inject=()=>{if(SR)return;
  host=document.createElement('div');host.id='oar-host';host.style.cssText='position:fixed;inset:0;z-index:2147483646;pointer-events:none';document.body.appendChild(host);
  SR=host.attachShadow({mode:'open'});
  const l=document.createElement('link');l.rel='stylesheet';l.href=BASE+'assets/archive/archive.css'+VER;SR.appendChild(l);
  const s=document.createElement('style');s.textContent=EXTRA;SR.appendChild(s);
  if(!document.fonts||![...document.fonts].some(f=>/SignThatS/.test(f.family))){const f=document.createElement('style');f.textContent=`@font-face{font-family:"SignThatS";src:url("${A}fonts/SignThatS.otf") format("opentype");font-display:swap}`;document.head.appendChild(f);}};

// ---------- pieces ----------
const wf=(n,played,live,sm,seed=0)=>{let h=[];for(let k=0;k<n;k++){const e=.35+.65*Math.pow(Math.sin(Math.PI*k/n),.6);const v=e*(.35+.65*Math.abs(Math.sin((k+seed)*.53)*Math.cos((k+seed)*.21)+.25*Math.sin((k+seed)*1.7)));h.push(Math.max(.08,Math.min(1,v)));}
  const ph=Math.round(n*played);return `<div class="wf${live?' live':''}${sm?' sm':''}">${h.map((v,k)=>`<i class="${k<ph?'p':''}${Math.abs(k-ph)<6&&!live?' near':''}" style="--h:${v.toFixed(2)};--dl:-${((k*53%17)/10).toFixed(2)}s;--d:${(.35+(k*37%9)/18).toFixed(2)}s"></i>`).join('')}${live?'':`<span class="head" style="left:${(played*100).toFixed(1)}%"></span>`}</div>`;};
const keys=a=>`<div class="keys">${a.map((t,i)=>{const[x,act]=Array.isArray(t)?t:[t];return `<button class="k${i?'':' main'}" ${act?`data-act="${act}"`:''}>${esc(x)}</button>`;}).join('')}</div>`;
const dl=r=>`<dl>${r.filter(x=>x[1]).map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`;
const tt=(f,src)=>`<div class="tt"><div class="bigdisc"><div class="spin"><img src="${A}keeper/desk-vinyl-disc.webp" alt=""><i class="lab" style="background-image:url('${src||P+f+'.jpg'}')"></i></div><img class="shn" src="${A}keeper/desk-vinyl-shine.webp" alt=""></div><div class="arm" style="--rot:${ARM.rest}deg"><img src="${A}archive/tonearm.webp" alt=""></div></div>`;
const disc=(f,play,src)=>`<div class="bigdisc${play?' playing':''}"><div class="spin"><img src="${A}keeper/desk-vinyl-disc.webp" alt=""><i class="lab" style="background-image:url('${src||P+f+'.jpg'}')"></i></div></div>`;
const reel=on=>`<div class="reel1${on?' on':''}"><img class="t" src="${A}archive/reel.webp" alt=""><img src="${A}archive/reel-shine.webp" alt=""></div>`;
const frame=(src,land)=>`<div class="fr${land?' land':''}"><img class="pic" src="${src}" alt=""><i class="ins"></i></div>`;
const fmt=s=>{s=Math.max(0,Math.round(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};

// the tonearm: its pivot stands up and right of the record (in record radii: 1.15 right, 0.75 up), the arm is 1.37 radii long.
// In the picture the arm points left (180.3°); --rot turns it to where the stylus should be.
const ARM=(()=>{const px=1.15,py=-.75,L=1.37,base=180.3;const at=th=>{const t=th*Math.PI/180;return Math.hypot(px+L*Math.cos(t),py+L*Math.sin(t));};
  const find=r=>{let th=97;while(at(th)>r&&th<260)th+=.1;return th;};// the first meeting with the groove, coming in from the right like a real arm
  const rest=97,start=find(.95),end=find(.47);return{rest:(rest-base).toFixed(2),start:start-base,end:end-base};})();
// ---------- the Keeper: he lives in the corner of the archive and says what this page is for ----------
const HINTS={desk:'Здесь всё, что присылают родные. Нажмите на любой предмет',voices:'Нажмите ▶ — игла опустится. Отсюда можно записать свой голос',
  photos:'Листайте — человечек пройдёт по годам вашей семьи',texts:'Рассказ можно открыть в редакторе и вставить в главу',letters:'Письмо можно перенести в книгу целиком',
  week:'Родные ответят с телефона. Ответы попадут сюда',edits:'Примите правку или оставьте как было — всегда можно отменить',
  record:'Говорите спокойно, как за столом. Паузы потом вырежем',send:'Выберите, кому отправить. Вопрос придёт в понедельник'};
const HK='ocherkiArchiveHints';
const keeper={K:null,box:null,cv:null,hint:null,key:null,t:0,off(){return getJ(HK).off;},
  mount(){if(this.box||!SR)return;const b=document.createElement('div');b.className='kp';b.innerHTML='<canvas class="kp-cv"></canvas><i class="kp-spark"></i><div class="kp-hint"></div>';
    (root||SR).appendChild(b);this.box=b;this.cv=b.querySelector('canvas');this.hint=b.querySelector('.kp-hint');
    b.querySelector('.kp-cv').addEventListener('click',()=>this.say(this.key,true));b.querySelector('.kp-spark').addEventListener('click',()=>this.say(this.key,true));
    this.hint.addEventListener('click',e=>{if(e.target.closest('[data-hoff]')){const m=getJ(HK);m.off=1;setJ(HK,m);this.quiet();}});
    const go=()=>{try{const L=window.OcherkiTour?.loadKeeper;if(!L){b.classList.add('flat');return;}L().then(()=>{if(!this.box)return;
      const K=window.OcherkiKeeper3D&&OcherkiKeeper3D.create(this.cv,{size:1.05,dust:8,quick:1.6});if(!K){b.classList.add('flat');return;}this.K=K;K.start();K.resize?.();b.classList.add('live');}).catch(()=>b.classList.add('flat'));}catch(_){b.classList.add('flat');}};
    // a slow computer gets the spark only
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)b.classList.add('flat');else setTimeout(go,300);},
  place(k){if(!this.box)return;this.box.dataset.at=k;},
  say(k,force){if(!this.box||!k||!HINTS[k])return;this.key=k;this.place(k);const seen=getJ(HK);if(!force&&(seen.off||seen[k]))return;
    seen[k]=1;setJ(HK,seen);clearTimeout(this.t);const h=this.hint;
    h.innerHTML=HINTS[k].split(' ').map((w,i)=>`<span style="--i:${i}">${esc(w)}</span>`).join(' ')+'<u data-hoff>больше не показывать</u>';
    h.classList.remove('on');void h.offsetWidth;h.classList.add('on');try{this.K?.talk(2600);this.K?.mood?.('joy',2200);}catch(_){}
    this.t=setTimeout(()=>h.classList.remove('on'),9000);},
  quiet(){clearTimeout(this.t);this.hint?.classList.remove('on');},
  unmount(){try{this.K?.destroy();}catch(_){}this.K=null;this.box?.remove();this.box=null;}};
const SCENE={texts:'scene-pier.webp',letters:'scene-umbrella.webp',week:'scene-kite.webp'};
const RECGO=`<div class="recgo" data-go="record"><span class="rd"></span><span><b>Записать голос</b><small>свой рассказ или ответ на вопрос недели</small></span></div>`;
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
const yearOf=s=>+((String(s).match(/(1[89]\d\d|20\d\d)/)||[])[1]||0);
D.photos.sort((a,b)=>yearOf(a[2])-yearOf(b[2]));
let roadX=null;
const roadGeo=()=>{const ys=D.photos.map(x=>yearOf(x[2]));const y0=Math.floor((Math.min(...ys)-4)/5)*5,y1=Math.ceil((Math.max(...ys)+4)/5)*5;
  const seen={};const X=ys.map(y=>{const n=seen[y]=(seen[y]||0)+1;return 6+88*(y-y0)/(y1-y0)+(n-1)*1.4;});return{ys,y0,y1,X,at:y=>6+88*(y-y0)/(y1-y0)};};
const road=i=>{const g=roadGeo();const dec=[];for(let y=g.y0;y<=g.y1;y+=5)dec.push(y);
  return `<div class="road"><div class="ln"></div>${dec.map(y=>`<span class="yr" style="left:${g.at(y)}%">${y}</span>`).join('')}${D.photos.map((x,j)=>`<b class="dot${j===i?' on':''}" style="left:${g.X[j]}%" data-go-i="${j}" title="${esc(x[1])} · ${g.ys[j]}"><em>${g.ys[j]}</em></b>`).join('')}<div class="walker" style="left:${roadX??g.X[i]}%"><img class="go" src="${A}archive/walker.webp" alt=""><img class="st" src="${A}archive/walker-still.png" alt=""></div><div class="cap">дорога жизни</div></div>`;};
const walkTo=i=>{const w=root.querySelector('.walker');if(!w)return;const to=roadGeo().X[i];const from=roadX;roadX=to;if(from==null||Math.abs(from-to)<.1)return;
  w.classList.add('walking');w.classList.toggle('back',to<from);requestAnimationFrame(()=>requestAnimationFrame(()=>{w.style.left=to+'%';}));
  const dur=Math.min(2600,900+Math.abs(to-from)*40);w.style.transitionDuration=dur+'ms';setTimeout(()=>w.classList.remove('walking'),dur);};
const store={get:()=>{try{return JSON.parse(localStorage.getItem('ocherkiArchiveMine')||'[]');}catch(_){return[];}},set:v=>{try{localStorage.setItem('ocherkiArchiveMine',JSON.stringify(v));}catch(_){}}};
// recorded voices: the sound itself in IndexedDB, its card in localStorage
const idb=()=>new Promise((ok,no)=>{const r=indexedDB.open('ocherki-archive',1);r.onupgradeneeded=()=>r.result.createObjectStore('audio');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error);});
const putAudio=async(id,blob)=>{const db=await idb();return new Promise(ok=>{const t=db.transaction('audio','readwrite');t.objectStore('audio').put(blob,id);t.oncomplete=ok;});};
const getAudio=async id=>{const db=await idb();return new Promise(ok=>{const r=db.transaction('audio').objectStore('audio').get(id);r.onsuccess=()=>ok(r.result||null);r.onerror=()=>ok(null);});};

const SECS=[
 {k:'voices',t:'Голоса',n:()=>`${D.voices.length+store.get().length} записи`,o:()=>`<div class="slv"><div class="dsk"><img src="${A}keeper/desk-vinyl-disc.webp" alt=""><i class="lab" style="background-image:url('${P}nikolai_portrait.jpg')"></i></div><img class="sl" src="${A}archive/sleeve.webp" alt=""></div>`},

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
  ${keys([['В книгу'],['Другой вопрос','cycle']])}<div class="recgo ask" data-act="send"><span class="rd"></span><span><b>Задать вопрос семье</b><small>родные ответят с телефона — голосом, текстом или фото</small></span></div>`;
const ansLeft=a=>a[0]==='voice'?disc(a[1],true):a[0]==='photo'?frame(P+'city_tiflis.jpg',1):`<div class="note settle">${esc(a[4]||'')}<small>${esc(a[2])} · ответ на вопрос недели</small></div>`;
const deck=(i0=0)=>`<div class="deck" id="oaDeck">${[3,2,1,0].map(d=>`<div class="card" data-d="${d}"><i>вопрос недели</i><h3>${D.week.deck[(i0+d)%D.week.deck.length]}</h3><small>${d?'':'тема: любовь · отправлен 10 ноября<br>ответили 5 из 8'}</small></div>`).join('')}</div>`;
const page=(k,i)=>{
 if(k==='photos'){const x=D.photos[i];return{c:'Фото',l:frame(P+x[0]+'.jpg',x[7]),r:`<div class="kk">фото</div><h2>${x[1]}</h2><div class="sub">${x[2]}</div><div class="rule"></div>${dl([['место',x[3]],['на фото',x[4]],['прислал(а)',x[5]]])}${x[6]?`<p class="story">${x[6]}</p>`:''}${keys(['В книгу','Изменить','Кто на фото'])}`,n:D.photos.length};}
 if(k==='voices'){const mine=store.get();if(i<mine.length){const m=mine[i];return{c:'Голоса',l:tt('',P+'grandma_porch.jpg'),r:`<div class="kk">голос · ваша запись</div><h2>${esc(m.t)}</h2><div class="sub">${esc(m.when||'')}</div><div class="rule"></div><div class="pl"><span class="pp paused" data-play data-id="${m.id}"></span>${wf(110,0,false,false,7)}</div><div class="tm"><span data-cur>0:00</span><span data-left>${fmt(m.len)}</span></div>${keys(['В книгу','Изменить'])}${RECGO}`,n:mine.length+D.voices.length};}
   const x=D.voices[i-mine.length];return{c:'Голоса',l:tt(x[0]),r:`<div class="kk">голос</div><h2>${x[1]}</h2><div class="sub">${x[2]}</div><div class="rule"></div><div class="pl"><span class="pp paused" data-play data-len="${x[3]}"></span>${wf(110,0,false,false,i)}</div><div class="tm"><span data-cur>0:00</span><span data-left>осталось ${fmt(x[3])}</span></div>${x[4]?`<p class="story" style="margin-bottom:22px">${x[4]}</p>`:''}${dl([['записано',x[5]],['в книге',x[6]]])}${keys(['В книгу','Изменить'])}${RECGO}`,n:mine.length+D.voices.length};}
 if(k==='letters'){const x=D.letters[i];return{c:'Письма',l:`<div class="lw"><div class="env3"><img class="eb" src="${A}archive/env2-body.webp" alt=""><img class="flap" src="${A}archive/env2-flap.webp" alt=""></div><div class="sheet"><div class="hnd">${x[2]}</div></div></div>`,r:`<div class="kk">письмо</div><h2>от ${x[0]}</h2><div class="sub">${x[1]}</div><div class="rule"></div>${dl([['кому','семье Евстафиади'],['в книге',x[3]]])}${keys(['В книгу','Изменить','Оригинал письма'])}`,n:D.letters.length};}
 if(k==='texts'){const x=D.texts[i];return{c:'Тексты',l:`<div class="sheet settle"><h3>${x[0]}</h3><div class="print">${x[2].split('|').map(p=>`<p>${p}</p>`).join('')}</div></div>`,r:`<div class="kk">рассказ</div><h2>${x[0]}</h2><div class="sub">${x[1]}</div><div class="rule"></div>${dl([['слов',String(x[4])],['в книге',x[3]]])}${keys(['Открыть в редакторе','В книгу'])}`,n:D.texts.length};}
 if(k==='week')return{c:'Вопрос недели',l:deck(),r:qsRight(-1),n:1};
 if(k==='edits')return{c:'Правки',l:`<div class="proofs" data-p="0"><div class="ps p0"><div class="sheet proof settle"><h3>Тифлис</h3><div class="print"><p>Отец уходил рано, а возвращался затемно. <span class="e" data-n="0"><del>В сорок четвёртом</del><span class="over">В 1944 году</span></span> они шли пешком до Кутаиси и пели всю дорогу<span class="e" data-n="1"><span class="mark">,</span></span> чтобы не уснуть.</p><p>По субботам пекли хачапури, и весь двор пах сыром и дымом. Дом был <span class="e" data-n="2"><del>на две семьи</del><span class="over">на два хозяина</span></span>, во дворе росла старая груша.</p><p>Мама пекла <span class="e" data-n="3"><del>в ноябре месяце</del><span class="over">в ноябре</span></span> медовик, и вся улица знала, что скоро праздник…</p></div></div></div><div class="ps p1"><div class="sheet proof"><h3>Переезд</h3><div class="print"><p>В <span class=\"e\" data-n=\"4\"><del>пятьдесят седьмом</del><span class=\"over\">1957-м</span></span> мы собрали всё в два чемодана и поехали в Москву. Поезд шёл трое суток, и мама всю дорогу держала на коленях коробку с посудой.</p><p>На вокзале нас встречал дядя Гриша с букетом астр.</p></div></div></div><div class="ps p2"><div class="sheet proof"><h3>Свадьба</h3><div class="print"><p>Он пришёл на танцы в чужом пиджаке, на два размера больше. Я смеялась весь вечер, а через год мы поженились.</p></div></div></div><div class="pnav"><b data-pg="-1">‹</b><span>лист <em>1</em> из 3 · правок на листе: <em>4</em></span><b data-pg="1">›</b></div></div>`,
   r:`<div class="kk">правки · мастерская · 30 октября</div><h2>Вычитка главы</h2><div class="sub">5 правок на трёх листах — примите или оставьте как было</div><div class="rule"></div><p class="noedits" hidden>На этом листе правок нет — он уже чистый.</p><div class="list">${[['В сорок четвёртом','В 1944 году','даты — цифрами',0],['всю дорогу чтобы','всю дорогу, чтобы','запятая',0],['на две семьи','на два хозяина','так говорила бабушка',0],['в ноябре месяце','в ноябре','лишнее слово',0],['пятьдесят седьмом','1957-м','даты — цифрами',1]].map(([w,n,c,sh],j)=>`<div class="row" data-n="${j}" data-s="${sh}"${sh?' hidden':''}><span class="tx"><span class="was">${w}</span> → <span class="now">${n}</span><small>${c}</small></span><span class="ok" data-ok title="Принять правку">✓<i>принять</i></span><span class="no" data-no title="Оставить как было">✕<i>оставить</i></span></div>`).join('')}</div>${keys([['Принять все','okall'],['Открыть главу']])}`,n:1};
 if(k==='record')return{c:'Записать голос',l:reel(false),r:recRight('ready'),n:1};
 if(k==='send')return{c:'Вопрос недели',ph:1,l:`<div class="phone"><img src="${A}archive/phone3.webp" alt=""><div class="scr"><div class="glow"></div><div class="time">10:00</div><div class="ntf"><b></b><span>Вопрос недели<small>от Нины Петровны · сейчас</small></span></div><div class="body"><i>вопрос недели</i><h4>Какое блюдо в детстве было праздничным?</h4><small>ответьте, как удобно</small><div class="mic"></div><div class="alt"><span>написать</span><span>фото</span></div></div></div></div>`,
   r:`<div class="kk">новый вопрос недели</div><h2>Кому отправить</h2><div class="sub">так вопрос увидят родные · ответят по ссылке, без регистрации</div><div class="rule"></div><div class="chips">${['детство','дом','праздники','любовь','война','работа'].map((t,j)=>`<span class="${j===2?'on':''}">${t}</span>`).join('')}</div><div class="list" style="max-height:30vh">${[['grandma_porch','Нина Петровна','бабушка · телефон'],['mother_daughter','Мама','почта'],['mountains_father_son','Сергей','телефон'],['girl_flowers','Варя','телефон'],['nikolai_portrait','Николай','почта']].map(([f,n,s])=>`<div class="row"><b class="av" style="background-image:url('${P}${f}.jpg')"></b><span class="tx">${n}<small>${s}</small></span><span class="tick">✓</span></div>`).join('')}</div>${keys(['Отправить в понедельник','Другой вопрос','+ Пригласить'])}`,n:1};
 return null;};
const recRight=(st,len)=>{const head=`<div class="kk">записать голос</div><h2 class="q">Каким был ваш первый дом?</h2><div class="rule"></div>`;
 if(st==='ready')return head+`<div class="recrow"><span class="recbtn" data-rec></span><span>Нажмите, чтобы начать запись</span></div><div class="mic"><b>Нужен микрофон.</b> Браузер спросит разрешение — нажмите «Разрешить». Если запись не начинается: откройте конструктор по адресу https:// (или localhost) и проверьте, что микрофон разрешён для браузера (в Windows: Параметры → Конфиденциальность → Микрофон).<u data-act="preview">Посмотреть, как это выглядит, без микрофона</u></div><p class="story" style="font-size:17px">Говорите спокойно, как за столом. Паузы можно — лишнее потом вырежем. Сбились — просто продолжайте.</p>${keys([['Другой вопрос','q2'],['Без вопроса, просто рассказ','free']])}`;
 if(st==='rec')return head+`<div class="onair"><i></i>идёт запись <b data-timer>0:00</b></div><div class="recrow"><span class="recbtn stop" data-stop></span>${wf(90,0,true)}</div><p class="story" style="font-size:17px">Нажмите «стоп», когда закончите. Запись никуда не уйдёт, пока вы её не сохраните.</p>`;
 if(st==='preview')return head+`<div class="sub" style="margin-bottom:14px">Пример записи · ${fmt(len)}</div><div class="pl"><span class="pp paused" data-play data-len="${len}"></span>${wf(110,0)}</div><div class="tm"><span data-cur>0:00</span><span data-left>${fmt(len)}</span></div><p class="story" style="font-size:16px">Так выглядит готовая запись. Ваша сохранится в «Голоса» и получит QR-код для книги.</p>${keys([['Записать по-настоящему','again']])}`;
 return head+`<div class="sub" style="margin-bottom:14px">Записано ${fmt(len)}</div><div class="pl"><span class="pp paused" data-play data-rec-blob></span>${wf(110,0)}</div><div class="tm"><span data-cur>0:00</span><span data-left>${fmt(len)}</span></div>${keys([['Сохранить в архив','save'],['Записать заново','again']])}`;};

// ---------- the overlay ----------
let root=null,where=null,list=[],at=0,audio=null,rec=null,recBlob=null,recLen=0,recT=0,timers=[];
const later=(f,ms)=>timers.push(setTimeout(f,ms));
const knight=`<div class="knight"><div class="nb"></div><div class="na"></div><div class="nm"></div><div class="nw"></div><div class="ni"></div><div class="nv"></div></div><div class="dim"></div>`;
const top=(crumb)=>`<div class="top"><span class="crumb" data-back>‹ ${esc(crumb)}</span><span class="x" data-close>✕</span></div>`;
const stopAudio=(ended)=>{if(audio){audio.pause();audio=null;}root?.querySelectorAll('.bigdisc.playing').forEach(d=>d.classList.remove('playing'));root?.querySelectorAll('[data-play]').forEach(b=>b.classList.add('paused'));deck2.stop(ended);};
// the turntable: the record turns up to speed and runs down slowly; the arm lifts, swings, lowers and tracks the groove
const deck2={ang:0,vel:0,target:0,raf:0,last:0,f:0,armOn:false,ts:[],
  el(){return root&&root.querySelector('.tt');},
  loop(now){const d=deck2,tt=d.el();if(!tt){d.raf=0;return;}const dt=Math.min(.05,(now-(d.last||now))/1000);d.last=now;
    d.vel+=(d.target-d.vel)*Math.min(1,dt*(d.target>d.vel?2.2:.9));d.ang=(d.ang+d.vel*dt)%360;tt.querySelector('.spin').style.transform=`rotate(${d.ang.toFixed(2)}deg)`;
    if(d.target===0&&d.vel<.5){d.vel=0;d.raf=0;d.last=0;return;}d.raf=requestAnimationFrame(d.loop);},
  spin(on){this.target=on?120:0;if(!this.raf){this.last=0;this.raf=requestAnimationFrame(this.loop);}},
  arm(rot,{up,track}={}){const a=this.el()?.querySelector('.arm');if(!a)return;a.classList.toggle('up',!!up);a.classList.toggle('track',!!track);a.style.setProperty('--rot',rot.toFixed(2)+'deg');},
  clear(){this.ts.forEach(clearTimeout);this.ts=[];},
  start(go){const d=this;d.clear();d.spin(true);const pos=ARM.start+(ARM.end-ARM.start)*d.f;
    if(d.armOn){d.arm(pos,{up:true});d.ts.push(setTimeout(()=>{d.arm(pos);crackle();d.ts.push(setTimeout(go,380));},420));return;}
    d.arm(+ARM.rest,{up:true});d.ts.push(setTimeout(()=>d.arm(pos,{up:true}),260));
    d.ts.push(setTimeout(()=>{d.arm(pos);crackle();d.armOn=true;d.ts.push(setTimeout(go,420));},1500));},
  track(f){this.f=f;this.arm(ARM.start+(ARM.end-ARM.start)*f,{track:true});},
  stop(ended){const d=this;d.clear();d.spin(false);if(!d.el())return;
    if(ended){d.f=0;d.arm(ARM.end,{up:true});d.ts.push(setTimeout(()=>{d.arm(+ARM.rest,{up:true});d.armOn=false;},450));d.ts.push(setTimeout(()=>d.arm(+ARM.rest),1800));}
    else if(d.armOn)d.arm(ARM.start+(ARM.end-ARM.start)*d.f,{up:true});},
  reset(){this.clear();this.ang=0;this.vel=0;this.target=0;this.f=0;this.armOn=false;}};
// the needle touching the record: a short soft crackle, made on the spot
const crackle=()=>{try{const C=new (window.AudioContext||window.webkitAudioContext)();const n=C.createBuffer(1,Math.floor(C.sampleRate*.8),C.sampleRate),b=n.getChannelData(0);
  for(let i=0;i<b.length;i++){const k=1-i/b.length;b[i]=((Math.random()<.003)?(Math.random()*2-1)*.7:0)+(Math.random()*2-1)*.025*k;}
  const src=C.createBufferSource(),g=C.createGain(),lp=C.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3200;g.gain.value=.45;src.buffer=n;src.connect(lp).connect(g).connect(C.destination);src.start();setTimeout(()=>C.close(),1400);}catch(_){}};
const render=html=>{stopAudio();deck2.reset();timers.forEach(clearTimeout);timers=[];root.innerHTML=knight+html;if(keeper.box)root.appendChild(keeper.box);};
const showDesk=()=>{where={v:'desk'};setTimeout(()=>{if(where&&where.v==='desk')keeper.say('desk');},1600);render(`${top('Конструктор')}<header><h1>Архив семьи</h1><p>Всё, что присылают родные, — под одним деревом</p></header><div class="tdesk"><img class="tree" src="${A}archive/tree-mist.webp" alt=""><img class="book" src="${A}keeper/desk-spread.webp" alt="">${SECS.map(s=>`<div class="sec at-${s.k}" data-sec="${s.k}"><div class="obj">${s.o()}</div>${s.nw?'<span class="new">новое</span>':''}<b>${s.t}</b><small>${s.n()}</small></div>`).join('')}</div>`);};
const showSec=k=>{if(k==='week'||k==='edits'||CAR.includes(k)){showPage(k,0,true);return;}showAll(k);};
const showAll=k=>{const s=SECS.find(x=>x.k===k);
  where={v:'sec',k};list=items(k);
  render(`${top('Архив')}<header><h1>${s.t}</h1><p>${s.n()}</p></header><div class="spread">${list.length?list.map((it,i)=>`<div class="it" data-i="${i}" style="--d:${(.06*i).toFixed(2)}s;--r:${((i*37%7)-3)*.8}deg"><div class="vis">${it.h}</div><strong>${esc(it.t)}</strong><em>${esc(it.s)}</em></div>`).join(''):'<div class="empty">Здесь пока пусто</div>'}</div>${k==='voices'?`<div class="sp-acts"><button class="k main" data-go="record">● Записать голос</button></div>`:''}`);};
// the carousel: the other things of the section stand behind the main one, smaller and in the dark
const CAR=['photos','voices','letters','texts'];
const nbVis=(k,j)=>{const mine=store.get();
  if(k==='photos'){const x=D.photos[j];return frame(P+x[0]+'.jpg',x[7]);}
  if(k==='voices'){const f=j<mine.length?'grandma_porch':D.voices[j-mine.length][0];return `<div class="nbd"><img src="${A}keeper/desk-vinyl-disc.webp" alt=""><i style="background-image:url('${P}${f}.jpg')"></i></div>`;}
  if(k==='letters')return `<img class="nbe" src="${A}archive/envelope.webp" alt="">`;
  if(k==='texts'){const x=D.texts[j];return `<div class="nbs"><b>${x[0]}</b>${x[2].split('|')[0]}</div>`;}
  return '';};
const carousel=(k,i,n,main,dir)=>{if(!CAR.includes(k)||n<2)return main;
  const at=d=>(i+d+n*4)%n,sides=n>2?[-2,-1,1,2]:[1];
  return `<div class="cr">${sides.filter(d=>n>4||Math.abs(d)===1).map(d=>`<div class="nbr ${d<0?'l':'r'}${Math.abs(d)}" data-go-i="${at(d)}">${nbVis(k,at(d))}</div>`).join('')}<div class="mainv${dir?' from-'+(dir>0?'r':'l'):''}">${main}</div>
    <div class="cnt"><b data-nav="-1">‹</b><span>${i+1} из ${n}</span><b data-nav="1">›</b><em data-all>все записи</em></div></div>`;};
const IB='ocherkiArchiveInBook',ED='ocherkiArchiveEdits';
const getJ=n=>{try{return JSON.parse(localStorage.getItem(n)||'{}');}catch(_){return{};}},setJ=(n,v)=>{try{localStorage.setItem(n,JSON.stringify(v));}catch(_){}};
const toast=t=>{root.querySelector('.toast')?.remove();const d=document.createElement('div');d.className='toast';d.textContent=t;root.appendChild(d);setTimeout(()=>d.remove(),3200);};
const showPage=(k,i,fromDesk,dir)=>{const p=page(k,i);if(!p)return;where={v:'page',k,i,fromDesk};at=i;const isCar=CAR.includes(k)&&p.n>1;
  const nav=p.n>1&&!isCar?`<div class="nav"><b data-nav="-1">‹ предыдущее</b><span>${i+1} из ${p.n}</span><b data-nav="1">следующее ›</b></div>`:'';
  render(`${top(fromDesk?'Архив':p.c)}${SCENE[k]?`<img class="scene s-${k}" src="${A}archive/${SCENE[k]}" alt="">`:''}<div class="page${k==='photos'?' has-road':''} pg-${k}"><div class="obj${p.ph?' phn':''}">${carousel(k,i,p.n,p.l,dir)}</div><div class="info">${p.r}${nav}</div></div>${k==='photos'?road(i):''}`);
  if(k==='photos')walkTo(i);
  keeper.say(k);
  // our paper: the studio's blind emboss at the head of the sheet, as on the start's sheet
  root.querySelectorAll('.pg-texts .mainv .sheet,.pg-edits .sheet').forEach(sh=>{if(sh.querySelector('.emb'))return;const e=document.createElement('i');e.className='emb';e.innerHTML='<b></b><em>Evstafiadi</em><s>мастерская дизайна</s>';sh.prepend(e);});
  // «В книгу» and «Изменить» on every thing; what was changed is kept
  const key=k+':'+i,info=root.querySelector('.info');
  info.querySelectorAll('.keys .k').forEach(b=>{const t=b.textContent.trim();if(t==='В книгу'){b.dataset.act='tobook';if(getJ(IB)[key]){b.textContent='✓ В книге';b.classList.add('done');}}if(t==='Изменить')b.dataset.act='edit';});
  const ed=getJ(ED)[key];if(ed)info.querySelectorAll('h2,.sub,.story,dd').forEach((e,j)=>{if(ed[j]!=null)e.innerHTML=ed[j];});
  if(k==='edits')root.querySelectorAll('.row[data-n]').forEach(r=>r.addEventListener('mouseenter',()=>{const n=r.dataset.n;root.querySelectorAll('.row,.e').forEach(x=>x.classList.toggle(x.classList.contains('row')?'on':'hl',x.dataset.n===n));}));};
// play: a real recording plays its sound; a demo one only turns, the wave advancing in time
const play=async b=>{const d=root.querySelector('.bigdisc');const on=b.classList.contains('paused');stopAudio();if(!on)return;
  b.classList.remove('paused');const hasTT=!!root.querySelector('.tt');if(!hasTT)d?.classList.add('playing');
  if(hasTT){await new Promise(r=>deck2.start(r));if(b.classList.contains('paused'))return;}const cur=root.querySelector('[data-cur]'),left=root.querySelector('[data-left]'),bars=[...root.querySelectorAll('.info .wf i')],head=root.querySelector('.info .wf .head');
  let len=+b.dataset.len||recLen||60;let el=null;
  if(b.dataset.id){const blob=await getAudio(b.dataset.id);if(blob){el=new Audio(URL.createObjectURL(blob));}}
  else if(b.hasAttribute('data-rec-blob')&&recBlob){el=new Audio(URL.createObjectURL(recBlob));}
  const off=root.querySelector('.tt')?deck2.f:0;const t0=performance.now();const fake={pause(){fake.stopped=1;}};audio=el||fake;if(el){el.onloadedmetadata=()=>{if(isFinite(el.duration)){len=el.duration;if(off)el.currentTime=off*len;}};el.play().catch(()=>{});}
  const tick=()=>{if(audio!==(el||fake)||fake.stopped)return;const t=el?el.currentTime:(performance.now()-t0)/1000+off*len;const f=Math.min(1,t/len);
    if(cur)cur.textContent=fmt(t);if(left)left.textContent=(left.textContent.includes('осталось')?'осталось ':'')+fmt(len-t);
    bars.forEach((x,k)=>x.classList.toggle('p',k/bars.length<f));if(head)head.style.left=(f*100)+'%';if(root.querySelector('.tt'))deck2.track(f);
    if(f>=1||(el&&el.ended)){stopAudio(true);return;}requestAnimationFrame(tick);};requestAnimationFrame(tick);};
// recording, with the microphone
const startRec=async()=>{let st;try{st=await navigator.mediaDevices.getUserMedia({audio:true});}catch(_){const m=root.querySelector('.info .mic');if(m){m.classList.remove('warn');void m.offsetWidth;m.classList.add('warn');}toast('Нет доступа к микрофону — см. подсказку ниже');return;}
  const ch=[];rec=new MediaRecorder(st);rec.ondataavailable=e=>e.data.size&&ch.push(e.data);
  rec.onstop=()=>{st.getTracks().forEach(t=>t.stop());recBlob=new Blob(ch,{type:rec.mimeType||'audio/webm'});recLen=(performance.now()-recT)/1000;root.querySelector('.reel1')?.classList.remove('on');root.querySelector('.info').innerHTML=recRight('done',recLen);};
  rec.start();recT=performance.now();root.querySelector('.reel1')?.classList.add('on');root.querySelector('.info').innerHTML=recRight('rec');
  const tm=()=>{const t=root?.querySelector('[data-timer]');if(!t||!rec||rec.state!=='recording')return;t.textContent=fmt((performance.now()-recT)/1000);setTimeout(tm,250);};tm();};
const saveRec=async()=>{if(!recBlob)return;const id='v'+Date.now().toString(36);await putAudio(id,recBlob);const mine=store.get();
  mine.unshift({id,t:'Каким был ваш первый дом?',len:recLen,when:new Date().toLocaleDateString('ru-RU',{day:'numeric',month:'long'})});store.set(mine);recBlob=null;showPage('voices',0,true);};
const cycle=()=>{const dk=root.querySelector('#oaDeck');if(!dk)return;const t=dk.querySelector('[data-d="0"]');t.classList.add('out');
  later(()=>{dk.querySelectorAll('.card').forEach(c=>{if(c!==t)c.dataset.d=+c.dataset.d-1;});t.dataset.d=3;requestAnimationFrame(()=>t.classList.remove('out'));},700);};
const back=()=>{if(rec&&rec.state==='recording')rec.stop();
  if(!where||where.v==='desk'){close();return;}
  if(where.v==='page'&&!where.fromDesk&&where.k!=='record'&&where.k!=='send'){showSec(where.k);return;}
  if(where.k==='record'){showPage('voices',0,true);return;}if(where.k==='send'){showPage('week',0,true);return;}showDesk();};
const onClick=e=>{const t=e.target;
  if(t.closest('[data-close]')){close();return;}if(t.closest('[data-back]')){back();return;}
  const s=t.closest('[data-sec]');if(s){showSec(s.dataset.sec);return;}
  const it=t.closest('.it[data-i]');if(it&&where.v==='sec'){showPage(where.k,+it.dataset.i,true);return;}
  const pg=t.closest('[data-pg]');if(pg){const w=root.querySelector('.proofs');const n=3;const c=((+w.dataset.p+(+pg.dataset.pg))%n+n)%n;w.dataset.p=c;const ems=w.querySelectorAll('.pnav em');ems[0].textContent=c+1;ems[1].textContent=[4,1,0][c];root.querySelectorAll('.pg-edits .row[data-s]').forEach(r=>r.hidden=+r.dataset.s!==c);const em=root.querySelector('.pg-edits .noedits');if(em)em.hidden=c!==2;return;}
  const nv=t.closest('[data-nav]');if(nv){step(+nv.dataset.nav);return;}
  const gi=t.closest('[data-go-i]');if(gi){const j=+gi.dataset.goI,p=page(where.k,0);const d=((j-where.i+p.n)%p.n)<=p.n/2?1:-1;showPage(where.k,j,where.fromDesk,d);return;}
  if(t.closest('[data-all]')){showAll(where.k);return;}
  const go=t.closest('[data-go]');if(go){showPage(go.dataset.go,0);return;}
  const pl=t.closest('[data-play]');if(pl){play(pl);return;}
  if(t.closest('[data-rec]')){startRec();return;}if(t.closest('[data-stop]')){rec&&rec.stop();return;}
  const a=t.closest('[data-act]')?.dataset.act;
  if(a==='tobook'){const b=t.closest('[data-act]'),key=where.k+':'+where.i,m=getJ(IB);if(m[key]){delete m[key];b.textContent='В книгу';b.classList.remove('done');toast('Убрано из книги');}else{m[key]=Date.now();b.textContent='✓ В книге';b.classList.add('done');toast('Отмечено для книги — появится в «Рукописи» при сборке главы');}setJ(IB,m);return;}
  if(a==='edit'){const b=t.closest('[data-act]'),info=root.querySelector('.info'),els=[...info.querySelectorAll('h2,.sub,.story,dd')],on=b.dataset.on!=='1';
    els.forEach(e=>e.contentEditable=on?'true':'false');if(on){b.dataset.on='1';b.textContent='Сохранить';els[0]?.focus();}else{b.dataset.on='0';b.textContent='Изменить';const m=getJ(ED);m[where.k+':'+where.i]=els.map(e=>e.innerHTML);setJ(ED,m);toast('Сохранено');}return;}
  if(a==='preview'){const inf=root.querySelector('.info');root.querySelector('.reel1')?.classList.add('on');inf.innerHTML=recRight('rec');const t0=performance.now();const tm=()=>{const x=root?.querySelector('[data-timer]');if(!x)return;const s=(performance.now()-t0)/1000;x.textContent=fmt(s);if(s<6)setTimeout(tm,250);else{root.querySelector('.reel1')?.classList.remove('on');inf.innerHTML=recRight('preview',42);}};tm();return;}
  if(a==='save'){saveRec();return;}if(a==='again'){recBlob=null;root.querySelector('.info').innerHTML=recRight('ready');return;}
  if(a==='cycle'){cycle();return;}if(a==='send'){showPage('send',0);return;}
  if(a==='okall'){root.querySelectorAll('.row[data-n]').forEach(r=>accept(r));return;}
  const ok=t.closest('[data-ok]');if(ok){accept(ok.closest('.row'));return;}
  const no=t.closest('[data-no]');if(no){const r=no.closest('.row');if(r.dataset.done)return;const e=root.querySelector(`.e[data-n="${r.dataset.n}"]`);if(e){if(e.dataset.orig==null)e.dataset.orig=e.innerHTML;e.querySelector('.over,.mark')?.remove();e.querySelector('del')&&e.querySelector('del').replaceWith(...e.querySelector('del').childNodes);}markRow(r,false);return;}
  if(t.closest('[data-undo]')){undoRow(t.closest('.row'));return;}
  const ar=t.closest('.row[data-ans]');if(ar){const i=+ar.dataset.ans;where.sel=i;const obj=root.querySelector('.obj');obj.classList.remove('phn');obj.innerHTML=ansLeft(D.week.ans[i]);root.querySelector('.info').innerHTML=qsRight(i);return;}
  const f=t.closest('.chips [data-f]');if(f){root.querySelectorAll('.chips span').forEach(x=>x.classList.toggle('on',x===f));root.querySelectorAll('.row[data-ty]').forEach(r=>r.style.display=!f.dataset.f||r.dataset.ty===f.dataset.f?'':'none');return;}};
const step=d=>{if(!where||where.v!=='page')return;const p=page(where.k,0);if(p.n<2)return;showPage(where.k,(where.i+d+p.n)%p.n,where.fromDesk,d);};
let wheelAt=0;const onWheel=e=>{if(!root||where?.v!=='page'||!e.target.closest('.cr'))return;e.preventDefault();const v=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;if(Math.abs(v)<12||performance.now()-wheelAt<650)return;wheelAt=performance.now();step(v>0?1:-1);};
let tx0=null;const onTs=e=>{if(e.target.closest('.cr'))tx0=e.touches[0].clientX;},onTe=e=>{if(tx0==null)return;const dx=e.changedTouches[0].clientX-tx0;tx0=null;if(Math.abs(dx)>50)step(dx<0?1:-1);};
// accepting a correction: the red ink fades, the new word stays in the line
const markRow=(r,ok)=>{r.dataset.done=1;r.classList.add(ok?'acc':'rej');let st=r.querySelector('.st');if(!st){st=document.createElement('span');st.className='st';r.appendChild(st);}st.innerHTML=`${ok?'✓ принято':'оставлено как было'} · <u data-undo>отменить</u>`;};
const undoRow=r=>{const e=root.querySelector(`.e[data-n="${r.dataset.n}"]`);if(e&&e.dataset.orig!=null)e.innerHTML=e.dataset.orig;r.classList.remove('acc','rej');delete r.dataset.done;r.querySelector('.st')?.remove();};
const accept=r=>{if(!r||r.dataset.done)return;const e=root.querySelector(`.e[data-n="${r.dataset.n}"]`);if(e){if(e.dataset.orig==null)e.dataset.orig=e.innerHTML;const o=e.querySelector('.over'),d=e.querySelector('del'),m=e.querySelector('.mark');
  if(o&&d){d.replaceWith(document.createTextNode(o.textContent));o.remove();}if(m){m.style.color='inherit';m.style.font='inherit';}e.classList.add('took');setTimeout(()=>e.classList.remove('took'),1400);}markRow(r,true);};
const onKey=e=>{if(!root)return;const tg=(e.composedPath&&e.composedPath()[0])||e.target;if(tg.isContentEditable&&e.key!=='Escape')return;if(e.key==='Escape'){e.preventDefault();back();}if(where?.v==='page'&&(e.key==='ArrowRight'||e.key==='ArrowLeft'))step(e.key==='ArrowRight'?1:-1);};
const open=(w='desk')=>{inject();if(!root){root=document.createElement('div');root.className='oar';SR.appendChild(root);keeper.mount();root.addEventListener('click',onClick);root.addEventListener('wheel',onWheel,{passive:false});root.addEventListener('touchstart',onTs,{passive:true});root.addEventListener('touchend',onTe,{passive:true});addEventListener('keydown',onKey,true);requestAnimationFrame(()=>requestAnimationFrame(()=>root.classList.add('in')));}
  if(w==='desk')showDesk();else if(['record','send'].includes(w))showPage(w,0);else if(SECS.some(s=>s.k===w))showSec(w);else showDesk();};
const close=()=>{if(!root)return;keeper.quiet();setTimeout(()=>keeper.unmount(),600);stopAudio();if(rec&&rec.state==='recording')rec.stop();const r=root;root=null;where=null;removeEventListener('keydown',onKey,true);r.classList.remove('in');setTimeout(()=>r.remove(),600);};
window.OcherkiArchive={open,close,get isOpen(){return!!root;}};
// the constructor's keys open it: the pill «Архив семьи» and the six keys under it
const MAP={voice:'voices',photo:'photos',note:'texts',letter:'letters',record:'record',week:'week'};
document.addEventListener('click',e=>{const pl=e.target.closest('button.pl[data-w="arch"]');const k=e.target.closest('button.k[data-k]');
  if(pl){e.preventDefault();e.stopImmediatePropagation();open('desk');return;}
  if(k&&MAP[k.dataset.k]){e.preventDefault();e.stopImmediatePropagation();open(MAP[k.dataset.k]);}},true);
})();
