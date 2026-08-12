import { chromium } from 'playwright';

const URL = 'https://clio.wd3.myworkdayjobs.com/en-US/ClioCareerSite/job/Graphic-Designer--5-Month-Contract-_REQ-5082';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
  page.setDefaultTimeout(20000);
  const res = await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3500);
  console.log('HTTP_STATUS=' + (res && res.status()));
  console.log('TITLE=' + await page.title());
  console.log('FINAL_URL=' + page.url());
  console.log('BODY_HEAD=' + (await page.locator('body').innerText()).replace(/\s+/g,' ').slice(0,1200));

  const apply = page.getByRole('button', { name: /^apply$/i });
  if (await apply.count()) {
    await apply.first().click();
    await page.waitForTimeout(1500);
  }
  const manual = page.getByRole('button', { name: /apply manually/i });
  console.log('APPLY_MANUALLY_COUNT=' + await manual.count());
  if (await manual.count()) {
    await manual.first().click();
    await page.waitForTimeout(3000);
  }

  console.log('AFTER_MANUAL_URL=' + page.url());
  console.log('AFTER_MANUAL_BODY=' + (await page.locator('body').innerText()).replace(/\s+/g,' ').slice(0,3200));
  const fields = await page.locator('input, textarea, select').evaluateAll(els => els.map((el,i)=>({
    i, tag:el.tagName, type:el.type, name:el.name, id:el.id, placeholder:el.placeholder,
    required:el.required, aria:el.getAttribute('aria-label'), autocomplete:el.getAttribute('autocomplete')
  })));
  console.log('FIELDS_JSON=' + JSON.stringify(fields));
  const buttons = await page.getByRole('button').allTextContents();
  console.log('BUTTONS_JSON=' + JSON.stringify(buttons.map(x=>x.trim()).filter(Boolean)));
  const labels = await page.locator('label').evaluateAll(els=>els.map((el,i)=>({i,text:(el.innerText||el.textContent||'').trim().replace(/\s+/g,' '),forAttr:el.htmlFor})).filter(x=>x.text));
  console.log('LABELS_JSON=' + JSON.stringify(labels));
  await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
