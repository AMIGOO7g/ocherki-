const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.resolve(__dirname,'..');
const context={window:{}};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'book-renderer','book-engine.js'),'utf8'),context);
const engine=context.window.OcherkiBookEngine;
const fail=message=>{throw new Error(message)};
const prose=count=>Array.from({length:count},(_,index)=>`Запись ${index+1} сохраняет место, время и человеческий голос для семейной истории.`).join(' ');
const photo=(id,width=1200,height=1800,layoutPreference='auto')=>({id,src:`data:image/jpeg;base64,${id}`,width,height,layoutPreference});
const page=(uid,text,photos=[])=>({uid,type:'chapter',title:'Глава 1. Дом',episode:'Глава 1',included:true,userEdited:true,text,photos});
const assemble=pages=>engine.assemble({sections:[{id:'chapter',type:'chapter',title:'Глава 1. Дом',included:true,pages}]},{title:'Проверка фиксированного режиссёра'});
const masters=result=>result.spreads.map(spread=>spread.master);

const textHeavy=assemble([page('text',prose(900),[])]);
if(masters(textHeavy).some(master=>master==='D01-SPREAD-DARK-TEXT'||master==='D01-SPREAD-DARK-TEXT-PAIR'))fail('Text-heavy book received an automatic dark text-only spread');
const renderedText=textHeavy.pages.flatMap(page=>[page.text,page.pullQuote,page.quote]).filter(Boolean).join(' ');
if(renderedText.split(/\s+/).filter(Boolean).length!==prose(900).split(/\s+/).filter(Boolean).length)fail('Text-heavy fallback lost words');

const oneExtra=assemble([
  page('opener',prose(90),[photo('hero')]),
  page('extra',prose(800),[photo('extra',2200,1500)])
]);
if(!masters(oneExtra).includes('D01-SPREAD-PHOTO-RAIL'))fail('One optional photo did not use the stable rail beat');
if(masters(oneExtra).some(master=>master==='D01-SPREAD-DARK-GRADIENT-PHOTO'))fail('One optional photo created a dark beat without a second image');

const twoExtra=assemble([
  page('opener',prose(90),[photo('hero')]),
  page('rail',prose(800),[photo('rail',2200,1500)]),
  page('dark',prose(800),[photo('dark',2000,1500)])
]);
const twoMasters=masters(twoExtra);
const railIndex=twoMasters.indexOf('D01-SPREAD-PHOTO-RAIL');
const darkIndex=twoMasters.indexOf('D01-SPREAD-DARK-GRADIENT-PHOTO');
if(railIndex<0||darkIndex<0||darkIndex<=railIndex)fail('Fixed rail/dark order is missing');
if(!twoMasters.slice(railIndex+1,darkIndex).includes('D01-SPREAD-TEXT'))fail('Fixed heavy-beat pause is missing');
if(engine.audit(twoExtra).status!=='pass')fail('Fixed director violates engine audit');

const repeated=assemble([
  page('opener',prose(90),[photo('hero')]),
  page('rail',prose(800),[photo('rail',2200,1500)]),
  page('dark',prose(800),[photo('dark',2000,1500)]),
  page('rest',prose(800),[photo('rest',1200,1800)])
]);
const repeatedAgain=assemble([
  page('opener',prose(90),[photo('hero')]),
  page('rail',prose(800),[photo('rail',2200,1500)]),
  page('dark',prose(800),[photo('dark',2000,1500)]),
  page('rest',prose(800),[photo('rest',1200,1800)])
]);
if(JSON.stringify(masters(repeated))!==JSON.stringify(masters(repeatedAgain)))fail('The same book changed automatic composition sequence');

const manual=assemble([page('manual',prose(300),[
  photo('hero'),photo('chosen',1800,1200,'dark-gradient-photo')
])]);
if(!masters(manual).includes('D01-SPREAD-DARK-GRADIENT-PHOTO'))fail('Manual dark-gradient choice was overwritten');

console.log(JSON.stringify({status:'pass',textFallback:true,onePhotoRail:true,darkBeatNeedsSecondPhoto:true,repeatable:true,manualOverride:true},null,2));
