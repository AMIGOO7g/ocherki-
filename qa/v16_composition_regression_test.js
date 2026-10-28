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
const prose=count=>Array.from({length:count},(_,index)=>`Запись ${index+1} сохраняет место, время и человеческий голос семейной истории.`).join(' ');
const photo=(id,layoutPreference='auto',width=1400,height=1800)=>({id,src:`data:image/jpeg;base64,${id}`,caption:id,width,height,layoutPreference,orientation:width>height?'landscape':'portrait'});
const page=(uid,photos=[],count=0,extra={})=>Object.assign({uid,type:'chapter',title:'Глава 1. Дом',episode:'Глава 1. Дом',included:true,userEdited:true,text:prose(count),photos},extra);
const assemble=pages=>engine.assemble({sections:[{id:'chapter',type:'chapter',title:'Глава 1. Дом',included:true,pages}]},{title:'Проверка V16'});
const hasMaster=(result,master)=>result.spreads.some(spread=>spread.master===master);
const contextFor={meta:{},image:(source,index)=>source?.photos?.[index]?.src||'',caption:(source,index)=>source?.photos?.[index]?.caption||'',inferMeta:source=>source?.inferred||{},esc:value=>String(value)};

const photoOnly=assemble([page('photos',[photo('a','triptych'),photo('b'),photo('c')])]);
const triptychSpread=photoOnly.spreads.find(spread=>spread.master==='D01-SPREAD-THREE-PHOTO');
if(!triptychSpread||triptychSpread.left.kind==='quote'||triptychSpread.right.kind==='quote')fail('Photo-only triptych received an unintended quote companion');
if(!hasMaster(assemble([page('duo',[photo('a','duo'),photo('b')])]),'D01-SPREAD-DUO'))fail('Two-photo sheet is missing');
if(!hasMaster(assemble([page('pair',[photo('a','spread-pair'),photo('b')])]),'D01-SPREAD-TWO-PHOTO'))fail('Two-photo spread is missing');
if(!hasMaster(assemble([page('mosaic',[photo('a','mosaic'),...Array.from({length:5},(_,i)=>photo(`m${i}`))])]),'D01-SPREAD-MOSAIC'))fail('Photo mosaic is missing');
if(!hasMaster(assemble([page('hero',[photo('hero')],20),page('rail',[photo('rail','photo-1p5-text',2600,1500)],220)]),'D01-SPREAD-PHOTO-RAIL'))fail('One-and-a-half-page photo rail is not reachable from its explicit preference');

const light=renderer.renderPage({kind:'quote',layout:'quote',quote:'Светлая цитата.',quoteTone:'light'},'left',contextFor);
const dark=renderer.renderPage({kind:'quote',layout:'quote',quote:'Тёмная цитата.',quoteTone:'dark'},'left',contextFor);
if(!/dpk-light-quote/.test(light)||/dpk-dark/.test(light))fail('Light full-page quote still carries the dark treatment');
if(!/dpk-dark/.test(dark)||/dpk-light-quote/.test(dark))fail('Dark full-page quote lost its dark treatment');

const css=fs.readFileSync(path.join(root,'book-renderer','design-pack-01.css'),'utf8');
const engineSource=fs.readFileSync(path.join(root,'book-renderer','book-engine.js'),'utf8');
const sheet=fs.readFileSync(path.join(root,'sheet_v35.html'),'utf8');
const shell=fs.readFileSync(path.join(root,'shell.html'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'book-renderer','design-pack-01.manifest.json'),'utf8'));
if(!/dpk-light-quote/.test(css)||!/gradient-scrim/.test(css)||!/inset:36px 0 82px/.test(css))fail('Light quote or edge-fading gradient treatment is missing');
if(!/isDarkPauseBlocked/.test(engineSource)||!isDarkPauseBlockedMentions(engineSource))fail('Dark spread spacing rule is missing from the director');
if(!/photo-1p5-text/.test(engineSource)||!/id="bookPreviewLayout"/.test(shell)||/id="photoLayoutField"/.test(sheet))fail('The one-and-a-half-page composition is not available from the preview control');
if(!manifest.hard_rules.full_page_quotes_can_be_light_or_dark||!manifest.hard_rules.photo_only_compositions_have_no_text_companion||!manifest.hard_rules.dark_spreads_not_adjacent)fail('V16 composition rules are not declared in the manifest');

function isDarkPauseBlockedMentions(source){
  return source.includes('!isDarkPauseBlocked(previousMaster)');
}

console.log(JSON.stringify({status:'pass',photoOnlyNoQuoteCompanion:true,photoOnlyCatalog:['duo','spread-pair','triptych','mosaic'],photoRailPreview:true,lightAndDarkQuotes:true,darkSpreadSpacing:true,gradientEdgeFade:true},null,2));
