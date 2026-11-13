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
.okt .hd p{margin:10px auto 0;max-width:1060px;font:22px/1.45 var(--okt-serif);color:#e2cba6}
/* words come out of the mist and go back into it */
.okt .mist{transition:opacity 1.1s ease,filter 1.2s ease}
.okt .mist.out{opacity:0;filter:blur(12px);transition:opacity .6s ease,filter .6s ease}
.okt .say{position:absolute;left:50%;top:49%;translate:-50% 0;width:min(900px,86vw);text-align:center;pointer-events:none}
.okt .say .l1{display:block;font:400 30px/1.3 var(--okt-serif);color:#f6e3c4;letter-spacing:.01em}
.okt .say .l2{display:block;margin-top:2px;font:400 64px/1.25 var(--okt-script);color:#ffe2bd;text-shadow:0 0 18px rgba(255,150,60,.45)}
.okt .say .l3{display:block;margin-top:16px;font:italic 22px/1.5 var(--okt-serif);color:#e2cba6}
.okt .deck{position:absolute;left:50%;top:56%;width:0;height:0;perspective:1600px;pointer-events:none}
.okt .cd{position:absolute;left:0;top:0;transform-style:preserve-3d;transition:transform 1.2s cubic-bezier(.2,.8,.25,1),opacity 1s ease,filter 1s ease;opacity:0}
.okt .cd.in{opacity:1}.okt .cd.past{opacity:0;filter:blur(4px)}
/* the host's own card styles (the e-mail and books cards are .cd too) never reach these */
.okt .deck .cd{padding:0;border:0;border-radius:0;background:none;flex:none;min-width:0;box-shadow:none;cursor:default;transition:transform 1.2s cubic-bezier(.2,.8,.25,1),opacity 1s ease,filter 1s ease}
.okt .deck .cd:hover{box-shadow:none}
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
/* 1 — the page: A4 upright, it comes folded in four and opens — first sideways, then down — on an untidy pile */
.okt .page{width:0;height:0;translate:0 12px;perspective:1600px}
.okt .page .u{position:absolute;box-shadow:0 14px 26px rgba(0,0,0,.45);background:linear-gradient(170deg,#efe5d0,#ddcfb2)}
.okt .page .u1{left:-250px;top:-276px;width:400px;height:566px;transform:rotate(-7deg)}
.okt .page .u2{left:-176px;top:-306px;width:420px;height:594px;transform:rotate(4.5deg);background:linear-gradient(170deg,#f3ead8,#e2d5b9)}
.okt .page .u3{left:-300px;top:-250px;width:380px;height:540px;transform:rotate(-12deg);background:linear-gradient(170deg,#e9dcc0,#d4c3a0);overflow:hidden}
.okt .page .u3::after{content:"Тифлис, 1956. Дорогие мои…";position:absolute;left:18px;top:30px;font:400 16px var(--okt-script);color:rgba(60,40,25,.6);transform:rotate(2deg)}
.okt .page .ph{position:absolute;left:120px;top:150px;width:150px;height:118px;padding:7px 7px 18px;background:#f1e7d4;box-shadow:0 10px 18px rgba(0,0,0,.45);transform:rotate(14deg)}
.okt .page .ph img{width:100%;height:100%;object-fit:cover;filter:sepia(.4)}
.okt .sheet{position:absolute;left:-210px;top:-297px;width:420px;height:594px;padding:40px 44px 50px;box-sizing:border-box;color:#3b2a1c;overflow:hidden;
  background:radial-gradient(ellipse 85% 80% at 50% 45%,rgba(0,0,0,0) 62%,rgba(120,80,40,.12)),linear-gradient(172deg,#f8f0e0,#ecdfc5);box-shadow:0 30px 60px rgba(0,0,0,.55);clip-path:inset(0 50% 50% 0)}
.okt .sheet::before{content:"";position:absolute;inset:0;pointer-events:none;z-index:2;
  background:linear-gradient(90deg,transparent calc(50% - 2px),rgba(90,60,30,.10) 50%,rgba(255,255,255,.5) calc(50% + 1px),transparent calc(50% + 4px)),
    linear-gradient(180deg,transparent calc(50% - 2px),rgba(90,60,30,.10) 50%,rgba(255,255,255,.5) calc(50% + 1px),transparent calc(50% + 4px)),
    linear-gradient(90deg,rgba(0,0,0,.025) 50%,rgba(255,255,255,.035) 50%),linear-gradient(180deg,rgba(255,255,255,.03) 50%,rgba(0,0,0,.025) 50%)}
.okt .sheet::after{content:"";position:absolute;inset:0;pointer-events:none;opacity:.2;mix-blend-mode:multiply;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='420' height='594'%3E%3Cfilter id='f'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.02' numOctaves='2' seed='5'/%3E%3CfeColorMatrix values='0 0 0 0 .55 0 0 0 0 .38 0 0 0 0 .18 0 0 0 1.2 -.78'/%3E%3C/filter%3E%3Crect width='420' height='594' filter='url(%23f)'/%3E%3C/svg%3E")}
/* the folded parts: the back of the paper turning over along the creases */
.okt .page .fl{position:absolute;background:linear-gradient(160deg,#efe4cc,#e0d1b0);box-shadow:inset 0 0 18px rgba(120,80,40,.15);opacity:0;backface-visibility:visible;pointer-events:none}
.okt .page .flR{left:0;top:-297px;width:210px;height:297px;transform-origin:0 50%;transform:rotateY(-180deg)}
.okt .page .flB{left:-210px;top:0;width:420px;height:297px;transform-origin:50% 0;transform:rotateX(180deg)}
.okt .cd.play .sheet{animation:oktUnfold 1.5s linear .25s both}
.okt .cd.play .flR{animation:oktFlR 1.5s linear .25s both}
.okt .cd.play .flB{animation:oktFlB 1.5s linear .25s both}
@keyframes oktUnfold{0%,44%{clip-path:inset(0 50% 50% 0)}44.5%,88%{clip-path:inset(0 0 50% 0)}88.5%,100%{clip-path:inset(0 0 0 0)}}
@keyframes oktFlR{0%{opacity:1;transform:rotateY(-180deg)}44%{opacity:1;transform:rotateY(0)}44.5%,100%{opacity:0;transform:rotateY(0)}}
@keyframes oktFlB{0%,44%{opacity:0;transform:rotateX(180deg)}44.5%{opacity:1;transform:rotateX(180deg)}88%{opacity:1;transform:rotateX(0)}88.5%,100%{opacity:0;transform:rotateX(0)}}
.okt .sheet .ttl{font:500 12px var(--okt-serif);letter-spacing:.24em;text-transform:uppercase;text-align:center;color:#8a6a48;margin-bottom:6px}
.okt .sheet .hh{font:400 34px/1.2 var(--okt-script);text-align:center;color:#4b3424;margin-bottom:10px}
.okt .sheet .tx{font:400 16px/1.55 var(--okt-script);color:#3e2c1e;text-align:left;hyphens:none}
.okt .deck .sheet .tx span{display:inline;margin:0;font:inherit;color:inherit;opacity:.92}
/* 2 — one record, in the middle, nothing beside it */
.okt .voice{width:0;height:0}
.okt .voice{translate:0 -58px}
.okt .vin{position:absolute;left:-200px;top:-200px;width:400px;height:400px;z-index:5;border-radius:50%;background:radial-gradient(circle closest-side,#0d0a09,#17110f 80%,#0e0b0a);box-shadow:0 0 0 2px rgba(255,200,140,.9),0 0 30px 6px rgba(255,150,60,.5),0 30px 60px rgba(0,0,0,.6)}
.okt .vin .sp{position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle closest-side,#100c0a 0 46%,rgba(255,235,210,.06) 46.4%,transparent 47% 92.6%,rgba(255,235,210,.05) 93%,#100c0a 93.4%),repeating-radial-gradient(circle,#141010 0 1.4px,#211a16 1.4px 3px)}
.okt .voice.play .vin .sp{animation:oktSpin 6s linear infinite}
@keyframes oktSpin{to{transform:rotate(360deg)}}
.okt .vin .lb{position:absolute;left:32%;top:32%;width:36%;height:36%;border-radius:50%;background:#3a2a1c center/cover;filter:sepia(.35);box-shadow:0 0 0 3px #2a201a}
.okt .vin .shine{position:absolute;inset:0;border-radius:50%;background:conic-gradient(from 210deg,transparent 0 10%,rgba(255,235,210,.14) 14%,transparent 20% 60%,rgba(255,235,210,.09) 66%,transparent 72%)}
.okt .vin .hole{position:absolute;left:50%;top:50%;width:14px;height:14px;margin:-7px 0 0 -7px;border-radius:50%;background:#0b0705;box-shadow:inset 0 1px 2px rgba(0,0,0,.8),0 0 0 2px rgba(255,220,180,.25)}
.okt .voice .far{position:absolute;top:-170px;width:340px;height:340px;border-radius:50%;background:radial-gradient(circle closest-side,#100c0a 0 46%,transparent 47% 92.6%,#100c0a 93.4%),repeating-radial-gradient(circle,#141010 0 1.4px,#211a16 1.4px 3px);box-shadow:0 0 0 1px rgba(255,200,140,.35),0 24px 40px rgba(0,0,0,.6)}
.okt .voice .far::after{content:"";position:absolute;left:34%;top:34%;width:32%;height:32%;border-radius:50%;background:#3a2a1c center/cover;background-image:var(--im);filter:sepia(.5) brightness(.8)}
.okt .voice .far.l1{opacity:.8;left:-430px;transform:scale(.82);filter:brightness(.55);z-index:4}.okt .voice .far.l2{opacity:.5;left:-600px;transform:scale(.66);filter:brightness(.32);z-index:3}.okt .voice .far.l3{opacity:.25;left:-730px;transform:scale(.52);filter:brightness(.16);z-index:2}
.okt .voice .far.r1{opacity:.8;left:90px;transform:scale(.82);filter:brightness(.55);z-index:4}.okt .voice .far.r2{opacity:.5;left:260px;transform:scale(.66);filter:brightness(.32);z-index:3}.okt .voice .far.r3{opacity:.25;left:390px;transform:scale(.52);filter:brightness(.16);z-index:2}
/* a soft equalizer under the record while it plays */
.okt .voice .eq{position:absolute;left:-190px;top:250px;width:380px;height:46px;display:flex;align-items:center;justify-content:center;gap:4px;z-index:5}
.okt .voice .eq i{width:4px;height:100%;border-radius:2px;background:linear-gradient(#ffe2b8,#e08a3c);box-shadow:0 0 4px rgba(255,150,60,.3);transform:scaleY(.08);opacity:.5}
.okt .voice.play .eq i{animation:oktEq var(--d) ease-in-out var(--dl) infinite alternate}
@keyframes oktEq{0%{transform:scaleY(.08)}100%{transform:scaleY(var(--h))}}
/* 3 — the question goes to the phone; the answer comes back as a card: a voice with its first line, and how one may answer */
.okt .week{width:0;height:0;translate:0 -24px}
.okt .qdeck{position:absolute;left:-560px;top:-250px;width:440px;height:220px}
.okt .qdeck .u{position:absolute;inset:0;border-radius:6px;background:#e2d3b6;box-shadow:0 14px 26px rgba(0,0,0,.45)}
.okt .qdeck .u1{transform:rotate(-3deg) translate(-8px,14px)}.okt .qdeck .u2{transform:rotate(2deg) translate(10px,8px)}
.okt .qcard,.okt .acard{position:absolute;border-radius:6px;background:linear-gradient(170deg,#f6eddb,#e9dcc2);box-shadow:0 22px 44px rgba(0,0,0,.5);box-sizing:border-box;color:#3b2a1c}
.okt .qcard{inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:26px 40px;text-align:center}
.okt .deck .qcard b,.okt .deck .acard b{display:block;margin:0 0 14px;font:500 12px var(--okt-serif);letter-spacing:.3em;text-transform:uppercase;color:#8a6a48}
.okt .deck .qcard span{display:block;margin:0;font:italic 32px/1.2 var(--okt-serif);color:#3b2a1c}
.okt .acard{left:-540px;top:24px;width:440px;height:196px;padding:22px 26px;transform:rotate(-1.2deg)}
.okt .acard .row{display:flex;align-items:center;gap:14px}
.okt .deck .acard span{margin-top:0}
.okt .deck .acard .tm{font:13px var(--okt-serif);color:#8a6a48;font-style:normal}
.okt .acard .pl{flex:none;width:40px;height:40px;border-radius:50%;background:#3b2a1c;display:grid;place-items:center}
.okt .acard .pl::after{content:"";margin-left:3px;border-left:12px solid #f6eddb;border-top:8px solid transparent;border-bottom:8px solid transparent}
.okt .acard .wv{flex:1;height:34px;display:flex;align-items:center;gap:2px}
.okt .acard .wv i{flex:1;border-radius:2px;background:#8a5a36;opacity:.75}
.okt .acard .wv i.p{background:#c26a2a;opacity:1}
.okt .acard .tm{font:13px var(--okt-serif);color:#8a6a48}
.okt .deck .acard em{display:block;margin-top:12px;font:italic 19px/1.35 var(--okt-serif);color:#3b2a1c}
.okt .acard .ic{position:absolute;right:16px;top:16px;display:flex;gap:8px}
.okt .acard .ic svg{width:18px;height:18px;fill:none;stroke:#8a6a48;stroke-width:1.6;stroke-linecap:round;stroke-linejoin:round}
.okt .week .ph2{position:absolute;left:130px;top:-236px;height:470px;width:auto;filter:drop-shadow(0 24px 34px rgba(0,0,0,.6))}
.okt .week svg{position:absolute;left:-90px;top:-170px;width:250px;height:320px;overflow:visible}
.okt .week svg path{fill:none;stroke:#ffcf8e;stroke-width:2.2;stroke-linecap:round;stroke-dasharray:7 10;filter:drop-shadow(0 0 4px rgba(255,150,60,.8))}
.okt .week svg path.hd2{stroke-dasharray:none;fill:#ffcf8e;stroke:none}
.okt .week.play svg path.go,.okt .week.play svg path.ret{animation:oktDash 1.4s linear infinite}
@keyframes oktDash{to{stroke-dashoffset:-34}}
/* 4 — the envelope: old paper, foxing and soft edges */
.okt .letter{width:0;height:0;translate:-60px -30px;scale:1.12}
.okt .letter .tob{position:absolute;left:250px;top:40px;width:200px;height:120px;overflow:visible}
.okt .letter .tob path{fill:none;stroke:#ffcf8e;stroke-width:2;stroke-dasharray:6 9;stroke-linecap:round;filter:drop-shadow(0 0 4px rgba(255,150,60,.8))}
.okt .letter.play .tob path.go{animation:oktDash 1.4s linear infinite}
.okt .letter .tob path.hd2{stroke:none;fill:#ffcf8e;stroke-dasharray:none}
.okt .letter .mb{position:absolute;left:440px;top:20px;width:150px;filter:drop-shadow(0 14px 18px rgba(0,0,0,.55));transform:rotate(4deg)}
.okt .letter .mbl{position:absolute;left:446px;top:184px;width:150px;text-align:center;font:italic 18px var(--okt-serif);color:#ead6b4}
.okt .letter .envl{position:absolute;left:-230px;top:-60px;width:460px;height:300px;filter:drop-shadow(0 26px 34px rgba(0,0,0,.55));z-index:2}
.okt .letter .envl>svg{position:absolute;inset:0;width:100%;height:100%}
.okt .letter .wax{position:absolute;left:50%;top:160px;width:92px;height:92px;margin:-46px 0 0 -46px;filter:drop-shadow(0 5px 7px rgba(0,0,0,.5))}
.okt .letter .wax img{width:100%;height:100%;display:block}
.okt .letter .wax b{position:absolute;inset:17% 22% 19%;font-size:0;background:#3a0504;-webkit-mask:url(assets/brand/logo-day-bare.png) center/contain no-repeat;mask:url(assets/brand/logo-day-bare.png) center/contain no-repeat;opacity:.55}
.okt .letter .wax b+b{inset:calc(17% + 1.2px) calc(22% - 1px) calc(19% - 1.2px) calc(22% + 1px);background:#ff9c86;opacity:.16;mix-blend-mode:screen}
.okt .letter .lt{position:absolute;left:-190px;top:-40px;width:380px;height:260px;overflow:hidden;background:linear-gradient(170deg,#f7efdf,#eadcc0);box-shadow:0 6px 14px rgba(0,0,0,.3);padding:22px 28px;box-sizing:border-box;font:400 16px/1.42 var(--okt-script);color:#4b3424;z-index:1;transition:transform 1.4s cubic-bezier(.2,.8,.3,1) .3s}
.okt .letter.play .lt{transform:translateY(-190px)}
.okt .letter .pol{position:absolute;width:160px;height:180px;background:#f3ead9;padding:10px 10px 30px;box-shadow:0 18px 30px rgba(0,0,0,.5)}
.okt .letter .pol img{width:100%;height:100%;object-fit:cover;object-position:50% 12%;filter:sepia(.35)}
.okt .letter .pol i{position:absolute;left:0;right:0;bottom:7px;text-align:center;font:400 14px/1 var(--okt-script);white-space:nowrap;color:#4b3424;font-style:normal}
.okt .letter .pol.under{left:130px;top:-20px;transform:rotate(9deg);z-index:0}
.okt .letter .pol.side{left:-390px;top:-40px;transform:rotate(-8deg);z-index:3}
/* 5 — the book: the real one, large, in the middle, nothing moving */
.okt .book img.bk{position:absolute;left:-390px;top:-268px;width:780px;height:auto;filter:drop-shadow(0 30px 40px rgba(0,0,0,.55))}
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
  const ARR=`<svg viewBox="0 0 250 320"><path class="go" d="M4 30 C 80 -14, 170 -6, 236 40"/><path class="hd2" d="M240 43 l-15 -1 5 -12z"/>
    <path class="ret" d="M236 250 C 170 300, 80 300, 6 262"/><path class="hd2" d="M2 259 l15 -1 -6 12z"/></svg>`;
  const S=[
    {w:'Пишите',sub:'книга сложится сама',p:'К каждой главе — свои вопросы. Пишите, как говорите: заголовки и заметки на полях появятся сами.',
     c:`<div class="cd page"><i class="u u3"></i><i class="u u1"></i><div class="ph"><img src="${PH}grandma_porch.jpg" alt=""></div><i class="u u2"></i><div class="sheet"><div class="ttl">глава 1 · начало</div><div class="hh">Детство</div><div class="tx"><span style="--i:0">Мама </span><span style="--i:1">впервые </span><span style="--i:2">увидела </span><span style="--i:3">трамвай, </span><span style="--i:4">когда </span><span style="--i:5">ей </span><span style="--i:6">было </span><span style="--i:7">шесть </span><span style="--i:8">лет. </span><span style="--i:9">Они </span><span style="--i:10">с </span><span style="--i:11">бабушкой </span><span style="--i:12">шли </span><span style="--i:13">по </span><span style="--i:14">Головинскому, </span><span style="--i:15">и </span><span style="--i:16">вдруг </span><span style="--i:17">из-за </span><span style="--i:18">угла </span><span style="--i:19">выехал </span><span style="--i:20">красный </span><span style="--i:21">вагон, </span><span style="--i:22">звенящий, </span><span style="--i:23">как </span><span style="--i:24">колокольчик. </span><span style="--i:25">Мама </span><span style="--i:26">спряталась </span><span style="--i:27">за </span><span style="--i:28">бабушкину </span><span style="--i:29">юбку, </span><span style="--i:30">а </span><span style="--i:31">потом </span><span style="--i:32">весь </span><span style="--i:33">вечер </span><span style="--i:34">рассказывала </span><span style="--i:35">соседям, </span><span style="--i:36">что </span><span style="--i:37">видела </span><span style="--i:38">«дом </span><span style="--i:39">на </span><span style="--i:40">колёсах». </span><span style="--i:41">Бабушка </span><span style="--i:42">смеялась </span><span style="--i:43">и </span><span style="--i:44">говорила, </span><span style="--i:45">что </span><span style="--i:46">в </span><span style="--i:47">Тифлисе </span><span style="--i:48">и </span><span style="--i:49">не </span><span style="--i:50">такое </span><span style="--i:51">увидишь. </span><span style="--i:52">Летом </span><span style="--i:53">мы </span><span style="--i:54">жили </span><span style="--i:55">у </span><span style="--i:56">тёти </span><span style="--i:57">Вари </span><span style="--i:58">на </span><span style="--i:59">Плехановском, </span><span style="--i:60">в </span><span style="--i:61">комнате </span><span style="--i:62">с </span><span style="--i:63">окном </span><span style="--i:64">во </span><span style="--i:65">двор, </span><span style="--i:66">где </span><span style="--i:67">росла </span><span style="--i:68">старая </span><span style="--i:69">груша. </span><span style="--i:70">По </span><span style="--i:71">субботам </span><span style="--i:72">пекли </span><span style="--i:73">хачапури, </span><span style="--i:74">и </span><span style="--i:75">весь </span><span style="--i:76">двор </span><span style="--i:77">пах </span><span style="--i:78">сыром </span><span style="--i:79">и </span><span style="--i:80">дымом. </span><span style="--i:81">Отец </span><span style="--i:82">уходил </span><span style="--i:83">рано, </span><span style="--i:84">а </span><span style="--i:85">возвращался </span><span style="--i:86">затемно, </span><span style="--i:87">приносил </span><span style="--i:88">нам </span><span style="--i:89">по </span><span style="--i:90">яблоку </span><span style="--i:91">и </span><span style="--i:92">садился </span><span style="--i:93">у </span><span style="--i:94">окна </span><span style="--i:95">читать </span><span style="--i:96">газету. </span></div></div><i class="fl flR"></i><i class="fl flB"></i></div>`},
    {w:'Голоса родных',sub:'пластинка в архиве и код в книге',p:'Запишите ответ голосом — он станет пластинкой в архиве, а в книге рядом с рассказом появится QR-код: наведёте телефон — и зазвучит голос.',
     c:`<div class="cd voice">${['l3','l2','l1','r1','r2','r3'].map((k,j)=>`<i class="far ${k}" style="--im:url('${PH}${['lake_two','mother_child_bw','girl_dog','city_tiflis','boy_dog','family_sunset'][j]}.jpg')"></i>`).join('')}<div class="vin"><div class="sp"><div class="lb" style="background-image:url('${PH}grandma_porch.jpg')"></div></div><div class="shine"></div><i class="hole"></i></div><div class="eq">${Array.from({length:44},(_,k)=>{const c=1-Math.abs(k-21.5)/23;return `<i style="--h:${(.25+.75*c*(.55+.45*Math.abs(Math.sin(k*1.7)))).toFixed(2)};--d:${(.45+(k*37%9)/16).toFixed(2)}s;--dl:-${((k*53%17)/10).toFixed(2)}s"></i>`;}).join('')}</div></div>`},
    {w:'Вопрос недели',sub:'вся семья — вместе',p:'Раз в неделю вопрос уходит родным на телефон, а ответ — голосом, словами или фото — возвращается в архив.',
     c:`<div class="cd week"><div class="qdeck"><i class="u u1"></i><i class="u u2"></i><div class="qcard"><b>вопрос недели</b><span>Как вы познакомились с дедушкой?</span></div></div>${ARR}<img class="ph2" src="assets/keeper/tour-phone.webp" alt=""><div class="acard"><b>ответ · Нина Петровна</b><span class="ic"><svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4"/></svg><svg viewBox="0 0 24 24"><path d="M5 6h14M5 11h14M5 16h9"/></svg><svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="13" rx="1.5"/><circle cx="12" cy="12.5" r="3.5"/></svg></span><div class="row"><span class="pl"></span><span class="wv"><i class="p" style="height:18%"></i><i class="p" style="height:36%"></i><i class="p" style="height:29%"></i><i class="p" style="height:35%"></i><i class="p" style="height:43%"></i><i class="p" style="height:24%"></i><i class="p" style="height:52%"></i><i class="p" style="height:30%"></i><i class="p" style="height:52%"></i><i class="p" style="height:51%"></i><i class="p" style="height:38%"></i><i class="p" style="height:68%"></i><i class="p" style="height:23%"></i><i class="p" style="height:71%"></i><i class="" style="height:54%"></i><i class="" style="height:56%"></i><i class="" style="height:80%"></i><i class="" style="height:25%"></i><i class="" style="height:83%"></i><i class="" style="height:44%"></i><i class="" style="height:64%"></i><i class="" style="height:65%"></i><i class="" style="height:35%"></i><i class="" style="height:68%"></i><i class="" style="height:28%"></i><i class="" style="height:57%"></i><i class="" style="height:46%"></i><i class="" style="height:37%"></i><i class="" style="height:51%"></i><i class="" style="height:18%"></i><i class="" style="height:45%"></i><i class="" style="height:31%"></i><i class="" style="height:33%"></i><i class="" style="height:34%"></i></span><span class="tm">2:28</span></div><em>«Он пришёл на танцы в чужом пиджаке, на два размера больше…»</em></div></div>`},
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
       <div class="pol side"><img src="${PH}mother_child_bw.jpg" alt=""><i>Я с мамой, 1956</i></div><svg class="tob" viewBox="0 0 200 120"><path class="go" d="M0 90 C 60 20, 130 20, 180 60"/><path class="hd2" d="M184 63 l-15 0 6 -12z"/></svg><img class="mb" src="assets/keeper/tour-books.webp" alt=""></div>`},
    {w:'Ваша книга',sub:'останется в семье',p:'Смотрите развороты, меняйте композиции, а когда всё готово — заказывайте печать.',
     c:`<div class="cd book"><div class="glow"></div><img class="bk" src="assets/keeper/tour-books.webp" alt="Очерки жизни"></div>`}];
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
  const spotOf=k=>{const c=cards[k];let x0=1e9,x1=-1e9,y0=1e9,y1=-1e9;
    // where the picture will stand once it has arrived (it may still be gliding in)
    let mx=0,my=0;try{const m=new DOMMatrix(getComputedStyle(c).transform);mx=m.e;my=m.f;}catch(_){}c.querySelectorAll('*:not(.far):not(.u):not(.eq):not(.eq *)').forEach(e=>{const r=e.getBoundingClientRect();if(!r.width||r.width>innerWidth*.9)return;x0=Math.min(x0,r.left-mx);x1=Math.max(x1,r.right-mx);y0=Math.min(y0,r.top-my);y1=Math.max(y1,r.bottom-my);});
    const W=el.clientWidth||innerWidth,H=el.clientHeight||innerHeight;if(x1<x0)return[k%2?.5:-.5,-.2];const left=k%2===0;let x=left?x0-120:x1+120,y=y0+(y1-y0)*.38;
    // the records fill the row on both sides: there he stands below them, by the left edge of the main one
    if(c.querySelector('.far')){x=x0-250;y=y1+20;}
    x=Math.max(90,Math.min(W-90,x));
    return[x/W*2-1,1-y/H*2];};
  // where the pen writes the step's word: the heading line at the top
  const headAt=()=>{const H=el.clientHeight||innerHeight;return[0,1-2*((H*.05+38)/H)];};
  // one movement per step: the old word fades, he flows into his pen, the pen writes the new word at the top,
  // and he gathers again, small, beside the card — no flying off into a corner and growing back first
  // his mood on each step: attentive to the page, listening to the record, curious about the question, tender over the letters, glad of the book
  const MOODS=['focus','listen','curious','tender','joy'];
  // the order of a step: the old picture and words go and he flows into his pen; then the new picture comes;
  // the pen writes the word at the top; he gathers beside the picture with the step's mood; the line under it last
  const show=k=>{const prev=i;i=Math.max(0,Math.min(S.length-1,k));const t=++tok;
    ['h2','.sub','p'].forEach(q=>mist('.hd '+q,false));if(K)K.clearWords();
    cards.forEach((c,j)=>{if(j!==i)pose(c,j-i);});el.querySelectorAll('.dots i').forEach((d,j)=>d.classList.toggle('on',j<=i));
    $('[data-a="next"]').textContent=i===S.length-1?(o.last||'Начать'):'Далее';$('[data-a="prev"]').hidden=i<1;
    later(()=>{if(t!==tok)return;$('.hd h2').textContent=S[i].w;$('.hd .sub').textContent=S[i].sub;$('.hd p').textContent=S[i].p;
      if(K){K.write(S[i].w,{at:headAt(),px:66,hold:true});
        later(()=>{if(t!==tok)return;const sp=spotOf(i);K.rest(sp[0],sp[1],.8);K.face(sp[0]<0?1:-1);K.lookAt(sp[0]<0?.9:-.9,-sp[1]*.4);K.mood?.(MOODS[i]);},1400);
        later(()=>{if(t===tok)mist('.hd .sub',true);},2400);later(()=>{if(t===tok)mist('.hd p',true);},2800);}
      else{mist('.hd h2',true);later(()=>{if(t===tok)mist('.hd .sub',true);},300);later(()=>{if(t===tok)mist('.hd p',true);},600);}},prev<0?60:450);
    later(()=>{if(t===tok)pose(cards[i],0);},prev<0?500:950);};
  let begun=false;const first=()=>{begun=true;['.l1','.l2','.l3'].forEach(q=>mist('.say '+q,false));$('.dots').hidden=false;later(()=>show(0),250);};
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
            mist('.say .l1',true);later(()=>mist('.say .l2',true),500);K&&K.talk(4200);K&&K.mood?.('joy',5200);later(()=>mist('.say .l3',true),1600);later(()=>el.classList.remove('wait'),2800);}
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
