/*@block [" id=\"v103-book-assembly-controller\"", ""]*/
(() => {
  const frame=document.getElementById('v35SheetFrame');
  const panel=document.getElementById('bookDesignShell');
  const paperWrap=document.getElementById('editorPaperWrap');
  const rowsEl=document.getElementById('bdSpreadRows');
  const spreadsViewport=document.querySelector('.bd-spreads-viewport');
  const track=document.getElementById('bdTimelineTrack');
  const handle=document.getElementById('bdTimelineHandle');
  const fill=document.getElementById('bdTimelineFill');
  const designGrid=document.getElementById('bdDesignGrid');
  const formatGrid=document.getElementById('bdFormatGrid');
  const countEl=document.getElementById('bdSpreadCount');
  const buildBtn=document.getElementById('buildBookBtn');

  const previewBtn=document.getElementById('previewBtn');
  const pdfBtn=document.getElementById('pdfBtn');
  let previewModal=null;
  let previewSpread=null;
  let previewInfo=null;
  let previewClose=null;
  let previewPrev=null;
  let previewNext=null;
  let previewLayout=null;
  let previewLayoutPrev=null;
  let previewLayoutNext=null;

  // The manual picker is intentionally finite and mirrors the approved
  // composition list.  "auto" is the director's default state, not a
  // nineteenth composition: once the author opens the picker, every stop is
  // one of these eighteen deliberate layouts and can be traversed in either
  // direction.
  // «Сменить композицию» offers the book's own compositions: the choice is
  // stored on the photo and the director builds it for real (text flows,
  // nothing is cut, it survives closing the book).
  const PREVIEW_COMPOSITION_CATALOG=Object.freeze([
    {id:'auto',label:'Как выберет книга'},
    {id:'single',label:'Текст и большое фото'},
    {id:'two',label:'Текст и два фото'},
    {id:'three',label:'Текст и три фото'},
    {id:'panorama',label:'Фото на весь разворот'},
    {id:'hspread',label:'Фото сверху через разворот — текст снизу'},
    {id:'t06',label:'Главное фото и пара снимков над текстом'},
    {id:'t07',label:'Текст и сетка фото'},
    {id:'t08',label:'Вертикальное фото у сгиба и пауза'},
    {id:'t10',label:'Фото с карточкой'},
    {id:'t12',label:'Текст поверх фото'},
    {id:'p01',label:'Портрет героя · светлый или тёмный — стрелками сверху'},
    {id:'closing3',label:'Две фото на странице и одно большое'},
    {id:'photoquote',label:'Фото и цитата из главы'},
    {id:'rail',label:'Фото на полтора листа — текст сбоку'},
    {id:'overlay',label:'Белый текст поверх фото'},
    {id:'fade',label:'Текст на светлом, растворённом фото'},
    {id:'darkgrad',label:'Тёмный градиент: фото и текст через разворот'},
    {id:'darkside',label:'Фото уходит в тёмный лист с текстом'},
    {id:'darkfade',label:'Тёмная виньетка и тёмный лист с текстом'},
    {id:'darkpair',label:'Тёмная пара: текст и фото на каждом листе'},
    {id:'textphotos',label:'Заголовок, текст и фото снизу'},
    {id:'pair',label:'Две большие фотографии'},
    {id:'mosaic',label:'Текст и мозаика фото'},
    {id:'quoteband',label:'Две фотографии под цитатой'}
  ]);

  function initPreviewDom(){
    previewModal=document.getElementById('bookPreviewModal');
    previewSpread=document.getElementById('bookPreviewSpread');
    previewInfo=document.getElementById('bookPreviewInfo');
    previewClose=document.getElementById('bookPreviewClose');
    previewPrev=document.getElementById('bookPreviewPrev');
    previewNext=document.getElementById('bookPreviewNext');
    previewLayout=document.getElementById('bookPreviewLayout');
    previewLayoutPrev=document.getElementById('bookPreviewLayoutPrev');
    previewLayoutNext=document.getElementById('bookPreviewLayoutNext');
    // The preview markup is outside this controller's initial DOM scope in
    // some constructor builds. Bind after lookup and only once, so the arrows
    // and composition keys remain live after every modal reopen.
    const bind=(el,handler)=>{
      if(!el||el.dataset.previewBound==='1')return;
      el.dataset.previewBound='1';
      el.addEventListener('click',handler);
    };
    bind(previewClose,e=>{e.preventDefault();e.stopPropagation();closePreview();});
    bind(previewPrev,e=>{e.preventDefault();e.stopPropagation();previewGo(-1);});
    bind(previewNext,e=>{e.preventDefault();e.stopPropagation();previewGo(1);});
    bind(previewLayout,e=>{e.preventDefault();e.stopPropagation();toggleCompositionMenu();});
    bind(previewLayoutPrev,e=>{e.preventDefault();e.stopPropagation();changePreviewComposition(-1);});
    bind(previewLayoutNext,e=>{e.preventDefault();e.stopPropagation();changePreviewComposition(1);});
    initPhotoFraming();
  }

  // Block 2: the author moves a photo inside its frame (drag), enlarges it
  // (+ / −) or returns it to the book's own framing («Как было», or a double
  // click). Only the framing changes: no rebuild, the text is untouched.
  let frameTools=null,frameTarget=null,frameHideTimer=0,frameSaveTimer=0,frameDrag=null;
  const frameNum=value=>value==null||value===''?NaN:Number(value);
  function framePhotos(id){
    const out=[];
    for(const section of structure?.sections||[])for(const page of section.pages||[])for(const photo of page.photos||[])if(String(photo?.id||'')===id)out.push(photo);
    for(const sp of bookSpreads)for(const page of [sp.left,sp.right])for(const photo of page?.source?.photos||[])if(String(photo?.id||'')===id&&!out.includes(photo))out.push(photo);
    return out;
  }
  function frameOf(id){
    const photo=framePhotos(id)[0]||{};
    const x=frameNum(photo.frameX),y=frameNum(photo.frameY);
    return {x:Number.isFinite(x)?x:50,y:Number.isFinite(y)?y:50,zoom:Math.min(3,Math.max(1,Number(photo.frameZoom)||1))};
  }
  function applyFrame(id,frame,save=true){
    for(const photo of framePhotos(id)){
      if(frame){photo.frameX=frame.x;photo.frameY=frame.y;photo.frameZoom=frame.zoom;}
      else{delete photo.frameX;delete photo.frameY;delete photo.frameZoom;}
    }
    // the old book's spread and the book on the desk (and the leaf turning over it) show the same framing
    document.querySelectorAll(`:is(#bookPreviewSpread,.bk-board .bk-spread,.bq-curl.bk-curl) img[data-frame-photo="${CSS.escape(id)}"]`).forEach(img=>{
      img.style.removeProperty('object-position');img.style.removeProperty('transform');img.style.removeProperty('transform-origin');
      if(!frame)return;
      img.style.setProperty('object-position',`${frame.x}% ${frame.y}%`,'important');
      if(frame.zoom>1){img.style.setProperty('transform',`scale(${frame.zoom})`,'important');img.style.setProperty('transform-origin',`${frame.x}% ${frame.y}%`,'important');}
      const holder=img.parentElement;if(holder&&frame.zoom>1)holder.style.setProperty('overflow','hidden','important');
    });
    if(!save)return;
    // The arc's small copy of this spread shows the new framing too.
    clearTimeout(applyFrame.arc);applyFrame.arc=setTimeout(()=>{window.__ocherkiArcRefresh?.(activeSpread);try{dispatchEvent(new CustomEvent('ocherki-photo-framed',{detail:{id}}));}catch(_){}},300);
    clearTimeout(frameSaveTimer);
    frameSaveTimer=setTimeout(()=>{
      const frame2=frame?frameOf(id):null;
      const sheet=document.getElementById('v35SheetFrame');
      try{sheet?.contentWindow?.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',action:'setPhotoFrame',photoId:id,reset:!frame2,frameX:frame2?.x,frameY:frame2?.y,frameZoom:frame2?.zoom},'*');}catch(_){}
    },350);
  }
  function placeFrameTools(img){
    if(!frameTools)return;
    const box=(img.closest('figure,span,.dpk-x-bg')||img).getBoundingClientRect(),page=img.closest('.dpk-page')?.getBoundingClientRect()||box;
    const left=Math.max(page.left+8,Math.min(box.right,page.right)-frameTools.offsetWidth-10),top=Math.max(page.top+8,Math.max(box.top,page.top)+10);
    frameTools.style.left=Math.round(left)+'px';frameTools.style.top=Math.round(top)+'px';
  }
  function showFrameTools(img){
    clearTimeout(frameHideTimer);
    frameTarget=img;frameTools.hidden=false;frameTools.style.zIndex=img.closest('.bk-board')?'2147483090':'';placeFrameTools(img);
  }
  function hideFrameTools(delay=500){
    clearTimeout(frameHideTimer);
    frameHideTimer=setTimeout(()=>{if(!frameDrag&&!frameTools.matches(':hover')){frameTools.hidden=true;frameTarget=null;}},delay);
  }
  function initPhotoFraming(root=previewSpread){
    if(!root||root.dataset.frameBound==='1')return;
    root.dataset.frameBound='1';const previewSpread=root;
    if(!frameTools){frameTools=document.createElement('div');
    frameTools.className='photo-frame-tools';frameTools.hidden=true;
    frameTools.innerHTML='<span class="pft-hint">Потяните фото, чтобы сдвинуть</span><button type="button" data-frame="out" title="Уменьшить">−</button><button type="button" data-frame="in" title="Увеличить">+</button><button type="button" data-frame="reset" title="Вернуть как было">Как было</button>';
    document.body.appendChild(frameTools);
    frameTools.addEventListener('mouseleave',()=>hideFrameTools());
    frameTools.addEventListener('click',event=>{
      const button=event.target.closest('[data-frame]');if(!button||!frameTarget)return;
      event.preventDefault();event.stopPropagation();
      const id=frameTarget.dataset.framePhoto,frame=frameOf(id),kind=button.dataset.frame;
      if(kind==='reset'){applyFrame(id,null);return;}
      frame.zoom=Math.round(Math.min(3,Math.max(1,frame.zoom+(kind==='in'?.15:-.15)))*100)/100;
      applyFrame(id,frame);
    });}
    const pick=event=>{const img=event.target.closest?.('img[data-frame-photo]');return img&&img.dataset.framePhoto?img:null;};
    previewSpread.addEventListener('mouseover',event=>{const img=pick(event);if(img)showFrameTools(img);});
    previewSpread.addEventListener('mouseout',event=>{if(pick(event))hideFrameTools();});
    previewSpread.addEventListener('pointerdown',event=>{
      const img=pick(event);if(!img||event.button!==0)return;
      event.preventDefault();event.stopPropagation();
      const id=img.dataset.framePhoto,frame=frameOf(id);
      // Screen pixels to percent: the cropped-away part of the photo (plus
      // what the enlargement adds) is what a drag can travel across.
      const rect=img.getBoundingClientRect(),w=rect.width/frame.zoom,h=rect.height/frame.zoom;
      const nw=img.naturalWidth||w,nh=img.naturalHeight||h,cover=Math.max(w/nw,h/nh);
      const travelX=Math.max(40,nw*cover-w+w*(frame.zoom-1)),travelY=Math.max(40,nh*cover-h+h*(frame.zoom-1));
      frameDrag={id,img,startX:event.clientX,startY:event.clientY,frame,travelX,travelY,moved:false};
      img.setPointerCapture?.(event.pointerId);
      document.body.classList.add('is-framing-photo');
    });
    previewSpread.addEventListener('pointermove',event=>{
      if(!frameDrag)return;
      const dx=event.clientX-frameDrag.startX,dy=event.clientY-frameDrag.startY;
      if(Math.abs(dx)+Math.abs(dy)>2)frameDrag.moved=true;
      const next={x:Math.round(Math.min(100,Math.max(0,frameDrag.frame.x-dx*100/frameDrag.travelX))*10)/10,y:Math.round(Math.min(100,Math.max(0,frameDrag.frame.y-dy*100/frameDrag.travelY))*10)/10,zoom:frameDrag.frame.zoom};
      applyFrame(frameDrag.id,next,false);frameDrag.last=next;
    });
    const end=event=>{
      if(!frameDrag)return;
      const drag=frameDrag;frameDrag=null;document.body.classList.remove('is-framing-photo');
      if(drag.moved&&drag.last){applyFrame(drag.id,drag.last);event?.stopPropagation?.();}
    };
    previewSpread.addEventListener('pointerup',end);
    previewSpread.addEventListener('pointercancel',end);
    previewSpread.addEventListener('click',event=>{if(pick(event)){event.stopPropagation();}},true);
    previewSpread.addEventListener('dblclick',event=>{const img=pick(event);if(!img)return;event.preventDefault();event.stopPropagation();applyFrame(img.dataset.framePhoto,null);});
  }

  let structure=null;
  let bookPages=[];
  let bookSpreads=[];
  let activeSpread=0;
  let activeDesign='editorial';
  const READY_DESIGNS=new Set(['editorial']);
  let designAppliedFromConfig=false;
  /* The first control-book pass is composed in the approved 280 x 280 mm format. */
  let activeFormat='square';
  let built=false,partialBook=false;
  let buildMessage='';
  let pendingBuildRequest=false;
  let directorRebuildTimer=null;
  let directorContentFingerprint='';
  let revealSpreadsOnRender=false;
  let previewPendingTarget=null;
  let previewPinnedTarget=null;
  // A manual preview choice is rendered locally until the bridge has rebuilt
  // the book. Keeping it separate from the director's spread list prevents a
  // click on the composition key from jumping to the chapter opening.
  let previewCompositionOverride=null;
  let dots=[];

  // Active page/section flags are navigation state, not book content. Keep
  // them out of the director's rebuild key: selecting another sheet should
  // update the highlight only, never re-measure and recompose the whole book.
  // Keep the rebuild key cheap. Text and uploaded photos can be very large;
  // copying them into nested join() calls made a harmless navigation update
  // expensive even when the director did not need to rebuild anything.
  function fastFingerprint(value){
    const s=String(value??'');
    let h=2166136261;
    const step=Math.max(1,Math.floor(s.length/320));
    for(let i=0;i<s.length;i+=step)h=Math.imul(h^s.charCodeAt(i),16777619);
    return `${s.length}:${h>>>0}:${s.slice(0,18)}:${s.slice(-18)}`;
  }

  function contentFingerprint(st){
    return (st?.sections||[]).map(section=>[
      section.id,section.type,section.title,section.auto,section.included,
      (section.pages||[]).map(page=>[
        page.uid,page.id,page.type,page.title,page.episode,page.included,
        fastFingerprint(page.text),fastFingerprint(page.semanticHtml),page.quote,page.eraDate,page.dateLabel,
        page.dateMode,page.dateWatermark,page.bookRole,page.continuation,
        page.isEpisodeStart,page.dropCapPreference,page.explanation,
        page.openingLeftVariant,page.openingInitialText,page.importantLine,page.marginNote,page.inlineQuote,
        page.ctxHandwrittenNote,
        JSON.stringify(page.editorialOverrides||{}),
        (page.blocks||[]).map(block=>[block?.type,fastFingerprint(block?.content),block?.photoId,fastFingerprint(block?.src),block?.mode].join('\u001f')).join('\u001e'),
        (page.photos||[]).map(photo=>[
          fastFingerprint(photo.src||photo.dataUrl||photo.dataURL||photo.url||photo.preview||photo.objectUrl||''),
          photo.caption,photo.year,photo.place,photo.people,photo.story,
          photo.photoMode,photo.colorKind,photo.edgeTone,photo.rightTone,photo.layoutPreference,photo.portraitHero,photo.heroYears,photo.heroRole,photo.width,photo.height,photo.orientation,
          photo.focalX,photo.focalY,photo.focalConfirmed,photo.focalSource,photo.ctxHandwrittenNote,JSON.stringify(photo.detailRoi||photo.ctxRoi||photo.roi||null),JSON.stringify(photo.regions||null)
        ].join('\u001f')).join('\u001e')
      ].join('\u001f')).join('\u001e')
    ].join('\u001d')).join('\u001c');
  }

  function activeSourcePageUid(st){
    // The section being edited first (every section remembers its own
    // active page; the first one found used to win — the cover lost to the
    // dedication).
    const cur=st?.sections?.[st?.activeSection];
    const own=(cur?.pages||[]).find(candidate=>candidate?.active)||cur?.pages?.[0];
    if(own)return own.uid||own.id||'';
    for(const section of (st?.sections||[])){
      const page=(section.pages||[]).find(candidate=>candidate?.active);
      if(page)return page.uid||page.id||'';
    }
    return '';
  }

  // The spread that shows a manuscript sheet: its own page, or — when the
  // sheet's words run on from an earlier sheet — the page whose text range
  // holds the start of the sheet's words.
  // v97: where each sheet's words lie in its chapter's text (the book joins
  // the sheets of a chapter with a blank line), so a book page and a sheet
  // find each other by the words themselves.
  // v98: the book keeps the exact place of every sheet's words (runs); use it.
  function sheetOffsets(sectionId){
    for(const sp of bookSpreads)for(const pg of [sp?.left,sp?.right]){const runs=pg?.sectionId===sectionId&&pg.source?.runs;if(Array.isArray(runs)&&runs.length)return runs.filter(r=>r&&r.sourcePageUid&&r.end>r.start).map(r=>({uid:r.sourcePageUid,start:r.start,end:r.end}));}
    return sheetOffsetsApprox(sectionId);}
  function sheetOffsetsApprox(sectionId){const sec=(structure?.sections||[]).find(x=>x.id===sectionId);let off=0;const out=[];
    for(const p of sec?.pages||[]){if(p.included===false)continue;const t=String(p.text||'').replace(/\r/g,'').replace(/\n{3,}/g,'\n\n').trim();if(!t)continue;out.push({uid:p.uid||p.id,start:off,end:off+t.length});off+=t.length+2;}return out;}
  function sheetAtOffset(sectionId,o){let best='';for(const r of sheetOffsets(sectionId)){if(r.start<=o)best=r.uid;else break;}return best;}
  function photoSheetOf(pg){for(const i of pagePhotoIndexes(pg)){const uid=pg.source?.photos?.[i]?._sourcePageUid;if(uid)return uid;}return '';}
  // The sheet a spread shows most of: the middle of its words, else its photo.
  function sheetUidForSpread(i){const sp=bookSpreads[i];if(!sp)return null;
    const txt=[sp.left,sp.right].filter(pg=>pg&&pg.sourceRange&&pg.sectionId&&pg.sourceRange.end>pg.sourceRange.start);
    if(txt.length){const sid=txt[0].sectionId,same=txt.filter(pg=>pg.sectionId===sid);const a=same[0].sourceRange.start,b=same[same.length-1].sourceRange.end;const uid=sheetAtOffset(sid,Math.round((a+b)/2));if(uid)return {sectionId:sid,pageUid:uid};}
    for(const pg of [sp.left,sp.right]){if(!pg)continue;const uid=photoSheetOf(pg)||pg.sourcePageUid||'';if(uid&&pg.sectionId)return {sectionId:pg.sectionId,pageUid:uid};}
    return null;}
  // v98: how far into the open sheet the author is (the caret, else the
  // first paragraph in sight), 0…1 — the book opens on that very spread.
  window.__ocherkiEditorRatio=()=>{try{const w=document.getElementById('v35SheetFrame')?.contentWindow,d=w?.document,ed=d?.getElementById('editor');if(!ed)return -1;
    const total=ed.textContent.length;if(!total)return 0;const sel=w.getSelection();
    if(sel?.rangeCount&&ed.contains(sel.anchorNode)){const r=d.createRange();r.selectNodeContents(ed);r.setEnd(sel.anchorNode,sel.anchorOffset);return Math.min(1,r.toString().length/total);}
    const box=(ed.closest('.editor-scroll,.page,.paper')||ed.parentElement||ed).getBoundingClientRect();let before=0;
    for(const n of ed.childNodes){const rr=n.nodeType===1?n.getBoundingClientRect():null;if(rr&&rr.bottom>box.top+8)break;before+=(n.textContent||'').length;}
    return Math.min(1,before/total);}catch(_){return -1;}};
  window.__ocherkiSheetForSpread=i=>{for(let k=i;k>=0;k--){const t=sheetUidForSpread(k);if(t)return t;}return null;};
  function spreadIndexForUid(uid){
    window.__ocherkiSpreadSide='';
    if(!uid||!bookSpreads.length)return -1;
    {// By the words: the spread whose pages hold the start of the sheet's words.
      const sec=(structure?.sections||[]).find(x=>(x.pages||[]).some(p=>(p.uid||p.id)===uid));const r=sec&&sheetOffsets(sec.id).find(x=>x.uid===uid);
      if(r){const o=Math.min(r.end,r.start+40);let hit=-1;bookSpreads.forEach((sp,i)=>{if(hit>=0)return;for(const pg of [sp?.left,sp?.right]){if(pg?.sectionId===sec.id&&pg.sourceRange&&pg.sourceRange.start<=o&&o<pg.sourceRange.end){hit=i;window.__ocherkiSpreadSide=pg===sp.left?'left':'right';return;}}});if(hit>=0)return hit;}}
    let at=bookSpreads.findIndex(sp=>[sp?.left,sp?.right].some(pg=>pg&&(pg.sourcePageUid===uid||pg.source?.uid===uid)));
    let best=-1;
    bookSpreads.forEach((sp,i)=>{if(best>=0)return;for(const pg of [sp?.left,sp?.right]){const segs=pg?.source?.segments;if(!segs||!pg.sourceRange)continue;
      let off=0,found=-1;for(const seg of segs){const t=String(seg.text||'');if(seg.sourcePageUid===uid){found=off;break;}if(t)off+=t.length+2;}
      if(found>=0&&pg.sourceRange.start<=found&&found<pg.sourceRange.end){best=i;window.__ocherkiSpreadSide=pg===sp.left?'left':'right';return;}}});
    if(best<0&&at<0){
      // A sheet whose words begin inside a book page that started on an
      // earlier sheet: the book page that holds it is the last one that
      // began on this sheet or on one before it in the same chapter.
      const sec=(structure?.sections||[]).find(x=>(x.pages||[]).some(p=>(p.uid||p.id)===uid));
      const order=(sec?.pages||[]).map(p=>p.uid||p.id),want=order.indexOf(uid);
      if(want>=0)bookSpreads.forEach((sp,i)=>{for(const pg of [sp?.left,sp?.right]){const k=order.indexOf(pg?.sourcePageUid||pg?.source?.uid||'');if(k>=0&&k<=want){best=i;window.__ocherkiSpreadSide=pg===sp.left?'left':'right';}}});
    }
    if(best<0&&at>=0){const sp=bookSpreads[at];window.__ocherkiSpreadSide=(sp?.left&&(sp.left.sourcePageUid===uid||sp.left.source?.uid===uid))?'left':'right';}
    return best>=0?best:at;
  }
  window.__ocherkiSpreadForUid=spreadIndexForUid;
  function syncActiveSpreadUid(uid){
    if(!built||!bookSpreads.length)return;
    if(!uid)return;
    // During a manual composition change the iframe may briefly echo the old
    // active page. Keep the chosen photo's spread pinned until the rebuild
    // has located it again.
    if(previewPinnedTarget&&previewModal?.classList.contains('open'))return;
    const next=spreadIndexForUid(uid);
    if(next<0||next===activeSpread)return;
    previewCompositionOverride=null;
    activeSpread=next;
    renderActiveOnly({animate:false});
  }

  function syncActiveSpreadFromStructure(st){
    if(previewModal?.classList.contains('open'))return;
    syncActiveSpreadUid(activeSourcePageUid(st));
  }

  function spreadPageList(sp){
    if(!sp)return [];
    return sp.single ? [sp.single==='right'?sp.right:sp.left] : [sp.left,sp.right];
  }

  // Every photo a page shows: its own photo(s), and the photos the director
  // sets into a text page (on top, at the side, under the text, behind it).
  // Compositions that keep the photo only inside a text page used to look
  // photo-less, and the composition keys locked on them for good.
  function pagePhotoIndexes(page){
    if(!page)return [];
    const out=[],add=value=>{if(Number.isInteger(value)&&!out.includes(value))out.push(value);};
    if(Array.isArray(page.photoIndices))page.photoIndices.forEach(add);else add(page.photoIndex);
    add(page.t10?.main?.index);add(page.t10?.card?.index);
    [page.topPhoto,page.railPhoto,page.bgPhoto,page.sidePhoto,page.spinePhoto].forEach(item=>add(item?.photoIndex));
    (page.bottomPhotos?.photoIndices||[]).forEach(add);(page.topPair?.photoIndices||[]).forEach(add);
    return out;
  }
  window.__ocherkiPagePhotoIndexes=pagePhotoIndexes;

  function spreadPhotoPage(sp){
    return spreadPageList(sp).find(page=>{
      if(!page||!Array.isArray(page.source?.photos))return false;
      return pagePhotoIndexes(page).some(index=>page.source.photos[index]);
    });
  }

  // The photo the spread's composition belongs to: the one the author gave a
  // composition to (it may stand on either page, e.g. the big photo of T06
  // after the small pair), else the first photo of the spread.
  function spreadPhotoRefs(sp){
    const refs=[];
    spreadPageList(sp).forEach(page=>{if(!page||!Array.isArray(page.source?.photos))return;
      pagePhotoIndexes(page).forEach(photoIndex=>{const photo=page.source.photos[photoIndex];if(photo&&!refs.some(ref=>ref.photo===photo))refs.push({page,photoIndex,photo});});});
    return refs;
  }
  function spreadPhotoRef(sp){
    const refs=spreadPhotoRefs(sp);
    const own=ref=>String(ref.photo.layoutPreference||'auto').toLowerCase();
    return refs.find(ref=>own(ref)===String(sp?.beat||'').toLowerCase())||refs.find(ref=>own(ref)!=='auto')||refs[0]||null;
  }

  function locatePreviewTarget(target){
    if(!target)return -1;
    return bookSpreads.findIndex(sp=>spreadPageList(sp).some(page=>{
      if(!page||!Array.isArray(page.source?.photos))return false;
      const indexes=pagePhotoIndexes(page);
      return indexes.some(index=>{
        const photo=page.source.photos[index];
        if(!photo)return false;
        const sameSection=!target.sectionId||String(page.sectionId||'')===String(target.sectionId);
        const samePhotoId=target.photoId && photo.id && sameSection && String(photo.id)===String(target.photoId);
        const sameSource=target.pageUid && sameSection && String(page.sourcePageUid||'')===String(target.pageUid);
        const sameIndex=Number(index)===Number(target.photoIndex);
        return samePhotoId || (sameSource && sameIndex);
      });
    }));
  }

  function applyPendingPreviewTarget(){
    const target=previewPendingTarget||previewPinnedTarget;
    if(!target)return;
    const targetIndex=locatePreviewTarget(target);
    if(targetIndex>=0){
      activeSpread=targetIndex;
      previewPendingTarget=null;
    }
  }

  function compositionSignature(sp){
    const master=String(sp?.master||'').toUpperCase();
    const photoPages=spreadPageList(sp).filter(page=>spreadPhotoPage({left:page,right:null}));
    if(!photoPages.length)return '';
    const visual=/PHOTO|PANORAMA|COLLAGE|MOSAIC|TRIPTYCH|THREE|TWO|BLEED|OVERLAY|GRADIENT|SPLIT|RAIL|LARGE|DUO|STACKED/.test(master);
    const textOnly=!visual && /TEXT|QUOTE|CHAPTER|INTRO|TITLE|CONTENTS|EPIGRAPH|DEDICATION|FINAL|COLOPHON|ENDPAPER|COVER|DOCUMENT/.test(master);
    if(textOnly)return '';
    return master;
  }

  function rhythmViolations(){
    const violations=[];
    for(let i=1;i<bookSpreads.length;i++){
      const previous=compositionSignature(bookSpreads[i-1]);
      const current=compositionSignature(bookSpreads[i]);
      if(previous && previous===current)violations.push([i-1,i]);
    }
    return violations;
  }

  function updateRhythmWarning(){
    const warning=document.getElementById('bookRhythmWarning');
    const text=document.getElementById('bookRhythmWarningText');
    if(!warning)return;
    // The book's director already never repeats a composition on adjacent
    // spreads; the old manual «Сменить» forced a heavy rebuild inside the
    // preview and could hang it, so the warning is no longer shown.
    warning.hidden=true;warning.classList.remove('is-visible');
    if(true)return;
    const violation=rhythmViolations().find(pair=>pair.includes(activeSpread));
    if(!violation){
      warning.hidden=true;
      warning.classList.remove('is-visible');
      return;
    }
    const name=previewCompositionLabel(bookSpreads[activeSpread]);
    if(text)text.textContent=`Одинаковая композиция подряд: ${name}. Можно сменить композицию этого разворота.`;
    warning.hidden=false;
    warning.classList.add('is-visible');
  }

  function previewCompositionLabel(sp){
    const override=previewCompositionOverride;
    if(override&&locatePreviewTarget(override.target)===activeSpread){
      const selected=PREVIEW_COMPOSITION_CATALOG.find(item=>item.id===override.id);
      if(selected)return selected.label;
    }
    // The director's own choice is kept on the spread; the author's choice wins.
    const ref=spreadPhotoRef(sp);
    // What really stands on the spread: the director's beat; a spread with no
    // beat (chapter opening, closing photos) is named by its kind.
    const raw=String(sp?.beat||'').toLowerCase();
    const item=PREVIEW_COMPOSITION_CATALOG.find(candidate=>candidate.id===raw ||
      (candidate.id==='photo-rail'&&['photo-rail-left','photo-rail-right'].includes(raw)));
    if(item)return item.label;
    const byMaster={
      'D01-SPREAD-CHAPTER':'Открытие главы',
      'D01-SPREAD-PANORAMA':'Фото на весь разворот',
      'D01-SPREAD-PHOTO-RAIL':'Фото на 1,5 листа — текст сбоку',
      'D01-SPREAD-DUO':'Две фотографии на одном листе',
      'D01-SPREAD-THREE-PHOTO':'Три фотографии',
      'D01-SPREAD-MOSAIC':'Мозаика',
      'D01-SPREAD-DARK-GRADIENT-PHOTO':'Тёмный градиент — фото и текст',
      'D01-SPREAD-POST-OPENING-CTX':'Фото с деталью после открытия главы',
      'D01-SPREAD-DARK-FADE-2.2':'DARK FADE 2.2',
      'D01-SPREAD-PHOTO-GRADIENT-TEXT':'Светлый градиент — фото и текст',
      'D01-SPREAD-DARK-SPLIT':'Тёмный лист — фото и текст',
      'D01-SPREAD-DARK-PHOTO-PAIR':'Тёмная пара фотографий',
      'D01-SPREAD-PHOTO-OVERLAY-TEXT':'Фото с текстом поверх',
      'D01-SPREAD-PHOTO-OVER-TEXT':'Фото сверху — текст снизу',
      'D01-SPREAD-TEXT-OVER-PHOTO':'Текст сверху — фото снизу',
      'D01-SPREAD-PHOTO-SIDE-TEXT':'Фото сбоку — текст сбоку',
      'D01-SPREAD-PHOTO-TEXT':'Фото и текст'
    };
    return byMaster[String(sp?.master||'')]||'Фото-композиция';
  }

  function previewTextSource(sp,ref){
    const pages=spreadPageList(sp);
    const textPage=pages.find(page=>page&&String(page.text||'').trim()&&
      !Number.isInteger(page.photoIndex)&&!Array.isArray(page.photoIndices))||ref?.page;
    const source=ref?.page?.source||{};
    const segment=ref?.page?.sourcePageUid&&Array.isArray(source.segments)
      ?source.segments.find(item=>String(item?.sourcePageUid||'')===String(ref.page.sourcePageUid))
      :null;
    const text=safeText(textPage?.text||ref?.page?.text||segment?.text||source.text||'',16000);
    const title=textPage?.sectionTitle||textPage?.title||ref?.page?.title||source.title||ref?.page?.episode||'';
    const episode=textPage?.episode||ref?.page?.episode||source.episode||'Семейная история';
    const quote=textPage?.pullQuote||ref?.page?.pullQuote||textPage?.quote||ref?.page?.quote||
      (typeof quoteFrom==='function'?quoteFrom(source):'')||'';
    return {page:textPage||ref?.page,source,text,title,episode,quote};
  }

  function previewAccentSourcePage(field){
    const host=field?.closest?.('.book-preview-half,.bd-page-mini');
    const sectionId=field?.dataset.editorialSourceSection||host?.dataset.section||'';
    const pageUid=field?.dataset.editorialSource||host?.dataset.source||'';
    const section=(structure?.sections||[]).find(item=>String(item?.id||'')===String(sectionId));
    const page=(section?.pages||[]).find(item=>String(item?.uid||item?.id||'')===String(pageUid));
    return {section,page,sectionId,pageUid};
  }

  // At most one line break, no empty lines, no spaces at the ends.
  function previewAccentText(field){
    return String(field?.innerText ?? field?.textContent ?? '').replace(/[ \t]*\n[\s]*/g,'\n').trim();
  }

  function previewAccentWordCount(value){
    return [...new Intl.Segmenter('ru',{granularity:'word'}).segment(String(value||''))].filter(item=>item.isWordLike).length;
  }

  function previewAccentFits(field,kind){
    if(!['margin','inline-quote'].includes(kind))return true;
    const style=getComputedStyle(field),leading=parseFloat(style.lineHeight);
    if(!(leading>0))return false;
    // The margin note is rotated after layout. Measuring scrollWidth/clientWidth
    // on that transformed editable span made Chromium reject the second visual
    // line after only a couple of words. Measure the same text in an unrotated,
    // off-screen box with the logical pre-transform width instead.
    const probe=document.createElement('div');
    const logicalWidth=Math.max(1,field.clientWidth||parseFloat(style.width)||field.parentElement?.clientHeight||1);
    probe.textContent=previewAccentText(field);
    probe.style.cssText=`position:fixed;left:-100000px;top:0;visibility:hidden;pointer-events:none;z-index:-1;box-sizing:border-box;width:${logicalWidth}px;height:auto;max-height:none;overflow:visible;transform:none;white-space:${kind==='margin'?'pre-wrap':style.whiteSpace};word-break:${style.wordBreak};overflow-wrap:${style.overflowWrap};font:${style.font};font-family:${style.fontFamily};font-size:${style.fontSize};font-weight:${style.fontWeight};font-style:${style.fontStyle};line-height:${style.lineHeight};letter-spacing:${style.letterSpacing};padding:${style.padding};border:0;margin:0;text-indent:0;`;
    document.body.appendChild(probe);
    const lines=Math.max(1,Math.ceil(probe.scrollHeight/leading-.01));
    const fits=lines<=2&&probe.scrollWidth<=logicalWidth+.75;
    probe.remove();
    return fits;
  }

  function restorePreviewAccent(field){
    field.textContent=field.dataset.editorialLastValidText||'';
    const selection=getSelection(),range=document.createRange();
    range.selectNodeContents(field);range.collapse(false);
    selection.removeAllRanges();selection.addRange(range);
  }

  function commitPreviewAccent(field){
    if(!field||field.dataset.editorialCommitted==='1')return;
    const key=String(field.dataset.editorialKey||'').trim();
    const kind=String(field.dataset.editorialAccent||'').trim().toLowerCase();
    if(!key||!['important','margin','inline-quote','ctx-handwritten'].includes(kind))return;
    const {page,sectionId,pageUid}=previewAccentSourcePage(field);
    if(!page||!sectionId||!pageUid)return;
    const value=previewAccentText(field);
    // No blocking dialogs: a text that does not fit was already held back
    // while typing; anything else is simply saved.
    if(!previewAccentFits(field,kind)){field.dataset.editorialCommitted='1';restorePreviewAccent(field);return;}
    if(!page.editorialOverrides||typeof page.editorialOverrides!=='object'||Array.isArray(page.editorialOverrides)) page.editorialOverrides={};
    // An emptied margin note means «no note on this page» («∅»), not «let
    // the book pick another one».
    const stored=kind==='margin'&&!value?'∅':value;
    if(stored) page.editorialOverrides[key]=stored;
    else delete page.editorialOverrides[key];
    if(kind==='ctx-handwritten')page.ctxHandwrittenNote=value;
    field.dataset.editorialCommitted='1';
    if(kind==='margin'){
      // A margin note lies in the margin and moves no text: it is saved and
      // shown at once, without rebuilding the book (a rebuild used to move
      // the preview to another spread and could drop notes).
      bookSpreads.forEach(sp=>['left','right'].forEach(side=>{const pg=sp?.[side];if(pg&&pg.editorialOverrideKey&&String(pg.sourcePageUid||pg.editorialSourcePageUid||'')===String(pageUid)&&(key===pg.editorialOverrideKey||key===`${pg.editorialOverrideKey}:margin`))pg.marginNote=value;}));
      directorContentFingerprint=contentFingerprint(structure);
      send({action:'setEditorialAccent',sectionId,pageUid,kind,overrideKey:key,text:stored});
      field.dataset.editorialLastValidText=value;
      return;
    }
    // A manual editorial change is a data change, not a visual translation.
    // Rebuild immediately through the same DOM pagination engine so a longer
    // or shorter quote/note gives space back to the surrounding text.
    directorContentFingerprint=contentFingerprint(structure);
    send({action:'setEditorialAccent',sectionId,pageUid,kind,overrideKey:key,text:value});
    performBuild();
  }

  function bindPreviewAccentEditors(){
    if(!previewSpread)return;
    previewSpread.querySelectorAll('[data-editorial-accent]').forEach(field=>{
      // Handwritten lines inside the text are chosen by the book itself;
      // only quotes and margin notes are corrected here.
      if(field.dataset.editorialAccent==='important'){field.removeAttribute('contenteditable');return;}
      if(field.dataset.editorialBound==='1')return;
      field.dataset.editorialBound='1';
      field.setAttribute('contenteditable','true');
      field.setAttribute('spellcheck','true');
      field.dataset.editorialLastValidText=previewAccentText(field);
      const label=field.dataset.editorialAccent==='important'?'Важная строка':field.dataset.editorialAccent==='margin'?'Заметка на внешнем поле':field.dataset.editorialAccent==='ctx-handwritten'?'Рукописный акцент CTX':'Цитата внутри повествования';
      field.setAttribute('aria-label',`${label}. Нажмите, чтобы исправить`);
      field.addEventListener('click',event=>event.stopPropagation());
      // Every new edit of the same note is saved again.
      field.addEventListener('focus',()=>{field.dataset.editorialCommitted='0';field.dataset.editorialLastValidText=previewAccentText(field);});
      field.addEventListener('input',()=>{
        const kind=String(field.dataset.editorialAccent||'').trim().toLowerCase();
        if(['margin','inline-quote'].includes(kind)&&!previewAccentFits(field,kind)){
          restorePreviewAccent(field);
          field.setAttribute('aria-invalid','true');
          field.title=kind==='margin'?'Максимум две строки заметки':'Максимум две строки цитаты';
          return;
        }
        field.removeAttribute('aria-invalid');
        field.dataset.editorialLastValidText=previewAccentText(field);
      });
      field.addEventListener('keydown',event=>{
        if(event.key==='Enter'){
          event.preventDefault();
          field.blur();
        }
        if(event.key==='Escape'){
          event.preventDefault();
          field.dataset.editorialCommitted='1';
          previewRender();
        }
      });
      field.addEventListener('blur',()=>commitPreviewAccent(field));
    });
  }

  function previewCompositionPages(sp,id){
    const ref=spreadPhotoRef(sp);
    if(!ref||!ref.page?.source)return null;
    const base=previewTextSource(sp,ref);
    const source=base.source;
    const photos=Array.isArray(source.photos)?source.photos:[];
    if(!photos.length)return null;
    const start=Number.isInteger(ref.photoIndex)?ref.photoIndex:0;
    const photoIndexes=count=>Array.from({length:count},(_,index)=>(start+index)%photos.length);
    const common={
      sectionId:sp.sectionId||ref.page.sectionId,
      sourcePageUid:base.page?.sourcePageUid||ref.page.sourcePageUid||'',
      source,title:base.title,episode:base.episode,text:base.text,
      sectionTitle:base.page?.sectionTitle||'',pageNo:ref.page.pageNo||base.page?.pageNo||0
    };
    const photo=(layout,index,extra={})=>Object.assign({},common,{kind:layout,layout,photoIndex:index},extra);
    const prose=(extra={})=>Object.assign({},common,{kind:'prose-dense',layout:'prose-dense',master:'D01-TEXT'},extra);
    const blank=()=>({kind:'blank',layout:'blank',master:'D01-ENDPAPER',sectionId:common.sectionId,source,title:base.title,episode:base.episode,pageNo:0,text:''});
    const pair=(left,right,master)=>({master,sectionId:common.sectionId,left,right:right||blank()});
    const idx=photoIndexes(1)[0];
    const two=photoIndexes(2),three=photoIndexes(3),five=photoIndexes(5);
    switch(id){
      case 'photo-top-text':
        return pair(photo('photo-over-text',idx),prose({text:''}),'D01-SPREAD-PHOTO-OVER-TEXT');
      case 'text-top-photo':
        return pair(photo('text-over-photo',idx),prose({text:''}),'D01-SPREAD-TEXT-OVER-PHOTO');
      case 'photo-side-text':
        return pair(photo('photo-side-text',idx),prose({text:''}),'D01-SPREAD-PHOTO-SIDE-TEXT');
      case 'photo-1p5-text':
      case 'photo-rail':{
        const railSide='right';
        const imagePage=photo('photo-rail-image',idx,{railSide});
        const textPage=photo('photo-rail-text',idx,{railSide,sourcePageUid:common.sourcePageUid,text:base.text,title:base.title,sectionTitle:base.page?.sectionTitle||''});
        return pair(imagePage,textPage,'D01-SPREAD-PHOTO-RAIL');
      }
      case 'spread':
        return pair(
          photo('panorama',idx,{panorama:true,panoramaSide:'left',hideCaption:true}),
          photo('panorama',idx,{panorama:true,panoramaSide:'right',hideCaption:true}),
          'D01-SPREAD-PANORAMA'
        );
      case 'spread-pair':
        return pair(photo('photo-fullspread',two[0]),photo('photo-fullspread',two[1]),'D01-SPREAD-TWO-PHOTO');
      case 'duo':
        return pair(photo('photo-duo',two[0],{photoIndices:two}),prose({text:''}),'D01-SPREAD-DUO');
      case 'triptych':
        return pair(photo('photo-triptych',three[0],{photoIndices:three}),prose({text:''}),'D01-SPREAD-THREE-PHOTO');
      case 'mosaic':
        return pair(photo('mosaic',five[0],{photoIndices:five}),prose({text:''}),'D01-SPREAD-MOSAIC');
      case 'quote-band-pair':
        return pair(
          photo('quote-band-photo',two[0],{quote:base.quote||base.title}),
          photo('quote-band-photo',two[1],{secondary:true}),
          'D01-SPREAD-QUOTE-BAND'
        );
      case 'photo-gradient-text':
        return pair(photo('photo-gradient-text',idx),prose({text:''}),'D01-SPREAD-PHOTO-GRADIENT-TEXT');
      case 'ctx-detail-sq':{
        const mainIndex=two[0],secondaryIndex=two[1],selected=base.source?.photos?.[mainIndex]||{},secondary=base.source?.photos?.[secondaryIndex]||{};
        const mainSrc=String(selected.src||selected.dataUrl||selected.url||''),secondarySrc=String(secondary.src||secondary.dataUrl||secondary.url||'');
        const ratio=Number(selected.width)>0&&Number(selected.height)>0?Number(selected.width)/Number(selected.height):1;
        const state=String(selected.ctxState||(ratio<.82?'V':ratio>1.22?'H':'S')).toUpperCase();
        const different=photos.length>1&&mainIndex!==secondaryIndex&&mainSrc&&secondarySrc&&mainSrc!==secondarySrc;
        const note=String(selected.ctxHandwrittenNote||base.page?.ctxHandwrittenNote||base.page?.importantLine||selected.caption||base.title||'').trim();
        if(!mainSrc||!different&&!note)return pair(prose({text:base.text}),blank(),'D01-SPREAD-TEXT');
        return pair(prose({text:base.text}),photo('ctx-detail-sq',mainIndex,{master:'D01-CTX-DETAIL-SQ',ctxState:state,secondaryPhotoIndex:different?secondaryIndex:null,mainPhotoAssetId:String(selected.id||mainSrc),secondaryPhotoAssetId:different?String(secondary.id||secondarySrc):null,ctxAccentType:different?'secondary-photo':'handwritten-note',ctxHandwrittenNote:different?'':note,editorialAccentEditable:!different}),'D01-SPREAD-POST-OPENING-CTX');
      }
      case 'dark-fade-2.2':{
        const selected=base.source?.photos?.[idx]||{};
        const ratio=Number(selected.width)>0&&Number(selected.height)>0?Number(selected.width)/Number(selected.height):1;
        const state=String(selected.darkFadeState||(ratio<.82?'V':ratio>1.22?'H':'S')).toUpperCase();
        return pair(photo('dark-fade-2.2',idx,{master:'D01-DARK-FADE-2.2',kind:'dark-fade',darkFadeState:state,darkFadeSide:'left'}),photo('dark-fade-2.2',idx,{master:'D01-DARK-FADE-2.2',kind:'dark-fade',darkFadeState:state,darkFadeSide:'right'}),'D01-SPREAD-DARK-FADE-2.2');
      }
      case 'dark-gradient-photo':
        return pair(photo('dark-gradient-photo',idx),prose({kind:'dark-text',layout:'dark-text',master:'D01-DARK-TEXT',text:base.text}),'D01-SPREAD-DARK-GRADIENT-PHOTO');
      case 'dark-split':
        return pair(photo('dark-split',idx),prose({kind:'dark-text',layout:'dark-text',master:'D01-DARK-TEXT',text:''}),'D01-SPREAD-DARK-SPLIT');
      case 'dark-photo-pair':
        return pair(photo('dark-split',two[0]),photo('dark-split',two[1],{text:''}),'D01-SPREAD-DARK-PHOTO-PAIR');
      case 'photo-overlay-text':
        return pair(photo('photo-overlay-text',idx),prose({text:''}),'D01-SPREAD-PHOTO-OVERLAY-TEXT');
      case 'large-photo':
        return pair(photo('photo-fullspread',idx),blank(),'D01-SPREAD-LARGE-PHOTO');
      case 'text-quote':
        return pair(
          prose({kind:'text-quote',layout:'prose-dense',master:'D01-TEXT-QUOTE',pullQuote:base.quote||base.title,text:base.text}),
          prose({text:''}),
          'D01-SPREAD-TEXT-QUOTE'
        );
      default:return null;
    }
  }

  function renderPreviewCompositionOverride(sp,id){
    const composition=previewCompositionPages(sp,id);
    if(!composition)return null;
    const left=composition.left,right=composition.right||null;
    return {
      composition,
      html:`${pageCanvasHost(left,'left','preview')}${right?pageCanvasHost(right,'right','preview'):''}`
    };
  }

  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const send=payload=>{try{frame?.contentWindow?.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',...payload},'*')}catch(_){}};

  function position(){
    if(!panel||!paperWrap)return;
    const r=paperWrap.getBoundingClientRect();
    panel.style.right=Math.round(Math.max(22,Math.min(48,innerWidth*.025)))+'px';
    panel.style.top=Math.round(Math.max(142,r.top+26))+'px';
  }

  function sourceUnits(st){
    const out=[];
    (st?.sections||[]).forEach((sec,si)=>{
      if(sec.included===false)return;
      (sec.pages||[]).forEach((p,pi)=>{
        if(p.included===false)return;
        out.push({
          sectionId:sec.id,
          sectionTitle:sec.title||'',
          sourcePageUid:p.uid,
          title:p.title||sec.title||'Лист',
          episode:p.episode||'',
          type:p.type||sec.type||'text',
          text:String(p.text||''),
          semanticHtml:String(p.semanticHtml||''),
          photos:Array.isArray(p.photos)?p.photos:[],
          photoCount:Number(p.photoCount)||0,
          wordCount:Number(p.wordCount)||0,
          userEdited:!!p.userEdited,
          isEpisodeStart:p.isEpisodeStart===true,
          openingLeftVariant:String(p.openingLeftVariant||p.chapterOpeningVariant||'').trim().toLowerCase(),
          openingInitialText:String(p.openingInitialText||p.initialText||'').trim(),
          importantLine:String(p.importantLine||p.emphasis||p.important||'').trim(),
          marginNote:String(p.marginNote||p.outerNote||p.margin||'').trim(),
          inlineQuote:String(p.inlineQuote||p.narrativeQuote||'').trim(),
          editorialOverrides:p.editorialOverrides&&typeof p.editorialOverrides==='object'?Object.assign({},p.editorialOverrides):{},
          bookRole:String(p.bookRole||'auto'),
          active:!!p.active,
          isFirstInSection:pi===0,
          sectionIndex:si,
          pageIndex:pi
        });
      });
    });
    return out;
  }

  function cleanSemanticText(value){
    return String(value||'').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/gi,' ')
      .replace(/&quot;|&#34;/gi,'"').replace(/&laquo;|&raquo;|[«»]/gi,' ')
      .replace(/[^\p{L}\p{N}\s.,:;!?—–()"'-]/gu,' ').replace(/\s+/g,' ').trim();
  }
  function semanticValue(u,type){
    const h=String(u?.semanticHtml||'');
    const escaped=String(type||'').replace(/[^a-z-]/gi,'');
    const patterns=[new RegExp(`semantic-inline[^>]*semantic-${escaped}[^>]*>(.*?)<\\/span>`,'i'),new RegExp(`data-semantic-type=["']${escaped}["'][^>]*>(.*?)<\\/span>`,'i')];
    for(const pattern of patterns){const value=cleanSemanticText(h.match(pattern)?.[1]||'');if(value)return value;}
    return '';
  }
  function quoteFrom(u){
    const explicit=semanticValue(u,'quote');
    if(explicit&&explicit.length>18)return explicit;
    const plain=cleanSemanticText(u?.text||'');
    const emotional=/(помн|люб|важ|семь|дом|детств|вместе|счаст|мечт|дорог|голос|сердц|памят|никогда|всегда|жизн|родн)/i;
    const personal=/(^|\s)(я|мы|мне|нам|мой|наш|моя|наша)(\s|$)/i;
    const scored=plain.split(/(?<=[.!?])\s+/).map(s=>s.trim()).filter(Boolean).map((sentence,index)=>{
      let score=sentence.length>=45&&sentence.length<=190?18:sentence.length>=28&&sentence.length<=240?8:-14;
      if(emotional.test(sentence))score+=13;if(personal.test(sentence))score+=8;if(/[—–]/.test(sentence))score+=5;if(/\d{3,}/.test(sentence))score-=6;score-=index*.35;
      return {sentence,score};
    }).sort((a,b)=>b.score-a.score);
    return (scored[0]?.sentence||plain).split(/\s+/).slice(0,28).join(' ').trim();
  }
  function inferDate(u){
    const explicit=semanticValue(u,'date');if(explicit)return {value:explicit,source:'manual'};
    const photoDate=(u?.photos||[]).map(p=>String(p?.year||'').trim()).find(Boolean);if(photoDate)return {value:photoDate,source:'photo'};
    const text=cleanSemanticText(u?.text||'');const month='(?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)';
    const patterns=[new RegExp(`\\b\\d{1,2}\\s+${month}\\s+(?:18|19|20)\\d{2}(?:\\s+года)?\\b`,'i'),/\b(?:весной|летом|осенью|зимой)\s+(?:18|19|20)\d{2}(?:\s+года)?\b/i,/\b(?:18|19|20)\d{2}\s*[—–-]\s*(?:18|19|20)\d{2}\b/,/\b(?:18|19|20)\d{2}(?:\s+год(?:а|у|ом)?)?\b/i];
    for(const pattern of patterns){const match=text.match(pattern);if(match)return {value:match[0],source:'text'};}return {value:'',source:''};
  }
  function inferPlace(u){
    const explicit=semanticValue(u,'place');if(explicit)return {value:explicit,source:'manual'};
    const photoPlace=(u?.photos||[]).map(p=>String(p?.place||'').trim()).find(Boolean);if(photoPlace)return {value:photoPlace,source:'photo'};
    const text=cleanSemanticText(u?.text||'');const stop=new Set(['России','Семье','Жизни','Доме','Этот','Эта','Тот','Тогда','Котором','Которой']);
    const re=/(?:^|[.!?]\s+|\s)(?:в|во|из|под|около)\s+([А-ЯЁ][а-яё-]+(?:\s+[А-ЯЁ][а-яё-]+){0,2})/gu;let match;
    while((match=re.exec(text))){const value=String(match[1]||'').trim();if(value&&!stop.has(value.split(/\s+/)[0]))return {value,source:'text'};}return {value:'',source:''};
  }
  function inferMeta(u){const date=inferDate(u),place=inferPlace(u);return {date:date.value,place:place.value,dateSource:date.source,placeSource:place.source};}

  function splitWords(text,limit){
    const w=String(text||'').trim().split(/\s+/).filter(Boolean);
    const out=[];
    for(let i=0;i<w.length;i+=limit) out.push(w.slice(i,i+limit).join(' '));
    return out.length?out:[''];
  }

  function imageSource(photo){
    if(!photo)return '';
    return String(photo.src||photo.dataUrl||photo.dataURL||photo.url||photo.preview||photo.objectUrl||'').trim();
  }
  function image(u,index=0){
    return imageSource(u?.photos?.[index]);
  }
  // Synchronously read width/height straight out of a data-URI's own bytes (JPEG/PNG/WEBP headers),
  // no Image() load/decode wait needed — lets the director pick layouts by photo orientation up front.
  const _dimCache=new Map();
  function sniffImageDims(dataUri){
    if(!dataUri)return null;
    if(_dimCache.has(dataUri))return _dimCache.get(dataUri);
    let result=null;
    try{
      const m=/^data:image\/(\w+);base64,(.*)$/i.exec(dataUri);
      if(m){
        const mime=m[1].toLowerCase();
        const bin=atob(m[2].slice(0,260000)); // header lives well within the first ~190KB of decoded bytes
        const len=bin.length;
        const byte=i=>bin.charCodeAt(i);
        if((mime==='png')&&len>24&&byte(0)===0x89&&byte(1)===0x50){
          const width=(byte(16)<<24)|(byte(17)<<16)|(byte(18)<<8)|byte(19);
          const height=(byte(20)<<24)|(byte(21)<<16)|(byte(22)<<8)|byte(23);
          if(width>0&&height>0)result={width,height};
        }else if(mime==='jpeg'||mime==='jpg'){
          let i=2;
          while(i<len-9){
            if(byte(i)!==0xFF){i++;continue;}
            const marker=byte(i+1);
            if(marker===0xD8||marker===0x01||(marker>=0xD0&&marker<=0xD7)){i+=2;continue;}
            if(marker===0xD9||marker===0xDA)break;
            const segLen=(byte(i+2)<<8)|byte(i+3);
            const isSOF=marker>=0xC0&&marker<=0xCF&&marker!==0xC4&&marker!==0xC8&&marker!==0xCC;
            if(isSOF){
              const height=(byte(i+5)<<8)|byte(i+6);
              const width=(byte(i+7)<<8)|byte(i+8);
              if(width>0&&height>0)result={width,height};
              break;
            }
            i+=2+segLen;
          }
        }else if(mime==='webp'&&len>30&&bin.slice(0,4)==='RIFF'&&bin.slice(8,12)==='WEBP'){
          const fourcc=bin.slice(12,16);
          if(fourcc==='VP8 '){
            const width=(byte(26)|(byte(27)<<8))&0x3FFF;
            const height=(byte(28)|(byte(29)<<8))&0x3FFF;
            if(width>0&&height>0)result={width,height};
          }else if(fourcc==='VP8L'){
            const b0=byte(21),b1=byte(22),b2=byte(23),b3=byte(24);
            const width=1+(((b1&0x3F)<<8)|b0);
            const height=1+(((b3&0xF)<<10)|(b2<<2)|((b1&0xC0)>>6));
            if(width>0&&height>0)result={width,height};
          }
        }
      }
    }catch(_){result=null;}
    if(result){
      result.aspect=result.width/result.height;
      result.orientation=result.aspect>1.08?'landscape':(result.aspect<0.92?'portrait':'square');
    }
    _dimCache.set(dataUri,result);
    return result;
  }
  // Pick the best-fitting unused photo for a slot of a given aspect ratio, looking only a few
  // photos ahead so the book still reads mostly in upload order — this isn't a full reshuffle,
  // just enough slack to avoid jamming a tall portrait into a wide panoramic band.
  function nextUnusedPhotoIndex(photos,ctx){
    for(let i=0;i<photos.length;i++){
      if(!ctx.usedPhotos.has(i)&&imageSource(photos[i]))return i;
    }
    return -1;
  }
  function pickPhotoIndex(photos,ctx,targetAspect,lookahead=4){
    const seq=nextUnusedPhotoIndex(photos,ctx);
    if(seq===-1)return Math.max(0,photos.length-1);
    if(!targetAspect||!isFinite(targetAspect))return seq;
    // Orientation may only re-rank photos the person uploaded on the SAME page/episode as the next
    // one due — it must never reach across a page boundary and pull a later page's photo forward,
    // or the book stops matching the chronology the person actually built.
    const seqPage=photos[seq]?._pageIndex;
    let bestIdx=seq,bestScore=Infinity,seen=0;
    for(let i=seq;i<photos.length&&seen<lookahead;i++){
      if(ctx.usedPhotos.has(i)||!imageSource(photos[i]))continue;
      if(photos[i]._pageIndex!==seqPage)break;
      seen++;
      const dims=sniffImageDims(imageSource(photos[i]));
      if(!dims)continue;
      const score=Math.abs(Math.log(dims.aspect)-Math.log(targetAspect));
      if(score<bestScore-0.05){bestScore=score;bestIdx=i;}
    }
    return bestIdx;
  }
  function pickPullQuote(text){
    const sentences=String(text||'').split(/(?<=[.!?…])\s+/).map(s=>s.trim()).filter(Boolean);
    if(!sentences.length)return '';
    const fit=sentences.filter(s=>s.length>=40&&s.length<=170);
    const pool=fit.length?fit:sentences;
    return pool[Math.floor(pool.length/2)]||'';
  }
  function caption(u,index=0){
    const p=u?.photos?.[index]||{};
    return [p.caption,p.year,p.place].filter(Boolean).join(' · ');
  }

  let bookPageSerial=0;
  function makePage(u,layout,text,opts={}){
    return {
      id:'book_'+(++bookPageSerial),
      sourcePageUid:u.sourcePageUid,
      sectionId:u.sectionId,
      title:u.title,
      episode:u.episode,
      layout,
      text:text||'',
      quote:opts.quote||'',
      photoIndex:opts.photoIndex??0,
      photoIndices:opts.photoIndices||null,
      secondPhotoIndex:opts.secondPhotoIndex??1,
      showSecondaryPhoto:opts.showSecondaryPhoto===true,
      chapterNo:opts.chapterNo??null,
      showHeading:opts.showHeading,
      pullQuote:opts.pullQuote||'',
      source:u,
      pageNo:0
    };
  }

  function words(text){
    return String(text||'').trim().split(/\s+/).filter(Boolean);
  }
  function takeWords(text,count){
    const w=words(text);
    return {
      head:w.slice(0,count).join(' '),
      tail:w.slice(count).join(' ')
    };
  }
  function wc(text){ return words(text).length; }

  function normalizeQaText(value){return String(value||'').toLocaleLowerCase('ru').replace(/\s+/g,' ').trim();}
  function runKernelTreeQa(spreads,pages,chapterTitles){
    const violations=[];
    for(let i=1;i<spreads.length;i++){
      if(spreads[i]?.master===spreads[i-1]?.master)violations.push({rule:'master-repeat',spread:i+1,message:`Повтор мастера ${spreads[i].master}`});
      if(spreads[i]?.master==='MS-08'&&spreads[i-1]?.master==='MS-08')violations.push({rule:'dense-repeat',spread:i+1,message:'Две текстовые полосы подряд'});
    }
    const seenTitles=new Set();
    (chapterTitles||[]).forEach((title,index)=>{
      const key=normalizeQaText(title);
      if(!key||/^(новая глава|без названия|глава)$/.test(key)||seenTitles.has(key))violations.push({rule:'chapter-title',chapter:index+1,message:`Неуникальный заголовок: ${title||'пусто'}`});
      seenTitles.add(key);
    });
    const seenQuotesByChapter=new Map();
    const seenPhotos=new Map();
    const fullByChapter=new Map();
    pages.forEach((page,index)=>{
      if(page.pageNo!==index+1)violations.push({rule:'folio',page:index+1,message:`Ожидался номер ${index+1}, получен ${page.pageNo}`});
      const section=page.sectionId||'__book__';
      const quoteValues=[];
      if(page.layout==='quote'&&page.quote)quoteValues.push(page.quote);
      if(page.pullQuote)quoteValues.push(page.pullQuote);
      const chapterQuotes=seenQuotesByChapter.get(section)||new Set();
      quoteValues.forEach(value=>{
        const key=normalizeQaText(value);
        if(key&&chapterQuotes.has(key))violations.push({rule:'quote-repeat',page:page.pageNo,message:'Цитата повторена дословно'});
        if(key)chapterQuotes.add(key);
      });
      seenQuotesByChapter.set(section,chapterQuotes);
      const indexes=[];
      if(['chapter-photo','full-photo','photo-left-page','photo-fullspread','photo-collage'].includes(page.layout)){
        if(Array.isArray(page.photoIndices))indexes.push(...page.photoIndices);else if(Number.isInteger(page.photoIndex))indexes.push(page.photoIndex);
      }
      if(page.layout==='editorial-prose'&&page.showSecondaryPhoto&&Number.isInteger(page.photoIndex))indexes.push(page.photoIndex);
      indexes.forEach(photoIndex=>{
        const photo=page.source?.photos?.[photoIndex];
        const src=imageSource(photo);
        if(!src)return;
        if(seenPhotos.has(src))violations.push({rule:'photo-repeat',page:page.pageNo,message:`Фото уже использовано на странице ${seenPhotos.get(src)}`});
        else seenPhotos.set(src,page.pageNo);
        if([photo.caption,photo.year,photo.place].some(Boolean)&&!caption(page.source,photoIndex))violations.push({rule:'caption',page:page.pageNo,message:'Метаданные фото есть, подпись потеряна'});
      });
      if(page.master==='MS-04')fullByChapter.set(section,(fullByChapter.get(section)||0)+.5);
    });
    fullByChapter.forEach((count,section)=>{if(count>1)violations.push({rule:'full-spread-limit',section,message:`Полных фото-разворотов: ${count}`});});
    if(spreads.filter(sp=>sp.master==='MS-07').length>1)violations.push({rule:'collage-limit',message:'Коллаж использован больше одного раза'});
    const result={status:violations.length?'fail':'pass',checkedAt:new Date().toISOString(),violations};
    window.OCHERKI_DESIGN_KERNEL_QA=Object.assign({},window.OCHERKI_DESIGN_KERNEL_QA,{tree:result});
    return result;
  }

  function runKernelDomQa(){
    const violations=[];
    const pages=[...document.querySelectorAll('#bdSpreadRows .book-art-page')];
    pages.forEach((page,index)=>{
      const containers=page.querySelectorAll('.reading-columns,.editorial-columns,.columns,.contents-list,.dc-copy,.nt-copy,.ep-copy,.dpk-reading,.dpk-chapter-copy,.dpk-document-transcript p');
      containers.forEach(node=>{
        if(node.scrollHeight>node.clientHeight+2||node.scrollWidth>node.clientWidth+2)violations.push({rule:'overflow',page:index+1,className:node.className,message:'Контент выходит за заданный блок'});
      });
      page.querySelectorAll('figure').forEach(figure=>{
        if(page.classList.contains('document-page')||page.classList.contains('document-comment-page'))return;
        const cs=getComputedStyle(figure);
        const border=Math.max(parseFloat(cs.borderTopWidth)||0,parseFloat(cs.borderRightWidth)||0,parseFloat(cs.borderBottomWidth)||0,parseFloat(cs.borderLeftWidth)||0);
        if(border>1||cs.boxShadow!=='none')violations.push({rule:'photo-frame',page:index+1,message:'У фотографии обнаружена рамка или тень'});
      });
    });
    const result={status:violations.length?'fail':'pass',checkedAt:new Date().toISOString(),violations};
    window.OCHERKI_DESIGN_KERNEL_QA=Object.assign({},window.OCHERKI_DESIGN_KERNEL_QA,{dom:result});
    return result;
  }
  window.OCHERKI_RUN_DESIGN_KERNEL_QA=runKernelDomQa;

  const MASTER_CAPACITY={
    'MS-01':{left:0,right:250},
    'MS-02':{left:0,right:220},
    'MS-03':{left:0,right:340},
    'MS-04':{left:0,right:0},
    'MS-05':{left:0,right:320},
    'MS-06':{left:0,right:360},
    'MS-07':{left:0,right:360},
    'MS-08':{left:360,right:360},
    'MS-09':{left:0,right:0}
  };
  const FORMAT_CAPACITY_FACTOR={square:1,portrait:1.20};
  const FORMAT_INTRO_CAPACITY={square:225,portrait:285};
  const FORMAT_CONTENTS_CAPACITY={square:10,portrait:13};
  function masterCapacity(master,side){const base=MASTER_CAPACITY[master]?.[side]||0;return base?Math.max(80,Math.round(base*(FORMAT_CAPACITY_FACTOR[activeFormat]||1))):0;}
  function chapterIntroCapacity(){return FORMAT_INTRO_CAPACITY[activeFormat]||FORMAT_INTRO_CAPACITY.a4;}
  function contentsCapacity(){return FORMAT_CONTENTS_CAPACITY[activeFormat]||FORMAT_CONTENTS_CAPACITY.a4;}

  function masterScore(id,u,ctx){
    const textCount=wc(u._remainingText ?? u.text);
    const photos=(u.photos||[]).length;
    const quote=quoteFrom(u);
    const chapter=/^Глава\s+\d+/i.test(u.title||'') && u.isFirstInSection;
    let s=0;

    if(id==='MS-01'){
      s += chapter?44:-60;
      s += photos===0?10:0;
      s += textCount>90?10:3;
    }
    if(id==='MS-02'){
      s += chapter?35:-45;
      s += photos?30:-55;
      s += textCount>70?9:2;
    }
    if(id==='MS-03'){
      s += photos?28:-55;
      s += textCount>180?18:4;
      s += chapter?-10:0;
    }
    if(id==='MS-05'){
      s += photos>=2?34:photos===1?16:-50;
      s += textCount>220?20:6;
      s += /archive|document/i.test(u.type||'')?12:0;
    }
    if(id==='MS-06'){
      s += quote?40:-52;
      s += textCount>160?16:4;
      s += chapter?-12:0;
    }
    if(id==='MS-08'){
      s += textCount>620?42:textCount>420?22:-20;
      s += photos? -8:8;
      s += chapter?-20:0;
    }

    // Rhythm penalties / bonuses.
    if(ctx.prevMaster===id) s-=28;
    if(ctx.prevPrevMaster===id) s-=12;
    if(['MS-02','MS-03','MS-05'].includes(id) && ['MS-02','MS-03','MS-05'].includes(ctx.prevMaster)) s-=7;
    if(id==='MS-08' && ctx.prevMaster==='MS-08') s-=18;
    return s;
  }

  function chooseMaster(u,ctx){
    const ids=['MS-01','MS-02','MS-03','MS-05','MS-06','MS-08'];
    return ids
      .map(id=>({id,score:masterScore(id,u,ctx)}))
      .sort((a,b)=>b.score-a.score)[0];
  }

  function spreadFromMaster(master,u,ctx){
    let rem=u._remainingText ?? u.text;
    const q=quoteFrom(u);
    const ph=u.photos||[];
    let left=null,right=null;

    if(master==='MS-01'){
      const r=takeWords(rem,masterCapacity(master,'right'));
      left=makePage(u,'chapter-mark','',{chapterNo:(u.sectionIndex||0)+1});
      right=makePage(u,'chapter-intro',r.head,{quote:q});
      left.master='MS-01'; right.master='MS-01';
      rem=r.tail;
    }else if(master==='MS-02'){
      const r=takeWords(rem,masterCapacity(master,'right'));
      left=makePage(u,'full-photo','',{photoIndex:0});
      right=makePage(u,'chapter-intro',r.head,{quote:q});
      rem=r.tail;
    }else if(master==='MS-03'){
      const r=takeWords(rem,masterCapacity(master,'right'));
      const [pageW,pageH]=currentPageSize();
      const idx=pickPhotoIndex(ph,ctx,pageW/pageH);
      const photoPage=makePage(u,'full-photo','',{photoIndex:idx});
      const textPage=makePage(u,'prose',r.head,{quote:q});
      const photoOnRight=ctx.photoSide==='right';
      left=photoOnRight?textPage:photoPage;
      right=photoOnRight?photoPage:textPage;
      left.master='MS-03'; right.master='MS-03';
      rem=r.tail;
      ctx.usedPhotos.add(idx);
      ctx.photoSide=photoOnRight?'left':'right';
    }else if(master==='MS-04'){
      const [pageW,pageH]=currentPageSize();
      const idx=pickPhotoIndex(ph,ctx,pageW/pageH);
      ctx.usedPhotos.add(idx);
      const idx2=pickPhotoIndex(ph,ctx,pageW/pageH);
      left=makePage(u,'photo-fullspread','',{photoIndex:idx});
      right=makePage(u,'photo-fullspread','',{photoIndex:idx2});
      left.master='MS-04'; right.master='MS-04';
      ctx.usedPhotos.add(idx2);
    }else if(master==='MS-05'){
      const r=takeWords(rem,masterCapacity(master,'right'));
      const [pageW,pageH]=currentPageSize();
      const idxMain=pickPhotoIndex(ph,ctx,pageW/pageH);
      ctx.usedPhotos.add(idxMain);
      const secondaryAspect=(activeDesign||'archive')==='editorial'?3:1.17; // editorial's secondary photo is a wide short band; other designs use a near-square one
      const idxSecond=pickPhotoIndex(ph,ctx,secondaryAspect);
      ctx.usedPhotos.add(idxSecond);
      const photoPage=makePage(u,'photo-left-page','',{photoIndex:idxMain});
      const textPage=makePage(u,'editorial-prose',r.head,{
        quote:q,
        photoIndex:idxSecond,showSecondaryPhoto:true
      });
      const photoOnRight=ctx.photoSide==='right';
      left=photoOnRight?textPage:photoPage;
      right=photoOnRight?photoPage:textPage;
      left.master='MS-05'; right.master='MS-05';
      ctx.photoSide=photoOnRight?'left':'right';
      rem=r.tail;
    }else if(master==='MS-06'){
      const r=takeWords(rem,masterCapacity(master,'right'));
      const quotePage=makePage(u,'quote','',{quote:q||u.episode||u.title});
      const textPage=makePage(u,'prose',r.head,{quote:q,pullQuote:pickPullQuote(r.head)});
      const quoteOnRight=ctx.quoteSide==='right';
      left=quoteOnRight?textPage:quotePage;
      right=quoteOnRight?quotePage:textPage;
      left.master='MS-06'; right.master='MS-06';
      rem=r.tail;
      ctx.quoteSide=quoteOnRight?'left':'right';
    }else if(master==='MS-09'){
      const doc=ctx.documentUnit||{};
      left=makePage(doc,'document-letter',doc.text||'',{chapterNo:(u.sectionIndex||0)+1});
      right=makePage(u,'document-comment',pickPullQuote(rem)||doc.text||'',{chapterNo:(u.sectionIndex||0)+1});
      left.title=doc.title||'Архивный документ';
      right.title=doc.title||'Документ и комментарий';
      left.master='MS-09'; right.master='MS-09';
      ctx.documentUsed=true;
    }else if(master==='MS-07'){
      // A single edge-to-edge photo grid, deliberately used at most once in
      // the whole book (see canCollage below) — a small, full-bleed echo of
      // the single-photo spread (MS-04) rather than a recurring "photo page"
      // rhythm, per the client's explicit "50/50, not a photo book" note.
      const r=takeWords(rem,masterCapacity(master,'right'));
      const idxs=[];
      for(let n=0;n<3;n++){
        const idx=nextUnusedPhotoIndex(ph,ctx);
        if(idx===-1)break;
        ctx.usedPhotos.add(idx);
        idxs.push(idx);
      }
      left=makePage(u,'photo-collage','',{photoIndices:idxs});
      right=makePage(u,'prose',r.head,{quote:q});
      left.master='MS-07'; right.master='MS-07';
      rem=r.tail;
    }else{ // MS-08
      const a=takeWords(rem,masterCapacity(master,'left'));
      const b=takeWords(a.tail,masterCapacity(master,'right'));
      ctx.denseCount=(ctx.denseCount||0)+1;
      const isFirstDense=ctx.denseCount===1;
      left=makePage(u,'prose-dense',a.head,{quote:q,showHeading:isFirstDense,pullQuote:isFirstDense?'':pickPullQuote(a.head)});
      right=makePage(u,'prose-dense',b.head,{quote:q,showHeading:false});
      left.master='MS-08'; right.master='MS-08';
      rem=b.tail;
    }

    u._remainingText=rem;
    return {id:'spread_'+(bookSpreads.length+1),master,left,right,score:masterScore(master,u,ctx)};
  }

  function assemble(){
    if(activeDesign==='editorial'&&window.OcherkiBookEngine){
      // A word longer than a line (a link, or letters typed without spaces)
      // gets invisible break points, so the page can still be set.
      const longWord=/[^\s\u200b]{24,}/gu,breakLong=t=>typeof t==='string'&&/[^\s\u200b]{24,}/u.test(t)?t.replace(longWord,w=>w.replace(/([^\s]{7})(?=[^\s])/gu,'$1\u200b')):t;
      const structureForBook=JSON.parse(JSON.stringify(structure||{}));(structureForBook.sections||[]).forEach(sec=>(sec.pages||[]).forEach(pg=>{pg.text=breakLong(pg.text);if(pg.semanticHtml&&/[^\s<>\u200b]{24,}/.test(pg.semanticHtml))delete pg.semanticHtml;}));
      const external=window.OcherkiLayoutPagination.build(structureForBook,Object.assign({},window.OCHERKI_BOOK_META||{},{format:activeFormat}));
      window.__ocherkiLastWarnings=(external.layout?.warnings||external.warnings||[]);
      window.__ocherkiLastStructure=structure;
      if(!external.ready){
        built=false;
        buildMessage=`<div class="bd-build-empty"><strong>${esc(external.message||'Недостаточно материала для сборки.')}</strong></div>`;
        showBookNotice(`<strong>${esc(external.message||'Недостаточно материала для сборки.')}</strong>`,false);
        if(countEl)countEl.textContent='нужна 1 глава';
        renderRightPanel();
        return false;
      }
      bookSpreads=external.spreads;window.__ocherkiSpreads=bookSpreads;
      bookPages=external.pages;
      applyPendingPreviewTarget();
      activeSpread=Math.min(activeSpread,Math.max(0,bookSpreads.length-1));
      built=true;
      buildMessage='';
      designAppliedFromConfig=true;
      const pageCountNode=document.getElementById('pageCount');
      if(pageCountNode)pageCountNode.textContent=String(bookPages.length);
      if(countEl)countEl.textContent=`${bookSpreads.length} разв. · ${bookPages.length} стр.`;
      window.OCHERKI_DESIGN_KERNEL_QA=Object.assign({},window.OCHERKI_DESIGN_KERNEL_QA,{engine:window.OcherkiBookEngine.audit(external)});
      renderRightPanel();
      requestAnimationFrame(()=>requestAnimationFrame(()=>{
        if(window.OcherkiBookRenderer)window.OCHERKI_DESIGN_KERNEL_QA=Object.assign({},window.OCHERKI_DESIGN_KERNEL_QA,{dom:window.OcherkiBookRenderer.audit(document)});
      }));
      return true;
    }
    const meta=window.OCHERKI_BOOK_META||{};
    const sections=(structure?.sections||[]).filter(s=>s.included!==false);
    const chapterSections=sections.filter(s=>s.type==='chapter');
    const chapterIsReady=section=>{
      const pages=section?.pages||[];
      const editedText=pages.filter(p=>p?.userEdited===true).map(p=>String(p?.text||'')).join(' ');
      const realPhotos=pages.reduce((total,p)=>total+(p?.photos||[]).filter(photo=>imageSource(photo)).length,0);
      return wc(editedText)>=45 || realPhotos>0;
    };
    const chapters=chapterSections.filter(chapterIsReady);
    const byId=id=>sections.find(s=>s.id===id);
    const pageOf=id=>byId(id)?.pages?.[0]||{};
    const cleanChapterTitle=title=>String(title||'')
      .replace(/^Глава\s+\d+[.:]?\s*/i,'').trim();
    const usedChapterTitles=new Set();
    const resolvedChapterTitle=new Map();
    chapters.forEach((section,index)=>{
      let candidate=cleanChapterTitle(section.title);
      if(!candidate || /^(новая глава|без названия|глава)$/i.test(candidate))candidate=`Глава ${index+1}`;
      const base=candidate;
      let suffix=2;
      while(usedChapterTitles.has(candidate.toLocaleLowerCase('ru')))candidate=`${base} ${suffix++}`;
      usedChapterTitles.add(candidate.toLocaleLowerCase('ru'));
      resolvedChapterTitle.set(section.id,candidate);
    });
    const mergeChapter=(section,chapterIndex)=>{
      const units=(section.pages||[]).map((p,pageIndex)=>({
        sectionId:section.id, sectionTitle:section.title||'', sectionIndex:chapterIndex,
        sourcePageUid:p.uid, pageIndex, title:p.title||section.title||'', episode:p.episode||'',
        type:p.type||section.type||'text', text:String(p.text||''), semanticHtml:String(p.semanticHtml||''),
        photos:(Array.isArray(p.photos)?p.photos:[]).map(ph=>({...ph,_pageIndex:pageIndex,_episode:p.episode||''})), photoCount:Number(p.photoCount)||0,
        userEdited:!!p.userEdited, bookRole:String(p.bookRole||'auto'), isFirstInSection:pageIndex===0
      }));
      const first=units[0]||{};
      const merged=Object.assign({},first,{
        title:resolvedChapterTitle.get(section.id)||`Глава ${chapterIndex+1}`,
        episode:first.episode||`Глава ${chapterIndex+1}`,
        text:units.filter(u=>u.type!=='document'&&u.bookRole!=='document').map(u=>u.text).filter(Boolean).join('\n\n'),
        semanticHtml:units.map(u=>u.semanticHtml).filter(Boolean).join(' '),
        photos:units.flatMap(u=>u.photos||[]),
        sourceUnits:units,
        isFirstInSection:true
      });
      merged.inferred=inferMeta(merged);
      return merged;
    };

    bookPageSerial=0;
    bookPages=[];
    bookSpreads=[];
    buildMessage='';
    const P=(kind,extra={})=>Object.assign({id:'book_'+(++bookPageSerial),kind,pageNo:0},extra);

    if(!chapters.length){
      built=false;
      buildMessage='<div class="bd-build-empty"><strong>Добавьте материал хотя бы в одну главу.</strong><span>Для сборки достаточно 45 слов авторского текста или одной фотографии.</span></div>';
      const pageCountNode=document.getElementById('pageCount');
      if(pageCountNode)pageCountNode.textContent='0';
      if(countEl)countEl.textContent='нужна 1 глава';
      renderRightPanel();
      return false;
    }

    const afterword=pageOf('afterword');
    const thanks=pageOf('thanks');
    const introPage=pageOf('intro');
    const authorNote=pageOf('author');
    const sourcesPage=pageOf('sources');
    const colophonPage=pageOf('colophon');
    const backEndpaper=byId('back-endpaper');
    const insideBackCover=byId('inside-back-cover');
    const contentsItems=chapters.map((section,index)=>({
      sectionId:section.id,title:resolvedChapterTitle.get(section.id)||`Глава ${index+1}`,page:''
    }));
    const contentsPages=[];
    for(let i=0;i<contentsItems.length;i+=contentsCapacity()){
      contentsPages.push(P('contents-right',{items:contentsItems.slice(i,i+contentsCapacity())}));
    }

    // Cover / title / dedication / epigraph are edited on the sheet as
    // independent fields, each its own line separated by a blank line, so
    // clicking into one never wipes the others. A field the user never
    // filled in comes back as FIELD_SKIP (a single space) so its position
    // in the array is preserved. A filled field overrides the project's
    // onboarding title/subtitle/author (for cover/title) or renders as
    // real content (for dedication/epigraph); an empty field falls back to
    // the onboarding value, or — for dedication/epigraph — simply means
    // that part is left out, so nothing half-finished ever ships.
    const FIELD_SKIP=' ';
    const fieldsOf=(pageId,n)=>{
      const parts=String(pageOf(pageId).text||'').split(/\n{2,}/);
      const out=[];
      for(let i=0;i<n;i++){
        const v=parts[i];
        out.push((v!==undefined && v!==FIELD_SKIP && v.trim()!=='') ? v.trim() : '');
      }
      return out;
    };
    const [coverTitleF,coverSubtitleF,coverAuthorF]=fieldsOf('cover',3);
    const [titleTitleF,titleSubtitleF,titleAuthorF]=fieldsOf('title',3);
    const [dedicationTextF,dedicationSignF]=fieldsOf('dedication',2);
    const [epigraphTextF,epigraphSourceF]=fieldsOf('epigraph',2);
    const [colophonCompilerF,colophonDesignF,colophonYearF,colophonPlaceF]=fieldsOf('colophon',4);
    const coverMeta=Object.assign({},meta,{
      title:coverTitleF||meta.title, subtitle:coverSubtitleF||meta.subtitle, author:coverAuthorF||meta.author
    });
    const titlePageMeta=Object.assign({},meta,{
      title:titleTitleF||meta.title, subtitle:titleSubtitleF||meta.subtitle, author:titleAuthorF||meta.author
    });
    // The cover needed its own uploaded photo wired through as `source` —
    // without it, renderMasterSpreadPage's image(src,0) lookup always saw an
    // empty {} and the "editorial" design's photo-cover treatment silently
    // fell back to a bare dark panel with no picture at all.
    const coverPage=pageOf('cover');
    // Physical book order: the cover is a single recto; after it, previews
    // pair true facing pages (2–3, 4–5, ...). This removes the one-page drift
    // that previously made every constructor spread disagree with the proof.
    bookSpreads.push({master:'MD01_COVER',left:null,right:P('cover',{meta:coverMeta,source:coverPage}),single:'right'});
    bookSpreads.push({master:'MD01_ENDPAPERS_FRONT',left:P('endpaper',{meta}),right:P('endpaper',{meta})});
    bookSpreads.push({master:'MD01_TITLES',left:P('half-title',{layout:'half-title',meta}),right:P('title',{layout:'title-page',meta:titlePageMeta})});
    const epigraphPage=epigraphTextF?P('epigraph',{
      epigraphText:epigraphTextF, epigraphSource:epigraphSourceF, meta
    }):dedicationTextF?P('dedication',{dedicationText:dedicationTextF,dedicationSign:dedicationSignF,meta}):P('blank',{meta});
    bookSpreads.push({master:'MD01_EPIGRAPH_CONTENTS',left:epigraphPage,right:contentsPages[0]});
    for(let i=1;i<contentsPages.length;i+=2){
      bookSpreads.push({master:'MD01_CONTENTS',left:contentsPages[i],right:contentsPages[i+1]||P('endpaper',{meta})});
    }

    // Intro / author's note — an optional spread just before the chapters
    // begin. Like afterword/thanks below, it only ships once the user has
    // switched the section on AND actually written something in it.
    if(introPage.text||authorNote.text){
      bookSpreads.push({master:'MD01_INTRO',
        left:P('intro',{title:introPage.title||'Вступление',text:String(introPage.text||'')}),
        right:P('author-note',{title:authorNote.title||'От автора',text:String(authorNote.text||'')})
      });
    }

    // MS-07 (full-bleed photo collage) is deliberately rationed to at most
    // once across the ENTIRE book, not once per chapter — see the note at
    // its spreadFromMaster branch. This flag is shared across all chapters.
    let bookCollageUsed=false;
    chapters.forEach((section,chapterIndex)=>{
      const u=mergeChapter(section,chapterIndex);
      const intro=takeWords(u.text,chapterIntroCapacity());
      const heroAvailable=(u.photos||[]).some(p=>imageSource(p));
      const photoOpening=makePage(u,heroAvailable?'chapter-photo':'chapter-mark','',{
        photoIndex:0,chapterNo:chapterIndex+1
      });
      const textOpening=makePage(u,'chapter-intro',intro.head,{
        chapterNo:chapterIndex+1,quote:quoteFrom(u)
      });
      const chapterPhotoOnRight=chapterIndex%2===1;
      const left=chapterPhotoOnRight?textOpening:photoOpening;
      const right=chapterPhotoOnRight?photoOpening:textOpening;
      left.master='MD01_CHAPTER_OPEN';
      right.master='MD01_CHAPTER_OPEN';
      bookSpreads.push({master:'MD01_CHAPTER_OPEN',left,right,sectionId:section.id});

      u._remainingText=intro.tail;
      const documentUnit=(u.sourceUnits||[]).find(unit=>unit.type==='document'||unit.bookRole==='document')||null;
      const ctx={
        usedPhotos:new Set(heroAvailable?[0]:[]),prevMaster:'MD01_CHAPTER_OPEN',prevPrevMaster:null,
        quoteUsed:false,fullSpreadUsed:false,spreadIndexInChapter:0,denseRun:0,wordsSinceQuote:0,
        photoSide:chapterPhotoOnRight?'right':'left',quoteSide:chapterIndex%2===1?'right':'left',
        documentUnit,documentUsed:false
      };
      const totalChapterPhotos=(u.photos||[]).length;
      // The reference proof is not a random gallery: its first long chapter,
      // documentary middle chapter and short closing chapter have fixed,
      // reusable rhythms. A plan is selected only from material facts.
      const plannedMasters=[];
      if(chapterIndex===0 && totalChapterPhotos>=4){
        plannedMasters.push('MS-03','MS-06','MS-08','MS-04');
      }else if(documentUnit && totalChapterPhotos>=3){
        plannedMasters.push('MS-03','MS-09','MS-03','MS-06');
      }
      let guard=0;
      while(guard++<80){
        const remainingWords=wc(u._remainingText);
        const remainingPhotos=(u.photos||[]).reduce((n,p,i)=>n+(imageSource(p)&&!ctx.usedPhotos.has(i)?1:0),0);
        if(!remainingWords && !remainingPhotos && !(documentUnit&&!ctx.documentUsed))break;

        let master=plannedMasters[ctx.spreadIndexInChapter]||'MS-08';
        const hasExplicitQuote=/semantic-quote|data-semantic-type=["']quote/i.test(u.semanticHtml||'');
        const hasEditorialQuote=!!quoteFrom(u)&&wc(u.text)>=90&&!ctx.quoteUsed;
        // Occasional full-bleed photo spread: once per generously-photographed chapter, as a quiet breather partway through.
        const canFullSpread=remainingPhotos>=2 && !ctx.fullSpreadUsed && totalChapterPhotos>=3 && ctx.spreadIndexInChapter===1 && ctx.prevMaster!=='MS-01';
        // Rarer than the single full-bleed photo above: needs 3 unused photos
        // left in THIS chapter, and only ever fires once across the whole book.
        const canCollage=!bookCollageUsed && remainingPhotos>=3 && ctx.spreadIndexInChapter>=1 && ctx.prevMaster!=='MS-01';
        if(!plannedMasters[ctx.spreadIndexInChapter]){
          if(documentUnit&&!ctx.documentUsed) master='MS-09';
          else if(ctx.denseRun>=1 && (hasExplicitQuote||hasEditorialQuote) && ctx.prevMaster!=='MS-06') master='MS-06';
          else if(canCollage) master='MS-07';
          else if(canFullSpread) master='MS-04';
          else if(remainingPhotos>=2 && ctx.prevMaster!=='MS-05') master='MS-05';
          else if(remainingPhotos>=1) master='MS-03';
          else if((hasExplicitQuote||hasEditorialQuote) && remainingWords>=70 && ctx.wordsSinceQuote>=260 && ctx.prevMaster!=='MS-06') master='MS-06';
          else master='MS-08';
        }

        const beforeText=u._remainingText;
        const beforePhotoCount=ctx.usedPhotos.size;
        const beforeDocumentUsed=ctx.documentUsed;
        const spread=spreadFromMaster(master,u,ctx);
        spread.master=master;
        bookSpreads.push(spread);
        ctx.prevPrevMaster=ctx.prevMaster;
        ctx.prevMaster=master;
        ctx.spreadIndexInChapter++;
        if(master==='MS-08')ctx.denseRun+=1;else ctx.denseRun=0;
        if(master==='MS-06'){ctx.quoteUsed=true;ctx.wordsSinceQuote=0;}else ctx.wordsSinceQuote+=Math.max(0,remainingWords-wc(u._remainingText));
        if(master==='MS-04')ctx.fullSpreadUsed=true;
        if(master==='MS-07')bookCollageUsed=true;
        if(beforeText===u._remainingText && beforePhotoCount===ctx.usedPhotos.size && beforeDocumentUsed===ctx.documentUsed)break;
      }

      // A single dark, standalone pull-quote spread — v7's own device for a
      // quiet dramatic pause mid-book. Used at most once (after the first
      // chapter), pulled from that chapter's own words rather than
      // repeating the (light-cream) epigraph, so it reads as a distinct
      // beat and not a duplicate page.
      if(chapterIndex===0 && chapters.length>=2){
        const darkQuote=pickPullQuote(u.text);
        if(darkQuote){
          // Reference rhythm already contains a quote spread inside chapter 1;
          // do not inject a second decorative quote that would shift all folios.
        }
      }
    });

    // "Хроника" — a dated timeline of the book's own chapters, built purely
    // from years already mentioned in each chapter's own title/text (no new
    // input required from the person writing the book). It only ships once
    // at least two chapters actually contain a recognisable year — a book
    // where nobody dated anything gets no fabricated timeline.
    let timelinePage=null;
    {
      const yearRe=/\b(1[5-9]\d{2}|20\d{2})\b/;
      const timelineItems=chapters.map((section,index)=>{
        const label=resolvedChapterTitle.get(section.id)||`Глава ${index+1}`;
        const blob=[section.title,(section.pages||[]).map(p=>p.text).join(' ')].join(' ');
        const m=blob.match(yearRe);
        return m?{year:m[1],text:label}:null;
      }).filter(Boolean);
      if(timelineItems.length>=2){
        timelinePage=P('timeline',{title:'Хроника',items:timelineItems});
      }
    }

    const colophonRows=[
      {label:'Составитель',value:colophonCompilerF},
      {label:'Дизайн и вёрстка',value:colophonDesignF},
      {label:'Год издания',value:colophonYearF||meta.year||''},
      {label:'Место издания',value:colophonPlaceF}
    ];
    bookSpreads.push({master:'MD01_TIMELINE_FINAL',
      left:timelinePage||P('endpaper',{meta}),
      right:P('final',{meta})
    });
    const closingText=String(afterword.text||thanks.text||sourcesPage.text||'');
    bookSpreads.push({master:'MD01_AFTERWORD_COLOPHON',
      left:P('epilogue',{title:afterword.title||'Послесловие',text:closingText,source:afterword}),
      right:P('colophon',{rows:colophonRows})
    });
    if(backEndpaper||insideBackCover){
      bookSpreads.push({master:'MD01_ENDPAPERS_BACK',left:P('endpaper',{meta}),right:P('endpaper',{meta})});
    }
    bookSpreads.push({master:'MD01_BACK_COVER',left:P('back-cover',{layout:'back-cover',meta}),right:null,single:'left'});

    bookPages=bookSpreads.flatMap(sp=>[sp.left,sp.right].filter(Boolean));
    bookPages.forEach((page,index)=>{ page.pageNo=index+1; });
    applyPendingPreviewTarget();
    contentsItems.forEach((item,index)=>{
      const section=chapters[index];
      const first=bookPages.find(p=>p.sectionId===section.id && p.layout==='chapter-intro');
      item.page=first?.pageNo||'';
    });
    const treeQa=runKernelTreeQa(bookSpreads,bookPages,contentsItems.map(item=>item.title));
    activeSpread=Math.min(activeSpread,Math.max(0,bookSpreads.length-1));
    // Apply the project's chosen design exactly once, the first time the book
    // is assembled — after that, respect whatever the user picked from the
    // design swatches, instead of silently snapping back to "archive" on
    // every subsequent edit/rebuild.
    if(!designAppliedFromConfig){
      // Only the editorial design pack is finished; the start wizard's style
      // names must not switch the book to an unfinished legacy renderer.
      activeDesign=READY_DESIGNS.has(window.OCHERKI_BOOK_META?.design)?window.OCHERKI_BOOK_META.design:'editorial';
      designAppliedFromConfig=true;
    }
    designGrid?.querySelectorAll('[data-design]').forEach(card=>card.classList.toggle('is-active',card.dataset.design===activeDesign));
    built=true;
    const missingCaptions=bookPages.reduce((total,page)=>{
      const photos=page.source?.photos||[];
      const indexes=[...new Set([page.photoIndex,page.secondPhotoIndex].filter(Number.isInteger))];
      return total+indexes.filter(i=>imageSource(photos[i]) && ![photos[i].caption,photos[i].year,photos[i].place].some(Boolean)).length;
    },0);
    const pageCountNode=document.getElementById('pageCount');
    if(pageCountNode)pageCountNode.textContent=String(bookPages.length);
    const inferredCount=chapters.reduce((total,section)=>{
      const u=mergeChapter(section,0);
      return total+(u.inferred?.dateSource==='text'?1:0)+(u.inferred?.placeSource==='text'?1:0);
    },0);
    const omitted=chapterSections.length-chapters.length;
    if(countEl)countEl.title=[treeQa.status==='fail'?`Design Kernel QA: ${treeQa.violations.length} нарушений`:'Design Kernel QA: пройден',missingCaptions>0?`Нужно дополнить подписи: ${missingCaptions}`:'Все использованные фотографии подписаны',inferredCount?`Найдено подсказок в тексте: ${inferredCount}`:'',omitted?`Не включено пустых черновиков: ${omitted}`:''].filter(Boolean).join(' · ');
    renderRightPanel();
    requestAnimationFrame(()=>{observePageCanvasHosts();scaleAllPageCanvases();runKernelDomQa();});
    return true;
  }

  function pageImage(page,index){
    const src=image(page.source,index);
    if(src)return `<img src="${esc(src)}" alt="" loading="lazy" decoding="async">`;
    return `<span class="bp-photo-fallback"></span>`;
  }

  function safeText(s,n=12000){
    const x=String(s||'').replace(/\s+/g,' ').trim();
    return x.length>n?x.slice(0,n).replace(/\s+\S*$/,'')+'…':x;
  }
  function splitForEditorial(text){
    const w=String(text||'').trim().split(/\s+/).filter(Boolean);
    const a=Math.max(18,Math.floor(w.length*.34));
    return {
      intro:w.slice(0,a).join(' '),
      rest:w.slice(a).join(' ')
    };
  }
  function imageHtml(p,index=0){
    const src=image(p.source,index);
    if(src)return `<img src="${esc(src)}" alt="" loading="lazy" decoding="async">`;
    return `<span class="mp-fallback"></span>`;
  }

  function renderMasterSpreadPage(p,side){
    if(!p)return `<article class="book-art-page ${side}"></article>`;
    if(activeDesign==='editorial'&&window.OcherkiBookRenderer){
      const bookPhotoMode=window.OCHERKI_BOOK_META?.bookPhotoMode||'as-is';
      const packed=window.OcherkiLayoutPagination.renderPage(p,side,Object.assign({},window.OCHERKI_BOOK_META||{},{photoMode:bookPhotoMode==='bw'?'bw':'color',bookPhotoMode}));
      if(packed)return packed;
    }
    const src=p.source||{};
    const design=activeDesign||'archive';
    const title=esc(p.title||src.title||p.episode||src.episode||'');
    const episode=esc(p.episode||src.episode||'');
    // Chunked continuation prose (MS-03/MS-05/MS-08 right- or left-hand text) must show exactly its
    // own chunk, even when that chunk is empty (chapter ran out of text) — never fall back to the
    // full chapter text, or a used-up chapter would silently repeat its opening paragraphs on a later page.
    const CHUNKED_TEXT_LAYOUTS={'prose':1,'prose-dense':1,'editorial-prose':1};
    const text=safeText(CHUNKED_TEXT_LAYOUTS[p.layout]?(p.text||''):(p.text||src.text||''),12000);
    const quote=esc(p.quote||quoteFrom(src)||'');
    const bookMeta=Object.assign({},window.OCHERKI_BOOK_META||{},p.meta||{});
    const pageNo=p.pageNo||'';
    const folio=`<div class="folio">${pageNo}</div>`;
    const running=`<div class="running">${episode||'Очерки жизни'}</div>`;
    const photo=(idx=0)=>{
      const im=image(src,idx);
      return im?`<img src="${esc(im)}" alt="">`:`<span class="photo-fallback"></span>`;
    };
    const cap=(idx=0)=>esc(caption(src,idx));
    const parts=splitForEditorial(text);
    const inferred=src.inferred||inferMeta(src);
    const chapterByline=esc([inferred.place,inferred.date].filter(Boolean).join(' · ')||p.episode||src.episode||'Семейная история');

    function renderChapterStyled(){
      if(design==='classic'){
        if(side==='left'){
          return `<article class="book-art-page chapter-style chapter-classic-left left">
            ${running}<div class="chapter-soft-no">${String(p.chapterNo||1).padStart(2,'0')}</div>
            <div class="chapter-center">
              <div class="smallcaps chapter-meta">${episode||'Глава'}</div>
              <h2>${title}</h2>
            </div>${folio}
          </article>`;
        }
        return `<article class="book-art-page chapter-style chapter-classic-right right">
          ${running}<div class="smallcaps chapter-label">chapter ${String(p.chapterNo||1)}</div>
          <h1>${title}</h1><div class="rule"></div>
          <p class="lead">${esc(parts.intro)}</p>
          <div class="intro-body"><p>${esc(parts.rest)}</p></div>${folio}
        </article>`;
      }
      if(design==='editorial'){
        const chapterByline2=esc([inferred.place,inferred.date].filter(Boolean).join(' · ')||episode||'Семейная история');
        if(side==='left'){
          return `<article class="book-art-page chapter-style chapter-editorial-left left">
            ${running}
            <div class="editorial-title-wrap">
              <div class="smallcaps editorial-top">Глава ${String(p.chapterNo||1).padStart(2,'0')}</div>
              <h1>${title}</h1>
              <div class="editorial-byline">${chapterByline2}</div>
            </div>${folio}
          </article>`;
        }
        return `<article class="book-art-page chapter-style chapter-editorial-right right">
          ${running}
          <div class="editorial-title-wrap">
            <div class="smallcaps editorial-top">Глава ${String(p.chapterNo||1).padStart(2,'0')}</div>
            <h1>${title}</h1>
            <div class="editorial-byline">${chapterByline2}</div>
          </div>
          <div class="chapter-editorial-rule"></div>
          <div class="editorial-columns">
            <p>${esc(parts.intro)}</p>
            <p>${esc(parts.rest)}</p>
          </div>${folio}
        </article>`;
      }
      if(design==='modern'){
        if(side==='left'){
          return `<article class="book-art-page chapter-style chapter-modern-left left">
            ${running}<div class="modern-no">${String(p.chapterNo||1).padStart(2,'0')}</div>
            <div class="modern-kicker">${episode||'chapter'}</div>
            <h2>${title}</h2>${folio}
          </article>`;
        }
        return `<article class="book-art-page chapter-style chapter-modern-right right">
          ${running}<div class="modern-header">${title}</div>
          <div class="modern-grid">
            <p class="modern-lead">${esc(parts.intro)}</p>
            <p>${esc(parts.rest)}</p>
          </div>${folio}
        </article>`;
      }
      if(design==='prose'){
        if(side==='left'){
          return `<article class="book-art-page chapter-style chapter-prose-left left">
            ${running}<div class="smallcaps prose-kicker">section</div>
            <div class="prose-script">${String(p.chapterNo||1)}</div>
            <h2>${title}</h2>${folio}
          </article>`;
        }
        return `<article class="book-art-page chapter-style chapter-prose-right right">
          ${running}<div class="smallcaps prose-mini">chapter ${String(p.chapterNo||1)}</div>
          <h1>${title}</h1><div class="prose-underline"></div>
          <div class="story"><p>${esc(parts.intro)}</p><p>${esc(parts.rest)}</p></div>${folio}
        </article>`;
      }
      if(side==='left'){
        return `<article class="book-art-page chapter-style chapter-archive-left left">
          ${running}<div class="archive-no">${String(p.chapterNo||1).padStart(2,'0')}</div>
          <div class="smallcaps archive-meta">${episode||'Глава'}</div>
          <h2>${title}</h2>${folio}
        </article>`;
      }
      return `<article class="book-art-page chapter-style chapter-archive-right right">
        ${running}<div class="chapter-reference-title">
          <div class="smallcaps chapter-label">Глава ${String(p.chapterNo||1).padStart(2,'0')}</div>
          <h1>${title}</h1>
          <div class="chapter-byline">${chapterByline}</div>
        </div>
        <div class="chapter-reference-copy"><div class="rule"></div>
          <div class="chapter-columns"><p>${esc(parts.intro)}</p><p>${esc(parts.rest)}</p></div>
        </div>${folio}
      </article>`;
    }

    function renderQuoteStyled(){
      const safeQuote=quote||title;
      if(design==='classic'){
        if(side==='left'){
          return `<article class="book-art-page quote-style quote-classic-left left">
            ${running}<blockquote>«${safeQuote}»</blockquote>
            <div class="smallcaps quote-credit">из семейных воспоминаний</div>${folio}
          </article>`;
        }
        return `<article class="book-art-page quote-style quote-classic-right right">
          ${running}<h2>${title}</h2><div class="rule"></div>
          <div class="reading-columns"><p>${esc(text)}</p></div>${folio}
        </article>`;
      }
      if(design==='editorial'){
        if(p.layout==='quote'){
          return `<article class="book-art-page quote-style quote-editorial-quote ${side}">
            ${running}
            <div class="smallcaps editorial-quote-kicker">Из семейных воспоминаний</div>
            <div class="quote-mark">“</div>
            <blockquote>${safeQuote}</blockquote>
            <div class="smallcaps editorial-quote-kicker editorial-quote-kicker-bottom">${episode||'Семейный архив'}</div>${folio}
          </article>`;
        }
        const pull=(p.pullQuote&&String(p.pullQuote).trim()!==String(safeQuote).trim())?`<div class="reading-pull">«${esc(p.pullQuote)}»</div>`:'';
        return `<article class="book-art-page quote-style quote-editorial-text ${side}">
          ${running}<div class="smallcaps editorial-story-kicker">${episode||'История'}</div>
          <div class="editorial-columns">
            ${pull}<p>${esc(parts.intro)}</p>
            <p>${esc(parts.rest||text)}</p>
          </div>${folio}
        </article>`;
      }
      if(design==='modern'){
        if(side==='left'){
          return `<article class="book-art-page quote-style quote-modern-left left">
            ${running}<blockquote>${safeQuote}</blockquote>${folio}
          </article>`;
        }
        return `<article class="book-art-page quote-style quote-modern-right right">
          ${running}<div class="modern-header">${title}</div>
          <div class="modern-grid"><p class="modern-lead">${esc(parts.intro)}</p><p>${esc(parts.rest||text)}</p></div>${folio}
        </article>`;
      }
      if(design==='prose'){
        if(side==='left'){
          return `<article class="book-art-page quote-style quote-prose-left left">
            ${running}<div class="smallcaps prose-kicker">quote</div>
            <blockquote>«${safeQuote}»</blockquote>${folio}
          </article>`;
        }
        return `<article class="book-art-page quote-style quote-prose-right right">
          ${running}<h2>${title}</h2>
          <div class="story"><p>${esc(text)}</p></div>
          <div class="pull">«${safeQuote}»</div>${folio}
        </article>`;
      }
      if(side==='left'){
        return `<article class="book-art-page quote-style quote-archive-left left">
          ${running}<div class="quote-mark">“</div>
          <blockquote>«${safeQuote}»</blockquote>
          <div class="rule quote-rule"></div>
          <div class="smallcaps">${episode||'Воспоминание'}</div>${folio}
        </article>`;
      }
      return `<article class="book-art-page quote-style quote-archive-right right">
        ${running}<div class="smallcaps">${episode||'История'}</div>
        <h2>${title}</h2><div class="story"><p>${esc(text)}</p></div>
        <div class="pull">«${safeQuote}»</div>${folio}
      </article>`;
    }

    if(p.kind==='cover'||p.layout==='cover'){
      const coverPhotoSrc=image(src,0);
      const coverPhoto=coverPhotoSrc?`<img class="cover-photo" src="${esc(coverPhotoSrc)}" alt="">`:'';
      return `<article class="book-art-page cover-page${coverPhoto?' has-photo':''}">
        ${coverPhoto}
        <div class="cover-kicker"><span>семейная история</span><span>${esc(bookMeta.year||'')}</span></div>
        <h1 class="cover-title">${esc(bookMeta.title||'Очерки жизни')}</h1>
        <div class="cover-rule"></div>
        <div class="cover-subtitle">${esc(bookMeta.subtitle||'История нашей семьи')}</div>
        <div class="cover-field"></div>
        <div class="cover-author">${esc(bookMeta.author||'Автор не указан')}</div>
      </article>`;
    }
    if(p.kind==='endpaper'||p.layout==='endpaper'){
      const initial=(bookMeta.title||'Очерки жизни').trim().charAt(0).toUpperCase()||'О';
      return `<article class="book-art-page endpaper-page ${side}"><div class="endpaper-mark">${esc(initial)}</div></article>`;
    }
    if(p.kind==='blank'||p.layout==='blank'){
      return `<article class="book-art-page blank-page ${side}"></article>`;
    }
    if(p.kind==='half-title'||p.layout==='half-title'){
      return `<article class="book-art-page half-title-page ${side}">
        <div class="smallcaps">Очерки жизни</div>
        <h1 class="ht-title">${esc(bookMeta.title||'Очерки жизни')}</h1>
        <div class="rule ht-sub"></div>
        <div class="smallcaps ht-meta">${esc(bookMeta.subtitle||'Семейная хроника')}</div>${folio}
      </article>`;
    }
    if(p.kind==='title'||p.layout==='title-page'){
      return `<article class="book-art-page title-page ${side}">
        <div class="smallcaps">Очерки жизни</div>
        <h1 class="tp-title">${esc(bookMeta.title||'Очерки жизни')}</h1>
        <div class="rule tp-rule"></div>
        <p class="tp-lead">${esc(bookMeta.subtitle||'Семейная хроника в воспоминаниях, фотографиях и документах.')}</p>
        <div class="smallcaps tp-author">${esc(bookMeta.author||'Автор не указан')} · ${esc(bookMeta.year||'')}</div>${folio}
      </article>`;
    }
    if(p.kind==='contents-left'){
      return `<article class="book-art-page contents-left left">
        <div class="smallcaps">Содержание</div>
        <div class="contents-no">01</div>
        <h2>Оглавление</h2>${folio}
      </article>`;
    }
    if(p.kind==='contents-right'){
      const items=(p.items||[]).map((it,i)=>`<div class="contents-item">
        <div class="ci-name">${esc(it.title||('Глава '+(i+1)))}</div>
        <div class="ci-dots"></div>
        <div class="ci-page">${it.page||''}</div>
      </div>`).join('');
      return `<article class="book-art-page contents-right ${side}">
        <div class="smallcaps contents-title">Содержание</div>
        <div class="contents-list">${items}</div>${folio}
      </article>`;
    }

    if(p.layout==='pullquote'){
      return `<article class="book-art-page pullquote-page ${side}">${running}<div class="smallcaps">Текст и цитата</div><h2>${title||'Текст и цитата'}</h2><div class="pq-body"><p>${esc(text)}</p></div><div class="pq-quote">«${esc(p.quote||quoteFrom(src)||'Память всегда точнее деталей.') }»</div>${folio}</article>`;
    }
    if(p.layout==='two-photos'){
      return `<article class="book-art-page two-photos-page ${side}">${running}<div class="smallcaps tp-label">Две фотографии</div><div class="tp-grid"><figure>${photo(p.photoIndex||0)}<figcaption>${cap(p.photoIndex||0)}</figcaption></figure><figure>${photo(p.secondPhotoIndex||1)}<figcaption>${cap(p.secondPhotoIndex||1)}</figcaption></figure></div><h2>${title||'Фотографии как часть рассказа'}</h2>${folio}</article>`;
    }
    if(p.layout==='document'){
      return `<article class="book-art-page document-page ${side}">${running}<div class="smallcaps">Документ</div><figure class="doc-fig">${photo(p.photoIndex||0)}</figure><h2>${title||'Архивный документ'}</h2><div class="doc-copy"><p>${esc(text||'На документальной странице важна точность, но композиция всё равно остаётся книжной и спокойной.')}</p></div>${folio}</article>`;
    }
    if(p.master==='MS-01'||p.layout==='chapter-mark'||p.layout==='chapter-intro'){
      return renderChapterStyled();
    }
    if(p.layout==='chapter-photo'){
      return `<article class="book-art-page chapter-photo-page chapter-photo-${side} ${side}">
        <figure>${photo(p.photoIndex||0)}</figure>
        <div class="caption">${cap(p.photoIndex||0)}</div>${folio}
      </article>`;
    }
    if(p.master==='MS-04'||p.layout==='photo-fullspread'){
      const capText=cap(p.photoIndex||0)||esc([inferred.place,inferred.date].filter(Boolean).join(' · '))||episode||title;
      if(side==='left'){
        return `<article class="book-art-page chapter-fullspread-left left">
          <div class="fullspread-frame">${photo(p.photoIndex||0)}</div>
          <div class="fullspread-scrim"></div>
          ${running}
          ${capText?`<div class="fullspread-caption">${capText}</div>`:''}${folio}
        </article>`;
      }
      return `<article class="book-art-page chapter-fullspread-right right">
        <div class="fullspread-frame">${photo(p.photoIndex||0)}</div>
        <div class="fullspread-scrim"></div>
        ${running}${folio}
      </article>`;
    }
    if(p.layout==='photo-collage'){
      // Edge-to-edge photo grid, no padding/frame around any tile — the
      // v7 reference used a padded, boxed grid on one page and a bare
      // full-bleed photo elsewhere; this keeps the treatment consistent
      // with the rest of the book's full-bleed photo pages.
      const idxs=(Array.isArray(p.photoIndices)&&p.photoIndices.length?p.photoIndices:[p.photoIndex||0]);
      const tiles=idxs.map(i=>`<div class="collage-tile">${photo(i)}</div>`).join('');
      const capText=cap(idxs[0])||esc([inferred.place,inferred.date].filter(Boolean).join(' · '))||episode||title;
      return `<article class="book-art-page chapter-collage-left left">
        <div class="collage-grid collage-grid-${idxs.length}">${tiles}</div>
        <div class="fullspread-scrim"></div>
        ${running}
        ${capText?`<div class="fullspread-caption">${capText}</div>`:''}${folio}
      </article>`;
    }
    if(p.layout==='full-photo'||p.layout==='prose-photo'||p.layout==='photo-left-page'){
      return `<article class="book-art-page photo-editorial-page photo-editorial-${side} ${side}">
        <figure>${photo(p.photoIndex||0)}</figure>
        ${cap(p.photoIndex||0)?`<div class="caption">${cap(p.photoIndex||0)}</div>`:''}${folio}
      </article>`;
    }
    if(p.layout==='editorial-prose'||((p.master==='MS-03'||p.master==='MS-05')&&p.layout==='prose')){
      return `<article class="book-art-page photo-editorial-text photo-editorial-${side} ${side}">
        <div class="smallcaps editorial-label">${episode||'Семейный архив'}</div>
        ${p.showSecondaryPhoto&&cap(p.photoIndex||0)?`<figure class="secondary-photo">${photo(p.photoIndex||0)}</figure>`:''}
        ${p.showSecondaryPhoto&&cap(p.photoIndex||0)?`<div class="caption secondary-caption">${cap(p.photoIndex||0)}</div>`:''}
        <div class="copy"><h2>${title}</h2><div class="columns"><p>${esc(text)}</p></div></div>${folio}
      </article>`;
    }
    if(p.master==='MS-06'||p.layout==='quote'){
      return renderQuoteStyled();
    }

    if(p.kind==='dedication'){
      const dedicationText=p.dedicationText||'Эта книга — для тех, кто был рядом, чьи голоса, жесты и истории продолжают жить в нашей памяти.';
      const dedicationSign=p.dedicationSign||'С любовью и благодарностью семье';
      return `<article class="book-art-page dedication-page ${side}">
        ${running}<div class="smallcaps dedication-kicker">Посвящение</div>
        <blockquote>${esc(dedicationText)}</blockquote>
        <div class="dedication-sign">${esc(dedicationSign)}</div>${folio}
      </article>`;
    }
    if(p.kind==='epigraph'){
      return `<article class="book-art-page epigraph-page ${side}">
        ${running}<div class="smallcaps epigraph-kicker">Эпиграф</div>
        <blockquote>«${esc(p.epigraphText||'')}»</blockquote>
        ${p.epigraphSource?`<div class="epigraph-source">— ${esc(p.epigraphSource)}</div>`:''}${folio}
      </article>`;
    }
    if(p.kind==='dark-quote'){
      return `<article class="book-art-page dark-quote-page ${side}">
        ${running}<div class="smallcaps dark-quote-kicker">${p.source?esc(p.source):'Из главы'}</div>
        <blockquote>«${esc(p.quote||'')}»</blockquote>${folio}
      </article>`;
    }
    if(p.kind==='document-comment'){
      return `<article class="book-art-page document-comment-page ${side}">
        ${running}<div class="smallcaps dc-kicker">Документ и комментарий</div>
        <figure class="dc-doc">${photo(0)}</figure>
        <div class="dc-copy"><h2>${title||'Архивный документ'}</h2><p>${esc(text||'На этой странице документ становится не приложением, а частью повествования: рядом остаётся спокойный авторский комментарий, который объясняет контекст и удерживает ритм книги.')}</p></div>${folio}
      </article>`;
    }
    if(p.layout==='document-letter'){
      return `<article class="book-art-page document-letter-page ${side}">
        ${running}<div class="document-letter-date">${esc([inferred.place,inferred.date].filter(Boolean).join(', ')||'Из семейного архива')}</div>
        <blockquote>«${esc(text)}»</blockquote>
        <div class="document-letter-source">— из письма, архив семьи</div>${folio}
      </article>`;
    }
    if(p.kind==='timeline'){
      const items=(p.items||[]).map(it=>`<div class="tl-item"><div class="tl-year">${esc(it.year||'')}</div><div class="tl-dot"></div><div class="tl-text">${esc(it.text||'')}</div></div>`).join('');
      return `<article class="book-art-page timeline-page ${side}">${running}<div class="smallcaps">Хронология</div><h2>${title||'Ход времени'}</h2><div class="tl-line"></div><div class="tl-items">${items}</div>${folio}</article>`;
    }
    if(p.kind==='map'){
      return `<article class="book-art-page map-page ${side}">${running}<div class="smallcaps">Карта пути</div><h2>${title||'Маршрут семьи'}</h2><div class="map-box"><div class="map-route"></div><div class="map-point mp1"></div><div class="map-point mp2"></div><div class="map-point mp3"></div><div class="map-label ml1">Греция</div><div class="map-label ml2">Карс</div><div class="map-label ml3">Ташкент</div></div><div class="map-note">${esc(text||'Схематическая карта фиксирует путь семьи и поддерживает документальный характер книги.')}</div>${folio}</article>`;
    }
    if(p.kind==='family-tree'){
      return `<article class="book-art-page family-tree-page ${side}">${running}<div class="smallcaps">Семейное дерево</div><h2>${title||'Родословная'}</h2><div class="tree"><div class="tree-line v1"></div><div class="tree-line h1"></div><div class="tree-line v2"></div><div class="tree-line v3"></div><div class="tree-node n1"><strong>Николай Фёдорович</strong><span>старшее поколение</span></div><div class="tree-node n2"><strong>Фёдор</strong><span>ветвь семьи</span></div><div class="tree-node n4"><strong>Лазарь</strong><span>ветвь семьи</span></div><div class="tree-node n3"><strong>Эвридика</strong><span>ветвь семьи</span></div></div>${folio}</article>`;
    }
    if(p.kind==='epilogue'){
      return `<article class="book-art-page epilogue-page ${side}">${running}<div class="smallcaps">Послесловие</div><h2>${title||'После слова'}</h2><div class="ep-copy"><p>${esc(text||'Когда история семьи собрана на страницах, она перестаёт быть набором отдельных эпизодов и становится общим пространством памяти. Именно это пространство и хочется сохранить для следующих поколений.')}</p></div>${folio}</article>`;
    }
    if(p.kind==='thanks'){
      return `<article class="book-art-page thanks-page ${side}">${running}<div class="smallcaps">Благодарность</div><h2>${title||'Спасибо'}</h2><div class="th-copy"><p>${esc(text||'Спасибо всем, кто делился воспоминаниями, искал фотографии, поднимал документы и помогал этой книге обрести форму.')}</p></div>${folio}</article>`;
    }
    if(p.kind==='final'){
      return `<article class="book-art-page final-page ${side}">${running}<div class="smallcaps">Финал</div><div class="fn-copy"><h2>${esc(bookMeta.title||title||'Очерки жизни')}</h2><p>${esc(text||'История не заканчивается на последней странице. Она продолжается в тех, кто читает, помнит и передаёт дальше.')}</p></div><div class="fn-sign">${esc(bookMeta.author||'Семейная книга')} · ${esc(bookMeta.year||'')}</div>${folio}</article>`;
    }
    if(p.kind==='back-cover'||p.layout==='back-cover'){
      return `<article class="book-art-page back-cover-page">
        <div class="back-copy"><h2>${esc(bookMeta.title||'Очерки жизни')}</h2>
        <p>История семьи складывается из голосов, фотографий, документов и деталей, которые важно успеть сохранить.</p></div>
        <div class="back-mark">${esc(bookMeta.author||'Семейная хроника')} · ${esc(bookMeta.year||'')}</div>
      </article>`;
    }
    if(p.kind==='intro'){
      return `<article class="book-art-page note-page ${side}">${running}<div class="smallcaps">Вступление</div><h2>${title||'Вступление'}</h2><div class="nt-copy"><p>${esc(text||'Эта книга собрана из воспоминаний, фотографий и документов — не как строгая хроника, а как пространство, в которое можно возвращаться и находить новые детали.')}</p></div>${folio}</article>`;
    }
    if(p.kind==='author-note'){
      return `<article class="book-art-page note-page ${side}">${running}<div class="smallcaps">От автора</div><h2>${title||'От автора'}</h2><div class="nt-copy"><p>${esc(text||'Я собирал эту книгу с благодарностью к тем, кто делился памятью, и с надеждой, что она останется живой частью семейной истории для тех, кто придёт после нас.')}</p></div>${folio}</article>`;
    }
    if(p.kind==='sources'){
      return `<article class="book-art-page note-page ${side}">${running}<div class="smallcaps">Источники и архив</div><h2>${title||'Источники и архив'}</h2><div class="nt-copy"><p>${esc(text||'В основу книги легли семейные архивы: письма, фотографии, документы и устные воспоминания, бережно собранные и сверенные при подготовке издания.')}</p></div>${folio}</article>`;
    }
    if(p.kind==='colophon'){
      const rows=(p.rows||[]).filter(r=>r.value).map(r=>`<div class="cl-row"><div class="cl-label">${esc(r.label)}</div><div class="cl-value">${esc(r.value)}</div></div>`).join('');
      return `<article class="book-art-page colophon-page ${side}">
        <div class="smallcaps cl-kicker">Выходные данные</div>
        <div class="cl-list">${rows||`<div class="cl-row"><div class="cl-label">Издание</div><div class="cl-value">${esc(bookMeta.year||'')}</div></div>`}</div>${folio}
      </article>`;
    }
    {
      // Editorial dense-text spreads (MS-08): avoid repeating the chapter heading on every
      // page, and break up a long run of identical two-column pages with an occasional pull-quote.
      const isEditorialDense=design==='editorial'&&p.master==='MS-08';
      const showHeading=!isEditorialDense||p.showHeading!==false;
      const pullBlock=isEditorialDense&&p.pullQuote?`<div class="reading-pull">«${esc(p.pullQuote)}»</div>`:'';
      return `<article class="book-art-page reading-page ${side}">
        ${running}<div class="smallcaps">${episode||'Очерки жизни'}</div>
        ${showHeading?`<h2>${title}</h2>`:''}<div class="reading-columns">${pullBlock}<p>${esc(text)}</p></div>${folio}
      </article>`;
    }
  }

  function renderBookPage(p,side='right'){
    if(!p)return `<div class="book-page"><div class="book-preview-empty">Пустая страница</div></div>`;
    const masterRendered=renderMasterSpreadPage(p,side);
    if(masterRendered)return masterRendered;
    const run=esc(p.episode||p.title||'Очерки жизни');
    const title=esc(p.title||'');
    const text=esc(p.text||'');
    const cap=esc(caption(p.source,p.photoIndex));
    const folio=`<div class="bp-folio">${p.pageNo}</div>`;

    if(p.layout==='chapter-mark'){
      return `<article class="book-page bp-chapter-mark">
        <div class="bp-run">${run}</div>
        <div class="bp-index">${String(p.chapterNo||'01').padStart(2,'0')}</div>
        <div class="bp-kicker">${esc(p.episode||'Глава')}</div>
        <div class="bp-rule"></div>
        <h2>${title}</h2>${folio}
      </article>`;
    }
    if(p.layout==='chapter-intro'){
      return `<article class="book-page bp-chapter-intro">
        <div class="bp-run">${run}</div>
        <div class="bp-kicker">${esc(p.episode||'Глава')}</div>
        <div class="bp-rule"></div>
        <h2>${title}</h2>
        <div class="bp-text"><p>${text}</p></div>${folio}
      </article>`;
    }
    if(p.layout==='photo-left-page'){
      return `<article class="book-page bp-full-photo">
        <figure>${pageImage(p,p.photoIndex)}</figure><div class="bp-overlay"></div>
        ${cap?`<div class="bp-caption">${cap}</div>`:''}${folio}
      </article>`;
    }
    if(p.layout==='editorial-prose'){
      return `<article class="book-page bp-editorial">
        <div class="bp-run">${run}</div>
        <figure class="bp-inset">${pageImage(p,p.photoIndex)}</figure>
        <div class="bp-copy"><h3>${title}</h3><p>${text}</p></div>
        ${cap?`<div class="bp-sidecaption">${cap}</div>`:''}${folio}
      </article>`;
    }
    if(p.layout==='opening-photo' || p.layout==='opening-type'){
      return `<article class="book-page bp-opening">
        <div class="bp-run">${run}</div>
        <div class="bp-kicker">${esc(p.episode||'Глава')}</div>
        <div class="bp-rule"></div>
        <h2>${title}</h2>
        ${p.layout==='opening-photo'?`<figure class="bp-hero">${pageImage(p,p.photoIndex)}</figure>`:''}
        ${text?`<p class="bp-lead">${text}</p>`:''}
        ${folio}
      </article>`;
    }
    if(p.layout==='photo-top'){
      return `<article class="book-page bp-photo-top">
        <div class="bp-run">${run}</div>
        <figure class="bp-photo">${pageImage(p,p.photoIndex)}</figure>
        ${cap?`<div class="bp-caption">${cap}</div>`:''}
        <h3>${title}</h3><p>${text}</p>${folio}
      </article>`;
    }
    if(p.layout==='photo-left'){
      return `<article class="book-page bp-photo-left">
        <figure class="bp-photo">${pageImage(p,p.photoIndex)}</figure>
        <div class="bp-copy"><div class="bp-kicker">${run}</div><div class="bp-rule"></div><h3>${title}</h3><p>${text}</p></div>${folio}
      </article>`;
    }
    if(p.layout==='photo-right'){
      return `<article class="book-page bp-photo-right">
        <div class="bp-copy"><div class="bp-kicker">${run}</div><div class="bp-rule"></div><h3>${title}</h3><p>${text}</p></div>
        <figure class="bp-photo">${pageImage(p,p.photoIndex)}</figure>${folio}
      </article>`;
    }
    if(p.layout==='full-photo'){
      return `<article class="book-page bp-full-photo">
        <figure>${pageImage(p,p.photoIndex)}</figure><div class="bp-overlay"></div>
        ${cap?`<div class="bp-caption">${cap}</div>`:''}${folio}
      </article>`;
    }
    if(p.layout==='two-photos'){
      const cap2=esc(caption(p.source,p.secondPhotoIndex));
      return `<article class="book-page bp-two-photos">
        <div class="bp-run">${run}</div>
        <div class="bp-grid"><figure>${pageImage(p,p.photoIndex)}${cap?`<figcaption>${cap}</figcaption>`:''}</figure><figure>${pageImage(p,p.secondPhotoIndex)}${cap2?`<figcaption>${cap2}</figcaption>`:''}</figure></div>
        <h3>${title}</h3>${folio}
      </article>`;
    }
    if(p.layout==='quote'){
      return `<article class="book-page bp-quote">
        <div class="bp-run">${run}</div>
        <blockquote>«${esc(p.quote||p.title)}»</blockquote><div class="bp-rule"></div>${folio}
      </article>`;
    }
    if(p.layout==='document'){
      return `<article class="book-page bp-document">
        <div class="bp-run">${run}</div>
        <figure class="bp-doc">${pageImage(p,p.photoIndex)}</figure>
        <div class="bp-copy"><h3>${title}</h3><p>${text}</p></div>${folio}
      </article>`;
    }
    if(p.layout==='pullquote'){
      return `<article class="book-page bp-pullquote">
        <div class="bp-run">${run}</div><h3>${title}</h3>
        <p>${text}</p>
        <div class="bp-pq">«${esc(p.quote||p.episode||p.title)}»</div>${folio}
      </article>`;
    }
    return `<article class="book-page bp-prose ${p.layout==='prose-dense'?'dense':''}">
      <div class="bp-run">${run}</div><h3>${title}</h3><div class="bp-text"><p>${text}</p></div>${folio}
    </article>`;
  }

  const FORMAT_SIZES=window.OcherkiLayoutPagination.FORMATS;
  function currentPageSize(){ return FORMAT_SIZES[activeFormat]||FORMAT_SIZES.square; }

  // One canvas contract for thumbnails and the full preview. Keeping the
  // wrapper identical prevents the miniature from inventing its own crop,
  // padding, or text baseline.
  function pageCanvasHost(p,side,hostKind='mini',single=false){
    const hostClass=hostKind==='preview'?'book-preview-half':'bd-page-mini';
    const designClass=hostKind==='preview'?` bd-design-${activeDesign}`:'';
    const source=p?.sourcePageUid||'';
    const section=p?.sectionId||'';
    const master=p?.master||'';
    const attrs=` data-source="${esc(source)}" data-section="${esc(section)}"`;
    return `<div class="${hostClass} ${side}${single?' single':''} page-canvas-host${designClass}" data-master="${esc(master)}"${attrs}><div class="page-canvas">${renderBookPage(p,side)}</div></div>`;
  }

  // v250: all the sizes are read first and the pages set after (reading after each write laid the whole page out again for every page)
  function scaleAllPageCanvases(){
    const [pageW,pageH]=currentPageSize();const todo=[];
    document.querySelectorAll('.page-canvas-host').forEach(host=>{
      const canvas=host.querySelector(':scope > .page-canvas');
      if(!canvas)return;
      const w=host.clientWidth || host.offsetWidth || host.getBoundingClientRect().width;
      const h=host.clientHeight || host.offsetHeight || host.getBoundingClientRect().height;
      if(!(w>1) || !(h>1)) return;
      todo.push([canvas,w,h]);
    });
    for(const [canvas,w,h] of todo){
      const scale=Math.max(.001,Math.min(w/pageW,h/pageH));
      const k=pageW+'|'+pageH+'|'+scale+'|'+w+'|'+h;if(canvas._ocScale===k)continue;canvas._ocScale=k;
      canvas.style.width=pageW+'px';
      canvas.style.height=pageH+'px';
      canvas.style.transform=`scale(${scale})`;
      canvas.style.left=Math.round((w-pageW*scale)/2)+'px';
      canvas.style.top=Math.round((h-pageH*scale)/2)+'px';
    }
  }

  const pageCanvasResizeObserver=new ResizeObserver(()=>{
    requestAnimationFrame(scaleAllPageCanvases);
  });
  function observePageCanvasHosts(){
    document.querySelectorAll('.page-canvas-host').forEach(el=>{
      if(!el.dataset.canvasObserved){
        el.dataset.canvasObserved='1';
        pageCanvasResizeObserver.observe(el);
      }
    });
  }

  function mini(p,side,single=false){
    if(!p)return `<div class="bd-page-mini ${side}"></div>`;
    const inner=renderBookPage(p,side);
    // A page with photographs points to the manuscript page those photos
    // belong to, so a click opens the sheet with the same photos.
    const photoIdx=Number.isInteger(p.photoIndex)?p.photoIndex:Array.isArray(p.photoIndices)?p.photoIndices[0]:(p.t10?.main?.index);
    const photoSource=Number.isInteger(photoIdx)?String(p.source?.photos?.[photoIdx]?._sourcePageUid||''):'';
    return `<div class="bd-page-mini ${side}${single?' single':''} page-canvas-host" data-source="${esc(p.sourcePageUid)}" data-section="${esc(p.sectionId)}"${photoSource?` data-photo-source="${esc(photoSource)}"`:''}><div class="page-canvas">${inner}</div></div>`;
  }

  // A strip showing how the book breathes (text, photo, pause, dark accent,
  // chapter/episode openings) and up to three plain-language tips about the
  // material, shown above the spread thumbnails.
  function bookAdviceMarkup(){
    if(activeDesign!=='editorial')return '';
    const kind=sp=>{
      const m=String(sp.master||''),pages=[sp.left,sp.right].filter(Boolean);
      if(/CHAPTER|EPISODE-OPENING/.test(m))return ['open','Открытие главы или эпизода'];
      if(pages.some(p=>p.p01Variant==='C'||p.t12Tone==='B'))return ['dark','Тёмный акцент'];
      if(/T08|CONTINUATION|ENDPAPER|NOTES|DEDICATION|EPIGRAPH|TITLES|CONTENTS|AFTERWORD|SOURCES|COLOPHON|INTRO/.test(m))return ['pause','Пауза'];
      if(pages.some(p=>p.measuredFlow)&&!pages.some(p=>!p.measuredFlow&&p.kind!=='blank'))return ['text','Текст'];
      return ['photo','Фото'];
    };
    const strip=bookSpreads.map((sp,i)=>{const [k,t]=kind(sp);return `<i class="bd-rhythm-${k}" title="Разворот ${i+1}: ${t}"></i>`;}).join('');
    const tips=[];
    // An author's note or quote that did not fit: the page was set without it.
    (window.__ocherkiLastWarnings||[]).filter(w=>w&&w.code==='ACCENT_UNFIT'&&w.automatic===false).slice(0,2).forEach(w=>tips.push(`${w.kind==='quote'?'Цитата':'Заметка на поле'} «${esc(String(w.text||'').replace(/\s+/g,' ').slice(0,40))}» не поместилась в две строки${(()=>{const i=bookSpreads.findIndex(sp=>[sp?.left,sp?.right].some(pg=>pg&&(pg.inlineQuote===w.text||pg.marginNote===w.text||pg.requestedMaster===w.template&&pg.sourcePageUid)));return i>=0?` (разворот ${i+1})`:'';})()} — сократите её в редакторе.`));
    const chapterSections=(structure?.sections||[]).filter(s=>s&&s.type==='chapter'&&s.included!==false);
    const allPhotos=chapterSections.flatMap(s=>(s.pages||[]).flatMap(p=>p.photos||[]));
    chapterSections.filter(s=>(s.pages||[]).some(p=>String(p.text||'').trim())&&!(s.pages||[]).some(p=>(p.photos||[]).length)).slice(0,1).forEach(s=>tips.push(`В главе «${esc(String(s.title||'').replace(/^Глава\s+\d+[.:]?\s*/i,''))}» нет фотографий — добавьте хотя бы одну, и глава станет живее.`));
    if(allPhotos.length>=3&&!allPhotos.some(p=>p.portraitHero))tips.push('Отметьте в окне фото «Портрет героя книги» — книга выделит этого человека отдельным разворотом.');
    const noCaption=allPhotos.filter(p=>!p.caption&&!p.year&&!p.place).length;
    if(noCaption)tips.push(`У ${noCaption} фото нет подписи. Подпись, год и место появятся внизу страницы рядом с фото.`);
    // Readiness as steps, not a percentage: what is still missing for a good book.
    const textOf=s=>(s.pages||[]).map(p=>p.sample?'':String(p.text||'')).join('').trim().length;
    const emptyChapter=chapterSections.find(s=>textOf(s)<3000);
    if(emptyChapter)tips.unshift(`Глава «${esc(String(emptyChapter.title||'').replace(/^Глава\s+\d+[.:]?\s*/i,''))}» пока короткая — допишите хотя бы на один разворот.`);
    const coverText=String((structure?.sections||[]).find(s=>s.id==='title'||s.id==='cover')?.pages?.[0]?.text||'').trim();
    if(!coverText)tips.push('Впишите название книги на обложке.');
    const tree=(structure?.sections||[]).find(s=>s.id==='family-tree');
    if(tree&&tree.included!==false&&!String(tree.pages?.[0]?.text||'').trim())tips.push('Заполните семейное древо — хватит нескольких имён.');
    if(bookSpreads.length&&bookSpreads.length*2<24)tips.push(`В книге ${bookSpreads.length*2} страниц — для печати нужно хотя бы 24.`);
    const steps=tips.length;
    const word=n=>n%10===1&&n%100!==11?'шаг':n%10>=2&&n%10<=4&&(n%100<10||n%100>=20)?'шага':'шагов';
    const head=steps?`<div class="bd-ready-head">До хорошей книги ${steps===1?'остался':'осталось'} ${steps} ${word(steps)}</div>`:'<div class="bd-ready-head is-done">Книга готова — можно смотреть и заказывать</div>';
    return `<div class="bd-book-rhythm">${head}${steps?`<ul class="bd-book-tips">${tips.slice(0,6).map(t=>`<li>${t}</li>`).join('')}</ul>`:''}</div>`;
  }
  function renderRightPanel(){
    if(!rowsEl)return;
    if(!built){
      rowsEl.innerHTML=buildMessage||`<div class="book-build-hint">Нажмите «Посмотреть книгу», чтобы увидеть готовые развороты.</div>`;
      if(countEl&&!buildMessage)countEl.textContent='не собрано';
      return;
    }
    if(countEl)countEl.textContent=`${bookSpreads.length} разв. · ${bookPages.length} стр.`;
    const [pageW,pageH]=currentPageSize();
    const spreadRatio=`${pageW*2}/${pageH}`;
    const rowMarkup=[];
    for(let rowStart=0;rowStart<bookSpreads.length;rowStart+=2){
      const rowEnd=Math.min(rowStart+1,bookSpreads.length-1);
      const items=bookSpreads.slice(rowStart,rowStart+2).map((sp,offset)=>{
        const i=rowStart+offset;
        const isSingle=!!sp.single;
        const singlePage=sp.single==='right'?sp.right:sp.left;
        const singleSide=sp.single==='right'?'right':'left';
        const pagesHtml=isSingle?mini(singlePage,singleSide,true):`${mini(sp.left,'left')}${mini(sp.right,'right')}`;
        const pageLabel=isSingle?(singlePage?.kind==='cover'?'Обложка':singlePage?.kind==='back-cover'?'Задняя обложка':String(singlePage?.pageNo||'')):`${sp.left?.pageNo||''}${sp.right?'–'+sp.right.pageNo:''}`;
        return `<div class="bd-spread-item">
          <button class="bd-spread-card bd-design-${activeDesign} ${isSingle?'is-single ':''}${i===activeSpread?'is-active':''}" type="button" data-spread="${i}" data-master="${sp.master||''}" data-format="${activeFormat}" style="aspect-ratio:${isSingle?`${pageW}/${pageH}`:spreadRatio}" aria-current="${i===activeSpread?'true':'false'}">
            ${pagesHtml}
          </button>
          <div class="bd-spread-meta">${pageLabel}</div>
        </div>`;
      }).join('');
      rowMarkup.push(`<div class="bd-spread-row ${activeSpread>=rowStart&&activeSpread<=rowEnd?'is-active':''}" data-row-start="${rowStart}" data-row-end="${rowEnd}" style="--spread-i:${Math.floor(rowStart/2)}">
        <div class="bd-spread-pair">${items}</div>
      </div>`);
    }
    rowsEl.innerHTML=bookAdviceMarkup()+rowMarkup.join('');
    updateRhythmWarning();
    // Decode the visible spread first; the rest of the editorial stack may
    // remain deferred without making the active sheet appear translucent.
    rowsEl.querySelector(`.bd-spread-card[data-spread="${activeSpread}"]`)?.querySelectorAll('img').forEach(img=>{
      img.loading='eager';
      img.fetchPriority='high';
    });
    buildDots();
    if(revealSpreadsOnRender){
      rowsEl.classList.remove('is-revealing-spreads');
      void rowsEl.offsetWidth;
      rowsEl.classList.add('is-revealing-spreads');
      revealSpreadsOnRender=false;
      window.setTimeout(()=>rowsEl.classList.remove('is-revealing-spreads'),1400);
    }
    requestAnimationFrame(()=>{fitViewport();layoutTimeline(false);observePageCanvasHosts();scaleAllPageCanvases();scrollActive()});
  }

  rowsEl?.addEventListener('click',e=>{
    const page=e.target.closest('.bd-page-mini[data-source]');
    const card=e.target.closest('.bd-spread-card');
    if(!card)return;
    const targetSpread=Number(card.dataset.spread)||0;
    const previousSpread=activeSpread;
    previewPendingTarget=null;
    previewPinnedTarget=null;
    previewCompositionOverride=null;
    activeSpread=targetSpread;
    renderActiveOnly({previousSpread,animate:targetSpread!==previousSpread});
    // A click anywhere on a spread opens its text page in the editor (the
    // page clicked, else the spread's first page that has a manuscript page).
    const target=page||card.querySelector('.bd-page-mini[data-photo-source]')||card.querySelector('.bd-page-mini[data-source][data-section]');
    if(target){
      send({action:'select',sectionId:target.dataset.section,pageUid:target.dataset.photoSource||target.dataset.source});
    }
  });

  let spreadMotionTimer=0;
  function clearSpreadMotion(){
    window.clearTimeout(spreadMotionTimer);
    rowsEl?.querySelectorAll('.is-spread-entering,.is-spread-leaving,.turn-forward,.turn-backward').forEach(card=>{
      card.classList.remove('is-spread-entering','is-spread-leaving','turn-forward','turn-backward');
    });
  }
  function animateSpreadSelection(previousSpread,targetSpread){
    if(previousSpread===targetSpread)return;
    clearSpreadMotion();
    const direction=targetSpread>previousSpread?'forward':'backward';
    const previousCard=rowsEl?.querySelector(`.bd-spread-card[data-spread="${previousSpread}"]`);
    const targetCard=rowsEl?.querySelector(`.bd-spread-card[data-spread="${targetSpread}"]`);
    previousCard?.classList.add('is-spread-leaving',`turn-${direction}`);
    targetCard?.classList.add('is-spread-entering',`turn-${direction}`);
    spreadMotionTimer=window.setTimeout(clearSpreadMotion,720);
  }
  function renderActiveOnly(options={}){
    const previousSpread=Number.isInteger(options.previousSpread)?options.previousSpread:activeSpread;
    rowsEl?.querySelectorAll('.bd-spread-row').forEach(r=>{
      const containsActive=!!r.querySelector(`.bd-spread-card[data-spread="${activeSpread}"]`);
      r.classList.toggle('is-active',containsActive);
    });
    rowsEl?.querySelectorAll('.bd-spread-card').forEach(card=>{
      const selected=Number(card.dataset.spread)===activeSpread;
      card.classList.toggle('is-active',selected);
      card.setAttribute('aria-current',selected?'true':'false');
    });
    if(options.animate)animateSpreadSelection(previousSpread,activeSpread);
    layoutTimeline(true);scrollActive();
  }
  function rows(){return [...(rowsEl?.querySelectorAll('.bd-spread-row')||[])]}
  function fitViewport(){
    if(!spreadsViewport)return;
    /* UX polish: the design/format controls must not jump when page aspect changes. */
    const h=330;
    spreadsViewport.style.height=h+'px';
    spreadsViewport.style.minHeight=h+'px';
  }
  let spreadScrollFrame=0;
  function smoothSpreadScroll(target,duration=560){
    if(!spreadsViewport)return;
    cancelAnimationFrame(spreadScrollFrame);
    const max=Math.max(0,spreadsViewport.scrollHeight-spreadsViewport.clientHeight);
    const end=Math.max(0,Math.min(max,target));
    const start=spreadsViewport.scrollTop;
    const distance=end-start;
    if(Math.abs(distance)<1){spreadsViewport.scrollTop=end;return;}
    const began=performance.now();
    const ease=t=>1-Math.pow(1-t,4);
    const tick=now=>{
      const progress=Math.min(1,(now-began)/duration);
      spreadsViewport.scrollTop=start+distance*ease(progress);
      if(progress<1)spreadScrollFrame=requestAnimationFrame(tick);
    };
    spreadScrollFrame=requestAnimationFrame(tick);
  }
  function scrollActive(){
    const card=rowsEl?.querySelector(`.bd-spread-card[data-spread="${activeSpread}"]`);
    const r=card?.closest('.bd-spread-row');
    if(!r||!spreadsViewport)return;
    const target=r.offsetTop-(spreadsViewport.clientHeight-r.offsetHeight)/2;
    smoothSpreadScroll(target);
  }
  function centers(){
    if(!track)return[];
    const tr=track.getBoundingClientRect();
    return rows().map(r=>{const b=r.getBoundingClientRect();return b.top+b.height/2-tr.top});
  }
  function buildDots(){
    if(!track)return;
    track.querySelectorAll('.bd-timeline-dot').forEach(x=>x.remove());
    dots=rows().map(()=>{const d=document.createElement('div');d.className='bd-timeline-dot';track.appendChild(d);return d});
  }
  function layoutTimeline(animate=true){
    const c=centers();if(!c.length||!handle||!fill)return;
    const activeRow=Math.floor(activeSpread/2);
    c.forEach((y,i)=>{if(dots[i]){dots[i].style.top=y+'px';dots[i].classList.toggle('is-active',i===activeRow)}});
    const y=c[Math.max(0,Math.min(activeRow,c.length-1))];
    if(!animate){
      const ht=handle.style.transition,ft=fill.style.transition;
      handle.style.transition='none';fill.style.transition='none';
      handle.style.top=y+'px';fill.style.height=y+'px';
      void handle.offsetWidth;handle.style.transition=ht;fill.style.transition=ft;
    }else{
      handle.style.top=y+'px';fill.style.height=y+'px';
    }
  }

  // A failed build can be saved as a small report: the book's text and
  // settings with every photo replaced by its size, the error and the screen.
  let lastBuildError=null;
  function saveBuildReport(){
    const strip=value=>Array.isArray(value)?value.map(strip):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([key,item])=>[key,typeof item==='string'&&(item.startsWith('data:')||item.length>2000&&/^[A-Za-z0-9+/=]+$/.test(item.slice(0,200)))?`[файл ${item.length} знаков]`:strip(item)])):value;
    const report={createdAt:new Date().toISOString(),error:{message:String(lastBuildError?.message||''),stack:String(lastBuildError?.stack||'')},
      screen:{width:innerWidth,height:innerHeight,devicePixelRatio,userAgent:navigator.userAgent},design:activeDesign,structure:strip(structure)};
    const url=URL.createObjectURL(new Blob([JSON.stringify(report,null,1)],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download=`ocherki-otchet-${Date.now()}.json`;document.body.appendChild(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),2000);
  }
  document.addEventListener('click',event=>{if(event.target.closest?.('.bd-build-report'))saveBuildReport();});

  // A change in the manuscript only marks the book as changed: rebuilding a
  // whole book takes seconds and used to freeze the constructor after every
  // edit. It is rebuilt by the button or when the preview is opened.
  let bookOutdated=false;
  function markBookOutdated(){
    bookOutdated=true;
    if(buildBtn&&!buildBtn.disabled){buildBtn.textContent='Посмотреть книгу';buildBtn.classList.add('is-outdated');}
  }
  window.OCHERKI_MARK_BOOK_OUTDATED=markBookOutdated;
  // A visible note beside the right-hand keys: why the book did not open
  // (the old spreads panel that used to show it is folded away).
  function showBookNotice(html,withReport){
    if(window.__ocherkiQuietBuild)return;
    let box=document.getElementById('bookNotice');
    if(!box){box=document.createElement('div');box.id='bookNotice';box.className='book-notice';document.body.appendChild(box);
      box.addEventListener('click',event=>{if(event.target.closest('[data-notice-close]'))box.hidden=true;});}
    box.innerHTML=`<button type="button" class="book-notice-close" data-notice-close aria-label="Закрыть">×</button><div class="book-notice-text">${html}</div>${withReport?'<p class="bd-build-report-note">Нажмите «Сохранить отчёт» и пришлите файл — по нему ошибку найдут точно. В отчёте только текст книги и подписи, без фотографий.</p><button type="button" class="bd-build-report">Сохранить отчёт</button>':''}`;
    box.hidden=false;hideBuilding();
  }
  window.__ocherkiShowBookNotice=showBookNotice;
  // While the book is being put together: a calm «Собираю книгу…» in the
  // middle of the screen, so the wait never looks like nothing is happening.
  function showBuilding(){
    // v109: never over an open book (it used to stay there after a quick re-open).
    if(document.querySelector('.shell')?.classList.contains('is-book-preview'))return;
    let el=document.getElementById('bookBuilding');
    if(!el){el=document.createElement('div');el.id='bookBuilding';el.className='book-building';el.innerHTML='<div class="book-building-card"><i></i><span>Собираю книгу…</span></div>';document.body.appendChild(el);}
    clearTimeout(showBuilding.guard);showBuilding.guard=setTimeout(hideBuilding,25000);
    showBuilding.want=true;requestAnimationFrame(()=>{if(showBuilding.want)el.classList.add('is-on');});
  }
  function hideBuilding(){showBuilding.want=false;document.getElementById('bookBuilding')?.classList.remove('is-on');}
  new MutationObserver(()=>{if(document.querySelector('.shell')?.classList.contains('is-book-preview'))hideBuilding();}).observe(document.querySelector('.shell'),{attributes:true,attributeFilter:['class']});
  function hideBookNotice(){const box=document.getElementById('bookNotice');if(box)box.hidden=true;}
  // v105: the book is laid out quietly in the background a few seconds
  // after the last change, so «Книга» opens at once.
  function bookKey(){return directorContentFingerprint+'|'+activeFormat+'|'+activeDesign;}
  const bookFresh=()=>built&&bookSpreads.length&&!bookOutdated&&window.__ocherkiBuiltKey===bookKey();
  let prebuildT=0;
  // v250: the book is no longer laid out in the background — it is laid out when «Книга» is opened (the boy with the kite meanwhile)
  // and when «обновить» is pressed under «Так ляжет»; laid out behind the hands it held the page a second or more while one typed
  function schedulePrebuild(delay=2600){clearTimeout(prebuildT);if(window.OCHERKI_BACKGROUND_BOOK)prebuildT=setTimeout(prebuild,delay);}
  // v192: the quiet layout holds the page for a few seconds on a slower computer — it waits until the hands are off the mouse
  // and keys for a while (the first seconds after opening are the busiest, so it never runs then)
  let lastInput=performance.now();const touch=()=>{lastInput=performance.now();};
  const hookInput=w=>{try{if(!w||w.__ocPbHook)return;w.__ocPbHook=true;['pointerdown','pointermove','keydown','wheel','input'].forEach(t=>w.addEventListener(t,touch,{passive:true,capture:true}));}catch(_){}};
  hookInput(window);
  function prebuild(){
    if(!structure||buildBtn?.disabled||bookFresh()||document.hidden)return;
    hookInput(document.getElementById('v35SheetFrame')?.contentWindow);
    {const quiet=performance.now()-lastInput;if(quiet<5000){schedulePrebuild(5200-quiet);return;}}
    const sh=document.querySelector('.shell');
    if(previewModal?.classList.contains('open')||sh?.classList.contains('is-manuscript')||sh?.classList.contains('is-ms-to-book')||sh?.classList.contains('is-book-preview')){schedulePrebuild(4000);return;}
    const run=()=>{if(buildBtn?.disabled||previewModal?.classList.contains('open')||bookFresh())return;
      window.__ocherkiQuietBuild=true;
      try{let ok=false;try{ok=assemble();}catch(_){ok=false;}
        if(ok&&built){bookOutdated=false;buildBtn?.classList.remove('is-outdated');window.__ocherkiBuiltAt=Date.now();window.__ocherkiBuiltKey=bookKey();}}
      finally{window.__ocherkiQuietBuild=false;}};
    (window.requestIdleCallback||(f=>setTimeout(f,0)))(()=>{const fr=activeDesign==='editorial'&&window.OcherkiBookRenderer?.readyFonts;fr?fr().then(run,()=>{}):run();},{timeout:1500});
  }
  window.__ocherkiPrebuild=prebuild;
  // v113: one book page beside the sheet («в книге» in «Писать»): the page that holds this sheet's words.
  window.__ocherkiPageSize=()=>currentPageSize();
  window.__ocherkiScalePages=()=>scaleAllPageCanvases();
  // v126: what the book was last built from (sheets, their words and photos), so a sheet written a moment ago is never missed.
  const peekSig=()=>((structure?.sections)||[]).map(sec=>sec.id+':'+(sec.included===false?'x':'')+(sec.pages||[]).map(pg=>(pg.uid||pg.id||'')+'.'+String(pg.text||'').length+'.'+((pg.photos||[]).length)+'.'+(pg.episode||'')).join(',')).join('|');
  // the book laid out quietly when it is not up to date with the sheets (no notice, no «Собираю книгу…»); false if it cannot be
  function quietAssemble(){if(!structure)return false;
    if(!bookFresh()||window.__ocherkiPeekSig!==peekSig()){window.__ocherkiQuietBuild=true;
      try{try{assemble();}catch(first){window.OCHERKI_SAFE_LAYOUT=true;try{assemble();}finally{window.OCHERKI_SAFE_LAYOUT=false;}}
        if(built){partialBook=false;bookOutdated=false;buildBtn?.classList.remove('is-outdated');window.__ocherkiBuiltAt=Date.now();window.__ocherkiBuiltKey=bookKey();window.__ocherkiPeekSig=peekSig();}}
      catch(_){return false;}finally{window.__ocherkiQuietBuild=false;}}
    return bookSpreads.length>0;}
  // v250: «Так ляжет» shows the page from the book as it was last laid out; it is laid out anew only by «обновить» (force) or
  // when there is no book yet
  // v254: the book's first pages (cover, endpaper, title, dedication, epigraph) do not wait for the whole book: with no book laid out
  // yet they are laid out with only the first chapter behind them (a moment instead of the whole book's twenty seconds); the whole
  // book is laid out when a chapter's page is asked for, by «обновить» or when «Книга» opens
  const FRONT_IDS=new Set(['cover','endpaper','title','dedication','epigraph']);
  function liteAssemble(){const full=structure;if(!full)return false;const secs=full.sections||[],first=secs.find(x=>x.type==='chapter');
    structure=Object.assign({},full,{sections:secs.filter(x=>FRONT_IDS.has(x.id)||x===first)});window.__ocherkiQuietBuild=true;
    try{assemble();}catch(_){built=false;}finally{structure=full;window.__ocherkiQuietBuild=false;window.__ocherkiLastStructure=full;}
    partialBook=!!built;window.__ocherkiBuiltKey='';window.__ocherkiPeekSig='';return partialBook&&bookSpreads.length>0;}
  window.__ocherkiPeekPage=(uid,ratio,pick,force)=>{
    {const s0=(structure?.sections||[]).find(x=>(x.pages||[]).some(p=>(p.uid||p.id)===uid)),front=!!(s0&&FRONT_IDS.has(s0.id));
      if(!force&&front&&(!built||!bookSpreads.length)){if(!liteAssemble()&&!quietAssemble())return null;}
      else if(force||!built||!bookSpreads.length||(partialBook&&!front)){if(!quietAssemble())return null;}}
    // every book page that carries words of this sheet, in order
    const sec=(structure?.sections||[]).find(x=>(x.pages||[]).some(p=>(p.uid||p.id)===uid));const run=sec&&sheetOffsets(sec.id).find(x=>x.uid===uid);
    const list=[];if(run)bookSpreads.forEach((sp,i)=>{for(const [pg,side] of [[sp?.left,'left'],[sp?.right,'right']]){const rg=pg?.sourceRange;if(pg?.sectionId===sec.id&&rg&&rg.end>run.start&&rg.start<run.end)list.push({pg,side,i,rg});}});
    let k=0;
    if(list.length){if(Number.isInteger(pick))k=Math.max(0,Math.min(list.length-1,pick));
      else{const o=run.start+Math.max(0,Math.min(1,ratio>=0?ratio:0))*(run.end-run.start);const at=list.findIndex(x=>x.rg.start<=o&&o<x.rg.end);k=at>=0?at:(o>=run.end?list.length-1:0);}}
    if(!list.length&&sec)bookSpreads.forEach((sp,i)=>{for(const [pg,side] of [[sp?.left,'left'],[sp?.right,'right']]){if(pg&&(pg.sourcePageUid===uid||pg.source?.uid===uid))list.push({pg,side,i});}});
    if(!list.length&&sec)bookSpreads.forEach((sp,i)=>{for(const [pg,side] of [[sp?.left,'left'],[sp?.right,'right']]){if(pg&&pg.sectionId===sec.id)list.push({pg,side,i});}});
    // the book's own pages (endpaper, title, contents…) carry their kind, not the section
    if(!list.length&&sec){const MAP={endpaper:['endpaper'],'back-endpaper':['endpaper'],title:['half-title','title'],dedication:['dedication'],epigraph:['epigraph'],contents:['contents','contents-left','contents-right'],final:['epilogue','final'],colophon:['colophon'],'inside-back-cover':['notes-page'],cover:['cover'],'back-cover':['back-cover']};
      const want=MAP[sec.id]||MAP[sec.type];if(want){const hits=[];bookSpreads.forEach((sp,i)=>{for(const [pg,side] of [[sp?.left,'left'],[sp?.right,'right']]){if(pg&&want.includes(pg.type||pg.kind))hits.push({pg,side,i});}});
        if(sec.id==='title')hits.sort((a,b)=>((a.pg.type||a.pg.kind)==='title'?0:1)-((b.pg.type||b.pg.kind)==='title'?0:1));if(hits.length){const si=(sec.id==='back-endpaper')?hits[hits.length-1].i:hits[0].i;hits.filter(h=>sec.id==='endpaper'||sec.id==='back-endpaper'?h.i===si:true).forEach(h=>list.push(h));}}}
    if(list.length){if(Number.isInteger(pick))k=Math.max(0,Math.min(list.length-1,pick));}
    else{const i=uid?spreadIndexForUid(uid):-1;if(i<0)return null;const sp=bookSpreads[i],side=window.__ocherkiSpreadSide||(sp.right?'right':'left');const pg=(side==='left'?sp.left:sp.right)||sp.right||sp.left;if(!pg)return null;list.push({pg,side,i});}
    const it=list[k],[w,h]=currentPageSize();
    return {html:pageCanvasHost(it.pg,it.side==='left'?'left':'right','preview',true),w,h,pageNo:it.pg.pageNo||'',spread:it.i,side:it.side==='left'?'left':'right',n:list.length,k};};
  // v234: the book on the desk («Книга», app/book/desk-book.js) reads the laid-out book through this: its spreads, their pages as
  // the director draws them, the page's size, the format and the photographs' colour (a change lays the book out again)
  const sectionTitleOf=id=>{const sec=(structure?.sections||[]).find(x=>x.id===id);return sec?String(sec.title||''):'';};
  window.__ocherkiBook={
    ready:()=>quietAssemble()?bookSpreads.length:0,
    // the book as it is laid out now, without laying it out (0 when it is not up to date)
    fresh:()=>structure&&bookFresh()&&window.__ocherkiPeekSig===peekSig()?bookSpreads.length:0,
    size:()=>currentPageSize(),
    spread(i){const sp=bookSpreads[i];if(!sp)return null;const host=(pg,side)=>pg?pageCanvasHost(pg,side,'preview',true):'';
      return {single:!!sp.single||!sp.left||!sp.right,left:host(sp.left,'left'),right:host(sp.right,'right'),leftNo:sp.left?.pageNo||'',rightNo:sp.right?.pageNo||'',title:sectionTitleOf(sp.right?.sectionId||sp.left?.sectionId)};},
    // a spread in little, as the old book's strip drew it (the same director's pages, the strip's size)
    thumb(i){const sp=bookSpreads[i];if(!sp)return null;const m=(pg,side)=>pg?pageCanvasHost(pg,side,'mini'):'';
      return {single:!!sp.single||!sp.left||!sp.right,left:m(sp.left,'left'),right:m(sp.right,'right'),label:`${sp.left?.pageNo||''}${sp.left&&sp.right?'–':''}${sp.right?.pageNo||''}`,title:sectionTitleOf(sp.right?.sectionId||sp.left?.sectionId)};},
    pages:()=>bookSpreads.reduce((a,sp)=>a+(sp.left?1:0)+(sp.right?1:0),0),
    format:()=>activeFormat,formats:()=>formats.map(([key,name,dims])=>({key,name,dims})),
    setFormat(key){if(key===activeFormat||!FORMAT_SIZES[key])return false;activeFormat=key;applyActiveFormat();return quietAssemble();},
    photoMode:()=>window.OCHERKI_BOOK_META?.bookPhotoMode||'as-is',photoModes:()=>photoModes.map(([key,label])=>({key,label})),
    setPhotoMode(key){window.OCHERKI_BOOK_META.bookPhotoMode=key;try{localStorage.setItem('ocherki_book_photo_mode',key);}catch(_){}window.__ocherkiPeekSig='';return quietAssemble();},
    design:()=>({key:activeDesign,name:(designs.find(d=>d[0]===activeDesign)||[])[1]||''}),
    // the print file, as the old book made it (its own window: pages or spreads, then the server makes the PDF)
    pdf:()=>{if(quietAssemble())openPdfExport();},
    // the photographs of the book on the desk are framed by the hand as in the old book (drag to move, − + to scale, «Как было»)
    framing:el=>initPhotoFraming(el),
    // the spread's compositions (as the old book offered them): those that fit, and the one it has now; none — the spread has no photo
    compositions(i){const sp=bookSpreads[i],ref=sp&&spreadPhotoRef(sp);if(!ref)return null;const own=String(ref.photo.layoutPreference||'auto').toLowerCase();
      return {now:own!=='auto'?own:String(sp.beat||'auto'),list:compositionChoices(sp).filter(x=>x.ok&&x.id!=='auto').map(x=>({id:x.id,label:x.label}))};},
    // a spread laid out in another composition: its photo keeps the choice (the sheet is told too), the book is laid out anew; the
    // spread that holds the photo now is given back
    compose(i,id){const sp=bookSpreads[i],ref=sp&&spreadPhotoRef(sp);if(!ref)return i;const {page,photo,photoIndex}=ref;
      updateLocalPhotoLayout(page,photo,photoIndex,id);
      send({action:'setPhotoLayout',sectionId:page.sectionId,pageUid:photo._sourcePageUid||page.sourcePageUid||'',photoId:photo.id||'',layoutPreference:id});
      spreadPhotoRefs(sp).forEach(o=>{if(o.photo===photo||!o.photo.id||String(o.photo.layoutPreference||'auto')==='auto')return;updateLocalPhotoLayout(o.page,o.photo,o.photoIndex,'auto');
        send({action:'setPhotoLayout',sectionId:o.page.sectionId,pageUid:o.photo._sourcePageUid||o.page.sourcePageUid||'',photoId:o.photo.id||'',layoutPreference:'auto'});});
      window.__ocherkiPeekSig='';if(!quietAssemble())return i;const pid=String(photo.id||'');
      const at=bookSpreads.findIndex(x=>spreadPhotoRefs(x).some(r=>String(r.photo.id||'')===pid));return at>=0?at:Math.min(i,bookSpreads.length-1);},
    // pages just put on the desk are drawn (a little page is drawn when it comes in sight) and fitted to their places
    scale:()=>{observePageCanvasHosts();scaleAllPageCanvases();}};
  function performBuild(after){
    if(!structure) return false;
    hideBookNotice();
    if(typeof after!=='function')window.OCHERKI_PLAY_PAGE_FX?.(.72);
    buildBtn.textContent='Собираем…';
    buildBtn.disabled=true;
    clearTimeout(performBuild.guard);performBuild.guard=setTimeout(()=>{if(buildBtn.disabled){buildBtn.disabled=false;buildBtn.textContent='Посмотреть книгу';}},20000);
    const runBuild=()=>requestAnimationFrame(()=>setTimeout(()=>{
      try{
        revealSpreadsOnRender=true;
        // The open spread stays where the author was (a rebuild after a
        // note edit used to jump to another spread).
        const keepSpread=activeSpread;
        // If a page cannot be set on this screen's fonts, the book is built
        // again at once in the calm rhythm (no margin notes, quotes or
        // handwritten lines) — it always opens; nothing of the text is lost.
        try{assemble();}catch(first){console.warn('[Book] safe layout after',first);window.OCHERKI_SAFE_LAYOUT=true;
          try{assemble();window.__ocherkiSafeLayoutUsed=String(first?.message||first);}
          catch(second){console.warn('[Book] tolerant layout after',second);window.OCHERKI_TOLERANT_LAYOUT=true;try{assemble();window.__ocherkiSafeLayoutUsed=String(second?.message||second);}finally{window.OCHERKI_TOLERANT_LAYOUT=false;}}
          finally{window.OCHERKI_SAFE_LAYOUT=false;}}
        if(previewModal?.classList.contains('open')&&bookSpreads.length){
          activeSpread=Math.max(0,Math.min(keepSpread,bookSpreads.length-1));previewPendingTarget=null;previewPinnedTarget=null;
          // v97: after a new format or design the same sheet stays open.
          const keepUid=window.__ocherkiKeepSheet;window.__ocherkiKeepSheet='';if(keepUid){const at=spreadIndexForUid(keepUid);if(at>=0)activeSpread=at;}
          const focus=window.__ocherkiFocusPhoto;window.__ocherkiFocusPhoto='';
          if(focus){const at=bookSpreads.findIndex(spread=>[spread?.left,spread?.right].some(pg=>{const list=pagePhotoIndexes(pg);return list.some(i=>String(pg?.source?.photos?.[i]?.id||'')===focus);}));
            // Stay where the composition can still be changed: a spread the photo
            // moved to at the chapter's end (no composition) does not take focus.
            if(at>=0&&bookSpreads[at]?.beat&&bookSpreads[at].beat!=='p01')activeSpread=at;}
        }
        requestAnimationFrame(scaleAllPageCanvases);
        buildBtn.textContent=bookSpreads.length?'Посмотреть книгу':'Нет данных';
        bookOutdated=false;buildBtn.classList.remove('is-outdated');window.__ocherkiBuiltAt=Date.now();if(built)window.__ocherkiBuiltKey=bookKey();
        if(previewModal?.classList.contains('open'))previewRender();
        // The preview opens once the freshly built pages have settled, so its
        // gliding entrance plays smoothly instead of jumping in.
        if(typeof after==='function')setTimeout(()=>requestAnimationFrame(()=>requestAnimationFrame(after)),380);
      }catch(err){
        console.error('[Book Engine] assemble failed',err);
        built=false;
        buildMessage=`<div class="bd-build-empty"><strong>${esc(err.message||'Не удалось разложить текст.')}</strong><p class="bd-build-report-note">Сохраните отчёт и пришлите его разработчику — по нему ошибку найдут точно. В отчёте только текст книги и подписи, без фотографий.</p><button type="button" class="bd-build-report">Сохранить отчёт</button></div>`;
        lastBuildError=err;
        renderRightPanel();
        showBookNotice(`<strong>Книгу не удалось собрать.</strong><br>${esc(err.message||'Не удалось разложить текст.')}`,true);
        // A failed rebuild never leaves the composition keys locked.
        previewSpread?.classList.remove('is-recomposing');document.getElementById('recomposeNote')?.classList.remove('is-on');
        buildBtn.textContent='Ошибка сборки';
      }
      buildBtn.disabled=false;
      setTimeout(()=>buildBtn.textContent='Посмотреть книгу',1400);
    },120));
    if(activeDesign==='editorial'&&window.OcherkiBookRenderer?.readyFonts)window.OcherkiBookRenderer.readyFonts().then(runBuild,error=>{buildBtn.disabled=false;buildBtn.textContent='Ошибка загрузки шрифтов';console.error(error);});
    else if(document.fonts?.ready)document.fonts.ready.then(runBuild,runBuild);
    else runBuild();
    return true;
  }

  buildBtn?.addEventListener('click',()=>{
    if(!structure){
      pendingBuildRequest=true;
      buildBtn.textContent='Получаем данные…';
      send({action:'requestState'});
      window.setTimeout(()=>{
        if(pendingBuildRequest){
          pendingBuildRequest=false;
          buildBtn.textContent='Посмотреть книгу';
          showBookNotice('<strong>Книга ещё не загрузилась в редактор.</strong><br>Подождите пару секунд и нажмите «Посмотреть книгу» ещё раз. Если не поможет — откройте книгу заново через «Мои книги».',false);
        }
      },2200);
      return;
    }
    // Always ask the editor for its latest state first: a caption typed a
    // moment ago reaches the shell only after the card's closing motion.
    pendingBuildRequest=true;showBuilding();send({action:'requestState'});
    clearTimeout(window.__ocherkiBuildWait);window.__ocherkiBuildWait=setTimeout(()=>{if(pendingBuildRequest){pendingBuildRequest=false;performBuild(openPreview);}},700);
    return;
    // One button: the book is (re)built when needed and opened at once.
    // Always from the current manuscript: a rebuild takes seconds, a stale
    // book (a caption typed a moment ago missing) is worse.
    showBuilding();
    performBuild(openPreview);
  });


  // PREVIEW: existing hanging eye icon opens the actual assembled spread.
  // A note or a handwritten line being edited is saved before the spread is
  // redrawn (turning the page used to drop it: the field vanished before it
  // lost focus).
  function flushPreviewAccent(){
    const field=document.activeElement?.closest?.('[data-editorial-accent]');
    if(field&&field.dataset.editorialCommitted!=='1'&&previewAccentText(field)!==(field.dataset.editorialLastValidText||''))commitPreviewAccent(field);
  }
  // «Все развороты»: a strip along the bottom of the preview with every
  // spread, grouped by chapter. A click opens that spread; a double click
  // opens its page in the editor.
  function previewStripMarkup(){
    const titleOf=id=>String((structure?.sections||[]).find(section=>String(section.id)===String(id))?.title||'');
    let lastSection=null;const parts=[];
    bookSpreads.forEach((sp,i)=>{
      const pages=[sp.left,sp.right].filter(Boolean);
      const section=sp.sectionId||pages.find(pg=>pg.sectionId)?.sectionId||'';
      if(section&&section!==lastSection){const title=titleOf(section);if(title)parts.push(`<div class="ps-head">${esc(title)}</div>`);}
      lastSection=section||lastSection;
      const photoPage=pages.find(pg=>pg?.source?.photos&&(Number.isInteger(pg.photoIndex)||Array.isArray(pg.photoIndices)));
      const index=photoPage?(Array.isArray(photoPage.photoIndices)?photoPage.photoIndices[0]:photoPage.photoIndex):null;
      const src=photoPage&&index!=null?imageSource(photoPage.source.photos[index]):'';
      const label=sp.single?(sp.single==='right'?'Обложка':'Задняя обложка'):`${sp.left?.pageNo||''}${sp.right?'–'+sp.right.pageNo:''}`;
      parts.push(`<button type="button" class="ps-item${i===activeSpread?' is-current':''}" data-strip="${i}" title="Щелчок — открыть разворот, двойной щелчок — открыть страницу в редакторе">${src?`<img src="${esc(src)}" alt="" loading="lazy">`:'<span class="ps-text"></span>'}<b>${esc(label)}</b></button>`);
    });
    return parts.join('');
  }
  function ensurePreviewStrip(){
    if(!previewModal)return null;
    let strip=document.getElementById('previewStrip');
    if(!strip){
      const toggle=document.createElement('button');toggle.type='button';toggle.id='previewStripToggle';toggle.className='preview-strip-toggle';toggle.textContent='Все развороты';
      strip=document.createElement('div');strip.id='previewStrip';strip.className='preview-strip';
      previewModal.append(toggle,strip);
      toggle.addEventListener('click',event=>{event.stopPropagation();const open=!previewModal.classList.contains('strip-open');previewModal.classList.toggle('strip-open',open);toggle.textContent=open?'Скрыть развороты':'Все развороты';if(open){strip.innerHTML=previewStripMarkup();strip.querySelector('.is-current')?.scrollIntoView({inline:'center',block:'nearest'});}});
      strip.addEventListener('click',event=>{const item=event.target.closest('[data-strip]');if(!item)return;event.stopPropagation();const i=Number(item.dataset.strip);if(i===activeSpread||previewPaging)return;
        previewPendingTarget=null;previewPinnedTarget=null;previewCompositionOverride=null;activeSpread=i;previewRender();renderActiveOnly();});
      strip.addEventListener('dblclick',event=>{const item=event.target.closest('[data-strip]');if(!item)return;const sp=bookSpreads[Number(item.dataset.strip)];
        const page=[sp?.left,sp?.right].find(pg=>pg?.sourcePageUid&&pg?.sectionId)||[sp?.left,sp?.right].find(pg=>pg?.sectionId);
        if(page){send({action:'select',sectionId:page.sectionId,pageUid:page.sourcePageUid||''});closePreview();}});
    }
    return strip;
  }
  // What the arc of spreads under the open book needs from here.
  window.__ocherkiArcApi={
    spreads:()=>bookSpreads,active:()=>activeSpread,built:()=>built,pageSize:()=>currentPageSize(),esc,
    host:(page,side)=>pageCanvasHost(page,side,'mini'),
    scale:()=>requestAnimationFrame(()=>{observePageCanvasHosts();scaleAllPageCanvases();}),
    label:i=>{const sp=bookSpreads[i]||{},pages=[sp.left,sp.right].filter(Boolean);
      const section=sp.sectionId||pages.find(pg=>pg.sectionId)?.sectionId||'',prev=bookSpreads[i-1];
      const prevSection=prev?(prev.sectionId||[prev.left,prev.right].find(pg=>pg?.sectionId)?.sectionId||''):'';
      const title=String((structure?.sections||[]).find(item=>String(item.id)===String(section))?.title||'');
      const chapter=section&&section!==prevSection&&/^Глава\s/i.test(title)?title.split('.')[0]:'';
      const item=PREVIEW_COMPOSITION_CATALOG.find(c=>c.id===String(sp.beat||''));
      const name=sp.single?(sp.single==='right'?'Обложка':'Задняя обложка'):(item?.label||(chapter?title:''));
      const pagesLabel=sp.single?'':`страницы ${sp.left?.pageNo||''}${sp.right?'–'+sp.right.pageNo:''}`;
      return {name,pages:pagesLabel,chapter};},
    go:i=>{if(previewPaging||i===activeSpread)return;previewGo(i-activeSpread);},paging:()=>previewPaging,
    edit:i=>{const sp=bookSpreads[i];const page=[sp?.left,sp?.right].find(pg=>pg?.sourcePageUid&&pg?.sectionId)||[sp?.left,sp?.right].find(pg=>pg?.sectionId);
      if(page){send({action:'select',sectionId:page.sectionId,pageUid:page.sourcePageUid||''});closePreview();}}
  };
  function syncPreviewStrip(){
    const strip=ensurePreviewStrip();if(!strip||!previewModal.classList.contains('strip-open'))return;
    if(strip.childElementCount!==bookSpreads.length+strip.querySelectorAll('.ps-head').length)strip.innerHTML=previewStripMarkup();
    strip.querySelectorAll('.ps-item').forEach(item=>item.classList.toggle('is-current',Number(item.dataset.strip)===activeSpread));
    strip.querySelector('.is-current')?.scrollIntoView({inline:'nearest',block:'nearest',behavior:'smooth'});
  }
  function previewRender(){
    flushPreviewAccent();
    initPreviewDom();
    if(!previewSpread) {
      console.error('[Preview] bookPreviewSpread not found');
      return;
    }
    if(!built || !bookSpreads.length){
      const hanger=document.getElementById('bookPreviewLayoutHanger');
      previewSpread.classList.add('is-empty');
      hanger?.classList.add('is-empty');
      previewSpread.innerHTML=`<div class="book-preview-empty">Создайте хотя бы одну главу.</div>`;
      previewInfo.textContent='';
      if(previewPrev)previewPrev.disabled=true;
      if(previewNext)previewNext.disabled=true;
      if(previewLayout) previewLayout.disabled=true;
      if(previewLayoutPrev)previewLayoutPrev.disabled=true;
      if(previewLayoutNext)previewLayoutNext.disabled=true;
      document.getElementById('bookRhythmWarning')?.setAttribute('hidden','');
      return;
    }
    previewSpread.classList.remove('is-empty');
    document.getElementById('bookPreviewLayoutHanger')?.classList.remove('is-empty');
    if(previewPrev)previewPrev.disabled=activeSpread<=0;
    if(previewNext)previewNext.disabled=activeSpread>=bookSpreads.length-1;
    previewModal?.classList.toggle('is-night',shell?.classList.contains('is-night'));
    const sp=bookSpreads[activeSpread];
    const overrideId=previewCompositionOverride&&locatePreviewTarget(previewCompositionOverride.target)===activeSpread
      ?previewCompositionOverride.id:'';
    const override=overrideId?renderPreviewCompositionOverride(sp,overrideId):null;
    const [pageW,pageH]=currentPageSize();
    const isSingle=!!sp.single&&!override;
    // A cover stands where it stands in a real book: the front cover on the
    // right page, the back cover on the left, at exactly a page's size, with
    // an empty place beside it. Turning it is the same page turn as any other
    // (it used to sit centred, then jump, grow and slide before turning).
    previewSpread.classList.remove('is-single');
    previewSpread.classList.toggle('is-cover',isSingle);
    previewSpread.style.aspectRatio=`${pageW*2}/${pageH}`;
    previewSpread.dataset.format=activeFormat;
    previewSpread.dataset.master=override?.composition?.master||sp.master||'';
    if(override){
      previewSpread.innerHTML=override.html;
    }else if(isSingle){
      const ghost=side=>`<div class="book-preview-half ${side} is-ghost" aria-hidden="true"></div>`;
      previewSpread.innerHTML=sp.single==='right'?ghost('left')+pageCanvasHost(sp.right,'right','preview'):pageCanvasHost(sp.left,'left','preview')+ghost('right');
    }else{
      previewSpread.innerHTML=`${pageCanvasHost(sp.left,'left','preview')}${sp.right?pageCanvasHost(sp.right,'right','preview'):''}`;
    }
    const previewPhotoPage=spreadPhotoPage(sp);
    const composition=previewPhotoPage?` · ${previewCompositionLabel(sp)}`:'';
    previewInfo.textContent=isSingle
      ?`${sp.single==='right'?'Обложка':'Задняя обложка'} · ${activeSpread+1} из ${bookSpreads.length}${composition}`
      :`Разворот ${activeSpread+1} из ${bookSpreads.length} · страницы ${sp.left?.pageNo||''}${sp.right?'–'+sp.right.pageNo:''}${composition}`;
    if(previewLayout){
      // Only a spread the director composed can change its composition; the
      // chapter opening and the closing photo pages follow their own rule.
      const canCompose=Boolean(previewPhotoPage&&sp?.beat);
      const disabledTitle=sp?.beat==='p01'?'Это «Портрет героя»: разворот появляется по отметке в карточке фото. Чтобы выбрать другую композицию, снимите отметку «Портрет героя».':previewPhotoPage?'Этот разворот собирается по своему правилу (открытие или конец главы) — его композиция не меняется':'На этом развороте нет фотографии для смены композиции';
      previewLayout.disabled=!canCompose;
      if(!canCompose){previewLayout.title=disabledTitle;if(previewLayoutPrev){previewLayoutPrev.disabled=true;previewLayoutPrev.title=disabledTitle;}if(previewLayoutNext){previewLayoutNext.disabled=true;previewLayoutNext.title=disabledTitle;}document.getElementById('compositionMenu')?.setAttribute('hidden','');}
    }
    if(previewLayout&&sp?.beat&&previewPhotoPage){
      previewLayout.title='Выбрать композицию разворота';
      if(previewLayoutPrev){previewLayoutPrev.disabled=false;previewLayoutPrev.title='Предыдущая подходящая композиция';}
      if(previewLayoutNext){previewLayoutNext.disabled=false;previewLayoutNext.title='Следующая подходящая композиция';}
    }
    updateRhythmWarning();
    // This innerHTML replacement creates brand-new .page-canvas-host elements
    // every time, so re-attach the size observer -- it never carries over from
    // the previous spread's (now-discarded) hosts.
    bindPreviewAccentEditors();
    syncPreviewStrip();
    window.__ocherkiArcSync?.(true);
    if(frameTools){frameTools.hidden=true;frameTarget=null;}
    observePageCanvasHosts();
    scaleAllPageCanvases();
  }

  // Manual art direction belongs to the assembled-sheet preview. It cycles
  // through the complete approved composition catalog and writes only a
  // photo-level preference back to the editor; the text stream is untouched.
  function updateLocalPhotoLayout(page,photo,photoIndex,layoutPreference){
    if(photo)photo.layoutPreference=layoutPreference;
    const section=(structure?.sections||[]).find(item=>String(item?.id||'')===String(page?.sectionId||''));
    // The photo is found by its id in the section (photoIndex counts the
    // whole chapter, not one manuscript page).
    const sourcePhoto=(section?.pages||[]).flatMap(item=>item?.photos||[]).find(item=>photo?.id&&String(item?.id||'')===String(photo.id));
    if(sourcePhoto)sourcePhoto.layoutPreference=layoutPreference;
  }
  // Why a composition does not fit this spread, in the author's words.
  const COMPOSITION_NEEDS={two:'нужно 2 фото в главе',three:'нужно 3 фото в главе',mosaic:'нужно 4 фото в главе',pair:'нужно 2 фото в главе',quoteband:'нужно 2 фото в главе',
    darkpair:'нужно 2 фото; одна тёмная композиция на главу',t06:'нужно 3 фото, главное — вертикальное или квадратное',t07:'нужно 2–4 фото подходящей формы',t08:'нужно вертикальное фото',
    t10:'нужно 2 фото',t12:'у фото нужны подпись и короткая история',hspread:'нужно очень широкое фото и больше текста',panorama:'нужно широкое фото',rail:'нужно горизонтальное фото',
    darkside:'одна тёмная композиция на главу',darkfade:'одна тёмная композиция на главу',darkgrad:'одна тёмная композиция на главу и больше текста',
    closing3:'нужно ещё 3 фото в конце главы',photoquote:'',fade:'нужно больше текста после этого места',overlay:'нужно больше текста после этого места',textphotos:'нужно больше текста после этого места',single:'не подходит здесь'};
  function compositionChoices(sp){
    // The hero's portrait has its own two choices: on a dark or on a light page.
    if(sp?.beat==='p01'){const cur=String([sp.left,sp.right].find(p=>p?.p01Variant)?.p01Variant||'C');return [{id:'hero-dark',label:'Портрет героя на тёмном',ok:cur!=='C'},{id:'hero-light',label:'Портрет героя на светлом',ok:cur!=='A'}].map(x=>({...x,ok:true,current:(x.id==='hero-dark')===(cur==='C')}));}
    // Only what can really show this spread's photo (a panorama needs a wide
    // one…); older books without the per-photo list use the spread's list.
    const id=String(spreadPhotoRef(sp)?.photo?.id||''),own=id&&sp?.beatOptionsByPhoto?.[id];
    const fits=new Set(Array.isArray(own)?own:(sp?.beatOptions||[]));if(sp?.beat)fits.add(sp.beat);
    // The photos closing a chapter have their own, photo-only choices.
    const closing=(sp?.beatOptions||[]).includes('photoquote'),closingIds=['auto','pair','quoteband','closing3','photoquote','panorama'];
    return PREVIEW_COMPOSITION_CATALOG.filter(item=>item.id!=='p01'&&(closing?closingIds.includes(item.id):!['closing3','photoquote'].includes(item.id))).map(item=>({...item,ok:item.id==='auto'||fits.has(item.id),why:COMPOSITION_NEEDS[item.id]||'не подходит здесь'}));
  }
  // The list of every composition: the ones that fit are bright, the
  // others grey with the reason; the current one is ticked.
  function toggleCompositionMenu(){
    let menu=document.getElementById('compositionMenu');
    if(menu&&!menu.hidden){menu.hidden=true;return;}
    const sp=bookSpreads[activeSpread],ref=spreadPhotoRef(sp);if(!ref)return;
    if(previewSpread?.classList.contains('is-recomposing'))return;
    if(!menu){menu=document.createElement('div');menu.id='compositionMenu';menu.className='composition-menu';(previewModal||document.body).appendChild(menu);
      menu.addEventListener('click',event=>{const item=event.target.closest('[data-composition]');if(!item||item.disabled)return;event.stopPropagation();menu.hidden=true;changePreviewComposition(1,item.dataset.composition);});
      // A click beside the open list only closes the list (it used to close the book).
      document.addEventListener('click',event=>{if(!menu.hidden&&!menu.contains(event.target)&&!event.target.closest('#bookPreviewLayout')){menu.hidden=true;event.stopPropagation();event.preventDefault();}},true);}
    const own=String(ref.photo.layoutPreference||'auto').toLowerCase(),current=own!=='auto'?own:'auto',shown=sp.beat||'';
    const allChoices=compositionChoices(sp),okChoices=allChoices.filter(item=>item.ok),hiddenCount=allChoices.length-okChoices.length;
    // Only what fits this photo; the rest is not listed (it made some lists very long).
    menu.innerHTML=`<div class="composition-menu-head">Композиция разворота</div>`+okChoices.map(item=>`<button type="button" data-composition="${item.id}"${item.ok?'':' disabled'} class="${item.id===current?'is-current':''}${item.id===shown&&current==='auto'?' is-shown':''}"><span>${esc(item.label)}</span>${item.ok?'':`<i>${esc(item.why)}</i>`}</button>`).join('');if(hiddenCount)menu.insertAdjacentHTML('beforeend',`<div class="composition-menu-foot">ещё ${hiddenCount} не подходят этому фото</div>`);
    const r=(previewLayout||document.body).getBoundingClientRect();
    menu.style.left=Math.round(Math.max(16,Math.min(innerWidth-376,r.left+r.width/2-180)))+'px';menu.style.top=Math.round(r.bottom+14)+'px';
    menu.hidden=false;
  }
  const compositionUndo=[];
  function rebuildComposition(text){
    let note=document.getElementById('recomposeNote');
    if(!note){note=document.createElement('div');note.id='recomposeNote';note.className='recompose-note';(previewModal||document.body).appendChild(note);}
    note.textContent=text;
    const keys=(document.getElementById('bookPreviewLayoutHanger')||previewLayout)?.getBoundingClientRect();
    if(keys){note.style.top=Math.round(keys.bottom+6)+'px';note.style.left=Math.round(keys.left+keys.width/2)+'px';}
    note.classList.add('is-on');previewSpread?.classList.add('is-recomposing');syncCompositionUndo();
    let finished=false;
    const done=()=>{if(finished)return;finished=true;note.classList.remove('is-on');previewSpread?.classList.remove('is-recomposing');syncCompositionUndo();};
    setTimeout(done,20000);
    setTimeout(()=>{if(!performBuild(done))done();},120);
  }
  // A quiet link under the composition keys after a change: one press takes
  // the spread back one step (several presses walk further back).
  function syncCompositionUndo(){
    let link=document.getElementById('recomposeUndo');
    if(!link){link=document.createElement('button');link.type='button';link.id='recomposeUndo';link.className='recompose-undo';link.textContent='Вернуть как было';
      link.addEventListener('click',event=>{event.stopPropagation();undoComposition();});(previewModal||document.body).appendChild(link);}
    const keys=(document.getElementById('bookPreviewLayoutHanger')||previewLayout)?.getBoundingClientRect();
    // Beside the composition keys (to their right), never over the page —
    // in a tall format the book reaches up to the keys.
    if(keys&&keys.width){const book=document.getElementById('bookPreviewSpread')?.getBoundingClientRect();const below=keys.bottom+6+24;
      if(book&&book.width&&below>book.top-4){link.style.top=Math.round(keys.top+keys.height/2-12)+'px';link.style.left=Math.round(keys.right+18)+'px';link.style.transform='none';}
      else{link.style.top=Math.round(keys.bottom+6)+'px';link.style.left=Math.round(keys.left+keys.width/2)+'px';link.style.transform='';}}
    const on=compositionUndo.length>0&&previewModal?.classList.contains('open')&&!previewSpread?.classList.contains('is-recomposing');
    link.classList.toggle('is-on',!!on);
  }
  function undoComposition(){
    if(previewSpread?.classList.contains('is-recomposing'))return;
    const snap=compositionUndo.pop();if(!snap){syncCompositionUndo();return;}
    const photos=snap.page.source?.photos||[];
    snap.items.forEach(item=>{const ph=photos[item.idx];if(!ph||!ph.id||String(ph.id)!==String(item.id))return;
      // The book chose that composition itself: it is now kept by name, so the
      // spread really comes back as it was.
      if(String(ph.id)===snap.photoId&&item.pref==='auto'&&snap.beat)item={...item,pref:snap.beat};
      if(String(ph.layoutPreference||'auto')===item.pref)return;
      updateLocalPhotoLayout(snap.page,ph,item.idx,item.pref);
      send({action:'setPhotoLayout',sectionId:snap.page.sectionId,pageUid:ph._sourcePageUid||snap.page.sourcePageUid||'',photoId:ph.id,layoutPreference:item.pref});});
    window.__ocherkiFocusPhoto=snap.photoId;
    window.OCHERKI_SHOW_TOAST?.('Возвращаю как было');
    rebuildComposition('Возвращаю как было…');
  }
  function changePreviewComposition(direction=1,chosen){
    if(!built||!bookSpreads.length)return;
    // One change at a time: a press while the book is being rebuilt is ignored
    // (presses that overlapped used to leave the controls stuck).
    if(previewSpread?.classList.contains('is-recomposing'))return;
    const sp=bookSpreads[activeSpread];
    const ref=spreadPhotoRef(sp);
    const page=ref?.page;
    const photo=ref?.photo;
    const photoIndex=ref?.photoIndex;
    if(!page||!photo||!Number.isInteger(photoIndex))return;
    if(sp.beat==='p01'){
      const cur=String([sp.left,sp.right].find(p=>p?.p01Variant)?.p01Variant||'C');
      const want=chosen==='hero-light'?'A':chosen==='hero-dark'?'C':(cur==='C'?'A':'C');if(want===cur&&chosen)return;
      for(const ph of framePhotos(String(photo.id||'')))ph.heroVariant=want;
      try{document.getElementById('v35SheetFrame')?.contentWindow?.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',action:'setPhotoProps',photoId:String(photo.id||''),props:{heroVariant:want}},'*');}catch(_){}
      // v97: the same rebuild as every composition — it always unlocks the keys and the spread.
      rebuildComposition(want==='A'?'Портрет на светлом…':'Портрет на тёмном…');return;}
    // The arrows step only through compositions that fit this spread, so
    // every press really changes the spread.
    const choices=compositionChoices(sp).filter(item=>item.ok&&item.id!=='auto');
    if(!chosen&&!choices.length){window.OCHERKI_SHOW_TOAST?.('Для этого разворота нет других композиций');return;}
    // The arrows step on from the author's last choice even when the book
    // could not honour it here (the photo went to another composition): stepping
    // from the shown one asked for the same impossible choice again and again.
    const asked=String(photo.layoutPreference||'auto').toLowerCase();
    const current=(asked!=='auto'&&choices.some(item=>item.id===asked)?asked:String(sp.beat||'auto')).toLowerCase();
    const currentIndex=choices.findIndex(item=>item.id===current);
    const baseIndex=currentIndex<0?(direction<0?0:-1):currentIndex;
    const next=chosen?PREVIEW_COMPOSITION_CATALOG.find(item=>item.id===chosen):choices[(baseIndex+direction+choices.length)%choices.length];
    if(!next)return;
    // «Вернуть как было»: the chapter's choices before this change.
    if(!window.__ocherkiUndoing){compositionUndo.push({page,photoId:String(photo.id||''),beat:String(sp.beat||''),items:(page.source?.photos||[]).map((ph,idx)=>({idx,id:ph?.id,pref:String(ph?.layoutPreference||'auto')}))});if(compositionUndo.length>12)compositionUndo.shift();}
    const target={sectionId:page.sectionId,pageUid:page.sourcePageUid||photo._sourcePageUid||'',photoId:photo.id||'',photoIndex};
    previewPinnedTarget=target;
    previewPendingTarget=target;
    // Reflect the choice in the visible book immediately. The iframe receives
    // the same command below and emits the canonical state afterwards; this
    // local step keeps the control responsive even when that bridge is slow.
    updateLocalPhotoLayout(page,photo,photoIndex,next.id);
    previewSpread?.classList.add('preview-layout-changing');
    window.setTimeout(()=>previewSpread?.classList.remove('preview-layout-changing'),520);
    // Render the selected composition immediately in the current preview.
    // The director may rebuild asynchronously after the bridge command, but
    // the pinned target and override keep this exact spread on screen.
    send({action:'setPhotoLayout',sectionId:page.sectionId,pageUid:photo._sourcePageUid||page.sourcePageUid||'',photoId:photo.id||'',layoutPreference:next.id});
    // An older choice on another photo of the chapter that is not shown in the
    // book any more is forgotten: it would otherwise take over this spread.
    // Another photo of this very spread keeps no choice of its own: it would
    // win the spread back and the change would seem to do nothing.
    // A photo of the chapter that holds this spread's composition as its own
    // choice gives it up too (it may sit in the spread's small pair).
    (page.source?.photos||[]).forEach((other,idx)=>{if(other===photo||!other?.id)return;const want=String(other.layoutPreference||'auto').toLowerCase();if(want==='auto'||want!==String(sp.beat||'').toLowerCase())return;other.layoutPreference='auto';updateLocalPhotoLayout(page,other,idx,'auto');send({action:'setPhotoLayout',sectionId:page.sectionId,pageUid:other._sourcePageUid||page.sourcePageUid||'',photoId:other.id,layoutPreference:'auto'});});
    spreadPhotoRefs(sp).forEach(other=>{if(other.photo===photo||!other.photo.id)return;if(String(other.photo.layoutPreference||'auto')==='auto')return;other.photo.layoutPreference='auto';updateLocalPhotoLayout(other.page,other.photo,other.photoIndex,'auto');send({action:'setPhotoLayout',sectionId:other.page.sectionId,pageUid:other.photo._sourcePageUid||other.page.sourcePageUid||'',photoId:other.photo.id,layoutPreference:'auto'});});
    bookSpreads.forEach(other=>{if(other===sp)return;[other.left,other.right].forEach(pg=>{const list=pagePhotoIndexes(pg);list.forEach(idx=>{const ph=pg?.source?.photos?.[idx];const want=String(ph?.layoutPreference||'auto');if(ph&&ph.id&&ph.id!==photo.id&&want!=='auto'&&want!==other.beat&&String(pg.sectionId)===String(page.sectionId)){ph.layoutPreference='auto';updateLocalPhotoLayout(pg,ph,idx,'auto');send({action:'setPhotoLayout',sectionId:pg.sectionId,pageUid:ph._sourcePageUid||pg.sourcePageUid||'',photoId:ph.id,layoutPreference:'auto'});}});});});
    // Rebuild with the choice and stay on the spread that holds this photo.
    window.__ocherkiFocusPhoto=String(photo.id||'');
    window.OCHERKI_SHOW_TOAST?.(next.label);
    rebuildComposition('Меняю композицию…');
    if(previewLayout){
      previewLayout.setAttribute('aria-label',next.label);
      previewLayout.title=next.label;
    }
  }
  function openPreview(){
    initPreviewDom();
    if(!previewModal){
      console.error('[Preview] modal not found');
      return;
    }
    // A book built a moment ago (the button builds, then opens) is not
    // built a second time.
    const justBuilt=!bookOutdated&&(Date.now()-(window.__ocherkiBuiltAt||0)<4000||bookFresh());
    if(!justBuilt&&!window.__ocherkiPreviewFresh&&!buildBtn.disabled){window.__ocherkiPreviewFresh=true;performBuild(()=>{openPreview();window.__ocherkiPreviewFresh=false;});return;}
    if(!built || !bookSpreads.length){
      hideBuilding();
      previewRender();
      previewModal.setAttribute('aria-hidden','false');
      previewModal.classList.add('open');
      return;
    }
    // «Посмотреть этот лист в книге» from the sheet: the book opens on the
    // spread that holds that manuscript page.
    // Otherwise it opens where the editor is (the cover open in «Писать»
    // opens the cover).
    const wantUid=window.__ocherkiFocusPageUid||activeSourcePageUid(structure);
    if(wantUid){window.__ocherkiFocusPageUid='';let at=spreadIndexForUid(wantUid);
      // v98: inside a long sheet — the spread with the words the author was at.
      const ratio=window.__ocherkiFocusRatio;window.__ocherkiFocusRatio=-1;
      if(at>=0&&ratio>0){const sec=(structure?.sections||[]).find(x=>(x.pages||[]).some(p=>(p.uid||p.id)===wantUid));const r=sec&&sheetOffsets(sec.id).find(x=>x.uid===wantUid);
        if(r){const o=r.start+Math.round(ratio*(r.end-r.start));bookSpreads.forEach((sp,i)=>{for(const pg of [sp?.left,sp?.right])if(pg?.sectionId===sec.id&&pg.sourceRange&&pg.sourceRange.start<=o&&o<pg.sourceRange.end){at=i;window.__ocherkiSpreadSide=pg===sp.left?'left':'right';}});}}if(at<0)at=bookSpreads.findIndex(sp=>[sp?.left,sp?.right].some(pg=>pg&&pagePhotoIndexes(pg).some(i=>String(pg.source?.photos?.[i]?._sourcePageUid||'')===wantUid)));if(at>=0)activeSpread=at;}
    previewPaging=false;
    previewModal.classList.remove('is-closing');
    previewSpread?.classList.remove('page-out-next','page-out-prev','page-in-next','page-in-prev');
    // Give the modal its final geometry while it is still invisible. This
    // lets page canvases scale at their real width before the first visible
    // frame, so the two sheets never appear separated and then snap together.
    // Mirror of closing: the book is laid out first while nothing moves (heavy
    // work would make the motion jump), then the keys, map and sheet glide
    // away, and only then the book slides in.
    previewModal.classList.add('open','is-preparing');
    previewModal.setAttribute('aria-hidden','false');
    previewRender();
    scaleAllPageCanvases();
    const ready=[...(previewSpread?.querySelectorAll('img')||[])].map(img=>img.decode?img.decode().catch(()=>{}):Promise.resolve());
    Promise.race([Promise.all(ready),new Promise(done=>setTimeout(done,900))]).then(()=>{
      hideBuilding();
      shell?.classList.add('is-book-preview');
      window.OCHERKI_PLAY_PAGE_FX?.(.72);
      setTimeout(()=>{
        scaleAllPageCanvases();
        previewModal.classList.remove('is-preparing');
        previewModal.classList.remove('is-entering');void previewModal.offsetWidth;previewModal.classList.add('is-entering');
        setTimeout(()=>previewModal.classList.remove('is-entering'),1700);
      },420);
    });
  }

  const PDF_FORMAT_MM={square:[280,280],portrait:[280,335]};
  const activePdfSize=()=>PDF_FORMAT_MM[activeFormat]||PDF_FORMAT_MM.square;
  let pdfExportMode='pages';
  function pdfElements(){
    return {
      modal:document.getElementById('pdfExportModal'),close:document.getElementById('pdfExportClose'),cancel:document.getElementById('pdfExportCancel'),
      download:document.getElementById('pdfExportDownload'),format:document.getElementById('pdfExportFormat'),pages:document.getElementById('pdfExportPages'),
      progress:document.getElementById('pdfExportProgress'),error:document.getElementById('pdfExportError'),note:document.getElementById('pdfExportNote'),
      mode:document.getElementById('pdfExportMode')
    };
  }
  function lowResolutionPhotoCount(){
    let count=0;
    (structure?.sections||[]).forEach(section=>(section.pages||[]).forEach(page=>(page.photos||[]).forEach(photo=>{
      const width=Number(photo.width||0),height=Number(photo.height||0);
      if(width>0&&height>0&&(Math.max(width,height)<2400||Math.min(width,height)<1500))count++;
    })));
    return count;
  }
  function openPdfExport(){
    if(!built||!bookPages.length){pdfBtn?.setAttribute('aria-label','Сначала соберите книгу');buildBtn?.focus();return;}
    const el=pdfElements(),size=activePdfSize();
    if(el.format)el.format.textContent=pdfExportMode==='spreads'?`${size[0]*2} × ${size[1]} мм`:`${size[0]} × ${size[1]} мм`;
    if(el.pages)el.pages.textContent=pdfExportMode==='spreads'?String(bookSpreads.length):String(bookPages.length);
    el.mode?.querySelectorAll('button').forEach(button=>button.classList.toggle('is-active',button.dataset.pdfMode===pdfExportMode));
    if(el.error){el.error.hidden=true;el.error.textContent='';}
    el.progress?.classList.remove('show');
    const low=lowResolutionPhotoCount();
    if(el.note)el.note.textContent=low?`PDF будет создан напрямую. Фотографий с невысоким исходным разрешением: ${low}. Они не блокируют экспорт.`:'Файл будет создан напрямую. Диалог печати не используется.';
    el.modal?.setAttribute('aria-hidden','false');el.modal?.classList.add('open');
  }
  function closePdfExport(){const el=pdfElements();el.modal?.classList.remove('open');el.modal?.setAttribute('aria-hidden','true');}
  function standalonePrintHtml(){return standalonePrintHtmlForMode(pdfExportMode);}
  function standalonePrintHtmlForMode(mode=pdfExportMode){
    const size=activePdfSize();
    const printScale=Math.min(size[0],size[1])/280*1.0582677165;
    const spreadMode=mode==='spreads';
    let sheets='';
    if(spreadMode){
      sheets=bookSpreads.map(spread=>`<section class="book-print-sheet spread-sheet"><div class="spread-cell left-cell">${spread.left?renderBookPage(spread.left,'left'):''}</div><div class="spread-cell right-cell">${spread.right?renderBookPage(spread.right,'right'):''}</div></section>`).join('');
    }else{
      const ordered=[];
      bookSpreads.forEach(spread=>{if(spread.left)ordered.push({page:spread.left,side:'left'});if(spread.right)ordered.push({page:spread.right,side:'right'});});
      sheets=ordered.map(({page,side})=>`<section class="book-print-sheet">${renderBookPage(page,side)}</section>`).join('');
    }
    const sheetWidth=spreadMode?size[0]*2:size[0];
    // Page mode keeps the canonical rule: @page{size:${size[0]}mm ${size[1]}mm;margin:0}
    const [,pageHeight]=currentPageSize();
    return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><base href="../"><link rel="stylesheet" href="book-renderer/fonts.css"><link rel="stylesheet" href="book-renderer/design-pack-01.css?v=demo-book-20261107-v255"><style>:root{--book-page-w:1000px;--book-page-h:${pageHeight}px}@page{size:${sheetWidth}mm ${size[1]}mm;margin:0}html,body{margin:0;background:#fff}.book-print-sheet{position:relative;width:${sheetWidth}mm;height:${size[1]}mm;overflow:hidden;break-after:page;page-break-after:always}.book-print-sheet:last-child{break-after:auto}.spread-sheet{display:grid;grid-template-columns:1fr 1fr}.spread-cell{position:relative;width:${size[0]}mm;height:${size[1]}mm;overflow:hidden}.dpk-page{position:absolute!important;left:0;top:0;transform-origin:0 0;transform:scale(${printScale});}</style></head><body class="book-format-${activeFormat}">${sheets}<style id="v77-cover-in-place">
.book-preview-spread.is-cover::after,.book-preview-spread.is-cover::before{display:none!important}
.book-preview-spread>.book-preview-half.is-ghost{visibility:hidden!important;background:none!important;box-shadow:none!important;pointer-events:none}
</style>
</body></html>`;
  }
  async function exportBookPdf(){
    const el=pdfElements();
    if(!built||!bookPages.length)return;
    el.download.disabled=true;el.cancel.disabled=true;el.close.disabled=true;el.progress?.classList.add('show');
    if(el.error){el.error.hidden=true;el.error.textContent='';}
    if(el.note)el.note.textContent='Создаём печатный файл. Это может занять до минуты…';
    try{
      await document.fonts?.ready;
      const raw=String(window.OCHERKI_BOOK_META?.title||'Семейная хроника').trim()||'Семейная хроника';
      const suffix=pdfExportMode==='spreads'?' — развороты':' — страницы';
      const filename=raw.replace(/[\\/:*?"<>|]+/g,' ').replace(/\s+/g,' ').trim()+suffix+'.pdf';
      const response=await fetch('/api/export-pdf',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({html:standalonePrintHtmlForMode(pdfExportMode),filename,mode:pdfExportMode,dpi:300})});
      if(!response.ok){let detail='';try{detail=(await response.json()).error||''}catch(_){detail=await response.text()}throw new Error(detail||`Ошибка ${response.status}`);}
      const blob=await response.blob();
      const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);
      if(el.note)el.note.textContent='PDF создан в размере книги и качестве 300 dpi.';
      el.progress?.classList.remove('show');
      setTimeout(closePdfExport,900);
    }catch(error){
      el.progress?.classList.remove('show');
      if(el.error){el.error.hidden=false;el.error.textContent=`Не удалось создать PDF: ${error.message}. Запускайте конструктор через start_windows.bat.`;}
      if(el.note)el.note.textContent='Книга и введённые данные не потеряны.';
    }finally{el.download.disabled=false;el.cancel.disabled=false;el.close.disabled=false;}
  }
  async function saveBookAsPdf(){openPdfExport();}
  let previewPaging=false;
  function closePreview(){
    compositionUndo.length=0;document.getElementById('recomposeUndo')?.classList.remove('is-on');
    flushPreviewAccent();
    initPreviewDom();
    window.OCHERKI_PLAY_PAGE_FX?.(.60);
    if(!previewModal)return;
    previewPendingTarget=null;
    previewPinnedTarget=null;
    previewCompositionOverride=null;
    previewPaging=false;
    previewSpread?.classList.remove('page-out-next','page-out-prev','page-in-next','page-in-prev');
    // The editor opens on the page of the spread the author was looking at.
    try{
      const uidOf=pg=>{if(!pg)return '';
        // The sheet whose words this page starts with.
        const segs=pg.source?.segments;if(segs&&pg.sourceRange){let off=0,last='';for(const seg of segs){const t=String(seg.text||'');if(!t)continue;if(off>pg.sourceRange.start)break;last=seg.sourcePageUid||last;off+=t.length+2;}if(last)return last;}
        if(pg.sourcePageUid)return pg.sourcePageUid;const list=pagePhotoIndexes(pg);for(const i of list){const uid=pg.source?.photos?.[i]?._sourcePageUid;if(uid)return uid;}return '';};
      let target=window.__ocherkiSheetForSpread?.(activeSpread)||null;
      for(let i=activeSpread;i>=0&&!target;i--){const sp=bookSpreads[i];for(const pg of [sp?.left,sp?.right]){const uid=uidOf(pg);if(uid&&pg.sectionId){target={sectionId:pg.sectionId,pageUid:uid};break;}}}
      if(target)send({action:'select',...target});
    }catch(_){}
    document.getElementById('compositionMenu')?.setAttribute('hidden','');
    // The question beside the sheet waits until the editor has settled, then
    // fades in where it belongs (it used to jump across the sheet).
    const prompt=document.getElementById('writingPrompt');
    if(prompt){prompt.classList.add('is-settling');setTimeout(()=>{window.dispatchEvent(new Event('resize'));setTimeout(()=>prompt.classList.remove('is-settling'),120);},900);}
    previewModal.classList.add('is-closing');
    previewModal.setAttribute('aria-hidden','true');
    shell?.classList.remove('is-book-preview');
    // Let the original v140 return motion finish, then hard-normalize only any
    // transient inline/WAAPI state. This prevents half-returned paper/keyboard.
    window.setTimeout(()=>{
      previewModal.classList.remove('open','is-closing');
      const settle=[
        ...document.querySelectorAll('.mode-controls,.project-actions,.project-top,.power-dock,.book-map-shell,.book-design-shell,.editor-paper-wrap,.editor-keyboard-wrap')
      ];
      settle.forEach(el=>{
        try{ el.getAnimations?.().forEach(a=>a.cancel()); }catch(_){}
        el.style.removeProperty('transform');
        el.style.removeProperty('opacity');
        el.style.removeProperty('filter');
        el.style.removeProperty('transition');
      });
      void shell?.offsetWidth;
      // positionMap/positionPrompt live in a different <script> block's closure
      // (the book-map controller) -- calling the bare names here throws
      // "positionMap is not defined" and silently aborts every line after it in
      // this callback, including the scaleAllPageCanvases()/renderActiveOnly()
      // call below that is supposed to correct any stale page-canvas sizing.
      window.OCHERKI_positionMap?.();
      fitViewport();
      layoutTimeline(false);
      window.OCHERKI_positionPrompt?.();
      requestAnimationFrame(()=>{
        scaleAllPageCanvases();
        renderActiveOnly();
        window.OCHERKI_positionPrompt?.();
      });
    },1520);
  }
  // A page turn seen from above (the approved test, qa/book-flip-test.html):
  // the sheet folds over itself along one line; the folded part shows its
  // back (the next page) and casts a soft shadow. The new spread is already
  // rendered underneath; copies of the old pages lie on top and are cut away
  // as the fold moves, so nothing blinks.
  function previewFlip(forward,target){
    // v99: a book that is closing (or lies under the manuscript) never turns a page.
    if(!previewModal?.classList.contains('open')||previewModal.classList.contains('is-closing')||previewModal.classList.contains('is-to-ms')||document.querySelector('.shell')?.classList.contains('is-manuscript'))return false;
    const hosts=[...previewSpread.querySelectorAll(':scope > .book-preview-half')];
    if(hosts.length!==2)return false;
    const L=hosts[0].getBoundingClientRect(),R=hosts[1].getBoundingClientRect();
    if(!(L.width>40&&Math.abs(L.width-R.width)<4&&Math.abs(L.right-R.left)<4))return false;
    const S=L.width,H=L.height,X0=L.left,Y0=L.top;
    const oldL=hosts[0].cloneNode(true),oldR=hosts[1].cloneNode(true);
    const fromSpread=activeSpread;
    activeSpread=target;
    previewRender();
    renderActiveOnly();
    const fresh=[...previewSpread.querySelectorAll(':scope > .book-preview-half')];
    if(fresh.length!==2)return true;
    const back=(forward?fresh[0]:fresh[1]).cloneNode(true);
    // Turning away from a cover: the place beside it was empty, so the page
    // under it shows only when the turning page lands there.
    const waiting=(forward?hosts[0]:hosts[1]).classList.contains('is-ghost')?(forward?fresh[0]:fresh[1]):null;
    if(waiting)waiting.style.visibility='hidden';
    back.style.visibility='visible';
    // v175: the leaf bends — the turn is drawn by the curl of «Книга» (app/book/book.js) when it is there
    if(window.OCHERKI_CURL){try{if(window.OCHERKI_CURL({forward,oldL,oldR,newL:fresh[0].cloneNode(true),newR:fresh[1].cloneNode(true),X0,Y0,S,H,
      back:()=>{activeSpread=fromSpread;previewRender();renderActiveOnly();},
      done:()=>{if(waiting)waiting.style.visibility='';previewPaging=false;}}))return true;}catch(err){console.warn('curl',err);}}
    const layer=document.createElement('div');
    layer.style.cssText=`position:fixed;left:${X0}px;top:${Y0}px;width:${2*S}px;height:${H}px;z-index:2147482000;pointer-events:none`;
    const piece=(host,z)=>{const box=document.createElement('div');box.style.cssText=`position:absolute;top:0;height:${H}px;overflow:hidden;z-index:${z}`;host.style.cssText+=`;position:absolute;top:0;left:0;width:${S}px;height:${H}px;margin:0;transform:none`;box.appendChild(host);layer.appendChild(box);return box;};
    const place=(box,at,a,b)=>{box.style.left=a+'px';box.style.width=Math.max(0,b-a)+'px';box.firstChild.style.left=(at-a)+'px';};
    const fx=z=>{const el=document.createElement('i');el.style.cssText=`position:absolute;top:0;height:${H}px;z-index:${z}`;layer.appendChild(el);return el;};
    const still=piece(forward?oldL:oldR,5),rest=piece(forward?oldR:oldL,10),cast=fx(15),restShade=fx(12),flap=piece(back,20),flapShade=fx(25);
    document.body.appendChild(layer);
    const set=p=>{
      const F=forward?2*S-p*S:p*S,shift=2*F-2*S,lift=Math.sin(Math.PI*p);
      const flapA=forward?2*F-2*S:F,flapB=forward?F:2*F,w=flapB-flapA;
      if(forward){place(still,0,0,Math.min(S,flapA));place(rest,S,S,F);place(flap,shift,flapA,flapB);}
      else{place(still,S,Math.max(S,flapB),2*S);place(rest,0,F,S);place(flap,S+shift,flapA,flapB);}
      const soft=Math.max(18,Math.min(90,w*.35))*(.4+.6*lift);
      flapShade.style.left=flapA+'px';flapShade.style.width=w+'px';
      flapShade.style.background=`linear-gradient(${forward?'270deg':'90deg'},rgba(255,252,244,${(.55*lift).toFixed(3)}) 0,rgba(0,0,0,${(.10*lift).toFixed(3)}) ${Math.min(40,soft*.5)}px,rgba(0,0,0,0) ${soft*1.6}px)`;
      flap.style.boxShadow=`${forward?'-':''}${(6*lift).toFixed(1)}px 0 ${(22*lift).toFixed(1)}px rgba(0,0,0,${(.28*lift).toFixed(3)})`;
      const castW=Math.max(24,soft*1.4);
      cast.style.left=(forward?F:F-castW)+'px';cast.style.width=castW+'px';
      cast.style.background=`linear-gradient(${forward?'90deg':'270deg'},rgba(0,0,0,${(.32*lift).toFixed(3)}),rgba(0,0,0,0))`;
      const restW=Math.min(soft,Math.abs(F-S));
      restShade.style.left=(forward?F-restW:F)+'px';restShade.style.width=restW+'px';
      restShade.style.background=`linear-gradient(${forward?'90deg':'270deg'},rgba(0,0,0,0),rgba(0,0,0,${(.14*lift).toFixed(3)}))`;
    };
    set(0);
    const t0=performance.now(),ms=900;
    const tick=now=>{const t=Math.min(1,(now-t0)/ms),e=t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;set(e);if(t<1)requestAnimationFrame(tick);else{if(waiting)waiting.style.visibility='';layer.remove();previewPaging=false;}};
    requestAnimationFrame(tick);
    return true;
  }
  function previewGo(delta){
    if(!bookSpreads.length || previewPaging)return;
    const target=Math.max(0,Math.min(bookSpreads.length-1,activeSpread+delta));
    if(target===activeSpread)return;
    previewPendingTarget=null;
    previewPinnedTarget=null;
    previewCompositionOverride=null;
    initPreviewDom();
    if(!previewSpread)return;
    previewPaging=true;
    window.OCHERKI_PLAY_PAGE_FX?.(.48);
    const flipFrom=bookSpreads[activeSpread],flipTo=bookSpreads[target];
    if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
      try{if(previewFlip(delta>0,target))return;}catch(error){document.querySelectorAll('body > div[style*="2147482000"]').forEach(el=>el.remove());}
    }
    const dir=delta>0?'next':'prev';
    previewSpread.classList.remove('page-in-next','page-in-prev');
    previewSpread.classList.add(dir==='next'?'page-out-next':'page-out-prev');
    window.setTimeout(()=>{
      activeSpread=target;
      previewSpread.classList.remove('page-out-next','page-out-prev');
      previewRender();
      renderActiveOnly();
      previewSpread.classList.add(dir==='next'?'page-in-next':'page-in-prev');
      window.setTimeout(()=>{
        previewSpread.classList.remove('page-in-next','page-in-prev');
        previewPaging=false;
      },360);
    },230);
  }
  previewBtn?.addEventListener('click',e=>{e.preventDefault();openPreview();});
  pdfBtn?.addEventListener('click',e=>{e.preventDefault();saveBookAsPdf();});
  document.addEventListener('click',e=>{
    if(e.target.closest?.('#pdfExportDownload')){e.preventDefault();exportBookPdf();return;}
    if(e.target.closest?.('#pdfExportClose,#pdfExportCancel')){e.preventDefault();closePdfExport();return;}
    const pdfModeButton=e.target.closest?.('[data-pdf-mode]');
    if(pdfModeButton){
      e.preventDefault();pdfExportMode=pdfModeButton.dataset.pdfMode==='spreads'?'spreads':'pages';
      const el=pdfElements();el.mode?.querySelectorAll('button').forEach(button=>button.classList.toggle('is-active',button===pdfModeButton));
      if(el.pages)el.pages.textContent=pdfExportMode==='spreads'?String(bookSpreads.length):String(bookPages.length);
      if(el.format){const size=activePdfSize();el.format.textContent=pdfExportMode==='spreads'?`${size[0]*2} × ${size[1]} мм`:`${size[0]} × ${size[1]} мм`;}
      return;
    }
    const pdfModal=document.getElementById('pdfExportModal');
    if(pdfModal && e.target===pdfModal){closePdfExport();return;}
    const close=e.target.closest?.('#bookPreviewClose');
    if(close){e.preventDefault();closePreview();return;}
    const rhythmFix=e.target.closest?.('#bookRhythmFix');
    if(rhythmFix){e.preventDefault();changePreviewComposition(1);return;}
    const layout=e.target.closest?.('#bookPreviewLayout');
    if(layout){e.preventDefault();e.stopPropagation();changePreviewComposition(1);return;}
    const layoutPrev=e.target.closest?.('#bookPreviewLayoutPrev');
    if(layoutPrev){e.preventDefault();e.stopPropagation();changePreviewComposition(-1);return;}
    const layoutNext=e.target.closest?.('#bookPreviewLayoutNext');
    if(layoutNext){e.preventDefault();e.stopPropagation();changePreviewComposition(1);return;}
    const prev=e.target.closest?.('#bookPreviewPrev');
    if(prev){e.preventDefault();previewGo(-1);return;}
    const next=e.target.closest?.('#bookPreviewNext');
    if(next){e.preventDefault();previewGo(1);return;}
    initPreviewDom();
    // The book closes only with ✕, Esc or the switch: an empty place
    // never closes it.
    if(previewModal && e.target===previewModal && !previewModal.classList.contains('has-arc'))closePreview();
  });
  window.addEventListener('keydown',e=>{
    if(e.key==='Escape'&&document.getElementById('pdfExportModal')?.classList.contains('open')){e.preventDefault();closePdfExport();return;}
    initPreviewDom();
    if(!previewModal?.classList.contains('open'))return;
    if(e.key==='Escape'){e.preventDefault();closePreview();}
    if(e.key==='ArrowLeft'){e.preventDefault();previewGo(-1);}
    if(e.key==='ArrowRight'){e.preventDefault();previewGo(1);}
  });

  // The project's editorial pack is the primary, contemporary direction.
  // Keep the dark variant available separately so the labels describe what
  // the author actually sees instead of exposing an internal name.
  const designs=[['editorial','Современный','bd-editorial'],['classic','Классика','bd-classic'],['archive','Архив','bd-archive'],['modern','Тёмный','bd-modern'],['prose','Проза','bd-prose']];
  designs.forEach(([key,label,cls])=>{
    const b=document.createElement('button');b.type='button';b.className='bd-design-card';b.dataset.design=key;
    b.innerHTML=`<span class="bd-swatch ${cls}"><span class="bd-aa">Aa</span></span><span class="bd-card-label">${label}</span>`;
    // Designs that are not finished yet are shown as «скоро» and cannot be chosen.
    if(!READY_DESIGNS.has(key)){b.disabled=true;b.classList.add('is-soon');b.title='Дизайн готовится';b.querySelector('.bd-card-label').insertAdjacentHTML('beforeend','<span class="bd-soon">скоро</span>');}
    b.addEventListener('click',()=>{if(activeDesign===key)return;[...designGrid.children].forEach(x=>x.classList.toggle('is-active',x===b));reshapeBook(()=>{activeDesign=key;});});
    designGrid?.appendChild(b);
  });
  function applyActiveFormat(){
    const [pageW,pageH]=currentPageSize();
    shell?.setAttribute('data-book-format',activeFormat);
    document.documentElement.style.setProperty('--book-page-w',pageW+'px');
    document.documentElement.style.setProperty('--book-page-h',pageH+'px');
    document.querySelectorAll('.bd-spread-card').forEach(card=>{
      card.style.aspectRatio=`${pageW*2}/${pageH}`;
    });
    if(previewSpread){
      previewSpread.style.aspectRatio=`${pageW*2}/${pageH}`;
      previewSpread.dataset.format=activeFormat;
    }
    requestAnimationFrame(()=>{observePageCanvasHosts();scaleAllPageCanvases();});
  }

  // v97: a new format, design or photo colour: the book softly steps back,
  // is laid out anew on the same sheet, and comes forward again — no jump.
  function reshapeBook(apply){
    if(!built||!previewModal?.classList.contains('open')){apply();if(built)performBuild();return;}
    window.__ocherkiKeepSheet=window.__ocherkiSheetForSpread?.(activeSpread)?.pageUid||'';
    let note=document.getElementById('reshapeNote');if(!note){note=document.createElement('div');note.id='reshapeNote';note.className='reshape-note';note.innerHTML='<i></i><span>Перекладываю книгу…</span>';previewModal.appendChild(note);}
    previewModal.classList.add('is-reshaping');
    const back=()=>requestAnimationFrame(()=>requestAnimationFrame(()=>previewModal.classList.remove('is-reshaping')));
    // The fade finishes before the heavy layout starts (the screen is calm
    // while the pages are counted), then the new book comes forward.
    setTimeout(()=>requestAnimationFrame(()=>setTimeout(()=>{apply();if(!performBuild(back))back();setTimeout(back,8000);},30)),420);
  }
  const formats=[['square','Квадратный','280×280','bd-fmt-square'],['portrait','Вертикальный','280×335','bd-fmt-portrait']];
  formats.forEach(([key,name,dims,cls])=>{
    const b=document.createElement('button');b.type='button';b.className='bd-format-card';b.dataset.format=key;
    b.innerHTML=`<span class="bd-format-well"><span class="bd-format-shape ${cls}"></span></span><span class="bd-card-label">${name}<span class="bd-dims">${dims}</span></span>`;
    b.addEventListener('click',()=>{
      if(activeFormat===key)return;
      [...formatGrid.children].forEach(x=>x.classList.toggle('is-active',x===b));
      reshapeBook(()=>{activeFormat=key;applyActiveFormat();});
    });
    formatGrid?.appendChild(b);
  });
  designGrid?.querySelector('[data-design="editorial"]')?.classList.add('is-active');
  // Colour of the photographs for the whole book.
  const photoModeGrid=document.getElementById('bdPhotoMode');
  const photoModes=[['as-is','Как загружено','цветные и ч/б не встречаются на одном развороте'],['bw','Вся книга ч/б','единый архивный вид'],['era','Цвет у новых','до 1990 года — ч/б, позже — цвет']];
  try{window.OCHERKI_BOOK_META.bookPhotoMode=localStorage.getItem('ocherki_book_photo_mode')||'as-is';}catch(_){window.OCHERKI_BOOK_META.bookPhotoMode='as-is';}
  photoModes.forEach(([key,label,hint])=>{
    const b=document.createElement('button');b.type='button';b.className='bd-photo-mode-option';b.dataset.mode=key;b.setAttribute('role','radio');
    b.innerHTML=`<span class="bd-card-label">${label}</span><span class="bd-photo-mode-hint">${hint}</span>`;
    const sync=()=>[...photoModeGrid.children].forEach(x=>{const on=x.dataset.mode===window.OCHERKI_BOOK_META.bookPhotoMode;x.classList.toggle('is-active',on);x.setAttribute('aria-checked',on?'true':'false');});
    b.addEventListener('click',()=>{window.OCHERKI_BOOK_META.bookPhotoMode=key;try{localStorage.setItem('ocherki_book_photo_mode',key);}catch(_){}sync();reshapeBook(()=>{});});
    photoModeGrid?.appendChild(b);sync();
  });
  formatGrid?.querySelector('[data-format="square"]')?.classList.add('is-active');
  applyActiveFormat();

  window.addEventListener('message',e=>{
    const d=e.data||{};
    if(d.type==='OCHERKI_VIEW_IN_BOOK'){
      if(previewModal?.classList.contains('open'))return;
      window.__ocherkiFocusPageUid=String(d.pageUid||'');
      window.__ocherkiFocusRatio=window.__ocherkiEditorRatio?.()??-1;
      // The same way into the book as the switch (the sheet flies to its page).
      if(window.OCHERKI_SET_MODE&&!document.querySelector('.shell')?.classList.contains('is-manuscript')){const keep=window.__ocherkiFocusPageUid,kr=window.__ocherkiFocusRatio;window.OCHERKI_SET_MODE('book');window.__ocherkiFocusPageUid=keep;window.__ocherkiFocusRatio=kr;}
      else buildBtn?.click();
      return;
    }
    if(d.type==='OCHERKI_ACTIVE_STATE'){
      syncActiveSpreadUid(d.payload?.pageUid||'');
      return;
    }
  });

  window.addEventListener('message',e=>{
    const d=e.data||{};
    if(d.type!=='OCHERKI_STRUCTURE_STATE')return;
    const hadStructure=!!structure;
    const nextFingerprint=contentFingerprint(d.payload);
    const contentChanged=nextFingerprint!==directorContentFingerprint;
    directorContentFingerprint=nextFingerprint;
    structure=d.payload;
    // Do not silently rebuild. Only a previously requested Build may continue
    // now that the structure has arrived. Preview never triggers this path.
    if(!built)renderRightPanel();
    if(built&&hadStructure&&contentChanged){
      markBookOutdated();
    }else if(built&&hadStructure){
      // A page click changes only active flags. Move the right-panel highlight
      // without rebuilding the text metrics or replacing image DOM nodes.
      syncActiveSpreadFromStructure(d.payload);
    }
    if(pendingBuildRequest){
      pendingBuildRequest=false;
      // Laid out in the background already, and nothing changed since: open at once.
      if(bookFresh()){hideBuilding();openPreview();}
      else performBuild(openPreview);
    }else if(!hadStructure||contentChanged||!bookFresh())schedulePrebuild();
  });

  window.addEventListener('message',event=>{
    const d=event.data;if(!d||d.type!=='OCHERKI_STRUCTURE_ERROR')return;
    lastBuildError=Object.assign(new Error(d.message||'Ошибка передачи книги'),{stack:d.stack||''});
    if(pendingBuildRequest){pendingBuildRequest=false;buildBtn.textContent='Посмотреть книгу';}
    showBookNotice(`<strong>Редактор не смог передать книгу для сборки.</strong><br>${esc(d.message||'')}`,true);
  });
  frame?.addEventListener('load',()=>setTimeout(()=>send({action:'requestState'}),100));
  window.addEventListener('resize',()=>{position();fitViewport();layoutTimeline(false);scaleAllPageCanvases()});
  new ResizeObserver(()=>{position();fitViewport()}).observe(paperWrap);
  position();
  renderRightPanel();
})();
