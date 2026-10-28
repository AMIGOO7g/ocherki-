// Source/dispatch/serialization tests; no synthetic layout is represented as browser geometry.
const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('assert');
const root=path.resolve(__dirname,'..'),ctx={window:{},console};vm.createContext(ctx);
for(const file of ['book-engine.js','design-pack-01.js'])vm.runInContext(fs.readFileSync(path.join(root,'book-renderer',file),'utf8'),ctx);
const engine=ctx.window.OcherkiBookEngine,renderer=ctx.window.OcherkiBookRenderer;
let checks=0,calls=[];
const sentence=i=>`Запись ${i}:  Семейная память\tсохраняет Ёлку, e\u0301 и 🏒.\r\n`;
const raw=Array.from({length:210},(_,i)=>sentence(i)).join('');
const source={sections:[{id:'one',type:'chapter',title:'Начало',included:true,pages:[
 {uid:'a',type:'chapter',text:raw,userEdited:true,quote:'Цитата не должна удаляться из текста.',photos:[{src:'picture.jpg',width:900,height:1200}],editorialOverrides:{'important-margin:0':'Исправленная  строка.','important-margin:0:margin':'Исправленная\tзаметка.'}},
 {uid:'b',type:'chapter',text:'  Вторая\n\nчасть\u00a0текста.  ',userEdited:true}
]}]};
// Controlled source boundary tests the engine's consumption; only the real browser
// can supply production boundaries. The constructor never imports this adapter.
const adapter=(page,text,side)=>{
 calls.push({kind:page.kind,master:page.master,side});
 const head=text.match(/^[\s\S]*?[.!?](?:\s*|$)/u)?.[0]||text;
 if(['important','important-margin'].includes(page.rhythm)&&!page.importantLine)page.importantLine='Рукописный акцент.';
 const mode=page.layout==='chapter-intro'?'chapter':page.rhythm;
 const inlineRanges=['important','important-margin'].includes(page.rhythm)?[[{start:0,end:Math.min(head.length,12),editable:true}],[]]:[[],[]];
 return {head,tail:text.replace(head,''),measuredFlow:{mode,cells:[head,''],cellBreaks:[],inlineRanges,accentBreaks:{},promoted:{},sequence:[{kind:'cell',cell:0,text:head}],geometry:{origin:86,height:810},maximal:[true,true],sourceText:head}};
};
assert.throws(()=>engine.assemble(source,{textRhythmOnly:true}),/DOM/);checks++;
const before=JSON.stringify(source);
const result=engine.assemble(source,{textRhythmOnly:true,paginateText:adapter});
assert.equal(result.pagination,'dom-exact-v2');assert.equal(calls[0].master,'D01-CHAPTER-TEXT');checks++;
assert(result.pages.filter(p=>p.measuredFlow).length>160);checks++;
assert.equal(result.expectedManuscripts[0].text,raw+source.sections[0].pages[1].text);checks++;
assert.equal(result.pages.filter(p=>p.measuredFlow).map(p=>p.text).join(''),raw+source.sections[0].pages[1].text);checks++;
assert.equal(engine.audit(result).status,'pass');checks++;
const body=result.pages.filter(p=>p.rhythm),cycle=['inline-quote','important','margin','important-margin'];
body.forEach((p,i)=>assert.equal(p.rhythm,cycle[i%4]));checks++;
const combined=body.find(p=>p.rhythm==='important-margin');assert.equal(combined.importantLine,'Исправленная  строка.');assert.equal(combined.marginNote,'Исправленная\tзаметка.');checks++;
const markup=renderer.renderPage(combined,'right',{});
assert(markup.includes('data-editorial-key="important-margin:0"'));assert(markup.includes('data-editorial-key="important-margin:0:margin"'));checks++;
assert(markup.includes('dpk-inline-handwritten')&&!markup.includes('dpk-inset-column')&&!markup.includes('dpk-flow-zone')&&markup.includes('dpk-margin-note'));checks++;
assert(markup.includes('  ')&&markup.includes('&#13;')&&markup.includes('🏒'));checks++;
assert.equal(JSON.stringify(source),before);checks++;
for(const bad of [' ', '\n', '\t', 'X']){
 const changed=engine.assemble(source,{textRhythmOnly:true,paginateText:adapter});
 changed.pages.find(p=>p.measuredFlow).text+=bad;
 assert.equal(engine.audit(changed).status,'fail');checks++;
}
assert.throws(()=>engine.assemble(source,{textRhythmOnly:true,paginateText:()=>{throw Error('measurement failed');}}),/measurement failed/);checks++;
assert.throws(()=>engine.assemble(source,{textRhythmOnly:true,paginateText:()=>({head:'',tail:raw,measuredFlow:{sequence:[]}})}),/сохранность/);checks++;
const one={sections:[{id:'one',type:'chapter',title:'Глава',pages:[{uid:'short',text:' Я. ',userEdited:true}]}]};
assert(engine.assemble(one,{textRhythmOnly:true,paginateText:adapter}).ready);checks++;
const script=fs.readFileSync(path.join(root,'book-renderer/book-engine.js'),'utf8');
const active=script.split('function assembleExactText')[1].split('function auditExactText')[0];
assert(!/wordCount|wordList|pageWords|takeWords|normalizeProse|stripQuote|substring|consumeMeasuredFlow/.test(active));checks++;
const shell=fs.readFileSync(path.join(root,'shell.html'),'utf8');assert(!/createEditorialTextFit|measureEditorialPageWords|textFitProbe/.test(shell));checks++;
const css=fs.readFileSync(path.join(root,'book-renderer/design-pack-01.css'),'utf8');
assert(/\.left \.dpk-margin-note span\{[^}]*rotate\(-90deg\)/.test(css));assert(/\.right \.dpk-margin-note span\{[^}]*rotate\(90deg\)/.test(css));checks++;
console.log(JSON.stringify({status:'pass',checks,pages:body.length,exactUnicodeAndWhitespace:true,chapterUsesDOM:true,browserGeometry:'not executed'},null,2));
