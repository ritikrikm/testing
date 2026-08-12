import { chromium } from 'playwright';

const URL='https://clio.wd3.myworkdayjobs.com/en-US/ClioCareerSite/job/Graphic-Designer--5-Month-Contract-_REQ-5082';

async function openApplication(page){
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:60000});
  const apply=page.locator('[data-automation-id="adventureButton"]');
  await apply.waitFor({state:'visible',timeout:30000});
  console.log('JOB='+(await page.locator('[data-automation-id="jobPostingHeader"]').innerText()).trim());
  console.log('POSTED='+(await page.locator('[data-automation-id="postedOn"]').innerText()).replace(/\s+/g,' ').trim());
  await apply.click();
  const manual=page.getByRole('button',{name:/apply manually/i});
  await manual.waitFor({state:'visible',timeout:15000});
  await manual.click();
  await page.locator('#name--legalName--firstName').waitFor({state:'visible',timeout:30000});
}
async function option(page,text){
  const esc=text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const x=page.locator('[role="option"]').filter({hasText:new RegExp(`^${esc}$`)}).last();
  await x.waitFor({state:'visible',timeout:12000}); return x;
}
async function clickOpt(page,text){
  const x=await option(page,text),p=x.locator('[data-automation-id="promptOption"]');
  if(await p.count()) await p.click({force:true}); else await x.click({force:true});
  await page.waitForTimeout(300);
}
async function choose(page,aid,text){
  const b=page.locator(`[data-automation-id="${aid}"] button`).first();
  await b.click({force:true}); await page.waitForTimeout(250); await clickOpt(page,text); await page.waitForTimeout(250);
}
async function fillStep1(page){
  const s=page.locator('#source--source');
  await s.click({force:true}); await clickOpt(page,'Job Sites'); await clickOpt(page,'Other');
  await s.press('Escape').catch(()=>{}); await page.locator('#name--legalName--firstName').click({force:true});
  await choose(page,'formField-country','Canada');
  await page.locator('#name--legalName--firstName').fill('Prerna');
  await page.locator('#name--legalName--lastName').fill('Sharma');
  await page.locator('#address--city').fill('Toronto');
  await choose(page,'formField-countryRegion','Ontario');
  await page.locator('#emailAddress--emailAddress').fill('Visualartist.prerna@gmail.com');

  const phoneType=page.locator('#phoneNumber--phoneType');
  await phoneType.click(); await page.waitForTimeout(350);
  let mobile=page.getByRole('option',{name:'Mobile',exact:true}).last();
  if(!(await mobile.isVisible().catch(()=>false))) mobile=page.getByText('Mobile',{exact:true}).filter({visible:true}).last();
  await mobile.waitFor({state:'visible',timeout:10000}); await mobile.click({force:true});
  await page.locator('#phoneNumber--phoneNumber').fill('4168256120');
  console.log('STEP1_PHONE='+(await page.locator('[data-automation-id="formField-phoneType"]').innerText()).replace(/\s+/g,' '));
}
async function dump(page,label){
  const body=(await page.locator('body').innerText()).replace(/\s+/g,' ');
  console.log(label+'_BODY='+body.slice(0,16000));
  const autos=await page.locator('[data-automation-id]').evaluateAll(els=>els.map((e,i)=>({i,tag:e.tagName,aid:e.getAttribute('data-automation-id'),role:e.getAttribute('role'),type:e.getAttribute('type'),aria:e.getAttribute('aria-label'),text:(e.innerText||e.textContent||'').trim().replace(/\s+/g,' ').slice(0,260)})).filter(x=>x.aid));
  console.log(label+'_AUTOS='+JSON.stringify(autos));
  const fields=await page.locator('input,textarea,select').evaluateAll(els=>els.map((e,i)=>({i,tag:e.tagName,id:e.id,name:e.getAttribute('name'),type:e.getAttribute('type'),aid:e.getAttribute('data-automation-id'),placeholder:e.getAttribute('placeholder'),aria:e.getAttribute('aria-label'),required:e.required,value:e.value||null})).filter(x=>x.id||x.name||x.aid||x.placeholder||x.aria));
  console.log(label+'_FIELDS='+JSON.stringify(fields));
  console.log(label+'_BUTTONS='+JSON.stringify((await page.getByRole('button').allTextContents()).map(x=>x.trim()).filter(Boolean)));
}

(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1700}}); page.setDefaultTimeout(30000);
  await openApplication(page); await fillStep1(page);
  await page.locator('[data-automation-id="pageFooterNextButton"]').click();
  await page.waitForTimeout(2200);
  const body=(await page.locator('body').innerText()).replace(/\s+/g,' ');
  if(!/current step 2 of 3/i.test(body)){ await dump(page,'STEP1_VALIDATION'); throw new Error('Step 1 did not advance'); }
  console.log('STEP1_SUCCESS'); await dump(page,'STEP2');
  await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
