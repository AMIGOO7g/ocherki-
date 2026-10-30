const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const ctx={window:{},console,Intl};vm.createContext(ctx);
for(const file of ['book-engine.js','design-pack-01.js'])vm.runInContext(read(`book-renderer/${file}`),ctx);

const bridge=read('book-renderer/editor-source-bridge.js'),sheet=read('sheet_v35.html'),layout=read('book-renderer/layout-pagination-engine.js');
const renderer=read('book-renderer/design-pack-01.js'),css=read('book-renderer/design-pack-01.css'),shell=read('shell.html');
const testMode=read('test-mode.js'),runner=read('test-mode-runner.js');
assert(bridge.includes("node.tagName === 'BR'")&&bridge.includes("join('\\n\\n')"),'semantic Enter bridge missing');
assert(sheet.includes('return window.OcherkiEditorSourceBridge.semanticText(editor)')&&!sheet.includes("return (editor.innerText||'')"),'editor source still serializes rendered wraps');
assert(sheet.includes('syncMeasureBox(editor,measureBox)')&&sheet.includes('new ResizeObserver(syncEmbeddedSize)'),'live editor width is not synchronized');
assert(!/maxFit\(tokens\)/.test(sheet.match(/function flowCurrentPageOverflow[\s\S]*?\n\}/)?.[0]||''),'active editor split still uses stale measure-box fit');

const photo=(id,src,width,height,extra={})=>({id,src,width,height,...extra});
const pages=[
  {uid:'a',text:'Первая запись завершается полной фразой.',photos:[photo('open','open.jpg',900,1200),photo('portrait','portrait.jpg',800,1200,{caption:'Личный архив'})],userEdited:true},
  {uid:'b',text:'Вторая запись начинается новым смысловым абзацем и продолжается без потери символов.',photos:[photo('city','city.jpg',1600,900,{regions:[{type:'door',x:72,y:44,width:18,height:24,confidence:.94}]})],userEdited:true}
];
const source={sections:[{id:'chapter',type:'chapter',title:'Дом',pages}]};
const paginate=(page,text)=>{
  const limit=Math.min(text.length,180),cut=limit<text.length?Math.max(1,text.lastIndexOf(' ',limit)):limit,head=text.slice(0,cut),tail=text.slice(cut);
  page.measuredFlow={mode:page.rhythm||'plain',quoteColumn:page.quoteColumn||'left',cells:[head,''],cellBreaks:[[],[]],inlineRanges:[[],[]],accentBreaks:{},promoted:{},accentOverflow:{},sequence:[{kind:'cell',cell:0,text:head}],geometry:{origin:86,height:810,leading:27},maximal:[true,true],sourceText:head};
  return {head,tail,measuredFlow:page.measuredFlow};
};
const book=ctx.window.OcherkiBookEngine.assemble(source,{textRhythmOnly:true,paginateText:paginate,layoutDefinition:{rhythm:['inline-quote','margin','important','important-margin'],textMasters:{'inline-quote':'D01-TEXT-INLINE-QUOTE',margin:'D01-TEXT-MARGIN',important:'D01-TEXT-IMPORTANT','important-margin':'D01-TEXT-IMPORTANT-MARGIN',plain:'D01-TEXT'}}});
const fixed=book.spreads.find(spread=>spread.master==='D01-SPREAD-POST-OPENING-CTX');
assert(fixed?.left?.measuredFlow&&fixed?.right?.master==='D01-CTX-DETAIL-SQ','fixed post-opening rhythm changed');
assert.notEqual(fixed.right.source.photos[fixed.right.photoIndex].src,'open.jpg','opening photo repeated immediately');
assert.equal(fixed.right.ctxAccentType,'secondary-photo','different secondary photo was not used');
assert.notEqual(fixed.right.mainPhotoAssetId,fixed.right.secondaryPhotoAssetId,'CTX reused its main photo as the secondary card');
assert(book.expectedManuscripts[0].text.includes('\n\n'),'separate source pages lost semantic paragraph boundary');
assert.equal(book.pages.filter(page=>page.sectionId==='chapter'&&page.measuredFlow).map(page=>page.text).join(''),book.expectedManuscripts[0].text,'source text changed during pagination');

