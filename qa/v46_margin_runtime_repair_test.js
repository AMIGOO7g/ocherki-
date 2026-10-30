const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const document={body:{appendChild(){}},createElement(){return {style:{cssText:''},remove(){}};}};
const ctx={window:{},document,console};vm.createContext(ctx);
for(const file of ['book-renderer/design-pack-01.layout.js','book-renderer/book-engine.js','book-renderer/design-pack-01.js'])vm.runInContext(read(file),ctx);
const renderer=ctx.window.OcherkiBookRenderer;
ctx.window.OcherkiBookRenderer={...renderer,paginateText(page,source){
  if(['margin','important-margin'].includes(page.rhythm)&&!page.allowSafeMarginAudit)throw Object.assign(new Error('note geometry'),{code:'ACCENT_UNFIT',kind:'margin',text:page.marginNote||'Память семьи',automatic:Boolean(page.autoMarginNote)});
  const head=source,flow={mode:page.rhythm,cells:[head,''],cellBreaks:[[],[]],inlineRanges:[[],[]],accentOverflow:{},geometry:{origin:86,height:810,leading:27},sequence:[{kind:'cell',cell:0,text:head}],maximal:[true,true],sourceText:head};
  page.measuredFlow=flow;return {head,tail:'',measuredFlow:flow};
}};
vm.runInContext(read('book-renderer/layout-pagination-engine.js'),ctx);
const session=ctx.window.OcherkiLayoutPagination.createSession({format:'square'});
const automatic={master:'D01-TEXT-MARGIN',rhythm:'margin',autoMarginNote:true,marginNote:''};
assert.equal(session.textPage(automatic,'Текст страницы','left').tail,'');
assert.equal(automatic.rhythm,'margin');
assert(automatic.marginNote);
assert.equal(automatic.allowSafeMarginAudit,true);
assert(session.warnings.some(item=>item.code==='ACCENT_AUTO_MARGIN_FORCED'));
const manual={master:'D01-TEXT-MARGIN',rhythm:'margin',autoMarginNote:false,marginNote:'Ручная заметка'};
session.textPage(manual,'Текст страницы','left');
// The author's note is kept on the page (placed the safe way), never dropped.
assert(session.warnings.some(item=>/ACCENT_MANUAL_MARGIN/.test(item.code)));
assert.equal(manual.marginNote,'Ручная заметка');
session.dispose();
const source=read('book-renderer/design-pack-01.js'),css=read('book-renderer/design-pack-01.css');
assert(source.includes("noteInset=side==='left'")&&source.includes("geometry['note-inset']=noteInset"));
assert(css.includes('calc(var(--dpk-flow-origin) + var(--dpk-flow-note-inset,0px))'));
console.log(JSON.stringify({status:'pass',automaticMargin:'visible-last-resort',manualMargin:'still-validated',safeInset:28}));
