(function(global){
  'use strict';
  const pack=global.OcherkiDesignPackLayout,renderer=()=>global.OcherkiBookRenderer;
  const clone=value=>JSON.parse(JSON.stringify(value));
  const escape=value=>String(value??'').replace(/[&<>"'\r]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','\r':'&#13;'}[c]));
  const image=(source,index=0)=>{const p=source?.photos?.[index];return String(p?.src||p?.dataUrl||p?.dataURL||p?.url||p?.preview||p?.objectUrl||'');};
  // The caption under a photo: its own caption, or who is on it, then year and place.
  const caption=(source,index=0)=>{const p=source?.photos?.[index]||{};return [String(p.caption||'').trim()||String(p.people||'').trim(),p.year,p.place].filter(Boolean).join(' · ');};
  const accentWords=value=>[...new Intl.Segmenter('ru',{granularity:'word'}).segment(String(value||''))].filter(item=>item.isWordLike).map(item=>item.segment);
  const compactAccent=(value,fallback,attempt=0,minimum=1)=>{
    const words=accentWords(value).length?accentWords(value):accentWords(fallback);
    if(words.length<minimum)return '';
    const sizes=[6,4,3,2,1].filter(size=>size>=minimum),size=Math.min(words.length,sizes[Math.min(attempt,sizes.length-1)]);
    return words.slice(0,size).join(' ');
  };
  const ctxFallback=(photo,source)=>{
    const value=String(photo?.ctxHandwrittenNote||source?.ctxHandwrittenNote||source?.importantLine||photo?.caption||photo?.story||source?.episode||source?.title||'Семейная память').trim();
    const words=[...new Intl.Segmenter('ru',{granularity:'word'}).segment(value)].filter(item=>item.isWordLike).map(item=>item.segment);
    return words.slice(0,Math.min(8,Math.max(1,words.length))).join(' ')||'Семейная память';
  };
  function context(page,meta){return {esc:escape,image,caption,meta:{...meta,...page.meta},inferMeta:source=>source?.inferred||{},quoteFrom:source=>source?.quote||''};}
  function renderPage(page,side='right',meta={}){
    let html=renderer().renderPage(page.nativeFlow?{...page,text:'М',nativeFlow:undefined,measuredFlow:undefined}:page,side,context(page,meta));
    if(page.nativeFlow){
      const flow=page.nativeFlow,template=document.createElement('template');template.innerHTML=html;
      const article=template.content.firstElementChild,old=article.querySelector(flow.selector);
      if(!old)throw Error(`В ${page.master} отсутствует текстовая зона.`);
      const box=old.tagName==='P'?document.createElement('div'):old;if(box!==old)old.replaceWith(box);
      box.setAttribute('data-native-copy','');box.style.setProperty('--native-height',`${flow.height}px`);box.style.setProperty('--native-columns',String(flow.columns));box.style.setProperty('--native-gap',`${flow.gap}px`);box.innerHTML='';
      for(const text of flow.cells){const cell=document.createElement('div'),p=document.createElement('p');cell.setAttribute('data-native-cell','');p.setAttribute('data-source-stream','');for(const [k,v]of Object.entries(flow.font))p.style.setProperty(k,v,'important');p.innerHTML=renderer().sourceMarkup(text,[],[],true);cell.appendChild(p);box.appendChild(cell);}
      for(let p=box.parentElement;p&&p!==article;p=p.parentElement)p.setAttribute('data-native-ancestor','');
      article.classList.add('dpk-native-paginated');html=article.outerHTML;
    }
    return page.darkPaper?html.replace('class="dpk-page ','class="dpk-page dpk-dark '):html;
  }
  function createSession(meta={}){
    const size=pack.formats[meta.format||'square'];if(!size)throw Error('Неизвестный формат страницы.');
    const [width,height]=size,host=document.createElement('div');
    host.style.cssText=`position:fixed;left:-30000px;top:0;width:${width}px;height:${height}px;visibility:hidden;pointer-events:none;--book-page-w:${width}px;--book-page-h:${height}px`;
    document.body.appendChild(host);
    const warnings=[],pending=[],pendingKeys=new Set(),render=(p,s)=>renderPage(p,s,meta);
    function textPage(page,source,side){
      const original={...page};let candidate={...original};const removed=new Set(),automaticRetries={quote:0,important:0,margin:0},triedAccents={};let automaticMarginForced=false;
      const automaticRequested={
        quote:original.autoInlineQuote??!original.inlineQuote,
        important:original.autoImportant??!original.importantLine,
        margin:original.autoMarginNote??!original.marginNote
      };
      for(;;){
        try{
          const result=renderer().paginateText(candidate,source,host,render,side);Object.assign(page,candidate);
          if(original.balanceTrial)return result;
          for(const [kind,overflow]of Object.entries(candidate.measuredFlow?.accentOverflow||{}))if(overflow)warnings.push({code:'ACCENT_DOM_OVERFLOW',template:candidate.master,kind,text:kind==='quote'?candidate.inlineQuote:kind==='margin'?candidate.marginNote:candidate.importantLine,automatic:false,reason:kind==='margin'?'Заметка слишком длинная для этой области. Сократите текст.':'Редакционная вставка не помещается в измеренную область.',fallback:kind==='margin'?'user-must-shorten':'highlighted-without-reflow'});
          return result;
        }
        catch(error){
          // A balancing trial only measures; it must not defer accents or warn.
          if(original.balanceTrial)throw error;
          // Last safety net: a page whose decoration (handwritten line,
          // quote, note) cannot be set is typeset as plain prose rather than
          // stopping the whole book.
          if(error.code!=='ACCENT_UNFIT'){
            if(candidate.rhythm&&candidate.rhythm!=='plain'&&!removed.has('__plain')){
              removed.add('__plain');
              warnings.push({code:'PAGE_PLAIN_FALLBACK',template:original.master,kind:candidate.rhythm,text:'',automatic:true,reason:error.message,fallback:'plain-text-page'});
              candidate={...original,requestedMaster:original.master,master:pack.textMasters.plain,rhythm:'plain',inlineQuote:'',importantLine:'',marginNote:'',autoInlineQuote:false,autoImportant:false,autoMarginNote:false,measuredFlow:undefined};
              continue;
            }
            throw error;
          }
          const field={quote:'inlineQuote',important:'importantLine',margin:'marginNote'}[error.kind];
          const autoField={quote:'autoInlineQuote',important:'autoImportant',margin:'autoMarginNote'}[error.kind];
          const isAutomatic=Boolean(error.automatic||automaticRequested[error.kind]);
          if(isAutomatic&&field&&automaticRetries[error.kind]<5){
            const attempt=automaticRetries[error.kind]++;
            // A quote or margin note that does not fit is replaced by another
            // complete, shorter phrase of the same page — never by its first
            // few words. Handwritten lines keep the word-span fallback.
            const tried=triedAccents[error.kind]||(triedAccents[error.kind]=new Set());tried.add(String(error.text||''));
            const phrases=['quote','margin'].includes(error.kind)&&typeof renderer().editorialPhrases==='function'?renderer().editorialPhrases(String(source).slice(0,2400)):[];
            const whole=phrases.map(item=>item.text).find(text=>!tried.has(text)&&text.length<String(error.text||'').length&&text.length>=12);
            const shortened=whole||compactAccent(error.text,source,attempt,error.kind==='important'?3:1);
            if(shortened){
              candidate={...candidate,[field]:shortened,[autoField]:false,measuredFlow:undefined};
              warnings.push({code:'ACCENT_AUTO_RETRY',template:original.master,kind:error.kind,text:shortened,automatic:true,reason:error.message,fallback:'shorter-measured-accent'});
              continue;
            }
          }
          if(isAutomatic&&error.kind==='margin'&&!automaticMarginForced){
            automaticMarginForced=true;
            const forced=compactAccent(original.marginNote||source,source,4)||'Память';
            warnings.push({code:'ACCENT_AUTO_MARGIN_FORCED',template:original.master,kind:'margin',text:forced,automatic:true,reason:error.message,fallback:'safe-two-line-margin'});
            candidate={...candidate,marginNote:forced,autoMarginNote:false,allowSafeMarginAudit:true,forceMarginPlacement:true,measuredFlow:undefined};
            continue;
          }
          if(isAutomatic&&error.kind==='margin'&&automaticMarginForced){
            const safeNote=compactAccent(candidate.marginNote||original.marginNote||source,source,4)||'Память';
            const plain={...candidate,master:pack.textMasters.plain,rhythm:'plain',marginNote:'',autoMarginNote:false,allowSafeMarginAudit:false,forceMarginPlacement:false,measuredFlow:undefined};
            const result=renderer().paginateText(plain,source,host,render,side);
            const geometry=plain.measuredFlow.geometry||{},height=Number(geometry.height)||810;
            plain.measuredFlow.mode=original.rhythm;
            plain.measuredFlow.noteLines=1;
            plain.measuredFlow.accentOverflow={...(plain.measuredFlow.accentOverflow||{}),margin:false};
            const noteLength=Math.max(1,Math.round((height-86)*.8));
            Object.assign(plain.measuredFlow.geometry,{'note-length':noteLength,'note-depth':64,'note-footer-gap':30,'note-inset':side==='left'?Math.max(28,height-58-noteLength):28});
            candidate={...candidate,master:original.master,rhythm:original.rhythm,marginNote:safeNote,autoMarginNote:false,allowSafeMarginAudit:true,forceMarginPlacement:true,measuredFlow:plain.measuredFlow};
            result.measuredFlow=plain.measuredFlow;
            Object.assign(page,candidate);
            warnings.push({code:'ACCENT_AUTO_MARGIN_RECOVERED',template:original.master,kind:'margin',text:safeNote,automatic:true,reason:error.message,fallback:'plain-measurement-with-safe-margin-overlay'});
            return result;
          }
          if(isAutomatic){
            // An automatic accent is the engine's own suggestion. When no
            // fitting phrase exists the page is still typeset as plain prose
            // (recorded as a warning): a whole book never fails to build
            // because of a decoration nobody asked for.
            warnings.push({code:'ACCENT_AUTO_UNPLACED',template:original.master,kind:error.kind,text:error.text||'',automatic:true,reason:error.message,fallback:'plain-text-page'});
            candidate={...original,requestedMaster:original.master,master:pack.textMasters.plain,rhythm:'plain',inlineQuote:'',importantLine:'',marginNote:'',autoInlineQuote:false,autoImportant:false,autoMarginNote:false,measuredFlow:undefined};
            continue;
          }
          if(error.kind==='margin'||error.kind==='quote'){
            // An author's note or quote that does not fit two lines never
            // stops the book: the page is set without it and the author is
            // told which text to shorten.
            const message=error.kind==='margin'
              ?'Заметка на поле не помещается в две строки — страница собрана без неё. Сократите заметку.'
              :'Цитата не помещается в две строки — страница собрана без неё. Сократите цитату.';
            warnings.push({code:'ACCENT_UNFIT',template:original.master,kind:error.kind,text:error.text||'',automatic:false,reason:message,fallback:'plain-text-page'});
            candidate={...original,requestedMaster:original.master,master:pack.textMasters.plain,rhythm:'plain',inlineQuote:'',importantLine:'',marginNote:'',autoInlineQuote:false,autoImportant:false,autoMarginNote:false,measuredFlow:undefined};
            continue;
          }
          if(removed.has(error.kind))throw error;
          removed.add(error.kind);
          const warning={code:error.code,template:original.master,kind:error.kind,text:error.text,automatic:false,reason:error.message,fallback:'pending-whole-object'};
          const key=JSON.stringify([original.source?.uid,original.editorialOverrideKey,error.kind,error.text]);
          if(!pendingKeys.has(key)){warnings.push(warning);pendingKeys.add(key);pending.push({warning,page:original});}
          const hasMargin=['margin','important-margin'].includes(original.rhythm)&&!removed.has('margin');
          const rhythm=hasMargin?'margin':'plain';
          candidate={...original,requestedMaster:original.master,master:pack.textMasters[rhythm],rhythm,measuredFlow:undefined};
        }
      }
    }
    function nativePage(page,source,side,selector){
      host.innerHTML=renderer().renderPage({...page,text:'М'},side,context(page,meta));
      const article=host.firstElementChild,slot=article.querySelector(selector);
      const unfit=message=>Object.assign(new Error(message),{code:'NATIVE_ZONE_UNFIT'});
      if(!slot)throw unfit(`Текстовая зона ${selector} не найдена.`);
      const copy=slot.tagName==='P'?slot:slot.querySelector('p');if(!copy)throw unfit('У текстовой зоны нет наборного элемента.');
      const style=getComputedStyle(copy),slotStyle=getComputedStyle(slot);
      const box=slot.getBoundingClientRect(),pageBox=article.getBoundingClientRect(),parentBox=slot.parentElement.getBoundingClientRect();
      const folio=article.querySelector('.dpk-folio')?.getBoundingClientRect(),leading=parseFloat(style.lineHeight);
      const bottom=Math.min(folio?folio.top-leading:pageBox.bottom-leading,slot.tagName==='P'?parentBox.bottom:box.bottom);
      const available=Math.floor((bottom-box.top)/leading)*leading;
      if(!(available>=leading&&box.width>0))throw unfit('Композиция не оставляет места для целой строки.');
      const font={};for(const k of ['font-family','font-size','font-style','font-weight','line-height','letter-spacing','word-spacing','color','text-align'])font[k]=style.getPropertyValue(k);
      const columns=Math.max(1,parseInt(slotStyle.columnCount)||1),gap=parseFloat(slotStyle.columnGap)||0;
      page.nativeFlow={selector,height:available,columns,gap,font,cells:Array.from({length:columns},()=>''),maximal:[]};
      host.innerHTML=render(page,side);let rest=source;
      [...host.querySelectorAll('[data-native-cell] p')].forEach((p,i)=>{const part=renderer().splitRenderedText(p,rest);page.nativeFlow.cells[i]=part.head;page.nativeFlow.maximal[i]=part.maximumConfirmed;rest=part.tail;});
      const head=page.nativeFlow.cells.join('');if(!head&&source)throw unfit('Текст не поместился в выбранную композицию.');
      if(head+rest!==source)throw Error('Нарушена сохранность текста.');
      page.text=head;page.sourceText=head;return {head,tail:rest};
    }
    function deferredPages(){
      const pages=[];
      for(const {warning,page:original}of pending){
        const quote=warning.kind==='quote',rhythm=quote?'inline-quote':'important';
        const page={kind:'text',layout:'prose-dense',master:pack.textMasters[rhythm],rhythm,title:original.title,episode:original.episode,source:original.source,text:'',sourceText:'',accentFallbackZone:'column',importantLine:quote?'':warning.text,inlineQuote:quote?warning.text:'',autoImportant:false,autoInlineQuote:false};
        try{renderer().paginateText(page,'',host,render,'left');pages.push(page);warning.fallback='relocated-whole-object';}
        catch(error){if(error.code!=='ACCENT_UNFIT')throw error;warning.fallback='unplaced-object';warning.reason=error.message;}
      }
      return pages;
    }
    return {host,render,warnings,textPage,nativePage,deferredPages,dispose:()=>host.remove()};
  }
  function makeText(source,rhythm){return {kind:'text',layout:'prose-dense',master:pack.textMasters[rhythm],rhythm,title:source.title,episode:source.episode,source,importantLine:source.importantLine||'',inlineQuote:source.inlineQuote||source.quote||'',marginNote:source.marginNote||'',autoImportant:!source.importantLine,autoInlineQuote:!(source.inlineQuote||source.quote),autoMarginNote:!source.marginNote};}
  // Execute an explicitly selected existing composition. This is not a Director:
  // no content scoring, random selection or new editorial policies are introduced.
  function compose(structure,meta,session){
    const sections=(structure.sections||[]).filter(s=>s.included!==false&&s.type==='chapter');
    const cards=sections.flatMap(s=>(s.pages||[]).filter(p=>p.included!==false));
    const raw=cards.map(p=>String(p.text??'')).join(''),photos=cards.flatMap(p=>p.photos||[]);
    const source={...cards[0],title:sections[0]?.title||'Тестовый текст',photos};
    const selected=pack.compositions.find(c=>c.id===meta.composition);if(!selected)throw Error('Неизвестная композиция.');
    const spreads=[];let rest=raw,cursor=0,rhythmIndex=0;
    const putText=(side,rhythm)=>{if(!rest)return null;const page=makeText(source,rhythm||pack.rhythm[rhythmIndex++%pack.rhythm.length]);const part=session.textPage(page,rest,side);page.text=part.head;page.sourceText=part.head;rest=part.tail;return page;};
    while(rest||cursor<photos.length){
      const before=rest,photoStart=cursor;let left=null,right=null,spreadMaster='D01-SPREAD-LAYOUT';
      if(cursor<photos.length){
        const spec=selected.photos?selected:pack.compositions.find(c=>c.id==='photo'),indexes=[];
        while(cursor<photos.length&&indexes.length<spec.photos)indexes.push(cursor++);
        left={kind:spec.kind,layout:spec.layout,master:spec.master,source,photoIndex:indexes[0],photoIndices:indexes,text:'',title:source.title};
        if(spec.pair==='ctx'){
          const photo=source.photos?.[indexes[0]]||{},ratio=Number(photo.width)>0&&Number(photo.height)>0?Number(photo.width)/Number(photo.height):1;
          left.ctxState=String(photo.ctxState||(ratio<.82?'V':ratio>1.22?'H':'S')).toUpperCase();
          left.mainPhotoAssetId=String(photo.id||image(source,indexes[0])||`photo-${indexes[0]}`);
          const secondaryIndex=indexes.find(index=>index!==indexes[0]&&image(source,index)&&image(source,index)!==image(source,indexes[0])&&String(source.photos?.[index]?.id||image(source,index)||`photo-${index}`)!==left.mainPhotoAssetId);
          left.secondaryPhotoIndex=Number.isFinite(secondaryIndex)?secondaryIndex:null;
          left.secondaryPhotoAssetId=Number.isFinite(secondaryIndex)?String(source.photos?.[secondaryIndex]?.id||image(source,secondaryIndex)||`photo-${secondaryIndex}`):null;
          left.ctxAccentType=Number.isFinite(secondaryIndex)?'secondary-photo':'handwritten-note';
          if(!Number.isFinite(secondaryIndex)){left.ctxHandwrittenNote=ctxFallback(photo,source);left.editorialAccentEditable=true;left.editorialOverrideKey=`ctx-handwritten:${photo.id||indexes[0]}`;left.editorialSourcePageUid=source.uid||source.id||'';session.warnings.push({code:'CTX_SECONDARY_PHOTO_UNAVAILABLE',photoIndex:indexes[0],reason:'Нет второй отличающейся фотографии.',fallback:'handwritten-note'});}
          right=left;left=putText('left','plain');
        }
        if(spec.pair==='dark-fade'){
          const photo=source.photos?.[indexes[0]]||{},ratio=Number(photo.width)>0&&Number(photo.height)>0?Number(photo.width)/Number(photo.height):1;
          left.darkFadeState=String(photo.darkFadeState||(ratio<.82?'V':ratio>1.22?'H':'S')).toUpperCase();left.darkFadeSide='left';
          right={...left,darkFadeSide:'right'};
          spreadMaster='D01-SPREAD-DARK-FADE-2.2';
        }
        if(spec.pair==='panorama'){left.panoramaSide='left';right={...left,panoramaSide:'right',hideCaption:true};}
        if(spec.pair==='rail'){left.railSide='right';right={...left,kind:'photo-rail-text',layout:'photo-rail-text',railSide:'right'};}
        if(spec.pair==='document')right={...left,kind:'document-comment',layout:'document-comment',master:'D01-DOCUMENT-COMMENT'};
        const fill=(page,side,selector)=>{if(!rest)return;try{rest=session.nativePage(page,rest,side,selector).tail;}catch(error){if(error.code!=='NATIVE_ZONE_UNFIT')throw error;session.warnings.push({code:error.code,template:page.master,reason:error.message,fallback:'text-on-following-page'});delete page.nativeFlow;page.text='';delete page.sourceText;}};
        if(spec.slot)fill(left,'left',spec.slot);
        if(spec.pair==='rail')fill(right,'right','.dpk-photo-rail-copy .dpk-columns');
        if(spec.pair==='document')fill(right,'right','.dpk-document-transcript > p');
        if(!right){right=putText('right',spec.dark?'plain':undefined);if(spec.dark&&right)right.darkPaper=true;}
      }else{const rhythm=selected.photos||selected.id==='cycle'?undefined:selected.id;left=putText('left',rhythm);right=putText('right',rhythm);}
      if(before===rest&&photoStart===cursor)throw Error('Раскладка не продвинулась.');
      if(left||right)spreads.push({master:spreadMaster,left,right,remainingText:rest.length,usedPhotos:cursor});
    }
    const pages=spreads.flatMap(s=>[s.left,s.right].filter(Boolean));
    if(pages.map(p=>p.sourceText||'').join('')!==raw)throw Error('Исходный текст не совпадает с итоговыми страницами.');
    return {ready:Boolean(pages.length),spreads,pages,meta,sourceText:raw,photoCount:photos.length,usedPhotos:cursor,pagination:'layout-dom-v2'};
  }
  function auditPage(article,page){
    if(page.measuredFlow)return renderer().auditMeasuredPage(article,page);
    if(!page.nativeFlow)return {status:'pass',violations:[]};
    const violations=[],actual=[...article.querySelectorAll('[data-source-stream]')].map(p=>p.textContent).join('');
    if(actual!==page.sourceText)violations.push({rule:'rendered-source-mismatch'});
    for(const cell of article.querySelectorAll('[data-native-cell]')){const box=cell.getBoundingClientRect(),p=cell.querySelector('p'),range=document.createRange();range.selectNodeContents(p);for(const r of range.getClientRects())if(r.top<box.top-.5||r.bottom>box.bottom+.5||r.left<box.left-.5||r.right>box.right+.5)violations.push({rule:'line-outside-column'});}
    return {status:violations.length?'fail':'pass',violations};
  }
  function geometrySignature(result){
    return (result?.spreads||[]).map(spread=>({
      master:spread.master,
      pages:['left','right'].map(side=>{
        const page=spread[side];if(!page)return null;
        return {side,master:page.master,photoIndex:Number.isFinite(Number(page.photoIndex))?Number(page.photoIndex):null,secondaryPhotoIndex:Number.isFinite(Number(page.secondaryPhotoIndex))?Number(page.secondaryPhotoIndex):null,mainPhotoAssetId:page.mainPhotoAssetId||null,secondaryPhotoAssetId:page.secondaryPhotoAssetId||null,ctxState:page.ctxState||null,ctxAccentType:page.ctxAccentType||null,ctxHandwrittenNote:page.ctxHandwrittenNote||'',darkFadeState:page.darkFadeState||null,darkFadeSide:page.darkFadeSide||null,quote:page.inlineQuote||'',quoteBand:page.measuredFlow?.geometry?.['quote-band']||null,important:page.importantLine||'',margin:page.marginNote||'',noteLines:page.measuredFlow?.noteLines||null,accentZone:page.accentZone||null,cells:page.measuredFlow?.cells?.map(text=>text.length)||null,maximal:page.measuredFlow?.maximal||null,sourceRange:page.sourceRange||null};
      })
    }));
  }
  function build(structure,meta={}){
    const input=clone(structure),settings={...meta},session=createSession(settings);
    try{
      const result=settings.composition?compose(input,settings,session):global.OcherkiBookEngine.assemble(input,{...settings,textRhythmOnly:true,layoutDefinition:pack,paginateText:session.textPage});
      if(!result.ready)return result;
      let at=result.spreads.findIndex(s=>[s.left,s.right].some(p=>p&&['epilogue','thanks','sources','colophon','back-cover'].includes(p.kind)));if(at<0)at=result.spreads.length;
      // Deferred pages are measured as left pages; the right side is closed
      // with a blank page so the physical page order stays even/odd correct.
      for(const page of session.deferredPages())result.spreads.splice(at++,0,{master:'D01-SPREAD-EDITORIAL-FALLBACK',left:page,right:{kind:'blank',layout:'blank'}});
      // A handwritten document transcript fills its ruled sheet; when it is
      // longer, it continues on further ruled sheets (measured, whole words).
      const handFits=(page,side)=>{if(typeof session.host.querySelector!=='function')return true;session.host.innerHTML=session.render(page,side);const hand=session.host.querySelector('.dpk-document-hand');return !hand||hand.scrollHeight<=hand.clientHeight+1;};
      for(let index=0;index<result.spreads.length;index++){
        const page=result.spreads[index].right;
        if(!page||page.kind!=='document-comment'||handFits(page,'right'))continue;
        const full=String(page.transcript||page.text||'').trim(),size=[22,34];
        if(handFits({...page,handSize:size},'right')){page.handSize=size;continue;}
        const tokens=full.split(/(\s+)/u),chunks=[];let start=0;
        while(start<tokens.length){
          const side=chunks.length%2===0?'right':'left',test=end=>handFits({...page,handChunk:tokens.slice(start,end).join('').trim(),handSize:size,handContinuation:chunks.length>0},side);
          let low=start+1,high=tokens.length;
          while(low<high){const middle=Math.ceil((low+high)/2);if(test(middle))low=middle;else high=middle-1;}
          chunks.push(tokens.slice(start,low).join('').trim());start=low;
        }
        Object.assign(page,{handChunk:chunks[0],handSize:size});
        const sheet=(chunk,n)=>({...page,id:`${page.id}_sheet_${n}`,handChunk:chunk,handContinuation:true});
        const extra=[];
        for(let n=1;n<chunks.length;n+=2)extra.push({master:'D01-SPREAD-DOCUMENT-CONTINUATION',sectionId:result.spreads[index].sectionId,left:sheet(chunks[n],n),right:chunks[n+1]?sheet(chunks[n+1],n+1):{kind:'blank',layout:'blank'}});
        result.spreads.splice(index+1,0,...extra);index+=extra.length;
      }
      result.spreads.forEach((spread,index)=>{if(!spread.id)spread.id=`d01_spread_${index+1}`;});result.pages=result.spreads.flatMap(s=>[s.left,s.right].filter(Boolean));result.pages.forEach((p,i)=>{p.pageNo=i+1;});
      const metrics=[];
      for(const spread of result.spreads)for(const side of ['left','right']){
        const page=spread[side];if(!page)continue;session.host.innerHTML=session.render(page,side);
        const check=auditPage(session.host.firstElementChild,page);if(check.status!=='pass')throw Error(`Страница ${page.pageNo}: ${check.violations.map(v=>v.rule).join(', ')}`);
        metrics.push({page:page.pageNo,master:page.master,geometry:page.measuredFlow?.geometry||page.nativeFlow&&{height:page.nativeFlow.height,columns:page.nativeFlow.columns,gap:page.nativeFlow.gap}});
      }
      result.layout={module:'OcherkiLayoutPagination',renderer:'OcherkiBookRenderer.renderPage',paginator:'OcherkiBookRenderer.paginateText',format:settings.format||'square',metrics,warnings:session.warnings,sourceInvariant:'exact',geometrySignature:geometrySignature(result)};return result;
    }finally{session.dispose();}
  }
  global.OcherkiLayoutPagination=Object.freeze({FORMATS:pack.formats,COMPOSITIONS:pack.compositions,build,renderPage,auditPage,createSession,geometrySignature,readyFonts:()=>renderer().readyFonts()});
})(window);
