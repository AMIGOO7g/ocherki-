/*@block [" id=\"archive-hub-v131-js\"", ""]*/
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  const BIG={vinyl:'<circle cx="12" cy="12" r="9.3"/><circle cx="12" cy="12" r="7.4" stroke-width=".35"/><circle cx="12" cy="12" r="5.9" stroke-width=".35"/><path d="M6.6 7.4a7.2 7.2 0 0 1 4-2.5M17.4 16.6a7.2 7.2 0 0 1-4 2.5" stroke-width=".9"/><circle cx="12" cy="12" r="3.2"/><circle cx="12" cy="12" r=".55" fill="currentColor"/>',photos:'<rect x="3.5" y="6.5" width="13" height="10" rx=".6" transform="rotate(-8 10 11)"/><rect x="7.5" y="8.5" width="13" height="10" rx=".6"/><path d="M9 17l3.5-3.5 2.5 2.5 1.5-1.5 2.5 2.5"/><circle cx="16.5" cy="11.5" r="1"/>',texts:'<path d="M6 3.5h9l3.5 3.5v13.5H6z"/><path d="M15 3.5v3.5h3.5"/><path d="M8.5 10h7M8.5 12.5h7M8.5 15h5"/><path d="M4 6v15.5h11"/>',letter:'<rect x="3" y="6" width="18" height="12.5" rx="1"/><path d="M3 6.5l9 6.5 9-6.5"/><circle cx="12" cy="13.2" r="2.2"/>',mic:'<rect x="9.2" y="3" width="5.6" height="10.5" rx="2.8"/><path d="M6 11a6 6 0 0 0 12 0M12 17v3.5M9 20.5h6"/><path d="M3 10v3M21 10v3M4.6 8.5v6M19.4 8.5v6"/>'};
  const F=()=>window.OCHERKI_FAMILY;
  const DEMO=['qa/demo-book/photos/grandma_porch.jpg','qa/demo-book/photos/mother_child_bw.jpg','qa/demo-book/photos/lake_two.jpg'];
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const IC={play:'<path d="M8 5l11 7-11 7z"/>',book:'<path d="M12 6c-2.6-1.8-5.6-1.9-8.5-1.3v13.5c2.9-.6 5.9-.5 8.5 1.3 2.6-1.8 5.6-1.9 8.5-1.3V4.7C17.6 4.1 14.6 4.2 12 6zM12 6v13.5"/>',flip:'<path d="M20 12a8 8 0 0 1-14 5.3M4 12a8 8 0 0 1 14-5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>',x:'<circle cx="12" cy="12" r="9"/><path d="M9 9l6 6M15 9l-6 6"/>',open:'<path d="M4 12h16M14 6l6 6-6 6"/>',mail:'<rect x="3" y="6" width="18" height="13" rx="1.5"/><path d="M3 7l9 6 9-6"/>'};
  IC.pause='<path d="M9 5v14M15 5v14"/>';
  const sv=n=>`<svg viewBox="0 0 24 24">${IC[n]}</svg>`;
  const btn=(a,ic,t,main)=>`<span class="oc-btn2 ${main?'main':''}" data-a="${a}">${sv(ic)}<span>${t}</span></span>`;
  const arrows='<span class="oc-arw l" data-step="-1"><svg viewBox="0 0 24 24"><path d="M14 6l-6 6 6 6"/></svg></span><span class="oc-arw r" data-step="1"><svg viewBox="0 0 24 24"><path d="M10 6l6 6-6 6"/></svg></span>';
  const hub=document.createElement('div');hub.className='oc-hub';document.body.appendChild(hub);
  const KINDS=[['voice','vinyl','Голоса','голоса семьи · ответы на вопросы'],['photo','photos','Фотографии','снимки семьи · подписи и годы'],['note','texts','Тексты','воспоминания · вычитка · было и стало'],['letter','letter','Письма','письма семье · ответы · открытки'],['rec','mic','Запись','']];
  const verb={voice:'прислал(а) голос',photo:'прислал(а) фото',note:'прислал(а) правку',letter:'прислал(а) письмо'};
  const ru=n=>n%10===1&&n%100!==11?'новый':'новых';
  const SAMPLE_LETTERS=[{id:'L1',kind:'letter',who:'Нина',full:'Нина Петровна',date:'3 ноября',y:1968,q:'Письмо из Тифлиса',t:'Дорогие мои, пишу вам из Тифлиса… Здесь уже настоящая весна, в садах цветут абрикосы, и воздух такой тёплый и пряный, что невольно думаешь о доме.',to:'Родным в Москву',sample:true},
    {id:'L2',kind:'letter',who:'Сергей',full:'Сергей',date:'12 октября',y:1984,q:'Открытка с моря',t:'Здравствуй, мама! Мы доехали хорошо. Море тёплое, дети загорели и не хотят уезжать.',to:'Маме',sample:true},
    {id:'L3',kind:'letter',who:'Анна',full:'Анна',date:'1 октября',y:1972,q:'Письмо сестре',t:'Оля, родная, посылаю тебе фотографии с озера. Посмотри, какой у нас вырос Серёжа.',to:'Моей сестре Оле',sample:true}];
  let view='home',idx=0,fWho='',fDec='',flipped=false,want=false;
  const items=k=>{let list=(F()?.items?.()||[]).filter(x=>x.kind===k);if(k==='letter'&&!list.length)list=SAMPLE_LETTERS;
    if(fWho)list=list.filter(x=>(x.full||x.who)===fWho);if(fDec)list=list.filter(x=>x.y&&Math.floor(x.y/10)*10===+fDec);return list;};
  const photoOf=who=>{const p=(F()?.people?.()||[]).find(x=>x.n===String(who||'').split(' ')[0]);return p?F().src(p.img):'';};
  // v144 — the archive as a table of real things: prints, a record, an envelope, an edit; a card opens into its own full view
  const AX={x:'<path d="M6 6l12 12M18 6L6 18"/>',l:'<path d="M14 6l-6 6 6 6"/>',r:'<path d="M10 6l6 6-6 6"/>',turn:'<path d="M20 12a8 8 0 0 1-14 5.3M4 12a8 8 0 0 1 14-5.3"/><path d="M18 3v4h-4M6 21v-4h4"/>',
    mail:'<path d="M4 6h16v12H4zM4 7l8 6 8-6"/>',back:'<path d="M9 14l-5-5 5-5M4 9h11a5 5 0 0 1 0 10h-3"/>',ok:'<path d="M5 12l5 5 9-11"/>',plus:'<path d="M12 5v14M5 12h14"/>',mic:'<rect x="9.2" y="3" width="5.6" height="10.5" rx="2.8"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4"/>'};
  const ax=n=>`<svg viewBox="0 0 24 24">${AX[n]||IC[n]}</svg>`;
  const axb=(a,ic,t,main,extra='')=>`<span class="ax-b ${main?'main':''} ${extra}" data-a="${a}">${ax(ic)}<span>${t}</span></span>`;
  const mmss=s=>{s=Math.round(+s||0);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');};
  const flatPh=()=>items('photo').flatMap(it=>(it.imgs||[]).map(m=>({it,m})));
  const phSrc=(m,i)=>F()?.src?.(m)||DEMO[i%DEMO.length];
  const onErr=i=>`onerror="this.onerror=null;this.src='${DEMO[i%DEMO.length]}'"`;
  const recHTML=(img,cls='')=>`<div class="ax-rec ${cls}"><div class="ax-sp"><i style="background-image:url('${img}')"></i></div><b></b></div>`;
  const ENVF='<svg viewBox="0 0 155 100" preserveAspectRatio="none"><path d="M0 100L77.5 48L155 100Z" fill="rgba(160,120,80,.12)"/><path d="M0 0L77.5 56L155 0" fill="rgba(160,120,80,.10)" stroke="rgba(120,84,50,.35)" stroke-width=".5"/><path d="M0 100L77.5 48L155 100" fill="none" stroke="rgba(120,84,50,.25)" stroke-width=".5"/></svg><img src="assets/postcard/wax-seal.webp" alt="">';
  const close=`<span class="ax-close" data-a="home" title="К архиву">${ax('x')}</span>`;
  const nav=n=>n>1?`<span class="ax-nav"><span data-step="-1">${ax('l')}</span><em>${idx+1} / ${n}</em><span data-step="1">${ax('r')}</span></span>`:'';
  const newest=L=>Math.max(0,L.findIndex(x=>x&&x.state==='new'));
  function table(){const P=flatPh(),firsts=[];const seenIt=new Set();P.forEach((x,i)=>{if(!seenIt.has(x.it.id)){seenIt.add(x.it.id);firsts.push(i);}});
    firsts.sort((a,b)=>(P[b].it.state==='new')-(P[a].it.state==='new'));
    const ph=(k,cls='',st='')=>{const i=firsts[k];if(i==null)return `<div class="ax-c ax-empty ${cls}" style="${st}"></div>`;const x=P[i];
      return `<div class="ax-c ax-print ${cls}" style="${st}" data-open="photo:${i}"><img src="${phSrc(x.m,i)}" alt="" ${onErr(i)}>${x.it.state==='new'?'<span class="ax-new"></span>':''}</div>`;};
    const V=items('voice'),vi=newest(V),v=V[vi];
    const vc=v?`<div class="ax-c ax-vcard" style="grid-column:span 2" data-open="voice:${vi}">${recHTML(photoOf(v.who)||DEMO[0])}
        <div class="ax-info"><div class="ax-who"><b>${esc(v.full||v.who)}</b>голос${v.len?' · '+mmss(v.len):''}${v.state==='new'?' · новое':''}</div><div class="ax-q">${esc(String(v.t||'').replace(/^«?([^.!?…]+[.!?…]?).*$/s,'«$1»').replace(/»»$/,'»'))}</div>
        <div class="ax-vf"><span class="ax-play">${ax('play')}</span>${esc(v.q||'')}</div></div>${v.state==='new'?'<span class="ax-new"></span>':''}</div>`
      :`<div class="ax-c ax-vcard is-none" style="grid-column:span 2" data-a="rec"><div class="ax-info"><div class="ax-q">Здесь будут голоса родных</div><div class="ax-vf"><span class="ax-play">${ax('mic')}</span>Записать первый ответ</div></div></div>`;
    const Lt=items('letter'),li=newest(Lt),l=Lt[li];
    const ec=`<div class="ax-c ax-ecard" data-open="letter:${li}"><div class="ax-envl">${ENVF}</div>${l&&l.state==='new'&&!l.sample?'<span class="ax-new"></span>':''}</div>`;
    const N=items('note').filter(x=>x.edits?.length),ni=newest(N),n=N[ni];
    const ed=n?`<div class="ax-c ax-edit" data-open="note:${ni}"><div class="ax-kind">Правка · глава «${esc(n.place||'')}»</div><div class="ax-was">${esc(n.edits[0].was)}</div><div class="ax-now">${esc(n.edits[0].now)}</div><div class="ax-s">${esc(n.full||'')} · ${esc(n.date||'')}</div>${n.state==='new'?'<span class="ax-new"></span>':''}</div>`
      :'<div class="ax-c ax-empty"></div>';
    return `<div class="ax ax-table"><div class="ax-head"><h1>Архив <em>семьи</em></h1><span class="ax-add" data-a="rec">${ax('mic')}<span>Записать голос</span></span></div>
      <div class="ax-grid">${ph(0,'big','grid-row:span 2')}${vc}${ph(1,'hide-m')}${ec}${ed}${ph(2)}</div></div>`;}
  // the voice line: the bars are a mask, the played part fills under it
  const WAVE=(()=>{let r=5;const rnd=()=>(r=(r*9301+49297)%233280)/233280;let s='';for(let i=0;i<120;i++){const h=Math.max(8,(Math.sin(i*.37)*.5+.5)*(Math.sin(i*.11+1)*.5+.5)*100*(.4+rnd()*.6));s+=`<rect x="${i*10+1}" y="${(50-h/2).toFixed(1)}" width="7" height="${h.toFixed(1)}" rx="3"/>`;}
    const u=`url("data:image/svg+xml,${encodeURIComponent(`<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 100' preserveAspectRatio='none'>${s}</svg>`)}")`;
    const st=document.createElement('style');st.textContent=`.oc-hub .ax-wave{-webkit-mask:${u} 0 0/100% 100%;mask:${u} 0 0/100% 100%}`;document.head.appendChild(st);return u;})();
  function voiceO(){const L=items('voice');if(!L.length)return close+'<div class="ax ax-emptyv">Здесь будут голоса родных.<br>Отправьте «Вопрос недели» — ответы придут сюда.</div>';idx=Math.max(0,Math.min(L.length-1,idx));
    const r=L[idx],o=L[(idx+1)%L.length],sn=String(r.t||'').match(/[^.!?…]+[.!?…»]*\s*/gu)||[String(r.t||'')],inb=r.state==='book';
    return close+`<div class="ax ax-v"><div class="ax-stage">${L.length>1?recHTML(photoOf(o.who)||DEMO[1],'ghost'):''}${recHTML(photoOf(r.who)||DEMO[0],'main')}</div>
      <div class="ax-tx"><div class="ax-kind">Голос · ${esc(r.full||r.who)}${r.len?' · '+mmss(r.len):''}${nav(L.length)}</div><h2>${esc(r.q||'')}</h2>
        <div class="ax-lines">${sn.map((x,k)=>`<span data-s="${k}">${esc(x)}</span>`).join('')}</div>
        <div class="ax-wave"><i></i></div>
        <div class="ax-ctrl ax-acts">${axb('play','play','Слушать',1)}<span class="ax-sp1"></span>${axb('reply','mail','Ответить')}${inb?`<span class="ax-b done" data-a="where">${ax('book')}<span>В книге</span></span>`:axb('tobook','book','В книгу')}</div></div></div>`;}
  function photoO(){const L=flatPh();if(!L.length)return close+'<div class="ax ax-emptyv">Здесь будут снимки семьи.</div>';idx=Math.max(0,Math.min(L.length-1,idx));
    const x=L[idx],it=x.it,from=Math.max(0,Math.min(L.length-7,idx-3)),strip=L.slice(from,from+7).map((y,k)=>{const i=from+k;return `<img class="${i===idx?'on':''}" data-to="${i}" src="${phSrc(y.m,i)}" alt="" ${onErr(i)}>`;}).join('');
    const pp=photoOf(it.who),inb=it.state==='book';
    return `<div class="ax ax-p">${close}<div class="ax-pacts ax-acts">${axb('flip2','turn','Оборот снимка')}${inb?`<span class="ax-b done">${ax('book')}<span>Уже в «Рукописи»</span></span>`:axb('tray','book','В книгу',1)}</div>
      <div class="ax-img"><img src="${phSrc(x.m,idx)}" alt="" ${onErr(idx)}><div class="ax-bk"><b>${esc(it.q||'')}</b><span>${esc(it.full||'')}${it.y?', '+it.y:''}</span></div></div>
      <div class="ax-cap"><div class="ax-kind">Фото${it.y?' · '+it.y:''}</div><h2>${esc(String(it.q||'').replace(/^[^·]*·\s*/,'')||it.q||'')}</h2><p>от ${esc(it.full||'')} · пришло ${esc(it.date||'')}</p>
        ${pp?`<div class="ax-tags"><span><i style="background-image:url('${pp}')"></i>${esc(it.full||it.who)}</span></div>`:''}</div>
      <div class="ax-strip">${strip}</div></div>`;}
  function letterO(){const L=items('letter');idx=Math.max(0,Math.min(L.length-1,idx));const l=L[idx];if(!l)return close;
    return close+`<div class="ax ax-l"><div class="ax-stage"><div class="ax-envB">${ENVF}</div><div class="ax-paper"><div class="dt">${esc([l.place,l.y].filter(Boolean).join(', ')||l.date||'')}</div>${esc(l.t||'').replace(/\n/g,'<br>')}<div class="sg">${esc(l.who||'')}</div></div></div>
      <div class="ax-tx"><div class="ax-kind">Письмо${l.y?' · '+l.y:''}${nav(L.length)}</div><h2>${esc(l.q||'Письмо')}</h2><div class="ax-by">от ${esc(l.full||l.who||'')}${l.to?' — '+esc(l.to):''}</div>
        <div class="ax-read">«${esc(String(l.t||'').replace(/[«»]/g,''))}»</div>
        <div class="ax-ctrl ax-acts" style="margin-top:auto">${axb('env','turn','Конверт')}<span class="ax-sp1"></span>${axb('reply','mail','Ответить')}${l.state==='book'&&!l.sample?`<span class="ax-b done">${ax('book')}<span>В книге</span></span>`:axb('tobook','book','В книгу',1)}</div>
        ${l.sample?'<div class="ax-note">Сейчас здесь пример — так будут выглядеть письма вашей семьи</div>':''}</div></div>`;}
  function editO(){const L=items('note').filter(x=>x.edits?.length);if(!L.length)return close+'<div class="ax ax-emptyv">Здесь будут правки и воспоминания родных.</div>';idx=Math.max(0,Math.min(L.length-1,idx));
    const n=L[idx],rv=F()?.revOf?.(n.id),e=n.edits;
    const pg=e.map(x=>`<p>… ${rv?`<del class="k">${esc(x.now)}</del> <ins class="k">${esc(x.was)}</ins>`:`<del>${esc(x.was)}</del> <ins>${esc(x.now)}</ins>`} …</p>`).join('');
    const acts=`${axb('keep','back',rv?'Оставлено как было':'Оставить как было',rv)}<span class="ax-sp1"></span>${axb('accept','ok',rv?'Принять правку':'Правка принята',!rv)}`;
    return close+`<div class="ax ax-e"><div class="ax-stage"><div class="ax-pg ax-pgw"><div class="k">глава · ${esc(n.place||'')}</div><h3>${esc(n.place||'')}</h3>${pg}</div></div>
      <div class="ax-tx"><div class="ax-kind">Правка · вычитка${nav(L.length)}</div><h2>Глава «${esc(n.place||'')}»</h2><div class="ax-by">${esc(n.full||'')} · ${esc(n.date||'')} · ${e.length} ${e.length===1?'правка':e.length<5?'правки':'правок'}</div>
        <div class="ax-pair"><div><small>было у вас</small><div class="w">${esc(e[0].was)}</div></div><div><small>предлагают</small><div class="n">${esc(e[0].now)}</div></div></div>
        ${e.length>1?`<div class="ax-cnt">и ещё ${e.length-1} — все отмечены на листе слева</div>`:''}
        <div class="ax-ctrl ax-acts" style="margin-top:auto">${acts}</div></div></div>`;}
  const R={home:table,voice:voiceO,photo:photoO,note:editO,letter:letterO};
  // v142: what the room is showing, the newest unseen first; whatever is in front of you counts as seen (the badge goes out)
  const listOf=v=>v==='photo'?items('photo').flatMap(it=>(it.imgs||[]).map(m=>({it,m}))).map(x=>x.it):v==='note'?items('note').filter(x=>x.edits?.length):(v==='home'||v==='rec')?[]:items(v);
  const firstNew=v=>Math.max(0,listOf(v).findIndex(x=>x&&x.state==='new'));
  const markSeen=()=>{const x=listOf(view)[idx];if(x&&!x.sample&&x.state==='new')setTimeout(()=>F()?.seen?.(x.id),900);};
  function render(fade){const html=R[view]();
    if(!fade){hub.innerHTML=`<div class="scr on" data-view="${view}">${html}</div>`;return;}
    const old=hub.querySelector('.scr');const n=document.createElement('div');n.className='scr';n.dataset.view=view;n.innerHTML=html;hub.appendChild(n);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{n.classList.add('on');old?.classList.remove('on');setTimeout(()=>old?.remove(),800);}));}
  // v144: the next card of the same kind fades in in place of this one
  function step(dir,to){const n=listOf(view).length;if(!n)return;const ni=to!=null?to:(idx+dir+n)%n;if(ni===idx)return;idx=ni;flipped=false;stopVoice();spV=0;render(true);markSeen();}
  // refresh the caption and keys in place (after an action), the cards stay
  function refresh(){const cur=hub.querySelector('.scr.on');if(cur)cur.innerHTML=R[view]();}
  // a voice plays right on its record: the disc turns, the words light up one by one
  let vt=0,vaudio=null;
  // the record turns by hand: it gathers speed when it plays and slows down to a stop when paused
  let spA=0,spV=0,spOn=false,spRaf=0,spT=0;
  const spinLoop=now=>{const dt=Math.min(.05,(now-(spT||now))/1000);spT=now;const el=hub.querySelector('.scr.on .oc-vin.is-c .sp,.scr.on .ax-rec.main .ax-sp');
    spV+=((spOn?100:0)-spV)*Math.min(1,dt*(spOn?2.2:1.6));spA=(spA+spV*dt)%360;if(el)el.style.transform=`rotate(${spA.toFixed(2)}deg)`;
    if(spOn||spV>.6)spRaf=requestAnimationFrame(spinLoop);else{spRaf=0;spV=0;spT=0;}};
  const spin=on=>{spOn=on;if(!spRaf){spT=0;spRaf=requestAnimationFrame(spinLoop);}};
  function stopVoice(){clearInterval(vt);vt=0;spin(false);if(vaudio){try{vaudio.pause();URL.revokeObjectURL(vaudio.src);}catch(_){}vaudio=null;}
    const sc=hub.querySelector('.scr.on');if(!sc)return;sc.classList.remove('playing');sc.querySelector('.oc-vin.is-c')?.classList.remove('play');
    const b=sc.querySelector('[data-a="play"]');if(b){b.innerHTML=sv('play')+'<span>Слушать</span>';}}
  function playVoice(b){const sc=hub.querySelector('.scr.on');const r=items('voice')[idx];if(!sc||!r)return;
    if(sc.classList.contains('playing')){stopVoice();return;}
    F()?.seen?.(r.id);sc.classList.add('playing');sc.querySelector('.oc-vin.is-c')?.classList.add('play');spin(true);b.innerHTML=sv('pause')+'<span>Пауза</span>';
    const spans=[...sc.querySelectorAll('.oc-tx [data-s],.ax-lines [data-s]')],bar=sc.querySelector('.oc-pg i,.ax-wave i');let len=r.len||30,pos=0;
    const paint=()=>{const f=Math.min(1,pos/len);if(bar)bar.style.width=(f*100)+'%';const k=Math.min(spans.length-1,Math.floor(f*spans.length));spans.forEach((s,j)=>{s.classList.toggle('on',j===k);s.classList.toggle('was',j<k);});};
    const end=()=>{stopVoice();spans.forEach(s=>s.classList.remove('on','was'));if(bar)bar.style.width='0';};
    if(r.mine)Promise.resolve(F()?.voice?.(r.id)).then(blob=>{if(!blob||!sc.classList.contains('playing'))return;clearInterval(vt);vaudio=new Audio(URL.createObjectURL(blob));
      vaudio.addEventListener('loadedmetadata',()=>{if(isFinite(vaudio.duration))len=vaudio.duration;});vaudio.addEventListener('timeupdate',()=>{pos=vaudio.currentTime;paint();});vaudio.addEventListener('ended',end);vaudio.play().catch(()=>{});});
    vt=setInterval(()=>{pos+=.25;paint();if(pos>=len)end();},250);paint();
    // the equalizer: a soft moving voice line while the record turns
    const bars=[...sc.querySelectorAll('.oc-eq i')],hv=bars.map(()=>2);let ph=Math.random()*9;
    const eq=()=>{if(!sc.classList.contains('playing')){bars.forEach((b,k)=>{hv[k]+=(2-hv[k])*.2;b.style.height=hv[k].toFixed(1)+'px';});if(hv.some(v=>v>2.3))requestAnimationFrame(eq);return;}ph+=.09;
      const env=.55+.45*Math.sin(ph*.7)*Math.sin(ph*.23+1);
      bars.forEach((b,k)=>{const c=1-Math.abs(k-23.5)/26,tg=2+Math.max(0,(Math.sin(ph*2.1+k*.55)*.5+.5)*(Math.sin(ph*1.3-k*.31)*.5+.5)*34*c*env+Math.random()*5*c);
        hv[k]+=(tg-hv[k])*.35;b.style.height=hv[k].toFixed(1)+'px';});requestAnimationFrame(eq);};requestAnimationFrame(eq);}
  function readLetter(env,on){const sc=hub.querySelector('.scr.on'),stage=sc?.querySelector('.oc-stage');if(!stage)return;
    (env._ts||[]).forEach(clearTimeout);env._ts=[];const T=(f,ms)=>env._ts.push(setTimeout(f,ms));
    let fl=stage.querySelector('.oc-flp'),lt=stage.querySelector('.oc-lt');
    if(on){const er=env.getBoundingClientRect(),sr=stage.getBoundingClientRect(),k=(sr.width/stage.offsetWidth)||1;
      const x=(er.left-sr.left)/k,y=(er.top-sr.top)/k,w=er.width/k,h=er.height/k,l=items('letter')[idx]||{};
      if(!fl){fl=document.createElement('div');fl.className='oc-flp';stage.appendChild(fl);}
      Object.assign(fl.style,{left:x+'px',top:y+'px',width:w+'px',height:Math.round(h*.6)+'px',zIndex:11});
      if(!lt){lt=document.createElement('div');lt.className='oc-lt';stage.appendChild(lt);}
      lt.innerHTML=`<div class="pk">${esc(l.full||'')} · ${esc(l.date||'')}${l.y?' · '+l.y:''}</div>${esc(l.t||'').replace(/\n/g,'<br>')}`;
      const pw=lt.offsetWidth,ph=lt.offsetHeight,s0=Math.min(w*.84/pw,h*.8/ph),cx=x+w/2,cy=y+h/2,fs=Math.min(1,innerHeight*.56/ph/k,innerWidth*.7/pw/k);
      let cX=0,cY=0;const at=(dy,s)=>`translate(${(cx-pw/2+cX).toFixed(1)}px,${(cy-ph/2+dy+cY).toFixed(1)}px) scale(${s.toFixed(3)})`;
      env._at=at;env._s0=s0;env._up=-(h*.5+ph*s0*.42);
      lt.style.transition='none';lt.style.zIndex=9;lt.style.transform=at(0,s0);
      // whatever else moves the sheet (inherited offsets), measure once and correct so it sits exactly in the envelope
      {const q=lt.getBoundingClientRect();cX=(er.left+er.width/2-(q.left+q.width/2))/k;cY=(er.top+er.height/2-(q.top+q.height/2))/k;lt.style.transform=at(0,s0);}
      env.classList.add('turned');
      T(()=>{env.classList.add('open');fl.classList.add('on');
        fl.animate([{transform:'scaleY(1)'},{transform:'scaleY(0)'}],{duration:320,easing:'cubic-bezier(.5,0,.9,.6)',fill:'forwards'}).onfinish=()=>{fl.style.zIndex=8;
          fl.animate([{transform:'scaleY(0)'},{transform:'scaleY(-1)'}],{duration:380,easing:'cubic-bezier(.1,.4,.5,1)',fill:'forwards'});};},880);
      T(()=>{lt.style.transition='transform .8s cubic-bezier(.35,.1,.3,1)';lt.style.transform=at(env._up,s0);},1560);
      T(()=>{lt.style.zIndex=40;lt.style.transition='transform 1s cubic-bezier(.2,.8,.25,1)';lt.style.transform=at(h*.12,fs);sc.classList.add('reading');},2400);}
    else{if(!lt||!fl||!env._at){env.classList.remove('open','turned');lt?.remove();fl?.remove();sc.classList.remove('reading');return;}
      sc.classList.remove('reading');lt.style.transition='transform .8s cubic-bezier(.4,0,.3,1)';lt.style.transform=env._at(env._up,env._s0);
      T(()=>{lt.style.zIndex=9;lt.style.transition='transform .7s cubic-bezier(.4,0,.3,1)';lt.style.transform=env._at(0,env._s0);},820);
      T(()=>{fl.animate([{transform:'scaleY(-1)'},{transform:'scaleY(0)'}],{duration:340,easing:'cubic-bezier(.5,0,.9,.6)',fill:'forwards'}).onfinish=()=>{fl.style.zIndex=11;
          fl.animate([{transform:'scaleY(0)'},{transform:'scaleY(1)'}],{duration:340,easing:'cubic-bezier(.1,.4,.5,1)',fill:'forwards'}).onfinish=()=>{env.classList.remove('open');fl.classList.remove('on');};};},1560);
      T(()=>{env.classList.remove('turned');},2350);
      T(()=>{lt.remove();fl.remove();},3300);}}
  function go(v){stopVoice();view=v;fWho='';fDec='';idx=firstNew(v);flipped=false;render(true);markSeen();}
  function picker(el,opts,cur,cb){hub.querySelector('.oc-pick')?.remove();const r=el.getBoundingClientRect(),m=document.createElement('div');m.className='oc-pick';
    m.innerHTML=opts.map(([v,t])=>`<div data-v="${esc(v)}" class="${v===cur?'on':''}">${esc(t)}</div>`).join('');m.style.left=r.left+'px';m.style.top=(r.bottom+8)+'px';hub.appendChild(m);
    m.addEventListener('click',e=>{const d=e.target.closest('[data-v]');if(!d)return;e.stopPropagation();m.remove();cb(d.dataset.v);});}
  hub.addEventListener('click',e=>{const t=e.target;
    if(!t.closest('.oc-pick'))hub.querySelector('.oc-pick')?.remove();
    const o=t.closest('[data-open]');if(o){const [v,i]=o.dataset.open.split(':');stopVoice();view=v;idx=+i||0;flipped=false;render(true);markSeen();return;}
    const to=t.closest('[data-to]');if(to){step(0,+to.dataset.to);return;}
    {const a0=t.closest('[data-a]')?.dataset.a;
      if(a0==='rec'){want=false;sync();F()?.openRecorder?.();return;}
      if(a0==='flip2'){const pv=hub.querySelector('.scr.on .ax-p');flipped=!pv?.classList.toggle('back')?false:true;return;}
      if(a0==='env'){hub.querySelector('.scr.on .ax-l')?.classList.toggle('env');return;}
      if(a0==='tobook'&&view==='letter'&&items('letter')[idx]?.sample){window.OCHERKI_SAY?.('Это пример письма — настоящие письма родных можно будет положить в книгу');return;}}
    const it=t.closest('.it[data-k]');if(it){const k=it.dataset.k;if(k==='rec'){want=false;sync();F()?.openRecorder?.();return;}go(k);return;}
    const a=t.closest('[data-a]')?.dataset.a;
    if(a==='home'){go('home');return;}
    const st=t.closest('[data-step]');if(st){step(+st.dataset.step);return;}
    const c=t.closest('.oc-stage .c');if(c&&+c.dataset.i!==idx){step(0,+c.dataset.i);return;}
    const y=t.closest('.oc-yrs [data-y]');if(y){const L=items('photo').flatMap(it=>(it.imgs||[]).map(m=>({it,m})));const i=L.findIndex(x=>String(x.it.y)===y.dataset.y);if(i>=0)step(0,i);return;}
    const f=t.closest('[data-f]');if(f){e.stopPropagation();const k=view==='photo'?'photo':view;const all=(F()?.items?.()||[]).filter(x=>x.kind===k).concat(k==='letter'?SAMPLE_LETTERS:[]);
      if(f.dataset.f==='who'){const ppl=[...new Set(all.map(x=>x.full||x.who))];picker(f,[['','Вся семья'],...ppl.map(p=>[p,p])],fWho,v=>{fWho=v;idx=0;render(true);});}
      else{const ds=[...new Set(all.map(x=>x.y&&Math.floor(x.y/10)*10).filter(Boolean))].sort();picker(f,[['','Все годы'],...ds.map(d=>[String(d),d+'-е'])],fDec,v=>{fDec=v;idx=0;render(true);});}return;}
    if(a==='flip'){flipped=!flipped;const c=hub.querySelector('.scr.on .oc-pr.is-c');c?.classList.toggle('flip',flipped);c?.classList.toggle('turn3d',flipped);const b=t.closest('[data-a]');b.querySelector('span').textContent=flipped?'Лицевая сторона':'Перевернуть';return;}
    if(a==='tray'){const L=items('photo').flatMap(it=>(it.imgs||[]).map(m=>({it,m})));const x=L[idx];if(!x||x.it.state==='book')return;
      Promise.resolve(F().traySrc(x.m)).then(src=>window.OCHERKI_TRAY_ADD?.([src].filter(Boolean))).then(()=>{F().setState?.(x.it.id,'book','Рукопись');window.OCHERKI_SAY?.('Фото легло в «Рукопись», в стопку «Из архива»');step(0,idx);render(false);});return;}
    if(a==='play'){playVoice(t.closest('[data-a]'));return;}
    if(a==='read'){const env=hub.querySelector('.scr.on .oc-env.is-c');if(!env)return;const on=!env.classList.contains('turned');readLetter(env,on);
      const b=t.closest('[data-a]');b.querySelector('span').textContent=on?'Сложить письмо':'Прочитать';const x=items('letter')[idx];if(x&&!x.sample)F()?.seen?.(x.id);return;}
    if(a==='tobook'){const x=items(view)[idx];if(!x)return;stopVoice();const ch=F()?.toBook?.(x.id);window.OCHERKI_SAY?.(`Лист добавлен в главу «${ch}»`,'открыть',()=>{F()?.closeRoom?.();window.OCHERKI_SET_MODE?.('write');});refresh();return;}
    if(a==='where'){F()?.closeRoom?.();window.OCHERKI_SET_MODE?.('write');return;}
    if(a==='keep'||a==='accept'){const x=items('note').filter(n=>n.edits?.length)[idx];if(!x)return;F()?.noteRev?.(x.id,a==='keep');window.OCHERKI_SAY?.(a==='keep'?'Вернули, как было у вас':'Правка снова на листе',x.place?`открыть «${x.place}»`:'открыть лист',()=>F()?.goPlace?.(x.id));refresh();return;}
    if(a==='open'||a==='reply'){const L=view==='photo'?[]:items(view);const x=L[idx];if(!x)return;
      if(x.sample){window.OCHERKI_SAY?.(a==='reply'?'Ответ на письмо появится, когда письма начнут приходить':'Это пример письма — настоящие письма родных появятся здесь');return;}
      detail=true;sync();F()?.openItem?.(x.id);return;}});
  addEventListener('wheel',e=>{if(!hub.classList.contains('on')||view==='home')return;const now=Date.now(),quiet=now-(hub._wl||0)>240;hub._wl=now;if(Math.abs(e.deltaY)<6&&Math.abs(e.deltaX)<6)return;
    // one card per turn of the wheel: the tail of a trackpad swipe does not count as a second turn
    if(!quiet&&now-(hub._w||0)<1100)return;if(quiet&&now-(hub._w||0)<450)return;hub._w=now;step((Math.abs(e.deltaY)>=Math.abs(e.deltaX)?e.deltaY:e.deltaX)>0?1:-1);},{passive:true});
  addEventListener('keydown',e=>{if(!hub.classList.contains('on')||view==='home')return;if(e.key==='ArrowRight')step(1);if(e.key==='ArrowLeft')step(-1);if(e.key==='Escape')go('home');});
  // a detail card (the existing one) opens over the archive; when it closes, the room comes back
  let detail=false;
  const part=()=>{const f=F();return f?.isOpen?.()?f.part():-1;};
  const openCard=()=>!!document.querySelector('.fm-room .fm-open.on');
  function sync(){const p=part(),onArch=p===2;if(!onArch){want=false;detail=false;}
    if(detail&&!openCard()&&!sync._cardSeen){}
    if(openCard())sync._cardSeen=true;else if(sync._cardSeen){sync._cardSeen=false;detail=false;}
    const show=want&&onArch&&!detail&&!openCard()&&shell.classList.contains('is-family-room');
    if(show&&!hub.classList.contains('on')){if(!hub.querySelector('.scr'))render(false);else if(view==='home')render(false);}
    if(!show&&hub.classList.contains('on'))stopVoice();hub.classList.toggle('on',show);
    // v144: the archive covers everything but the keys — once it has faded in, the constructor beneath stops painting
    const R0=document.documentElement;if(!show){clearTimeout(sync._t);sync._t=0;if(R0.classList.contains('oc-arc-on'))R0.classList.remove('oc-arc-on');}
    else if(!R0.classList.contains('oc-arc-on')&&!sync._t)sync._t=setTimeout(()=>{sync._t=0;if(hub.classList.contains('on'))R0.classList.add('oc-arc-on');},900);}
  let ask=null;const open=v=>{stopVoice();want=true;detail=false;view=(typeof v==='string'&&v)||ask||'home';ask=null;idx=firstNew(view);render(false);sync();markSeen();};
  document.addEventListener('click',e=>{if(e.target.closest?.('.oct .k[data-k="archive"],.oct .pl[data-w="arch"]'))setTimeout(open,180);},true);
  let lastPart=-1;setInterval(()=>{const p=part();if(p===2&&lastPart!==2){want=true;view=ask||'home';ask=null;render(false);}lastPart=p;sync();},250);
  window.OCHERKI_HUB={open,go,ask(v){ask=v;},get view(){return hub.classList.contains('on')?view:null;}};
})();
