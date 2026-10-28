const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.resolve(__dirname,'..');
const shell=fs.readFileSync(path.join(root,'shell.html'),'utf8');
const sheet=fs.readFileSync(path.join(root,'sheet_v35.html'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'book-renderer/design-pack-01.css'),'utf8');
const engineSource=fs.readFileSync(path.join(root,'book-renderer/book-engine.js'),'utf8');
const fail=message=>{throw new Error(message)};

if(/id="zoom(?:Out|In)Btn"/.test(shell)||/function setZoom\(/.test(shell)) fail('zoom controls still reserve UI space');
if(!/id="startAuthKey"/.test(index)||/id="authBtn"|auth-hanging|auth-label/.test(shell)) fail('authorization must exist only on the start screen');
if(!/book-map-note,.writing-prompt,.writing-prompt-restore\{display:none!important\}/.test(shell)) fail('startup still exposes explanatory copy');
if(!/function recoverEditorInteraction\(\)/.test(sheet)||!/page-content-leaving \.editor\{pointer-events:auto!important\}/.test(sheet)) fail('editor recovery guard is missing');
if(!/top:0!important;right:0!important;bottom:0!important;left:0!important/.test(css)||!/#11110f 25%/.test(css)||!/rgba\(17,17,15,\.62\) 39%/.test(css)) fail('dark gradient is not full-height and uses the requested 25% dark field');
if(!/dpk-mosaic-count-5 \.dpk-mosaic-grid figure:nth-child\(5\)/.test(css)) fail('five-photo mosaic has no filled geometry');

const context={window:{}};
vm.createContext(context);
vm.runInContext(engineSource,context);
const engine=context.window.OcherkiBookEngine;
const prose=n=>Array.from({length:n},(_,i)=>`Запись ${i+1} сохраняет место и голос семейной истории.`).join(' ');
const photo=(id,w,h,layoutPreference='auto')=>({id,src:`data:image/jpeg;base64,${id}`,width:w,height:h,layoutPreference});
const page=(uid,text,photos)=>({uid,type:'chapter',title:'Дом',episode:'Первые воспоминания',included:true,userEdited:true,text,photos});

const fixed=engine.assemble({sections:[{id:'c',type:'chapter',title:'Дом',included:true,pages:[
  page('opener',prose(160),[photo('hero',1000,1600)]),
  page('rail',prose(420),[photo('rail',2200,1500)]),
  page('dark',prose(420),[photo('dark',1800,1300)])
]}]},{title:'Проверка'});
if(!fixed.spreads.some(spread=>spread.master==='D01-SPREAD-DARK-GRADIENT-PHOTO')) fail('automatic dark spread did not appear');
const dark=fixed.spreads.find(spread=>spread.master==='D01-SPREAD-DARK-GRADIENT-PHOTO');
if(!dark||dark.left?.kind!=='dark-text'&&dark.right?.kind!=='dark-text') fail('dark spread has no dark companion');

const pair=engine.assemble({sections:[{id:'c',type:'chapter',title:'Дом',included:true,pages:[
  page('pair',prose(35),[photo('one',1000,1400,'spread-pair'),photo('two',1000,1400,'spread-pair')])
]}]},{title:'Проверка'});
const pairSpread=pair.spreads.find(spread=>spread.master==='D01-SPREAD-TWO-PHOTO');
if(!pairSpread||pairSpread.left?.photoIndex===pairSpread.right?.photoIndex) fail('two-photo spread duplicated its source');

console.log(JSON.stringify({status:'pass',zoomRemoved:true,authOnStartScreen:true,constructorAuthHidden:true,editorRecovery:true,darkSpread:true,darkCompanion:true,distinctPair:true,mosaicFiveFilled:true},null,2));
