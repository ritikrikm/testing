import { chromium } from 'playwright';

const URL='https://clio.wd3.myworkdayjobs.com/en-US/ClioCareerSite/job/Graphic-Designer--5-Month-Contract-_REQ-5082';
const RESUME_URL='https://raw.githubusercontent.com/ritikrikm/PrernaPortfolio/main/assets/resume/prerna-sharma-resume.pdf';
const PORTFOLIO='https://prerna-portfolio-six.vercel.app/#/';

async function openApplication(page){
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:60000});
  const apply=page.locator('[data-automation-id="adventureButton"]');
  await apply.waitFor({state:'visible',timeout:30000});
  console.log('JOB='+(await page.locator('[data-automation-id="jobPostingHeader"]').innerText()).trim());
  console.log('POSTED='+(await page.locator('[data-automation-id="postedOn"]').innerText()).replace(/\s+/g,' ').trim());
  await apply.click(); const manual=page.getByRole('button',{name:/apply manually/i}); await manual.waitFor({state:'visible',timeout:15000}); await manual.click();
  await page.locator('#name--legalName--firstName').waitFor({state:'visible',timeout:30000});
}
async function option(page,text){const esc=text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const x=page.locator('[role="option"]').filter({hasText:new RegExp(`^${esc}$`)}).last();await x.waitFor({state:'visible',timeout:12000});return x;}
async function clickOpt(page,text){const x=await option(page,text),p=x.locator('[data-automation-id="promptOption"]');if(await p.count())await p.click({force:true});else await x.click({force:true});await page.waitForTimeout(250);}
async function choose(page,aid,text){const b=page.locator(`[data-automation-id="${aid}"] button`).first();await b.click({force:true});await page.waitForTimeout(250);await clickOpt(page,text);}
async function fillStep1(page){
  const s=page.locator('#source--source'); await s.click({force:true}); await clickOpt(page,'Job Sites'); await clickOpt(page,'Other'); await s.press('Escape').catch(()=>{}); await page.locator('#name--legalName--firstName').click({force:true});
  await choose(page,'formField-country','Canada'); await page.locator('#name--legalName--firstName').fill('Prerna'); await page.locator('#name--legalName--lastName').fill('Sharma'); await page.locator('#address--city').fill('Toronto'); await choose(page,'formField-countryRegion','Ontario'); await page.locator('#emailAddress--emailAddress').fill('Visualartist.prerna@gmail.com');
  const pt=page.locator('#phoneNumber--phoneType'); await pt.click(); await page.waitForTimeout(300); let mobile=page.getByRole('option',{name:'Mobile',exact:true}).last(); if(!(await mobile.isVisible().catch(()=>false))) mobile=page.getByText('Mobile',{exact:true}).last(); await mobile.click({force:true}); await page.locator('#phoneNumber--phoneNumber').fill('4168256120');
}
async function dump(page,label){
  const body=(await page.locator('body').innerText()).replace(/\s+/g,' '); console.log(label+'_BODY='+body.slice(0,18000));
  const fields=await page.locator('input,textarea,select').evaluateAll(els=>els.map((e,i)=>({i,tag:e.tagName,id:e.id,name:e.getAttribute('name'),type:e.getAttribute('type'),aid:e.getAttribute('data-automation-id'),placeholder:e.getAttribute('placeholder'),aria:e.getAttribute('aria-label'),value:e.value||null})).filter(x=>x.id||x.name||x.aid||x.placeholder||x.aria)); console.log(label+'_FIELDS='+JSON.stringify(fields));
  const autos=await page.locator('[data-automation-id]').evaluateAll(els=>els.map((e,i)=>({i,tag:e.tagName,aid:e.getAttribute('data-automation-id'),role:e.getAttribute('role'),aria:e.getAttribute('aria-label'),text:(e.innerText||e.textContent||'').trim().replace(/\s+/g,' ').slice(0,260)})).filter(x=>x.aid)); console.log(label+'_AUTOS='+JSON.stringify(autos));
  console.log(label+'_BUTTONS='+JSON.stringify((await page.getByRole('button').allTextContents()).map(x=>x.trim()).filter(Boolean)));
}
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true}); const page=await browser.newPage({viewport:{width:1440,height:1700}}); page.setDefaultTimeout(30000);
  await openApplication(page); await fillStep1(page); await page.locator('[data-automation-id="pageFooterNextButton"]').click(); await page.waitForTimeout(1800);
  let body=(await page.locator('body').innerText()).replace(/\s+/g,' '); if(!/current step 2 of 3/i.test(body)) throw new Error('Step 1 failed');
  const rr=await fetch(RESUME_URL); if(!rr.ok) throw new Error('Resume download failed '+rr.status); const resume=Buffer.from(await rr.arrayBuffer());
  await page.locator('[data-automation-id="file-upload-input-ref"]').setInputFiles({name:'Prerna-Sharma-Resume.pdf',mimeType:'application/pdf',buffer:resume});
  await page.waitForTimeout(700); console.log('RESUME_UPLOADED');
  const add=page.locator('[data-automation-id="add-button"]'); await add.click(); await page.waitForTimeout(500); await dump(page,'STEP2_AFTER_ADD');
  // Fill the first newly-rendered website URL field if available.
  const websiteInputs=page.locator('input').filter({has:undefined});
  const inputs=page.locator('input');
  for(let i=0;i<await inputs.count();i++){
    const el=inputs.nth(i); const meta=await el.evaluate(e=>({id:e.id,name:e.name,ph:e.placeholder,aria:e.getAttribute('aria-label'),type:e.type,value:e.value}));
    const hint=[meta.id,meta.name,meta.ph,meta.aria].filter(Boolean).join(' ');
    if(meta.type!=='file' && /website|url|link/i.test(hint)){ await el.fill(PORTFOLIO); console.log('PORTFOLIO_FIELD='+hint); break; }
  }
  await page.locator('[data-automation-id="pageFooterNextButton"]').click(); await page.waitForTimeout(1800);
  body=(await page.locator('body').innerText()).replace(/\s+/g,' ');
  if(!/current step 3 of 3/i.test(body)){ await dump(page,'STEP2_VALIDATION'); throw new Error('Step 2 failed'); }
  console.log('STEP2_SUCCESS'); await dump(page,'STEP3');
  await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
