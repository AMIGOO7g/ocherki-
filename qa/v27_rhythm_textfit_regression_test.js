const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.resolve(__dirname,'..');
const context={window:{}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'book-renderer','book-engine.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'book-renderer','design-pack-01.js'),'utf8'),context);
const engine=context.window.OcherkiBookEngine;
const fail=message=>{throw new Error(message)};
const sentence=index=>`Запись ${index} сохраняет место, время, человеческий голос и важную подробность семейной истории.`;
const prose=(start,count)=>Array.from({length:count},(_,index)=>sentence(start+index)).join(' ');
const photo=(id,width,height,layoutPreference='auto')=>({id,src:`data:image/jpeg;base64,${id}`,width,height,layoutPreference,orientation:width>height?'landscape':'portrait'});
const page=(uid,text,photos=[])=>({uid,type:'chapter',title:'Глава 1. Дом',episode:'Глава 1',included:true,userEdited:true,text,photos});

const automatic=engine.assemble({sections:[{id:'chapter',type:'chapter',title:'Глава 1. Дом',included:true,pages:[
  page('opener',prose(1,30),[photo('hero',1200,1800)]),
  page('rail',prose(31,260),[photo('rail',2200,1500)]),
  page('dark',prose(291,260),[photo('dark',2000,1500)])
]}]},{title:'Ритм'});
const railIndex=automatic.spreads.findIndex(spread=>spread.master==='D01-SPREAD-PHOTO-RAIL');
const darkIndex=automatic.spreads.findIndex(spread=>spread.master==='D01-SPREAD-DARK-GRADIENT-PHOTO');
if(railIndex<0||darkIndex<0||darkIndex<=railIndex)fail('Book-wide automatic rail/dark rhythm is missing or reversed');
if(!automatic.spreads.slice(railIndex+1,darkIndex).some(spread=>spread.master==='D01-SPREAD-TEXT'))fail('Heavy automatic compositions are adjacent without a quiet text step');
if(engine.audit(automatic).status!=='pass')fail('Automatic rhythm violates the engine audit');

const manual=engine.assemble({sections:[{id:'chapter',type:'chapter',title:'Глава 1. Дом',included:true,pages:[
  page('opener',prose(1,30),[photo('hero',1200,1800)]),
  page('manual',prose(31,220),[photo('manual',2200,1500,'photo-1p5-text')])
]}]},{title:'Ручной выбор'});
if(!manual.spreads.some(spread=>spread.master==='D01-SPREAD-PHOTO-RAIL'))fail('Manual one-and-a-half-page rail is no longer reachable');

const shell=fs.readFileSync(path.join(root,'shell.html'),'utf8');
const css=fs.readFileSync(path.join(root,'book-renderer','design-pack-01.css'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'book-renderer','design-pack-01.manifest.json'),'utf8'));
const shared=fs.readFileSync(path.join(root,'book-renderer/layout-pagination-engine.js'),'utf8');
if(!/OcherkiLayoutPagination.build\(structure/.test(shell)||/createEditorialPaginator/.test(shell)||!/renderer\(\).paginateText/.test(shared))fail('Active text roles are not connected to the shared DOM paginator');
if(!/planAutomaticBookCompositions\(chapters\)/.test(fs.readFileSync(path.join(root,'book-renderer','book-engine.js'),'utf8')))fail('Automatic rhythm is not planned at book scope');
if(!manifest.hard_rules.automatic_rhythm_book_scope||!manifest.hard_rules.manual_layout_override_preserved||!manifest.hard_rules.text_pagination_uses_render_metrics)fail('Book rhythm and render-metric rules are not declared');
if(!/\.dpk-page\.dpk-dark-gradient-photo \.dpk-dark-gradient-scrim\{[^}]*#11110f 0%[^}]*#11110f 20%/.test(css))fail('Dark gradient does not use the requested approximately 20% opaque field');
if(!/\.dpk-page\.dpk-dark-gradient-photo>figure,\s*body \.dpk-page\.dpk-dark-gradient-photo \.dpk-dark-gradient-scrim\{[^}]*top:0!important[^}]*bottom:0!important/.test(css))fail('Dark gradient does not cover the full page height');

console.log(JSON.stringify({status:'pass',automaticRail:true,quietStepBetweenHeavySpreads:true,automaticDarkGradient:true,manualRail:true,sharedTextPaginator:true},null,2));
