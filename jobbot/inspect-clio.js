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
  }).map(e=>({
    text:(e.innerText||e.textContent||'').trim().replace(/\s+/g,' '),
    aid:e.getAttribute('data-automation-id'),
    label:e.getAttribute('data-automation-label'),
    ariaSelected:e.getAttribute('aria-selected')
  })).filter(x=>x.text));
  console.log(label+'='+JSON.stringify(opts));
}

(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1400}});
  page.setDefaultTimeout(30000);
  await openApplication(page);

  const source=page.locator('#source--source');
  await source.click({force:true});
  await page.waitForTimeout(350);
  await dumpVisibleOptions(page,'SOURCE_LEVEL1');

  const jobSites=page.getByRole('option',{name:'Job Sites',exact:true}).last();
  await jobSites.click({force:true});
  await page.waitForTimeout(600);
  await dumpVisibleOptions(page,'SOURCE_AFTER_JOB_SITES');
  console.log('SOURCE_FIELD_BODY='+(await page.locator('[data-automation-id="formField-source"]').innerText()).replace(/\s+/g,' '));

  const sourceHtml=await page.locator('[data-automation-id="formField-source"]').evaluate(e=>e.outerHTML.slice(0,12000));
  console.log('SOURCE_HTML='+sourceHtml.replace(/\s+/g,' '));

  await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
