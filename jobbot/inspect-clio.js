import { chromium } from 'playwright';

const URL='https://clio.wd3.myworkdayjobs.com/en-US/ClioCareerSite/job/Brand-Designer_REQ-5011';
const RESUME_URL='https://raw.githubusercontent.com/ritikrikm/PrernaPortfolio/main/assets/resume/prerna-sharma-resume.pdf';
const PORTFOLIO='https://prerna-portfolio-six.vercel.app/#/';

async function openApplication(page){
  await page.goto(URL,{waitUntil:'domcontentloaded',timeout:60000});
  const apply=page.locator('[data-automation-id="adventureButton"]'); await apply.waitFor({state:'visible',timeout:30000});
  console.log('LIVE_JOB='+(await page.locator('[data-automation-id="jobPostingHeader"]').innerText()).trim());
  console.log('POSTED='+(await page.locator('[data-automation-id="postedOn"]').innerText()).replace(/\s+/g,' ').trim());
  await apply.click(); const manual=page.getByRole('button',{name:/apply manually/i}); await manual.waitFor({state:'visible',timeout:15000}); await manual.click(); await page.locator('#name--legalName--firstName').waitFor({state:'visible',timeout:30000});
}
async function option(page,text){const esc=text.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');const x=page.locator('[role="option"]').filter({hasText:new RegExp(`^${esc}$`)}).last();await x.waitFor({state:'visible',timeout:12000});return x;}
async function clickOpt(page,text){const x=await option(page,text),p=x.locator('[data-automation-id="promptOption"]');if(await p.count())await p.click({force:true});else await x.click({force:true});await page.waitForTimeout(250);}
async function choose(page,aid,text){const b=page.locator(`[data-automation-id="${aid}"] button`).first();await b.click({force:true});await page.waitForTimeout(250);await clickOpt(page,text);}
async function fillStep1(page){
  const s=page.locator('#source--source'); await s.click({force:true}); await clickOpt(page,'Job Sites'); await clickOpt(page,'Other'); await s.press('Escape').catch(()=>{}); await page.locator('#name--legalName--firstName').click({force:true});
  await choose(page,'formField-country','Canada'); await page.locator('#name--legalName--firstName').fill('Prerna'); await page.locator('#name--legalName--lastName').fill('Sharma'); await page.locator('#address--city').fill('Toronto'); await choose(page,'formField-countryRegion','Ontario'); await page.locator('#emailAddress--emailAddress').fill('Visualartist.prerna@gmail.com');
  const pt=page.locator('#phoneNumber--phoneType'); await pt.click(); await page.waitForTimeout(300); let mobile=page.getByRole('option',{name:'Mobile',exact:true}).last(); if(!(await mobile.isVisible().catch(()=>false))) mobile=page.getByText('Mobile',{exact:true}).last(); await mobile.click({force:true}); await page.locator('#phoneNumber--phoneNumber').fill('4168256120');
}
async function fillStep2(page){
  const rr=await fetch(RESUME_URL); if(!rr.ok) throw new Error('Resume download failed '+rr.status); const resume=Buffer.from(await rr.arrayBuffer());
  const uploader=page.locator('[data-automation-id="file-upload-input-ref"]');
  await uploader.waitFor({state:'attached',timeout:15000});
  await uploader.setInputFiles({name:'Prerna-Sharma-Resume.pdf',mimeType:'application/pdf',buffer:resume}); await page.waitForTimeout(650);
  if(!/Successfully Uploaded/i.test(await page.locator('[data-automation-id="file-upload-successful"]').innerText())) throw new Error('Resume upload not confirmed');
  const add=page.locator('[data-automation-id="add-button"]');
  if(await add.count()){await add.click(); await page.waitForTimeout(350); const url=page.locator('input[name="url"]').first(); if(await url.count()) await url.fill(PORTFOLIO);}
}
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true}); const page=await browser.newPage({viewport:{width:1440,height:1700}}); page.setDefaultTimeout(30000);
  await openApplication(page); await fillStep1(page); await page.locator('[data-automation-id="pageFooterNextButton"]').click(); await page.waitForTimeout(1400);
  let body=(await page.locator('body').innerText()).replace(/\s+/g,' '); console.log('STEP2_HEAD='+body.slice(0,3000)); if(!/current step 2 of 3/i.test(body)) throw new Error('Step 1 failed or application structure differs');
  await fillStep2(page); await page.locator('[data-automation-id="pageFooterNextButton"]').click(); await page.waitForTimeout(1400);
  body=(await page.locator('body').innerText()).replace(/\s+/g,' '); console.log('STEP3_HEAD='+body.slice(0,4000)); if(!/current step 3 of 3/i.test(body)) throw new Error('Step 2 failed or additional required fields present');
  if(!/Prerna Sharma/.test(body)||!/Prerna-Sharma-Resume\.pdf/.test(body)) throw new Error('Review identity/resume verification failed');
  console.log('REVIEW_VERIFIED');
  await page.locator('[data-automation-id="pageFooterNextButton"]').click(); console.log('SUBMIT_CLICKED');
  await page.waitForTimeout(6000); body=(await page.locator('body').innerText()).replace(/\s+/g,' ');
  console.log('FINAL_URL='+page.url()); console.log('FINAL_BODY='+body.slice(0,6000));
  const success=/Congratulations! Your application has successfully been submitted|application (has been )?(submitted|received)|successfully submitted|thank you for (applying|your application)|thanks for applying|application submitted/i.test(body);
  if(!success) throw new Error('SUBMISSION_NOT_CONFIRMED');
  console.log('APPLICATION_SUBMITTED_SUCCESSFULLY'); await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
