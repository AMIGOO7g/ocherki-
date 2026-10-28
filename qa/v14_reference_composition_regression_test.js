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
const photo=(id,width=1400,height=1800,layoutPreference='auto',extra={})=>Object.assign({id,src:`data:image/jpeg;base64,${id}`,caption:id,width,height,layoutPreference,orientation:width>height?'landscape':'portrait'},extra);
const page=(uid,photos=[],count=90,extra={})=>Object.assign({uid,type:'chapter',title:'Глава 1. Дом',episode:'Глава 1. Дом',included:true,userEdited:true,text:prose(count),photos},extra);
const assemble=(pages,meta={})=>engine.assemble({sections:[{id:'chapter',type:'chapter',title:'Глава 1. Дом',included:true,pages}]},Object.assign({title:'Проверка V14'},meta));
const master=(result,name)=>result.spreads.find(spread=>spread.master===name);
const renderContext={meta:{},image:(source,index)=>source?.photos?.[index]?.src||'',caption:(source,index)=>source?.photos?.[index]?.caption||'',inferMeta:source=>source?.inferred||{},esc:value=>String(value)};

const episode=assemble([
  page('opening',[],18),
  page('episode-2',[],170,{sectionTitle:'Второй поворот',episode:'Эпизод 2. Второй поворот',isEpisodeStart:true,quote:'Ручная цитата эпизода.'})
]);
const episodePage=episode.pages.find(item=>item.master==='D01-TEXT-QUOTE');
if(!episodePage||episodePage.sectionTitle!=='Второй поворот'||episodePage.pullQuote!=='Ручная цитата эпизода.')fail('Episode heading quote was not restored');
const episodeHtml=renderer.renderPage(episodePage,'left',renderContext);
if(!/dpk-episode-pull/.test(episodeHtml)||!/dpk-columns dpk-reading/.test(episodeHtml))fail('Episode quote is not under a two-column text heading');

const internal=assemble([page('long',[],360)]);
const internalPage=internal.pages.find(item=>item.kind==='text'&&item.pullQuote&&!item.showHeading);
if(!internalPage)fail('Ordinary text did not receive a scheduled fixed pull quote');
const internalHtml=renderer.renderPage(internalPage,'left',renderContext);
if(!/dpk-fixed-pull/.test(internalHtml)||/dpk-reading"><div class="dpk-fixed-pull">/.test(internalHtml))fail('Ordinary pull quote is not isolated above the columns');

const photoTextLarge=assemble([
  page('photo-hero',[photo('hero')],18),
  page('photo-text',[photo('designed',1500,1250)],170),
  page('photo-large',[photo('large')],20)
]);
if(!master(photoTextLarge,'D01-SPREAD-PHOTO-OVER-TEXT-LARGE'))fail('Automatic photo-over-text plus large-photo spread is missing');
const textPhotoLarge=assemble([
  page('text-hero',[photo('hero2')],18),
  page('text-photo',[photo('designed2',1500,1250,'text-top-photo')],170),
  page('text-large',[photo('large2')],20)
]);
if(!master(textPhotoLarge,'D01-SPREAD-TEXT-OVER-PHOTO-LARGE'))fail('Text-over-photo plus large-photo spread is missing');

const mirroredBleed=assemble([
  page('bleed-hero',[photo('hero3')],18),
  page('bleed',[photo('bleed',3000,1500,'bleed-text',{textRailSide:'left'})],180)
]);
const bleedSpread=master(mirroredBleed,'D01-SPREAD-BLEED-TEXT');
if(!bleedSpread||bleedSpread.left.railSide!=='left'||bleedSpread.right.railSide!=='left')fail('Mirrored left text rail was not preserved');
const bleedHtml=renderer.renderPage(bleedSpread.left,'left',renderContext);
if(!/dpk-bleed-rail-left/.test(bleedHtml))fail('Mirrored bleed text rail renderer is missing');

const longText=prose(420);
const flow=assemble([page('flow',[],420)]);
const sourceWordCount=longText.trim().split(/\s+/).length;
const emittedWordCount=flow.pages.reduce((sum,item)=>sum+String(item.text||'').trim().split(/\s+/).filter(Boolean).length+String(item.pullQuote||'').trim().split(/\s+/).filter(Boolean).length+String(item.quote||'').trim().split(/\s+/).filter(Boolean).length,0);
if(emittedWordCount<sourceWordCount-8)fail(`Text was lost during pagination: ${emittedWordCount}/${sourceWordCount}`);
if(flow.pages.some(item=>item.master==='D01-DARK-TEXT'&&String(item.text||'').trim().split(/\s+/).length>50))fail('Text-only book inserts an automatic dark text page');

const css=fs.readFileSync(path.join(root,'book-renderer','design-pack-01.css'),'utf8');
const proof=fs.readFileSync(path.join(root,'book-renderer','master-proof.html'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'book-renderer','design-pack-01.manifest.json'),'utf8'));
if(!/--dpk-accent:#9b9170/.test(css)||!/dpk-episode-pull/.test(css))fail('Reference accent or episode quote CSS is missing');
if(!/D01-SPREAD-PHOTO-OVER-TEXT-LARGE/.test(proof)||!/D01-SPREAD-TEXT-OVER-PHOTO-LARGE/.test(proof)||!/(?:Master Proof V15|Master Proof V16)/.test(proof))fail('Reference master proof does not show reference pairs');
if(!/^(?:1\.10\.0-director-v(?:15|16)|1\.12\.0-one-book-system|1\.13\.0-precision-corrections|1\.14\.0-stable-base-recovery|1\.15\.0-visible-editorial-rhythm|1\.16\.0-stable-important-reflow)$/.test(manifest.version))fail('Design pack manifest version is incorrect');

console.log(JSON.stringify({status:'pass',episodeQuoteUnderHeading:true,internalQuote:true,mirroredPanoramaRail:true,referencePairs:true,textPreserved:true,textOnlyNoAutoDark:true},null,2));
