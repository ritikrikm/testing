import { chromium } from 'playwright';

const JOBS=[
  ['Indigo Junior Designer, Paper and Packaging','https://jobs.smartrecruiters.com/IndigoBooksMusic/744000133132049-junior-designer-paper-and-packaging'],
  ['Indigo Junior Designer, Sleep & Fashion Accessories','https://jobs.smartrecruiters.com/IndigoBooksMusic/744000133131809-junior-designer-sleep-fashion-accessories-6-month-contract-']
];

(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  for(const [label,url] of JOBS){
    const page=await browser.newPage({viewport:{width:1440,height:1500}});
    page.setDefaultTimeout(25000);
    const res=await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});
    await page.waitForTimeout(1800);
    const body=(await page.locator('body').innerText()).replace(/\s+/g,' ');
    const expired=/job has expired|no longer accepting|job is no longer/i.test(body);
    const title=await page.title();
    const buttons=(await page.getByRole('button').allTextContents()).map(x=>x.trim()).filter(Boolean);
    const links=(await page.getByRole('link').allTextContents()).map(x=>x.trim()).filter(Boolean);
    console.log('JOB_CHECK='+JSON.stringify({label,http:res&&res.status(),url:page.url(),title,expired,buttons:buttons.slice(0,40),links:links.filter(x=>/interested|apply/i.test(x)).slice(0,20),body:body.slice(-1800)}));
    await page.close();
  }
  await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
