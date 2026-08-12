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
  const html=await jobItem.evaluate(e=>e.outerHTML);
  console.log('JOB_SITES_HTML='+html.replace(/\s+/g,' '));

  const descendants=await jobItem.locator('*').evaluateAll(els=>els.map((e,i)=>({i,tag:e.tagName,role:e.getAttribute('role'),aid:e.getAttribute('data-automation-id'),aria:e.getAttribute('aria-label'),label:e.getAttribute('data-automation-label'),tab:e.getAttribute('tabindex'),text:(e.innerText||e.textContent||'').trim().replace(/\s+/g,' ').slice(0,180)})).filter(x=>x.role||x.aid||x.aria||x.label));
  console.log('JOB_SITES_DESC='+JSON.stringify(descendants));

  // Try the most specific nested interactive element, if Workday provides one.
  const nestedButtons=jobItem.locator('button, [data-automation-id="promptOption"]');
  console.log('NESTED_COUNT='+await nestedButtons.count());
  for(let i=0;i<await nestedButtons.count();i++){
    console.log(`NESTED_${i}=`+JSON.stringify(await nestedButtons.nth(i).evaluate(e=>({tag:e.tagName,aid:e.getAttribute('data-automation-id'),aria:e.getAttribute('aria-label'),text:(e.innerText||e.textContent||'').trim().replace(/\s+/g,' ')}))));
  }

  await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
