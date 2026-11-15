/*@block [" id=\"manuscript-screen-script\"", ""]*/
(()=>{const shell=document.querySelector('.shell');if(!shell)return;
  const scr=document.createElement('div');scr.className='ms-screen';scr.setAttribute('aria-label','Рукопись');
  // v107: a soft light follows the pointer over the sheets, like the lamp over the editor.
  {const glow=document.createElement('div');glow.className='ms-glow';scr.appendChild(glow);let gx=innerWidth/2,gy=innerHeight/2,tx=gx,ty=gy,graf=0;
   const gstep=()=>{gx+=(tx-gx)*.085;gy+=(ty-gy)*.085;glow.style.transform=`translate(${gx.toFixed(1)}px,${gy.toFixed(1)}px)`;graf=(Math.abs(tx-gx)+Math.abs(ty-gy)>.4)?requestAnimationFrame(gstep):0;};
   scr.addEventListener('pointermove',e=>{tx=e.clientX;ty=e.clientY;scr.classList.add('has-glow');if(!graf)graf=requestAnimationFrame(gstep);});
   scr.addEventListener('pointerleave',()=>scr.classList.remove('has-glow'));}
  scr.innerHTML='<div class="ms-dust"></div><div class="ms-space"><div class="ms-world"></div></div><nav class="ms-toc"></nav><div class="ms-sec-veil" hidden></div><div class="ms-sections" hidden></div>'
    +'<div class="ms-hint">колесо — листать · нажмите лист — писать · потяните — переставить</div>';
  document.body.appendChild(scr);
  const world=scr.querySelector('.ms-world'),toc=scr.querySelector('.ms-toc'),secPanel=scr.querySelector('.ms-sections');
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const rnd=(i,k)=>{const x=Math.sin(i*12.9898+k*78.233)*43758.5453;return x-Math.floor(x);};
  const frame=()=>document.getElementById('v35SheetFrame');
  const send=cmd=>{try{frame()?.contentWindow?.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',...cmd},'*');}catch(e){}};
  const dust=scr.querySelector('.ms-dust');for(let i=0;i<44;i++){const d=document.createElement('i');const s=1+Math.random()*3;Object.assign(d.style,{left:Math.random()*100+'%',top:Math.random()*100+'%',width:s+'px',height:s+'px',opacity:(.2+Math.random()*.6).toFixed(2),animationDuration:(14+Math.random()*20)+'s',animationDelay:(-Math.random()*20)+'s'});dust.appendChild(d);}

  // ——— The basket: a wicker waste-paper basket in the corner. It fills up
  // with the sheets carried into it; a press shows them, each can come back.
  const bin=document.createElement('div');bin.className='ms-bin';bin.innerHTML=`
    <span class="key ms-bin-key"><span class="cap"><svg viewBox="0 0 48 48" aria-hidden="true">
      <g class="ms-bin-papers"><path d="M17 15.5l3.5-5.5 4.5 2.2-2.6 4.6Z"/><path d="M24 15.8l4-6.3 4.6 3-3.4 4.4Z"/><path d="M20.5 16.4c.6-2.6 3-3.4 4.3-1.6 1.3-1.5 3.6-.6 3.2 1.7"/></g>
      <ellipse cx="24" cy="17" rx="11" ry="2.6"/><path d="M13.2 17.4 16 37.2c.3 1.5 4 2.4 8 2.4s7.7-.9 8-2.4l2.8-19.8"/><path d="M19.3 20.5l1.3 15.8M24 20.8v16.2M28.7 20.5l-1.3 15.8"/>
    </svg></span></span>
    <b class="ms-bin-count" hidden>0</b><span class="ms-bin-label">Корзина</span>
    <div class="ms-bin-list" hidden></div>`;
  {const key=bin.querySelector('.ms-bin-key');let ang=0,vel=0,raf=0;const step=()=>{vel+=-.010*ang;vel*=.991;ang+=vel;ang=Math.max(-1.6,Math.min(1.6,ang));if(key)key.style.transform=`rotate(${ang.toFixed(2)}deg)`;if(Math.abs(ang)<.01&&Math.abs(vel)<.002){ang=0;vel=0;if(key)key.style.transform='';raf=0;return;}raf=requestAnimationFrame(step);};
    bin.addEventListener('pointerenter',e=>{vel=Math.max(-.22,Math.min(.22,vel+.12*(e.movementX<0?-1:1)));if(!raf)raf=requestAnimationFrame(step);});}
  scr.appendChild(bin);
  const binCount=bin.querySelector('.ms-bin-count'),binList=bin.querySelector('.ms-bin-list');
  let binItems=[];
  function drawBin(){bin.classList.toggle('is-full',binItems.length>0);binCount.hidden=!binItems.length;binCount.textContent=String(binItems.length);
    binList.innerHTML=binItems.length?`<div class="ms-bin-head">В корзине</div>${binItems.slice().reverse().map(it=>`<div class="ms-bin-item"><span>${esc(it.name)}<small>${esc(it.from||'')}</small></span><button type="button" data-restore="${esc(it.id)}">Вернуть</button></div>`).join('')}<button type="button" class="ms-bin-empty">Очистить корзину</button>`:'<div class="ms-bin-head">Корзина пуста</div><p>Перетащите сюда лист, который не нужен в книге.</p>';}
  bin.addEventListener('click',e=>{const r=e.target.closest('[data-restore]');if(r){e.stopPropagation();send({action:'restoreFromBin',id:r.dataset.restore});return;}
    if(e.target.closest('.ms-bin-empty')){e.stopPropagation();if(confirm('Очистить корзину? Убранные листы нельзя будет вернуть.'))send({action:'emptyBin'});return;}
    if(e.target.closest('.ms-bin-list'))return;binList.hidden=!binList.hidden;});
  scr.addEventListener('pointerdown',e=>{if(!bin.contains(e.target))binList.hidden=true;});
  drawBin();
  const undo=document.createElement('div');undo.className='ms-undo';undo.innerHTML='<span></span><button type="button">Вернуть</button>';scr.appendChild(undo);
  let undoTimer=0,lastRemoved='';const showUndo=(text,canUndo)=>{undo.querySelector('span').textContent=text;undo.querySelector('button').hidden=!canUndo;undo.classList.add('on');clearTimeout(undoTimer);undoTimer=setTimeout(()=>undo.classList.remove('on'),canUndo?7000:3200);};
  undo.querySelector('button').addEventListener('click',()=>{send({action:'restoreFromBin',id:lastRemoved});undo.classList.remove('on');});
  addEventListener('message',e=>{const d=e.data||{};
    if(d.type==='OCHERKI_MANUSCRIPT_NOTE')showUndo(d.text||'',false);
    if(d.type==='OCHERKI_MANUSCRIPT_BIN'){binItems=Array.isArray(d.items)?d.items:[];drawBin();if(d.removed){lastRemoved=d.removed;showUndo('Лист в корзине',true);bin.classList.remove('is-gulp');void bin.offsetWidth;bin.classList.add('is-gulp');}}});

  let state=null,groups=[],focus=0,els=[],isOpen=false,rowsTotal=1,groupRow0=[],groupRows=[],activeUid='',bookUid='',gap=null,closeTimer=0,secPick='';
  addEventListener('message',e=>{const d=e.data||{};if(d.type==='OCHERKI_ACTIVE_STATE'&&d.payload?.pageUid)activeUid=d.payload.pageUid;
    if(d.type==='OCHERKI_STRUCTURE_STATE'){for(const sec of d.payload?.sections||[])for(const pg of sec.pages||[])if(pg.active)activeUid=pg.uid;}});
  let holdUntil=0,holdTimer=0,frozen=false,builtSig='';
  addEventListener('message',e=>{const d=e.data||{};if(d.type!=='OCHERKI_STRUCTURE_STATE')return;state=d.payload;if(!isOpen||drag||frozen)return;
    // The same book again (the answer to «requestState»): nothing to rebuild, so nothing twitches.
    let sig='';try{sig=JSON.stringify(state)+'|'+activeUid;}catch(err){}if(sig&&sig===builtSig)return;
    const wait=holdUntil-Date.now();clearTimeout(holdTimer);if(wait>0)holdTimer=setTimeout(()=>{if(isOpen&&!drag)build();},wait);else build();});
  // The book as groups: its beginning, each chapter, the appendices.
  function makeGroups(){
    // v102: the sections of the beginning and of the appendices that are not
    // in the book stand in their places as clear sheets «＋ эпиграф».
    const all=state?.sections||[],secs=all.filter(s=>s.included!==false);
    const firstCh=all.findIndex(s=>s.type==='chapter'&&s.included!==false),lastCh=all.map(s=>s.type==='chapter'&&s.included!==false).lastIndexOf(true);
    const out=[];
    const pack=(title,sub,list,chapter,ghosts)=>{const sheets=list.flatMap(s=>{if(s.included===false)return ghosts&&s.type!=='chapter'&&s.type!=='cover'?[{s,p:(s.pages||[])[0]||{uid:'ghost_'+s.id},i:0,ghost:true}]:[];return (s.pages||[]).filter(p=>p.included!==false).map((p,i)=>({s,p,i}));});
      const count=sheets.filter(x=>!x.ghost).length;if(sheets.length)out.push({title,sub,sheets,chapter,count});};
    if(firstCh<0){pack('Книга','',all,null,true);return out;}
    pack('Начало книги','обложка, титул, вступление',all.slice(0,firstCh),null,true);
    all.slice(firstCh,lastCh+1).filter(s=>s.included!==false).forEach(s=>{if(s.type==='chapter')pack(String(s.title||'').replace(/^Глава\s+\d+[.:]?\s*/i,'')||s.title,String(s.title||'').match(/^Глава\s+\d+/i)?.[0]||'Глава',[s],s);else pack(s.title,'',[s],null);});
    pack('Приложения','древо, хронология, рецепты, голоса',all.slice(lastCh+1),null,true);
    return out;}
  const plural=n=>n%10===1&&n%100!==11?'лист':(n%10>=2&&n%10<=4&&(n%100<10||n%100>=20))?'листа':'листов';
  function excerpt(t,n){t=String(t||'').replace(/\s+/g,' ').trim().replace(/[^\s\u200b]{22,}/gu,w=>w.replace(/([^\s]{8})(?=[^\s])/gu,'$1\u200b'));if(t.length<=n)return t;const cut=t.slice(0,n),soft=cut.replace(/\s\S*$/,'');return (cut.length-soft.length<24?soft:cut)+'…';}
  function card(sh,n){const {s,p}=sh;const ph=(p.photos||[]).find(x=>x.src);const own=(p.userEdited||!(p.sample||s.sample))&&String(p.text||'').trim();
    const head=esc(String(s.title||'').match(/^Глава\s+\d+/i)?.[0]||s.title||'');
    const title=esc(p.episode&&s.type==='chapter'?String(p.episode).replace(/^Эпизод\s+\d+[.:]?\s*/i,''):(p.title||s.title||''));
    if(!own&&!ph&&s.type==='chapter'){const q=(p.prompts||[])[0]||'О чём этот лист?';return `<div class="ms-paper"><div class="ch">${head}</div><div class="ep">${title}</div><div class="q">${esc(q)}</div><div class="tag">${s.sample?'образец':'пустой лист'}</div><div class="no">${n}</div></div>`;}
    const text=excerpt(p.text,ph?260:620);
    const more=(p.photos||[]).filter(x=>x.src).slice(1,4);
    const hero=(p.photos||[]).some(x=>x.portraitHero)?'<span class="ms-hero" title="Здесь портрет героя книги">★</span>':'';
    return `<div class="ms-paper">${hero}<div class="ch">${head}</div><div class="ep">${title}</div>${ph?`<img src="${esc(ph.src)}" alt="" loading="lazy">`:''}${more.length?`<div class="ms-thumbs">${more.map(x=>`<img src="${esc(x.src)}" alt="" loading="lazy">`).join('')}${(p.photos||[]).length>4?`<span>+${(p.photos||[]).length-4}</span>`:''}</div>`:''}${text?`<p>${esc(excerpt(p.text,more.length?150:(ph?260:620)))}</p>`:''}<div class="no">${n}</div></div>`;}
  let pendingNewChapter=false;
  const colsFor=W=>Math.max(4,Math.min(7,Math.floor((W-520)/215)));
  // Every group (the beginning, each chapter, the appendices) is laid out
  // in rows; all the rows of the book make one corridor the wheel travels.
  function build(){
    try{builtSig=JSON.stringify(state)+'|'+activeUid;}catch(err){builtSig='';}
    groups=makeGroups();if(!groups.length)return;
    // Where every sheet stood before: after the rebuild each one glides from
    // there to its new place (nothing jumps when a sheet goes to the bin).
    const before=new Map([...world.querySelectorAll('.ms-sheet[data-uid]')].map(el=>[el.dataset.uid,{t:el.style.transform,o:el.style.opacity,f:el.style.filter}]));
    world.innerHTML='';els=[];toc.innerHTML='';groupRow0=[];groupRows=[];
    const cols=colsFor(innerWidth);let k=0;
    groups.forEach((g,c)=>{
      const list=g.chapter?[...g.sheets,null,'episode']:g.sheets,slots=list.length-(g.chapter?1:0),rows=Math.max(1,Math.ceil(slots/cols));
      groupRow0[c]=k;groupRows[c]=rows;
      const lab=document.createElement('div');lab.className='ms-label';lab.dataset.c=c;lab.innerHTML=g.chapter&&g.sub?`<b>${esc(g.sub)}</b><small>${g.count} ${plural(g.count)}</small><em>${esc(g.title)}</em>`:`<b>${esc(g.title)}</b><small>${esc(g.sub)}${g.sub?' · ':''}${g.count} ${plural(g.count)}</small>`;
      lab.addEventListener('click',()=>{if(c!==currentGroup())go(c);});world.appendChild(lab);els.push(lab);
      list.forEach((sh,i)=>{const el=document.createElement('div');el.className='ms-sheet';el.dataset.c=c;el.dataset.i=i;
        // «＋ Эпизод» stands beside «＋ Лист» in the same row (one row may hold one extra).
        const ep=sh==='episode',slot=ep?i-1:i,row=Math.floor(slot/cols),last=row===rows-1;
        el.dataset.k=k+row;el.dataset.col=(slot%cols)+(ep?1:0);
        el.dataset.inrow=(last?slots-cols*(rows-1):cols)+(last&&g.chapter?1:0);
        // Tilt and float belong to the sheet itself (its uid), not to its place:
        // a sheet moved to another place keeps its angle and its rhythm.
        const real=sh&&sh.p?sh:null;const hs=[...String(real?real.p.uid:'new'+c+String(sh))].reduce((h,ch)=>(h*31+ch.charCodeAt(0))>>>0,7),ha=hs%997,hb=(hs>>>10)%991;
        const fd=7+rnd(ha,1)*2;el.style.setProperty('--fd',fd.toFixed(2)+'s');el.style.setProperty('--fdl',(-(((performance.now()/1000)+rnd(1,hb)*6)%(fd*2))).toFixed(2)+'s');el.style.setProperty('--rz',real?((rnd(ha*7,hb)-.5)*7).toFixed(1)+'deg':'0deg');el.dataset.ja=real?rnd(ha,3).toFixed(3):'.5';el.dataset.jb=real?rnd(5,hb).toFixed(3):'.5';
        if(!real){const kind=sh==='episode'?'episode':'page';el.classList.add('is-new');if(kind==='episode')el.classList.add('is-new-episode');
          el.innerHTML=kind==='episode'?'<div class="ms-float"><div class="ms-paper"><span>＋ Эпизод<small>новая история внутри главы</small></span></div></div>':'<div class="ms-float"><div class="ms-paper"><span>＋ Лист</span></div></div>';
          el.addEventListener('click',e=>{if(+el.dataset.k!==Math.round(focus)){goRow(+el.dataset.k);return;}
            if(kind==='episode'){send({action:'addEpisode',atEnd:true,sectionId:g.chapter.id});}
            else send({action:'addPageAt',sectionId:g.chapter.id});
            // v142: the new sheet lies down beside the others, right here; a press on it opens it
            el.classList.add('is-adding-new');setTimeout(()=>el.classList.remove('is-adding-new'),900);
            window.OCHERKI_SAY?.(kind==='episode'?'Новый эпизод лёг в главу — нажмите на него, чтобы писать':'Новый лист лёг в главу — нажмите на него, чтобы писать');});}
        else if(sh.ghost){el.classList.add('is-ghost');el.dataset.sec=sh.s.id;
          el.innerHTML=`<div class="ms-float"><div class="ms-paper"><span class="gh-t">＋<br>${esc(String(sh.s.title||'').toLowerCase())}<small>добавить в книгу</small></span></div></div>`;
          el.addEventListener('click',e=>{if(+el.dataset.k!==Math.round(focus)){goRow(+el.dataset.k);return;}e.stopPropagation();el.classList.add('is-adding');send({action:'includeSection',sectionId:sh.s.id});window.OCHERKI_SAY?.(`Раздел «${String(sh.s.title||'').trim()||'без названия'}» теперь в книге`);});}
        else{const own=(sh.p.userEdited||!(sh.p.sample||sh.s.sample))&&String(sh.p.text||'').trim();if(!own&&!(sh.p.photos||[]).length&&sh.s.type==='chapter')el.classList.add('is-empty');if(sh.s.auto)el.classList.add('is-auto');if(bookUid?sh.p.uid===bookUid:(sh.p.active||sh.p.uid===activeUid))el.classList.add('is-active');
          el.dataset.uid=sh.p.uid;el.innerHTML=`<div class="ms-float">${card(sh,i+1)}</div>`;el.addEventListener('pointerdown',e=>startDrag(e,el,sh,g,c));
          // A section of the beginning or the end leaves the book with ×; it stays here as a clear sheet.
          if(!g.chapter&&sh.i===0&&!['cover','title','chapter'].includes(sh.s.type)){const x=document.createElement('span');x.className='ms-sec-x';x.title='Убрать раздел из книги';x.textContent='×';el.querySelector('.ms-float').appendChild(x);
            x.addEventListener('pointerdown',e=>e.stopPropagation());
            x.addEventListener('click',e=>{e.stopPropagation();if(!x.classList.contains('is-ask')){x.classList.add('is-ask');x.textContent='убрать из книги?';clearTimeout(x._t);x._t=setTimeout(()=>{x.classList.remove('is-ask');x.textContent='×';},3200);return;}send({action:'excludeSection',sectionId:sh.s.id});const sid=sh.s.id;window.OCHERKI_SAY?.(`Раздел «${String(sh.s.title||'').trim()||'без названия'}» убран из книги`,'вернуть',()=>send({action:'includeSection',sectionId:sid}));});}}
        world.appendChild(el);els.push(el);});
      k+=rows;
      const b=document.createElement('button');b.type='button';b.dataset.c=c;b.innerHTML=`${esc(g.chapter?(g.sub+'. '+g.title):g.title)}<i></i>`;b.onclick=()=>go(c);toc.appendChild(b);
      // A chapter is deleted from the contents: × then «удалить?» — it goes to the bin with all its sheets.
      if(g.chapter){const x=document.createElement('span');x.className='ms-toc-del';x.title='Удалить главу';x.textContent='×';b.prepend(x);
        x.addEventListener('click',e=>{e.stopPropagation();if(!x.classList.contains('is-ask')){x.classList.add('is-ask');x.textContent='удалить главу?';clearTimeout(x._t);x._t=setTimeout(()=>{x.classList.remove('is-ask');x.textContent='×';},3500);return;}
          send({action:'deleteSection',sectionId:g.chapter.id});window.postMessage({type:'OCHERKI_MANUSCRIPT_NOTE',text:`Глава «${g.title}» в корзине — её можно вернуть`},'*');});}});
    rowsTotal=k;
    const add=document.createElement('button');add.type='button';add.className='add';add.textContent='＋ Новая глава';add.onclick=()=>{/* v142: first glide to the last chapter, then the new one is laid after it */const last=groups.map(g=>!!g.chapter).lastIndexOf(true);const far=last>=0&&Math.round(focus)!==groupRow0[last];if(far)go(last);setTimeout(()=>{send({action:'addChapter'});pendingNewChapter=true;},far?1000:0);};toc.appendChild(add);
    drawSections();
    if(pendingNewChapter){pendingNewChapter=false;const last=groups.map(g=>!!g.chapter).lastIndexOf(true);if(last>=0)focus=groupRow0[last];}
    focus=Math.max(0,Math.min(rowsTotal-1,focus));
    if(before.size&&isOpen){let moved=false;world.querySelectorAll('.ms-sheet[data-uid]').forEach(el=>{const b=before.get(el.dataset.uid);if(!b||!b.t)return;el.style.transition='none';el.style.transform=b.t;el.style.opacity=b.o;el.style.filter=b.f;moved=true;});
      if(moved){void world.offsetWidth;world.querySelectorAll('.ms-sheet[data-uid]').forEach(el=>{el.style.transition='';});}}
    // v98: what is new here (titles, «＋ Лист», «＋ Эпизод», a new sheet) stands
    // in its place at once — it used to slide in from the middle of the room.
    const fresh=[...world.querySelectorAll('.ms-sheet,.ms-label')].filter(el=>!(el.dataset.uid&&before.get(el.dataset.uid)?.t));
    fresh.forEach(el=>{el.style.transition='none';});
    if(before.size&&isOpen)fresh.forEach(el=>{if(el.dataset.uid){el.classList.add('is-born');setTimeout(()=>el.classList.remove('is-born'),1200);}});
    layout();
    if(fresh.length){void world.offsetWidth;fresh.forEach(el=>{el.style.transition='';});}}
  const groupOfRow=k=>{let c=0;groupRow0.forEach((k0,i)=>{if(k>=k0)c=i;});return c;};
  const currentGroup=()=>groupOfRow(Math.round(focus));

  // ——— «Разделы книги»: every section of the book that is not a chapter.
  // The director puts most of them in by itself; the author may add or take
  // away the optional ones. The ones a printed book always has are locked.
  const LOCKED=new Set(['cover','endpaper','title','contents','back-endpaper','inside-back-cover','back-cover','colophon']);
  const ABOUT={dedication:'несколько слов тем, кому посвящена книга',epigraph:'строка, с которой книга начинается',intro:'о чём эта книга и почему она написана',author:'слово от того, кто собрал книгу',
    'family-tree':'кто кому кем приходится',timeline:'главные даты и места жизни',voices:'короткие слова родных о герое',recipes:'семейные блюда с фото',interview:'вопросы и ответы',
    final:'страница для тех, кто продолжит историю',afterword:'несколько слов в конце книги',thanks:'тем, кто помог собрать книгу',sources:'откуда фото, письма и документы',
    cover:'лицо книги',endpaper:'узорная страница за обложкой',title:'название, подзаголовок, автор',contents:'оглавление — собирается само',colophon:'выходные данные',
    'back-endpaper':'узорная страница перед задней обложкой','inside-back-cover':'оборот задней обложки','back-cover':'задняя сторона книги'};
  const ICON=id=>({'family-tree':'<circle cx="12" cy="5" r="2.2"/><circle cx="6" cy="17" r="2.2"/><circle cx="18" cy="17" r="2.2"/><path d="M12 7.5v4M6 14.5V12h12v2.5"/>',
    timeline:'<path d="M3 12h18"/><circle cx="7" cy="12" r="1.8"/><circle cx="13" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/>',
    recipes:'<path d="M5 11h14a7 7 0 0 1-14 0Z"/><path d="M9 7c0-1.5 1-2 1-3M13 7c0-1.5 1-2 1-3"/>',voices:'<path d="M4 5h16v10H9l-5 4Z"/>',
    interview:'<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.5-3.5 4-5 7-5s5.5 1.5 7 5"/>'}[id]||'<path d="M6 3h9l3 3v15H6Z"/><path d="M9 10h6M9 14h6"/>');
  function drawSections(){
    const secs=(state?.sections||[]);const firstCh=secs.findIndex(s=>s.type==='chapter'),lastCh=secs.map(s=>s.type).lastIndexOf('chapter');
    // One strip of small sheets in the order of the book: the cover, the
    // pages before the chapters, the chapters as one stack, the pages after.
    // Solid = in the book, dashed «+» = can be added. A press picks a sheet
    // (it lifts and its line shows below); a second press finds it in the
    // manuscript; × takes it out of the book.
    const THUMB={dedication:'<i class="l s"></i><i class="l"></i><i class="l s"></i>',epigraph:'<b>« . . . »</b><i class="l s"></i>',timeline:'<span class="tl"><i></i><i></i><i></i></span>',
      'family-tree':'<svg viewBox="0 0 40 30"><rect x="15" y="2" width="10" height="6"/><rect x="3" y="20" width="10" height="6"/><rect x="27" y="20" width="10" height="6"/><path d="M20 8v6M8 20v-6h24v6"/></svg>'};
    const thumb=s=>s.id==='cover'?`<em>${esc(String(state?.title||state?.bookTitle||'Очерки жизни'))}</em><i class="l s"></i>`:(THUMB[s.id]||'<i class="l"></i><i class="l"></i><i class="l s"></i><i class="l"></i>');
    const item=s=>{const on=s.included!==false,locked=LOCKED.has(s.id);
      return `<div class="ms-sec${on?' is-on':' is-off'}${s.id===secPick?' is-picked':''}" data-sec="${esc(s.id)}"${on?'':` data-include="${esc(s.id)}"`}><span class="ms-sec-leaf">${on?thumb(s):'+'}</span><b>${esc(s.title)}</b>${on&&!locked?`<button type="button" class="ms-sec-x" data-exclude="${esc(s.id)}" aria-label="Убрать из книги" title="Убрать из книги">×</button>`:''}</div>`;};
    const chapters=secs.filter(s=>s.type==='chapter'),before=secs.slice(0,Math.max(0,firstCh)).filter(s=>s.type!=='chapter'&&(s.id==='cover'||!LOCKED.has(s.id))),after=secs.slice(lastCh+1).filter(s=>s.type!=='chapter'&&!LOCKED.has(s.id));
    const stack=chapters.length?`<div class="ms-sec is-on is-chapters${secPick==='__chapters'?' is-picked':''}" data-sec="__chapters"><span class="ms-sec-leaf"><i class="l"></i><i class="l"></i><i class="l s"></i></span><b>Главы${chapters.length>1?' 1–'+chapters.length:' 1'}</b></div>`:'';
    const all=[...before,...after],picked=all.find(s=>s.id===secPick);
    const line=secPick==='__chapters'?'Ваши главы — их пишете вы':picked?(ABOUT[picked.id]||'')+(picked.included===false?' · нажмите, чтобы добавить':' · нажмите ещё раз, чтобы найти в рукописи'):'Нажмите на лист — увидите, что это';
    secPanel.innerHTML=`<button type="button" class="ms-sec-close" aria-label="Закрыть">×</button><div class="ms-sec-title"><span>Разделы книги</span></div><div class="ms-sec-sub">Что ещё будет в книге</div>`
      +`<div class="ms-sec-strip">${before.map(item).join('')}${stack}${after.map(item).join('')}</div><div class="ms-sec-line">${esc(line)}</div>`;}
  const veil=scr.querySelector('.ms-sec-veil');
  const setSections=on=>{secPanel.hidden=!on;veil.hidden=!on;scr.classList.toggle('is-sections',on);};
  window.OCHERKI_MS_SECTIONS=()=>setSections(secPanel.hidden);
  veil.addEventListener('click',()=>setSections(false));
  secPanel.addEventListener('click',e=>{e.stopPropagation();
    if(e.target.closest('.ms-sec-close')){setSections(false);return;}
    const exc0=e.target.closest('[data-exclude]');const tile=e.target.closest('.ms-sec');
    if(tile&&!exc0){const id=tile.dataset.sec;
      if(id==='__chapters'){if(secPick===id){setSections(false);const c=groups.findIndex(g=>g.chapter);if(c>=0)go(c);return;}secPick=id;drawSections();return;}
      if(secPick!==id){secPick=id;
        // A pick moves only the light and the line below — the window is not redrawn, so nothing jumps.
        secPanel.querySelectorAll('.ms-sec').forEach(t=>t.classList.toggle('is-picked',t.dataset.sec===id));
        const line=secPanel.querySelector('.ms-sec-line'),sec=(state?.sections||[]).find(x=>x.id===id);
        const text=id==='__chapters'?'Ваши главы — их пишете вы':sec?(ABOUT[id]||'')+(tile.dataset.include?' · добавлено в книгу':' · нажмите ещё раз, чтобы найти в рукописи'):'';
        if(line){line.style.opacity=0;setTimeout(()=>{line.textContent=text;line.style.opacity=1;},220);}
        if(tile.dataset.include)send({action:'includeSection',sectionId:id});return;}}
    const inc=e.target.closest('[data-include]'),exc=e.target.closest('[data-exclude]');
    if(inc){send({action:'includeSection',sectionId:inc.dataset.include});return;}
    if(exc){send({action:'excludeSection',sectionId:exc.dataset.exclude});return;}
    const sec=e.target.closest('.ms-sec.is-on');if(sec&&e.target.closest('button'))return;if(sec){const c=groups.findIndex(g=>g.sheets.some(x=>x.s.id===sec.dataset.sec));if(c>=0){const i=groups[c].sheets.findIndex(x=>x.s.id===sec.dataset.sec);setSections(false);goRow(groupRow0[c]+Math.floor(i/colsFor(innerWidth)));
      const uid=groups[c].sheets[i].p.uid;world.querySelectorAll('.is-target').forEach(x=>x.classList.remove('is-target'));world.querySelector(`.ms-sheet[data-uid="${uid}"]`)?.classList.add('is-target');
      // The little sheet flies from the strip down to its place in the manuscript.
      const from=sec.querySelector('.ms-sec-leaf')?.getBoundingClientRect();
      if(from)setTimeout(()=>{const t=world.querySelector(`.ms-sheet[data-uid="${uid}"] .ms-paper`);if(!t)return;const html=t.outerHTML,to=t.getBoundingClientRect();t.style.opacity='0';
        const f=flyer(from,to,html,fl=>{t.style.opacity='';fl.style.opacity=0;setTimeout(()=>fl.remove(),400);});},120);}}});
  scr.addEventListener('pointerdown',e=>{if(!e.target.closest('.ms-sections,.ms-sec-veil'))setTimeout(()=>world.querySelectorAll('.is-target').forEach(x=>x.classList.remove('is-target')),1200);});

  // ——— Layout: the corridor. The row at the wheel's position is in front,
  // bright; the next two rows of the same chapter wait behind it, higher,
  // fainter and hazy. Other chapters show only their names far away. A row
  // that has been passed sinks down towards the viewer and fades.
  function layout(){
    const W=innerWidth,H=innerHeight,cols=colsFor(W),span=Math.min(290,(W-520)/cols),cg=currentGroup();
    els.forEach(el=>{if(el.classList.contains('ms-label'))return;if(drag&&drag.moved&&el===drag.el)return;const c=+el.dataset.c,k=+el.dataset.k,d=k-focus,col=+el.dataset.col,inRow=+el.dataset.inrow;
      let x=(col-(inRow-1)/2)*span+((+el.dataset.ja||.5)-.5)*24;const y=60+((+el.dataset.jb||.5)-.5)*36+Math.abs(col-(inRow-1)/2)*8;
      el.dataset.x0=x;if(gap&&gap.c===c&&gap.k===k)x+=(x>gap.x?1:-1)*span*.42;
      el.classList.toggle('is-far',d>.5);
      if(c!==cg&&d>-.5){el.style.transform=`translate3d(${x}px,${y-1.4*170}px,${-1600}px)`;el.style.opacity=0;el.style.filter='blur(0px)';el.style.pointerEvents='none';return;}
      if(d<-.5){el.style.transform=`translate3d(${x*1.12}px,${y+(-d)*700}px,${(-d)*380}px)`;el.style.opacity=0;el.style.filter='blur(0px)';el.style.pointerEvents='none';return;}
      const dd=Math.max(0,d),op=dd<=2?[1,.3,.12][Math.round(dd)]-(dd-Math.round(dd))*.2:Math.max(0,.12-(dd-2)*.3);/* v142: the rows behind stay faint, the front reads clearly */
      el.style.transform=`translate3d(${x}px,${y-dd*150}px,${-dd*480+(rnd(c+3,+el.dataset.i)-.5)*30}px) rotateY(${(col-(inRow-1)/2)*-4}deg)`;
      el.style.opacity=Math.max(0,op);el.style.filter=dd>.3?`blur(${Math.min(5,dd*1.7)}px)`:'blur(0px)';el.style.pointerEvents=dd<2.5?'auto':'none';});
    let order=0;
    els.forEach(el=>{if(!el.classList.contains('ms-label'))return;const c=+el.dataset.c;
      if(c===cg){el.classList.remove('is-far-title');el.style.transform='translate3d(-50%,-372px,0px)';el.style.opacity=1;el.style.filter='none';el.style.pointerEvents='none';return;}
      if(c<cg){el.classList.remove('is-far-title');el.style.transform=`translate3d(calc(-50% + ${Math.round(400*110/1400)}px),500px,400px)`;el.style.opacity=0;el.style.pointerEvents='none';return;}
      order++;el.classList.add('is-far-title');
      const behind=groupRow0[cg]+groupRows[cg]-1-Math.round(focus),quiet=behind>0?.4:1;
      {const z=-1500-(order-1)*900;/* far names stand exactly under the near one: the depth would pull them towards the centre */el.style.transform=`translate3d(calc(-50% + ${Math.round(z*110/1400)}px),${-380-order*30}px,${z}px)`;}el.style.opacity=(order===1?.12:0)*quiet;el.style.filter=`blur(${order===1?.6:1.6}px)`;el.style.pointerEvents=order<=2?'auto':'none';});
    [...toc.querySelectorAll('button[data-c]')].forEach(b=>b.classList.toggle('on',+b.dataset.c===cg));}
  function goRow(k){focus=Math.max(0,Math.min(rowsTotal-1,k));layout();}
  function go(c){if(groupRow0[c]==null)return;goRow(groupRow0[c]);}
  // One turn of the wheel = one step. A mouse notch (and a touchpad swipe)
  // sends a burst of events; only the first one of a burst moves, a long
  // steady scroll moves on calmly one step at a time.
  // One gesture = one row: a notch of a mouse, or a whole swipe of a
  // touchpad with its momentum. A new gesture starts after a short pause.
  const msWheel=window.__ocherkiWheel();
  scr.addEventListener('wheel',e=>{if(e.target.closest('.ms-toc,.ms-bin-list,.ms-sections,.ms-photo-card'))return;
    const dir=msWheel(e);if(!dir)return;const k=Math.round(focus)+dir;
    // v99: at the first or the last row nothing moves at all.
    if(k<0||k>rowsTotal-1)return;goRow(k);},{passive:true});
  // At the first or the last row the sheets lean a little and come back: the end.
  function bump(dir){world.animate([{translate:'0 0'},{translate:`0 ${-dir*26}px`},{translate:'0 0'}],{duration:520,easing:'cubic-bezier(.3,.7,.3,1)'});}
  addEventListener('keydown',e=>{if(!isOpen||secPanel.contains(document.activeElement))return;if(e.key==='ArrowDown'||e.key==='PageDown')goRow(focus+1);if(e.key==='ArrowUp'||e.key==='PageUp')goRow(focus-1);});

  // ——— Press = open the sheet (a sheet of a chapter behind brings the whole
  // chapter forward first); drag = move it, to another chapter, or to the bin.
  let drag=null;
  // The browser's own picture-dragging would cancel the move of a sheet
  // that has a photo on it.
  scr.addEventListener('dragstart',e=>e.preventDefault());
  function startDrag(e,el,sh,g,c){if(e.button!==0)return;e.preventDefault();
    if(+el.dataset.k!==Math.round(focus)){e.preventDefault();goRow(+el.dataset.k);return;}
    drag={el,sh,g,sx:e.clientX,sy:e.clientY,base:el.style.transform,moved:false};el.setPointerCapture?.(e.pointerId);}
  const overBin=(x,y)=>{const r=bin.getBoundingClientRect();return x>r.left-50&&x<r.right+40&&y>r.top-60&&y<r.bottom+20;};
  addEventListener('pointermove',e=>{if(!drag)return;const dx=e.clientX-drag.sx,dy=e.clientY-drag.sy;if(!drag.moved&&Math.hypot(dx,dy)<7)return;drag.moved=true;drag.el.classList.add('is-dragging');
    drag.el.style.transform=`translate(${dx}px,${dy}px) `+drag.base+' translateZ(120px)';
    const over=document.elementsFromPoint(e.clientX,e.clientY).map(n=>n.closest&&n.closest('.ms-toc button[data-c],.ms-label.is-far-title')).find(Boolean);toc.querySelectorAll('button').forEach(b=>b.classList.toggle('drop',b===over));world.querySelectorAll('.ms-label').forEach(b=>b.classList.toggle('drop',b===over));
    scr.classList.add('is-sheet-dragging');bin.classList.toggle('is-over',overBin(e.clientX,e.clientY));
    // Where it would land: the sheets of the row part to make room.
    const wr=world.getBoundingClientRect(),gx=e.clientX-wr.left;const k=Math.round(focus);
    const nextGap=(!over&&!bin.classList.contains('is-over')&&+drag.el.dataset.c===currentGroup())?{c:+drag.el.dataset.c,k,x:gx}:null;
    if(JSON.stringify(nextGap&&{c:nextGap.c,k:nextGap.k,s:Math.round(nextGap.x/40)})!==JSON.stringify(gap&&{c:gap.c,k:gap.k,s:Math.round(gap.x/40)})){gap=nextGap;layout();}else gap=nextGap;},true);
  // Heard first (capture): other parts of the page stop this event on its way.
  addEventListener('pointerup',e=>{if(!drag)return;const {el,sh,g,moved}=drag;drag=null;el.classList.remove('is-dragging');toc.querySelectorAll('button').forEach(b=>b.classList.remove('drop'));
    const toBin=bin.classList.contains('is-over');scr.classList.remove('is-sheet-dragging');bin.classList.remove('is-over');if(!moved||toBin)gap=null;
    if(!moved){openSheet(el,sh);return;}
    if(toBin){const r=bin.getBoundingClientRect(),s=el.getBoundingClientRect();el.classList.add('is-binned');el.style.transform=`translate(${r.left+r.width/2-(s.left+s.width/2)}px,${r.top+20-(s.top+s.height/2)}px) `+el.style.transform.replace(/^translate\([^)]*\)\s*/,'')+' scale(.12)';
      setTimeout(()=>send({action:'deletePage',sectionId:sh.s.id,pageUid:sh.p.uid}),520);return;}
    world.querySelectorAll('.ms-label').forEach(b=>b.classList.remove('drop'));
    const target=document.elementsFromPoint(e.clientX,e.clientY).map(n=>n.closest&&n.closest('.ms-toc button[data-c],.ms-label.is-far-title')).find(Boolean);
    if(target){const tg=groups[+target.dataset.c];if(tg&&tg.chapter&&g.chapter&&tg.chapter.id!==g.chapter.id){send({action:'movePage',sectionId:sh.s.id,pageUid:sh.p.uid,toSectionId:tg.chapter.id});return;}layout();return;}
    if(!g.chapter){gap=null;layout();return;}
    if(gap){const c=+el.dataset.c,row=[...world.querySelectorAll(`.ms-sheet[data-c="${c}"][data-k="${gap.k}"]:not(.is-new)`)].filter(x=>x!==el);
      const before=row.filter(x=>+x.dataset.x0<gap.x).length,cols=colsFor(innerWidth),rowStart=(gap.k-groupRow0[c])*cols;
      const order=g.sheets.map(x=>x.p.uid),ids=order.filter(id=>id!==sh.p.uid);ids.splice(Math.min(ids.length,rowStart+before),0,sh.p.uid);
      gap=null;
      if(ids.join()===order.join()){layout();return;}
      // The new order at once: every sheet glides to its new place, the one
      // carried lands in the gap; the book takes the order meanwhile.
      const byUid=new Map([...world.querySelectorAll(`.ms-sheet[data-c="${c}"]`)].filter(x=>x.dataset.uid).map(x=>[x.dataset.uid,x]));
      const total=ids.length+(g.chapter?1:0),rows=Math.max(1,Math.ceil(total/cols)),k0=groupRow0[c];
      const setPos=(x,i)=>{x.dataset.i=i;x.dataset.k=k0+Math.floor(i/cols);x.dataset.col=i%cols;x.dataset.inrow=Math.floor(i/cols)<rows-1?cols:total-cols*(rows-1);};
      ids.forEach((uid,i)=>{const x=byUid.get(uid);if(x)setPos(x,i);});
      const ghost=world.querySelector(`.ms-sheet.is-new[data-c="${c}"]`);if(ghost)setPos(ghost,ids.length);
      g.sheets=ids.map(uid=>g.sheets.find(x=>x.p.uid===uid)).filter(Boolean);
      holdUntil=Date.now()+900;layout();
      send({action:'reorderPages',sectionId:sh.s.id,ids});return;}
    const others=[...world.querySelectorAll(`.ms-sheet[data-c="${el.dataset.c}"]:not(.is-new)`)].filter(x=>x!==el&&x.style.pointerEvents!=='none');
    // the new place: the sheet nearest to where it was dropped
    const order=g.sheets.map(x=>x.p.uid);let best=-1,bd=1e9;others.forEach((x,k)=>{const r=x.getBoundingClientRect(),dd=Math.hypot(r.left+r.width/2-e.clientX,r.top+r.height/2-e.clientY);if(dd<bd){bd=dd;best=k;}});
    let to=0;if(best>=0){const near=others[best],r=near.getBoundingClientRect(),nearUid=g.sheets[+near.dataset.i]?.p.uid;const ids0=order.filter(id=>id!==sh.p.uid);to=ids0.indexOf(nearUid)+(e.clientX>r.left+r.width/2?1:0);}
    const ids=order.filter(id=>id!==sh.p.uid);ids.splice(Math.max(0,to),0,sh.p.uid);
    if(ids.join()!==g.sheets.map(x=>x.p.uid).join())send({action:'reorderPages',sectionId:sh.s.id,ids});else layout();},true);
  // A paper that flies between a sheet of the manuscript and the editor.
  function flyer(fromRect,toRect,html,done){
    const f=document.createElement('div');f.className='ms-flyer';f.innerHTML=html||'<div class="ms-paper"></div>';
    const paper=f.firstElementChild;const fit=r=>{f.style.left=r.left+'px';f.style.top=r.top+'px';f.style.width=r.width+'px';f.style.height=r.height+'px';if(paper){paper.style.transform=`scale(${r.width/250},${r.height/354})`;paper.style.width='250px';paper.style.height='354px';paper.style.transition='transform .9s cubic-bezier(.3,.7,.2,1)';}};
    fit(fromRect);document.body.appendChild(f);void f.offsetWidth;requestAnimationFrame(()=>{fit(toRect);});
    setTimeout(()=>{done?.(f);},920);return f;}
  const editorRect=()=>{const r=document.querySelector('.editor-paper')?.getBoundingClientRect();return r&&r.width>100?r:{left:innerWidth/2-300,top:110,width:600,height:840};};
  function openSheet(el,sh){
    send({action:'select',sectionId:sh.s.id,pageUid:sh.p.uid});activeUid=sh.p.uid;
    const from=el.querySelector('.ms-paper').getBoundingClientRect();
    el.classList.add('is-picked');scr.classList.add('is-opening');el.style.opacity=0;
    // The sheet grows into the editor; half way the manuscript starts to
    // fade, so the editor comes up under it as it lands.
    // The sheet grows as clean paper (its small words fade at once, so no
    // giant letters), lands on the editor's sheet, and only then the
    // manuscript gives way — one sheet, not two.
    const fl=flyer(from,editorRect(),el.querySelector('.ms-paper').outerHTML,f=>{window.__msFlying=true;window.OCHERKI_SET_MODE?.('write');setTimeout(()=>{f.style.opacity=0;setTimeout(()=>f.remove(),480);},260);});
    requestAnimationFrame(()=>fl.querySelectorAll('.ms-paper > *').forEach(n=>{n.style.transition='opacity .28s ease';n.style.opacity='0';}));}
  // ——— Arriving: the sheet that was open in «Писать» starts large in front
  // and flies back to its place; the others come out of the depth.
  // The short hint is shown on the first three visits only, then fades.
  function hintOnce(){const h=scr.querySelector('.ms-hint');if(!h)return;let n=0;try{n=+localStorage.getItem('ocherki_ms_hint')||0;localStorage.setItem('ocherki_ms_hint',String(n+1));}catch(e){}
    h.classList.toggle('is-shown',n<3);clearTimeout(hintOnce.t);if(n<3)hintOnce.t=setTimeout(()=>h.classList.remove('is-shown'),7000);}
  function open(opts){if(isOpen)return;isOpen=true;holdUntil=Date.now()+1400;hintOnce();clearTimeout(closeTimer);const quiet=!!opts?.fromBook;bookUid=opts?.uid||'';scr.classList.remove('is-opening');world.querySelectorAll('.ms-sheet.is-picked').forEach(el=>el.classList.remove('is-picked'));
    scr.classList.toggle('is-night',shell.classList.contains('is-night'));
    const ref=document.querySelector('.bd-rail-key')||shell;['--metal1','--metal2','--metal3','--metal4','--face1','--face2','--face3','--face4','--ink'].forEach(v=>{const val=getComputedStyle(ref).getPropertyValue(v);if(val)scr.style.setProperty(v,val);});
    try{localStorage.setItem('ocherki_ms_seen','1');}catch(e){}
    try{frame()?.contentWindow?.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',action:'requestState'},'*');}catch(e){}
    build();const active=(bookUid&&world.querySelector(`.ms-sheet[data-uid="${bookUid}"]`))||(activeUid&&world.querySelector(`.ms-sheet[data-uid="${activeUid}"]`))||world.querySelector('.ms-sheet.is-active');if(active)focus=+active.dataset.k;
    let landing=null;
    // From the book the open page shrinks into its sheet; from the editor the sheet itself.
    if(active&&(!quiet||opts?.fromRect)){active.style.transition='none';layout();active.style.transition='none';const to=active.querySelector('.ms-paper').getBoundingClientRect();
      // The sheet itself grows out of the page it came from and settles in its
      // place: no stand-in to swap at the end, so nothing turns or shifts after.
      landing=()=>{const paper=active.querySelector('.ms-paper'),fr=opts?.fromRect||editorRect();if(!paper||!fr)return;
        const rz=parseFloat(active.style.getPropertyValue('--rz'))||0,th=rz*Math.PI/180,c=Math.cos(th),sn=Math.sin(th);
        const w=paper.offsetWidth||250,h=paper.offsetHeight||354,k=to.width/(w*c+h*Math.abs(sn))||1;
        const sx=fr.width/(w*k),sy=fr.height/(h*k),X=(fr.left+fr.width/2-(to.left+to.width/2))/k,Y=(fr.top+fr.height/2-(to.top+to.height/2))/k;
        const lx=X*c+Y*sn,ly=-X*sn+Y*c;
        const kids=[...paper.children];kids.forEach(n=>{n.style.transition='none';n.style.opacity='0';});
        paper.style.setProperty('transition','none','important');paper.style.setProperty('transform',`translate(${lx.toFixed(1)}px,${ly.toFixed(1)}px) rotate(${-rz}deg) scale(${sx.toFixed(3)},${sy.toFixed(3)})`,'important');
        active.style.opacity='1';active.classList.add('is-landing');void paper.offsetWidth;
        requestAnimationFrame(()=>{paper.style.setProperty('transition','transform .95s cubic-bezier(.3,.7,.2,1), box-shadow .5s','important');paper.style.setProperty('transform','none','important');});
        setTimeout(()=>kids.forEach(n=>{n.style.transition='opacity .4s ease';n.style.opacity='';}),560);
        setTimeout(()=>{paper.style.removeProperty('transition');paper.style.removeProperty('transform');active.style.transition='';kids.forEach(n=>n.style.transition='');active.classList.remove('is-landing');},1050);};}
    // v98: everything is laid out at once where it stands (no flight from far
    // away, no rows sliding down) and only fades in; the one sheet lands.
    world.querySelectorAll('.ms-sheet,.ms-label').forEach(el=>{el.style.transition='none';});
    layout();
    // Each keeps the opacity its row gives it (rows already passed stay hidden).
    world.querySelectorAll('.ms-sheet,.ms-label').forEach(el=>{if(el===active&&(!quiet||opts?.fromRect))return;el.dataset.op=el.style.opacity;el.style.opacity='0';});
    void world.offsetWidth;
    world.querySelectorAll('.ms-sheet,.ms-label').forEach((el,k)=>{if(el===active&&(!quiet||opts?.fromRect))return;el.style.transition='opacity .6s ease';el.style.transitionDelay=(180+Math.min(k,12)*25)+'ms';el.style.opacity=el.dataset.op||'';delete el.dataset.op;});
    setTimeout(()=>world.querySelectorAll('.ms-sheet,.ms-label').forEach(el=>{/* v127: the browser writes it as «opacity 0.6s» */if(/^opacity 0\.6s/.test(el.style.transition)){el.style.transition='';el.style.transitionDelay='';}}),1400);
    if(landing){scr.style.transition='opacity .12s ease';setTimeout(()=>{scr.style.transition='';},900);}
    shell.classList.add('is-manuscript');landing?.();requestAnimationFrame(()=>{scr.classList.add('on');setTimeout(()=>world.querySelectorAll('.ms-sheet,.ms-label').forEach(el=>el.style.transitionDelay=''),1700);});}
  function close(o){if(!isOpen)return;isOpen=false;frozen=false;
    // Into the book: the writing keys stay away while the manuscript fades over the open book.
    if(o?.toBook){shell.classList.add('is-ms-to-book');setTimeout(()=>shell.classList.remove('is-ms-to-book'),1400);}bookUid='';scr.classList.remove('on','is-sections');secPanel.hidden=true;shell.classList.remove('is-manuscript');bin.querySelector('.ms-bin-list').hidden=true;closeTimer=setTimeout(()=>{scr.classList.remove('is-opening');world.querySelectorAll('.ms-sheet').forEach(el=>{el.classList.remove('is-picked');el.style.transition='';});},800);}
  // «Писать» from the manuscript opens the chapter that is in front: the
  // open sheet if it belongs to it, otherwise the first sheet of the front row.
  const frontPick=()=>{const cg=currentGroup(),g=groups[cg];if(!g||!g.sheets.length)return null;
    if(g.sheets.some(x=>x.p.uid===activeUid))return null;
    const el=world.querySelector(`.ms-sheet[data-c="${cg}"][data-k="${Math.round(focus)}"]:not(.is-new):not(.is-ghost)`);const sh=el?g.sheets[+el.dataset.i]:g.sheets[0];
    return sh?{sectionId:sh.s.id,pageUid:sh.p.uid}:null;};
  // «Писать» on the switch: the same flight as a press on the sheet.
  const flyToEditor=uid=>{const el=uid&&world.querySelector(`.ms-sheet[data-uid="${uid}"]`);if(!el||el.style.pointerEvents==='none'&&false)return false;
    const c=+el.dataset.c,i=+el.dataset.i,sh=groups[c]?.sheets?.[i];if(!sh)return false;openSheet(el,sh);return true;};
  window.OCHERKI_MANUSCRIPT={open,close,freeze:()=>{frozen=true;clearTimeout(holdTimer);},frontPick,flyToEditor,isOpen:()=>isOpen,activeUid:()=>activeUid,
    sheetOf:el=>{const g=groups[+el?.dataset.c],sh=g?.sheets?.[+el?.dataset.i];if(!sh)return null;
      const title=String(sh.p.episode&&sh.s.type==='chapter'?String(sh.p.episode).replace(/^Эпизод\s+\d+[.:]?\s*/i,''):(sh.p.title||sh.s.title||'')).trim();return {s:sh.s,p:sh.p,title};}};
  addEventListener('resize',()=>{if(isOpen)layout();});
})();
