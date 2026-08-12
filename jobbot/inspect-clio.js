import { chromium } from 'playwright';

const URL = 'https://clio.wd3.myworkdayjobs.com/en-US/ClioCareerSite/job/Graphic-Designer--5-Month-Contract-_REQ-5082';

async function openApplication(page) {
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  const apply = page.locator('[data-automation-id="adventureButton"]');
  await apply.waitFor({state:'visible', timeout:30000});
  console.log('JOB='+(await page.locator('[data-automation-id="jobPostingHeader"]').innerText()).trim());
  console.log('POSTED='+(await page.locator('[data-automation-id="postedOn"]').innerText()).replace(/\s+/g,' ').trim());
  await apply.click();
  const manual=page.getByRole('button',{name:/apply manually/i});
  await manual.waitFor({state:'visible',timeout:15000});
  await manual.click();
  await page.locator('#name--legalName--firstName').waitFor({state:'visible',timeout:30000});
}
async function exactOption(page,text){
  const escaped=text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const item=page.locator('[role="option"]').filter({hasText:new RegExp(`^${escaped}$`)}).last();
  await item.waitFor({state:'visible',timeout:12000});
  return item;
}
async function clickPromptItem(page,text){
  const item=await exactOption(page,text); const prompt=item.locator('[data-automation-id="promptOption"]');
  if(await prompt.count()) await prompt.click({force:true}); else await item.click({force:true});
  await page.waitForTimeout(350);
}
async function chooseButton(page,parentAid,text){
  const b=page.locator(`[data-automation-id="${parentAid}"] button`).first(); await b.click({force:true}); await page.waitForTimeout(250); await clickPromptItem(page,text); await page.waitForTimeout(250);
}
async function fillCore(page){
  const source=page.locator('#source--source'); await source.click({force:true}); await clickPromptItem(page,'Job Sites'); await clickPromptItem(page,'Other'); await source.press('Escape').catch(()=>{}); await page.locator('#name--legalName--firstName').click({force:true});
  await chooseButton(page,'formField-country','Canada');
  await page.locator('#name--legalName--firstName').fill('Prerna');
  await page.locator('#name--legalName--lastName').fill('Sharma');
  await page.locator('#address--city').fill('Toronto');
  await chooseButton(page,'formField-countryRegion','Ontario');
  await page.locator('#emailAddress--emailAddress').fill('Visualartist.prerna@gmail.com');
}
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true}); const page=await browser.newPage({viewport:{width:1440,height:1600}}); page.setDefaultTimeout(30000); await openApplication(page); await fillCore(page);
 const b=page.locator('#phoneNumber--phoneType'); await b.click({force:true}); await page.waitForTimeout(500);
 const opts=await page.locator('[role="option"]').evaluateAll(els=>els.filter(e=>{const r=e.getBoundingClientRect();return r.width>0&&r.height>0;}).map(e=>({text:(e.innerText||e.textContent||'').trim().replace(/\s+/g,' '),aria:e.getAttribute('aria-label')})).filter(x=>x.text));
 console.log('PHONE_TYPE_OPTIONS='+JSON.stringify(opts));
 await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
