/* Separate document, shared engine; no editor state or persistence APIs. */
(()=>{
  'use strict';
  const pageSnapshot=page=>{
    if(!page)return null;
    const photos=(page.source?.photos||[]).map(photo=>({id:photo?.id||'',src:photo?.src||photo?.dataUrl||photo?.url||''}));
    return {
      id:page.id||'',pageNo:page.pageNo||null,master:page.master||'',layout:page.layout||'',kind:page.kind||'',sectionId:page.sectionId||'',
      text:page.text||'',sourceText:page.sourceText||'',photoIndex:Number.isFinite(Number(page.photoIndex))?Number(page.photoIndex):null,
      inlineQuote:page.inlineQuote||'',importantLine:page.importantLine||'',marginNote:page.marginNote||'',accentZone:page.accentZone||null,
      ctxState:page.ctxState||null,ctxAccentType:page.ctxAccentType||null,ctxHandwrittenNote:page.ctxHandwrittenNote||'',secondaryPhotoIndex:Number.isFinite(Number(page.secondaryPhotoIndex))?Number(page.secondaryPhotoIndex):null,mainPhotoAssetId:page.mainPhotoAssetId||null,secondaryPhotoAssetId:page.secondaryPhotoAssetId||null,
      darkFadeState:page.darkFadeState||null,darkFadeSide:page.darkFadeSide||null,sourceRange:page.sourceRange||null,measuredFlow:page.measuredFlow||null,
      source:{photos}
    };
  };
  window.addEventListener('message',async event=>{
    if(event.source!==parent||event.origin!==location.origin||event.data?.type!=='OCHERKI_TEST_BUILD')return;
    const {id,structure,meta}=event.data;
    try{
      await OcherkiLayoutPagination.readyFonts();
      const result=OcherkiLayoutPagination.build(structure,meta);if(!result.ready)throw Error(result.message||'Нет материала для просмотра.');
      const spreads=result.spreads.map(s=>({id:s.id||'',sectionId:s.sectionId||'',master:s.master,remainingText:s.remainingText,usedPhotos:s.usedPhotos,fixedRhythm:s.fixedRhythm===true,acceptanceOnly:s.acceptanceOnly===true,left:s.left?OcherkiLayoutPagination.renderPage(s.left,'left',meta):'',right:s.right?OcherkiLayoutPagination.renderPage(s.right,'right',meta):'',leftPage:pageSnapshot(s.left),rightPage:pageSnapshot(s.right),templates:[s.left?.master,s.right?.master].filter(Boolean)}));
      parent.postMessage({type:'OCHERKI_TEST_RESULT',id,view:{spreads,pages:spreads.flatMap(s=>[s.leftPage,s.rightPage].filter(Boolean)),format:meta.format||'square',layout:result.layout}},location.origin);
    }catch(error){parent.postMessage({type:'OCHERKI_TEST_ERROR',id,message:error.message},location.origin);}
  });
  parent.postMessage({type:'OCHERKI_TEST_READY'},location.origin);
})();
