/* «Что умеет конструктор» — the Keeper's tour, one module for the way in (index.html) and for «Знакомство» (shell.html).
   The host gives a container (a dark stage that already holds the Keeper's canvas) and the Keeper himself;
   the tour lays its words and drawn cards over it and moves him from card to card.
   OcherkiTour.create(host, {K, script, serif, photos, greeting, last, onDone(reason)}) → {start(), stop(), back(), next()} */
(()=>{
const CSS=`
.okt{position:absolute;inset:0;font-family:var(--okt-serif);color:#f6ead8;pointer-events:none}
.okt>*{pointer-events:auto}
/* the heading: the Keeper's pen writes the word itself (above), here only what follows it, in plain type */
.okt .hd{position:absolute;left:0;right:0;top:calc(5% + 108px);text-align:center;pointer-events:none}
.okt .hd h2{display:none;margin:0 0 6px;font:400 64px/1.25 var(--okt-script);color:#ffe2bd;text-shadow:0 0 18px rgba(255,150,60,.5)}
.okt.nok .hd h2{display:block}.okt.nok .hd{top:7%}
.okt .hd .sub{font:italic 30px/1.3 var(--okt-serif);color:#f6e3c4}
.okt .hd p{margin:10px auto 0;max-width:900px;font:21px/1.5 var(--okt-serif);color:#e2cba6}
/* words come out of the mist and go back into it */
.okt .mist{transition:opacity 1.1s ease,filter 1.2s ease}
.okt .mist.out{opacity:0;filter:blur(12px);transition:opacity .6s ease,filter .6s ease}
.okt .say{position:absolute;left:50%;top:60%;translate:-50% 0;width:min(900px,86vw);text-align:center;pointer-events:none}
.okt .say .l1{display:block;font:400 30px/1.3 var(--okt-serif);color:#f6e3c4;letter-spacing:.01em}
.okt .say .l2{display:block;margin-top:2px;font:400 64px/1.25 var(--okt-script);color:#ffe2bd;text-shadow:0 0 18px rgba(255,150,60,.45)}
.okt .say .l3{display:block;margin-top:16px;font:italic 22px/1.5 var(--okt-serif);color:#e2cba6}
.okt .deck{position:absolute;left:50%;top:58%;width:0;height:0;perspective:1600px;pointer-events:none}
.okt .cd{position:absolute;left:0;top:0;transform-style:preserve-3d;transition:transform 1.2s cubic-bezier(.2,.8,.25,1),opacity 1s ease,filter 1s ease;opacity:0}
.okt .cd.in{opacity:1}.okt .cd.past{opacity:0;filter:blur(4px)}
/* the host's own card styles (the e-mail and books cards are .cd too) never reach these */
.okt .deck .cd{padding:0;border:0;border-radius:0;background:none;flex:none;min-width:0;box-shadow:none;cursor:default;transition:transform 1.2s cubic-bezier(.2,.8,.25,1),opacity 1s ease,filter 1s ease}
.okt .deck .cd:hover{box-shadow:none}
.okt .deck .cd.sheet{padding:44px 50px 60px;background:radial-gradient(ellipse 85% 80% at 50% 45%,rgba(0,0,0,0) 60%,rgba(120,80,40,.16)),linear-gradient(172deg,#f8f0e0,#ecdfc5);box-shadow:0 30px 60px rgba(0,0,0,.55)}
.okt .deck .qcard span{display:block;margin:0;font:italic 36px/1.2 var(--okt-serif);color:#3b2a1c}
.okt .deck .qcard b{display:block;margin:0 0 18px;font:500 13px var(--okt-serif);letter-spacing:.3em;text-transform:uppercase;color:#8a6a48}
.okt .deck .cov b{display:block;font:500 13px var(--okt-serif);letter-spacing:.34em;text-transform:uppercase;color:#e8c58e;opacity:.8}
.okt .deck .cov strong{display:block;margin:14px 0 12px;font:400 54px/1.12 var(--okt-script);color:#f3d39f;text-shadow:0 1px 0 rgba(0,0,0,.5)}
.okt .deck .cov span{display:block;margin-top:14px;font:italic 19px var(--okt-serif);color:#e8c58e;opacity:.85}
/* the keys come last, once the words have been read */
.okt .nav{position:absolute;left:0;right:0;bottom:6%;display:flex;justify-content:center;align-items:center;gap:26px;transition:opacity .9s ease}
.okt .skip{transition:opacity .9s ease,color .5s}
.okt.wait .nav,.okt.wait .skip{opacity:0;pointer-events:none}
.okt .nav .back[hidden]{display:none}
.okt .dots[hidden]{display:none}
.okt .dots{display:flex;gap:10px}.okt .dots i{width:7px;height:7px;border-radius:50%;background:rgba(214,150,96,.35);transition:background .6s,box-shadow .6s}.okt .dots i.on{background:#ffd9a8;box-shadow:0 0 8px 2px rgba(255,150,60,.7)}
.okt .btn{height:50px;padding:0 30px;border-radius:25px;border:1px solid rgba(214,150,96,.55);background:none;color:#f2e0c2;font:italic 20px var(--okt-serif);cursor:pointer;transition:border-color .6s,box-shadow .9s,translate .3s}
.okt .btn:hover{border-color:rgba(255,206,150,.95);box-shadow:0 0 14px 2px rgba(255,150,60,.4)}
.okt .btn.main{border-color:rgba(255,206,150,.95);color:#ffe9c9;box-shadow:0 0 14px 3px rgba(255,150,60,.55),0 0 34px 8px rgba(255,120,40,.22)}
.okt .btn:active{translate:0 2px}
.okt .skip{position:absolute;right:3%;top:4%;font:italic 18px var(--okt-serif);color:#d6b48a;cursor:pointer}.okt .skip:hover{color:#ffd9a8}
/* 1 — the sheet: a page written by hand from edge to edge, slightly aged; the lines come one after another */
.okt .sheet{width:530px;height:600px;margin:-300px 0 0 -265px;border-radius:0;box-sizing:border-box;color:#3b2a1c;overflow:hidden}
.okt .sheet::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:.5;mix-blend-mode:multiply;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='620'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.02' numOctaves='2' seed='5'/%3E%3CfeColorMatrix values='0 0 0 0 .55 0 0 0 0 .38 0 0 0 0 .18 0 0 0 1.2 -.72'/%3E%3C/filter%3E%3Crect width='480' height='620' filter='url(%23f)'/%3E%3C/svg%3E")}
.okt .sheet .ttl{font:500 12px var(--okt-serif);letter-spacing:.24em;text-transform:uppercase;text-align:center;color:#8a6a48;margin-bottom:6px}
.okt .sheet .hh{font:400 34px/1.2 var(--okt-script);text-align:center;color:#4b3424;margin-bottom:10px}
.okt .sheet .tx{font:400 17px/1.5 var(--okt-script);color:#3e2c1e;text-align:left;hyphens:none}
.okt .sheet .tx span{opacity:0;transition:opacity .7s ease;transition-delay:calc(var(--i) * 90ms)}
.okt .deck .sheet .tx span{display:inline;margin:0;font:inherit;color:inherit}
.okt .cd.play .sheet .tx span,.okt .sheet.play .tx span{opacity:.92}
/* 2 — one record, in the middle, nothing beside it */
.okt .voice{width:0;height:0}
.okt .voice{translate:0 -24px}
.okt .vin{position:absolute;left:-200px;top:-200px;width:400px;height:400px;z-index:5;border-radius:50%;background:repeating-radial-gradient(circle,#141010 0 1.4px,#211a16 1.4px 3px);box-shadow:0 0 0 2px rgba(255,200,140,.9),0 0 30px 6px rgba(255,150,60,.5),0 30px 60px rgba(0,0,0,.6)}
.okt .vin .sp{position:absolute;inset:0;border-radius:50%}
.okt .voice.play .vin .sp{animation:oktSpin 6s linear infinite}
@keyframes oktSpin{to{transform:rotate(360deg)}}
.okt .vin .lb{position:absolute;left:32%;top:32%;width:36%;height:36%;border-radius:50%;background:#3a2a1c center/cover;filter:sepia(.35);box-shadow:0 0 0 3px #2a201a}
.okt .vin .shine{position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 210deg,transparent 0 10%,rgba(255,235,210,.14) 14%,transparent 20% 60%,rgba(255,235,210,.09) 66%,transparent 72%)}
.okt .vin .hole{position:absolute;left:50%;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:#0b0705;box-shadow:inset 0 1px 2px rgba(0,0,0,.8),0 0 0 2px rgba(255,220,180,.25)}
.okt .voice .far{position:absolute;top:-170px;width:340px;height:340px;border-radius:50%;background:repeating-radial-gradient(circle,#141010 0 1.4px,#211a16 1.4px 3px);box-shadow:0 0 0 1px rgba(255,200,140,.35),0 24px 40px rgba(0,0,0,.6)}
.okt .voice .far::after{content:"";position:absolute;left:34%;top:34%;width:32%;height:32%;border-radius:50%;background:#3a2a1c center/cover;background-image:var(--im);filter:sepia(.5) brightness(.8)}
.okt .voice .far.l1{left:-430px;transform:scale(.82);filter:brightness(.55);z-index:4}.okt .voice .far.l2{left:-600px;transform:scale(.66);filter:brightness(.32);z-index:3}.okt .voice .far.l3{left:-730px;transform:scale(.52);filter:brightness(.16);z-index:2}
.okt .voice .far.r1{left:90px;transform:scale(.82);filter:brightness(.55);z-index:4}.okt .voice .far.r2{left:260px;transform:scale(.66);filter:brightness(.32);z-index:3}.okt .voice .far.r3{left:390px;transform:scale(.52);filter:brightness(.16);z-index:2}
/* 3 — the question card (the same deck as in «Вопрос недели»), the phone, and the two ways between them */
.okt .week{width:0;height:0}
.okt .qdeck{position:absolute;left:-560px;top:-150px;width:520px;height:290px}
.okt .qdeck .u{position:absolute;inset:0;border-radius:6px;background:#e2d3b6;box-shadow:0 14px 26px rgba(0,0,0,.45)}
.okt .qdeck .u1{transform:rotate(-3deg) translate(-8px,14px)}.okt .qdeck .u2{transform:rotate(2deg) translate(10px,8px)}
.okt .qcard{position:absolute;inset:0;border-radius:6px;background:linear-gradient(170deg,#f6eddb,#e9dcc2);box-shadow:0 22px 44px rgba(0,0,0,.5);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:30px 50px;box-sizing:border-box;text-align:center;color:#3b2a1c}
.okt .qcard b{font:500 13px var(--okt-serif);letter-spacing:.3em;text-transform:uppercase;color:#8a6a48;margin-bottom:18px}
.okt .qcard span{font:italic 36px/1.2 var(--okt-serif);color:#3b2a1c}
.okt .phone{position:absolute;left:330px;top:-210px;width:210px;height:410px;border-radius:34px;background:#1b130d;box-shadow:0 0 0 2px rgba(214,150,96,.6),0 24px 50px rgba(0,0,0,.6);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:20px;box-sizing:border-box}
.okt .phone em{font:500 11px var(--okt-serif);letter-spacing:.24em;text-transform:uppercase;color:#c99a6a;font-style:normal}
.okt .phone i{font:italic 26px/1.2 var(--okt-serif);color:#ffe2bd;text-align:center;font-style:italic;text-shadow:0 0 10px rgba(255,150,60,.6)}
.okt .week svg{position:absolute;left:-30px;top:-120px;width:350px;height:240px;overflow:visible}
.okt .week svg path{fill:none;stroke:#ffcf8e;stroke-width:2.2;stroke-linecap:round;stroke-dasharray:7 10;filter:drop-shadow(0 0 4px rgba(255,150,60,.8))}
.okt .week svg path.hd2{stroke-dasharray:none;fill:#ffcf8e;stroke:none}
.okt .week.play svg path.go{animation:oktDash 1.4s linear infinite}
.okt .week.play svg path.ret{animation:oktDashR 1.4s linear infinite}
@keyframes oktDash{to{stroke-dashoffset:-34}}@keyframes oktDashR{to{stroke-dashoffset:34}}
/* 4 — the envelope: old paper, foxing and soft edges */
.okt .letter{width:0;height:0;translate:0 -40px}
.okt .letter .envl{position:absolute;left:-230px;top:-60px;width:460px;height:300px;filter:drop-shadow(0 26px 34px rgba(0,0,0,.55));z-index:2}
.okt .letter .envl>svg{position:absolute;inset:0;width:100%;height:100%}
.okt .letter .wax{position:absolute;left:50%;top:160px;width:92px;height:92px;margin:-46px 0 0 -46px;filter:drop-shadow(0 5px 7px rgba(0,0,0,.5))}
.okt .letter .wax img{width:100%;height:100%;display:block}
.okt .letter .wax b{position:absolute;inset:17% 22% 19%;font-size:0;background:#2a0301;-webkit-mask:url(assets/brand/logo-day-bare.png) center/contain no-repeat;mask:url(assets/brand/logo-day-bare.png) center/contain no-repeat;opacity:.9}
.okt .letter .wax b+b{inset:calc(17% - 1.5px) calc(22% + 1px) calc(19% + 1.5px) calc(22% - 1px);background:#e38d78;opacity:.5;mix-blend-mode:screen}
.okt .letter .lt{position:absolute;left:-190px;top:-40px;width:380px;height:260px;overflow:hidden;background:linear-gradient(170deg,#f7efdf,#eadcc0);box-shadow:0 6px 14px rgba(0,0,0,.3);padding:22px 28px;box-sizing:border-box;font:400 16px/1.42 var(--okt-script);color:#4b3424;z-index:1;transition:transform 1.4s cubic-bezier(.2,.8,.3,1) .3s}
.okt .letter.play .lt{transform:translateY(-190px)}
.okt .letter .pol{position:absolute;width:160px;height:180px;background:#f3ead9;padding:10px 10px 30px;box-shadow:0 18px 30px rgba(0,0,0,.5)}
.okt .letter .pol img{width:100%;height:100%;object-fit:cover;object-position:50% 12%;filter:sepia(.35)}
.okt .letter .pol i{position:absolute;left:0;right:0;bottom:7px;text-align:center;font:400 14px/1 var(--okt-script);white-space:nowrap;color:#4b3424;font-style:normal}
.okt .letter .pol.under{left:130px;top:-20px;transform:rotate(9deg);z-index:0}
.okt .letter .pol.side{left:-390px;top:-40px;transform:rotate(-8deg);z-index:3}
/* 5 — the book: a closed cover in the middle, nothing moving */
.okt .book{width:0;height:0}
.okt .book .cov{position:absolute;left:-180px;top:-262px;width:360px;height:480px;border-radius:3px 8px 8px 3px;background:radial-gradient(ellipse 90% 70% at 40% 30%,#6b3a1d,#3a1d0d 70%,#2a1408);box-shadow:inset 10px 0 14px -6px rgba(0,0,0,.6),inset -2px 0 0 rgba(255,220,180,.08),0 34px 60px rgba(0,0,0,.6);display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#e8c58e}
.okt .book .cov::before{content:"";position:absolute;inset:26px 24px 26px 34px;border:1px solid rgba(232,197,142,.55);box-shadow:inset 0 0 0 4px rgba(0,0,0,0),inset 0 0 0 5px rgba(232,197,142,.25)}
.okt .book .cov::after{content:"";position:absolute;left:12px;top:0;bottom:0;width:2px;background:rgba(0,0,0,.35);box-shadow:2px 0 0 rgba(255,220,180,.08)}
.okt .book .cov b{font:500 13px var(--okt-serif);letter-spacing:.34em;text-transform:uppercase;opacity:.8}
.okt .book .cov strong{margin:14px 0 12px;font:400 54px/1.12 var(--okt-script);font-weight:400;color:#f3d39f;text-shadow:0 1px 0 rgba(0,0,0,.5)}
.okt .book .cov i{width:56px;height:1px;background:rgba(232,197,142,.6)}
.okt .book .cov span{margin-top:14px;font:italic 19px var(--okt-serif);opacity:.85}
.okt .book .glow{position:absolute;left:-330px;top:-300px;width:660px;height:600px;border-radius:50%;background:radial-gradient(ellipse,rgba(255,150,60,.2),transparent 65%);pointer-events:none}
`;
const injectCSS=()=>{if(document.getElementById('okt-css'))return;const st=document.createElement('style');st.id='okt-css';st.textContent=CSS;document.head.appendChild(st);};
function create(host,o={}){
  injectCSS();const K=o.K||null,PH=o.photos||'qa/demo-book/photos/';
  const SEAL=`<div class="wax"><img src="assets/postcard/wax-seal.webp" alt=""><b></b><b></b></div>`;
  // the two ways between the card and the phone: the question goes out on top, the answer comes back below; arrowheads show where
  const ARR=`<svg viewBox="0 0 350 240"><path class="go" d="M10 92 C 110 20, 240 20, 330 80"/><path class="hd2" d="M333 82 l-15 -2 6 -12z"/>
    <path class="ret" d="M330 160 C 240 222, 110 222, 14 156"/><path class="hd2" d="M10 154 l15 1 -7 12z"/></svg>`;
  const S=[
    {w:'Пишите',sub:'книга сложится сама',p:'К каждой главе — свои вопросы. Пишите, как говорите: заголовки и заметки на полях появятся сами.',
     c:`<div class="cd sheet"><div class="ttl">глава 1 · начало</div><div class="hh">Детство</div><div class="tx"><span style="--i:0">Мама </span><span style="--i:1">впервые </span><span style="--i:2">увидела </span><span style="--i:3">трамвай, </span><span style="--i:4">когда </span><span style="--i:5">ей </span><span style="--i:6">было </span><span style="--i:7">шесть </span><span style="--i:8">лет. </span><span style="--i:9">Они </span><span style="--i:10">с </span><span style="--i:11">бабушкой </span><span style="--i:12">шли </span><span style="--i:13">по </span><span style="--i:14">Головинскому, </span><span style="--i:15">и </span><span style="--i:16">вдруг </span><span style="--i:17">из-за </span><span style="--i:18">угла </span><span style="--i:19">выехал </span><span style="--i:20">красный </span><span style="--i:21">вагон, </span><span style="--i:22">звенящий, </span><span style="--i:23">как </span><span style="--i:24">колокольчик. </span><span style="--i:25">Мама </span><span style="--i:26">спряталась </span><span style="--i:27">за </span><span style="--i:28">бабушкину </span><span style="--i:29">юбку, </span><span style="--i:30">а </span><span style="--i:31">потом </span><span style="--i:32">весь </span><span style="--i:33">вечер </span><span style="--i:34">рассказывала </span><span style="--i:35">соседям, </span><span style="--i:36">что </span><span style="--i:37">видела </span><span style="--i:38">«дом </span><span style="--i:39">на </span><span style="--i:40">колёсах». </span><span style="--i:41">Бабушка </span><span style="--i:42">смеялась </span><span style="--i:43">и </span><span style="--i:44">говорила, </span><span style="--i:45">что </span><span style="--i:46">в </span><span style="--i:47">Тифлисе </span><span style="--i:48">и </span><span style="--i:49">не </span><span style="--i:50">такое </span><span style="--i:51">увидишь. </span><span style="--i:52">Летом </span><span style="--i:53">мы </span><span style="--i:54">жили </span><span style="--i:55">у </span><span style="--i:56">тёти </span><span style="--i:57">Вари </span><span style="--i:58">на </span><span style="--i:59">Плехановском, </span><span style="--i:60">в </span><span style="--i:61">комнате </span><span style="--i:62">с </span><span style="--i:63">окном </span><span style="--i:64">во </span><span style="--i:65">двор, </span><span style="--i:66">где </span><span style="--i:67">росла </span><span style="--i:68">старая </span><span style="--i:69">груша. </span><span style="--i:70">По </span><span style="--i:71">субботам </span><span style="--i:72">пекли </span><span style="--i:73">хачапури, </span><span style="--i:74">и </span><span style="--i:75">весь </span><span style="--i:76">двор </span><span style="--i:77">пах </span><span style="--i:78">сыром </span><span style="--i:79">и </span><span style="--i:80">дымом. </span><span style="--i:81">Отец </span><span style="--i:82">уходил </span><span style="--i:83">рано, </span><span style="--i:84">а </span><span style="--i:85">возвращался </span><span style="--i:86">затемно, </span><span style="--i:87">приносил </span><span style="--i:88">нам </span><span style="--i:89">по </span><span style="--i:90">яблоку </span><span style="--i:91">и </span><span style="--i:92">садился </span><span style="--i:93">у </span><span style="--i:94">окна </span><span style="--i:95">читать </span><span style="--i:96">газету. </span></div></div>`},
    {w:'Голоса родных',sub:'пластинка в архиве и код в книге',p:'Запишите ответ голосом — он станет пластинкой в архиве, а в книге рядом с рассказом появится QR-код: наведёте телефон — и зазвучит голос.',
     c:`<div class="cd voice">${['l3','l2','l1','r1','r2','r3'].map((k,j)=>`<i class="far ${k}" style="--im:url('${PH}${['lake_two','mother_child_bw','girl_dog','city_tiflis','boy_dog','family_sunset'][j]}.jpg')"></i>`).join('')}<div class="vin"><div class="sp"><div class="lb" style="background-image:url('${PH}grandma_porch.jpg')"></div></div><div class="shine"></div><i class="hole"></i></div></div>`},
    {w:'Вопрос недели',sub:'вся семья — вместе',p:'Раз в неделю вопрос уходит родным на телефон, а ответ — голосом, словами или фото — возвращается в архив.',
     c:`<div class="cd week"><div class="qdeck"><i class="u u1"></i><i class="u u2"></i><div class="qcard"><b>вопрос недели</b><span>Как вы познакомились с дедушкой?</span></div></div>${ARR}<div class="phone"><em>Нине Петровне</em><i>Ответить голосом</i></div></div>`},
    {w:'Архив семьи',sub:'письма, фото и правки родных',p:'Всё, что присылают родные, собирается в архиве — и одним касанием ложится в книгу.',
     c:`<div class="cd letter"><div class="pol under"><img src="${PH}lake_two.jpg" alt=""></div><div class="lt">Дорогие мои, пишу вам из Тифлиса… Здесь уже настоящая весна, в садах цветут абрикосы, и воздух такой тёплый, что невольно думаешь о доме. Серёжа вырос — вы его не узнаете. Вчера ходили на Куру, смотрели, как ловят рыбу. Скучаю по вам, по нашей кухне и маминым пирогам. Целую всех крепко, ваша Нина</div>
       <div class="envl"><svg viewBox="0 0 460 300" preserveAspectRatio="none"><defs>
         <linearGradient id="oktEnv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ecdcbc"/><stop offset=".6" stop-color="#dcc39a"/><stop offset="1" stop-color="#c9ab7c"/></linearGradient>
         <linearGradient id="oktEnvS" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dcc6a0"/><stop offset="1" stop-color="#c2a272"/></linearGradient>
         <radialGradient id="oktEdge" cx=".5" cy=".5" r=".75"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#5a3a1a" stop-opacity=".38"/></radialGradient>
         <filter id="oktAge" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" seed="7"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .24  0 0 0 0 .12  0 0 0 .22 0"/></filter>
         <filter id="oktFox" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".018" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 .45  0 0 0 0 .3  0 0 0 0 .12  0 0 0 1.4 -.78"/></filter></defs>
         <rect width="460" height="300" rx="4" fill="url(#oktEnv)"/><path d="M0 300 L230 160 L460 300Z" fill="url(#oktEnvS)"/><path d="M0 0 L208 172 Q230 190 252 172 L460 0" fill="none" stroke="rgba(110,74,40,.32)" stroke-width="1.2"/>
         <path d="M0 300 L230 160 L460 300" fill="none" stroke="rgba(110,74,40,.32)" stroke-width="1.2"/>
         <rect width="460" height="300" rx="4" filter="url(#oktFox)" opacity=".22"/><rect width="460" height="300" rx="4" filter="url(#oktAge)" opacity=".6"/><rect width="460" height="300" rx="4" fill="url(#oktEdge)" opacity=".55"/></svg>${SEAL}</div>
       <div class="pol side"><img src="${PH}mother_child_bw.jpg" alt=""><i>Я с мамой, 1956</i></div></div>`},
    {w:'Ваша книга',sub:'останется в семье',p:'Смотрите развороты, меняйте композиции, а когда всё готово — заказывайте печать.',
     c:`<div class="cd book"><div class="glow"></div><div class="cov"><b>история семьи</b><strong>Очерки<br>жизни</strong></div></div>`}];
  const el=document.createElement('div');el.className='okt wait'+(K?'':' nok');
  el.style.setProperty('--okt-script',o.script||'"SignThatS","Sign That S",Georgia,serif');el.style.setProperty('--okt-serif',o.serif||'"CormorantCy","Iowan Old Style",Georgia,serif');
  el.innerHTML=`<div class="say"><span class="l1 mist out">Здравствуйте! Я —</span><span class="l2 mist out">Хранитель историй</span><span class="l3 mist out">Помогу собрать воспоминания вашей семьи в книгу. Покажу, что здесь можно делать.</span></div>
    <div class="hd"><h2 class="mist out"></h2><div class="sub mist out"></div><p class="mist out"></p></div><div class="deck">${S.map(s=>s.c).join('')}</div>
    <div class="nav"><button type="button" class="btn back" data-a="prev" hidden>Назад</button><span class="dots" hidden>${S.map(()=>'<i></i>').join('')}</span><button type="button" class="btn main" data-a="next">Показать</button></div>
    <span class="skip" data-a="skip">${o.skipLabel||'Пропустить'}</span>`;
  host.appendChild(el);
  const cards=[...el.querySelectorAll('.deck .cd')],$=q=>el.querySelector(q);let i=-1,ts=[],alive=false,tok=0;
  const later=(f,ms)=>ts.push(setTimeout(f,ms));
  const mist=(q,on)=>$(q).classList.toggle('out',!on);
  const pose=(c,d)=>{c.classList.toggle('in',d===0);c.classList.toggle('past',d<0);c.classList.toggle('play',d===0);
    c.style.transform=d===0?'translate3d(0,0,0) rotateY(0deg) rotate(0deg)':d<0?'translate3d(-640px,40px,-300px) rotateY(38deg) rotate(-6deg)':'translate3d(680px,40px,-200px) rotateY(-42deg) rotate(8deg)';};
  cards.forEach(c=>pose(c,1));
  // where he stands while the card is shown: small, beside it, never over it
  const SPOTS=[[-.6,-.2],[.56,-.2],[-.84,-.66],[.66,-.24],[-.56,-.24]];
  // where the pen writes the step's word: the heading line at the top
  const headAt=()=>{const H=el.clientHeight||innerHeight;return[0,1-2*((H*.05+38)/H)];};
  // one movement per step: the old word fades, he flows into his pen, the pen writes the new word at the top,
  // and he gathers again, small, beside the card — no flying off into a corner and growing back first
  const show=k=>{const prev=i;i=Math.max(0,Math.min(S.length-1,k));const t=++tok;
    ['h2','.sub','p'].forEach(q=>mist('.hd '+q,false));if(K)K.clearWords();
    cards.forEach((c,j)=>pose(c,j-i));el.querySelectorAll('.dots i').forEach((d,j)=>d.classList.toggle('on',j<=i));
    $('[data-a="next"]').textContent=i===S.length-1?(o.last||'Начать'):'Далее';$('[data-a="prev"]').hidden=i<1;
    later(()=>{if(t!==tok)return;$('.hd h2').textContent=S[i].w;$('.hd .sub').textContent=S[i].sub;$('.hd p').textContent=S[i].p;
      if(K){const sp=SPOTS[i%SPOTS.length];K.write(S[i].w,{at:headAt(),px:66,hold:true});later(()=>{if(t!==tok)return;K.rest(sp[0],sp[1],.78);K.face(sp[0]<0?1:-1);K.lookAt(sp[0]<0?.9:-.9,-sp[1]*.4);},1400);
        later(()=>{if(t===tok)mist('.hd .sub',true);},3000);later(()=>{if(t===tok)mist('.hd p',true);},3500);}
      else{mist('.hd h2',true);later(()=>{if(t===tok)mist('.hd .sub',true);},300);later(()=>{if(t===tok)mist('.hd p',true);},600);}},prev<0?200:650);};
  let begun=false;const first=()=>{begun=true;['.l1','.l2','.l3'].forEach(q=>mist('.say '+q,false));$('.dots').hidden=false;later(()=>show(0),900);};
  const finish=r=>{alive=false;ts.forEach(clearTimeout);ts=[];tok++;['h2','.sub','p'].forEach(q=>mist('.hd '+q,false));['.l1','.l2','.l3'].forEach(q=>mist('.say '+q,false));if(K)K.clearWords();cards.forEach(c=>pose(c,1));o.onDone?.(r);};
  el.addEventListener('click',e=>{const a=e.target.closest('[data-a]')?.dataset.a;if(!a)return;
    if(a==='skip'){finish('skip');return;}
    if(a==='prev'){if(i>0)show(i-1);return;}
    if(a==='next'){if(i<0){first();return;}if(i>=S.length-1){finish('done');return;}show(i+1);}});
  const key=e=>{if(!alive||el.classList.contains('wait'))return;if(e.key==='Escape')finish('skip');if(e.key==='ArrowRight'||e.key==='Enter')$('[data-a="next"]').click();if(e.key==='ArrowLeft')$('[data-a="prev"]').click();};
  addEventListener('keydown',key);
  return{el,
    // greeting:true — he greets first: the words come out of the mist one after another, the keys last;
    // false — straight to the first card
    start(){alive=true;i=-1;tok++;begun=false;cards.forEach(c=>pose(c,1));$('[data-a="prev"]').hidden=true;
      if(o.greeting!==false){el.classList.add('wait');$('.dots').hidden=true;$('[data-a="next"]').textContent='Показать';
        const wait=()=>{if(!alive||i>=0||begun)return;if(!K||(K.state.form>.88&&['idle','free'].includes(K.state.mode))){
            mist('.say .l1',true);later(()=>mist('.say .l2',true),500);K&&K.talk(4200);later(()=>mist('.say .l3',true),1600);later(()=>el.classList.remove('wait'),2800);}
          else later(wait,160);};later(wait,500);}
      else{el.classList.remove('wait');first();}},
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
