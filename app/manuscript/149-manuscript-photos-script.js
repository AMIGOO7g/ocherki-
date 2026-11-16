/*@block [" id=\"manuscript-photos-script\"", ""]*/
(()=>{const scr=document.querySelector('.ms-screen');if(!scr)return;
  const frame=()=>document.getElementById('v35SheetFrame');
  const send=cmd=>{try{frame()?.contentWindow?.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',...cmd},'*');}catch(e){}};
  const tray=document.createElement('div');tray.className='ms-tray';
  tray.innerHTML='<div class="ms-tray-note" hidden></div><div class="ms-prints"></div><button type="button" class="ms-add-photos">＋ Фото</button><button type="button" class="ms-add-photos ms-sections-open">Разделы книги</button><input type="file" accept="image/*" multiple hidden>'
    +'<div class="ms-photo-card" hidden><div class="ms-pc-head"><span>ФОТОГРАФИЯ</span><button type="button" data-pc="close" aria-label="Закрыть">×</button></div><div class="ms-pc-top"><img alt=""></div><div class="ms-pc-inline"><button type="button" data-pc="replace">заменить</button><button type="button" data-pc="remove">убрать из стопки</button></div><div class="ms-pc-fields">'
    +'<div class="ms-pc-field wide"><label>КТО НА ФОТО</label><input data-f="people" placeholder="Имена"><div class="ms-pc-hint">Имена пригодятся для подписи портрета.</div></div>'
    +'<div class="ms-pc-field"><label>ГОД</label><input data-f="year" placeholder="1987"><div class="ms-pc-hint">Фото с годом может попасть в «Хронологию».</div></div>'
    +'<div class="ms-pc-field"><label>МЕСТО</label><input data-f="place" placeholder="Город, деревня…"><div class="ms-pc-hint">Город — и фото может появиться на карте.</div></div>'
    +'<div class="ms-pc-field wide"><label>ИСТОРИЯ ФОТОГРАФИИ</label><textarea data-f="story" placeholder="Почему этот снимок важен..."></textarea></div>'
    +'<div class="ms-pc-field wide"><label>ПОДПИСЬ</label><input data-f="caption" placeholder="Например: Лето у бабушки"><div class="ms-pc-hint">Печатается мелко под фото: коротко — кто, где, когда.</div></div>'
    +'<div class="ms-pc-field wide"><label class="ms-pc-hero"><input type="checkbox" data-f="portraitHero"><span class="ms-pc-toggle"></span><span><b>Это портрет героя книги</b><small class="ms-hero-hint">Только снимок одного человека — портрет или в полный рост. Книга откроет им главу на целый разворот</small></span></label></div>'
    +'</div><div class="ms-pc-actions"><button type="button" data-pc="close">Отмена</button><button type="button" data-pc="done">Готово</button></div><div class="ms-pc-note">Потом перетащите фото на нужный лист.</div></div>';
  tray.querySelector('.ms-sections-open').addEventListener('click',e=>{e.stopPropagation();window.OCHERKI_MS_SECTIONS?.();});
  const pcard=tray.querySelector('.ms-photo-card');scr.appendChild(pcard);let pcItem=null;
  const openCard=p=>{pcItem=p;pcard.querySelector('img').src=p.src;pcard.querySelectorAll('[data-f]').forEach(f=>{if(f.type==='checkbox')f.checked=!!p[f.dataset.f];else f.value=p[f.dataset.f]||'';});pcard.hidden=false;scr.classList.add('is-photo-card');setTimeout(()=>pcard.querySelector('[data-f="people"]').focus(),60);};
  const closeCard=()=>{pcard.hidden=true;pcItem=null;scr.classList.remove('is-photo-card');};
  pcard.addEventListener('input',e=>{const f=e.target.closest('[data-f]');if(f&&pcItem){pcItem[f.dataset.f]=f.type==='checkbox'?f.checked:f.value;save();}});
  const replaceInput=document.createElement('input');replaceInput.type='file';replaceInput.accept='image/*';replaceInput.hidden=true;pcard.appendChild(replaceInput);
  replaceInput.addEventListener('change',()=>{const f=replaceInput.files?.[0];if(!f||!pcItem)return;readFiles([f]).then(([n])=>{if(!n||!pcItem)return;pcItem.src=n.src;pcItem.width=n.width;pcItem.height=n.height;pcard.querySelector('img').src=n.src;save();draw();});replaceInput.value='';});
  pcard.addEventListener('click',e=>{const b=e.target.closest('[data-pc]');if(!b)return;e.stopPropagation();const act=b.dataset.pc;
    if(act==='replace'){replaceInput.click();return;}
    if(act==='remove'&&pcItem){stack=stack.filter(x=>x!==pcItem);save();draw();}
    // The photo just described goes to the top of the stack and stays marked, so it is easy to find.
    const edited=act==='done'?pcItem:null;
    closeCard();
    if(edited&&stack.includes(edited)){recentPrint=edited.id;stack=stack.filter(x=>x!==edited);stack.push(edited);save();draw();}});
  scr.addEventListener('pointerdown',e=>{if(!pcard.hidden&&!pcard.contains(e.target))closeCard();});
  // A wide picture cannot be the hero's portrait: the card says so at once.
  pcard.addEventListener('change',e=>{if(!e.target.matches('[data-f="portraitHero"]'))return;const h=pcard.querySelector('.ms-hero-hint');const im=pcard.querySelector('img');const w=im?.naturalWidth||+pcItem?.width||0,ht=im?.naturalHeight||+pcItem?.height||0,wide=w&&ht&&w/ht>1.15;
    if(h){h.textContent=e.target.checked&&wide?'Снимок горизонтальный: книга обрежет его по высоте страницы. Если на нём один человек — в книге сдвиньте фото, чтобы он оказался в центре.':'Только снимок одного человека — портрет или в полный рост. Книга откроет им главу на целый разворот';h.style.color=e.target.checked&&wide?'#a4472f':'';}});
  scr.appendChild(tray);
  const toast=document.createElement('div');toast.className='ms-toast';scr.appendChild(toast);
  const say=t=>{toast.textContent=t;toast.classList.add('on');clearTimeout(say.t);say.t=setTimeout(()=>toast.classList.remove('on'),2200);};
  const prints=tray.querySelector('.ms-prints'),note=tray.querySelector('.ms-tray-note'),input=tray.querySelector('input');
  // The stack is kept in the browser (IndexedDB) until each print finds its sheet.
  const DB='ocherki-photo-tray';let stack=[];
  const idb=()=>new Promise((ok,no)=>{const r=indexedDB.open(DB,1);r.onupgradeneeded=()=>r.result.createObjectStore('t');r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error);});
  const save=()=>idb().then(db=>{const tx=db.transaction('t','readwrite');tx.objectStore('t').put(stack,'stack');}).catch(()=>{});
  idb().then(db=>{const rq=db.transaction('t').objectStore('t').get('stack');rq.onsuccess=()=>{stack=Array.isArray(rq.result)?rq.result:[];draw();};}).catch(()=>{});
  // Like the Dock: the print under the pointer rises most, its neighbours
  // less and less — the wave follows the pointer.
  // Like the Dock: the print under the pointer rises most, its neighbours
  // less — and every print eases towards its height frame by frame, so the
  // wave flows instead of jumping.
  let dockX=null,dockRaf=0;
  const dockStep=()=>{let moving=false;
    prints.querySelectorAll('.ms-print').forEach(el=>{let q=0;if(dockX!=null&&!carrying){const r=el.getBoundingClientRect(),d=Math.abs(dockX-(r.left+r.width/2)),f=Math.max(0,1-d/200);q=f*f*(3-2*f);}
      const cur=+(el.dataset.q||0),next=cur+(q-cur)*.14;el.dataset.q=next.toFixed(4);if(Math.abs(q-next)>.002)moving=true;
      const base=el.classList.contains('is-recent')?-12:0;
      el.style.setProperty('--ly',(Math.min(base,-18*next)).toFixed(2)+'px');el.style.setProperty('--ls',(1+.1*next).toFixed(4));el.style.setProperty('--rk',(1-next).toFixed(3));});
    dockRaf=moving||dockX!=null?requestAnimationFrame(dockStep):0;};
  prints.addEventListener('pointermove',e=>{dockX=e.clientX;if(!dockRaf)dockRaf=requestAnimationFrame(dockStep);});
  prints.addEventListener('pointerleave',()=>{dockX=null;if(!dockRaf)dockRaf=requestAnimationFrame(dockStep);});
  let recentPrint='';
  function draw(){prints.innerHTML='';
    // v124: two stacks — «Из архива» (larger, in the middle) and «С компьютера» (on the right, with «＋ Фото»).
    const gL=document.createElement('div'),gA=document.createElement('div'),gP=document.createElement('div');gL.className='ms-grp is-later';gA.className='ms-grp is-arch';gP.className='ms-grp is-pc';
    const nL=stack.filter(p=>p.from==='later').length,nA=stack.filter(p=>p.from==='arch').length,nP=stack.length-nA-nL;
    gL.innerHTML=`<span class="ms-grp-lab">Отложенные${nL?` · ${nL}`:''}</span><div class="ms-grp-row"></div>`;gL.hidden=!nL;
    gA.innerHTML=`<span class="ms-grp-lab">Из архива${nA?` · ${nA}`:''}</span><div class="ms-grp-row"></div>`;gP.innerHTML=`<span class="ms-grp-lab">С компьютера${nP?` · ${nP}`:''}</span><div class="ms-grp-row"></div>`;
    prints.append(gL,gA,gP);gA.hidden=!nA;gP.hidden=!nP;
    stack.forEach((p,i)=>{const el=document.createElement('div');el.className='ms-print';el.dataset.id=p.id;el.style.setProperty('--r',(((i*37)%9)-4)+'deg');el.innerHTML=`<img src="${p.src}" alt="">${p.portraitHero?'<span class="ms-hero" title="Портрет героя книги">★</span>':''}`;if(p.id===recentPrint)el.classList.add('is-recent');el.addEventListener('pointerdown',e=>carry(e,el,p));(p.from==='arch'?gA:p.from==='later'?gL:gP).querySelector('.ms-grp-row').appendChild(el);
      if(p.from==='arch'||p.from==='later'){const b=document.createElement('button');b.type='button';b.className='ms-aside';b.textContent=p.from==='arch'?'‹ отложить':'вернуть ›';b.title=p.from==='arch'?'Отложить: фото уйдёт в стопку слева':'Вернуть в стопку «Из архива»';
        b.addEventListener('pointerdown',e=>e.stopPropagation());b.addEventListener('click',e=>{e.stopPropagation();p.from=p.from==='arch'?'later':'arch';save();draw();});el.appendChild(b);}});
    // Many prints overlap more, so the stack never grows over «＋ Фото» and «Разделы книги».
    [gL,gA,gP].forEach(g=>{const big=g===gA,list=[...g.querySelectorAll('.ms-print')],w=big?112:84,W=Math.min(big?420:300,innerWidth*(big?.26:.18)),stepX=Math.min(w*.84,(W-w)/Math.max(1,list.length-1));list.forEach((el,i)=>{el.style.setProperty('margin-left',i?Math.round(stepX-w)+'px':'0px','important');el.style.setProperty('margin-right','0px','important');});});
    note.hidden=!stack.length;note.innerHTML=stack.length?`${stack.length} ${stack.length%10===1&&stack.length%100!==11?'фото ждёт':'фото ждут'} своего листа — перетащите на нужный лист <button type="button" class="ms-tray-clear">убрать все</button>`:'';
    // v99: all the waiting prints go at once (asked twice, so nothing goes by chance).
    note.querySelector('.ms-tray-clear')?.addEventListener('click',e=>{e.stopPropagation();const b=e.currentTarget;
      if(!b.classList.contains('is-ask')){b.classList.add('is-ask');b.textContent=`убрать все ${stack.length}?`;clearTimeout(b._t);b._t=setTimeout(()=>{b.classList.remove('is-ask');b.textContent='убрать все';},3500);return;}
      prints.querySelectorAll('.ms-print').forEach((el,i)=>{el.style.transition='transform .45s ease, opacity .4s ease';el.style.transitionDelay=(i*25)+'ms';el.style.opacity='0';el.style.transform='translateY(40px) scale(.8)';});
      setTimeout(()=>{stack=[];save();draw();},520);});}
  const readFiles=files=>Promise.all([...files].filter(f=>/^image\//.test(f.type)).map(f=>new Promise(ok=>{const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>ok({id:'tray_'+Date.now().toString(36)+Math.random().toString(36).slice(2,7),src:r.result,width:im.naturalWidth,height:im.naturalHeight});im.onerror=()=>ok(null);im.src=r.result;};r.onerror=()=>ok(null);r.readAsDataURL(f);}))).then(list=>list.filter(Boolean));
  // Only a sheet of the front row takes a photo: a sheet of the row behind
  // (or «＋ Эпизод») could win the 3D hit test and steal it.
  const sheetAt=(x,y)=>document.elementsFromPoint(x,y).map(n=>n.closest&&n.closest('.ms-sheet')).find(el=>el&&!el.classList.contains('is-new')&&!el.classList.contains('is-ghost')&&!el.classList.contains('is-far')&&el.style.pointerEvents!=='none');
  const sheetRef=el=>window.OCHERKI_MANUSCRIPT?.sheetOf?.(el);
  function place(el,photos){const ref=sheetRef(el);if(!ref)return false;
    const photoPages=new Set(['cover','back-cover','title','dedication','epigraph','intro','author','afterword','thanks','final','endpaper','back-endpaper']);
    if(!['chapter','recipes'].includes(ref.s.type)&&ref.p.type!=='document'&&!photoPages.has(ref.s.id)){say('На этот лист фото не кладутся — выберите лист главы, обложку или форзац');return false;}
    send({action:'addPhotos',sectionId:ref.s.id,pageUid:ref.p.uid,photos:photos.map(p=>({src:p.src,width:p.width,height:p.height,people:p.people||'',caption:p.caption||'',year:p.year||'',place:p.place||'',story:p.story||'',portraitHero:!!p.portraitHero}))});
    el.classList.remove('is-photo-landed');void el.offsetWidth;el.classList.add('is-photo-landed');
    say(photos.length>1?`Фото легли на лист «${ref.title}»`:`Фото легло на лист «${ref.title}»`);return true;}
  input.addEventListener('change',()=>{readFiles(input.files).then(list=>{stack.push(...list);save();draw();if(list.length)say('Фото в стопке — перетащите каждое на свой лист');});input.value='';});
  tray.querySelector('.ms-add-photos').addEventListener('click',()=>input.click());
  // v105: photos sent by the family go onto the same stack.
  // v170: an item may be a picture's address or a card from the archive ({src, caption, year, place, people, ak}); one archive card lies here once
  window.OCHERKI_TRAY_ADD=srcs=>Promise.all((srcs||[]).map(x=>new Promise(ok=>{const it=typeof x==='string'?{src:x}:x||{};if(it.ak&&stack.some(p=>p.ak===it.ak))return ok(null);const im=new Image();im.onload=()=>{
      // the picture is kept itself (not its address), so it stays when the archive changes
      let src=it.src;try{const c=document.createElement('canvas'),k=Math.min(1,1600/Math.max(im.naturalWidth,im.naturalHeight));c.width=Math.round(im.naturalWidth*k);c.height=Math.round(im.naturalHeight*k);c.getContext('2d').drawImage(im,0,0,c.width,c.height);src=c.toDataURL('image/jpeg',.9);}catch(_){}
      ok({id:'tray_'+Date.now().toString(36)+Math.random().toString(36).slice(2,7),src,width:im.naturalWidth,height:im.naturalHeight,from:'arch',ak:it.ak||'',caption:it.caption||'',year:it.year||'',place:it.place||'',people:it.people||''});};im.onerror=()=>ok(null);im.src=it.src;}))).then(list=>{list=list.filter(Boolean);stack.push(...list);save();draw();return list.length;});
  window.OCHERKI_TRAY_DROP=ak=>{const n=stack.length;stack=stack.filter(p=>p.ak!==ak);if(stack.length!==n){save();draw();}return n-stack.length;};
  // Files dragged from the computer.
  let depth=0;
  scr.addEventListener('dragenter',e=>{if(![...(e.dataTransfer?.types||[])].includes('Files'))return;e.preventDefault();depth++;scr.classList.add('is-file-over');});
  scr.addEventListener('dragleave',()=>{depth=Math.max(0,depth-1);if(!depth)scr.classList.remove('is-file-over');});
  scr.addEventListener('dragover',e=>{if(![...(e.dataTransfer?.types||[])].includes('Files'))return;e.preventDefault();scr.querySelectorAll('.is-photo-target').forEach(x=>x.classList.remove('is-photo-target'));sheetAt(e.clientX,e.clientY)?.classList.add('is-photo-target');});
  scr.addEventListener('drop',e=>{if(!e.dataTransfer?.files?.length)return;e.preventDefault();depth=0;scr.classList.remove('is-file-over');
    const target=sheetAt(e.clientX,e.clientY);scr.querySelectorAll('.is-photo-target').forEach(x=>x.classList.remove('is-photo-target'));
    readFiles(e.dataTransfer.files).then(list=>{if(!list.length)return;if(target&&place(target,list))return;stack.push(...list);save();draw();say('Фото в стопке — перетащите каждое на свой лист');});});
  // A print carried onto a sheet.
  let carrying=null;
  function carry(e,el,p){if(e.button!==0)return;e.preventDefault();const r=el.getBoundingClientRect();carrying={el,p,dx:e.clientX-r.left,dy:e.clientY-r.top,sx:e.clientX,sy:e.clientY,lifted:false,r};}
  addEventListener('pointermove',e=>{if(!carrying)return;
    if(!carrying.lifted){if(Math.hypot(e.clientX-carrying.sx,e.clientY-carrying.sy)<6)return;carrying.lifted=true;const {el,r}=carrying;closeCard();el.classList.add('is-dragging');el.style.left=r.left+'px';el.style.top=r.top+'px';el.style.width=r.width+'px';document.body.appendChild(el);}
    carrying.el.style.left=(e.clientX-carrying.dx)+'px';carrying.el.style.top=(e.clientY-carrying.dy)+'px';
    scr.querySelectorAll('.is-photo-target').forEach(x=>x.classList.remove('is-photo-target'));sheetAt(e.clientX,e.clientY)?.classList.add('is-photo-target');
    {const b=scr.querySelector('.ms-bin');if(b)b.classList.toggle('is-over',overBinP(b,e.clientX,e.clientY));}});
  // v142: a print can go into the bin too (it leaves the stack; it was only waiting there)
  const overBinP=(b,x,y)=>{const r=b.getBoundingClientRect();return r.width&&x>r.left-50&&x<r.right+40&&y>r.top-60&&y<r.bottom+20;};
  addEventListener('pointerup',e=>{if(!carrying)return;const {el,p,lifted}=carrying;carrying=null;if(!lifted){openCard(p);return;}
    const b=scr.querySelector('.ms-bin');b?.classList.remove('is-over');
    if(b&&overBinP(b,e.clientX,e.clientY)){const r=b.getBoundingClientRect();el.style.transition='left .45s cubic-bezier(.5,0,.8,.4),top .45s cubic-bezier(.5,0,.8,.4),transform .45s ease,opacity .4s ease .1s';el.style.left=(r.left+r.width/2-20)+'px';el.style.top=(r.top+r.height/2-20)+'px';el.style.transform='scale(.25) rotate(14deg)';el.style.opacity='0';
      setTimeout(()=>el.remove(),520);const was=stack.slice();stack=stack.filter(x=>x.id!==p.id);save();draw();(window.OCHERKI_SAY||say)('Фото убрано из стопки','вернуть',()=>{stack=was;save();draw();});return;}
    el.remove();
    const target=sheetAt(e.clientX,e.clientY);scr.querySelectorAll('.is-photo-target').forEach(x=>x.classList.remove('is-photo-target'));
    if(target&&place(target,[p])){stack=stack.filter(x=>x.id!==p.id);save();}draw();});
})();
