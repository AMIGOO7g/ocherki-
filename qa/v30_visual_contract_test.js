const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.resolve(__dirname,'..');
const fail=message=>{throw new Error(message)};
const source=fs.readFileSync(path.join(root,'book-renderer','book-engine.js'),'utf8');
const rendererSource=fs.readFileSync(path.join(root,'book-renderer','design-pack-01.js'),'utf8');
const css=fs.readFileSync(path.join(root,'book-renderer','design-pack-01.css'),'utf8');
const proof=fs.readFileSync(path.join(root,'book-renderer','master-proof.html'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'book-renderer','design-pack-01.manifest.json'),'utf8'));

const context={window:{}};
vm.createContext(context);
vm.runInContext(source,context);
vm.runInContext(rendererSource,context);
const engine=context.window.OcherkiBookEngine;
const renderer=context.window.OcherkiBookRenderer;
const photo=(id,width,height)=>({id,src:`data:image/jpeg;base64,${id}`,width,height,layoutPreference:'auto'});
const prose=count=>Array.from({length:count},(_,index)=>`Запись ${index+1} сохраняет место, время и человеческий голос семейной истории.`).join(' ');
const page=(uid,text,photos)=>({uid,type:'chapter',title:'Дом',episode:'Первые воспоминания',included:true,userEdited:true,text,photos});
const renderContext={image:(book,index)=>book.photos?.[index]?.src||'',caption:()=>'',inferMeta:()=>({}),esc:value=>String(value)};

const dark=renderer.renderPage({kind:'dark-text',layout:'dark-text',master:'D01-DARK-TEXT',source:{},text:prose(20)},'right',renderContext);
if(!/dpk-page dpk-dark-text/.test(dark))fail('Dark companion does not render as a dark page');
if(!/D01-DARK-TEXT/.test(proof)||!/right:p\('dark-text','dark-text','D01-DARK-TEXT'/.test(proof))fail('Proof dark-gradient spread still has a white companion');
if(!/--dpk-rail-photo-width:500px/.test(css)||!/left:calc\(var\(--dpk-rail-photo-width\) \+ var\(--dpk-rail-text-gap\)\)/.test(css))fail('The final rail geometry did not increase the image continuation and narrow the text rail');
if(!/top:0!important;right:0!important;bottom:0!important;left:0!important/.test(css))fail('The dark gradient is not full-height');
if(!/#11110f 20%/.test(css))fail('The dark gradient opaque zone is not approximately 20%');
if(!/dpk-page\.dpk-mosaic \.dpk-mosaic-grid figure img/.test(css)||!/object-fit:cover!important/.test(css))fail('Mosaic cells do not have bounded image geometry');
if(!/dpk-chapter-text\.left \.dpk-chapter-rule/.test(css)||!/dpk-chapter-text\.right \.dpk-chapter-rule/.test(css))fail('Chapter rule alignment is not mirrored by page side');
if(manifest.hard_rules.dark_gradient_companion_is_dark!==true||manifest.hard_rules.dark_gradient_full_height!==true||manifest.hard_rules.rail_mirror_is_non_adjacent_in_automatic_mode!==true)fail('The visual contract is not declared in the manifest');

const result=engine.assemble({sections:[{id:'chapter',type:'chapter',title:'Дом',included:true,pages:[
  page('opener',prose(80),[photo('hero',1200,1800)]),
  page('rail',prose(600),[photo('rail',2200,1500)]),
  page('dark',prose(600),[photo('dark',2000,1500)])
]}]},{title:'Проверка'});
const darkSpread=result.spreads.find(spread=>spread.master==='D01-SPREAD-DARK-GRADIENT-PHOTO');
if(darkSpread && (darkSpread.left.kind!=='dark-text' && darkSpread.right.kind!=='dark-text'))fail('Automatic dark spread has no dark companion');

console.log(JSON.stringify({status:'pass',darkCompanion:true,fullHeightGradient:true,railContinuationPx:500,narrowTextRail:true,mosaicBounded:true,chapterAxis:true},null,2));
