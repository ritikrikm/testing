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

async function menuItem(page,text){
  const item=page.locator('[role="option"]').filter({hasText:new RegExp(`^${text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}$`)}).last();
  await item.waitFor({state:'visible',timeout:12000});
  return item;
}

async function clickPromptItem(page,text){
  const item=await menuItem(page,text);
  const prompt=item.locator('[data-automation-id="promptOption"]');
  if(await prompt.count()) await prompt.click({force:true}); else await item.click({force:true});
  await page.waitForTimeout(450);
}

async function chooseButtonPrompt(page,parentAid,text){
  const button=page.locator(`[data-automation-id="${parentAid}"] button`).first();
  await button.click({force:true});
  await page.waitForTimeout(350);
  await clickPromptItem(page,text);
  await page.waitForTimeout(350);
  console.log(`${parentAid}=${(await button.innerText()).trim()}`);
}

(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1500}});
  page.setDefaultTimeout(30000);
  await openApplication(page);

  // Required source: Job Sites -> Other.
  const source=page.locator('#source--source');
  await source.click({force:true});
  await page.waitForTimeout(300);
  await clickPromptItem(page,'Job Sites');
  await clickPromptItem(page,'Other');
  await source.press('Escape').catch(()=>{});
  await page.locator('#name--legalName--firstName').click({force:true});
  await page.waitForTimeout(350);
  console.log('SOURCE='+(await page.locator('[data-automation-id="formField-source"]').innerText()).replace(/\s+/g,' '));

  await chooseButtonPrompt(page,'formField-country','Canada');
  await page.locator('#name--legalName--firstName').fill('Prerna');
  await page.locator('#name--legalName--lastName').fill('Sharma');
  await page.locator('#address--city').fill('Toronto');
  await chooseButtonPrompt(page,'formField-countryRegion','Ontario');
  await page.locator('#emailAddress--emailAddress').fill('Visualartist.prerna@gmail.com');
  await page.waitForTimeout(1000);

  const phoneFields=await page.locator('[data-automation-id*="phone" i], [id*="phone" i]').evaluateAll(els=>els.map((e,i)=>({i,tag:e.tagName,id:e.id,aid:e.getAttribute('data-automation-id'),role:e.getAttribute('role'),type:e.getAttribute('type'),placeholder:e.getAttribute('placeholder'),aria:e.getAttribute('aria-label'),text:(e.innerText||e.textContent||'').trim().replace(/\s+/g,' ').slice(0,220),value:e.value||null})).filter(x=>x.id||x.aid||x.text));
  console.log('PHONE_FIELDS='+JSON.stringify(phoneFields));

  // Inspect phone device choices and country phone choices, then fill if identifiable.
  const phoneSectionText=(await page.locator('body').innerText()).replace(/\s+/g,' ');
  console.log('STEP1_HEAD='+phoneSectionText.slice(0,3000));
  const allButtons=await page.getByRole('button').evaluateAll(bs=>bs.map((b,i)=>({i,text:(b.innerText||b.textContent||'').trim().replace(/\s+/g,' '),aid:b.getAttribute('data-automation-id'),aria:b.getAttribute('aria-label')})).filter(x=>x.text||x.aria));
  console.log('BUTTONS='+JSON.stringify(allButtons));

  await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
