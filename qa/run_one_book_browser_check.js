const {chromium}=require('playwright');
(async()=>{
  const browser=await chromium.launch({headless:true});
  const page=await browser.newPage({viewport:{width:1280,height:900}});
  await page.goto('http://127.0.0.1:4174/qa/one-book-system-browser-check.html',{waitUntil:'networkidle'});
  await page.waitForFunction(()=>window.__ONE_BOOK_QA?.status!=='running',{timeout:120000});
  const result=await page.evaluate(()=>window.__ONE_BOOK_QA);
  await page.screenshot({path:'qa/one-book-system-browser-check.png',fullPage:true});
  console.log(JSON.stringify(result,null,2));
  await browser.close();
  if(result.status!=='pass')process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
