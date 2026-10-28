const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.resolve(__dirname,'..');
const context={window:{}};vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'book-renderer','book-engine.js'),'utf8'),context);
const engine=context.window.OcherkiBookEngine;
const fail=message=>{throw new Error(message)};
const prose=Array.from({length:90},(_,i)=>`Это ${i+1}-е спокойное предложение семейной истории, которое необходимо сохранить для следующих поколений.`).join(' ');
const photo=(id,layout='auto')=>({id,src:`data:image/jpeg;base64,${id}`,width:900,height:1200,orientation:'portrait',layoutPreference:layout,caption:id});

const empty=engine.assemble({sections:[{id:'chapter-1',type:'chapter',title:'Глава 1. Черновик',included:true,pages:[{uid:'draft',type:'chapter',included:true,isEpisodeStart:true,userEdited:false,text:prose,photos:[]}]}]},{title:'Проверка'});
if(empty.ready)fail('Sample chapter was accepted as a real chapter');

const structure={sections:[
  {id:'cover',type:'cover',included:true,pages:[{uid:'cover',type:'cover',included:true,text:'Книга',photos:[]}]},
  {id:'intro',type:'intro',included:false,pages:[{uid:'intro',type:'intro',included:false,text:'Скрытое вступление',photos:[]}]},
  {id:'chapter-1',type:'chapter',title:'Глава 1. Начало',included:true,pages:[
    {uid:'episode-1',type:'chapter',title:'Глава 1. Начало',episode:'Эпизод 1. Дом',included:true,isEpisodeStart:true,userEdited:true,text:prose,photos:[photo('p1','triptych'),photo('p2'),photo('p3')]},
    {uid:'continuation',type:'text',title:'Глава 1. Начало',episode:'Эпизод 1. Дом',included:true,isEpisodeStart:false,userEdited:true,text:prose,photos:[photo('p4')]}
  ]}
]};
const result=engine.assemble(structure,{title:'Проверка'});
if(!result.ready)fail(result.message||'Book was not assembled');
const triptych=result.pages.find(page=>page.master==='D01-THREE-PHOTO');
if(!triptych||triptych.photoIndices.length!==3)fail('Explicit same-sheet triptych was not created');
const used=new Set();
result.pages.forEach(page=>{
  const indexes=Array.isArray(page.photoIndices)?page.photoIndices:Number.isInteger(page.photoIndex)?[page.photoIndex]:[];
  indexes.forEach(index=>{const src=page.source?.photos?.[index]?.src;if(src)used.add(src)});
});
if(![1,2,3,4].every(n=>used.has(`data:image/jpeg;base64,p${n}`)))fail('The fourth photograph from the second sheet was lost');
if(result.pages.some(page=>page.kind==='intro'||String(page.text||'').includes('Скрытое вступление')))fail('Disabled page returned after rebuild');
if(result.pages.some(page=>!page.sectionTitle&&page.showHeading===true))fail('Continuation received an episode heading');

const shell=fs.readFileSync(path.join(root,'shell.html'),'utf8');
const sheet=fs.readFileSync(path.join(root,'sheet_v35.html'),'utf8');
if(!/pendingPhotoReplaceTarget/.test(sheet)||!/block\.src=rec\.src/.test(sheet))fail('Photo replacement is not bound to the original photo object');
if(!/removeEmptyUserSheet/.test(sheet)||!/900\)/.test(sheet))fail('Empty user sheets are not removed after edit settles');
if(!/pdf-export-modal/.test(shell)||!/api\/export-pdf/.test(shell)||/window\.print\(\)/.test(shell))fail('Direct PDF modal/export is not active');
if(!/book-preview-modal\.open \.book-preview-stage\{transform:none!important/.test(shell))fail('Preview still moves while opening');
console.log(JSON.stringify({status:'pass',triptych:3,fourthPhoto:true,disabledPagesStayDisabled:true,emptyDraftRejected:true,directPdf:true,stablePreview:true},null,2));
