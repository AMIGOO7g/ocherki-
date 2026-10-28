const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.resolve(__dirname,'..');
const context={window:{}};vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'book-renderer','book-engine.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'book-renderer','design-pack-01.js'),'utf8'),context);
const engine=context.window.OcherkiBookEngine;
const renderer=context.window.OcherkiBookRenderer;
const fail=m=>{throw new Error(m)};
const text=n=>Array.from({length:n},(_,i)=>`Семейная память сохраняет важную подробность номер ${i+1}, чтобы передать её следующим поколениям.`).join(' ');
const photo=(id,width,height,layout='auto')=>({id,src:`data:image/jpeg;base64,${id}`,width,height,orientation:width>height?'landscape':'portrait',layoutPreference:layout,caption:id});
const assemble=pages=>engine.assemble({sections:[
  {id:'cover',type:'cover',included:true,pages:[{uid:'cover',type:'cover',text:'Очерки жизни',photos:[]}]},
  {id:'chapter-1',type:'chapter',title:'Глава 1. Начало',included:true,pages}
]},{title:'Очерки жизни'});
const page=(uid,photos,words=180,extra={})=>Object.assign({uid,type:'chapter',title:'Глава 1. Начало',episode:`Эпизод ${uid}. История`,included:true,isEpisodeStart:true,userEdited:true,text:text(words),photos},extra);

const panorama=assemble([page('1',[photo('wide',3000,1400)],220)]);
if(!panorama.spreads.some(s=>s.master==='D01-SPREAD-PANORAMA'))fail('Director did not select an eligible panorama');
const blocked=assemble([page('1',[photo('wide',3000,1400,'standard')],220)]);
if(blocked.spreads.some(s=>s.master==='D01-SPREAD-PANORAMA'))fail('Manual standard choice did not block panorama');

const pair=assemble([page('1',[photo('pair-a',1200,1600,'spread-pair'),photo('pair-b',1200,1600)],25)]);
if(!pair.spreads.some(s=>s.master==='D01-SPREAD-TWO-PHOTO'))fail('Two-photo spread override is missing');

const triptych=assemble([page('1',[photo('tri-hero',1200,1600),photo('tri-a',1200,1600),photo('tri-b',1200,1600),photo('tri-c',1200,1600)],180)]);
if(!triptych.pages.some(p=>p.master==='D01-THREE-PHOTO'))fail('Automatic triptych is missing');

const duo=assemble([page('1',[photo('duo-a',1200,1600,'duo'),photo('duo-b',1200,1600)],180)]);
const duoPage=duo.pages.find(p=>p.master==='D01-TWO-PHOTO');
if(!duoPage||duoPage.photoIndices.length!==2)fail('Two-photo page is missing');

const over=assemble([page('1',[photo('top',1800,1200,'photo-top-text')],220)]);
const overPage=over.pages.find(p=>p.master==='D01-PHOTO-OVER-TEXT');
if(!overPage||!overPage.text)fail('Photo-over-text page is missing');

const quote=assemble([
  page('1',[photo('hero',1200,1800)],120,{quote:'Ручная цитата важнее автоматической.'}),
  page('2',[],120,{title:'Новый эпизод',episode:'Эпизод 2. Новый эпизод'})
]);
if(!quote.pages.some(p=>p.pullQuote==='Ручная цитата важнее автоматической.'||p.quote==='Ручная цитата важнее автоматической.'))fail('Manual quote lost priority');
if(!quote.pages.some(p=>p.sectionTitle==='Новый эпизод'&&p.pullQuote))fail('Automatic quote was not created for a new episode');

const renderContext={meta:{},image:(source,index)=>source?.photos?.[index]?.src||'',caption:(source,index)=>source?.photos?.[index]?.caption||'',inferMeta:()=>({})};
if((renderer.renderPage(duoPage,'left',renderContext).match(/<figure/g)||[]).length!==2)fail('Duo renderer did not draw two photographs');
if(!/dpk-photo-over-copy/.test(renderer.renderPage(overPage,'right',renderContext)))fail('Photo-over-text renderer is missing');

const sheet=fs.readFileSync(path.join(root,'sheet_v35.html'),'utf8');
const shell=fs.readFileSync(path.join(root,'shell.html'),'utf8');
const proof=fs.readFileSync(path.join(root,'book-renderer','master-proof.html'),'utf8');
if(!/s\.included=true/.test(sheet)||!/Можно выключить · сейчас включено/.test(sheet))fail('Default system-section policy is missing');
if(!/showIncludeToggle=optionalAuto\(\)/.test(sheet))fail('Mandatory pages still expose the optional toggle');
if(!/userCreated:true/.test(sheet)||!/page\.userCreated===true/.test(sheet))fail('Empty user-created sheet removal is missing');
if(!/directorRebuildTimer=setTimeout/.test(shell))fail('Automatic full-book recalculation is missing');
if(!/design-thumbnail-bw\.png/.test(shell)||!/ОЧЕРКИ/.test(shell))fail('Editorial cover thumbnail is missing');
if(!/D01-TWO-PHOTO/.test(proof)||!/D01-PHOTO-OVER-TEXT/.test(proof))fail('V10 masters are missing from master proof');
console.log(JSON.stringify({status:'pass',panorama:true,twoPhotoSpread:true,triptych:true,duo:true,photoOverText:true,manualQuotePriority:true,automaticEpisodeQuote:true},null,2));
