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

async function optionByLabel(page,label){
  let opt=page.locator(`[data-automation-id="promptOption"][data-automation-label="${label}"]`).last();
  if(!(await opt.count())) opt=page.getByText(label,{exact:true}).last();
  await opt.waitFor({state:'visible',timeout:12000});
  return opt;
}

async function chooseSingle(page,parentAid,label){
  const button=page.locator(`[data-automation-id="${parentAid}"] button`).first();
  await button.click({force:true});
  await (await optionByLabel(page,label)).click({force:true});
  await page.waitForTimeout(400);
}

async function selectSource(page,label){
  const source=page.locator('#source--source');
  await source.click({force:true});
  const opt=await optionByLabel(page,label);
  await opt.click({force:true});
  await page.keyboard.press('Escape').catch(()=>{});
  await page.waitForTimeout(400);
  const txt=(await page.locator('[data-automation-id="formField-source"]').innerText()).replace(/\s+/g,' ');
  console.log('SOURCE_SELECTED='+txt);
}

async function dumpCurrentStep(page,label){
  const body=(await page.locator('body').innerText()).replace(/\s+/g,' ');
  console.log(label+'_BODY='+body.slice(0,9000));
  const automation=await page.locator('[data-automation-id]').evaluateAll(els=>els.map((e,i)=>({i,tag:e.tagName,aid:e.getAttribute('data-automation-id'),role:e.getAttribute('role'),type:e.getAttribute('type'),aria:e.getAttribute('aria-label'),placeholder:e.getAttribute('placeholder'),text:(e.innerText||e.textContent||'').trim().replace(/\s+/g,' ').slice(0,240)})).filter(x=>x.aid));
  console.log(label+'_AUTOMATION='+JSON.stringify(automation));
  const inputs=await page.locator('input,textarea').evaluateAll(els=>els.map((e,i)=>({i,tag:e.tagName,id:e.id,name:e.getAttribute('name'),type:e.getAttribute('type'),placeholder:e.getAttribute('placeholder'),aria:e.getAttribute('aria-label'),value:e.value||null})).filter(x=>x.id||x.name||x.placeholder||x.aria));
  console.log(label+'_INPUTS='+JSON.stringify(inputs));
  console.log(label+'_BUTTONS='+JSON.stringify((await page.getByRole('button').allTextContents()).map(x=>x.trim()).filter(Boolean)));
}

(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1400}});
  page.setDefaultTimeout(30000);
  await openApplication(page);

  await selectSource(page,'Job Sites');
  await chooseSingle(page,'formField-country','Canada');
  await page.locator('#name--legalName--firstName').fill('Prerna');
  await page.locator('#name--legalName--lastName').fill('Sharma');
  await page.locator('#address--city').fill('Toronto');
  await chooseSingle(page,'formField-countryRegion','Ontario');
  await page.locator('#emailAddress--emailAddress').fill('Visualartist.prerna@gmail.com');

  // Phone is optional; fill it if Workday has finished rendering the field.
  await page.waitForTimeout(1200);
  const phoneInput=page.locator('input[name*="phone" i], input[id*="phone" i]').first();
  if(await phoneInput.count()) {
    await phoneInput.fill('4168256120').catch(()=>{});
    console.log('PHONE_FIELD_FILLED');
  }

  await dumpCurrentStep(page,'STEP1_FILLED');
  const next=page.locator('[data-automation-id="pageFooterNextButton"]');
  await next.click();

  // Wait for step 2 or validation errors.
  await page.waitForTimeout(2500);
  const body=(await page.locator('body').innerText()).replace(/\s+/g,' ');
  console.log('AFTER_NEXT_URL='+page.url());
  console.log('AFTER_NEXT_HEAD='+body.slice(0,3500));
  if(/current step 2 of 3/i.test(body)) {
    console.log('STEP1_SUCCESS');
    await dumpCurrentStep(page,'STEP2');
  } else {
    const alerts=await page.locator('[role="alert"]').allTextContents().catch(()=>[]);
    console.log('STEP1_ALERTS='+JSON.stringify(alerts.map(x=>x.trim()).filter(Boolean)));
  }

  await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
