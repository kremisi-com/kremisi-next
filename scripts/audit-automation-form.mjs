// Browser-only response simulations. The real Next Server Action is NEVER called.
// Use a dedicated dev server with NEXT_PUBLIC_TURNSTILE_SITE_KEY=audit-mocked-site-key.
import {createRequire} from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.AUDIT_PLAYWRIGHT||'playwright');
const output=path.resolve('docs/landing-automation/audit-evidence/after');await fs.mkdir(output,{recursive:true});
const base=process.env.AUDIT_MOCK_BASE||'http://127.0.0.1:3100';
if(!/^http:\/\/(127\.0\.0\.1|localhost):/.test(base))throw new Error('Mock tests require localhost');
const browser=await chromium.launch({headless:true,...(process.env.AUDIT_CHROMIUM?{executablePath:process.env.AUDIT_CHROMIUM}:{})});
const results={base,safety:'Captcha and every action response fulfilled inside Playwright. No request forwarded to backend. Fake example.invalid data only.',checks:[],mockedActions:0,blockedWrites:[]};
function check(name,pass,evidence){results.checks.push({name,pass,evidence});console.log(`${pass?'PASS':'FAIL'} ${name}`);}
try{
 for(const scenario of ['success','error','security-unavailable']){
  const c=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});
  let scenarioActions=0;
  await c.addInitScript(()=>{
    // Fake consent + telemetry adapters. All vendor SDK downloads below are stubbed.
    window._iub=[];
    window._iub.csConfiguration={lang:'en-GB'};
    window._iub.cs={api:{isPreferenceExpressed:()=>true,getPreferences:()=>({purposes:{4:true,5:true}}),openPreferences(){}}};
    window.__auditPixel=[];window.oaiq=(...args)=>window.__auditPixel.push(args);
    window.__auditGa=[];window.gtag=(...args)=>window.__auditGa.push(args);
  });
  await c.route('**/*',async r=>{
    const req=r.request();
    if(/bzrcdn\.openai\.com|googletagmanager\.com|google-analytics\.com|va\.vercel-scripts\.com|\/_(vercel|vercel-insights)\//.test(req.url()))return r.fulfill({status:200,contentType:'application/javascript',body:'/* QA telemetry adapter: no external dispatch */'});
    if(req.url().startsWith('https://challenges.cloudflare.com/turnstile/v0/api.js')){
      if(scenario==='security-unavailable')return r.abort('failed');
      return r.fulfill({contentType:'application/javascript',body:`window.turnstile={render(el,options){window.__auditCaptcha=options;setTimeout(()=>options.callback('audit-not-a-real-token'),10);return 'audit-widget';},reset(){},remove(){}};`});
    }
    if(req.method()==='POST'&&req.url().startsWith(base)&&req.headers()['next-action']){
      scenarioActions++;results.mockedActions++;
      await new Promise(resolve=>setTimeout(resolve,500));
      const action=scenario==='success'?{success:true,openaiAds:{eventId:'audit-browser-lead',emailSha256:'a'.repeat(64)}}:{success:false,error:'Non è stato possibile inviare il modulo. [Risposta simulata QA]'};
      return r.fulfill({status:200,contentType:'text/x-component',body:`0:${JSON.stringify({a:action,f:'',b:'audit-browser-response'})}\n`});
    }
    if(!['GET','HEAD'].includes(req.method())){results.blockedWrites.push({url:req.url(),method:req.method()});return r.abort('blockedbyclient');}
    return r.continue();
  });
  const p=await c.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+'/it/automazioni-aziendali',{waitUntil:'domcontentloaded'});await p.waitForTimeout(2500);
  if(await p.locator('.iubenda-cs-reject-btn').isVisible())await p.locator('.iubenda-cs-reject-btn').click();
  const form=p.locator('form');const submit=form.locator('button[type="submit"]');
  await p.locator('#inizio a[href="#contatto"]').click();
  await form.scrollIntoViewIfNeeded();
  if(scenario==='security-unavailable'){
    check('security outage: disabled submit with readable fallback',await submit.isDisabled()&&await form.getByRole('alert').isVisible(),await form.getByRole('alert').innerText());
  }else{
    await p.waitForFunction(()=>!!window.__auditCaptcha);
    check(`${scenario}: mock captcha enables submit`,await submit.isEnabled(),'Mock token, no Cloudflare verification.');
    await submit.click();
    check(`${scenario}: empty form does not dispatch action`,scenarioActions===0,{mockedActions:scenarioActions});
    await form.locator('[name="details"]').fill('QA: passaggi ripetitivi tra fogli e strumenti.');
    await form.locator('[name="name"]').fill('QA Test');
    await form.locator('[name="email"]').fill('qa@example.invalid');
    await form.locator('[name="privacy"]').check();
    // Expired captcha prevents accidental retry until the next token arrives.
    await p.evaluate(()=>window.__auditCaptcha['expired-callback']());
    await p.waitForFunction(()=>document.querySelector('form button[type="submit"]')?.disabled);
    check(`${scenario}: expired captcha disables submit`,await submit.isDisabled(),'expired-callback');
    await p.evaluate(()=>window.__auditCaptcha.callback('audit-not-a-real-token'));
    await submit.click();
    check(`${scenario}: pending state disables duplicate submission`,await submit.isDisabled()&&await form.getAttribute('aria-busy')==='true',{text:await submit.innerText()});
    await p.waitForFunction(()=>document.querySelector('form')?.getAttribute('aria-busy')==='false');
    const status=await form.getByRole('status').innerText();
    if(scenario==='success'){
      check('success: confirmation and input reset',status.includes('richiesta è stata inviata')&&await form.locator('[name="email"]').inputValue()==='',{status});
    }else{
      check('error: inline error preserves entered data',status.includes('Risposta simulata QA')&&await form.locator('[name="email"]').inputValue()==='qa@example.invalid',{status});
      check('error: fresh captcha required to retry',await submit.isDisabled(),'Token reset after rejected response.');
    }
    check(`${scenario}: exactly one mocked action`,scenarioActions===1,{scenarioActions});
    const telemetry=await p.evaluate(()=>({pixel:window.__auditPixel,ga:[...window.__auditGa,...(window.dataLayer||[]).map(a=>Array.from(a))]}));
    const leads=telemetry.pixel.filter(a=>a[0]==='measure'&&a[1]==='lead_created');
    check(`${scenario}: conversion only for accepted mock response`,leads.length===(scenario==='success'?1:0),{leadCount:leads.length,eventId:leads[0]?.[3]?.event_id});
    check(`${scenario}: CTA click and form-start funnel events`,telemetry.ga.some(a=>a[0]==='event'&&a[1]==='automation_cta_click')&&telemetry.ga.some(a=>a[0]==='event'&&a[1]==='contact_form_start'),telemetry.ga.filter(a=>a[0]==='event').map(a=>({event:a[1],params:a[2]})));
  }
  check(`${scenario}: no unhandled browser errors`,errors.length===0,errors);
  await p.screenshot({path:path.join(output,`mock-form-${scenario}.png`),fullPage:false});
  await c.close();
 }
}catch(e){results.exception=String(e);console.error(e);}
finally{await fs.writeFile(path.join(output,'mock-form.json'),JSON.stringify(results,null,2));await browser.close();}
if(results.exception||results.checks.some(c=>!c.pass))process.exitCode=1;
