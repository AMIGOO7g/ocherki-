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
const photo=(id,width=2200,height=1300,layoutPreference='auto')=>({id,src:`data:image/jpeg;base64,${id}`,caption:id,width,height,layoutPreference,orientation:width>height?'landscape':'portrait'});
const page=(uid,photos=[],count=170,extra={})=>Object.assign({uid,type:'chapter',title:'Глава 1. Дом',episode:'Глава 1. Дом',included:true,userEdited:true,text:prose(count),photos},extra);
const assemble=(pages,meta={})=>engine.assemble({sections:[{id:'chapter',type:'chapter',title:'Глава 1. Дом',included:true,pages}]},Object.assign({title:'Проверка V15'},meta));
const hasMaster=(result,master)=>result.spreads.some(spread=>spread.master===master);
const renderContext={meta:{},image:(source,index)=>source?.photos?.[index]?.src||'',caption:(source,index)=>source?.photos?.[index]?.caption||'',inferMeta:source=>source?.inferred||{},esc:value=>String(value)};

const panorama=assemble([page('panorama',[photo('wide')],90)]);
const panoramaSpread=panorama.spreads.find(spread=>spread.master==='D01-SPREAD-PANORAMA');
if(!panoramaSpread||panoramaSpread.left.photoIndex!==panoramaSpread.right.photoIndex||panoramaSpread.left.panoramaSide!=='left'||panoramaSpread.right.panoramaSide!=='right')fail('Panorama does not reuse one horizontal source photo across both pages');
const portraitPanorama=assemble([page('portrait',[photo('portrait',1300,2200,'spread')],90)]);
if(hasMaster(portraitPanorama,'D01-SPREAD-PANORAMA'))fail('Portrait photo was incorrectly used as a panorama');

const rail=assemble([page('rail',[photo('rail-hero',1200,1800)],18),page('rail-text',[photo('rail-photo',2600,1500,'photo-rail-right')],240)]);
const railSpread=rail.spreads.find(spread=>spread.master==='D01-SPREAD-PHOTO-RAIL');
if(!railSpread||railSpread.left.photoIndex!==railSpread.right.photoIndex||railSpread.left.kind!=='photo-rail-image'||railSpread.right.kind!=='photo-rail-text'||railSpread.right.railSide!=='right')fail('Photo rail with right text column is missing or does not reuse one source');
const mirroredRail=assemble([page('rail-left',[photo('rail-left-hero',1200,1800)],18),page('rail-left-text',[photo('rail-left-photo',2600,1500,'photo-rail-left')],240)]);
const mirroredSpread=mirroredRail.spreads.find(spread=>spread.master==='D01-SPREAD-PHOTO-RAIL');
if(!mirroredSpread||mirroredSpread.left.railSide!=='left'||mirroredSpread.right.railSide!=='left')fail('Mirrored photo rail with left text column is missing');

const gradient=assemble([page('gradient',[photo('gradient-hero',1200,1800)],18),page('gradient-text',[photo('gradient-photo',1800,1200,'photo-gradient-text')],180)]);
if(!hasMaster(gradient,'D01-SPREAD-PHOTO-GRADIENT-TEXT'))fail('Photo-gradient-text composition is missing');
const darkGradient=assemble([page('dark-gradient',[photo('dark-gradient-hero',1200,1800)],18),page('dark-gradient-text',[photo('dark-gradient-photo',1800,1200,'dark-gradient-photo')],180)]);
if(!hasMaster(darkGradient,'D01-SPREAD-DARK-GRADIENT-PHOTO'))fail('Dark photo-gradient composition is missing');
const darkPhotoPair=assemble([page('dark-photo-pair-intro',[],18),page('dark-photo-pair',[photo('dark-photo-1',1800,1200,'dark-photo-pair'),photo('dark-photo-2',1800,1200,'dark-photo-pair')],360)]);
if(!hasMaster(darkPhotoPair,'D01-SPREAD-DARK-PHOTO-PAIR'))fail('Two-page dark photo/text spread is missing');
const darkPair=assemble([page('dark-pair',[],900)]);
if(hasMaster(darkPair,'D01-SPREAD-DARK-TEXT-PAIR'))fail('Text-only book inserts an automatic two-page dark text spread');

