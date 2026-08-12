import { chromium } from 'playwright';

const URL = 'https://clio.wd3.myworkdayjobs.com/en-US/ClioCareerSite/job/Graphic-Designer--5-Month-Contract-_REQ-5082';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1400 } });
  page.setDefaultTimeout(20000);
  const res = await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);
  console.log('HTTP_STATUS=' + (res && res.status()));
  console.log('TITLE=' + await page.title());

  const apply = page.getByRole('button', { name: /^apply$/i });
  if (await apply.count()) { await apply.first().click(); await page.waitForTimeout(1200); }
  const manual = page.getByRole('button', { name: /apply manually/i });
  if (await manual.count()) { await manual.first().click(); await page.waitForTimeout(3000); }

  console.log('APPLICATION_URL=' + page.url());
  console.log('BODY=' + (await page.locator('body').innerText()).replace(/\s+/g,' ').slice(0,5000));

  const automation = await page.locator('[data-automation-id]').evaluateAll(els => els.map((el,i)=>({
    i,
    tag:el.tagName,
    aid:el.getAttribute('data-automation-id'),
    role:el.getAttribute('role'),
    type:el.getAttribute('type'),
    aria:el.getAttribute('aria-label'),
    labelledby:el.getAttribute('aria-labelledby'),
    placeholder:el.getAttribute('placeholder'),
    text:(el.innerText||el.textContent||'').trim().replace(/\s+/g,' ').slice(0,180)
  })).filter(x=>x.aid));
  console.log('AUTOMATION_JSON=' + JSON.stringify(automation));

  const roles = await page.locator('[role]').evaluateAll(els => els.map((el,i)=>({
    i,
    tag:el.tagName,
    role:el.getAttribute('role'),
    aid:el.getAttribute('data-automation-id'),
    aria:el.getAttribute('aria-label'),
    labelledby:el.getAttribute('aria-labelledby'),
    text:(el.innerText||el.textContent||'').trim().replace(/\s+/g,' ').slice(0,160)
  })).filter(x=>['textbox','combobox','button','radio','checkbox','option','listbox','group'].includes(x.role)));
  console.log('ROLES_JSON=' + JSON.stringify(roles));

  for (const role of ['textbox','combobox','radio','checkbox']) {
    const loc = page.getByRole(role);
    console.log(`ROLE_${role.toUpperCase()}_COUNT=${await loc.count()}`);
    for (let i=0;i<Math.min(await loc.count(),40);i++) {
      const el=loc.nth(i);
      console.log(`ROLE_${role.toUpperCase()}_${i}=`+JSON.stringify(await el.evaluate(e=>({
        tag:e.tagName,id:e.id,name:e.getAttribute('name'),type:e.getAttribute('type'),aid:e.getAttribute('data-automation-id'),aria:e.getAttribute('aria-label'),placeholder:e.getAttribute('placeholder'),value:e.value||null
      })).catch(()=>({}))));
    }
  }

  console.log('IFRAMES=' + JSON.stringify(await page.locator('iframe').evaluateAll(fs=>fs.map(f=>({src:f.src,title:f.title,name:f.name})))));
  await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
