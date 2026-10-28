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
const proseFrom=(start,count)=>Array.from({length:count},(_,index)=>sentence(start+index)).join(' ');
const photo=(id,width=1800,height=1200)=>({id,src:`data:image/jpeg;base64,${id}`,caption:id,width,height,layoutPreference:'auto'});
const assemble=sections=>engine.assemble({sections}, {title:'Проверка потока', pageWords:{text:180,textHeading:120,textQuote:100,document:70,documentComment:70}});

const textSource=prose(320);
const textResult=assemble([{id:'chapter',type:'chapter',title:'Глава 1. Дом',included:true,pages:[
  {uid:'intro',type:'chapter',title:'Глава 1. Дом',episode:'Глава 1',isEpisodeStart:true,userEdited:true,text:proseFrom(1,20),photos:[]},
  {uid:'start',type:'chapter',title:'Глава 1. Дом',sectionTitle:'Новый эпизод',episode:'Эпизод 2',isEpisodeStart:true,userEdited:true,text:proseFrom(21,130),photos:[]},
  {uid:'continuation',type:'chapter',title:'Глава 1. Дом',episode:'Эпизод 2',userEdited:true,text:proseFrom(151,190),photos:[]}
]}]);
const renderedText=textResult.pages.flatMap(page=>[page.text,page.pullQuote,page.quote]).filter(Boolean).join(' ');
const renderedWords=renderedText.split(/\s+/).filter(Boolean);
if(renderedWords.length!==340*13)fail('Text flow changed the total word count');
for(let index=1;index<=340;index++)if(!renderedText.includes(`Запись ${index} `))fail(`Text token ${index} was lost`);
const heading=textResult.pages.find(page=>page.sectionTitle==='Новый эпизод');
if(!heading||heading.master!=='D01-TEXT-QUOTE'||heading.layout==='dark-text')fail('Episode start did not keep its light quote page');
const episodeContinuationResult=assemble([{id:'chapter',type:'chapter',title:'Глава 1. Дом',included:true,pages:[
  {uid:'intro',type:'chapter',title:'Глава 1. Дом',episode:'Эпизод 1',isEpisodeStart:true,userEdited:true,text:prose(20),photos:[]},
  {uid:'episode-start',type:'chapter',title:'Глава 1. Дом',sectionTitle:'Новый эпизод',episode:'Эпизод 2',isEpisodeStart:true,userEdited:true,text:proseFrom(21,9),photos:[]},
  {uid:'episode-continuation',type:'chapter',title:'Глава 1. Дом',episode:'Эпизод 2',userEdited:true,text:proseFrom(101,8),photos:[]}
]}],{pageWords:{text:180,textHeading:100,textQuote:100}});
const continuationHeading=episodeContinuationResult.pages.find(page=>page.sectionTitle==='Новый эпизод');
const continuationIndex=episodeContinuationResult.pages.indexOf(continuationHeading);
const episodeCompanion=episodeContinuationResult.pages[continuationIndex+1];
if(!episodeCompanion||!String(episodeCompanion.text||'').includes('Запись 101'))fail('Episode companion did not continue into the next unmarked text segment');
const unpunctuated=Array.from({length:260},(_,index)=>`слово${index+1}`).join(' ');
const wordFlowResult=assemble([{id:'chapter',type:'chapter',title:'Глава 1. Дом',included:true,pages:[
  {uid:'intro',type:'chapter',title:'Глава 1. Дом',episode:'Эпизод 1',isEpisodeStart:true,userEdited:true,text:prose(20),photos:[]},
  {uid:'word-flow',type:'chapter',title:'Глава 1. Дом',sectionTitle:'Новый эпизод',episode:'Эпизод 2',isEpisodeStart:true,userEdited:true,text:unpunctuated,photos:[]}
]}],{pageWords:{text:180,textHeading:80,textQuote:80}});
const wordFlowPages=wordFlowResult.pages.filter(page=>page.sourcePageUid==='word-flow'&&page.text);
if(!wordFlowPages.length||wordFlowPages.some(page=>String(page.text).trim().split(/\s+/).length>180))fail('Episode prose still waits for a full sentence and overflows the page capacity');
if(!wordFlowPages.map(page=>page.text).join(' ').includes('слово260'))fail('Word-level episode continuation lost its final word');
const episodeHtml=renderer.renderPage({layout:'prose-dense',sectionTitle:'Новый эпизод',showHeading:true,dropCap:true,pullQuote:'Важная строка памяти.',text:prose(24)},'left');
if(!/dpk-text-quote/.test(episodeHtml)||!/dpk-episode-pull/.test(episodeHtml)||!/dpk-reading/.test(episodeHtml))fail('Light episode page does not render heading quote and two-column text');
if(!/<div class="dpk-episode-pull">[\s\S]*<\/div><div class="dpk-columns dpk-reading">/.test(episodeHtml))fail('Episode quote is still inside the two-column flow');
if(/dpk-columns dpk-reading"><div class="dpk-episode-pull">/.test(episodeHtml))fail('Episode quote still shifts only one column');
const punctuationHtml=renderer.renderPage({layout:'prose-dense',text:'Выздоровел.Всё продолжилось.Кутузов.'},'left');
if(/выздоровел\.Всё|продолжилось\.Кутузов/.test(punctuationHtml))fail('Editorial punctuation still joins sentences without spaces');
if(!/выздоровел\. Всё|продолжилось\. Кутузов/.test(punctuationHtml))fail('Editorial punctuation spacing was not restored');

const shortTailResult=assemble([{id:'chapter',type:'chapter',title:'Глава 1. Дом',included:true,pages:[
  {uid:'single',type:'chapter',title:'Глава 1. Дом',episode:'Глава 1',isEpisodeStart:true,userEdited:true,text:prose(26),photos:[]}
]}]);
const ordinaryTextPages=shortTailResult.pages.filter(page=>page.master==='D01-TEXT'&&page.text);
if(ordinaryTextPages.length!==1)fail('A short ordinary-text tail was split onto an almost empty page');

const textOnlyResult=assemble([{id:'chapter',type:'chapter',title:'Глава 1. Дом',included:true,pages:[
  {uid:'only-text',type:'chapter',title:'Глава 1. Дом',episode:'Глава 1',isEpisodeStart:true,userEdited:true,text:prose(90),photos:[]}
]}]);
if(textOnlyResult.spreads.some(spread=>spread.single))fail('Text-only book contains a single-page preview instead of spreads');
if(textOnlyResult.spreads.some(spread=>spread.master==='D01-SPREAD-DARK-TEXT-PAIR'||spread.master==='D01-SPREAD-DARK-TEXT'))fail('Text-only book inserts an automatic dark text spread');

const onePhotoResult=engine.assemble({sections:[{id:'chapter',type:'chapter',title:'Глава 1. Дом',included:true,pages:[
  {uid:'before-photo',type:'chapter',title:'Глава 1. Дом',episode:'Глава 1',isEpisodeStart:true,userEdited:true,text:prose(12),photos:[]},
  {uid:'with-photo',type:'chapter',title:'Глава 1. Дом',episode:'Глава 1',userEdited:true,text:proseFrom(13,14),photos:[{id:'one-photo',src:'data:image/jpeg;base64,one-photo',width:1200,height:1800,layoutPreference:'photo-text'}]}
]}]},{title:'Проверка одной фотографии',pageWords:{chapter:100,text:180,textHeading:140,textQuote:120,photoText:180}});
const photoTextSpread=onePhotoResult.spreads.find(spread=>spread.master==='D01-SPREAD-PHOTO-TEXT');
if(!photoTextSpread||!photoTextSpread.left?.text&&!photoTextSpread.right?.text)fail('One-photo spread lost its text companion');
const photoCopy=photoTextSpread.left?.master==='D01-PHOTO-TEXT'?photoTextSpread.left:photoTextSpread.right;
if(!photoCopy.text.includes('Запись 13'))fail('Text after a short pre-photo tail was not continued into the photo companion');

const documentText=prose(260);
const documentResult=assemble([{id:'chapter',type:'chapter',title:'Глава 1. Дом',included:true,pages:[
  {uid:'doc',type:'document',bookRole:'document',title:'Длинная расшифровка',text:documentText,explanation:'',photos:[]}
]}]);
const documentPages=documentResult.pages.filter(page=>page.master==='D01-DOCUMENT'&&!(page.source?.photos||[]).length);
if(documentPages.length<2)fail('Long document did not paginate');
const restored=documentPages.map(page=>page.text||'').join(' ');
for(let index=1;index<=260;index++)if(!restored.includes(sentence(index)))fail(`Document sentence ${index} was lost`);

const css=fs.readFileSync(path.join(root,'book-renderer','design-pack-01.css'),'utf8');
const rendererSource=fs.readFileSync(path.join(root,'book-renderer','design-pack-01.js'),'utf8');
const shell=fs.readFileSync(path.join(root,'shell.html'),'utf8');
if(!/max-height:none!important;height:calc\(var\(--book-page-h,1000px\) - 270px\)/.test(css))fail('Document text height is not fixed to the real transcript field');
if(!/dpk-document-transcript p[\s\S]*overflow:visible!important/.test(css))fail('Document transcript still hides text overflow');
if(!/firstNeedsInlineQuote/.test(fs.readFileSync(path.join(root,'book-renderer','book-engine.js'),'utf8')))fail('Inline quote capacity is not reserved before pagination');
if(!/!next\?\.autoQuote/.test(fs.readFileSync(path.join(root,'book-renderer','book-engine.js'),'utf8')))fail('Automatic standalone dark quote rhythm is not gated');
if(!/wordCount\(currentSegment\(chapter\)\?\.remaining\)>=pageWords\(meta,'darkText'\)\*2/.test(fs.readFileSync(path.join(root,'book-renderer','book-engine.js'),'utf8')))fail('Dark text pair can consume the next episode start');
if(/const splitAt = Math\.max\(18, Math\.floor\(words\.length \* 0\.34\)\)/.test(rendererSource))fail('Chapter text is still split into an artificial paragraph');
if(!/dpk-chapter-text \.dpk-chapter-copy[\s\S]*column-fill:balance/.test(css))fail('Chapter columns are not balanced');
if(!/dpk-text \.dpk-midpoint,\s*body \.dpk-page\.dpk-text-quote \.dpk-midpoint\{display:none!important/.test(css))fail('Internal random quote is not disabled for ordinary prose');
if(!/dpk-text-quote\.dpk-section-start \.dpk-reading\{[\s\S]*height:calc\(var\(--book-page-h,1000px\) - 300px\)/.test(css))fail('Episode opening reading field does not reserve the bottom folio area');
const engineSource=fs.readFileSync(path.join(root,'book-renderer','book-engine.js'),'utf8');
if(!/const inlineQuoteCandidate=\(\!firstHasHeading/.test(engineSource)||!/fixed row above the columns/.test(engineSource))fail('Ordinary prose is not using the fixed quote placement');
if(!/\.dpk-reading,.dpk-chapter-copy,.dpk-document-transcript p/.test(shell))fail('DOM QA does not inspect editorial text flow');

console.log(JSON.stringify({status:'pass',textSentences:320,documentSentences:260,headingCapacity:true,documentFlowVisible:true},null,2));
