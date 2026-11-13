// v145: «+ Лист» from «Рукопись» makes a writing sheet even when the chapter ends with an «Архивный документ»,
// and long text typed on it flows on to new sheets instead of disappearing under the bottom edge.
const { chromium } = require('playwright');
(async()=>{const port=process.argv[2]||8849;const b=await chromium.launch();const p=await b.newPage({viewport:{width:1600,height:900}});const errs=[];p.on('pageerror',e=>errs.push(e.message));
  let fail='';
  try{
    await p.goto('http://127.0.0.1:'+port+'/shell.html?v='+Date.now(),{waitUntil:'domcontentloaded'});await p.waitForTimeout(1200);
    await p.evaluate(()=>window.postMessage({type:'OCHERKI_BOOT_START'},'*'));await p.waitForTimeout(8000);
    const f=p.frame({url:/sheet_v35/});
    const si=await f.evaluate(()=>{const i=sections.findIndex(s=>s.id==='chapter-1');activeSection=i;sections[i].active=0;render();addDocumentPage();return i;});
    await p.waitForTimeout(1200);
    await p.evaluate(()=>document.getElementById('v35SheetFrame').contentWindow.postMessage({type:'OCHERKI_STRUCTURE_COMMAND',action:'addPageAt',sectionId:'chapter-1'},'*'));
    await p.waitForTimeout(1500);
    const t=await f.evaluate(()=>currentPage().type);if(t==='document')fail='«+ Лист» made another document page';
    await f.click('#editor',{force:true});
    const para='Это было давно, в небольшом городе у реки, где каждое утро пахло хлебом и дымом. '.repeat(6);
    for(let k=0;k<6;k++){await p.keyboard.type(para,{delay:0});await p.keyboard.press('Enter');await p.waitForTimeout(400);}
    await p.waitForTimeout(2000);
    const r=await f.evaluate(i=>({n:sections[i].pages.length,ov:editorContentOverflows()}),si);
    if(!fail&&r.ov)fail='text runs under the bottom of the sheet';
    if(!fail&&r.n<3)fail='long text did not flow on to new sheets ('+r.n+')';
  }catch(e){fail=String(e.message||e);}
  if(errs.length&&!fail)fail='page error: '+errs[0];
  await b.close();
  if(fail){console.error('FAIL',fail);process.exit(1);}console.log('ok');})();
