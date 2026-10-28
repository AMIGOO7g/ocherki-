const fs=require('fs'),path=require('path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const renderer=read('book-renderer/design-pack-01.js');
const css=read('book-renderer/design-pack-01.css');
const layout=read('book-renderer/layout-pagination-engine.js');
const shell=read('shell.html');
const index=read('index.html');

assert(renderer.includes('if(words.length<3)continue'),'automatic handwriting still accepts fewer than three words');
assert(!renderer.includes("[3,5,2,1]")&&!renderer.includes("Math.min(3,words.length),1"),'one-word handwriting candidate still exists');
assert(renderer.includes('if(requestedWords.length<3)return []'),'manual handwriting minimum is missing');
assert(renderer.includes('const first=words[0],last=words[2]'),'automatic fallback is not three words');
assert(layout.includes("error.kind==='important'?3:1"),'important retry can shrink below three words');
assert(/dpk-inline-handwritten[\s\S]*?color:#000!important/.test(css),'handwriting is not black');

assert(renderer.includes("chooseAccent(copy,String(source??''),automatic?'':String(page.inlineQuote||''),2)"),'manual quote is not measured against two lines');
assert(renderer.includes("selected.lines>2")&&renderer.includes('Цитата не помещается в две строки'),'quote overflow is not rejected');
assert(/dpk-inline-quote,[\s\S]*?max-height:62\.4px!important/.test(css)&&/overflow:hidden!important/.test(css),'quote editor is not physically bounded');

assert(/font:400 30px\/32px 'SignThatS'/.test(css),'margin note was not enlarged');
assert(/dpk-margin-note span\{[\s\S]*?overflow:hidden!important/.test(css),'margin note can escape its two-line box');
assert(renderer.includes('noteLeading=32')&&renderer.includes('noteMaxLines=2'),'margin measurement does not match the larger font');
assert(shell.includes('previewAccentFits')&&shell.includes("['margin','inline-quote']")&&shell.includes('editorialLastValidText'),'live edit limit is not connected');

assert(/@media\(max-width:1280px\)[\s\S]*?\.shell\.is-open \.book-design-shell\{[\s\S]*?display:flex!important/.test(shell),'mobile constructor controls remain hidden');
assert(index.includes("document.addEventListener('visibilitychange'")&&index.includes('pendingHiddenTrackAdvance'),'background-tab audio guard is missing');
assert(index.includes('stopVinyl();\n            await next.play()'),'vinyl does not stop before the next track');
assert(index.includes('if(document.hidden){\n          pendingHiddenTrackAdvance=true;'),'hidden ended-track path still starts vinyl');

console.log(JSON.stringify({status:'pass',handwritingMinWords:3,handwritingColor:'black',marginLines:2,quoteLines:2,mobileControls:true,backgroundVinyl:false}));
