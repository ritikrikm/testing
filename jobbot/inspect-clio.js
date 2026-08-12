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

async function visibleOptions(page){
  return await page.locator('[role="option"]').evaluateAll(els=>els.filter(e=>{const r=e.getBoundingClientRect();const s=getComputedStyle(e);return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden';}).map(e=>({text:(e.innerText||e.textContent||'').trim().replace(/\s+/g,' '),label:e.getAttribute('aria-label'),selected:e.getAttribute('aria-selected')})).filter(x=>x.text));
}

(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1400}});
  page.setDefaultTimeout(30000);
  await openApplication(page);

  const source=page.locator('#source--source');
  await source.click({force:true});
  await page.waitForTimeout(350);

  const jobItem=page.locator('[role="option"]').filter({hasText:/^Job Sites$/}).last();
  await jobItem.waitFor({state:'visible',timeout:10000});
  const prompt=jobItem.locator('[data-automation-id="promptOption"]');
  await prompt.click({force:true});
  await page.waitForTimeout(700);

  console.log('AFTER_PROMPT_OPTIONS='+JSON.stringify(await visibleOptions(page)));
  console.log('SOURCE_BODY='+(await page.locator('[data-automation-id="formField-source"]').innerText()).replace(/\s+/g,' '));

  const back=page.locator('[data-automation-id="promptBackButton"], [data-automation-id="promptNavBackButton"]');
  console.log('BACK_COUNT='+await back.count());
  const allText=(await page.locator('body').innerText()).replace(/\s+/g,' ');
  console.log('BODY_SNIP='+allText.slice(0,2600));

  await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
