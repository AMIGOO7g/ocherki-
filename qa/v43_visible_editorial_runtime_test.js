const fs=require('fs'),path=require('path'),vm=require('vm');
const assert=require('assert');
const root=path.join(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
let liveHosts=0;
const document={body:{appendChild(){liveHosts++;}},createElement(){return {style:{},firstElementChild:{},remove(){liveHosts--;}};}};
const ctx={window:{},document,console};vm.createContext(ctx);
for(const file of ['book-renderer/design-pack-01.layout.js','book-renderer/book-engine.js','book-renderer/design-pack-01.js'])vm.runInContext(read(file),ctx);
const original=ctx.window.OcherkiBookRenderer;
const attempts=new Map();
ctx.window.OcherkiBookRenderer={...original,paginateText(page,source){
  const rhythm=page.rhythm||'chapter',key=`${rhythm}:${page.editorialOverrideKey||''}`;
  attempts.set(key,(attempts.get(key)||0)+1);
  const automatic=rhythm==='inline-quote'?page.autoInlineQuote:rhythm==='margin'?page.autoMarginNote:['important','important-margin'].includes(rhythm)?page.autoImportant:false;
  if(automatic){
    const kind=rhythm==='inline-quote'?'quote':rhythm==='margin'?'margin':'important';
    throw Object.assign(new Error('probe retry'),{code:'ACCENT_UNFIT',kind,text:'Память семьи остаётся рядом',automatic:true});
  }
  if(rhythm==='important-margin'&&page.autoMarginNote){
    throw Object.assign(new Error('note retry'),{code:'ACCENT_UNFIT',kind:'margin',text:'Важно сохранить имя',automatic:true});
  }
  const length=Math.min(source.length,page.layout==='chapter-intro'?80:220),head=source.slice(0,length),tail=source.slice(length);
  const count=rhythm==='inline-quote'?3:2,cells=Array.from({length:count},(_,i)=>i===0?head:'');
  const ranges=['important','important-margin'].includes(rhythm)?[[{start:0,end:Math.min(12,head.length),editable:true,zone:'middle'}],[]]:Array.from({length:count},()=>[]);
  const flow={mode:rhythm,cells,cellBreaks:cells.map(()=>[]),inlineRanges:ranges,accentOverflow:{},geometry:{origin:86,height:810,leading:27,'note-length':786,'note-depth':60,'note-footer-gap':24},sequence:[{kind:'cell',cell:0,text:head}],maximal:cells.map(()=>true),sourceText:head};
  page.measuredFlow=flow;page.sourceText=head;
  if(['important','important-margin'].includes(rhythm)&&!page.importantLine)page.importantLine='Память семьи';
  if(['margin','important-margin'].includes(rhythm)&&!page.marginNote)page.marginNote='Важно сохранить имя';
  if(rhythm==='inline-quote'&&!page.inlineQuote)page.inlineQuote='Память семьи';
  return {head,tail,measuredFlow:flow};
},auditMeasuredPage(){return {status:'pass',violations:[]};}};
vm.runInContext(read('book-renderer/layout-pagination-engine.js'),ctx);
const text=Array.from({length:80},(_,i)=>`Запись ${i+1}. Память семьи остаётся рядом. `).join('');
const structure={sections:[{id:'c',type:'chapter',title:'Первые воспоминания',pages:[{uid:'p',text,userEdited:true,photos:[]}]}]};
const book=ctx.window.OcherkiLayoutPagination.build(structure,{format:'square'});
const body=book.pages.filter(page=>page.rhythm);
assert.equal(body[0].rhythm,'inline-quote');
assert(['important','margin','important-margin'].every(rhythm=>body.some(page=>page.rhythm===rhythm)),'handwritten accents missing from the seeded rhythm');
assert(body.every(page=>page.measuredFlow),'all rhythm pages must remain measured');
assert(body.find(page=>page.rhythm==='important').importantLine,'important accent disappeared');
assert(body.find(page=>page.rhythm==='margin').marginNote,'margin note disappeared');
assert(body.find(page=>page.rhythm==='important-margin').importantLine,'combined handwriting disappeared');
assert(body.find(page=>page.rhythm==='important-margin').marginNote,'combined margin note disappeared');
const fixed=book.spreads.find(spread=>spread.master==='D01-SPREAD-POST-OPENING-TEXT');
assert(fixed&&fixed.left&&fixed.right,'no-photo post-opening spread contains a blank page');
assert.equal(book.pages.map(page=>page.sourceText||'').join(''),text,'source text changed');
const source=read('book-renderer/layout-pagination-engine.js');
assert(!source.includes("fallback:'source-kept-in-prose'"),'automatic accent still silently downgrades to prose');
// An unplaceable automatic accent no longer stops the whole book; it is
// recorded explicitly so the author can see which page lost it.
assert(source.includes("code:'ACCENT_AUTO_UNPLACED'")&&source.includes("fallback:'plain-text-page'"),'automatic accent fallback is not recorded');
for(const file of ['index.html','shell.html','test-mode-runner.html'])assert(read(file).includes('demo-book-20261030-v55'),`${file} has a stale cache key`);
assert(read('test-mode.html').includes('demo-book-20261030-v55'),'test-mode.html has a stale cache key');
console.log(JSON.stringify({status:'pass',rhythm:body.map(page=>page.rhythm),noBlankPostOpening:true,automaticRetries:[...attempts.values()].some(value=>value>1),sourceInvariant:'exact'}));
