import { chromium } from 'playwright';

const URL = 'https://clio.wd3.myworkdayjobs.com/en-US/ClioCareerSite/job/Graphic-Designer--5-Month-Contract-_REQ-5082';

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  page.setDefaultTimeout(30000);

  const badResponses = [];
  const failedRequests = [];
  page.on('response', r => { if (r.status() >= 400) badResponses.push({status:r.status(),url:r.url().slice(0,300)}); });
  page.on('requestfailed', r => failedRequests.push({url:r.url().slice(0,300),error:r.failure()?.errorText}));
  page.on('console', msg => { if (['error','warning'].includes(msg.type())) console.log(`BROWSER_${msg.type().toUpperCase()}=${msg.text().slice(0,500)}`); });

  const res = await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  console.log('HTTP_STATUS=' + (res && res.status()));

  const apply = page.locator('[data-automation-id="adventureButton"]');
  await apply.waitFor({state:'visible', timeout:30000});
  console.log('JOB_LOADED=' + (await page.locator('[data-automation-id="jobPostingHeader"]').innerText()).trim());
  console.log('POSTED=' + (await page.locator('[data-automation-id="postedOn"]').innerText()).trim());
  await apply.click();

  const manual = page.getByRole('button', { name: /apply manually/i });
  await manual.waitFor({state:'visible', timeout:15000});
  await manual.click();
  console.log('MANUAL_APPLICATION_OPENED');

  for (let sec=0; sec<30; sec++) {
    await page.waitForTimeout(1000);
    const body=(await page.locator('body').innerText()).replace(/\s+/g,' ');
    const textboxes=await page.getByRole('textbox').count();
    const autos=await page.locator('[data-automation-id]').count();
    if (sec % 5 === 4) console.log(`WAIT_${sec+1}s textboxes=${textboxes} autos=${autos} body=${body.slice(0,1000)}`);
    if (textboxes>0 || /First Name|Legal Name|Email Address|Phone|Country/i.test(body)) break;
  }

  console.log('APPLICATION_URL=' + page.url());
  const body=(await page.locator('body').innerText()).replace(/\s+/g,' ');
  console.log('FINAL_BODY=' + body.slice(0,7000));
  console.log('BAD_RESPONSES=' + JSON.stringify(badResponses.slice(-50)));
  console.log('FAILED_REQUESTS=' + JSON.stringify(failedRequests.slice(-50)));

  const automation = await page.locator('[data-automation-id]').evaluateAll(els => els.map((el,i)=>({
    i,tag:el.tagName,aid:el.getAttribute('data-automation-id'),role:el.getAttribute('role'),type:el.getAttribute('type'),aria:el.getAttribute('aria-label'),placeholder:el.getAttribute('placeholder'),text:(el.innerText||el.textContent||'').trim().replace(/\s+/g,' ').slice(0,220)
  })).filter(x=>x.aid));
  console.log('AUTOMATION_JSON=' + JSON.stringify(automation));

  for (const role of ['textbox','combobox','radio','checkbox']) {
    const loc=page.getByRole(role);
    console.log(`ROLE_${role.toUpperCase()}_COUNT=${await loc.count()}`);
    for(let i=0;i<Math.min(await loc.count(),30);i++){
      console.log(`ROLE_${role.toUpperCase()}_${i}=`+JSON.stringify(await loc.nth(i).evaluate(e=>({tag:e.tagName,id:e.id,name:e.getAttribute('name'),aid:e.getAttribute('data-automation-id'),aria:e.getAttribute('aria-label'),placeholder:e.getAttribute('placeholder'),value:e.value||null})).catch(()=>({}))));
    }
  }
  console.log('BUTTONS=' + JSON.stringify((await page.getByRole('button').allTextContents()).map(x=>x.trim()).filter(Boolean)));
  await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
