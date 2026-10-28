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
const sentence=index=>`Запись ${index} сохраняет место, время и важную подробность семейной истории.`;
const prose=count=>Array.from({length:count},(_,index)=>sentence(index+1)).join(' ');

const structure={sections:[{id:'chapter',type:'chapter',title:'Глава 1. Дом',included:true,pages:[{
  uid:'dated-page',type:'chapter',title:'Глава 1. Дом',episode:'Глава 1',included:true,userEdited:true,
  text:`1987 ${prose(150)}`,
  // This is the shape produced by the editor, including older saved date blocks.
  eraDate:'1987',blocks:[{type:'date',content:'1987'}],photos:[]
}]}]};
const result=engine.assemble(structure,{title:'Проверка даты'});
if(result.spreads.some(spread=>spread.master==='D01-SPREAD-DATE-ERA'))fail('Editor date block still creates a date-era spread');
const opening=result.pages.find(page=>page.master==='D01-CHAPTER-TEXT');
if(!opening||opening.dateWatermark!=='1987')fail('Editor date block was not carried as a watermark');
if((result.pages.map(page=>page.text||'').join(' ')).includes('1987'))fail('Watermark date leaked into prose text');

const html=renderer.renderPage(opening,'left',{meta:{},image:()=>'',caption:()=>'',inferMeta:source=>source.inferred||{},esc:value=>String(value)});
if(/dpk-date-watermark/.test(html))fail('Watermark is visible on the chapter-opening page');
if(!/<div class="dpk-columns dpk-chapter-copy">/.test(html))fail('Date watermark changed the chapter text grid');
const continuation=result.pages.find(page=>page.master==='D01-TEXT');
const continuationHtml=renderer.renderPage(continuation,'left',{meta:{},image:()=>'',caption:()=>'',inferMeta:source=>source.inferred||{},esc:value=>String(value)});
if(!/<div class="dpk-date-watermark"[^>]*>1987<\/div>/.test(continuationHtml))fail('Watermark is missing from a subsequent text page');

const rendererSource=fs.readFileSync(path.join(root,'book-renderer','design-pack-01.js'),'utf8');
const css=fs.readFileSync(path.join(root,'book-renderer','design-pack-01.css'),'utf8');
const sheet=fs.readFileSync(path.join(root,'sheet_v35.html'),'utf8');
if(!/dateMode='watermark'/.test(sheet)||!/dateWatermark=content/.test(sheet))fail('Editor does not mark dates as watermark decorations');
if(!/addDate\(page,content\).*mode:'watermark'/.test(sheet))fail('Date block mode is not persisted');
if(!/position:absolute!important;left:50%[^;]*!important;top:51%/.test(css))fail('Watermark is not absolutely positioned outside the flow');
if(/dpk-date-watermark[^{}]*\{[^}]*rotate\(-90deg\)/.test(css))fail('Watermark is still rotated vertically');
if(!/dateWatermarkValue && role !== 'date-era'/.test(rendererSource))fail('Legacy date-era and watermark modes are not separated');

console.log(JSON.stringify({status:'pass',dateEraSpreads:0,watermark:'1987',textGrid:'unchanged'},null,2));
