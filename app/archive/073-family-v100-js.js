/*@block [" id=\"family-v100-js\"", ""]*/
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  const PH='qa/demo-book/photos/';
  const quiet=navigator.webdriver&&!/[?&](start|family)=1/.test(location.search+(parent!==window?parent.location.search:''));
  const store=(k,v)=>{try{if(v===undefined)return JSON.parse(localStorage.getItem('ocherki_fm_'+k)||'null');localStorage.setItem('ocherki_fm_'+k,JSON.stringify(v));}catch(_){return null;}};
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const letters=t=>[...t].map((c,i)=>`<span style="--i:${i}">${c===' '?' ':c}</span>`).join('');
  // v108: one set of thin gold line icons for the start screen and the family rooms.
  const IC={pen:'<path d="M20 4l10 10-13 13H7V17z"/><path d="M17 7l10 10"/><circle cx="13" cy="21" r="2"/><path d="M4 31c4-3 8 2 12-1"/>',
    people:'<circle cx="17" cy="11" r="5"/><path d="M8 29c0-6 4-10 9-10s9 4 9 10"/><circle cx="7.5" cy="14" r="3.5"/><path d="M2 28c0-4 2-7 5.5-7"/><circle cx="26.5" cy="14" r="3.5"/><path d="M32 28c0-4-2-7-5.5-7"/>',
    photos:'<rect x="4" y="8" width="20" height="16" rx="1" transform="rotate(-8 14 16)"/><rect x="10" y="12" width="21" height="16" rx="1"/><path d="M12 26l6-6 5 5 3-3 5 4"/><circle cx="25" cy="17" r="2"/>',
    mic:'<rect x="13" y="4" width="8" height="15" rx="4"/><path d="M8 16a9 9 0 0018 0M17 25v5M12 30h10"/>',
    house:'<path d="M5 16L17 6l12 10M8 14v14h18V14M14 28v-7h6v7"/>',heart:'<path d="M17 28s-11-7-11-14a6 6 0 0111-3 6 6 0 0111 3c0 7-11 14-11 14z"/>',
    cap:'<path d="M3 13l14-6 14 6-14 6z"/><path d="M9 16v6c5 4 11 4 16 0v-6"/>',bag:'<rect x="5" y="11" width="24" height="17" rx="2"/><path d="M13 11V7h8v4M5 18h24"/>',
    tree:'<path d="M17 30V18M17 22l-5-4M17 20l5-5"/><circle cx="17" cy="11" r="7"/>',user:'<circle cx="17" cy="11" r="6"/><path d="M6 30c0-6 5-10 11-10s11 4 11 10"/>',
    check:'<circle cx="17" cy="17" r="13"/><path d="M11 17l4 4 8-8"/>',book:'<path d="M17 9c-4-3-9-3-13-2v19c4-1 9-1 13 2 4-3 9-3 13-2V7c-4-1-9-1-13 2zM17 9v19"/>',
    pause:'<path d="M13 9v16M21 9v16"/>',redo:'<path d="M27 17a10 10 0 11-3-7"/><path d="M27 6v6h-6"/>',plus:'<path d="M17 8v18M8 17h18"/>',mark:'<path d="M10 5h14v24l-7-5-7 5z"/>',
    play:'<path d="M12 8l14 9-14 9z"/>',back:'<path d="M20 9l-8 8 8 8"/>'};
  const ico=(n,s=30)=>`<svg class="oc-ico" viewBox="0 0 34 34" style="width:${s}px;height:${s}px">${IC[n]||''}</svg>`;
  const treeArt='<svg class="st-tree" viewBox="0 0 200 170"><g fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M100 160V96M100 120l-22-20M100 112l24-22M100 100l-8-22M100 98l12-26M78 100l-18-6M124 90l18-4M60 166h80"/>'+[[100,60,34],[66,82,22],[136,78,24],[80,52,20],[122,50,22],[100,32,20],[52,96,14],[150,96,14]].map(([x,y,r])=>`<circle cx="${x}" cy="${y}" r="${r}" stroke-dasharray="3 4"/>`).join('')+'</g></svg>';
  // Sample family until the server connects.
  const people=[{n:'Нина',r:'рассказывает',img:'grandma_porch.jpg',nw:1},{n:'Анна',r:'прислала фото',img:'girl_dog.jpg',nw:1},{n:'Сергей',r:'пишет главу',img:'boy_dog.jpg'},{n:'Мастерская',r:'вычитка',img:'family_sunset.jpg'}];
  const TOPICS={'Детство':['Каким был ваш первый дом?','Какой запах вы помните из детства?','Во что вы играли во дворе?','Кто был вашим лучшим другом?','Чего вы боялись в детстве?','Какой праздник вы ждали больше всего?'],
    'Родители':['Какой была ваша мама в молодости?','Чему вас научил отец?','Как познакомились ваши родители?','Какую фразу родителей вы помните до сих пор?','Кем работали ваши родители?'],
    'Дом':['Как выглядела ваша комната?','Что стояло на столе по праздникам?','Кто жил по соседству?','Какие вещи в доме были самыми ценными?'],
    'Школа':['Каким был ваш первый учитель?','Какой предмет вы любили?','Что вы делали после уроков?','Чем закончилась школа?'],
    'Война':['Что вы помните о начале войны?','Как жила семья в те годы?','Кого из близких вы ждали с фронта?','Каким был день Победы?'],
    'Любовь':['Как вы познакомились с супругом?','Каким было первое свидание?','Как прошла ваша свадьба?','Что вы цените друг в друге?'],
    'Работа':['Кем вы мечтали стать?','Каким был ваш первый рабочий день?','Чем вы гордитесь в работе?','Кто был вашим наставником?'],
    'Переезды':['Почему семья переехала?','Каким был новый город?','Что вы взяли с собой?'],
    'Праздники':['Как встречали Новый год?','Какой подарок вы помните?','Какие песни пели за столом?'],
    'Советы':['Что бы вы сказали себе в двадцать лет?','Что важно передать внукам?','Чему вас научила жизнь?']};
  // The archive keeps everything for good. Sample items, and the author's own recordings first.
  const SAMPLES=[
    {id:'r4',kind:'voice',who:'Нина',full:'Нина Петровна',date:'вчера',y:1968,q:'Как вы познакомились с дедушкой?',t:'«Он пришёл на танцы в парк в чужом пиджаке, на два размера больше. Я смеялась весь вечер — а через год мы поженились.»',len:148,nw:1},
    {id:'r1',kind:'voice',who:'Нина',full:'Нина Петровна',date:'3 ноября',y:1958,q:'Каким был ваш первый дом?',t:'«Дом был деревянный, на два хозяина. Во дворе росла старая груша, и отец каждую осень обещал её спилить — и так и не спилил…»',len:192,nw:1},
    {id:'ph1',kind:'photo',who:'Анна',full:'Анна',date:'1 ноября',y:1956,q:'Тифлис, 1956 · Бабушка с Дружком',imgs:['grandma_porch.jpg','city_tiflis.jpg','girl_dog.jpg'],nw:1},
    {id:'n1',kind:'note',who:'Мастерская',full:'Мастерская',date:'30 октября',y:1956,q:'Вычитка главы «Тифлис»',place:'Тифлис',edits:[{was:'в сорок четвёртом',now:'в 1944 году'},{was:'шли пешком до Кутаиси и пели всю дорогу чтобы не уснуть',now:'шли пешком до Кутаиси и пели всю дорогу, чтобы не уснуть'},{was:'хачапури по суботам',now:'хачапури по субботам'},{was:'Дружок был умный пёс, умный и добрый',now:'Дружок был умный и добрый пёс'}]},
    {id:'ph2',kind:'photo',who:'Анна',full:'Анна',date:'12 октября',y:1972,q:'Лето на озере, 1972',imgs:['lake_two.jpg','lake_mother_child.jpg','lake_child_pier.jpg']},
    {id:'ph3',kind:'photo',who:'Сергей',full:'Сергей',date:'5 октября',y:1984,q:'Горы, папа и я',imgs:['mountains_father_son.jpg','ridge_father_son.jpg'],nw:1},
    {id:'ph4',kind:'photo',who:'Нина',full:'Нина Петровна',date:'2 октября',y:1953,q:'Мама и я',imgs:['mother_child_bw.jpg']},
    {id:'ph5',kind:'photo',who:'Анна',full:'Анна',date:'28 сентября',y:1987,q:'Я и Дружок',imgs:['girl_dog.jpg','girl_flowers.jpg']},
    {id:'n2',kind:'note',who:'Мастерская',full:'Мастерская',date:'18 октября',y:1952,q:'Вычитка главы «Начало»',place:'Начало',edits:[{was:'на две семьи',now:'на два хозяина'},{was:'в ноябре месяце',now:'в ноябре'}]},
    {id:'r2',kind:'voice',who:'Нина',full:'Нина Петровна',date:'27 октября',y:1950,q:'Какой запах вы помните из детства?',t:'«Мама пекла по субботам хачапури, весь двор пах сыром и дымом, а груша у колодца цвела так, что мы спали с открытыми окнами.»',len:167},
    {id:'r3',kind:'voice',who:'Сергей',full:'Сергей',date:'20 октября',y:1944,q:'Как дедушка вспоминал армию?',t:'«Он рассказывал, как в сорок четвёртом они шли пешком до Кутаиси и пели всю дорогу, чтобы не уснуть.»',len:121}];
  const mine=store('mine')||[];
  const allItems=()=>[...mine,...SAMPLES];
  const added=store('added')||{};const arch=store('arch')||{};
  const stateOf=it=>arch[it.id]?.state||(added[it.id]?'book':(it.nw?'new':(it.kind==='note'&&it.edits?.length?'book':'')));
  const placeOf=it=>arch[it.id]?.chapter||added[it.id]||it.place||'';
  const setState=(id,state,chapter)=>{arch[id]=Object.assign({},arch[id],{state,chapter:chapter??arch[id]?.chapter});store('arch',arch);};
  // The voices recorded here are kept in this browser until the server connects.
  const VDB='ocherki-voices';const vdb=()=>new Promise((ok,no)=>{const r=indexedDB.open(VDB,1);r.onupgradeneeded=()=>r.result.createObjectStore('v');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error);});
  const putVoice=(id,blob)=>vdb().then(db=>new Promise(ok=>{const tx=db.transaction('v','readwrite');tx.objectStore('v').put(blob,id);tx.oncomplete=ok;tx.onerror=ok;})).catch(()=>{});
  const getVoice=id=>vdb().then(db=>new Promise(ok=>{const rq=db.transaction('v').objectStore('v').get(id);rq.onsuccess=()=>ok(rq.result||null);rq.onerror=()=>ok(null);})).catch(()=>null);
  const st0=store('week')||{topic:'Детство',i:0,day:'пятницу',time:'утром',every:'каждую неделю',via:'в Telegram'};const week=st0;
  let chapters=[];addEventListener('message',e=>{const d=e.data||{};if(d.type==='OCHERKI_STRUCTURE_STATE')chapters=(d.payload?.sections||[]).filter(s=>s.type==='chapter').map(s=>({id:s.id,title:String(s.title||'').replace(/^Глава\s+\d+\.\s*/,'')}));});
  const sw=()=>document.querySelector('.mode-switch');
  const newCount=()=>allItems().filter(it=>stateOf(it)==='new').length+people.filter(p=>p.nw).length;
  // The start screen and the family rooms stand on the constructor's own light.
  const bd=document.createElement('div');bd.className='rm-backdrop';bd.innerHTML='<div class="rm-light"></div><div class="night-base"></div><div class="night-artwork"></div><div class="night-main"></div><div class="night-warm"></div><div class="night-shadow"></div><div class="night-artwork-ink"></div><div class="night-vignette"></div>';document.body.appendChild(bd);
  // ——— start screen ———
  const st=document.createElement('div');st.className='st-screen';document.body.appendChild(st);
  const theme=()=>{const night=true;/* v130: the family's rooms are always dark */bd.classList.toggle('is-night',night);st.classList.toggle('rm-day',!night);room?.classList.toggle('rm-day',!night);};
  const syncBd=()=>{bd.classList.toggle('on',st.classList.contains('on')||room?.classList.contains('on')||shell.classList.contains('is-start-screen'));theme();};
  new MutationObserver(syncBd).observe(st,{attributes:true,attributeFilter:['class']});
  // v109: the backdrop follows the start screen out as well (it used to stay over the constructor).
  new MutationObserver(syncBd).observe(shell,{attributes:true,attributeFilter:['class']});
  const title=()=>String(document.getElementById('projectTitle')?.textContent||'Очерки жизни').trim();
  const drawStart=()=>{const n=newCount(),t=title(),L=t.length,fs=L<=14?40:L<=24?32:L<=40?25:20;
    st.innerHTML=`<div class="st-book"><span class="sb-glow"></span><span class="sb-pages"></span><div class="sb-cover"><span class="sb-frame"></span><b style="font-size:${fs}px">${esc(t)}</b><span class="sb-rule"></span>${treeArt}<em>книга вашей семьи</em></div><span class="sb-ribbon"></span></div>
    <div class="st-menu"><div class="k">С чего начнём</div><i class="st-hair"></i>
     <span class="st-it" data-go="write">${ico('pen',40)}<span class="st-tx"><span class="w">Писать самому</span><small>продолжить с того же листа</small></span></span>
     <span class="st-it" data-go="family">${ico('people',40)}<span class="st-tx"><span class="w">Позвать семью</span><small>вопрос недели, приглашения</small></span></span>
     <span class="st-it" data-go="archive">${ico('photos',40)}<span class="st-tx"><span class="w">Архив семьи${n?`<span class="st-new">${n} новых</span>`:''}</span><small>голоса, фото и письма</small></span></span></div>
    <div class="st-open" data-go="book">Открыть книгу →</div>`;
    // v108: a line lights up at once and goes out at once.
    const menu=st.querySelector('.st-menu');st.querySelectorAll('.st-it').forEach(it=>{
      it.addEventListener('mouseenter',()=>{st.querySelectorAll('.st-it').forEach(x=>x.classList.toggle('is-hov',x===it));menu.classList.add('is-hover');});
      it.addEventListener('mouseleave',()=>{it.classList.remove('is-hov');if(!menu.querySelector('.st-it.is-hov'))menu.classList.remove('is-hover');});});};
  const hideStart=(toRoom)=>{st.classList.remove('on','st-ready');
    if(toRoom===true){setTimeout(()=>shell.classList.remove('is-start-screen'),900);return;}
    shell.classList.add('is-start-leaving');setTimeout(()=>{shell.classList.remove('is-start-screen');setTimeout(()=>shell.classList.remove('is-start-leaving'),1400);},350);};
  const showStart=()=>{drawStart();shell.classList.add('is-start-screen');bd.classList.add('on');
    const wait=shell.classList.contains('is-handoff')?1150:0;
    setTimeout(()=>requestAnimationFrame(()=>{st.classList.add('on');
      // Once assembled, the lines answer the pointer without the entrance delays.
      setTimeout(()=>{if(st.classList.contains('on'))st.classList.add('st-ready');},2300);}),wait);};
  st.addEventListener('click',e=>{const go=e.target.closest('[data-go]')?.dataset.go;if(!go)return;
    if(go==='family'||go==='archive'){openRoom(go==='family'?0:2);setTimeout(()=>hideStart(true),350);return;}
    hideStart();if(go==='book')setTimeout(()=>window.OCHERKI_SET_MODE?.('book'),250);});
  // v120: the start sheet is gone — the constructor opens straight where you were.
  let shown=true;const tryShow=()=>{};
  new MutationObserver(tryShow).observe(shell,{attributes:true,attributeFilter:['class']});tryShow();
  // ——— room «Семья» ———
  var room=document.createElement('div');room.className='fm-room';document.body.appendChild(room);
  new MutationObserver(syncBd).observe(room,{attributes:true,attributeFilter:['class']});theme();
  const disc=(s,label='',cls='')=>`<div class="oc-vinyl ${cls}" style="width:${s}px;height:${s}px"><div class="lb" style="width:${Math.round(s*.36)}px;height:${Math.round(s*.36)}px">${label}</div></div>`;
  const PARTS=['Семья','Вопрос недели','Архив'];let part=0,roomOpen=false;
  const wkLetters=t=>{let i=0;return String(t).split(' ').map(w=>`<b class="w">${[...w].map(c=>`<span style="--i:${i++}">${c}</span>`).join('')}</b>`).join(' ');};
  const wkN=()=>{const l=TOPICS[week.topic]||TOPICS['Детство'];return `${((week.i||0)%l.length+l.length)%l.length+1} из ${l.length}`;};
  const qOf=()=>{const l=TOPICS[week.topic]||TOPICS['Детство'];return l[(week.i||0)%l.length];};
  const sel=(k,opts)=>`<span class="fm-pick" data-k="${k}" data-opts="${opts.join('|')}">${week[k]}</span>`;
  let fWho='';
  const faceOf=who=>people.find(p=>p.n===who)?.img||'';
  const ru=(n,a,b,c)=>{const m=n%10,h=n%100;return n+' '+(m===1&&h!==11?a:m>=2&&m<=4&&(h<12||h>14)?b:c);};
  // v112: the archive as three threads in time — voices, photos, letters; the past fades into the fog on the left.
  const KROW=[['voice','голоса','mic','Записать голос'],['photo','фото','photos','Добавить фото'],['note','письма','pen','Написать текст']];
  const ROWY=[240,496,712],VH=970,ENDW=150,FOGW=300,SLOT=158;
  const IMG={};
  const imgTag=m=>String(m).startsWith('idb:')?`<img data-idb="${esc(m)}" src="${IMG[m]||''}" alt="">`:`<img src="${PH+m}" alt="" loading="lazy">`;
  const loadImgs=root=>root?.querySelectorAll('img[data-idb]').forEach(im=>{const k=im.dataset.idb;if(IMG[k]){im.src=IMG[k];return;}
    getVoice(k.slice(4)).then(b=>{if(!b)return;IMG[k]=IMG[k]||URL.createObjectURL(b);room.querySelectorAll(`img[data-idb="${k}"]`).forEach(x=>x.src=IMG[k]);});});
  const traySrc=m=>String(m).startsWith('idb:')?getVoice(m.slice(4)).then(b=>b?new Promise(ok=>{const fr=new FileReader();fr.onload=()=>ok(fr.result);fr.onerror=()=>ok(null);fr.readAsDataURL(b);}):null):Promise.resolve(PH+m);
  const today=()=>new Date().toLocaleDateString('ru-RU',{day:'numeric',month:'long'});
  const decOf=y=>Math.floor(y/10)*10;
  const tl={pan:null,cur:0,raf:0,act:null,open:{},W:0,vw:1600,maxP:0,minP:0,drag:null,moved:false};
  const thrY=(r,X)=>ROWY[r]+9*Math.sin(X/610+r*1.7);
  function tlCells(){const list=allItems().filter(it=>!fWho||it.who===fWho);
    const dated=list.filter(it=>it.y),und=list.filter(it=>!it.y);
    const decs=[...new Set(dated.map(it=>decOf(it.y)))].sort((a,b)=>a-b);const cols=[];
    decs.forEach((d,i)=>{if(i&&d-decs[i-1]>10)cols.push({gap:[decs[i-1]+10,d-10]});cols.push({d});});
    if(und.length)cols.push({und:1});
    cols.forEach(c=>{c.rows=KROW.map(([k],r)=>{const its=(c.gap?[]:c.und?und:dated.filter(it=>decOf(it.y)===c.d)).filter(it=>it.kind===k).sort((a,b)=>(a.y||0)-(b.y||0));
        const key=(c.und?'u':c.d)+k,vis=its.length>3&&!tl.open[key]?its.slice(-2):its;return {k,r,its,vis,more:its.length-vis.length,key};});
      const slots=Math.max(1,...c.rows.map(w=>w.vis.length+(w.more?1:0)));c.w=c.gap?200:Math.max(300,100+slots*SLOT);});
    let x=80;cols.forEach(c=>{c.x=x;x+=c.w;});return {cols,W:x+40,list};}
  const faceUrl=w=>faceOf(w)?PH+faceOf(w):'';
  function cardHTML(it){if(it.kind==='voice'){const f=faceUrl(it.who);return `<div class="tl-card tl-sleeve"><i class="tl-rec"></i>${f?`<i class="tl-por" style="background-image:url(${f})"></i>`:`<i class="tl-por is-me">${ico('mic',34)}</i>`}</div>`;}
    if(it.kind==='photo')return `<div class="tl-card tl-print">${imgTag(it.imgs[0])}${it.imgs.length>1?`<b class="tl-n">${it.imgs.length}</b>`:''}</div>`;
    return `<div class="tl-card tl-paper"><span>${esc(String(it.q||'').replace(/^Вычитка главы\s*/,'Вычитка '))}</span></div>`;}
  function tlHTML(){const {cols,W,list}=tlCells();tl.W=W;tl.cols=cols;
    const ids=new Set(list.map(it=>it.id));if(tl.act&&!ids.has(tl.act))tl.act=null;
    if(tl.act===null){const fn=list.find(it=>stateOf(it)==='new');tl.act=fn?fn.id:null;}
    const nn=list.filter(it=>stateOf(it)==='new').length;
    let svg='',lab='',cards='',k=0;
    const L=-2400,Rr=W+2400;
    KROW.forEach((_,r)=>{let d='';for(let X=L;X<=Rr;X+=60)d+=(d?' L':'M')+X+' '+thrY(r,X).toFixed(1);svg+=`<path class="tl-th" d="${d}"/><path class="tl-th g" d="${d}"/>`;});
    cols.forEach(c=>{const mid=c.x+c.w/2;
      if(c.gap){const [a,b]=c.gap;lab+=`<div class="tl-gap" style="left:${mid}px;top:${ROWY[1]+46}px">${a===b?a+'-е':a+' — '+b+'-е'}<br>пока пусто</div>`;return;}
      const hot=c.rows.some(w=>w.its.some(it=>stateOf(it)==='new'));
      lab+=`<div class="tl-dec ${hot?'hot':''}" style="left:${mid}px">${c.und?'без года':c.d+'-е'}</div>`;
      c.rows.forEach(w=>{const m=w.vis.length+(w.more?1:0);
        const at=i=>mid+(i-(m-1)/2)*SLOT;
        if(w.more){const X=at(0),top=w.its.slice(0,w.more);const f=top[top.length-1];
          cards+=`<div class="tl-it k-${w.k} is-stack" data-stack="${w.key}" data-x="${X}" style="left:${X}px;top:${thrY(w.r,X)-2}px;--d:${(k++%14)*.05}s;--r:-1.5deg"><div class="tl-sw"><i class="tl-clip"></i><div class="tl-pile"><i></i><i></i>${cardHTML(f)}</div><div class="tl-yr is-more">ещё ${w.more}</div></div></div>`;}
        w.vis.forEach((it,i)=>{const X=at(i+(w.more?1:0)),s=stateOf(it),act=it.id===tl.act,rot=act?0:(((it.y||7)*7+i)%3-1)*1.3;
          cards+=`<div class="tl-it k-${it.kind} ${s==='new'?'is-new':''} ${act?'is-act':''}" data-it="${it.id}" data-x="${X}" style="left:${X}px;top:${thrY(w.r,X)-2}px;--d:${(k++%14)*.05}s;--r:${rot}deg"><div class="tl-sw"><i class="tl-clip"></i>${cardHTML(it)}${s==='book'?'<i class="tl-bk"></i>':''}${s==='later'?'<i class="tl-lt">потом</i>':''}
            ${s==='new'&&it.y?`<div class="tl-yr">${it.y}</div>`:''}<div class="tl-lab"><div class="c">${it.y?it.y+' · ':''}${esc(it.full)}</div><div class="q">${esc(it.q)}</div></div></div></div>`;});});});
    const whos=[...new Set(allItems().map(x=>x.who))];
    return `<div class="tl-stage"><div class="fm-h tl-title">Семейный архив</div>
      <div class="tl-sub">${nn?`<span class="tl-new" data-tlnew="1"><i></i>${ru(nn,'новое','новых','новых')} ›</span><span class="tl-dot">·</span>`:''}<span class="tl-who" data-tlwho="1">${fWho?esc(people.find(p=>p.n===fWho)?.n||fWho):'вся семья'} ▾</span></div>
      <div class="tl-faces"><span class="tl-face ${!fWho?'on':''}" data-tlface=""><i class="all">${ico('people',30)}</i><b>Все</b></span>${whos.map(w=>`<span class="tl-face ${fWho===w?'on':''}" data-tlface="${esc(w)}">${faceUrl(w)?`<i style="background-image:url(${faceUrl(w)})"></i>`:`<i class="all">${ico('user',28)}</i>`}<b>${esc(w)}</b></span>`).join('')}</div>
      <div class="tl-view"><div class="tl-track"><svg class="tl-svg" style="left:${L}px;width:${Rr-L}px" viewBox="${L} 0 ${Rr-L} ${VH}">${svg}</svg>${lab}${cards}</div></div>
      <div class="tl-fog"></div>
      <div class="tl-ends">${KROW.map(([kk,n,ic,t],r)=>`<span class="tl-end" data-add="${kk}" style="top:${ROWY[r]}px" title="${t}"><span class="tc">${ico(ic,28)}<b>+</b></span><span class="tn">${n}</span></span>`).join('')}</div>
      <span class="tl-chev l" data-tlpan="-1">‹</span><span class="tl-chev r" data-tlpan="1">›</span>
      ${list.length?'':`<div class="tl-none">${fWho?'От этого человека пока ничего нет':'Здесь появятся голоса, фото и письма семьи'}</div>`}</div>`;}
  const tlClamp=p=>Math.min(tl.maxP,Math.max(tl.minP,p));
  function tlFit(){const a=room.querySelector('.fm-tl'),stg=a?.querySelector('.tl-stage');if(!stg)return;
    const sc=Math.max(.62,Math.min(1.25,innerHeight/VH,innerWidth/1500));const vw=innerWidth/sc;
    stg.style.transform=`scale(${sc})`;stg.style.width=vw+'px';tl.vw=vw-ENDW;
    tl.maxP=FOGW-40;tl.minP=Math.min(tl.maxP,tl.vw-tl.W);}
  function tlDepth(){const a=room.querySelector('.fm-tl');if(!a)return;
    a.querySelectorAll('.tl-it').forEach(el=>{const sx=tl.cur+(+el.dataset.x);const f=Math.max(0,Math.min(1,(FOGW-sx)/FOGW));const v=f>.01?f.toFixed(2):'';if(el._f!==v){el._f=v;el.style.filter=v?`blur(${(f*4.5).toFixed(1)}px)`:'';el.style.opacity=v?(1-f*.6).toFixed(2):'';el.classList.toggle('in-fog',f>.35);}});
    a.querySelector('.tl-chev.l')?.classList.toggle('on',tl.pan<tl.maxP-4);a.querySelector('.tl-chev.r')?.classList.toggle('on',tl.pan>tl.minP+4);}
  function tlTick(){const tr=room.querySelector('.fm-tl .tl-track');if(!tr){tl.raf=0;return;}
    tl.cur+=(tl.pan-tl.cur)*.11;if(Math.abs(tl.pan-tl.cur)<.4)tl.cur=tl.pan;
    tr.style.transform=`translate3d(${tl.cur.toFixed(1)}px,0,0)`;tlDepth();tl.raf=tl.cur!==tl.pan?requestAnimationFrame(tlTick):0;}
  const tlGo=(p,now)=>{tl.pan=tlClamp(p);if(now){tl.cur=tl.pan;}if(!tl.raf)tl.raf=requestAnimationFrame(tlTick);};
  const xOf=id=>{const el=room.querySelector(`.fm-tl .tl-it[data-it="${id}"]`);return el?+el.dataset.x:null;};
  function tlFocus(id){const X=xOf(id);if(X==null)return;tlGo(tl.vw*.46-X);}
  function tlSetAct(id){tl.act=id;room.querySelectorAll('.fm-tl .tl-it[data-it]').forEach(el=>el.classList.toggle('is-act',el.dataset.it===id));
    const el=room.querySelector(`.fm-tl .tl-it[data-it="${id}"]`);if(el){el.style.setProperty('--r','0deg');el.classList.remove('swing');void el.offsetWidth;el.classList.add('swing');}}
  function tlAfter(first){const a=room.querySelector('.fm-tl');if(!a)return;tlFit();loadImgs(a);
    if(first||tl.pan==null){let p=tl.vw-tl.W;tl.maxP=FOGW-40;tl.minP=Math.min(tl.maxP,tl.vw-tl.W);p=tlClamp(p);
      const X=tl.act?xOf(tl.act):null;if(X!=null&&(p+X<FOGW+40||p+X>tl.vw-60))p=tlClamp(tl.vw*.46-X);tl.pan=p;tl.cur=first?p+260:p;}
    else tl.pan=tlClamp(tl.pan);
    const tr=a.querySelector('.tl-track');tr.style.transform=`translate3d(${tl.cur.toFixed(1)}px,0,0)`;tlDepth();
    if(first){clearTimeout(tl.gt);tl.gt=setTimeout(()=>{if(!tl.raf&&tl.cur!==tl.pan)tl.raf=requestAnimationFrame(tlTick);},650);}else if(!tl.raf&&tl.cur!==tl.pan)tl.raf=requestAnimationFrame(tlTick);
    if(first){a.classList.remove('tl-enter');void a.offsetWidth;a.classList.add('tl-enter');clearTimeout(tl.et);tl.et=setTimeout(()=>a.classList.remove('tl-enter'),3400);}}
  function arRefresh(quiet){const a=room.querySelector('.fm-tl');if(!a)return;
    const paint=()=>{a.classList.remove('faces-on');a.innerHTML=tlHTML();tlAfter(false);syncSwitch();};
    if(quiet){paint();return;}a.classList.add('swap');setTimeout(()=>{paint();requestAnimationFrame(()=>requestAnimationFrame(()=>a.classList.remove('swap')));},260);}
  // A picture from the computer is kept in this browser (resized) until the server connects.
  const shrink=f=>new Promise(ok=>{const u=URL.createObjectURL(f);const im=new Image();im.onload=()=>{const s=Math.min(1,1800/Math.max(im.naturalWidth,im.naturalHeight));const c=document.createElement('canvas');c.width=Math.round(im.naturalWidth*s);c.height=Math.round(im.naturalHeight*s);c.getContext('2d').drawImage(im,0,0,c.width,c.height);URL.revokeObjectURL(u);c.toBlob(b=>ok(b),'image/jpeg',.86);};im.onerror=()=>{URL.revokeObjectURL(u);ok(null);};im.src=u;});
  function addPhotos(){const inp=document.createElement('input');inp.type='file';inp.accept='image/*';inp.multiple=true;
    inp.onchange=async()=>{const files=[...(inp.files||[])].slice(0,30);if(!files.length)return;const id='p'+Date.now().toString(36),keys=[];
      for(let k=0;k<files.length;k++){const b=await shrink(files[k]);if(!b)continue;const key=id+'_'+k;await putVoice(key,b);keys.push('idb:'+key);}
      if(!keys.length){window.OCHERKI_SAY?.('Эти файлы не открылись как фото');return;}
      mine.unshift({id,kind:'photo',who:'Вы',full:'Вы',date:today(),q:keys.length>1?`${keys.length} фото с компьютера`:'Фото с компьютера',imgs:keys,mine:1});store('mine',mine);
      tl.act=id;arRefresh(true);setTimeout(()=>tlFocus(id),60);window.OCHERKI_SAY?.(`${ru(keys.length,'фото','фото','фото')} в архиве — укажите год, и они встанут на нить`,'открыть',()=>openPhoto(mine.find(m=>m.id===id)));};
    inp.click();}
  // The year an item belongs to — for what the author added here.
  const yearField=it=>it.mine?`<label class="fm-yr">год: <input type="number" min="1880" max="${new Date().getFullYear()}" value="${it.y||''}" placeholder="—" data-yr="${it.id}"></label>`:'';
  const bindYear=box=>box.querySelector('[data-yr]')?.addEventListener('change',e=>{const it=mine.find(m=>m.id===e.target.dataset.yr);if(!it)return;const v=+e.target.value;
    it.y=v>=1880&&v<=new Date().getFullYear()?v:undefined;store('mine',mine);window.OCHERKI_SAY?.(it.y?`Встанет на нить в ${decOf(it.y)}-е`:'Без года — в конце нити');});
  const seen=it=>{if(stateOf(it)==='new')setState(it.id,'seen');};
  function drawRoom(){room.innerHTML=`<div class="fm-track">
    <section class="fm-part fm-fam" data-p="0"><div class="oc-cap">Ваша семья</div><div class="fm-h">Семья</div>
      <div class="fm-people">${people.map(p=>`<div class="fm-p ${p.nw?'is-new':''}" data-person="${p.n}" title="Что прислал(а) ${p.n}"><div class="a" style="background-image:url(${PH+p.img})"></div><b>${p.n}</b><small>${p.r}</small></div>`).join('')}<div class="fm-p add" data-soon="Приглашение по ссылке заработает после подключения сервера"><div class="a">${ico('plus',34)}</div><b>&nbsp;</b><small>&nbsp;</small></div></div>
      <div class="fm-why">Соберите семью в одном месте. Родные расскажут свои истории голосом, пришлют фото и письма — всё придёт в архив, а вы решите, что взять в книгу.</div>
      <div class="fm-foot"><span class="oc-btn is-main" data-soon="Приглашение по ссылке заработает после подключения сервера">${ico('people',22)}Позвать родных</span></div></section>
    <section class="fm-part fm-week" data-p="1"><div class="wk2">
      <div class="wk2-h">Вопрос недели</div>
      <div class="fm-topics">${Object.keys(TOPICS).map(t=>`<span data-topic="${t}" class="${t===week.topic?'on':''}">${t}</span>`).join('')}</div>
      <div class="wk2-deck"><i class="u u1"></i><i class="u u2"></i><div class="wk2-card"><div class="k">${esc(week.topic)}</div><div class="fm-q">${wkLetters(qOf())}</div></div>
        <svg class="fm-env" viewBox="0 -26 60 68"><rect x="1" y="4" width="58" height="37" rx="2"/><path d="M1,41 L24,22 M59,41 L36,22"/><path class="flap" d="M1,4 L30,26 L59,4"/></svg></div>
      <div class="wk2-nav"><b data-act="prev">‹</b><span class="wk2-n">${wkN()}</span><b data-act="next">›</b></div>
      <div class="wk2-who"><div class="ph" style="background-image:url(${PH}grandma_porch.jpg)"></div><div class="n">Нина Петровна</div><div class="s">кому уходит вопрос</div></div>
      <div class="wk2-when"><div class="k">когда</div><div class="fm-sched">в ${sel('day',['понедельник','среду','пятницу','субботу','воскресенье'])}<br>${sel('time',['утром','днём','вечером'])}<br>${sel('every',['каждую неделю','раз в две недели','раз в месяц'])}<br>${sel('via',['в Telegram','на почту','в WhatsApp'])}</div></div>
      <div class="fm-acts"><span class="oc-btn2" data-act="next">${ico('redo',18)}<span>Другой вопрос</span></span><span class="oc-btn2" data-act="rec">${ico('mic',18)}<span>Записать ответ самому</span></span><span class="oc-btn2 main" data-act="send">${ico('mark',18)}<span>Отправить</span></span></div><div class="fm-note"></div></div></section>
    <section class="fm-part fm-tl" data-p="2">${tlHTML()}</section></div>
    <div class="fm-arrow l">‹</div><div class="fm-arrow r">›</div>
    <div class="fm-dots">${PARTS.map((p,i)=>`<span data-go="${i}">${p}</span>`).join('<span style="cursor:default">·</span>')}</div>
    <div class="fm-sample">Сейчас здесь примеры — так будут выглядеть ваша семья и её ответы</div><div class="fm-open"></div>`;show(part,true);tlAfter(true);}
  let freshT=0;const fresh=()=>{room.classList.add('fresh');clearTimeout(freshT);freshT=setTimeout(()=>room.classList.remove('fresh'),2300);};
  function show(i){fresh();part=(i+PARTS.length)%PARTS.length;room.querySelectorAll('.fm-part').forEach(s=>{const k=+s.dataset.p;s.classList.toggle('on',k===part);s.classList.toggle('left',k<part);});
    room.querySelectorAll('.fm-dots [data-go]').forEach(d=>d.classList.toggle('on',+d.dataset.go===part));
    const was=room.classList.contains('on-tl');room.classList.toggle('on-tl',part===2);if(part===2&&!was&&roomOpen)tlAfter(true);}
  function openRoom(i){room.classList.remove('is-leaving');part=i||0;tl.pan=null;tl.act=null;tl.open={};drawRoom();show(i||0);roomOpen=true;shell.classList.add('is-family-room');syncSwitch();requestAnimationFrame(()=>room.classList.add('on'));
    if(!store('hinted')){store('hinted',1);setTimeout(()=>room.querySelectorAll('.fm-arrow').forEach(a=>a.classList.add('hint')),900);}}
  function closeRoom(){if(!roomOpen)return;roomOpen=false;menu?.remove();menu=null;stopRec(true);
    shell.classList.add('is-room-hold');room.classList.add('is-leaving');
    setTimeout(()=>{room.classList.remove('on');shell.classList.remove('is-family-room');syncSwitch();
      shell.classList.add('is-start-leaving');shell.classList.remove('is-room-hold');
      setTimeout(()=>{room.classList.remove('is-leaving');shell.classList.remove('is-start-leaving');},1500);},420);}
  // v136: the question is a card on a deck — the old one flies off, the next one is underneath
  function swapQuestion(dir=1,fly=false){const card=room.querySelector('.wk2-card');if(!card)return;
    const ghost=card.cloneNode(true);ghost.classList.add('ghost');card.parentNode.appendChild(ghost);
    card.querySelector('.fm-q').innerHTML=wkLetters(qOf());card.querySelector('.k').textContent=week.topic;
    const n=room.querySelector('.wk2-n');if(n)n.textContent=wkN();
    if(fly){ // sent: the card flies away turning, the next one comes up from the deck
      ghost.classList.add('fly');card.classList.remove('up','down');void card.offsetWidth;card.classList.add('up');setTimeout(()=>ghost.remove(),1500);return;}
    if(dir>0){ // forward: the top card goes aside and round under the deck; the next is already there
      ghost.classList.add('under');card.classList.remove('up','down');void card.offsetWidth;card.classList.add('up');}
    else{ // back: the bottom card comes out from under the deck and lies on top
      ghost.classList.add('stay');card.classList.remove('up','down');void card.offsetWidth;card.classList.add('down');}
    setTimeout(()=>ghost.remove(),1300);}
  function send(){
    if(room.querySelector('.wk2-card')){const nt=room.querySelector('.fm-note');if(send._busy)return;send._busy=1;week.i=(week.i||0)+1;store('week',week);swapQuestion(1,true);
      setTimeout(()=>{send._busy=0;if(nt)nt.textContent='Пока это пример: настоящая отправка заработает, когда конструктор подключим к серверу';},1500);return;}
    const q=room.querySelector('.fm-q'),env=room.querySelector('.fm-env'),note=room.querySelector('.fm-note');if(!q||!env||env.classList.contains('busy'))return;env.classList.add('busy');
    const e=env.getBoundingClientRect(),cx=e.left+e.width/2,cy=e.top+e.height/2;
    q.querySelectorAll('span').forEach((sp,k)=>{const r=sp.getBoundingClientRect();sp.animate([{transform:'none',opacity:1,filter:'blur(0)'},{transform:`translate(${cx-(r.left+r.width/2)}px,${cy-(r.top+r.height/2)}px) scale(.2)`,opacity:0,filter:'blur(2px)'}],{duration:700,delay:k*12,easing:'cubic-bezier(.5,0,.3,1)',fill:'forwards'});});
    const t=700+q.querySelectorAll('span').length*12;
    setTimeout(()=>env.classList.add('closed'),t);setTimeout(()=>env.classList.add('go'),t+500);
    const day=new Date().toLocaleDateString('ru-RU',{day:'numeric',month:'short'}).replace('.','').toUpperCase();
    setTimeout(()=>{const stp=document.createElement('div');stp.className='fm-stamp';stp.innerHTML=`<svg viewBox="0 0 220 120"><defs><path id="fmArc" d="M21.5,60 a38.5,38.5 0 1,1 77,0 a38.5,38.5 0 1,1 -77,0"/></defs><circle cx="60" cy="60" r="47"/><circle cx="60" cy="60" r="31"/><text class="arc"><textPath href="#fmArc" startOffset="2%">ПИСЬМО · ОТПРАВЛЕНО · </textPath></text><text x="60" y="56" class="d">${day}</text><text x="60" y="72" class="y">${new Date().getFullYear()}</text><path class="w" d="M112,42 q12,-8 24,0 t24,0 t24,0 t24,0"/><path class="w" d="M112,60 q12,-8 24,0 t24,0 t24,0 t24,0"/><path class="w" d="M112,78 q12,-8 24,0 t24,0 t24,0 t24,0"/></svg><span>Письмо отправлено Нине Петровне</span>`;q.appendChild(stp);requestAnimationFrame(()=>stp.classList.add('on'));},t+650);
    setTimeout(()=>{q.querySelector('.fm-stamp')?.classList.add('off');},t+2700);
    setTimeout(()=>{week.i=(week.i||0)+1;store('week',week);q.innerHTML=wkLetters(qOf());{const n=room.querySelector('.wk2-n');if(n)n.textContent=wkN();}q.classList.remove('out');q.classList.add('in');
      env.classList.remove('go','closed');env.classList.add('back');void env.getBoundingClientRect();env.classList.remove('back');env.classList.remove('busy');
      if(note)note.textContent='Пока это пример: настоящая отправка заработает, когда конструктор подключим к серверу';},t+3200);}
  let menu=null;function pick(el,list,cur,done){menu?.remove();menu=document.createElement('div');menu.className='fm-menu';menu.innerHTML=list.map(o=>`<div class="${o.v===cur?'on':''}" data-v="${esc(o.v)}">${esc(o.t)}</div>`).join('');room.appendChild(menu);
    const r=el.getBoundingClientRect();menu.style.left=Math.max(16,Math.min(innerWidth-260,r.left-20))+'px';menu.style.top=Math.max(16,Math.min(innerHeight-menu.offsetHeight-16,r.bottom+8))+'px';requestAnimationFrame(()=>menu.classList.add('on'));
    menu.addEventListener('click',e=>{e.stopPropagation();const d=e.target.closest('[data-v]');if(!d)return;done(d.dataset.v,d.textContent);menu.remove();menu=null;});}
  const fmt=s=>Math.floor(s/60)+':'+String(Math.floor(s%60)).padStart(2,'0');
  // ——— one voice, open: the record turns while it plays; the words follow the voice ———
  let timer=0,audio=null,spinStop=null;
  function stopPlayback(){clearInterval(timer);timer=0;if(audio){try{audio.pause();}catch(_){}try{URL.revokeObjectURL(audio.src);}catch(_){}audio=null;}spinStop?.();}
  function openRecord(id){const r=allItems().find(x=>x.id===id);if(!r)return;const box=room.querySelector('.fm-open');stopPlayback();seen(r);
    const list=chapters.length?chapters:[{id:'',title:'Детство'}];let target=list[0];
    const sentences=String(r.t||'').match(/[^.!?…]+[.!?…»]*\s*/gu)||[String(r.t||'')];
    const inBook=stateOf(r)==='book';
    box.className='fm-open is-voice';
    box.innerHTML=`<div class="fm-x">×</div><div class="vo-grid">
      <div class="vo-left"><div class="vo-halo"></div>${disc(520,`<div class="vo-who">${esc(r.full)}</div><div class="vo-date">${esc(r.date)}</div>`,'is-big')}</div>
      <div class="vo-right"><div class="fm-k">Голосовая история · ${esc(r.full)}${r.y?' · '+r.y:''}</div>${yearField(r)}<div class="q vo-q">${esc(r.q)}</div>
        <div class="vo-card">${sentences.map((s,k)=>`<span data-s="${k}">${esc(s)}</span>`).join('')}</div>
        <div class="vo-bar"><i class="fill"></i><i class="knob"></i></div><div class="vo-times"><span class="cur">0:00</span><span class="tot">${fmt(r.len||0)}</span></div>
        <div class="vo-ctl"><span class="oc-btn is-round vo-play" title="Слушать">${ico('play',26)}</span>
          ${inBook?`<span class="vo-done">уже в книге, в главе «${esc(placeOf(r))}» · <span class="fm-pick" data-open="1">открыть лист →</span></span>`
          :`<span class="oc-btn is-main" data-tobook="1">${ico('book',20)}Добавить в книгу</span><span class="oc-btn" data-later="1">${ico('mark',18)}${stateOf(r)==='later'?'Вернуть в новые':'На потом'}</span>`}</div>
        ${inBook?'':`<div class="vo-chap">новым листом в главу <span class="fm-pick" data-ch="1">${esc(target.title||'без названия')}</span></div>`}</div></div>`;
    const v=box.querySelector('.oc-vinyl'),btn=box.querySelector('.vo-play'),cur=box.querySelector('.cur'),tot=box.querySelector('.tot'),fill=box.querySelector('.vo-bar .fill'),knob=box.querySelector('.vo-bar .knob');
    let ang=0,speed=0,want=0,raf=0,playing=false,pos=0,len=r.len||0;
    const spinLoop=()=>{speed+=(want-speed)*.04;ang=(ang+speed)%360;v.style.transform=`rotate(${ang}deg)`;if(want||Math.abs(speed)>.02)raf=requestAnimationFrame(spinLoop);else{speed=0;raf=0;}};
    spinStop=()=>{want=0;};
    const paint=()=>{const f=len?Math.min(1,pos/len):0;fill.style.width=(f*100)+'%';knob.style.left=(f*100)+'%';cur.textContent=fmt(pos);
      const k=Math.min(sentences.length-1,Math.floor(f*sentences.length));box.querySelectorAll('.vo-card [data-s]').forEach(s=>s.classList.toggle('on',playing||pos>0?+s.dataset.s===k:false));};
    const setPlay=on=>{playing=on;btn.innerHTML=ico(on?'pause':'play',26);btn.classList.toggle('is-on',on);want=on?1.9:0;if(!raf)raf=requestAnimationFrame(spinLoop);};
    // A recording made here plays for real; a sample shows how it will go.
    if(r.mine)getVoice(r.id).then(blob=>{if(!blob)return;audio=new Audio(URL.createObjectURL(blob));audio.addEventListener('loadedmetadata',()=>{if(isFinite(audio.duration)){len=audio.duration;tot.textContent=fmt(len);}});
      audio.addEventListener('timeupdate',()=>{pos=audio.currentTime;paint();});audio.addEventListener('ended',()=>{setPlay(false);pos=0;paint();});});
    btn.onclick=()=>{const on=!playing;setPlay(on);
      if(audio){on?audio.play().catch(()=>{}):audio.pause();return;}
      clearInterval(timer);if(on)timer=setInterval(()=>{pos=Math.min(len,pos+.25);paint();if(pos>=len){setPlay(false);clearInterval(timer);pos=0;setTimeout(paint,800);}},250);};
    box.querySelector('.vo-bar').addEventListener('click',e=>{const b=e.currentTarget.getBoundingClientRect();pos=Math.max(0,Math.min(1,(e.clientX-b.left)/b.width))*len;if(audio)audio.currentTime=pos;paint();});
    box.querySelector('[data-ch]')?.addEventListener('click',e=>{e.stopPropagation();pick(e.currentTarget,list.map(c=>({v:c.id,t:c.title||'без названия'})),target.id,(id,t)=>{target={id,title:t};e.target.textContent=t;});});
    const openSheet=()=>{closeRecord();closeRoom();window.OCHERKI_SET_MODE?.('write');};
    box.querySelector('[data-open]')?.addEventListener('click',openSheet);
    box.querySelector('[data-tobook]')?.addEventListener('click',()=>{const c=target;
      if(c.id)try{document.getElementById('v35SheetFrame')?.contentWindow?.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',action:'addStoryPage',sectionId:c.id,text:String(r.t||'').replace(/^«|»$/g,''),episode:r.q},'*');}catch(_){}
      added[r.id]=c.title;store('added',added);setState(r.id,'book',c.title);
      box.querySelector('.vo-ctl').innerHTML=`<span class="oc-btn is-round vo-play">${ico(playing?'pause':'play',26)}</span><span class="vo-done">лист добавлен в главу «${esc(c.title)}» · <span class="fm-pick" data-open="1">открыть лист →</span></span>`;
      box.querySelector('.vo-chap')?.remove();const nb=box.querySelector('.vo-play');nb.onclick=btn.onclick;box.querySelector('[data-open]').addEventListener('click',openSheet);
      window.OCHERKI_SAY?.(`Лист добавлен в главу «${c.title}»`,'открыть',openSheet);});
    box.querySelector('[data-later]')?.addEventListener('click',()=>laterToggle(r));
    bindYear(box);box.querySelector('.fm-x').onclick=closeRecord;paint();requestAnimationFrame(()=>box.classList.add('on'));}
  function closeRecord(){const box=room.querySelector('.fm-open');stopPlayback();stopRec(true);if(roomOpen)arRefresh(true);box?.classList.remove('on');}
  function laterToggle(it){const was=stateOf(it)==='later';setState(it.id,was?'new':'later');closeRecord();
    window.OCHERKI_SAY?.(was?'Вернули в новые':'Отложено — найдёте в архиве',was?'':'отменить',was?null:()=>{setState(it.id,it.nw?'new':'');arRefresh(true);});}
  function openPhoto(it){if(!it)return;const box=room.querySelector('.fm-open');seen(it);const s=stateOf(it);box.className='fm-open';
    const toMs=()=>{closeRecord();closeRoom();window.OCHERKI_SET_MODE?.('manuscript');};
    box.innerHTML=`<div class="fm-x">×</div><div class="fm-o"><div class="fm-k">${esc(it.full)} · ${it.imgs.length} фото · ${esc(it.date)}${it.y?' · '+it.y:''}</div><div class="q">${esc(it.q)}</div>${yearField(it)}
      <div class="ar-prints">${it.imgs.slice(0,6).map((m,k)=>`<div class="oc-print" style="--r:${[-5,4,-2][k%3]}deg">${imgTag(m)}</div>`).join('')}</div>
      <div class="vo-ctl is-center">${s==='book'?`<span class="vo-done">уже в «Рукописи», в стопке фото · <span class="fm-pick" data-ms="1">открыть «Рукопись» →</span></span>`:`<span class="oc-btn is-main" data-toms="1">${ico('photos',20)}В «Рукопись»</span><span class="oc-btn" data-later="1">${ico('mark',18)}${s==='later'?'Вернуть в новые':'На потом'}</span>`}</div></div>`;
    box.querySelector('[data-ms]')?.addEventListener('click',toMs);
    box.querySelector('[data-later]')?.addEventListener('click',()=>laterToggle(it));
    box.querySelector('[data-toms]')?.addEventListener('click',()=>{const add=window.OCHERKI_TRAY_ADD;const done=n=>{setState(it.id,'book','Рукопись');box.querySelector('.vo-ctl').innerHTML=`<span class="vo-done">${n} фото легли в стопку «Рукописи» · <span class="fm-pick" data-ms="1">открыть →</span></span>`;box.querySelector('[data-ms]').addEventListener('click',toMs);window.OCHERKI_SAY?.(`${n} фото в стопке «Рукописи»`,'открыть',toMs);};
      if(add)Promise.all(it.imgs.map(traySrc)).then(l=>add(l.filter(Boolean))).then(done);else done(it.imgs.length);});
    loadImgs(box);bindYear(box);box.querySelector('.fm-x').onclick=closeRecord;requestAnimationFrame(()=>box.classList.add('on'));}
  function openNote(it){if(!it)return;seen(it);if(!it.edits?.length){openLetter(it);return;}const box=room.querySelector('.fm-open');const rev=(arch[it.id]?.rev)||{};box.className='fm-open';
    box.innerHTML=`<div class="fm-x">×</div><div class="fm-o nt-o"><div class="oc-cap">${esc(it.full)} · вычитка · ${esc(it.date)}</div><div class="q">${esc(it.q)}</div>
      <div class="nt-why">Правки уже стоят на листах. Не согласны — верните, и на листе останется ваш вариант.</div>
      <div class="ar-edits">${it.edits.map((e,k)=>`<div class="ar-ed ${rev[k]?'is-rev':''}" style="--k:${k}" data-ed="${k}"><span class="was"><i>${esc(e.was)}</i></span><span class="arr">→</span><span class="now"><i>${esc(e.now)}</i></span><span class="ar-act">${ico('redo',18)}<em>${rev[k]?'принять снова':'вернуть'}</em></span></div>`).join('')}</div>
      <div class="vo-ctl is-center"><span class="oc-btn" data-back="1">${ico('back',18)}Назад в архив</span></div></div>`;
    box.querySelector('[data-back]').onclick=closeRecord;
    box.querySelectorAll('.ar-act').forEach(a=>a.addEventListener('click',()=>{const row=a.closest('[data-ed]'),k=+row.dataset.ed;rev[k]=!rev[k];arch[it.id]=Object.assign({},arch[it.id],{rev});store('arch',arch);
      row.classList.toggle('is-rev',rev[k]);a.querySelector('em').textContent=rev[k]?'принять снова':'вернуть';window.OCHERKI_SAY?.(rev[k]?'Вернули, как было у вас':'Правка снова на листе');}));
    box.querySelector('.fm-x').onclick=closeRecord;requestAnimationFrame(()=>box.classList.add('on'));}
  // v112: a letter or a memory written here — kept in the archive, can go into the book as a page.
  function openLetter(it){const box=room.querySelector('.fm-open');box.className='fm-open';
    const list=chapters.length?chapters:[{id:'',title:'Детство'}];let target=list[0];const inBook=stateOf(it)==='book';
    box.innerHTML=`<div class="fm-x">×</div><div class="fm-o lt-o"><div class="fm-k">${esc(it.full)} · ${esc(it.date)}${it.y?' · '+it.y:''}</div><div class="q">${esc(it.q)}</div>${yearField(it)}
      <div class="lt-paper">${esc(it.t||'').replace(/\n/g,'<br>')}</div>
      <div class="vo-ctl is-center">${inBook?`<span class="vo-done">уже в книге, в главе «${esc(placeOf(it))}»</span>`:`<span class="oc-btn is-main" data-tobook="1">${ico('book',20)}Добавить в книгу</span>`}</div>
      ${inBook?'':`<div class="vo-chap">новым листом в главу <span class="fm-pick" data-ch="1">${esc(target.title||'без названия')}</span></div>`}</div>`;
    box.querySelector('[data-ch]')?.addEventListener('click',e=>{e.stopPropagation();pick(e.currentTarget,list.map(c=>({v:c.id,t:c.title||'без названия'})),target.id,(id,t)=>{target={id,title:t};e.target.textContent=t;});});
    box.querySelector('[data-tobook]')?.addEventListener('click',()=>{const c=target;
      if(c.id)try{document.getElementById('v35SheetFrame')?.contentWindow?.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',action:'addStoryPage',sectionId:c.id,text:String(it.t||''),episode:it.q},'*');}catch(_){}
      added[it.id]=c.title;store('added',added);setState(it.id,'book',c.title);box.querySelector('.vo-ctl').innerHTML=`<span class="vo-done">лист добавлен в главу «${esc(c.title)}»</span>`;box.querySelector('.vo-chap')?.remove();
      window.OCHERKI_SAY?.(`Лист добавлен в главу «${c.title}»`);});
    bindYear(box);box.querySelector('.fm-x').onclick=closeRecord;requestAnimationFrame(()=>box.classList.add('on'));}
  function openWriter(){const box=room.querySelector('.fm-open');closeMenus();box.className='fm-open is-write';
    box.innerHTML=`<div class="fm-x">×</div><div class="fm-o wr-o"><div class="fm-k">Письмо или воспоминание</div>
      <input class="wr-t" maxlength="90" placeholder="О чём это — например, «Письмо из Тифлиса»">
      <label class="fm-yr">год: <input class="wr-y" type="number" min="1880" max="${new Date().getFullYear()}" placeholder="—"></label>
      <textarea class="wr-x" placeholder="Напишите или вставьте текст…"></textarea>
      <div class="vo-ctl is-center"><span class="oc-btn" data-wr="no">Отмена</span><span class="oc-btn is-main" data-wr="ok">${ico('check',20)}Сохранить в архив</span></div></div>`;
    const t=box.querySelector('.wr-t'),y=box.querySelector('.wr-y'),x=box.querySelector('.wr-x');
    box.querySelector('[data-wr="no"]').onclick=closeRecord;
    box.querySelector('[data-wr="ok"]').onclick=()=>{const text=x.value.trim();if(!text){x.focus();window.OCHERKI_SAY?.('Сначала напишите текст');return;}
      const v=+y.value,id='w'+Date.now().toString(36);mine.unshift({id,kind:'note',who:'Вы',full:'Вы',date:today(),q:t.value.trim()||text.split(/\s+/).slice(0,5).join(' ')+'…',y:v>=1880&&v<=new Date().getFullYear()?v:undefined,t:text,edits:[],mine:1});store('mine',mine);
      box.classList.remove('on');tl.act=id;arRefresh(true);setTimeout(()=>tlFocus(id),60);window.OCHERKI_SAY?.('Сохранено в архив');};
    box.querySelector('.fm-x').onclick=closeRecord;requestAnimationFrame(()=>{box.classList.add('on');setTimeout(()=>t.focus(),300);});}
  // ——— v108: «Запись воспоминания» — a room of its own ———
  const REC_QS=[['user','Расскажите о себе'],['people','Ваша семья'],['tree','Каким было ваше детство?'],['house','Дом, в котором вы жили'],['cap','Учёба и первые увлечения'],['bag','Работа и призвание'],['heart','Главные ценности']];
  let rec=null;
  function stopRec(discard){if(!rec)return;const r=rec;rec=null;cancelAnimationFrame(r.raf);clearInterval(r.tick);
    try{r.sr?.stop();}catch(_){}try{if(r.mr&&r.mr.state!=='inactive'){r.discard=discard;r.mr.stop();}}catch(_){}try{r.stream?.getTracks().forEach(t=>t.stop());}catch(_){}try{r.ac?.close();}catch(_){}}
  function openRecorder(question){const box=room.querySelector('.fm-open');closeMenus();stopPlayback();stopRec(true);
    // v135: the recording screen as drawn — a question card in the middle, themes on the right, the mic between two waves
    const answered=new Set(mine.map(m=>m.q)),topics=Object.keys(TOPICS);
    let topic=topics.find(t=>TOPICS[t].includes(question))||(TOPICS[week.topic]?week.topic:topics[0]);
    let q=question||TOPICS[topic].find(x=>!answered.has(x))||TOPICS[topic][0];
    box.className='fm-open is-rec';
    box.innerHTML=`<div class="fm-x">×</div><div class="rc2">
      <div class="rc2-h">Запись ответа</div>
      <div class="rc2-card"><span class="rc2-a l" data-qs="-1">‹</span><div class="k">вопрос для записи</div><div class="q rc-qt">${esc(q)}</div><span class="rc2-a r" data-qs="1">›</span></div>
      <label class="fm-yr rc-yr">о каком годе: <input type="number" min="1880" max="${new Date().getFullYear()}" placeholder="—"></label>
      <div class="rc2-me"><div class="ph">Вы</div><div class="n">отвечаете сами</div></div>
      <div class="rc-list rc2-th"><div class="k">тема</div>${topics.map(t=>`<span data-t="${esc(t)}" class="${t===topic?'on':''}">${esc(t)}</span>`).join('')}</div>
      <div class="rc-stage"><div class="rc-wave l"></div><span class="rc-btn" title="Начать запись"><svg viewBox="0 0 24 24"><rect x="9" y="3.5" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M8.5 21h7"/></svg><i></i></span><div class="rc-wave r"></div></div>
      <div class="rc-time">0:00</div>
      <div class="rc-strip"><span class="rc-text">Нажмите и рассказывайте — слова появятся здесь</span></div>
      <div class="rc2-acts"><span class="oc-btn2 idle" data-rc="other">${ico('redo',18)}<span>Другой вопрос</span></span>
        <span class="oc-btn2 live" data-rc="again">${ico('redo',18)}<span>Заново</span></span><span class="oc-btn2 live" data-rc="pause">${ico('pause',18)}<span>Пауза</span></span><span class="oc-btn2 main live" data-rc="done">${ico('check',18)}<span>Готово — в архив</span></span></div></div>`;
    const bars=n=>Array.from({length:n},()=>'<i></i>').join('');box.querySelector('.rc-wave.l').innerHTML=bars(34);box.querySelector('.rc-wave.r').innerHTML=bars(34);
    const btn=box.querySelector('.rc-btn'),tm=box.querySelector('.rc-time'),txt=box.querySelector('.rc-text'),waves=[...box.querySelectorAll('.rc-wave i')];
    let finalText='',secs=0,chunks=[];
    const qt=box.querySelector('.rc-qt');
    // the question cards are a deck too: the top one goes round under it, the next one comes up
    const setQ=(t,dir=1)=>{if(rec||t===q)return;q=t;const card=box.querySelector('.rc2-card');const g=card.cloneNode(true);g.classList.add('rc-ghost',dir<0?'back':'fwd');g.querySelectorAll('[data-qs]').forEach(x=>x.removeAttribute('data-qs'));card.after(g);
      qt.textContent=t;card.classList.remove('rc-up','rc-down');void card.offsetWidth;card.classList.add(dir<0?'rc-down':'rc-up');setTimeout(()=>g.remove(),1300);};
    const stepQ=d=>{const L=TOPICS[topic];setQ(L[(L.indexOf(q)+d+L.length)%L.length],d);};
    box.querySelectorAll('[data-qs]').forEach(a=>a.addEventListener('click',()=>stepQ(+a.dataset.qs)));
    box.querySelector('[data-rc="other"]').addEventListener('click',()=>stepQ(1));
    box.querySelector('.rc-list').addEventListener('click',e=>{const it=e.target.closest('[data-t]');if(!it||rec)return;topic=it.dataset.t;
      box.querySelectorAll('.rc2-th [data-t]').forEach(x=>x.classList.toggle('on',x===it));const L=TOPICS[topic];setQ(L.find(x=>!answered.has(x))||L[0]);});
    const say=t=>{txt.textContent=t;box.classList.remove('has-words');};
    async function start(){
      if(!window.isSecureContext||!navigator.mediaDevices?.getUserMedia){say('Микрофон работает, когда конструктор открыт по https или прямо с этого компьютера.');return;}
      let stream;try{stream=await navigator.mediaDevices.getUserMedia({audio:true});}catch(err){
        let none=false;try{none=!(await navigator.mediaDevices.enumerateDevices()).some(d=>d.kind==='audioinput');}catch(_){}
        say(none?'Микрофон не найден — подключите его и нажмите ещё раз.':'Разрешите доступ к микрофону в браузере и нажмите ещё раз.');return;}
      const r=rec={stream,paused:false};chunks=[];finalText='';secs=0;box.classList.add('is-recording');btn.title='Пауза';
      try{r.mr=new MediaRecorder(stream);r.mr.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data);};r.mr.onstop=()=>{if(!r.discard&&r.onsaved)r.onsaved(new Blob(chunks,{type:r.mr.mimeType||'audio/webm'}));};r.mr.start(500);}catch(_){}
      try{r.ac=new (window.AudioContext||window.webkitAudioContext)();const src=r.ac.createMediaStreamSource(stream);r.an=r.ac.createAnalyser();r.an.fftSize=256;src.connect(r.an);
        const data=new Uint8Array(r.an.frequencyBinCount);const draw=()=>{if(rec!==r)return;r.an.getByteFrequencyData(data);
          waves.forEach((b,k)=>{const j=k<34?33-k:k-34;const v=r.paused?0:data[2+j*2]/255;b.style.height=Math.max(3,v*120)+'px';});r.raf=requestAnimationFrame(draw);};draw();}catch(_){}
      r.tick=setInterval(()=>{if(!r.paused){secs++;tm.textContent=fmt(secs);}},1000);
      // Live words: the browser's speech recognition (Chrome, Edge), Russian.
      const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
      if(SR){try{const sr=r.sr=new SR();sr.lang='ru-RU';sr.continuous=true;sr.interimResults=true;
        sr.onresult=e=>{let interim='';for(let i=e.resultIndex;i<e.results.length;i++){const t=e.results[i][0].transcript;if(e.results[i].isFinal)finalText+=(finalText?' ':'')+t.trim();else interim+=t;}
          txt.textContent=(finalText+' '+interim).trim()||'…';box.classList.add('has-words');};
        sr.onend=()=>{if(rec===r&&!r.paused)try{sr.start();}catch(_){}};sr.start();}catch(_){}}
      else say('Говорите — запись идёт. Слова в текст переводит Chrome; в этом браузере сохранится только голос.');
      if(SR)say('Говорите — слова появятся здесь…');}
    const pause=()=>{const r=rec;if(!r)return;r.paused=!r.paused;box.classList.toggle('is-paused',r.paused);
      try{r.paused?r.mr?.pause():r.mr?.resume();}catch(_){}try{r.paused?r.sr?.stop():r.sr?.start();}catch(_){}
      box.querySelector('[data-rc="pause"]').innerHTML=r.paused?`${ico('play',18)}<span>Дальше</span>`:`${ico('pause',18)}<span>Пауза</span>`;};
    btn.onclick=()=>{if(!rec)start();else pause();};
    box.querySelector('[data-rc="pause"]').onclick=pause;
    box.querySelector('[data-rc="again"]').onclick=()=>{stopRec(true);box.classList.remove('is-recording','is-paused','has-words');secs=0;tm.textContent='0:00';say('Нажмите и рассказывайте — слова появятся здесь');waves.forEach(b=>b.style.height='3px');};
    box.querySelector('[data-rc="done"]').onclick=()=>{const r=rec;if(!r){window.OCHERKI_SAY?.('Сначала запишите ответ — нажмите на кнопку');return;}
      const yv=+(box.querySelector('.rc-yr input')?.value||0);const id='u'+Date.now().toString(36),item={id,kind:'voice',who:'Вы',full:'Вы',date:today(),y:yv>=1880&&yv<=new Date().getFullYear()?yv:undefined,q,t:finalText?'«'+finalText+'»':'(запись без расшифровки)',len:secs,mine:1};
      r.onsaved=blob=>{putVoice(id,blob);};mine.unshift(item);store('mine',mine);stopRec(false);
      box.classList.remove('on');fWho='';tl.act=id;show(2);arRefresh(true);setTimeout(()=>tlFocus(id),80);
      window.OCHERKI_SAY?.('Запись сохранена в архив','послушать',()=>openRecord(id));};
    box.querySelector('.fm-x').onclick=closeRecord;requestAnimationFrame(()=>box.classList.add('on'));}
  const closeMenus=()=>{menu?.remove();menu=null;};
  room.addEventListener('click',e=>{const t=e.target;
    if(menu&&!t.closest('.fm-menu')){menu.remove();menu=null;}
    const pk=t.closest('.fm-pick[data-k]');if(pk){const k=pk.dataset.k;pick(pk,pk.dataset.opts.split('|').map(o=>({v:o,t:o})),week[k],v=>{week[k]=v;store('week',week);pk.textContent=v;});return;}
    if(t.closest('[data-rec]')){openRecorder();return;}
    const person=t.closest('[data-person]');if(person){fWho=allItems().some(x=>x.who===person.dataset.person)?person.dataset.person:'';tl.pan=null;tl.act=null;show(2);arRefresh(true);return;}
    if(tl.moved){tl.moved=false;return;}
    const tla=room.querySelector('.fm-tl');
    if(tla?.classList.contains('faces-on')&&!t.closest('.tl-faces,[data-tlwho]')){tla.classList.remove('faces-on');return;}
    if(t.closest('[data-tlwho]')){tla?.classList.toggle('faces-on');return;}
    const tf=t.closest('[data-tlface]');if(tf){fWho=tf.dataset.tlface;tl.pan=null;tl.act=null;tla?.classList.remove('faces-on');arRefresh();return;}
    if(t.closest('[data-tlnew]')){const L=[...room.querySelectorAll('.fm-tl .tl-it.is-new[data-it]')].sort((a,b)=>b.dataset.x-a.dataset.x);if(!L.length)return;const i=L.findIndex(el=>el.dataset.it===tl.act);const nx=L[(i+1)%L.length].dataset.it;tlSetAct(nx);tlFocus(nx);return;}
    const ad=t.closest('[data-add]')?.dataset.add;if(ad){if(ad==='voice')openRecorder();else if(ad==='photo')addPhotos();else openWriter();return;}
    const stk=t.closest('[data-stack]');if(stk){tl.open[stk.dataset.stack]=true;arRefresh(true);return;}
    const tp2=t.closest('[data-tlpan]');if(tp2){tlGo(tl.pan-(+tp2.dataset.tlpan)*Math.round(tl.vw*.55));return;}
    const it=t.closest('[data-it]');if(it){const x=allItems().find(y=>y.id===it.dataset.it);if(x){if(it.classList.contains('tl-it'))tlSetAct(x.id);if(x.kind==='voice')openRecord(x.id);else if(x.kind==='photo')openPhoto(x);else openNote(x);}return;}
    if(t.closest('.fm-arrow.l')){show(part-1);return;}if(t.closest('.fm-arrow.r')){show(part+1);return;}
    const d=t.closest('.fm-dots [data-go]');if(d){show(+d.dataset.go);return;}
    const tp=t.closest('[data-topic]');if(tp){week.topic=tp.dataset.topic;week.i=0;store('week',week);room.querySelectorAll('[data-topic]').forEach(x=>x.classList.toggle('on',x===tp));swapQuestion();return;}
    const a=t.closest('[data-act]')?.dataset.act;if(a==='next'||a==='prev'){week.i=(week.i||0)+(a==='prev'?-1:1);store('week',week);swapQuestion(a==='prev'?-1:1);return;}if(a==='send'){send();return;}if(a==='rec'){openRecorder(qOf());return;}
    const soon=t.closest('[data-soon]');if(soon){try{window.OCHERKI_SHOW_TOAST?.(soon.dataset.soon);}catch(_){}}});
  let wheelT=0;room.addEventListener('wheel',e=>{if(room.querySelector('.fm-open.on'))return;if(part===2&&room.querySelector('.fm-tl')){const d=Math.abs(e.deltaX)>Math.abs(e.deltaY)?e.deltaX:e.deltaY;tlGo(tl.pan-d*1.1);return;}const now=Date.now();if(now-wheelT<700||Math.abs(e.deltaY)<8)return;wheelT=now;show(part+(e.deltaY>0?1:-1));},{passive:true});
  addEventListener('keydown',e=>{if(room.querySelector('.fm-open.on')){if(e.key==='Escape')closeRecord();return;}
    if(roomOpen&&part===2&&(e.key==='ArrowRight'||e.key==='ArrowLeft')){tlGo(tl.pan+(e.key==='ArrowLeft'?1:-1)*420);return;}
    if(roomOpen&&e.key==='ArrowRight')show(part+1);if(roomOpen&&e.key==='ArrowLeft')show(part-1);if(e.key==='Escape'&&st.classList.contains('on'))hideStart();});
  room.addEventListener('pointerdown',e=>{if(part!==2||!e.target.closest('.tl-view')||e.button)return;tl.drag={x:e.clientX,p:tl.pan,s:room.querySelector('.tl-stage')?.getBoundingClientRect().width/(tl.vw+ENDW)||1};tl.moved=false;});
  addEventListener('pointermove',e=>{const d=tl.drag;if(!d)return;const dx=(e.clientX-d.x)/d.s;if(Math.abs(dx)>6)tl.moved=true;if(tl.moved){room.querySelector('.fm-tl')?.classList.add('is-drag');tlGo(d.p+dx,true);}});
  addEventListener('pointerup',()=>{if(!tl.drag)return;tl.drag=null;room.querySelector('.fm-tl')?.classList.remove('is-drag');setTimeout(()=>{tl.moved=false;},30);});
  addEventListener('resize',()=>{if(roomOpen&&room.querySelector('.fm-tl')){tlFit();tlGo(tl.pan,true);}});
  function syncSwitch(){const s=sw();if(!s)return;let b=s.querySelector('button[data-mode="family"]');
    if(!b){b=document.createElement('button');b.type='button';b.dataset.mode='family';b.textContent='Семья';s.appendChild(b);setTimeout(()=>dispatchEvent(new Event('resize')),50);}
    b.classList.toggle('has-new',newCount()>0&&!roomOpen);
    if(roomOpen)s.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));else b.classList.remove('on');}
  const wait=setInterval(()=>{const s=sw();if(!s)return;clearInterval(wait);syncSwitch();
    s.addEventListener('click',e=>{const b=e.target.closest('button[data-mode]');if(!b)return;
      if(b.dataset.mode==='family'){e.stopPropagation();e.preventDefault();openRoom(0);
        // The book or the manuscript is put away under the room, without a flying sheet.
        setTimeout(()=>{if(roomOpen&&(window.OCHERKI_MANUSCRIPT?.isOpen?.()||document.getElementById('bookPreviewModal')?.classList.contains('open')))window.OCHERKI_SET_MODE?.('write');},1100);return;}
      if(roomOpen){
        // v108: into the book the room stays over it until the cover is ready — no blank spread seen.
        if(b.dataset.mode==='book'){setTimeout(closeRoom,1400);return;}
        closeRoom();if(b.dataset.mode==='write')e.stopPropagation();}},true);
    new MutationObserver(()=>{if(roomOpen)syncSwitch();}).observe(s,{attributes:true,subtree:true,attributeFilter:['class']});},200);
  window.OCHERKI_FAMILY={items:()=>allItems().map(it=>({...it,state:stateOf(it)})),people:()=>people.slice(),src:m=>String(m).startsWith('idb:')?(IMG[m]||''):PH+m,traySrc:m=>traySrc(m),setState:(id,st,ch)=>setState(id,st,ch),
    openItem:id=>{const it=allItems().find(x=>x.id===id);if(!it)return false;if(it.kind==='voice')openRecord(id);else if(it.kind==='photo')openPhoto(it);else if(it.kind==='note')openNote(it);else if(typeof openLetter==='function')openLetter(it);return true;},part:()=>part,isOpen:()=>roomOpen,openRoom,closeRoom,showStart:()=>document.getElementById('booksBtn')?.click(),hideStart,show:i=>show(i),openRecorder:q=>{if(!roomOpen)openRoom(2);setTimeout(()=>openRecorder(q),roomOpen?0:500);},
    toBook:id=>{const it=allItems().find(x=>x.id===id);if(!it)return '';const c=(chapters.length?chapters:[{id:'',title:'Детство'}])[0];
      if(c.id)try{document.getElementById('v35SheetFrame')?.contentWindow?.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',action:'addStoryPage',sectionId:c.id,text:String(it.t||'').replace(/^«|»$/g,''),episode:it.q},'*');}catch(_){}
      seen(it);added[it.id]=c.title;store('added',added);setState(it.id,'book',c.title);return c.title||'без названия';},
    placeOf:id=>{const it=allItems().find(x=>x.id===id);return it?placeOf(it):'';},
    seen:id=>{const it=allItems().find(x=>x.id===id);if(it)seen(it);},
    voice:id=>getVoice(id),
    noteRev:(id,on)=>{const it=allItems().find(x=>x.id===id);if(!it)return;const rev={};(it.edits||[]).forEach((_,k)=>rev[k]=!!on);arch[id]=Object.assign({},arch[id],{rev});store('arch',arch);seen(it);},
    revOf:id=>{const r=arch[id]?.rev||{};return Object.values(r).some(Boolean);},
    // v142: from an item to its place in the book: the room closes, «Писать» opens on that chapter
    goPlace:id=>{const it=allItems().find(x=>x.id===id);const name=String(it?.place||'').toLowerCase();const c=chapters.find(x=>String(x.title||'').toLowerCase()===name)||chapters.find(x=>name&&String(x.title||'').toLowerCase().includes(name));
      closeRoom();window.OCHERKI_SET_MODE?.('write');if(c?.id)setTimeout(()=>{try{document.getElementById('v35SheetFrame')?.contentWindow?.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',action:'select',sectionId:c.id},'*');}catch(_){}},700);}};
})();
