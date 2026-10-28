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
const prose=count=>Array.from({length:count},(_,index)=>`Запись ${index+1} сохраняет место, время и человеческий голос для семейной истории.`).join(' ');
const photo=(id,preference='auto',width=1400,height=1800)=>({id,src:`data:image/jpeg;base64,${id}`,caption:id,layoutPreference:preference,width,height,orientation:width>height?'landscape':'portrait'});
const assemble=photos=>engine.assemble({sections:[{id:'chapter',type:'chapter',title:'Глава 1. Дом',included:true,pages:[{uid:'page-1',type:'chapter',title:'Глава 1. Дом',episode:'Глава 1. Дом',included:true,userEdited:true,text:prose(150),photos}]}]},{title:'Проверка V12'});
const expectMaster=(photos,master)=>{
  const result=assemble(photos);
  if(!result.pages.some(page=>page.master===master))fail(`${master} is missing`);
  return result;
};

expectMaster([photo('bleed','bleed-text',2800,1500)],'D01-BLEED-TEXT');
expectMaster([photo('stack-a','stacked-text'),photo('stack-b')],'D01-STACKED-TEXT');
expectMaster(Array.from({length:6},(_,index)=>photo(`mosaic-${index}`,index?'auto':'mosaic')),'D01-MOSAIC');
expectMaster([photo('band-a','quote-band-pair'),photo('band-b')],'D01-QUOTE-BAND-PHOTO');
expectMaster([photo('dark','dark-split')],'D01-DARK-SPLIT');
expectMaster([photo('overlay','photo-overlay-text',2400,1600)],'D01-PHOTO-OVERLAY-TEXT');
expectMaster([photo('bottom','text-top-photo',1800,1400)],'D01-TEXT-OVER-PHOTO');

const horizontal=expectMaster([photo('wide','spread',2800,1400)],'D01-PANORAMA');
const vertical=assemble([photo('vertical','spread',1400,2800)]);
if(vertical.spreads.some(spread=>spread.master==='D01-SPREAD-PANORAMA'))fail('Portrait image was used as a panorama');

const rhythm=assemble([
  photo('hero'),photo('triptych-a'),photo('triptych-b'),photo('triptych-c'),
  photo('duo-a'),photo('duo-b'),photo('wide-auto','auto',3000,1400)
]);
const heavy=new Set(['D01-SPREAD-PANORAMA','D01-SPREAD-BLEED-TEXT','D01-SPREAD-THREE-PHOTO','D01-SPREAD-TWO-PHOTO','D01-SPREAD-DUO','D01-SPREAD-MOSAIC','D01-SPREAD-QUOTE-BAND']);
for(let index=1;index<rhythm.spreads.length;index++){
  if(heavy.has(rhythm.spreads[index-1].master)&&heavy.has(rhythm.spreads[index].master))fail('Adjacent heavy photo spreads detected');
}

const renderContext={meta:{},image:(source,index)=>source?.photos?.[index]?.src||'',caption:()=>'',inferMeta:()=>({}),esc:value=>String(value)};
const darkHtml=renderer.renderPage({kind:'dark-text',layout:'dark-text',master:'D01-DARK-TEXT',source:{},text:prose(20),pullQuote:'Память остаётся.'},'left',renderContext);
if(!/dpk-dark-text/.test(darkHtml))fail('Dark text renderer is missing');

const shell=fs.readFileSync(path.join(root,'shell.html'),'utf8');
const sheet=fs.readFileSync(path.join(root,'sheet_v35.html'),'utf8');
const css=fs.readFileSync(path.join(root,'book-renderer','design-pack-01.css'),'utf8');
const proof=fs.readFileSync(path.join(root,'book-renderer','master-proof.html'),'utf8');
if(!/\['square',\s*'Квадратный',\s*'280×280'/.test(shell)||!/\['portrait',\s*'Вертикальный',\s*'280×335'/.test(shell))fail('Required formats are missing');
if(/\['(?:a4|book|landscape)'\s*,/.test(shell))fail('Removed formats are still selectable');
if(!/PDF_FORMAT_MM=\{square:\[280,280\],portrait:\[280,335\]\}/.test(shell))fail('Trim PDF sizes are incorrect');
if(!/design-thumbnail-bw\.png/.test(shell))fail('Black-and-white design thumbnail is missing');
if(!/rec\.revision=\(Number\(rec\.revision\)\|\|0\)\+1/.test(sheet)||!/OCHERKI_PHOTO_REPLACED/.test(sheet)||!/renderPhotos\(\)/.test(sheet))fail('Photo replacement refresh is incomplete');
if(!/eraDate:\s*String\(page\.eraDate/.test(sheet)||!/dateLabel:\s*String\(page\.eraDate/.test(sheet))fail('Date is not emitted to the Director');
if(!/column-fill:auto/.test(css)||!/dpk-era-mark/.test(css))fail('Text fill or date watermark CSS is missing');
if(!/SignThatS/.test(css)||!/repeating-linear-gradient/.test(css))fail('V10 ruled archival transcript style is missing');
['D01-SPREAD-BLEED-TEXT','D01-SPREAD-STACKED-TEXT','D01-SPREAD-MOSAIC','D01-SPREAD-DARK-SPLIT','D01-SPREAD-PHOTO-OVERLAY-TEXT','D01-SPREAD-TEXT-OVER-PHOTO','D01-SPREAD-QUOTE-BAND','D01-SPREAD-DATE-ERA','D01-SPREAD-DOCUMENT'].forEach(master=>{
  if(!proof.includes(master))fail(`${master} is missing from master proof`);
});

console.log(JSON.stringify({status:'pass',formats:['280×280','280×335'],horizontalPanorama:horizontal.pages.filter(page=>page.master==='D01-PANORAMA').length,newMasters:true,photoReplacementRefresh:true,masterProof:true},null,2));
