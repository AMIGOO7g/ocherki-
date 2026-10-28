(function(global){
  'use strict';
  const clone=value=>JSON.parse(JSON.stringify(value));
  function snapshot(value){
    const structure=value?.structure||value;
    if(!structure||!Array.isArray(structure.sections))throw Error('В файле нет структуры книги.');
    for(const section of structure.sections){
      if(!section||!Array.isArray(section.pages))throw Error('Некорректный раздел проекта.');
      for(const page of section.pages)if(!page||typeof page.text!=='string'&&page.text!=null||page.photos!=null&&!Array.isArray(page.photos))throw Error('Некорректная карточка проекта.');
    }
    return clone({structure,meta:value.meta||{},format:value.format||'square'});
  }
  class TestSession{
    constructor(build,notify=()=>{}){Object.assign(this,{build,notify,source:null,baseline:null,view:null,index:0,baseIndex:0,generation:0,busy:false,error:'',testing:false});this.resetDraft();}
    resetDraft(){this.draft={text:'',photos:[],quote:'',importantLine:'',marginNote:'',composition:'cycle',format:this.source?.format||'square'};}
    async loadSource(value){
      const source=snapshot(value),id=++this.generation;this.busy=true;this.error='';this.notify();
      try{const view=await this.build(source.structure,{...source.meta,format:source.format});if(id!==this.generation)return;Object.assign(this,{source,baseline:view,view,index:0,baseIndex:0,testing:false});this.resetDraft();}
      catch(error){if(id===this.generation)this.error=error.message;}
      finally{if(id===this.generation){this.busy=false;this.notify();}}
    }
    async apply(){
      const draft=clone(this.draft);
      if(!draft.text&&!draft.photos.length){this.error='Добавьте текст или фотографии.';this.notify();return;}
      const id=++this.generation;this.busy=true;this.error='';this.notify();
      const structure={sections:[{id:'test-material',title:'Тестовый текст',type:'chapter',included:true,pages:[{uid:'test-material',type:'chapter',title:'Тестовый текст',text:draft.text,photos:draft.photos,inlineQuote:draft.quote,importantLine:draft.importantLine,marginNote:draft.marginNote,included:true,userEdited:true}]}]};
      const buildMeta={format:draft.format,title:'Тестовый текст'};
      // The default Test Text path is the real book path. Explicitly selected
      // composition proofs still use the same engine/renderer, but the normal
      // chapter rhythm is no longer bypassed merely because a photo exists.
      if(draft.composition&&draft.composition!=='cycle')buildMeta.composition=draft.composition;
      try{const view=await this.build(structure,buildMeta);if(id!==this.generation)return;if(!this.testing)this.baseIndex=this.index;Object.assign(this,{view,index:0,testing:true});}
      catch(error){if(id===this.generation)this.error=error.message;}
      finally{if(id===this.generation){this.busy=false;this.notify();}}
    }
    clear(){this.generation++;this.busy=false;this.testing=false;this.error='';this.resetDraft();this.view=this.baseline;this.index=this.baseIndex;this.notify();}
    move(delta){this.index=Math.max(0,Math.min((this.view?.spreads.length||1)-1,this.index+delta));if(!this.testing)this.baseIndex=this.index;this.notify();}
  }
  global.OcherkiTestMode=Object.freeze({TestSession,snapshot});
})(typeof window==='undefined'?globalThis:window);
