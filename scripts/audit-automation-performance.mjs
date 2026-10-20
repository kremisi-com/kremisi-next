import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.AUDIT_PLAYWRIGHT||'playwright');
const browser=await chromium.launch({headless:true,...(process.env.AUDIT_CHROMIUM?{executablePath:process.env.AUDIT_CHROMIUM}:{})});
const output='docs/landing-automation/audit-evidence/after/performance.json';
const results={note:'Local production, cold contexts. Mobile: 4x CPU, 150ms RTT, 1.6Mbps down/750Kbps up. First visit includes real CMP; writes blocked. Lab measurements, no field CWV or representative INP.',runs:[]};
try{
 for(const profile of ['desktop','mobile'])for(let run=1;run<=3;run++){
  const context=await browser.newContext({viewport:profile==='mobile'?{width:390,height:844}:{width:1440,height:900},isMobile:profile==='mobile',hasTouch:profile==='mobile'});
  await context.route('**/*',r=>['GET','HEAD'].includes(r.request().method())?r.continue():r.abort('blockedbyclient'));
  await context.addInitScript(()=>{
   window.__lab={lcp:[],shifts:[],events:[],longtasks:[]};
   for(const[type,key]of [['largest-contentful-paint','lcp'],['layout-shift','shifts'],['event','events'],['longtask','longtasks']])try{new PerformanceObserver(list=>list.getEntries().forEach(e=>window.__lab[key].push({...e.toJSON(),element:e.element?.tagName,text:e.element?.innerText?.slice(0,100)}))).observe({type,buffered:true,durationThreshold:16});}catch{}
  });
  const page=await context.newPage();const cdp=await context.newCDPSession(page);
  await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});
  if(profile==='mobile'){
   await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
   await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:204800,uploadThroughput:96000,connectionType:'cellular4g'});
  }
  const response=await page.goto('http://127.0.0.1:3101/it/automazioni-aziendali',{waitUntil:'load',timeout:60000});
  await page.waitForTimeout(profile==='mobile'?7000:3500);
  const beforeInteraction=await page.evaluate(()=>({lcp:window.__lab.lcp.at(-1),shifts:window.__lab.shifts,navigation:performance.getEntriesByType('navigation')[0].toJSON(),resources:performance.getEntriesByType('resource').map(e=>({name:e.name,transferSize:e.transferSize,encodedBodySize:e.encodedBodySize,duration:e.duration,initiatorType:e.initiatorType}))}));
  if(await page.locator('.iubenda-cs-reject-btn').isVisible())await page.locator('.iubenda-cs-reject-btn').click();
  await page.locator('#inizio a[href="#contatto"]').click();
  await page.locator('textarea[name="details"]').fill('Solo dati fittizi QA, nessun invio.');
  await page.waitForTimeout(500);
  const events=await page.evaluate(()=>window.__lab.events);
  let maxWindow=0,sum=0,start=0,last=0;
  for(const s of beforeInteraction.shifts.filter(s=>!s.hadRecentInput)){
   if(s.startTime-last>1000||s.startTime-start>5000){sum=0;start=s.startTime;}sum+=s.value;last=s.startTime;maxWindow=Math.max(maxWindow,sum);
  }
  const record={profile,run,status:response.status(),lcpMs:beforeInteraction.lcp?.startTime,lcpElement:beforeInteraction.lcp?.element,lcpText:beforeInteraction.lcp?.text,cls:maxWindow,maxObservedInteractionMs:Math.max(0,...events.filter(e=>e.interactionId).map(e=>e.duration)),...beforeInteraction,events};
  results.runs.push(record);console.log(JSON.stringify({profile,run,lcpMs:record.lcpMs,cls:record.cls,maxObservedInteractionMs:record.maxObservedInteractionMs,bytes:record.resources.reduce((s,r)=>s+r.transferSize,0)}));
  await context.close();
 }
}finally{await fs.writeFile(output,JSON.stringify(results,null,2));await browser.close();}
