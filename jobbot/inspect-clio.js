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

async function dumpVisibleOptions(page,label){
  const opts=await page.locator('[role="option"]').evaluateAll(els=>els.filter(e=>{
    const r=e.getBoundingClientRect(); const s=getComputedStyle(e); return r.width>0&&r.height>0&&s.display!=='none'&&s.visibility!=='hidden';
  }).map(e=>({text:(e.innerText||e.textContent||'').trim().replace(/\s+/g,' '),ariaSelected:e.getAttribute('aria-selected')})).filter(x=>x.text));
  console.log(label+'='+JSON.stringify(opts));
}

(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1400}});
  page.setDefaultTimeout(30000);
  await openApplication(page);

  const source=page.locator('#source--source');
  await source.click({force:true});
  await source.fill('Job Sites');
  await page.waitForTimeout(650);
  await dumpVisibleOptions(page,'SOURCE_FILTERED');
  await source.press('ArrowDown');
  await source.press('Enter');
  await page.waitForTimeout(800);

  console.log('SOURCE_VALUE='+(await source.inputValue()));
  console.log('SOURCE_BODY='+(await page.locator('[data-automation-id="formField-source"]').innerText()).replace(/\s+/g,' '));
  await dumpVisibleOptions(page,'SOURCE_AFTER_ENTER');
  console.log('SELECTED_ITEMS='+JSON.stringify(await page.locator('[data-automation-id="selectedItem"], [data-automation-id="multiSelectPill"]').allTextContents().catch(()=>[])));

  await source.press('Escape').catch(()=>{});
  await page.locator('#name--legalName--firstName').focus();
  await page.waitForTimeout(400);
  console.log('SOURCE_AFTER_CLOSE='+(await page.locator('[data-automation-id="formField-source"]').innerText()).replace(/\s+/g,' '));

  await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
