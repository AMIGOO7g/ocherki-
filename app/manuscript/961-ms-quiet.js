// v170 — «Рукопись», тихий вид: the editor's carriage over the sheets, the chapter's name below them,
// the photos in a narrow ribbon out only on «фото», the chapters on a press on the name; photos from the archive come to the ribbon.
(()=>{const shell=document.querySelector('.shell'),scr=document.querySelector('.ms-screen');if(!shell||!scr)return;
  const S='<svg viewBox="0 0 24 24">',E='</svg>';
  const IC={prev:'<path d="M15 5l-7 7 7 7"/>',next:'<path d="M9 5l7 7-7 7"/>',page:'<path d="M6 3h8l4 4v14H6Z"/><path d="M14 3v4h4M12 11v6M9 14h6"/>',
    photo:'<rect x="3" y="6" width="18" height="13" rx="1.5"/><circle cx="12" cy="12.5" r="3.5"/><path d="M8 6l1.5-2h5L16 6"/>',
    done:'<path d="M7 3h10v18l-5-4-5 4z"/><path d="M9.5 9.5l2 2 3.5-4"/>',bin:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6"/>'};
  const bt=(c,tip,em)=>`<button data-c="${c}" aria-label="${tip}" data-tip="${tip}">${S+IC[c]+E}${em?'<em></em>':''}</button>`;
  const car=document.createElement('div');car.className='wc mq-car';
  car.innerHTML='<i class="nf"></i>'+bt('prev','Предыдущая глава')+bt('next','Следующая глава')+'<span class="grow"></span><span class="t"><b></b></span>'
    +bt('page','Добавить лист')+bt('photo','Фото',1)+bt('done','Отметить открытый лист готовым')+bt('bin','Корзина',1);
  document.body.appendChild(car);
  const name=document.createElement('div');name.className='mq-name';name.innerHTML='<b></b><small></small>';scr.appendChild(name);
  const toc=scr.querySelector('.ms-toc'),bin=scr.querySelector('.ms-bin');
  const B=c=>car.querySelector(`[data-c="${c}"]`);
  const isMs=()=>shell.classList.contains('is-manuscript')&&scr.classList.contains('on');
  const say=t=>window.OCHERKI_SAY?.(t);
  const frame=()=>document.getElementById('v35SheetFrame');
  const send=cmd=>{try{frame()?.contentWindow?.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',...cmd},'*');}catch(e){}};
  const cg=()=>{const b=toc?.querySelector('button.on[data-c]');return b?+b.dataset.c:0;};
  const groupsN=()=>toc?toc.querySelectorAll('button[data-c]').length:0;
  const sheets=c=>[...scr.querySelectorAll(`.ms-sheet[data-c="${c}"]:not(.is-new):not(.is-ghost)`)];
  const M=()=>window.OCHERKI_MANUSCRIPT;
  const info=c=>{const l=scr.querySelector(`.ms-label[data-c="${c}"]`);if(!l)return{t:'',s:'',k:''};const b=l.querySelector('b')?.textContent.trim()||'',em=l.querySelector('em')?.textContent.trim()||'',sm=l.querySelector('small')?.textContent.trim()||'';
    return em?{t:`${b}. ${em}`,s:sm,k:b}:{t:b,s:sm,k:b};};
  const openSheet=()=>{const c=cg(),list=sheets(c),act=list.find(e=>e.classList.contains('is-active'));if(act)return act;const f=M()?.frontPick?.();return(f&&scr.querySelector(`.ms-sheet[data-uid="${f.pageUid}"]`))||list[0]||null;};
  // the carriage and the name follow the chapter in front
  let lastC=-1,lastT='';
  const tick=()=>{const on=isMs();car.classList.toggle('on',on);if(!on){scr.classList.remove('mq-ph','mq-list');B('photo').classList.remove('on');return;}
    car.classList.toggle('night',shell.classList.contains('is-night'));
    const c=cg(),I=info(c),list=sheets(c),done=list.filter(e=>e.classList.contains('is-done')).length;
    car.querySelector('.t b').textContent=`${I.k||I.t} · ${done} из ${list.length} готовы`;
    B('prev').classList.toggle('off',c<=0);B('next').classList.toggle('off',c>=groupsN()-1);
    const ref=list[0]&&M()?.sheetOf?.(list[0]);B('page').classList.toggle('off',!(ref&&ref.s.type==='chapter'));
    const n=scr.querySelectorAll('.ms-print').length;B('photo').querySelector('em').textContent=n?String(n):'';
    const bc=bin?.querySelector('.ms-bin-count');B('bin').querySelector('em').textContent=bc&&!bc.hidden?bc.textContent:'';
    const t=I.t+'|'+I.s;if(c!==lastC||t!==lastT){const first=lastC<0;lastC=c;lastT=t;
      if(first){name.querySelector('b').textContent=I.t;name.querySelector('small').textContent=I.s;}
      else{name.classList.add('swap');setTimeout(()=>{name.querySelector('b').textContent=I.t;name.querySelector('small').textContent=I.s;name.classList.remove('swap');},450);}}
    // the bin's list and its drop stand under the carriage's bin button
    if(bin){const r=B('bin').getBoundingClientRect();bin.style.left=r.left+'px';bin.style.top=r.top+'px';
      B('bin').classList.toggle('bin-over',bin.classList.contains('is-over'));}};
  setInterval(tick,300);
  const goC=c=>{const b=toc?.querySelector(`button[data-c="${c}"]`);if(b)b.click();};
  car.addEventListener('click',e=>{const b=e.target.closest('button[data-c]');if(!b||!isMs())return;e.stopPropagation();const c=b.dataset.c;
    if(b.classList.contains('off')&&c!=='page')return;
    if(c==='prev')goC(cg()-1);
    if(c==='next')goC(cg()+1);
    if(c==='page'){const s=sheets(cg())[0],ref=s&&M()?.sheetOf?.(s);if(!ref||ref.s.type!=='chapter'){say('Новые листы добавляются в главы');return;}
      send({action:'addPageAt',sectionId:ref.s.id});say('Новый лист лёг в главу — нажмите на него, чтобы писать');}
    if(c==='photo'){const on=!scr.classList.contains('mq-ph');scr.classList.toggle('mq-ph',on);b.classList.toggle('on',on);scr.classList.remove('mq-list');
      if(on&&!scr.querySelector('.ms-print'))say('Фото пока нет — добавьте с компьютера или отметьте «В книгу» в архиве');}
    if(c==='done'){const s=openSheet(),k=s?.querySelector('.ms-done-key');if(k){k.click();setTimeout(tick,50);}}
    if(c==='bin'&&bin){bin.click();}});
  // the chapters: a press on the name opens the short list; a choice closes it
  name.addEventListener('click',e=>{e.stopPropagation();scr.classList.toggle('mq-list');});
  toc?.addEventListener('click',e=>{if(e.target.closest('button[data-c]:not(.ms-toc-del)')&&!e.target.closest('.ms-toc-del'))setTimeout(()=>scr.classList.remove('mq-list'),250);});
  scr.addEventListener('pointerdown',e=>{if(!e.target.closest('.ms-toc,.mq-name'))scr.classList.remove('mq-list');});
  // «Разделы книги» (what is in the beginning and the end) moves into the same list
  const secs=()=>{if(!toc||toc.querySelector('.mq-secs'))return;const s=document.createElement('button');s.type='button';s.className='mq-secs';s.textContent='Разделы книги…';
    s.addEventListener('click',e=>{e.stopPropagation();scr.classList.remove('mq-list');window.OCHERKI_MS_SECTIONS?.();});toc.appendChild(s);};
  if(toc)new MutationObserver(secs).observe(toc,{childList:true});secs();
  // the ribbon's prints stand side by side (the stack's overlap is written inline)
  const prints=scr.querySelector('.ms-prints');
  const flat=()=>prints?.querySelectorAll('.ms-print').forEach(el=>{el.style.setProperty('margin-left','0px','important');el.style.setProperty('margin-right','0px','important');});
  if(prints)new MutationObserver(flat).observe(prints,{childList:true,subtree:true});
  // a photo carried out of the ribbon: the ribbon stays, the sheets wait for it
  // the «Рукопись» key glows while photos from the archive wait
  const NK='ocherkiMsNew';
  const glow=()=>{const k=document.querySelector('.oct .k[data-k="manuscript"]');if(!k)return;let n=0;try{n=+localStorage.getItem(NK)||0;}catch(_){}
    if(isMs()&&n){try{localStorage.removeItem(NK);}catch(_){}n=0;}k.classList.toggle('has-new',!!n);};
  setInterval(glow,700);
  // from the archive: the photo lies down in the ribbon at once (its caption, year, place and people come with it)
  // each archive card comes once: once it has been laid on a sheet it does not come back by itself
  const SK='ocherkiArchiveSent',sent=()=>{try{return JSON.parse(localStorage.getItem(SK)||'{}');}catch(_){return{};}},setSent=m=>{try{localStorage.setItem(SK,JSON.stringify(m));}catch(_){}};
  window.OCHERKI_FROM_ARCHIVE=(it,on)=>{if(!it||!it.ak)return Promise.resolve(0);const m=sent();
    if(!on){delete m[it.ak];setSent(m);return Promise.resolve(window.OCHERKI_TRAY_DROP?.(it.ak)||0);}
    if(m[it.ak])return Promise.resolve(0);
    return(window.OCHERKI_TRAY_ADD?window.OCHERKI_TRAY_ADD([it]):Promise.resolve(0)).then(n=>{if(n){const q=sent();q[it.ak]=1;setSent(q);try{localStorage.setItem(NK,'1');}catch(_){}}return n;});};
  window.OCHERKI_OPEN_MANUSCRIPT=()=>{try{window.OcherkiArchive?.close?.();}catch(_){}
    setTimeout(()=>{document.querySelector('.oct .k[data-k="manuscript"]')?.click();setTimeout(()=>{if(!scr.classList.contains('mq-ph'))B('photo').click();},1400);},450);};
})();
