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
const sentence=index=>`Запись ${index} сохраняет точное место, время, человеческий голос и важную подробность семейной истории.`;
const prose=count=>Array.from({length:count},(_,index)=>sentence(index+1)).join(' ');
const photo=(id,width=1400,height=1800,layoutPreference='auto')=>({id,src:`data:image/jpeg;base64,${id}`,caption:id,width,height,layoutPreference,orientation:width>height?'landscape':'portrait'});
const page=(uid,photos=[],count=140,extra={})=>Object.assign({uid,type:'chapter',title:'Глава 1. Дом',episode:'Глава 1. Дом',included:true,userEdited:true,text:prose(count),photos},extra);
const assemble=(pages,meta={})=>engine.assemble({sections:[{id:'chapter',type:'chapter',title:'Глава 1. Дом',included:true,pages}]},Object.assign({title:'Проверка V13'},meta));
const hasMaster=(result,master)=>result.spreads.some(spread=>spread.master===master);

const panorama=assemble([page('panorama',[photo('wide',2800,1400)],90)]);
const panoramaSpread=panorama.spreads.find(spread=>spread.master==='D01-SPREAD-PANORAMA');
if(!panoramaSpread)fail('Automatic horizontal panorama is missing');
if(panoramaSpread.left.photoIndex!==panoramaSpread.right.photoIndex||panoramaSpread.left.panoramaSide!=='left'||panoramaSpread.right.panoramaSide!=='right')fail('Panorama does not reuse one source photo across both pages');
const portraitPanorama=assemble([page('portrait',[photo('portrait',1400,2800,'spread')],90)]);
if(hasMaster(portraitPanorama,'D01-SPREAD-PANORAMA'))fail('Portrait photo was incorrectly used as a panorama');

const duo=assemble([page('duo',[photo('duo-a'),photo('duo-b')])]);
if(!hasMaster(duo,'D01-SPREAD-DUO'))fail('Automatic two-photos-on-one-page composition is missing');
const stacked=assemble([page('stacked',[photo('stack-a'),photo('stack-b'),photo('stack-c')])]);
if(!hasMaster(stacked,'D01-SPREAD-STACKED-TEXT'))fail('Automatic stacked composition is missing');
const mosaic=assemble([page('mosaic',Array.from({length:7},(_,index)=>photo(`mosaic-${index}`)))]);
if(!hasMaster(mosaic,'D01-SPREAD-MOSAIC'))fail('Automatic mosaic from five or more photos is missing');

const darkSplit=assemble([
  page('dark-hero',[photo('dark-hero')],28),
  page('dark-composite',[photo('dark-composite')],170)
]);
if(!hasMaster(darkSplit,'D01-SPREAD-DARK-SPLIT'))fail(`Automatic dark photo/text composition is missing: ${darkSplit.spreads.map(spread=>spread.master).join(', ')}`);
const textOver=assemble([
  page('text-over-hero',[photo('text-over-hero')],28),
  page('text-over-composite',[photo('text-over-composite',1500,1250)],170)
]);
if(!hasMaster(textOver,'D01-SPREAD-TEXT-OVER-PHOTO'))fail('Automatic text-over-photo composition is missing');
const overlay=assemble([
  page('overlay-hero',[photo('overlay-hero')],12),
  page('overlay-first',[photo('overlay-first',1500,1250,'text-top-photo')],120,{eraDate:'1987—1992'}),
  page('overlay-composite',[photo('overlay-composite',1500,1250)],180),
  page('overlay-auto',[photo('overlay-auto',1500,1250)],180)
]);
if(!hasMaster(overlay,'D01-SPREAD-DATE-ERA')||!hasMaster(overlay,'D01-SPREAD-PHOTO-OVERLAY-TEXT'))fail(`Date watermark or automatic photo overlay composition is missing: ${overlay.spreads.map(spread=>spread.master).join(', ')}`);

const quoteBand=assemble([
  page('band-hero',[photo('band-hero')],28),
  page('band-a',[photo('band-a')],80),
  page('band-b',[photo('band-b')],80)
]);
if(!hasMaster(quoteBand,'D01-SPREAD-QUOTE-BAND'))fail('Automatic unequal two-photo quote-band composition is missing');

const crossSpine=assemble([
  page('bleed-hero',[photo('bleed-hero')],40),
  page('panorama-first',[photo('panorama-first',3000,1500)],220),
  page('bleed-second',[photo('bleed-second',3000,1500)],220)
]);
if(!hasMaster(crossSpine,'D01-SPREAD-PANORAMA')||!hasMaster(crossSpine,'D01-SPREAD-BLEED-TEXT'))fail('Panorama and cross-spine photo rhythm are not both visible');
const panoramaIndex=crossSpine.spreads.findIndex(spread=>spread.master==='D01-SPREAD-PANORAMA');
const bleedIndex=crossSpine.spreads.findIndex(spread=>spread.master==='D01-SPREAD-BLEED-TEXT');
if(bleedIndex-panoramaIndex<2)fail('Heavy photo spreads were placed without a text pause');

const darkText=assemble([page('long-text',[],320)]);
if(hasMaster(darkText,'D01-SPREAD-DARK-TEXT')||hasMaster(darkText,'D01-SPREAD-DARK-TEXT-PAIR'))fail('Text-only book should not insert an automatic dark text spread');

const dated=assemble([page('dated',[],90,{eraDate:'1946'})]);
if(!dated.pages.some(item=>item.master==='D01-DATE-ERA'&&item.dateLabel==='1946'))fail('Date watermark is not emitted on the first chapter page');

const documentHtml=renderer.renderPage({kind:'document',layout:'document-letter',master:'D01-DOCUMENT',source:{photos:[],inferred:{date:'1946'}},title:'Архивный документ',text:prose(12)},'left',{meta:{},image:()=>'',caption:()=>'',inferMeta:source=>source.inferred||{},esc:value=>String(value)});
if(!/dpk-document-transcript/.test(documentHtml)||!/Архивный документ/.test(documentHtml))fail('Text-only document does not use the transcription master');

const engineSource=fs.readFileSync(path.join(root,'book-renderer','book-engine.js'),'utf8');
const shell=fs.readFileSync(path.join(root,'shell.html'),'utf8');
const css=fs.readFileSync(path.join(root,'book-renderer','design-pack-01.css'),'utf8');
const proof=fs.readFileSync(path.join(root,'book-renderer','master-proof.html'),'utf8');
if(/firstTarget\s*=\s*Math\.ceil\(total\/2\)/.test(engineSource))fail('Text is still balanced into two half-empty pages');
if(!/document\.fonts\?\.ready/.test(shell))fail('Assembly does not wait for the real book fonts');
if(!/dpk-document-text-page[\s\S]*repeating-linear-gradient/.test(css)||!/SignThatS/.test(css))fail('Ruled handwriting document CSS is missing');
if(!/(?:Master Proof V15|Master Proof V16)/.test(proof)||!/Существующие и дополнительные композиции/.test(proof))fail('Master proof was not updated as an additive composition catalog');

console.log(JSON.stringify({
  status:'pass',
  automaticMasters:['panorama','duo','stacked','mosaic','dark-split','text-over-photo','photo-overlay-text','quote-band','bleed-text','date-era'],
  panoramaUsesOneHorizontalPhoto:true,
  textPairBalancingRemoved:true,
  ruledDocument:true
},null,2));
