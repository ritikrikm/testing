import { chromium } from 'playwright';

const URL='https://jobs.smartrecruiters.com/oneclick-ui/company/IndigoBooksMusic/publication/b6451b95-3d1a-4027-94c2-d42e34787443?dcr_ci=IndigoBooksMusic';

(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  const page=await browser.newPage({viewport:{width:1440,height:1700}});
  page.setDefaultTimeout(30000);
  const bad=[]; const failed=[];
  page.on('response',r=>{if(r.status()>=400)bad.push({s:r.status(),u:r.url().slice(0,300)});});
  page.on('requestfailed',r=>failed.push({u:r.url().slice(0,300),e:r.failure()?.errorText}));
  page.on('console',m=>{if(['error','warning'].includes(m.type()))console.log('BROWSER_'+m.type().toUpperCase()+'='+m.text().slice(0,700));});
  const res=await page.goto(URL,{waitUntil:'domcontentloaded',timeout:60000});
  console.log('HTTP_STATUS='+(res&&res.status()));
  for(let i=0;i<20;i++){
    await page.waitForTimeout(1000);
    const txt=(await page.locator('body').innerText()).replace(/\s+/g,' ');
    const fields=await page.locator('input,textarea,select').count();
    if(i%4===3)console.log(`WAIT_${i+1}s fields=${fields} body=${txt.slice(0,1300)}`);
    if(fields>2||txt.length>200)break;
  }
  console.log('TITLE='+await page.title());
  console.log('URL='+page.url());
  console.log('BODY='+(await page.locator('body').innerText()).replace(/\s+/g,' ').slice(0,12000));
  console.log('FRAMES='+JSON.stringify(page.frames().map(f=>({url:f.url(),name:f.name()}))));
  console.log('IFRAMES='+JSON.stringify(await page.locator('iframe').evaluateAll(fs=>fs.map(f=>({src:f.src,name:f.name,title:f.title})))));
  console.log('FIELDS='+JSON.stringify(await page.locator('input,textarea,select').evaluateAll(els=>els.map((e,i)=>({i,tag:e.tagName,id:e.id,name:e.name,type:e.type,ph:e.placeholder,aria:e.getAttribute('aria-label'),required:e.required})))));
  console.log('BUTTONS='+JSON.stringify((await page.getByRole('button').allTextContents()).map(x=>x.trim()).filter(Boolean)));
  console.log('BAD='+JSON.stringify(bad.slice(-50)));
  console.log('FAILED='+JSON.stringify(failed.slice(-50)));
  const html=await page.locator('body').evaluate(e=>e.innerHTML.slice(0,16000)); console.log('BODY_HTML='+html.replace(/\s+/g,' '));
  await browser.close();
})().catch(e=>{console.error(e.stack||e);process.exit(1)});
