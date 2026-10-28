const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.resolve(__dirname,'..');
const context={window:{}};vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(root,'book-renderer','book-engine.js'),'utf8'),context);
vm.runInContext(fs.readFileSync(path.join(root,'book-renderer','design-pack-01.js'),'utf8'),context);
const engine=context.window.OcherkiBookEngine;
const renderer=context.window.OcherkiBookRenderer;
const fail=message=>{throw new Error(message)};
const sentence=index=>`Семейная запись номер ${index} сохраняет важную подробность времени, места и человеческого голоса для следующих поколений.`;
const prose=count=>Array.from({length:count},(_,index)=>sentence(index+1)).join(' ');
const documentText=prose(145);
const photo=(id,preference='auto',width=1200,height=1600)=>({src:`data:image/jpeg;base64,${id}`,caption:id,layoutPreference:preference,width,height});

const structure={sections:[
  {id:'chapter',type:'chapter',title:'Глава 1. Дом',included:true,pages:[
    {uid:'p1',title:'Глава 1. Дом',episode:'Эпизод 1. Начало',isEpisodeStart:true,userEdited:true,text:prose(75),photos:[photo('DUO_A'),photo('DUO_B')]},
    {uid:'p2',title:'Глава 1. Дом',sectionTitle:'Переезд',episode:'Эпизод 2. Переезд',isEpisodeStart:true,userEdited:true,eraDate:'1987—1992',text:prose(70),photos:[photo('SIDE','photo-side-text')]},
    {uid:'doc',type:'document',bookRole:'document',title:'Длинная расшифровка',text:documentText,explanation:prose(45),photos:[]}
  ]}
]};

const result=engine.assemble(structure,{title:'Проверка V11'});
if(!result.ready)fail(result.message||'Assembly failed');
if(!result.pages.some(page=>page.master==='D01-TWO-PHOTO'))fail('Director did not use two photos on one sheet');
if(!result.pages.some(page=>page.master==='D01-PHOTO-SIDE-TEXT'))fail('Photo-left/text-right master is missing');
if(!result.pages.some(page=>page.master==='D01-DATE-ERA'&&page.dateLabel==='1987—1992'))fail('Date/era master is missing');
const documentPages=result.pages.filter(page=>page.master==='D01-DOCUMENT'&&!page.source?.photos?.length);
if(documentPages.length<2)fail('Long document did not continue to another page');
const restored=documentPages.map(page=>page.text).join(' ');
for(let index=1;index<=145;index++)if(!restored.includes(sentence(index)))fail(`Document sentence ${index} was lost`);
const sideHtml=renderer.renderPage(result.pages.find(page=>page.master==='D01-PHOTO-SIDE-TEXT'),'left',{image:(source,index)=>source?.photos?.[index]?.src||'',caption:()=>'',meta:{},esc:value=>String(value)});
if(!/dpk-side-photo/.test(sideHtml)||!/dpk-side-copy/.test(sideHtml))fail('Side master renderer is incomplete');
const css=fs.readFileSync(path.join(root,'book-renderer','design-pack-01.css'),'utf8');
if(/dpk-fill-relaxed/.test(css))fail('Short pages still change the body font size');
if(!/--dpk-body-size:13\.5px/.test(css)||!/dpk-photo-side-text/.test(css)||!/dpk-date-era/.test(css))fail('Unified typography or new master CSS is missing');
const shell=fs.readFileSync(path.join(root,'shell.html'),'utf8');
if(!/data-pdf-mode="pages"/.test(shell)||!/data-pdf-mode="spreads"/.test(shell)||!/standalonePrintHtmlForMode/.test(shell)||!/sheetWidth=spreadMode\?size\[0\]\*2:size\[0\]/.test(shell))fail('Page/spread PDF export is incomplete');
if(!/\.book-preview-modal\.is-preparing/.test(shell))fail('Preview first-frame stabilization is missing');

console.log(JSON.stringify({status:'pass',documentPages:documentPages.length,duo:true,photoSideText:true,dateEra:true,pdfModes:['pages','spreads']},null,2));
