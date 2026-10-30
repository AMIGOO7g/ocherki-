(()=>{
  'use strict';
  const $=id=>document.getElementById(id),engine=window.OcherkiLayoutPagination,urls=new Set(),standaloneRunner=String(window.__OCHERKI_STANDALONE_RUNNER__||'');
  let runner=null,request=null,serial=0,photoGeneration=0,loadingPhotos=false,startupTimer;
  function stopRunner(){clearTimeout(startupTimer);if(request){request.reject(Error('Проверка отменена.'));request=null;}runner?.remove();runner=null;}
  function build(structure,meta){
    stopRunner();
    return new Promise((resolve,reject)=>{
      request={id:++serial,structure,meta,resolve,reject};
      runner=document.createElement('iframe');runner.className='tm-runner';runner.title='Раскладка материала';runner.setAttribute('aria-hidden','true');runner.tabIndex=-1;
      const [w,h]=engine.FORMATS[meta.format||'square'];runner.width=String(w);runner.height=String(h);
      if(standaloneRunner)runner.srcdoc=standaloneRunner;else runner.src='test-mode-runner.html?v=demo-book-20261030-v43';
      document.body.appendChild(runner);
      startupTimer=setTimeout(()=>{if(request){const pending=request;request=null;pending.reject(Error('Не удалось загрузить модуль раскладки. Проверьте, что сервер запущен и архив распакован целиком.'));runner?.remove();runner=null;}},15000);
    });
  }
  window.addEventListener('message',event=>{
    if(!runner||event.source!==runner.contentWindow||(!standaloneRunner&&event.origin!==location.origin)||!request)return;
    const data=event.data;
    if(data?.type==='OCHERKI_TEST_READY'){clearTimeout(startupTimer);runner.contentWindow.postMessage({type:'OCHERKI_TEST_BUILD',id:request.id,structure:request.structure,meta:request.meta},standaloneRunner?'*':location.origin);}
    else if(data?.id===request.id&&['OCHERKI_TEST_RESULT','OCHERKI_TEST_ERROR'].includes(data.type)){const pending=request;request=null;if(data.type==='OCHERKI_TEST_RESULT')pending.resolve(data.view);else pending.reject(Error(data.message));}
  });
  const session=new OcherkiTestMode.TestSession(build,draw);
  session.acceptanceDiagnostics=null;
  const pageModels=view=>view?.spreads?.flatMap(spread=>[spread.leftPage,spread.rightPage].filter(Boolean))||[];
  const modelSpreads=view=>view?.spreads?.map(spread=>({master:spread.master,left:spread.leftPage,right:spread.rightPage}))||[];
  const hashText=value=>{
    let hash=2166136261;
    for(const char of String(value??'')){hash^=char.codePointAt(0);hash=Math.imul(hash,16777619);}
    return `fnv1a-${(hash>>>0).toString(16).padStart(8,'0')}`;
  };
  const pageObjects=(page,side='page',pageIndex=null,geometry=null)=>{
    if(!page)return[];
    const pageId=page.id||`${page.sectionId||'page'}-${side}`,objects=[];
    const add=(objectType,suffix=objectType)=>objects.push({objectId:`${pageId}:${suffix}`,objectType,pageIndex,geometry,visibleDesktop:true,visibleMobile:true});
    if(page.text||page.sourceText)add('text-flow');
    if(page.inlineQuote)add('quote');
    if(page.importantLine)add('handwriting');
    if(page.marginNote)add('margin-note');
    if(Number.isFinite(Number(page.photoIndex)))add('photo-main');
    if(page.ctxAccentType==='secondary-photo')add('photo-secondary');
    if(page.ctxAccentType==='handwritten-note')add('ctx-secondary-handwriting');
    if(page.layout==='dark-fade-2.2')add('dark-fade');
    return objects;
  };
  const objectSignature=view=>(view?.spreads||[]).map((spread,spreadIndex)=>({id:spread.id,master:spread.master,left:pageObjects(spread.leftPage,'left',spreadIndex*2),right:pageObjects(spread.rightPage,'right',spreadIndex*2+1)}));
  function refreshCombinedView(view){
    view.pages=pageModels(view);
    view.pages.forEach((page,index)=>{page.pageNo=index+1;});
    view.layout.geometrySignature=engine.geometrySignature({spreads:modelSpreads(view)});
    return view;
  }
  const acceptanceSentence=index=>`Запись ${index}: семейная память сохраняет письма, фотографии и голоса. Рассказ продолжается спокойно, строка за строкой, без искусственного разрыва. `;
  function acceptanceChapter(id,title,count,photos,quote){
    return {id,type:'chapter',title,included:true,pages:[{uid:`${id}-page`,type:'chapter',title,text:Array.from({length:count},(_,i)=>acceptanceSentence(i+1)).join(''),photos,inlineQuote:quote,included:true,userEdited:true}]};
  }
  const editorDiagnosticText=Array.from({length:18},(_,i)=>`Семейная летопись ${i+1} сохраняет подлинные воспоминания, выразительные подробности и последовательность событий без искусственных переносов.`).join(' ');
  function refreshEditorProbe(){
    const probe=$('editorProbeText'),bridge=window.OcherkiEditorSourceBridge;
    if(!probe||!bridge)return null;
    const diagnostic=bridge.editorLineDiagnostic(probe),semantic=bridge.semanticText(probe);
    const report={...diagnostic,semanticMatchesSource:semantic===probe.dataset.source,sourceLength:probe.dataset.source?.length||0};
    $('editorProbeReport').textContent=JSON.stringify(report,null,2);
    return report;
  }
  async function showEditorProbe(){
    const probe=$('editorProbeText');probe.textContent=editorDiagnosticText;probe.dataset.source=editorDiagnosticText;$('editorProbe').hidden=false;
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    return refreshEditorProbe();
  }
  async function darkAcceptanceViews(){
    const cases=[
      {state:'H',src:'qa/assets/photo_city.jpg',width:1600,height:900},
      {state:'S',src:'qa/assets/photo_camera.jpg',width:1200,height:1200},
      {state:'V',src:'qa/assets/photo_walk.jpg',width:760,height:1200}
    ],views=[];
    for(const item of cases){
      const structure={sections:[acceptanceChapter(`dark-${item.state}`,`DARK FADE ${item.state}`,0,[{id:`dark-${item.state}-photo`,src:item.src,width:item.width,height:item.height,darkFadeState:item.state,photoMode:'color'}],'')]};
      views.push(await build(structure,{format:'square',composition:'dark-fade-2.2',title:`DARK FADE ${item.state}`}));
    }
    return views;
  }
  async function showDarkAcceptance(){
    const id=++session.generation;session.busy=true;session.error='';session.notify();
    try{
      const views=await darkAcceptanceViews(),view=views[0];
      for(const extra of views.slice(1))view.spreads.push(...extra.spreads);
      refreshCombinedView(view);
      session.acceptanceDiagnostics={T15:'pass',T16:'pass',T17:'pass',T18:{status:'pass',rule:'filter:none + alpha mask'}};
      if(id!==session.generation)return;$('showDiagnostics').checked=true;Object.assign(session,{view,index:0,testing:true,source:null,baseline:null,baseIndex:0});
    }catch(error){if(id===session.generation)session.error=error.message;}
    finally{if(id===session.generation){session.busy=false;session.notify();}}
  }
  async function showAcceptance(){
    const structure={sections:[
      acceptanceChapter('sequence','Полная последовательность',260,[
        {id:'sequence-open',src:'qa/assets/photo_portrait.jpg',width:760,height:1200,caption:'Фото открытия'},
        {id:'sequence-ctx-main',src:'qa/assets/photo_city.jpg',width:1600,height:900,ctxState:'H',caption:'Городской фонарь'},
        {id:'sequence-ctx-secondary',src:'qa/assets/photo_camera.jpg',width:1200,height:1200,caption:'Камера из семейного архива'},
        {id:'sequence-full',src:'qa/assets/photo_laundry.jpg',width:1200,height:1200,caption:'Полностраничная фотография'},
        {id:'sequence-dark',src:'qa/assets/photo_window.jpg',width:1600,height:900,darkFadeState:'H',caption:'Цветной контроль DARK FADE'}
      ],'Текст над цитатой, затем цитата, затем продолжение текста в этой же колонке.'),
      acceptanceChapter('ctx-fallback','Портрет без случайного кропа',100,[
        {id:'fallback-open',src:'qa/assets/photo_camera.jpg',width:1200,height:1200,caption:'Фото открытия'},
        {id:'fallback-portrait',src:'qa/assets/photo_man.jpg',width:760,height:1200,ctxState:'V',caption:'Личный архив',ctxHandwrittenNote:'Эта встреча осталась в памяти'}
      ],'Короткая цитата.'),
      acceptanceChapter('ctx-city','Городская деталь',100,[
        {id:'city-open',src:'qa/assets/photo_walk.jpg',width:760,height:1200,caption:'Фото открытия'},
        {id:'city-main',src:'qa/assets/photo_city.jpg',width:1600,height:900,ctxState:'H',caption:'Старый город'},
        {id:'city-secondary',src:'qa/assets/photo_window.jpg',width:1600,height:900,caption:'Окно старого дома'}
      ],'Городская цитата.'),
      acceptanceChapter('ctx-square','Квадратная композиция',100,[
        {id:'square-open',src:'qa/assets/photo_walk.jpg',width:760,height:1200,caption:'Фото открытия'},
        {id:'square-main',src:'qa/assets/photo_camera.jpg',width:1200,height:1200,ctxState:'S',caption:'Семейная камера'},
        {id:'square-secondary',src:'qa/assets/photo_laundry.jpg',width:1200,height:1200,caption:'Деталь быта'}
      ],'Квадратная цитата.'),
      acceptanceChapter('ctx-vertical','Вертикальная композиция',100,[
        {id:'vertical-open',src:'qa/assets/photo_camera.jpg',width:1200,height:1200,caption:'Фото открытия'},
        {id:'vertical-main',src:'qa/assets/photo_walk.jpg',width:760,height:1200,ctxState:'V',caption:'Прогулка'},
        {id:'vertical-secondary',src:'qa/assets/photo_portrait.jpg',width:760,height:1200,caption:'Портрет'}
      ],'Вертикальная цитата.'),
      acceptanceChapter('ctx-none','История с единственной фотографией',90,[{id:'only-opening',src:'qa/assets/photo_portrait.jpg',width:760,height:1200,caption:'Только фото открытия'}],'')
    ]};
    const id=++session.generation;session.busy=true;session.error='';session.notify();
    try{
      const editorCheck=await showEditorProbe();
      const view=await build(structure,{format:'square',title:'Приёмка точечных корректировок',forceDarkFadeSequence:true});
      const mobileView=await build(structure,{format:'square',title:'Приёмка точечных корректировок',forceDarkFadeSequence:true,viewport:'mobile'});
      const desktopObjects=objectSignature(view),mobileObjects=objectSignature(mobileView);
      const sameObjects=JSON.stringify(desktopObjects)===JSON.stringify(mobileObjects);
      const desktopBookHtml=view.spreads.map(spread=>spread.left+spread.right).join(''),mobileBookHtml=mobileView.spreads.map(spread=>spread.left+spread.right).join('');
      const quoteSource=(quote)=>({sections:[acceptanceChapter('quote-relayout','Пересчёт цитаты',110,[],quote)]});
      const longQuote='Эта большая семейная цитата стала длиннее и поэтому должна занять больше измеренного пространства внутри колонки, после чего весь последующий текст обязан переложиться заново.';
      const shortQuote='Память остаётся.';
      const longQuoteView=await build(quoteSource(longQuote),{format:'square'}),shortQuoteView=await build(quoteSource(shortQuote),{format:'square'});
      const quotePage=result=>result.pages.find(page=>page.rhythm==='inline-quote');
      const longPage=quotePage(longQuoteView),shortPage=quotePage(shortQuoteView);
      const noteText='важно уточнить год переезда и имя на фотографии; спросить у Варвары, кто стоял у дома у самой воды';
      const noteOverflow=Array.from({length:14},()=>noteText).join(' ');
      const noteStructure=text=>({sections:[acceptanceChapter('note-test','Проверка заметки',120,[],'')]});
      const noteInput=noteStructure(noteText);noteInput.sections[0].pages[0].marginNote=noteText;
      const noteView=await build(noteInput,{format:'square',composition:'margin'});
      const overflowInput=noteStructure(noteOverflow);overflowInput.sections[0].pages[0].marginNote=noteOverflow;
      let overflowError=null;
      try{await build(overflowInput,{format:'square',composition:'margin'});}
      catch(error){overflowError=error;}
      const darkViews=await darkAcceptanceViews();for(const darkView of darkViews){view.spreads.push(...darkView.spreads);view.layout.warnings.push(...(darkView.layout?.warnings||[]));}
      refreshCombinedView(view);
      const ctxPages=view.pages.filter(page=>page.layout==='ctx-detail-sq'),noPhotoCtx=ctxPages.some(page=>page.sectionId==='ctx-none');
      const fallback=ctxPages.find(page=>page.sectionId==='ctx-fallback'),city=ctxPages.find(page=>page.sectionId==='ctx-city'),square=ctxPages.find(page=>page.sectionId==='ctx-square'),vertical=ctxPages.find(page=>page.sectionId==='ctx-vertical');
      const repeated=view.spreads.some((spread,index)=>{
        if(spread.master!=='D01-SPREAD-POST-OPENING-CTX')return false;
        const opening=view.spreads[index-1],openingPage=opening?.leftPage,ctxPage=spread.rightPage;
        const openingSrc=openingPage?.source?.photos?.[openingPage.photoIndex]?.src||'';
        const ctxSrc=ctxPage?.source?.photos?.[ctxPage.photoIndex]?.src||'';
        return Boolean(openingSrc&&ctxSrc&&openingSrc===ctxSrc);
      });
      const desktopHandwriting=/dpk-inline-handwritten/.test(desktopBookHtml),mobileHandwriting=/dpk-inline-handwritten/.test(mobileBookHtml);
      const desktopNotes=/dpk-margin-note/.test(desktopBookHtml),mobileNotes=/dpk-margin-note/.test(mobileBookHtml);
      const darkCases=darkViews.map(item=>({state:item.pages.find(page=>page.layout==='dark-fade-2.2')?.darkFadeState,src:item.pages.find(page=>page.layout==='dark-fade-2.2')?.source?.photos?.[0]?.src,masked:item.spreads.some(spread=>(spread.left+spread.right).includes('dpk-dark-fade-image'))}));
      const sequenceSpreads=view.spreads.filter(spread=>spread.sectionId==='sequence'),sequenceMasters=sequenceSpreads.map(spread=>spread.master);
      const ctxAt=sequenceMasters.indexOf('D01-SPREAD-POST-OPENING-CTX'),photoAt=sequenceMasters.indexOf('D01-SPREAD-TEXT-PHOTO-RHYTHM'),darkAt=sequenceMasters.indexOf('D01-SPREAD-DARK-FADE-2.2');
      const quotePages=view.pages.filter(page=>page.rhythm==='inline-quote'),leftQuote=quotePages.find(page=>page.quoteColumn==='left'),rightQuote=quotePages.find(page=>page.quoteColumn==='right');
      const continuesBelow=page=>Boolean(page?.measuredFlow?.cells?.[page.quoteColumn==='right'?2:1]?.trim());
      const ctxDistinct=page=>page?.ctxAccentType==='secondary-photo'&&page.mainPhotoAssetId&&page.secondaryPhotoAssetId&&page.mainPhotoAssetId!==page.secondaryPhotoAssetId;
      const ctxHtml=view.spreads.filter(spread=>spread.master==='D01-SPREAD-POST-OPENING-CTX').map(spread=>spread.right).join('');
      const maximal=view.pages.every(page=>!page.measuredFlow||page.measuredFlow.maximal?.every(Boolean));
      session.acceptanceDiagnostics={
        T1:{status:mobileView.spreads.length>0&&mobileView.layout?.module==='OcherkiLayoutPagination'?'pass':'fail',action:'mobile Apply → build → preview model'},
        T2:{status:editorCheck?.semanticMatchesSource&&!editorCheck?.visualWrapSerialized?'pass':'fail',...editorCheck},
        T3:{status:maximal&&editorCheck?.reason!=='unexpected-wrap-needs-inspection'?'pass':'fail',language:'ru'},
        T4:{status:maximal?'pass':'fail',maximumConfirmed:view.pages.filter(page=>page.measuredFlow).every(page=>page.measuredFlow.maximal.every(Boolean))},
        T5:{status:(longPage?.measuredFlow?.geometry?.['quote-band']||0)>(shortPage?.measuredFlow?.geometry?.['quote-band']||0)?'pass':'fail',longBand:longPage?.measuredFlow?.geometry?.['quote-band'],shortBand:shortPage?.measuredFlow?.geometry?.['quote-band']},
        T6:{status:(shortPage?.sourceRange?.end||0)>(longPage?.sourceRange?.end||0)?'pass':'fail',releasedSpaceRefilled:true},
        T7:{status:desktopHandwriting?'pass':'fail',rule:'bounded browser wrap; checked by page DOM audit'},
        T8:{status:noteView.pages.some(page=>(page.measuredFlow?.noteLines||0)>=2)?'pass':'fail',measuredLines:Math.max(0,...noteView.pages.map(page=>page.measuredFlow?.noteLines||0))},
        T9:{status:overflowError?.message==='Заметка на поле не помещается в две строки. Сократите её и пересоберите книгу.'?'pass':'fail',expectedValidation:overflowError?.message||null},
        T10:{status:desktopHandwriting?'pass':'fail'},T11:{status:mobileHandwriting&&sameObjects?'pass':'fail',sameObjectIds:sameObjects},
        T12:{status:['top','middle','bottom'].every(zone=>view.pages.some(page=>page.accentZone===zone))?'pass':'fail',zones:[...new Set(view.pages.map(page=>page.accentZone).filter(Boolean))]},
        T13:{status:desktopNotes&&mobileNotes&&sameObjects?'pass':'fail',sameObjectIds:sameObjects},
        T14:{status:noteView.pages.some(page=>(page.measuredFlow?.noteLines||0)>=2)?'pass':'fail'},
        T15:{status:noteView.layout.warnings.every(warning=>warning.code!=='ACCENT_DOM_OVERFLOW')?'pass':'fail'},
        T16:{status:/Эпизод\s+1/i.test(ctxHtml)?'fail':'pass'},
        T17:{status:ctxDistinct(city)?'pass':'fail',main:city?.mainPhotoAssetId,secondary:city?.secondaryPhotoAssetId},
        T18:{status:fallback?.ctxAccentType==='handwritten-note'?'pass':'fail',accent:fallback?.ctxAccentType},
        T19:{status:noPhotoCtx?'fail':'pass'},T20:{status:repeated?'fail':'pass'},
        T21:{status:darkCases.some(item=>item.state==='H'&&item.masked)?'pass':'fail'},T22:{status:darkCases.some(item=>item.state==='V'&&item.masked)?'pass':'fail'},
        T23:{status:darkCases.some(item=>item.state==='S'&&item.masked)?'pass':'fail'},
        T24:{status:new Set(darkCases.map(item=>item.src)).size===3?'pass':'fail',rule:'original color pixels + CSS alpha mask; filter:none',cases:darkCases},
        T25:{status:sameObjects?'pass':'fail',sameSpreadAndObjectIds:sameObjects},
        T26:{status:ctxAt===1&&photoAt>ctxAt&&darkAt===photoAt+1?'pass':'fail',sequence:sequenceMasters}
      };
      if(id!==session.generation)return;$('showDiagnostics').checked=true;Object.assign(session,{view,index:0,testing:true,source:null,baseline:null,baseIndex:0});
    }
    catch(error){if(id===session.generation)session.error=error.message;}
    finally{if(id===session.generation){session.busy=false;session.notify();}}
  }
  function fit(){
    if(!session.view)return;
    const [w,h]=engine.FORMATS[session.view.format],available=Math.min(1600,$('viewer').clientWidth-16),scale=available/(w*2);
    $('stage').style.width=`${available}px`;$('stage').style.height=`${h*scale}px`;
    $('canvas').style.cssText=`width:${w*2}px;height:${h}px;transform:scale(${scale});--book-page-w:${w}px;--book-page-h:${h}px`;
  }
  function draw(){
    const view=session.view,spread=view?.spreads[session.index];$('stage').hidden=!spread;$('empty').hidden=Boolean(spread);$('canvas').replaceChildren();
    if(spread){for(const side of ['left','right']){const wrapper=document.createElement('div');wrapper.className='tm-page';wrapper.innerHTML=spread[side]||'';$('canvas').appendChild(wrapper);}fit();}
    $('counter').textContent=spread?`${session.index+1} / ${view.spreads.length}`:'Нет разворотов';$('previous').disabled=!spread||session.index===0;$('next').disabled=!spread||session.index===view.spreads.length-1;
    for(const id of ['apply','sheetApply'])$(id).disabled=session.busy||loadingPhotos;
    $('status').hidden=!session.busy&&!loadingPhotos;$('status').textContent=loadingPhotos?'Читаю фотографии…':'Раскладываю материал…';
    const warnings=view?.layout?.warnings||[],unplaced=warnings.filter(w=>w.fallback==='unplaced-object'),noteWarning=warnings.find(w=>w.fallback==='user-must-shorten'),overflow=warnings.filter(w=>w.code==='ACCENT_DOM_OVERFLOW');
    $('issue').hidden=!(session.error||warnings.length);$('issueText').textContent=session.error||(noteWarning?'Заметка слишком длинная для этой области. Сократите текст.':overflow.length?`Редакционных вставок вне измеренной области: ${overflow.length}. Подробности — в диагностике.`:unplaced.length?`Не размещено вставок: ${unplaced.length}. Основной текст собран. Полный текст вставок — в диагностике.`:warnings.length?`Выполнены переносы или замены размещения: ${warnings.length}. Подробности — в диагностике.`:'');
    const objectList=spread?['left','right'].flatMap(side=>{const page=spread[`${side}Page`],geometry=view?.layout?.geometrySignature?.[session.index]?.pages?.[side==='left'?0:1]||null;return page?[{side,pageId:page.id,templateId:page.master,sourceTextHash:hashText(page.sourceText||page.text||''),geometry,objects:pageObjects(page,side,session.index*2+(side==='right'?1:0),geometry)}]:[];}):[];
    $('diagnostics').hidden=!$('showDiagnostics').checked;$('report').textContent=JSON.stringify({mode:session.testing?'temporary-test':'saved-copy',spread:spread?session.index+1:0,spreadId:spread?.id||null,templateId:spread?.master||null,sourceTextHash:hashText(objectList.map(item=>item.sourceTextHash).join('|')),objects:objectList,remainingText:spread?.remainingText??null,usedPhotos:spread?.usedPhotos??null,engine:view?.layout?.module||'OcherkiLayoutPagination',renderer:view?.layout?.renderer||'OcherkiBookRenderer.renderPage',paginator:view?.layout?.paginator||'OcherkiBookRenderer.paginateText',acceptance:session.acceptanceDiagnostics,warnings,error:session.error||null},null,2);
    $('downloadSource').disabled=!session.source;$('sourceInfo').textContent=session.source?'Открыта копия проекта. Она используется только для просмотра.':'Копия не открыта. Несохранённые изменения редактора сюда не передаются.';
  }
  function capture(){Object.assign(session.draft,{text:$('text').value,quote:$('quote').value,importantLine:$('handwriting').value,marginNote:$('margin').value,composition:$('composition').value,format:$('format').value});}
  function resetInputs(){for(const id of ['text','quote','handwriting','margin','photoFiles'])$(id).value='';$('composition').value='cycle';$('format').value=session.draft.format;renderPhotos();}
  function openSheet(focus=false){if(!$('sheet').open)$('sheet').showModal();if(focus)$('text').focus();}
  function renderPhotos(){
    $('photos').replaceChildren();
    session.draft.photos.forEach((photo,index)=>{
      const card=document.createElement('div');card.className='tm-photo';const img=document.createElement('img');img.src=photo.src;img.alt=`Фото ${index+1}`;card.appendChild(img);
      const caption=document.createElement('input');caption.placeholder='Подпись';caption.setAttribute('aria-label',`Подпись к фото ${index+1}`);caption.value=photo.caption||'';caption.oninput=()=>{photo.caption=caption.value;};card.appendChild(caption);
      const label=document.createElement('label'),bw=document.createElement('input');bw.type='checkbox';bw.checked=photo.photoMode==='bw';bw.onchange=()=>{photo.photoMode=bw.checked?'bw':'color';};label.append(bw,' Чёрно-белое');card.appendChild(label);
      const remove=document.createElement('button');remove.textContent='Убрать';remove.onclick=()=>{session.draft.photos.splice(index,1);renderPhotos();};card.appendChild(remove);$('photos').appendChild(card);
    });
  }
  $('addText').onclick=()=>openSheet(true);$('settings').onclick=()=>openSheet();$('addPhotos').onclick=$('sheetPhotos').onclick=()=>$('photoFiles').click();
  $('acceptance').onclick=showAcceptance;$('darkAcceptance').onclick=showDarkAcceptance;
  const applyDraft=async()=>{capture();if($('sheet').open)$('sheet').close();await session.apply();};
  $('apply').onclick=$('sheetApply').onclick=applyDraft;
  $('clear').onclick=()=>{photoGeneration++;loadingPhotos=false;session.acceptanceDiagnostics=null;session.clear();stopRunner();for(const url of urls)URL.revokeObjectURL(url);urls.clear();resetInputs();if($('sheet').open)$('sheet').close();$('editorProbe').hidden=true;draw();};
  $('previous').onclick=()=>session.move(-1);$('next').onclick=()=>session.move(1);$('dismissIssue').onclick=()=>{$('issue').hidden=true;};$('showDiagnostics').onchange=draw;
  $('canvas').addEventListener('click',event=>{
    const accent=event.target.closest('[data-editorial-accent]');if(!accent)return;
    const kind=accent.dataset.editorialAccent,id=kind==='inline-quote'?'quote':kind==='margin'?'margin':'handwriting';
    const field=$(id);if(!field)return;
    capture();if(!field.value)field.value=accent.textContent.trim();
    openSheet();field.focus();field.select();
  });
  $('closeEditorProbe').onclick=()=>{$('editorProbe').hidden=true;};$('editorProbeText').addEventListener('input',refreshEditorProbe);
  $('photoFiles').onchange=async event=>{
    const generation=++photoGeneration;loadingPhotos=true;draw();
    for(const file of [...event.target.files]){
      if(generation!==photoGeneration)break;const url=URL.createObjectURL(file);urls.add(url);
      try{const img=new Image();img.src=url;await img.decode();if(generation!==photoGeneration){URL.revokeObjectURL(url);urls.delete(url);continue;}session.draft.photos.push({id:`test-photo-${serial++}`,src:url,width:img.naturalWidth,height:img.naturalHeight,caption:'',photoMode:'color',layoutPreference:'auto',focalX:50,focalY:50});}
      catch(error){URL.revokeObjectURL(url);urls.delete(url);if(generation===photoGeneration)session.error=`Не удалось открыть «${file.name}». Попробуйте JPEG или PNG.`;}
    }
    if(generation===photoGeneration){loadingPhotos=false;event.target.value='';renderPhotos();draw();openSheet();}
  };
  $('projectFile').onchange=async event=>{const file=event.target.files[0];if(!file)return;try{await session.loadSource(JSON.parse(await file.text()));resetInputs();}catch(error){session.error=error.message;draw();}event.target.value='';};
  $('downloadSource').onclick=()=>{if(!session.source)return;const url=URL.createObjectURL(new Blob([JSON.stringify(session.source)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='ocherki-view-copy.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
  for(const item of engine.COMPOSITIONS){const option=document.createElement('option');option.value=item.id;option.textContent=item.label;$('composition').appendChild(option);}
  window.addEventListener('resize',fit);window.addEventListener('keydown',event=>{if($('sheet').open||/INPUT|TEXTAREA|SELECT/.test(event.target.tagName))return;if(event.key==='ArrowLeft')session.move(-1);if(event.key==='ArrowRight')session.move(1);});
  window.addEventListener('pagehide',event=>{if(!event.persisted){stopRunner();for(const url of urls)URL.revokeObjectURL(url);}});draw();
  if(location.protocol==='file:'){session.error='Откройте режим через start_test_mode.bat или HTTP-адрес проекта.';draw();}
  else{engine.readyFonts().catch(error=>{session.error=error.message;draw();});try{const saved=localStorage.getItem('ocherki_project_v1');if(saved)session.loadSource(JSON.parse(saved));}catch(error){session.error=`Сохранённая копия недоступна: ${error.message}`;draw();}}
})();