const date=renderer.renderPage({kind:'date-era',layout:'date-era',master:'D01-DATE-ERA',title:'Переезд',dateLabel:'1987—1992',text:prose(4)},'left',renderContext);
const episode=renderer.renderPage({kind:'text',layout:'prose-dense',master:'D01-TEXT-QUOTE',title:'Новый эпизод',sectionTitle:'Новый эпизод',episodeNo:2,showHeading:true,dropCap:true,pullQuote:'Ручная цитата эпизода.',text:prose(6)},'left',renderContext);
if(!/dpk-columns dpk-reading/.test(date)||!/dpk-columns dpk-reading/.test(episode)||!/dpk-episode-pull/.test(episode))fail('Date or new-episode page lost two columns or the heading quote');

const css=fs.readFileSync(path.join(root,'book-renderer','design-pack-01.css'),'utf8');
const proof=fs.readFileSync(path.join(root,'book-renderer','master-proof.html'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'book-renderer','design-pack-01.manifest.json'),'utf8'));
const sheet=fs.readFileSync(path.join(root,'sheet_v35.html'),'utf8');
if(!/16px\/27px/.test(css)||!/padding:42px 58px 78px/.test(css)||!/repeating-linear-gradient/.test(css))fail('V15 document size, safe margins or ruled lines are missing');
if(!/dpk-photo-rail-main/.test(css)||!/dpk-photo-rail-copy/.test(css)||!/dpk-gradient-scrim/.test(css)||!/dpk-dark-gradient-scrim/.test(css)||!/dpk-photo-bw/.test(css)||!/dpk-mosaic-count-8/.test(css))fail('V15 reference composition CSS is missing');
if(!/D01-SPREAD-PHOTO-RAIL/.test(proof)||!/D01-SPREAD-PHOTO-RAIL-MIRROR/.test(proof)||!/D01-SPREAD-DARK-TEXT-PAIR/.test(proof)||!/D01-SPREAD-PHOTO-GRADIENT-TEXT/.test(proof)||!/D01-SPREAD-DARK-GRADIENT-PHOTO/.test(proof))fail('V15 Master Proof does not show all new compositions');
if(!/^(?:1\.10\.0-director-v(?:15|16)|1\.12\.0-one-book-system|1\.13\.0-precision-corrections|1\.14\.0-stable-base-recovery|1\.15\.0-visible-editorial-rhythm|1\.16\.0-stable-important-reflow)$/.test(manifest.version)||!manifest.hard_rules.one_source_photo_1_5_page_rail||!manifest.hard_rules.dark_text_pair||!manifest.hard_rules.dark_photo_pair||!manifest.hard_rules.photo_text_gradient_field||!manifest.hard_rules.photo_color_default||!manifest.hard_rules.photo_bw_toggle)fail('Design pack manifest does not declare the reference hard rules');
if(!/photo\.id/.test(sheet)||!/photoId:String\(block\?\.photoId/.test(sheet)||!/revision: Number\(photo\?\.revision/.test(sheet)||!/photo-revision-/.test(sheet)||!/render\(\);\s*updateSave/.test(sheet)||!/photoToneBtn/.test(sheet)||!/photoMode: photoRenderMode/.test(sheet))fail('Stable photo identity, replacement refresh or photo tone control is missing');
if(!/dpk-photo-color/.test(fs.readFileSync(path.join(root,'book-renderer','design-pack-01.js'),'utf8'))||!/filter:none!important/.test(css))fail('Colour photography is not the default treatment');

console.log(JSON.stringify({status:'pass',panoramaOneSource:true,photoRailRight:true,photoRailLeft:true,gradientPhotoText:true,textOnlyNoDarkTextPair:true,darkTextPairProof:true,dateAndEpisodeTwoColumns:true,ruledDocument:true,stablePhotoReplacement:true},null,2));
