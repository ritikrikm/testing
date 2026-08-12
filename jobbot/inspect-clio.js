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

async function menuItem(page,text){
  const escaped=text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const item=page.locator('[role="option"]').filter({hasText:new RegExp(`^${escaped}$`)}).last();
  await item.waitFor({state:'visible',timeout:12000});
  return item;
}

async function clickPromptItem(page,text){
  const item=await menuItem(page,text);
  const prompt=item.locator('[data-automation-id="promptOption"]');
  if(await prompt.count()) await prompt.click({force:true}); else await item.click({force:true});
  await page.waitForTimeout(450);
}

async function chooseButtonPrompt(page,parentAid,text){
  const button=page.locator(`[data-automation-id="${parentAid}"] button`).first();
  await button.waitFor({state:'visible',timeout:15000});
  await button.click({force:true});
  await page.waitForTimeout(350);
  await clickPromptItem(page,text);
  await page.waitForTimeout(350);
  console.log(`${parentAid}=${(await button.innerText()).trim()}`);
}

async function dumpStep(page,label){
  const body=(await page.locator('body').innerText()).replace(/\s+/g,' ');
  console.log(label+'_BODY='+body.slice(0,14000));
  const inputs=await page.locator('input,textarea').evaluateAll(els=>els.map((e,i)=>({
    i,tag:e.tagName,id:e.id,name:e.getAttribute('name'),type:e.getAttribute('type'),
    aid:e.getAttribute('data-automation-id'),placeholder:e.getAttribute('placeholder'),
    aria:e.getAttribute('aria-label'),required:e.required,value:e.value||null
  })).filter(x=>x.id||x.name||x.aid||x.placeholder||x.aria));
  console.log(label+'_INPUTS='+JSON.stringify(inputs));
  const buttons=await page.getByRole('button').evaluateAll(bs=>bs.map((b,i)=>({
    i,text:(b.innerText||b.textContent||'').trim().replace(/\s+/g,' '),
    aid:b.getAttribute('data-automation-id'),aria:b.getAttribute('aria-label')
  })).filter(x=>x.text||x.aria));
  console.log(label+'_BUTTONS='+JSON.stringify(buttons));
  const alerts=await page.locator('[role="alert"]').allTextContents().catch(()=>[]);
  console.log(label+'_ALERTS='+JSON.stringify(alerts.map(x=>x.trim()).filter(Boolean)));
}

(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1600}});
  page.setDefaultTimeout(30000);
  await openApplication(page);

  // Step 1: My Information.
  const source=page.locator('#source--source');
  await source.click({force:true});
  await page.waitForTimeout(300);
  await clickPromptItem(page,'Job Sites');
  await clickPromptItem(page,'Other');
  await source.press('Escape').catch(()=>{});
  await page.locator('#name--legalName--firstName').click({force:true});

  await chooseButtonPrompt(page,'formField-country','Canada');
  await page.locator('#name--legalName--firstName').fill('Prerna');
  await page.locator('#name--legalName--lastName').fill('Sharma');
  await page.locator('#address--city').fill('Toronto');
  await chooseButtonPrompt(page,'formField-countryRegion','Ontario');
  await page.locator('#emailAddress--emailAddress').fill('Visualartist.prerna@gmail.com');

  await chooseButtonPrompt(page,'formField-phoneType','Mobile');
  const phoneCodeText=(await page.locator('[data-automation-id="formField-countryPhoneCode"]').innerText()).replace(/\s+/g,' ');
  console.log('PHONE_CODE='+phoneCodeText);
  if(!/Canada \(\+1\)/.test(phoneCodeText)) {
    const code=page.locator('#phoneNumber--countryPhoneCode');
    await code.click({force:true});
    await page.waitForTimeout(300);
    await clickPromptItem(page,'Canada (+1)');
    await code.press('Escape').catch(()=>{});
  }
  await page.locator('#phoneNumber--phoneNumber').fill('4168256120');
  console.log('STEP1_READY');

  const next=page.locator('[data-automation-id="pageFooterNextButton"]');
  await next.click();
  await page.waitForTimeout(2500);

  const body=(await page.locator('body').innerText()).replace(/\s+/g,' ');
  console.log('AFTER_NEXT_HEAD='+body.slice(0,3500));
  if(!/current step 2 of 3/i.test(body)) {
    await dumpStep(page,'STEP1_FAILED');
    throw new Error('Did not advance to Workday step 2');
  }
  console.log('STEP1_SUCCESS');
  await dumpStep(page,'STEP2');

  await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
