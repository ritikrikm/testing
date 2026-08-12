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

async function visibleChoices(page, label) {
  await page.waitForTimeout(500);
  const choices=await page.locator('[role="option"], [data-automation-id="promptOption"], [data-automation-id="promptOptionText"]').evaluateAll(els=>els.filter(e=>{
    const s=getComputedStyle(e); const r=e.getBoundingClientRect(); return s.visibility!=='hidden'&&s.display!=='none'&&r.width>0&&r.height>0;
  }).map(e=>({tag:e.tagName,role:e.getAttribute('role'),aid:e.getAttribute('data-automation-id'),text:(e.innerText||e.textContent||'').trim().replace(/\s+/g,' ')})).filter(x=>x.text));
  console.log(label+'='+JSON.stringify(choices.slice(0,150)));
}

(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1400}});
  page.setDefaultTimeout(30000);
  await openApplication(page);

  console.log('STEP1_BODY='+(await page.locator('body').innerText()).replace(/\s+/g,' ').slice(0,2500));

  // Source multi-select.
  const source=page.locator('#source--source');
  await source.click();
  await visibleChoices(page,'SOURCE_CHOICES');
  await source.fill('Job');
  await visibleChoices(page,'SOURCE_FILTERED_CHOICES');
  await page.keyboard.press('Escape');

  // Country dropdown.
  const country=page.locator('[data-automation-id="formField-country"] button');
  await country.click();
  await visibleChoices(page,'COUNTRY_CHOICES');
  const canada=page.getByText('Canada',{exact:true}).last();
  console.log('CANADA_VISIBLE='+(await canada.isVisible().catch(()=>false)));
  if(await canada.isVisible().catch(()=>false)) await canada.click(); else await page.keyboard.press('Escape');

  await page.waitForTimeout(700);
  const state=page.locator('[data-automation-id="formField-countryRegion"] button');
  if(await state.count()){
    await state.click();
    await visibleChoices(page,'STATE_CHOICES');
    await page.keyboard.press('Escape');
  }

  console.log('AFTER_COUNTRY_BODY='+(await page.locator('body').innerText()).replace(/\s+/g,' ').slice(0,3000));
  const inputs=await page.locator('input').evaluateAll(els=>els.map(e=>({id:e.id,name:e.name,type:e.type,placeholder:e.placeholder,value:e.value})).filter(x=>x.id||x.name));
  console.log('INPUTS='+JSON.stringify(inputs));
  await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
