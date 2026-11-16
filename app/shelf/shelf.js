// «Мои книги» (v173): the showcase — books face out on a brass ledge, the last one in the middle under the lamp —
// and the card of one book, as the card of a photo in the archive: its own cover on the left (in its own format),
// what it is on the right, and Открыть · Переименовать · Копия · PDF · Удалить.
// It answers as window.OcherkiBookcase (open, close, isOpen), so the keys and the screens know it as before.
// On the start page (index.html) there is no constructor: the same shelf opens there too, with no book open,
// and «Открыть» / «+ новая книга» go where the start page says (window.OCHERKI_SHELF_HOOKS).
(()=>{const solo=!document.querySelector('.shell');const shell=document.querySelector('.shell')||document.createElement('div');if(solo)shell.classList.add('is-night');
  const hooks=()=>window.OCHERKI_SHELF_HOOKS||{};
  const esc=s=>String(s??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  const ls={get:k=>{try{return localStorage.getItem(k);}catch(_){return null;}},set:(k,v)=>{try{localStorage.setItem(k,v);return true;}catch(_){return false;}},del:k=>{try{localStorage.removeItem(k);}catch(_){}}};
  const frame=()=>document.getElementById('v35SheetFrame');
  const activeId=()=>solo?'':(ls.get('ocherkiActiveBook')||'current');
  const persist=async()=>{try{await frame()?.contentWindow?.__ocherkiPersistNow?.();}catch(_){}};
  const store=()=>window.OcherkiStore;
  // cloth of the showcase: the same cover for every book, its colour by the book
  const CLOTH=[['#1b1714','#efe2c8'],['#5b2a24','#e9c98f'],['#283a45','#e9dcc2'],['#3c4a32','#efe2c8'],['#4a3a5a','#eadfcf'],['#6b4a2a','#f3e3c4'],['#2f3b2f','#e6d9bd']];
  const hash=s=>[...String(s)].reduce((h,c)=>(h*31+c.charCodeAt(0))>>>0,7);
  const cloth=id=>CLOTH[hash(id)%CLOTH.length];
  const MONTHS=['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
  const when=t=>{if(!t)return'';const d=new Date(+t),n=new Date(),hm=d.toTimeString().slice(0,5);
    if(d.toDateString()===n.toDateString())return'сегодня, '+hm;const y=new Date(n);y.setDate(n.getDate()-1);if(d.toDateString()===y.toDateString())return'вчера, '+hm;
    return d.getDate()+' '+MONTHS[d.getMonth()]+(d.getFullYear()!==n.getFullYear()?' '+d.getFullYear():'');};
  const sheetsWord=n=>n%10===1&&n%100!==11?'лист':n%10>=2&&n%10<=4&&(n%100<10||n%100>=20)?'листа':'листов';

  // ——— the cover of a book, as the book itself draws it: kept whenever «Книга» has drawn it (its format and design with it)
  const CK='ocherkiCover:';
  const cover=id=>{try{return JSON.parse(ls.get(CK+id)||'null');}catch(_){return null;}};
  const keepCover=()=>{const a=window.__ocherkiArcApi;if(!a?.built?.())return;
    const art=document.querySelector('.pa-spread.is-cover .page-canvas article');if(!art)return;
    const ps=typeof window.__ocherkiPageSize==='function'?window.__ocherkiPageSize():a.pageSize?.();const [w,h]=Array.isArray(ps)?ps:[ps?.width||1000,ps?.height||1000];
    const txt=s=>(document.querySelector(s)?.textContent||'').replace(/^Aa/,'').replace(/скоро$/,'').trim();
    const meta=window.OCHERKI_BOOK_META||{};
    const rec={html:art.outerHTML,host:'bd-design-'+String(meta.design||'editorial').replace(/[^a-z0-9-]/gi,''),w,h,design:txt('.bd-design-card.is-active'),format:txt('.bd-format-card.is-active').replace(/(\D)(\d)/,'$1 $2'),subtitle:meta.subtitle||'',title:meta.title||''};
    const s=JSON.stringify(rec);if(s.length>1500000||s===keepCover.last)return;keepCover.last=s;ls.set(CK+activeId(),s);};
  setInterval(keepCover,4000);

  // ——— the screen
  const root=document.createElement('div');root.className='mb';root.setAttribute('aria-label','Мои книги');
  root.innerHTML=`<div class="mb-bg"></div>
    <div class="mb-view mb-show">${solo?'<button class="mb-back mb-home" type="button">‹ На старт</button>':''}<h1>Мои книги</h1><div class="mb-row"></div><div class="mb-ledge"></div>
      <button class="mb-arr l" type="button" aria-label="Левее">‹</button><button class="mb-arr r" type="button" aria-label="Правее">›</button>
      <div class="mb-name"><b></b><small></small></div></div>
    <div class="mb-view mb-card off"><button class="mb-back" type="button">‹ Мои книги</button><div class="mb-left"><i class="mb-floor"></i><div class="mb-book"><div class="mb-face"></div><i class="sp"></i><i class="pr"></i><i class="pt"></i><i class="pb"></i><i class="bk"></i></div></div>
      <div class="mb-r"></div><div class="mb-nav"><button class="ar" data-go="-1" type="button" aria-label="Предыдущая книга">‹</button><span class="n"></span><button class="ar" data-go="1" type="button" aria-label="Следующая книга">›</button><button class="all" type="button">все книги</button></div></div>`;
  document.body.appendChild(root);
  const $=s=>root.querySelector(s);
  let books=[],mid=0,cardAt=-1,isOpen=false;

  const load=async()=>{let list=[];try{list=await store()?.list()||[];}catch(_){}
    const cur=activeId(),meta=window.OCHERKI_BOOK_META||{};
    if(!solo&&!list.some(b=>b.id===cur))list.unshift({id:cur,title:meta.title||'',author:meta.author||'',pages:0,savedAt:Date.now()});
    // the open book always reads its title from the book itself
    list=list.map(b=>b.id===cur&&meta.title?{...b,title:meta.title}:b);
    return list.sort((a,b)=>(b.id===cur)-(a.id===cur)||(b.savedAt||0)-(a.savedAt||0));};
  const titleOf=b=>String(b?.title||'').trim()||'Книга без названия';
  const noteOf=b=>{const c=cover(b.id);return[c?.subtitle||'',b.savedAt&&'изменена '+when(b.savedAt)].filter(Boolean).join(' · ');};

  // ——— the showcase: the book in the middle is the big one; two on each side, smaller, in the half-dark
  const SPOT=[[0,1],[270,.62],[470,.5]];
  function drawShow(){const row=$('.mb-row');const items=[...books,{add:true}];
    row.innerHTML=items.map((b,i)=>{if(b.add)return`<div class="mb-b new" data-i="${i}"><div class="mb-cover" style="width:230px;height:300px"><b>+</b><small>новая книга</small></div></div>`;
      const [bg,ink]=cloth(b.id),c=cover(b.id);return`<div class="mb-b" data-i="${i}"><div class="mb-cover grain" style="width:230px;height:300px;background:${bg};color:${ink}"><b>${esc(titleOf(b))}</b><i></i><small>${esc(c?.subtitle||'')}</small></div></div>`;}).join('');
    place();}
  function place(){const items=[...root.querySelectorAll('.mb-b')];
    items.forEach((el,i)=>{const k=i-mid,a=Math.abs(k),[dx,s]=SPOT[Math.min(a,2)];const far=a>2;
      el.classList.toggle('far',far);el.classList.toggle('mid',k===0);el.classList.toggle('side',k!==0);
      const t=`translateX(${Math.sign(k)*dx}px) scale(${s})`;el.style.setProperty('--t',t);el.style.transform=t;el.style.zIndex=10-a;el.style.left='-115px';el.style.width='230px';});
    $('.mb-arr.l').classList.toggle('off',mid<=0);$('.mb-arr.r').classList.toggle('off',mid>=books.length);
    const b=books[mid],nm=$('.mb-name');nm.classList.add('swap');
    setTimeout(()=>{nm.querySelector('b').textContent=b?titleOf(b):'Новая книга';nm.querySelector('small').textContent=b?(b.id===activeId()?'открыта сейчас · ':'')+noteOf(b):'начать с первых шагов';nm.classList.remove('swap');},180);}
  const go=d=>{const n=Math.max(0,Math.min(books.length,mid+d));if(n!==mid){mid=n;place();}};
  $('.mb-arr.l').onclick=()=>go(-1);$('.mb-arr.r').onclick=()=>go(1);
  $('.mb-row').addEventListener('click',e=>{const el=e.target.closest('.mb-b');if(!el)return;const i=+el.dataset.i;
    if(i!==mid){mid=i;place();return;}
    if(i>=books.length)return newBook();showCard(i);});
  // one turn of the wheel (or one swipe, with its run-out) moves one book: the next waits until the wheel has rested
  let wheelLast=0;root.addEventListener('wheel',e=>{if(!$('.mb-card').classList.contains('off'))return;const t=performance.now(),rested=t-wheelLast>200;wheelLast=t;
    if(rested&&Math.abs(e.deltaY)+Math.abs(e.deltaX)>=2)go(e.deltaY>0||e.deltaX>0?1:-1);},{passive:true});

  // ——— the card of one book
  // the book in volume: the face is its cover (in the book's own proportions), the spine and the back in its cloth,
  // the page block as thick as the book has sheets
  function face(b){const f=$('.mb-face'),bk=$('.mb-book'),fl=$('.mb-floor'),c=cover(b.id),[bg,ink]=cloth(b.id);const W=440,H=500;
    let w,h;
    if(c&&c.html){const k=Math.min(W/c.w,H/c.h);w=Math.round(c.w*k);h=Math.round(c.h*k);f.className='mb-face';f.style.background='';f.style.color='';
      f.innerHTML=`<div class="book-preview-half right page-canvas-host ${esc(c.host||'bd-design-editorial')}" style="position:absolute;inset:0;width:100%;height:100%;margin:0;transform:none;box-shadow:none"><div class="page-canvas" style="width:${c.w}px;height:${c.h}px;transform:scale(${k})">${c.html}</div></div>`;}
    else{w=360;h=470;f.className='mb-face cloth mb-cover';f.style.background=bg;f.style.color=ink;f.innerHTML=`<b style="font-size:24px">${esc(titleOf(b))}</b><i></i><small>${esc(c?.subtitle||'')}</small>`;}
    const t=Math.round(Math.max(24,Math.min(48,16+(b.pages||20)*.7)));
    bk.style.setProperty('--w',w+'px');bk.style.setProperty('--h',h+'px');bk.style.setProperty('--t',t+'px');bk.style.setProperty('--cl',c&&c.html?'#151210':bg);
    fl.style.width=Math.round(w*1.15)+'px';fl.style.top=`calc(50% + ${Math.round(h/2-14)}px)`;}
  function showCard(i){cardAt=i;const b=books[i],c=cover(b.id),cur=b.id===activeId();face(b);
    const inside=[b.pages&&`${b.pages} ${sheetsWord(b.pages)}`].filter(Boolean).join(' · ')||'—';
    $('.mb-r').innerHTML=`<div class="kk">книга${c?.format?' · '+esc(c.format):''}</div><h2>${esc(titleOf(b))}</h2><div class="sub">${esc(c?.subtitle||'')}</div><div class="rule"></div>
      <dl><dt>автор</dt><dd>${esc(b.author||'не указан')}</dd><dt>изменена</dt><dd>${esc(when(b.savedAt)||'—')}</dd>${c?.design?`<dt>дизайн</dt><dd>${esc(c.design)}</dd>`:''}<dt>внутри</dt><dd>${esc(inside)}</dd>${cur?'<dt>сейчас</dt><dd>открыта в конструкторе</dd>':''}</dl>
      <div class="mb-keys"><button class="main" data-a="open" type="button">${cur?'Вернуться к книге':'Открыть'}</button><button data-a="rename" type="button">Переименовать</button><button data-a="copy" type="button">Копия</button>
      <button data-a="pdf" type="button" ${cur?'':'disabled title="Откройте книгу, чтобы сохранить её в PDF"'}>PDF</button><button class="del" data-a="del" type="button">Удалить</button></div>`;
    $('.mb-nav .n').textContent=`${i+1} из ${books.length}`;
    $('.mb-show').classList.add('off');$('.mb-card').classList.remove('off');}
  const showShelf=()=>{$('.mb-card').classList.add('off');$('.mb-show').classList.remove('off');if(cardAt>=0){mid=cardAt;place();}cardAt=-1;};
  $('.mb-card .mb-back').onclick=showShelf;$('.mb-home')&&($('.mb-home').onclick=()=>close());$('.mb-nav .all').onclick=showShelf;
  root.querySelectorAll('.mb-nav .ar').forEach(b=>b.onclick=()=>{const n=cardAt+ +b.dataset.go;if(n>=0&&n<books.length)showCard(n);});

  // ——— what the keys do
  const key=k=>document.querySelector(`.oct .k[data-k="${k}"]`);
  function openBook(b){if(solo){close();hooks().onOpen?.(b.id);return;}if(b.id===activeId()){close();key('write')?.click();return;}
    ls.set('ocherkiActiveBook',b.id);const node=document.getElementById('projectTitle');if(node)node.textContent=titleOf(b);
    close();key('write')?.click();
    // the sheet reloads behind a soft fade, so no bare white frame flashes while it starts
    const sheet=frame();if(sheet){sheet.style.transition='opacity .25s ease';sheet.style.opacity='0';
      sheet.addEventListener('load',()=>setTimeout(()=>{sheet.style.transition='opacity .9s ease';sheet.style.opacity='';},700),{once:true});
      setTimeout(()=>{sheet.src=sheet.src;},260);setTimeout(()=>{if(sheet.style.opacity==='0')sheet.style.opacity='';},6000);}}
  function newBook(){if(solo){close();hooks().onNew?.();return;}ls.set('ocherkiActiveBook','book-'+Date.now().toString(36));ls.del('ocherkiLifeProjectDraft');(window.top||window).location.href='index.html';}
  // a new name goes where the book keeps it: the first line of the cover and of the title page
  async function retitle(id,newTitle,toId){const S=store();if(!S)return false;if(id===activeId())await persist();
    const rec=await S.load(id);if(!rec)return false;const old=titleOf(rec.book);
    (rec.sections||[]).forEach(s=>{if(!['cover','title'].includes(s.id)||!s.pages?.[0])return;const lines=String(s.pages[0].text||'').split('\n');
      const at=lines.findIndex(l=>l.trim()===old);if(at>=0)lines[at]=newTitle;else lines.unshift(newTitle);s.pages[0].text=lines.join('\n');});
    rec.book={...(rec.book||{}),title:newTitle};delete rec.savedAt;await S.save(toId||id,rec);
    const c=cover(id);if(c){c.title=newTitle;ls.set(CK+(toId||id),JSON.stringify(c));}
    return true;}
  const reloadSheet=()=>{const sheet=frame();if(sheet)setTimeout(()=>{sheet.src=sheet.src;},120);};
  root.addEventListener('click',async e=>{const btn=e.target.closest('.mb-keys button[data-a]');if(!btn||btn.disabled)return;const b=books[cardAt];if(!b)return;const a=btn.dataset.a,cur=b.id===activeId();
    if(a==='open')return openBook(b);
    if(a==='pdf'){close();key('book')?.click();setTimeout(()=>document.querySelector('.bd-rail-key[data-rail="pdf"]')?.click(),1600);return;}
    if(a==='rename'){if(root.querySelector('.mb-edit'))return;const box=document.createElement('div');box.className='mb-edit mb-keys';
      box.innerHTML=`<input type="text" maxlength="80" value="${esc(titleOf(b))}" aria-label="Новое название"><button class="main" type="button">Сохранить</button>`;btn.parentElement.after(box);
      const inp=box.querySelector('input');inp.focus();inp.select();
      const ok=async()=>{const t=inp.value.trim();if(!t||t===titleOf(b)){box.remove();return;}box.querySelector('button').disabled=true;
        const done=await retitle(b.id,t).catch(()=>false);if(done){b.title=t;if(cur){reloadSheet();const node=document.getElementById('projectTitle');if(node)node.textContent=t;}window.OCHERKI_SAY?.('Книга переименована');}
        else window.OCHERKI_SAY?.('Не получилось переименовать — попробуйте ещё раз');showCard(cardAt);drawShow();};
      box.querySelector('button').onclick=ok;inp.addEventListener('keydown',ev=>{if(ev.key==='Enter')ok();if(ev.key==='Escape')box.remove();});return;}
    if(a==='copy'){btn.disabled=true;const id='book-'+Date.now().toString(36);const done=await retitle(b.id,titleOf(b)+' (копия)',id).catch(()=>false);
      window.OCHERKI_SAY?.(done?'Копия встала на полку рядом':'Не получилось сделать копию');books=await load();mid=Math.max(0,books.findIndex(x=>x.id===id));drawShow();if(done)showCard(mid);else btn.disabled=false;return;}
    if(a==='del'){if(!btn.classList.contains('ask')){btn.classList.add('ask');btn.textContent='Удалить навсегда?';clearTimeout(btn._t);btn._t=setTimeout(()=>{btn.classList.remove('ask');btn.textContent='Удалить';},4000);return;}
      try{await store()?.remove(b.id);}catch(_){}ls.del(CK+b.id);
      if(cur){try{const w=frame()?.contentWindow;if(w)w.__ocherkiNoSave=true;}catch(_){}ls.del('ocherkiActiveBook');ls.del('ocherkiLifeProjectDraft');setTimeout(()=>{(window.top||window).location.href='index.html';},600);return;}
      window.OCHERKI_SAY?.('Книга убрана с полки');books=await load();mid=Math.min(mid,books.length-1);drawShow();showShelf();}});

  // ——— open, close
  async function open(){if(isOpen){close();return;}isOpen=true;await persist();keepCover();books=await load();mid=0;cardAt=-1;
    root.classList.toggle('day',!shell.classList.contains('is-night'));$('.mb-card').classList.add('off');$('.mb-show').classList.remove('off');drawShow();
    document.body.classList.add('mb-on');shell.classList.add('is-shelf');requestAnimationFrame(()=>root.classList.add('on'));}
  function close(){if(!isOpen)return;isOpen=false;root.classList.remove('on');document.body.classList.remove('mb-on');shell.classList.remove('is-shelf');}
  window.OcherkiBookcase=Object.freeze({open,close,isOpen:()=>isOpen});
  document.getElementById('booksBtn')?.addEventListener('click',()=>open());
  // any other key on top leaves the shelf
  document.addEventListener('click',e=>{if(!isOpen)return;const k=e.target.closest?.('.oct button[data-k],.oct button[data-w]');if(k&&k.dataset.k!=='shelf'&&k.dataset.k!=='more')close();},true);
  document.addEventListener('keydown',e=>{if(!isOpen||e.key!=='Escape')return;if(!$('.mb-card').classList.contains('off'))showShelf();else close();});
  // day and night follow the room
  new MutationObserver(()=>root.classList.toggle('day',!shell.classList.contains('is-night'))).observe(shell,{attributes:true,attributeFilter:['class']});
})();
