const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.resolve(__dirname,'..');
const context={window:{}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'book-renderer','book-engine.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'book-renderer','design-pack-01.js'),'utf8'),context);
const engine=context.window.OcherkiBookEngine;
const renderer=context.window.OcherkiBookRenderer;
const fail=message=>{throw new Error(message)};
const plain=count=>Array.from({length:count},(_,index)=>`слово${index+1}`).join(' ');
const photo=(id,width,height,layoutPreference='auto')=>({id,src:`data:image/jpeg;base64,${id}`,width,height,layoutPreference});
const page=(uid,text,photos=[])=>({uid,type:'chapter',title:'Дом',episode:'Первое воспоминание',included:true,userEdited:true,text,photos});
const assemble=pages=>engine.assemble({sections:[{id:'chapter',type:'chapter',title:'Дом',included:true,pages}]},{title:'Ритм',pageWords:{chapter:120,text:220,textHeading:180,textQuote:170,photoRailText:120,photoSideText:120}});

// A single wide source is the actual 1.5-page case: no second source is
// allowed to be invented, and both visible windows must point to that one
// source. The opening is intentionally text-only here so the rail is easy to
// identify in a minimal-photo book.
const result=assemble([page('rail',plain(900),[photo('rail',1500,1000)])]);
const railSpread=result.spreads.find(spread=>spread.master==='D01-SPREAD-PHOTO-RAIL');
if(!railSpread)fail('The fixed 1.5-page rail was not selected');
if(railSpread.continuousImage!==true)fail('The rail is not marked as a continuous image');
if(railSpread.left.photoIndex!==railSpread.right.photoIndex)fail('The rail used two photo sources instead of one');
if(railSpread.left.source.photos[railSpread.left.photoIndex].id!=='rail')fail('The rail source photo changed');

const renderContext={
  image:(source,index)=>source.photos?.[index]?.src||'',
  caption:()=>'',
  esc:value=>String(value==null?'':value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]))
};
const leftMarkup=renderer.renderPage(railSpread.left,'left',renderContext);
const rightMarkup=renderer.renderPage(railSpread.right,'right',renderContext);
if(!leftMarkup.includes('dpk-page dpk-photo-rail-image dpk-photo-rail'))fail('The full-photo rail page lacks the shared rail geometry class');
if(!rightMarkup.includes('dpk-page dpk-photo-rail-text dpk-photo-rail'))fail('The text rail page lacks the shared rail geometry class');
if((leftMarkup.match(/<img\b/g)||[]).length!==1||(rightMarkup.match(/<img\b/g)||[]).length!==1)fail('The 1.5-page rail does not render one image window per page');

// The fixed rhythm remains explicit and book-scoped; it is not a page-number
// modulo rule that changes when one optional photo is added.
const manifest=JSON.parse(fs.readFileSync(path.join(root,'book-renderer','design-pack-01.manifest.json'),'utf8'));
const rhythm=manifest.hard_rules.automatic_rhythm_sequence||[];
['chapter-opener','light-reading-flow','photo-beat-panorama-or-1p5-rail','photo-beat-dark-gradient','photo-beat-light-gradient'].forEach(slot=>{
  if(!rhythm.includes(slot))fail(`Missing fixed rhythm slot: ${slot}`);
});
if(manifest.hard_rules.one_source_rail_uses_distinct_crops!==true)fail('The one-source crop rule is missing');

// Guard against a collapsed hidden probe: it must not be able to declare a
// candidate fit and paginate a manuscript one line at a time.
const shell=fs.readFileSync(path.join(root,'shell.html'),'utf8');
const rendererSource=fs.readFileSync(path.join(root,'book-renderer','design-pack-01.js'),'utf8');
if(!rendererSource.includes('box.width<=0')||!rendererSource.includes('available>=leading'))fail('Collapsed DOM geometry is not rejected');
if(/createEditorialTextFit|fallbackCapacityByKey|measureEditorialPageWords/.test(shell))fail('Legacy capacity fallback is still wired into the constructor');

const wordCount=result.pages.reduce((sum,current)=>sum+String(current.text||'').split(/\s+/).filter(Boolean).length,0);
if(wordCount<500)fail(`The rail flow consumed too little text: ${wordCount} words`);
if(engine.audit(result).status!=='pass')fail('Fixed rail fails engine audit');

console.log(JSON.stringify({status:'pass',railUsesOneSource:true,sharedCropClass:true,fixedRhythm:true,geometryGuard:true,wordsRendered:wordCount},null,2));
