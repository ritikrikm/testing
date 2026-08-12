import { chromium } from 'playwright';

const URL = 'https://clio.wd3.myworkdayjobs.com/en-US/ClioCareerSite/job/Graphic-Designer--5-Month-Contract-_REQ-5082';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  page.setDefaultTimeout(25000);

  const badResponses = [];
  const failedRequests = [];
  page.on('response', r => { if (r.status() >= 400) badResponses.push({status:r.status(),url:r.url().slice(0,300)}); });
  page.on('requestfailed', r => failedRequests.push({url:r.url().slice(0,300),error:r.failure()?.errorText}));
  page.on('console', msg => { if (['error','warning'].includes(msg.type())) console.log(`BROWSER_${msg.type().toUpperCase()}=${msg.text().slice(0,500)}`); });

  const res = await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  console.log('HTTP_STATUS=' + (res && res.status()));
  console.log('TITLE=' + await page.title());

  const apply = page.getByRole('button', { name: /^apply$/i });
  if (await apply.count()) { await apply.first().click(); await page.waitForTimeout(1200); }
  const manual = page.getByRole('button', { name: /apply manually/i });
  if (await manual.count()) { await manual.first().click(); }

  console.log('APPLICATION_URL=' + page.url());
  for (let sec=0; sec<20; sec++) {
    await page.waitForTimeout(1000);
    const body=(await page.locator('body').innerText()).replace(/\s+/g,' ');
    const textboxes=await page.getByRole('textbox').count();
    const autos=await page.locator('[data-automation-id]').count();
    if (sec % 5 === 4) console.log(`WAIT_${sec+1}s textboxes=${textboxes} autos=${autos} body=${body.slice(0,900)}`);
    if (textboxes>0 || /First Name|Legal Name|Address|Email Address|Country/i.test(body)) break;
  }

  const body=(await page.locator('body').innerText()).replace(/\s+/g,' ');
  console.log('FINAL_BODY=' + body.slice(0,6000));
  console.log('BAD_RESPONSES=' + JSON.stringify(badResponses.slice(-50)));
  console.log('FAILED_REQUESTS=' + JSON.stringify(failedRequests.slice(-50)));

  const automation = await page.locator('[data-automation-id]').evaluateAll(els => els.map((el,i)=>({
    i,tag:el.tagName,aid:el.getAttribute('data-automation-id'),role:el.getAttribute('role'),type:el.getAttribute('type'),aria:el.getAttribute('aria-label'),placeholder:el.getAttribute('placeholder'),text:(el.innerText||el.textContent||'').trim().replace(/\s+/g,' ').slice(0,220)
  })).filter(x=>x.aid));
  console.log('AUTOMATION_JSON=' + JSON.stringify(automation));

  console.log('TEXTBOX_COUNT=' + await page.getByRole('textbox').count());
  console.log('COMBOBOX_COUNT=' + await page.getByRole('combobox').count());
  console.log('BUTTONS=' + JSON.stringify((await page.getByRole('button').allTextContents()).map(x=>x.trim()).filter(Boolean)));

  if ((await page.getByRole('textbox').count())===0) {
    const next=page.getByRole('button',{name:/^next$/i});
    if (await next.count()) {
      await next.click();
      await page.waitForTimeout(1200);
      console.log('AFTER_NEXT_BODY=' + (await page.locator('body').innerText()).replace(/\s+/g,' ').slice(0,3000));
    }
  }

  await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
