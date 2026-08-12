import { chromium } from 'playwright';

const URL='https://jobs.smartrecruiters.com/IndigoBooksMusic/744000133132049-junior-designer-paper-and-packaging';

(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1700}});
  page.setDefaultTimeout(30000);
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForTimeout(1500);
  const body=(await page.locator('body').innerText()).replace(/\s+/g,' ');
  if(/job has expired/i.test(body)) throw new Error('Job expired');
  console.log('LIVE_TITLE='+await page.title());

  const interest=page.getByRole('link',{name:"I'm interested",exact:true}).first();
  await interest.waitFor({state:'visible',timeout:15000});
  const href=await interest.getAttribute('href');
  console.log('APPLY_HREF='+href);
  await interest.click();
  await page.waitForTimeout(2500);
  console.log('APPLICATION_URL='+page.url());
  console.log('APPLICATION_BODY='+(await page.locator('body').innerText()).replace(/\s+/g,' ').slice(0,8500));
  const fields=await page.locator('input,textarea,select').evaluateAll(els=>els.map((e,i)=>({i,tag:e.tagName,id:e.id,name:e.name,type:e.type,placeholder:e.placeholder,aria:e.getAttribute('aria-label'),required:e.required,value:e.value||null})).filter(x=>x.id||x.name||x.placeholder||x.aria));
  console.log('FIELDS='+JSON.stringify(fields));
  const labels=await page.locator('label').evaluateAll(els=>els.map((e,i)=>({i,text:(e.innerText||e.textContent||'').trim().replace(/\s+/g,' '),forAttr:e.htmlFor})).filter(x=>x.text));
  console.log('LABELS='+JSON.stringify(labels));
  console.log('BUTTONS='+JSON.stringify((await page.getByRole('button').allTextContents()).map(x=>x.trim()).filter(Boolean)));
  console.log('LINKS='+JSON.stringify((await page.getByRole('link').allTextContents()).map(x=>x.trim()).filter(Boolean)));
  await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
