import { chromium } from 'playwright';

const URL='https://jobs.smartrecruiters.com/IndigoBooksMusic/744000133131949-assistant-designer-graphics-packaging-6-months-contract-';

(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1700}});
  page.setDefaultTimeout(30000);
  const res=await page.goto(URL,{waitUntil:'domcontentloaded',timeout:60000});
  await page.waitForTimeout(2500);
  console.log('HTTP_STATUS='+(res&&res.status()));
  console.log('FINAL_URL='+page.url());
  console.log('TITLE='+await page.title());
  const body=(await page.locator('body').innerText()).replace(/\s+/g,' ');
  console.log('BODY='+body.slice(0,5000));
  const applyButtons=page.getByRole('button',{name:/apply/i});
  const applyLinks=page.getByRole('link',{name:/apply/i});
  console.log('APPLY_BUTTONS='+await applyButtons.count());
  console.log('APPLY_LINKS='+await applyLinks.count());
  if(await applyButtons.count()) await applyButtons.first().click();
  else if(await applyLinks.count()) await applyLinks.first().click();
  await page.waitForTimeout(1800);
  console.log('AFTER_APPLY_URL='+page.url());
  console.log('AFTER_APPLY_BODY='+(await page.locator('body').innerText()).replace(/\s+/g,' ').slice(0,6500));
  const fields=await page.locator('input,textarea,select').evaluateAll(els=>els.map((e,i)=>({i,tag:e.tagName,id:e.id,name:e.getAttribute('name'),type:e.getAttribute('type'),placeholder:e.getAttribute('placeholder'),aria:e.getAttribute('aria-label'),required:e.required,value:e.value||null})).filter(x=>x.id||x.name||x.placeholder||x.aria));
  console.log('FIELDS='+JSON.stringify(fields));
  const buttons=await page.getByRole('button').allTextContents();
  console.log('BUTTONS='+JSON.stringify(buttons.map(x=>x.trim()).filter(Boolean)));
  const labels=await page.locator('label').allTextContents();
  console.log('LABELS='+JSON.stringify(labels.map(x=>x.trim().replace(/\s+/g,' ')).filter(Boolean)));
  await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