const R=ctx.window.OcherkiBookRenderer;
assert.equal(R.resolveDetailROI,undefined,'obsolete same-photo ROI API is still exposed');
const fallbackPage={kind:'ctx-detail-sq',layout:'ctx-detail-sq',master:'D01-CTX-DETAIL-SQ',ctxState:'V',ctxHandwrittenNote:'Личный архив',photoIndex:0,source:{photos:[photo('p','portrait.jpg',800,1200)]}};
const fallbackHtml=R.renderPage(fallbackPage,'right',{esc:String,image:()=> 'portrait.jpg',caption:()=>'',meta:{}});
assert.equal((fallbackHtml.match(/<img /g)||[]).length,1,'handwritten fallback created a fake detail image');
assert(fallbackHtml.includes('dpk-ctx-handwritten-card')&&fallbackHtml.includes('data-editorial-accent="ctx-handwritten"'),'CTX handwriting is not editable');

for(const contract of [
  /\[data-ctx-state="H"\] :is\([^}]+left:318px!important;top:622px!important;width:532px!important;height:306px!important;transform:rotate\(-3deg\)/s,
  /\[data-ctx-state="S"\] :is\([^}]+left:44px!important;top:365px!important;width:350px!important;height:350px!important;transform:rotate\(-5deg\)/s,
  /\[data-ctx-state="V"\] :is\([^}]+left:51px!important;top:129px!important;width:370px!important;height:704px!important;transform:rotate\(-6deg\)/s
])assert(contract.test(css),'approved CTX v1.7 geometry changed');
// The fade is a print-safe veil; its stops are the approved mask stops.
assert(/\[data-dark-fade-state="H"\] \.dpk-dark-fade-veil\{[^}]*rgba\(16,16,15,0\) 55%[^}]*rgba\(16,16,15,1\) 82%/.test(css),'DARK FADE H changed');
assert(/\[data-dark-fade-state="V"\] \.dpk-dark-fade-veil\{[^}]*rgba\(16,16,15,0\) 38%[^}]*rgba\(16,16,15,1\) 67%/.test(css),'DARK FADE V changed');
assert(/\[data-dark-fade-state="S"\] \.dpk-dark-fade-veil\{[^}]*rgba\(16,16,15,0\) 44%[^}]*rgba\(16,16,15,1\) 62%/.test(css),'DARK FADE S compact fade missing');
assert(/dpk-dark-fade-image\{[\s\S]*?filter:none!important/.test(css)&&!(/brightness\(/.test(css.split('DARK FADE 2.2')[1]||'')),'DARK FADE alters image colour');

assert(renderer.includes("geometry['quote-text-height']")&&renderer.includes("consumeCell(0);consumeCell(1);consumeCell(2)"),'dynamic in-column quote reflow missing');
assert(renderer.includes('Заметка слишком длинная для этой области. Сократите текст.'),'note overflow warning missing');
assert(/white-space:normal!important;word-break:normal!important;overflow-wrap:normal!important/.test(css),'multiline note wrap missing');
assert(shell.includes('assemble();')&&shell.includes("kind==='ctx-handwritten'")&&shell.includes("['important','margin','inline-quote','ctx-handwritten']"),'shared relayout/edit bridge missing');
assert(layout.includes('Заметка на поле не помещается в две строки'),'manual note overflow is not surfaced');
assert(runner.includes('leftPage:pageSnapshot(s.left)')&&runner.includes('OcherkiLayoutPagination.build'),'Test Mode lost shared page models');
for(let i=1;i<=26;i++)assert(new RegExp(`T${i}(?=[:,'\"]|\\b)`).test(testMode),`Test Mode scenario T${i} missing`);
assert(!/Math\.random\(/.test(renderer+layout+testMode),'random editorial selection reintroduced');

console.log(JSON.stringify({status:'pass',oneEngine:true,semanticEditorSource:true,dynamicQuote:true,multilineNotes:true,ctxDifferentSecondary:true,ctxFallback:true,darkFadeStates:['H','S','V'],testModeScenarios:26}));
