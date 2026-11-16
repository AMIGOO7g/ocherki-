/*@block [" id=\"v51-book-map-controller\"", ""]*/
(() => {
  const shell = document.getElementById('shell');
  const frame = document.getElementById('v35SheetFrame');
  const map = document.getElementById('bookMapShell');
  const scroll = document.getElementById('bookMapScroll');
  const autoGroup = document.getElementById('bookMapAuto');
  const chapterGroup = document.getElementById('bookMapChapters');
  const backGroup = document.getElementById('bookMapBack');
  const addPage = document.getElementById('hostAddPage');
  const addChapter = document.getElementById('hostAddChapter');
  const addEpisode = document.getElementById('hostAddEpisode');
  const addDocument = document.getElementById('hostAddDocument');
  const paperWrap = document.getElementById('editorPaperWrap');
  let structure = null;

  const gripSvg = '<svg viewBox="0 0 9 14"><circle cx="1.6" cy="1.6" r="1.4"/><circle cx="7.4" cy="1.6" r="1.4"/><circle cx="1.6" cy="7" r="1.4"/><circle cx="7.4" cy="7" r="1.4"/><circle cx="1.6" cy="12.4" r="1.4"/><circle cx="7.4" cy="12.4" r="1.4"/></svg>';
  const esc = s => String(s??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const send = payload => { try{ frame?.contentWindow?.postMessage({type:'OCHERKI_STRUCTURE_COMMAND', ...payload}, '*'); }catch(_){ } };

  function positionMap(){
    if(!map || !paperWrap) return;
    const r=paperWrap.getBoundingClientRect();
    const left=Math.max(28,Math.min(64,window.innerWidth*.035));
    const top=Math.max(150,r.top+34);
    map.style.left=Math.round(left)+'px';
    map.style.top=Math.round(top)+'px';
    // The map ends above the vertical logo and the clock in the lower-left
    // corner (their block stands 98px above the bottom; the vertical logo
    // text reaches about 300px up);
    // a long book scrolls inside the map instead of running over them.
    const cornerTop=window.innerHeight-98-300-14;
    // «Крупный интерфейс» scales the map up from its top-left corner; its
    // height is limited in its own units, so it still ends above the logo and clock.
    const k=map.closest('.shell')?.classList.contains('is-large-ui')?1.2:1;
    map.style.maxHeight=Math.max(260,Math.min(cornerTop-top,r.height-8)/k)+'px';
    map.classList.add('is-positioned');
  }

  function pageKind(type){
    return ({cover:'обложка',endpaper:'форзац',title:'титул',dedication:'посвящение',epigraph:'эпиграф',contents:'оглавление',intro:'вступление',chapter:'текст',text:'текст',photo:'фото',document:'документ',map:'карта','inside-back-cover':'оборот','back-cover':'обложка'})[type] || 'лист';
  }

  function episodeGroups(pages){
    const out=[]; const by=new Map();
    (pages||[]).forEach((p,i)=>{let key=String(p.episode||'').trim()||'__default__';let g=by.get(key);if(!g){g={key,title:String(p.episode||'').trim()||`Эпизод ${out.length+1}. Без названия`,pages:[]};by.set(key,g);out.push(g)}g.pages.push({...p,_index:i});});
    return out;
  }

  function autoRow(s){const inactive=s.included===false?'is-inactive':'';return `<div class="book-map-section bm-auto-section" data-section-id="${esc(s.id)}"><button class="book-map-row ${s.active?'active':''} ${inactive}" type="button" data-select-section="${esc(s.id)}"><span class="book-map-rail"><span class="book-map-dot auto"></span></span><span class="book-map-main"><span class="book-map-line"><span class="book-map-label">${esc(s.title)}</span><span class="book-map-badge">авто</span></span></span></button></div>`;}

  function chapterRow(s){
    const groups=episodeGroups(s.pages||[]);
    const episodes=`<div class="bm-episodes ${s.active?'':'is-collapsed'}"><div class="bm-episodes-inner">${groups.map((g,gi)=>`<div class="bm-episode" data-episode-key="${esc(g.key)}"><div class="bm-episode-head"><span class="bm-episode-title">${esc(g.title)}</span>${groups.length>1?`<span class="book-map-grip" data-drag="episode">${gripSvg}</span>`:''}</div><div class="bm-episode-pages" data-pages-for="${esc(s.id)}">${g.pages.map(p=>{const custom=(p.title&&p.title!==s.title)?` · ${p.title}`:'';return `<button class="book-map-page ${p.active?'active':''} ${p.included===false?'is-inactive':''}" type="button" data-page-id="${esc(p.uid)}" data-section-id="${esc(s.id)}"><span class="book-map-rail"><span class="book-map-dot page"></span></span><span class="book-map-main"><span class="book-map-line"><span class="book-map-label">стр. ${p._index+1}${esc(custom)}</span></span></span><span class="book-map-target"></span>${s.pages.length>1?`<span class="book-map-grip" data-drag="page">${gripSvg}</span>`:''}</button>`}).join('')}</div></div>`).join('')}</div></div>`;
    const m=String(s.title||'').match(/^Глава\s+(\d+)[.:]?\s*(.*)$/i);
    const kicker=m?`Глава ${m[1]}`:'Глава'; const title=m?(m[2]||'Без названия'):(s.title||'Без названия');
    return `<div class="book-map-section ${s.active?'open':''}" data-section-id="${esc(s.id)}"><button class="book-map-row ${s.active?'active':''}" type="button" data-select-section="${esc(s.id)}"><span class="book-map-rail"><span class="book-map-dot chapter"></span></span><span class="book-map-main"><span class="book-map-kicker">${esc(kicker)}</span><span class="bm-chapter-title">${esc(title)}</span></span><span class="book-map-grip" data-drag="chapter">${gripSvg}</span></button>${episodes}</div>`;
  }

  function structureSignature(st){
    if(!st) return '';
    return st.sections.map(s=>`${s.id}:${s.title}:${s.sample?'s':''}:${s.included===false?'0':'1'}:${(s.pages||[]).map(p=>`${p.uid}:${p.title}:${p.episode}:${p.included===false?'0':'1'}`).join(',')}`).join('|');
  }

  function updateSelectionSmooth(next){
    const before = new Map();
    [...chapterGroup.querySelectorAll(':scope > .book-map-section')].forEach(el=>before.set(el.dataset.sectionId,el.getBoundingClientRect()));

    // Automatic/default sections participate in the same single-selection state
    // as chapter pages. Previously they were rendered once and never updated on
    // selection-only state changes, so their glow could not move.
    next.sections.filter(s=>s.auto).forEach(s=>{
      const sec=(autoGroup.querySelector(`:scope > .book-map-section[data-section-id="${CSS.escape(s.id)}"]`)
        || backGroup?.querySelector(`:scope > .book-map-section[data-section-id="${CSS.escape(s.id)}"]`));
      const row=sec?.querySelector(':scope > .book-map-row');
      row?.classList.toggle('active',!!s.active);
    });

    next.sections.filter(s=>!s.auto && s.type==='chapter').forEach(s=>{
      const sec=chapterGroup.querySelector(`:scope > .book-map-section[data-section-id="${CSS.escape(s.id)}"]`);
      if(!sec) return;
      const row=sec.querySelector(':scope > .book-map-row');
      const eps=sec.querySelector(':scope > .bm-episodes');
      sec.classList.toggle('open',!!s.active);
      row?.classList.toggle('active',!!s.active);
      eps?.classList.toggle('is-collapsed',!s.active);
      (s.pages||[]).forEach(p=>{
        const pr=sec.querySelector(`.book-map-page[data-page-id="${CSS.escape(p.uid)}"]`);
        pr?.classList.toggle('active',!!p.active);
        pr?.classList.toggle('is-inactive',p.included===false);
      });
    });
    requestAnimationFrame(()=>{
      [...chapterGroup.querySelectorAll(':scope > .book-map-section')].forEach(el=>{
        const prev=before.get(el.dataset.sectionId); if(!prev) return;
        const now=el.getBoundingClientRect(); const dy=prev.top-now.top;
        if(Math.abs(dy)<.5) return;
        el.style.transition='none'; el.style.transform=`translateY(${dy}px)`; void el.offsetHeight;
        el.style.transition='transform .46s cubic-bezier(.2,.8,.3,1)'; el.style.transform='';
        el.addEventListener('transitionend',()=>el.style.transition='',{once:true});
      });
    });
    // Re-trigger the warm-dot transition only for the actual current item.
    const activeRow = scroll?.querySelector('.book-map-row.active, .book-map-page.active');
    const activeDot = activeRow?.querySelector('.book-map-dot');
    if(activeDot){
      activeDot.classList.add('bm-ignite');
      requestAnimationFrame(()=>requestAnimationFrame(()=>activeDot.classList.remove('bm-ignite')));
      // Keep navigation motion inside the map's own scroller. scrollIntoView()
      // can also scroll/reposition outer ancestors and made the whole fixed map
      // appear to jump when the active item changed.
      if(scroll){
        const sr=scroll.getBoundingClientRect();
        const rr=activeRow.getBoundingClientRect();
        if(rr.top < sr.top + 8 || rr.bottom > sr.bottom - 8){
          const target = scroll.scrollTop + (rr.top - sr.top) - (scroll.clientHeight - rr.height)/2;
          scroll.scrollTo({top:Math.max(0,target),behavior:'smooth'});
        }
      }
    }
    const count=document.getElementById('pageCount'); if(count) count.textContent=String(next.totalPages??'');
    structure=next;
  }

  // Sections that appear in the map (other sections, sample chapters) slide
  // in one after another and glow for a moment, so the eye finds them.
  function visibleMapSections(){return new Set([...(scroll||document).querySelectorAll('.book-map-section')].filter(el=>el.offsetParent!==null).map(el=>el.dataset.sectionId));}
  function revealNewMapSections(before){
    const fresh=[...(scroll||document).querySelectorAll('.book-map-section')].filter(el=>el.offsetParent!==null&&!before.has(el.dataset.sectionId));
    fresh.forEach((el,i)=>{el.style.setProperty('--bm-delay',`${i*60}ms`);el.classList.remove('bm-appear');void el.offsetWidth;el.classList.add('bm-appear');setTimeout(()=>el.classList.remove('bm-appear'),1800+i*60);});
    const first=fresh[0];
    if(first&&scroll){const sr=scroll.getBoundingClientRect(),r=first.getBoundingClientRect();if(r.top<sr.top||r.bottom>sr.bottom)scroll.scrollTo({top:scroll.scrollTop+(r.top-sr.top)-40,behavior:'smooth'});}
  }
  chapterGroup?.addEventListener('click',event=>{
    if(event.target.closest('[data-samples-toggle]')){event.stopPropagation();const before=visibleMapSections();try{localStorage.setItem('ocherkiMapSamples',localStorage.getItem('ocherkiMapSamples')==='1'?'0':'1');}catch(_){}render(true);revealNewMapSections(before);return;}
    const remove=event.target.closest('[data-samples-remove]');
    if(remove){event.stopPropagation();
      if(!remove.dataset.sure){remove.dataset.sure='1';remove.textContent='Точно убрать пустые главы?';setTimeout(()=>{if(remove.isConnected){remove.dataset.sure='';remove.textContent='Убрать образцы';}},5000);return;}
      send({action:'removeSampleChapters'});}
  },true);
  function render(force=false){
    if(!structure) return;
    const all = structure.sections || [];
    const chapterIndexes = all.map((s,i)=>s.type==='chapter'?i:-1).filter(i=>i>=0);
    const firstChapter = chapterIndexes.length ? Math.min(...chapterIndexes) : all.length;
    const lastChapter = chapterIndexes.length ? Math.max(...chapterIndexes) : -1;
    const frontAutos = all.filter((s,i)=>s.auto && i < firstChapter);
    const backAutos = all.filter((s,i)=>s.auto && i > lastChapter);
    const chapters = all.filter(s=>!s.auto && s.type==='chapter');
    // Only the author's own content stays in view (the cover, chapters and
    // episodes); the book's other sections fold under one line.
    const extras=[...frontAutos,...backAutos].filter(s=>s.id!=='cover');
    const extrasBtn=document.getElementById('bookMapExtras');
    if(extrasBtn){
      let open=false;try{open=localStorage.getItem('ocherkiMapExtras')==='1';}catch(_){}
      map?.classList.toggle('show-extras',open);
      extrasBtn.hidden=!extras.length;
      extrasBtn.innerHTML=open?`<span class="bm-extras-dot"></span>Скрыть другие разделы`:`<span class="bm-extras-dot"></span>Другие разделы книги · ${extras.length}<i>›</i>`;
      if(!extrasBtn.dataset.bound){extrasBtn.dataset.bound='1';extrasBtn.addEventListener('click',()=>{const before=visibleMapSections();let now=false;try{now=localStorage.getItem('ocherkiMapExtras')!=='1';localStorage.setItem('ocherkiMapExtras',now?'1':'0');}catch(_){now=!map?.classList.contains('show-extras');}render(true);revealNewMapSections(before);});}
    }
    autoGroup.innerHTML = frontAutos.map(autoRow).join('');
    // Untouched sample chapters fold into one line; the chapter being
    // edited always stays in view.
    const samples=chapters.filter(s=>s.sample&&!s.active);
    const shown=chapters.filter(s=>!samples.includes(s));
    let samplesOpen=false;try{samplesOpen=localStorage.getItem('ocherkiMapSamples')==='1';}catch(_){}
    const word=n=>n%10===1&&n%100!==11?'глава-образец':n%10>=2&&n%10<=4&&(n%100<10||n%100>=20)?'главы-образца':'глав-образцов';
    chapterGroup.innerHTML = (samplesOpen?chapters:shown).map(chapterRow).join('')+(samples.length?`<div class="bm-samples"><button type="button" class="book-map-extras" data-samples-toggle><span class="bm-extras-dot"></span>${samplesOpen?'Свернуть образцы':`Ещё ${samples.length} ${word(samples.length)}`}<i>${samplesOpen?'':'›'}</i></button><button type="button" class="bm-samples-remove" data-samples-remove>Убрать образцы</button></div>`:'');
    if(backGroup) backGroup.innerHTML = backAutos.map(autoRow).join('');
    bindDrag();
    const count = document.getElementById('pageCount');
    if(count) count.textContent = String(structure.totalPages ?? '');
  }


  function renderWithStructureFlip(previous,next){
    const before=new Map();
    [...chapterGroup.querySelectorAll(':scope > .book-map-section')].forEach(el=>before.set(el.dataset.sectionId,el.getBoundingClientRect()));
    const oldIds=new Set((previous?.sections||[]).filter(x=>!x.auto&&x.type==='chapter').map(x=>x.id));
    const newIds=(next?.sections||[]).filter(x=>!x.auto&&x.type==='chapter'&&!oldIds.has(x.id)).map(x=>x.id);
    const keepScroll=scroll?.scrollTop||0;
    structure=next;
    render(true);
    if(scroll)scroll.scrollTop=keepScroll;
    requestAnimationFrame(()=>{
      [...chapterGroup.querySelectorAll(':scope > .book-map-section')].forEach(el=>{
        const prev=before.get(el.dataset.sectionId);
        if(prev){
          const now=el.getBoundingClientRect();
          const dy=prev.top-now.top;
          if(Math.abs(dy)>.5){el.style.transition='none';el.style.transform=`translateY(${dy}px)`;void el.offsetHeight;el.style.transition='transform .48s cubic-bezier(.2,.8,.3,1)';el.style.transform='';el.addEventListener('transitionend',()=>{el.style.transition=''}, {once:true});}
        }
      });
      newIds.forEach(id=>{
        const el=chapterGroup.querySelector(`:scope > .book-map-section[data-section-id="${CSS.escape(id)}"]`);
        if(!el)return;
        el.classList.add('bm-entering');
        void el.offsetHeight;
        requestAnimationFrame(()=>el.classList.add('bm-entering-go'));
        el.addEventListener('transitionend',()=>{el.classList.remove('bm-entering','bm-entering-go')},{once:true});
      });
      const active=chapterGroup.querySelector('.book-map-section.open .book-map-row.active');
      if(active&&scroll){setTimeout(()=>{const sr=scroll.getBoundingClientRect(),rr=active.getBoundingClientRect();if(rr.bottom>sr.bottom-8||rr.top<sr.top+8){const target=scroll.scrollTop+(rr.top-sr.top)-(scroll.clientHeight-rr.height)/2;scroll.scrollTo({top:Math.max(0,target),behavior:'smooth'})}},180);}
    });
  }

  scroll?.addEventListener('click', e => {
    if(e.target.closest('.book-map-grip')) return;
    const page = e.target.closest('[data-page-id]');
    if(page){ window.OCHERKI_PLAY_PAGE_FX?.(.88); send({action:'select', sectionId:page.dataset.sectionId, pageUid:page.dataset.pageId}); return; }
    const section = e.target.closest('[data-select-section]');
    if(section){ window.OCHERKI_PLAY_PAGE_FX?.(.82); send({action:'select', sectionId:section.dataset.selectSection}); }
  });
  addPage?.addEventListener('click',()=>send({action:'addPage'}));
  addChapter?.addEventListener('click',()=>send({action:'addChapter'}));
  addEpisode?.addEventListener('click',()=>send({action:'addEpisode'}));
  addDocument?.addEventListener('click',()=>send({action:'addDocument'}));

  function measureRects(container,selector,exclude){const m=new Map();[...container.children].forEach(el=>{if(el!==exclude&&el.matches(selector))m.set(el,el.getBoundingClientRect())});return m;}
  function playFlip(before,after){after.forEach((r,el)=>{const p=before.get(el);if(!p)return;const dy=p.top-r.top;if(Math.abs(dy)<.5)return;el.style.transition='none';el.style.transform=`translateY(${dy}px)`;void el.offsetHeight;el.style.transition='transform .3s cubic-bezier(.2,.8,.3,1)';el.style.transform='';el.addEventListener('transitionend',()=>el.style.transition='',{once:true})});}
  function setupDrag(container, selector, onDrop){
    if(!container || container.dataset.dragBound==='1') return; container.dataset.dragBound='1';
    container.addEventListener('pointerdown',e=>{const grip=e.target.closest('.book-map-grip');if(!grip||!container.contains(grip))return;const item=grip.closest(selector);if(!item)return;e.preventDefault();e.stopPropagation();const cr=container.getBoundingClientRect(),ir=item.getBoundingClientRect(),grab=e.clientY-ir.top;const ph=document.createElement('div');ph.className='book-map-placeholder';ph.style.height=ir.height+'px';container.insertBefore(ph,item);item.style.top=(ir.top-cr.top)+'px';item.classList.add('dragging');void item.offsetHeight;let moved=false;
      const move=ev=>{moved=true;const rr=container.getBoundingClientRect();item.style.top=((ev.clientY-grab)-rr.top)+'px';const others=[...container.children].filter(x=>x!==item&&x.matches(selector));for(const other of others){const r=other.getBoundingClientRect(),mid=r.top+r.height/2,after=!!(ph.compareDocumentPosition(other)&Node.DOCUMENT_POSITION_FOLLOWING);if(after&&ev.clientY>mid){const before=measureRects(container,selector,item);container.insertBefore(ph,other.nextSibling);playFlip(before,measureRects(container,selector,item));break}else if(!after&&ev.clientY<mid){const before=measureRects(container,selector,item);container.insertBefore(ph,other);playFlip(before,measureRects(container,selector,item));break}}};
      const up=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);const floating=item.getBoundingClientRect();container.insertBefore(item,ph);ph.remove();item.classList.remove('dragging');item.style.top='';const fin=item.getBoundingClientRect(),dy=floating.top-fin.top;if(Math.abs(dy)>.5){item.style.transition='none';item.style.transform=`translateY(${dy}px)`;void item.offsetHeight;item.style.transition='transform .32s cubic-bezier(.2,.8,.3,1)';item.style.transform='';item.addEventListener('transitionend',()=>item.style.transition='',{once:true})}if(moved){suppressNextClick=true;onDrop(item)}};
      window.addEventListener('pointermove',move);window.addEventListener('pointerup',up,{once:true});
    });
  }

  function bindDrag(){
    setupDrag(chapterGroup,'.book-map-section',(dragEl)=>{const ids=[...chapterGroup.querySelectorAll(':scope > .book-map-section')].map(x=>x.dataset.sectionId);const sectionId=dragEl.dataset.sectionId;send({action:'reorderChapters',ids});if(sectionId)send({action:'select',sectionId});});
    chapterGroup.querySelectorAll('.bm-episodes-inner').forEach(w=>setupDrag(w,'.bm-episode',()=>{const section=w.closest('.book-map-section');const ids=[...w.querySelectorAll('.book-map-page')].map(x=>x.dataset.pageId);send({action:'reorderPages',sectionId:section.dataset.sectionId,ids});}));
    chapterGroup.querySelectorAll('.bm-episode-pages').forEach(list=>setupDrag(list,'.book-map-page',()=>{const section=list.closest('.book-map-section');const ids=[...section.querySelectorAll('.book-map-page')].map(x=>x.dataset.pageId);send({action:'reorderPages',sectionId:section.dataset.sectionId,ids});}));
  }


  const promptEl = document.getElementById('writingPrompt');
  const promptTextEl = document.getElementById('writingPromptText');
  const promptAgreeEl = document.getElementById('writingPromptAgree');
  const promptNextEl = document.getElementById('writingPromptNext');
  const promptHideEl = document.getElementById('writingPromptHide');
  const promptRestoreEl = document.getElementById('writingPromptRestore');
  let promptTimer = null;
  let promptKey = '';
  let promptIndex = 0;
  const dismissedPromptKeys = new Set();
  const hiddenPromptKeys = new Set();
  let promptsGloballyHidden = false;

  function activeContext(st){
    const section=(st?.sections||[]).find(s=>s.active);
    if(!section) return null;
    const page=(section.pages||[]).find(p=>p.active) || section.pages?.[section.activePage||0] || section.pages?.[0];
    return page ? {section,page} : null;
  }

  function questionsFor(ctx){
    if(!ctx) return [];
    // «Свободное письмо»: no questions over the sheet (the author chose it).
    if(window.__ocherkiWorkMode&&window.__ocherkiWorkMode!=='С вопросами-подсказками') return [];
    const {section:s,page:p}=ctx;
    const wc=Number(p.wordCount||0), pc=Number(p.photoCount||0);
    if(s.id==='cover') return ['Как вы хотите назвать эту книгу?', 'Есть ли короткая фраза, которая объясняет, о чём эта история?'];
    if(s.id==='dedication') return ['Кому вы посвящаете эту книгу?', 'Есть ли человек, без которого этой истории не было бы?'];
    if(s.id==='epigraph') return ['Есть фраза, которая задаёт тон всей истории?', 'Какие слова вы хотели бы оставить читателю перед началом?'];
    if(s.id==='intro') return ['С чего для читателя должна начаться эта история?', 'Почему вы решили сохранить эту историю именно сейчас?'];
    if(s.id==='author') return ['Что вы хотите сказать читателю от себя до начала основной истории?', 'Кому и за что вы особенно благодарны за появление этой книги?'];
    if(s.id==='afterword') return ['Что вы хотите сказать читателю после последней главы?', 'Как изменилась для вас эта история, пока вы её записывали?'];
    if(s.id==='thanks') return ['Кого важно поблагодарить за помощь и сохранённые воспоминания?', 'Кто помогал находить фотографии, письма или факты?'];
    if(s.id==='sources') return ['Какие документы, архивы и свидетельства использованы?', 'Есть ли источник, который стоит подписать особенно точно?'];
    if(s.id==='colophon') return ['Какие данные об издании вы хотите сохранить: автор, составитель, год, место?', 'Нужно ли указать фотографов, архивы или дизайн?'];
    if(s.id==='back-cover') return ['Какое последнее ощущение должна оставить книга?', 'Нужна ли на задней обложке короткая аннотация или только знак/год?'];
    if(s.type==='chapter'){
      // A chapter made from the start steps carries its own questions; any
      // other chapter (a new «Глава 2» too) gets questions for its stage.
      const planned=(p.prompts&&p.prompts.length?p.prompts:(s.pages||[]).find(page=>page.prompts&&page.prompts.length)?.prompts)||[];
      if(planned.length) return planned;
      if(wc < 35) return ['С какого конкретного момента начинается этот эпизод?', 'Где это происходило и кто был рядом?', 'Что вы помните первым: человека, место, звук или запах?'];
      if(pc===0 && wc>120) return ['Сохранилась фотография, письмо или документ, связанный с этим эпизодом?', 'Есть ли предмет или место, которое можно показать рядом с этим текстом?'];
      return ['Что в этом воспоминании нельзя потерять при сокращении?', 'Какую одну деталь вы видите перед глазами лучше всего?', 'Что тогда чувствовал герой, но не говорил вслух?'];
    }
    return [];
  }

  function positionPrompt(){
    if(!promptEl || !paperWrap) return;
    {const sh=document.querySelector('.shell');if(sh?.classList.contains('wp-on')||sh?.classList.contains('wp-closing'))return;}
    const r=paperWrap.getBoundingClientRect();
    const sane = r.width>80 && r.height>80 && r.right>-80 && r.left<window.innerWidth+80;
    const w=Math.min(520,Math.max(330,(sane?r.width:460)*.9));
    promptEl.style.width=Math.round(w)+'px';
    const centerX = sane ? (r.left+r.width/2) : (window.innerWidth/2);
    const left=Math.max(22,Math.min(window.innerWidth-w-22,centerX-w/2));
    /* Always above the settled paper. Never anchor to a transient offscreen boot rect. */
    const top=sane ? Math.max(18,r.top-108) : Math.max(18,window.innerHeight*.12);
    // On a low screen the sheet reaches the top edge: the question is then
    // written in dark ink so it still reads over the paper.
    // With the right-hand panel now a narrow column, the question is
    // written to the right of the sheet when there is room for it.
    const railLeft=document.querySelector('.book-design-shell.is-rail')?.getBoundingClientRect().left||window.innerWidth-100;
    const side=sane?railLeft-r.right-100:0;// (the question sits mid-way in this space)
    // v119: the question lives on the left of the sheet, in the middle of the free space there.
    if(sane&&document.querySelector('.shell')?.classList.contains('oc-w')&&r.left-110>=300){
      const room=r.left-60,sw=Math.min(560,room-50);
      promptEl.classList.remove('is-on-paper');promptEl.classList.add('is-beside');promptEl.style.width=Math.round(sw)+'px';
      promptEl.style.left=Math.round(30+(room-sw)/2)+'px';
      promptEl.style.top=Math.round(Math.max(170,r.top+r.height*.5-110))+'px';
      return;
    }
    if(side>=280){
      const sw=Math.min(380,side);
      promptEl.classList.remove('is-on-paper');promptEl.classList.add('is-beside');
      promptEl.style.width=Math.round(sw)+'px';
      // Clear of the stack of pages that shows beside the sheet.
      // Well away from the sheet: in the middle of the free space before the keys.
      promptEl.style.left=Math.round(r.right+Math.max(110,(railLeft-r.right-sw)/2))+'px';
      promptEl.style.top=Math.round(Math.max(150,r.top+r.height/2-(promptEl.offsetHeight||180)/2))+'px';
      return;
    }
    promptEl.classList.remove('is-beside');
    promptEl.classList.toggle('is-on-paper',sane&&r.top<120);
    promptEl.style.left=Math.round(left)+'px';
    promptEl.style.top=Math.round(top)+'px';
    // No room above the sheet: the question settles in dark ink in the
    // quiet strip at the bottom of the sheet, above its word count.
    if(sane&&r.top<120){
      const bottom=Math.min(window.innerHeight-12,r.bottom-64);
      promptEl.style.top=Math.round(bottom-(promptEl.offsetHeight||90))+'px';
    }
    if(promptRestoreEl){
      promptRestoreEl.style.left=Math.round(r.left+r.width/2-5)+'px';
      promptRestoreEl.style.top=Math.round(Math.max(18,r.top-48))+'px';
    }
  }

  function showPromptRestoreMark(){
    if(!promptRestoreEl || !paperWrap) return;
    const r=paperWrap.getBoundingClientRect();
    promptRestoreEl.style.left=Math.round(r.left+r.width/2-8)+'px';
    promptRestoreEl.style.top=Math.round(Math.max(14,r.top-58))+'px';
    promptRestoreEl.style.display='block';
    promptRestoreEl.classList.add('show');
  }
  function hidePromptRestoreMark(){
    if(!promptRestoreEl) return;
    promptRestoreEl.classList.remove('show');
    promptRestoreEl.style.display='';
  }

  function hidePrompt(markDismissed=false){
    clearTimeout(promptTimer);
    if(promptEl?.classList.contains('is-visible')){
      promptEl.classList.remove('is-visible');
      promptEl.classList.add('is-leaving');
      window.setTimeout(()=>promptEl?.classList.remove('is-leaving'),720);
    }
    if(markDismissed && promptKey) dismissedPromptKeys.add(promptKey);
  }

  function showPromptFromStructure(st, immediate=false){
    const ctx=activeContext(st);
    if(!ctx || !promptEl || !promptTextEl) return hidePrompt();
    if(promptsGloballyHidden){
      hidePrompt(false);
      requestAnimationFrame(showPromptRestoreMark);
      return;
    }
    const qs=questionsFor(ctx);
    const key=String(ctx.section.id||'section');
    if(!qs.length || dismissedPromptKeys.has(key)){
      if(promptsGloballyHidden)showPromptRestoreMark();else hidePromptRestoreMark();
      return hidePrompt();
    }
    const samePromptContext = key===promptKey;
    if(!samePromptContext){ promptKey=key; promptIndex=0; }
    // Flipping physical pages inside the same section must not replace or
    // restart the author's prompt. Only the explicit “следующий вопрос” action
    // changes it. Re-anchor to the paper and keep the current sentence.
    if(samePromptContext && promptEl.classList.contains('is-visible')){
      positionPrompt();
      return;
    }
    if(hiddenPromptKeys.has(key)){
      positionPrompt();
      promptRestoreEl?.classList.add('show');
      return hidePrompt(false);
    }
    if(!promptsGloballyHidden) if(!promptsGloballyHidden)hidePromptRestoreMark();
    clearTimeout(promptTimer);
    hidePrompt(false);
    promptTimer=setTimeout(()=>{
      writePromptText(qs[promptIndex % qs.length],promptIndex % qs.length,qs.length);
      positionPrompt();
      promptEl.classList.remove('is-leaving');
      void promptEl.offsetWidth;
      promptEl.classList.add('is-visible');

    }, immediate ? 180 : 1350);
  }

  // The question is written by hand out of a mist: every letter appears
  // from a blur one after another, and leaves the same way.
  // The sheet still travels for a moment after the constructor opens; the
  // question follows it until it settles.
  setInterval(()=>{if(promptEl?.classList.contains('is-visible'))positionPrompt();},700);
  function writePromptText(text,index,total){
    if(!promptTextEl)return;
    // Which question of the chapter's list this is: «вопрос 2 из 5».
    const count=document.getElementById('writingPromptCount');if(count)count.textContent=total>1?`вопрос ${index+1} из ${total}`:'';
    let i=0;
    promptTextEl.innerHTML=String(text||'').split(/(\s+)/).map(part=>/^\s+$/.test(part)?part:`<span class="wp-word">${[...part].map(ch=>`<span class="wp-ch" style="--i:${i++}">${ch.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}</span>`).join('')}</span>`).join('');
    promptTextEl.style.setProperty('--wp-count',String(i));
  }
  function swapPromptQuestion(qs,nextIndex){
    if(!promptEl||!promptTextEl||!qs.length)return;
    // v121: on the left only the words of the question change; the row stays put.
    if(document.querySelector('.shell')?.classList.contains('oc-w')){
      promptTextEl.style.transition='opacity .45s ease';promptTextEl.style.opacity='0';
      window.setTimeout(()=>{promptIndex=(nextIndex+qs.length)%qs.length;writePromptText(qs[promptIndex],promptIndex,qs.length);requestAnimationFrame(()=>{promptTextEl.style.opacity='1';});},470);
      return;}
    promptEl.classList.remove('is-visible');
    promptEl.classList.add('is-leaving');
    window.setTimeout(()=>{
      promptIndex=(nextIndex+qs.length)%qs.length;
      writePromptText(qs[promptIndex],promptIndex,qs.length);
      positionPrompt();
      promptEl.classList.remove('is-leaving');
      void promptEl.offsetWidth;
      promptEl.classList.add('is-visible');
    },980);
  }
  promptAgreeEl?.addEventListener('click',()=>{
    const ctx=activeContext(structure),qs=questionsFor(ctx);
    if(!qs.length)return hidePrompt(false);
    swapPromptQuestion(qs,promptIndex-1);
  });
  promptHideEl?.addEventListener('click',()=>{
    promptsGloballyHidden = true;
    if(promptKey) hiddenPromptKeys.add(promptKey);
    hidePrompt(false);
    showPromptRestoreMark();
  });
  promptRestoreEl?.addEventListener('click',()=>{
    promptsGloballyHidden = false;
    hiddenPromptKeys.clear();
    hidePromptRestoreMark();
    showPromptFromStructure(structure,true);
  });
  promptNextEl?.addEventListener('click',()=>{
    const ctx=activeContext(structure),qs=questionsFor(ctx);
    if(!qs.length) return;
    swapPromptQuestion(qs,promptIndex+1);
  });
  function navBy(delta){
    if(!structure)return;
    const flat=[];
    (structure.sections||[]).forEach(sec=>{if(sec.included===false)return;(sec.pages||[]).forEach(pg=>flat.push({sectionId:sec.id,pageUid:pg.uid,active:!!pg.active}))});
    if(!flat.length)return;
    let i=flat.findIndex(x=>x.active); if(i<0)i=0;
    const ni=Math.max(0,Math.min(flat.length-1,i+delta));
    const target=flat[ni];
    if(target&&ni!==i){ window.OCHERKI_PLAY_PAGE_FX?.(.9); send({action:'select',sectionId:target.sectionId,pageUid:target.pageUid}); }
  }
  window.addEventListener('resize',()=>{ if(promptEl?.classList.contains('is-visible')) positionPrompt(); if(promptsGloballyHidden) showPromptRestoreMark(); });

  window.addEventListener('message' ,e=>{
    const d=e.data||{};
    if(d.type==='OCHERKI_ACTIVE_STATE' && structure){
      const payload=d.payload||{};
      const sectionId=payload.sectionId||'';
      const pageUid=payload.pageUid||'';
      const lightweight=Object.assign({},structure,{
        activeSection:Number(payload.activeSection)||0,
        activePage:Number(payload.activePage)||0,
        sections:(structure.sections||[]).map(section=>Object.assign({},section,{
          active:section.id===sectionId,
          activePage:section.id===sectionId?(Number(payload.activePage)||0):section.activePage,
          pages:(section.pages||[]).map(page=>Object.assign({},page,{active:section.id===sectionId && (page.uid===pageUid || page.id===pageUid)}))
        }))
      });
      updateSelectionSmooth(lightweight);
      showPromptFromStructure(lightweight,false);
      return;
    }
    if(d.type==='OCHERKI_STRUCTURE_STATE'){
      const next=d.payload;
      const previousActive = activeContext(structure);
      const nextActive = activeContext(next);
      const selectionChanged = !previousActive || !nextActive ||
        previousActive.section.id!==nextActive.section.id || previousActive.page.uid!==nextActive.page.uid;
      if(structure && structureSignature(structure)===structureSignature(next) && chapterGroup.children.length){
        updateSelectionSmooth(next);
      }else{
        const previousStructure=structure;
        renderWithStructureFlip(previousStructure,next);
      }
      if(selectionChanged) showPromptFromStructure(next,false);
      if(promptsGloballyHidden) showPromptRestoreMark();
      // v131: signal that the left map has real content before the boot menu phase.
      shell.classList.add('map-data-ready');
      window.dispatchEvent(new CustomEvent('OCHERKI_MAP_READY'));
    }
  });
  frame?.addEventListener('load',()=>{
    send({action:'requestState'});
  });
  // The left map is anchored once to the settled editor position and only
  // recalculated on a real viewport resize. Do not observe paperWrap: its
  // transient geometry changes during sheet/chapter animations caused the map
  // itself to be re-positioned, unlike the visually stable right panel.
  let mapResizeTimer=null;
  window.addEventListener('resize',()=>{clearTimeout(mapResizeTimer);mapResizeTimer=setTimeout(positionMap,80);});

  // Controlled/replayable physical boot.
  let bootStarted=false;
  let bootTimers=[];
  const later=(fn,ms)=>{const id=setTimeout(fn,ms);bootTimers.push(id);return id;};
  function resetBootVisualState(){
    bootTimers.forEach(clearTimeout);bootTimers=[];
    shell.classList.add('ui-boot');
    shell.classList.remove('boot-icons','boot-menus','boot-paper','boot-keyboard','menus-ready','boot-started');
    positionMap();
  }
  function startBootSequence(force=false){
    if(bootStarted && !force) return;
    // The centered startup caption must disappear the instant constructor boot begins.
    // Do this before any UI element starts moving so it can never linger over the editor.
    try{ removePowerCopy(); }catch(_){}
    if(force) resetBootVisualState();
    bootStarted=true;
    shell.classList.add('boot-started');
    requestAnimationFrame(()=>{
      // Let the clock appear beneath the power key first; it then travels to
      // the permanent lower-left position with the rest of the constructor.
      // After the start page's key has already flown to the corner the light
      // comes on at once; opened on its own the constructor keeps its slower
      // entry with the key in the centre.
      later(()=>{
        const power=document.getElementById('powerBtn');
        if(power && !shell.classList.contains('is-open')){window.__OCHERKI_BOOT_POWER=true;power.click();window.__OCHERKI_BOOT_POWER=false;}
      },shell.classList.contains('is-handoff')?0:560);
      send({action:'requestState'});later(()=>send({action:'requestState'}),220);
      positionMap();
      later(()=>shell.classList.add('boot-icons'),260);
      let menusShown=false;
      const revealMenus=()=>{if(menusShown)return;menusShown=true;positionMap();shell.classList.add('menus-ready','boot-menus');};
      later(()=>{if(shell.classList.contains('map-data-ready'))revealMenus();else window.addEventListener('OCHERKI_MAP_READY',revealMenus,{once:true});},520);
      later(revealMenus,820);
      later(()=>{
        try{window.parent?.postMessage({type:'OCHERKI_AUDIO_COMMAND',action:'fx',name:'page',volume:1},'*');}catch(_){}
        positionPrompt();
        shell.classList.add('boot-paper');
      },900);
      later(()=>shell.classList.add('boot-keyboard'),1280);
      later(()=>{
        positionMap();
        shell.classList.remove('ui-boot','boot-icons','boot-menus','boot-paper','boot-keyboard');
        positionPrompt();
        if(structure) showPromptFromStructure(structure,true);
        // The paper is still finishing its physical settle at this point. Re-anchor
        // the prompt after the final geometry is stable so it never sticks to a
        // transient edge-of-screen rect.
        later(()=>{ positionMap(); positionPrompt(); },240);
        later(()=>{ positionPrompt(); },520);
        later(()=>shell.classList.remove('is-handoff'),900);
      },1850);
    });
  }
  window.OCHERKI_START_AFTER_AUTH=()=>{
    window.__OCHERKI_AUTH_GATE_PENDING=false;
    startBootSequence();
  };
  window.OCHERKI_RESTART_BOOT=()=>startBootSequence(true);
  // Exposed so other independently-scoped <script> blocks (e.g. the book-assembly
  // controller's preview close handler) can re-run these after their own async
  // settle timers, without duplicating the map/prompt positioning logic. Calling
  // the bare (unexported) function names from another block's IIFE throws a
  // ReferenceError, since each <script> block is its own closure.
  window.OCHERKI_positionMap=positionMap;
  window.OCHERKI_positionPrompt=positionPrompt;
  window.OCHERKI_showPromptFromStructure=showPromptFromStructure;
  window.addEventListener('message',e=>{const d=e.data||{};if(d.type==='OCHERKI_PHOTO_CARD')shell.classList.toggle('is-photo-card-open',d.open===true);});
  window.addEventListener('message',e=>{const d=e.data||{};if(d.type==='OCHERKI_BOOT_START'){if(d.handoff)shell.classList.add('is-handoff');startBootSequence();}});
  const embedded=new URLSearchParams(location.search).get('embedded')==='1';
  if(!embedded && !window.__OCHERKI_AUTH_GATE_PENDING)startBootSequence();
})();
