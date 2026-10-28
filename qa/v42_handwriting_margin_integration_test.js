const fs=require('fs'),path=require('path'),vm=require('vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const rendererSource=read('book-renderer/design-pack-01.js');
const css=read('book-renderer/design-pack-01.css');
const layout=read('book-renderer/layout-pagination-engine.js');
const ctx={window:{},console,Intl};vm.createContext(ctx);vm.runInContext(rendererSource,ctx);
const renderer=ctx.window.OcherkiBookRenderer;

assert.equal(renderer.pack.version,'1.16.0-stable-important-reflow');
assert(/font:400 17px\/1\.08 'SignThatS'/.test(css),'inline handwriting is not the approved compact size');
assert(/font:400 36px\/40px 'SignThatS'/.test(css),'margin handwriting does not use the approved size');
assert(/height:var\(--dpk-flow-note-length,var\(--dpk-flow-height\)\)/.test(css),'note is not bounded by measured column height');
assert(/max-height:var\(--dpk-flow-note-depth,80px\)/.test(css)&&/overflow:hidden!important/.test(css),'two-line note depth is not bounded');
assert(/\.left \.dpk-margin-note span\{[^}]*rotate\(-90deg\)/.test(css),'left note orientation changed');
assert(/\.right \.dpk-margin-note span\{[^}]*rotate\(90deg\)/.test(css),'right note orientation changed');
assert(rendererSource.includes("noteFooterGap=30")&&rendererSource.includes("noteMaxLines=2")&&rendererSource.includes("geometry['note-length']"),'measured two-line note geometry is missing');
assert(rendererSource.includes("['top','middle','bottom']")&&rendererSource.includes('return selected.sort'),'distributed inline handwriting selection is missing');
assert(rendererSource.includes("note-footer-clearance")&&rendererSource.includes("note-more-than-two-lines"),'final note DOM audit is incomplete');
assert(layout.includes('Заметка на поле не помещается в две строки. Сократите её и пересоберите книгу.'),'manual note overflow is not reported');

const left='Дом у воды оставался главным воспоминанием. Прошлое становилось близким. Самое важное сохранялось в паузах.';
const right='Голос звучал рядом. Всё начиналось с дороги. Мы это помним и сегодня.';
const ranges=(text,phrases)=>phrases.map((phrase,index)=>{const start=text.indexOf(phrase);return{start,end:start+phrase.length,editable:true,zone:['top','middle','bottom'][index]};});
const page={kind:'text',layout:'prose-dense',master:'D01-TEXT-IMPORTANT-MARGIN',rhythm:'important-margin',pageNo:23,marginNote:'важно уточнить год переезда и имя на фотографии; спросить у Варвары, кто стоял у дома у самой воды',editorialAccentEditable:true,editorialOverrideKey:'important-margin:0',measuredFlow:{mode:'important-margin',cells:[left,right],cellBreaks:[[],[]],inlineRanges:[ranges(left,['Дом у воды','Прошлое становилось близким','Самое важное сохранялось в паузах']),ranges(right,['Голос звучал рядом','Всё начиналось с дороги','Мы это помним'])],accentOverflow:{important:false,margin:false},geometry:{origin:86,height:810,leading:21.6,'note-length':754,'note-depth':68,'note-footer-gap':30,'note-inset':28},maximal:[true,true],sequence:[]}};
for(const side of ['left','right']){
  const html=renderer.renderPage(page,side,{});
  assert.equal((html.match(/class="dpk-inline-handwritten/g)||[]).length,6,`${side}: inline accents missing`);
  assert.equal((html.match(/class="dpk-margin-note/g)||[]).length,1,`${side}: margin note missing`);
  assert(html.includes('--dpk-flow-note-length:754px')&&html.includes('--dpk-flow-note-depth:68px')&&html.includes('--dpk-flow-note-footer-gap:30px'),`${side}: measured note geometry missing`);
  assert(html.includes('data-editorial-accent="important"')&&html.includes('data-editorial-accent="margin"'),`${side}: edit hooks missing`);
  assert.equal((html.match(/data-source-stream/g)||[]).length,2,`${side}: source stream changed`);
}

console.log(JSON.stringify({status:'pass',singleEngine:true,inlineHandwriting:6,noteLines:2,noteFooterGap:30,sides:['left','right'],editable:true}));
