import { createRequire } from 'node:module';
import fs from 'node:fs/promises';
import path from 'node:path';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.AUDIT_PLAYWRIGHT||'playwright');
const phase=process.env.AUDIT_PHASE||'before';
const output=path.resolve(`docs/landing-automation/audit-evidence/${phase}`);
await fs.mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.AUDIT_CHROMIUM?{executablePath:process.env.AUDIT_CHROMIUM}:{})});
const base=process.env.AUDIT_BASE||'http://127.0.0.1:3101';
const results={phase,base,checks:[],blockedWrites:[]};
function check(name,pass,evidence){results.checks.push({name,pass,evidence});console.log(`${pass?'PASS':'FAIL'} ${name}`);}
async function setup(width,height){
  const c=await browser.newContext({viewport:{width,height},isMobile:width<500,hasTouch:width<=768});
  await c.route('**/*',r=>{if(!['GET','HEAD'].includes(r.request().method())){results.blockedWrites.push({url:r.request().url(),method:r.request().method()});return r.abort('blockedbyclient');}return r.continue();});
  const p=await c.newPage();
  await p.goto(`${base}/it/automazioni-aziendali`,{waitUntil:'domcontentloaded'});
  await p.waitForTimeout(2000);
  if(await p.locator('.iubenda-cs-reject-btn').isVisible())await p.locator('.iubenda-cs-reject-btn').click();
  await p.waitForTimeout(300);
  return {c,p};
}
try{
  for(const [w,h]of [[1440,900],[390,844],[320,568]]){
    const {c,p}=await setup(w,h);
    await p.screenshot({path:path.join(output,`interaction-${w}-hero.png`)});
    const nested=await p.locator('nav a button').count();
    check(`${w}: navigation has no nested interactive controls`,nested===0,{count:nested});
    // A clean document starts at the beginning of the keyboard sequence.
    await p.reload({waitUntil:'domcontentloaded'});await p.waitForTimeout(1000);
    const tabs=[];
    for(let i=0;i<18;i++){await p.keyboard.press('Tab');tabs.push(await p.evaluate(()=>{const e=document.activeElement,r=e.getBoundingClientRect();return{tag:e.tagName,label:e.getAttribute('aria-label'),text:e.innerText?.slice(0,60),href:e.getAttribute('href'),inMobileMenu:!!e.closest('[class*="mobileMenu"]'),top:r.top,bottom:r.bottom};}));}
    check(`${w}: closed mobile menu excluded from keyboard`,!tabs.some(t=>t.inMobileMenu),tabs);
    const invalid=await p.locator('form').evaluate(f=>({valid:f.checkValidity(),fields:[...f.elements].filter(e=>e.willValidate&&!e.validity.valid).map(e=>e.name)}));
    check(`${w}: empty required fields invalid`,!invalid.valid&&['details','name','email','privacy'].every(n=>invalid.fields.includes(n)),invalid);
    await p.locator('textarea[name="details"]').fill('Audit QA: attività ripetitiva e strumenti da collegare.');
    await p.locator('input[name="name"]').fill('QA Test');
    await p.locator('input[name="email"]').fill('invalid-email');
    await p.locator('input[name="privacy"]').check();
    const badEmail=await p.locator('input[name="email"]').evaluate(e=>({valid:e.checkValidity(),typeMismatch:e.validity.typeMismatch}));
    check(`${w}: invalid email rejected`,!badEmail.valid&&badEmail.typeMismatch,badEmail);
    await p.locator('input[name="email"]').fill('qa@example.invalid');
    check(`${w}: optional company/phone can be empty`,await p.locator('form').evaluate(f=>f.checkValidity()),'Only checkValidity called; no submission.');
    // All campaign CTAs, including the secondary case link.
    const anchors=await p.locator('main a[href^="#"]').all();
    const anchorChecks=[];
    for(const a of anchors){const href=await a.getAttribute('href');if((await a.getAttribute('class'))?.includes('skipLink')){await a.focus();await p.keyboard.press('Enter');}else await a.click();const target=await p.locator(href).evaluate(e=>({top:e.getBoundingClientRect().top,bottom:e.getBoundingClientRect().bottom}));anchorChecks.push({href,...target,hash:await p.evaluate(()=>location.hash)});}
    check(`${w}: all campaign anchors reach their targets`,anchorChecks.every(a=>a.hash===a.href&&a.top>=0&&a.top<h),anchorChecks);
    await p.evaluate(()=>document.getElementById('soluzioni').scrollIntoView());await p.waitForTimeout(300);
    const topHit=await p.locator('#solutions-title').evaluate(e=>{const r=e.getBoundingClientRect();const hit=document.elementFromPoint(Math.min(innerWidth-1,r.left+r.width/2),Math.max(0,Math.min(innerHeight-1,r.top+r.height/2)));return{title:e.innerText,hit:hit?.tagName,hitClass:hit?.className,hitText:hit?.innerText?.slice(0,100)};});
    check(`${w}: solutions visible in normal scrolled viewport`,!String(topHit.hitClass).includes('transitionOverlay'),topHit);
    await p.screenshot({path:path.join(output,`interaction-${w}-solutions.png`)});
    if(w<=768){
      const menu=p.locator('nav.onlyMobile button[class*="menuIcon"]');await menu.focus();await p.keyboard.press('Enter');await p.waitForTimeout(350);
      const expanded=await menu.getAttribute('aria-expanded');
      await p.screenshot({path:path.join(output,`interaction-${w}-menu.png`)});
      await p.keyboard.press('Escape');await p.waitForTimeout(350);
      check(`${w}: menu opens with Enter and closes with Escape`,expanded==='true'&&await menu.getAttribute('aria-expanded')==='false',{expanded,closed:await menu.getAttribute('aria-expanded'),focusReturned:await menu.evaluate(e=>e===document.activeElement)});
    }
    await p.locator('#videos-cta').scrollIntoViewIfNeeded();await p.waitForTimeout(400);
    const playback=p.getByRole('button',{name:'Metti in pausa i video'});
    await playback.click();
    check(`${w}: closing videos pause together`,await p.locator('#videos-cta video').evaluateAll(es=>es.every(e=>e.paused)),'Pause control');
    await p.getByRole('button',{name:'Riprendi i video'}).click();await p.waitForTimeout(200);
    check(`${w}: closing videos resume together`,await p.locator('#videos-cta video').evaluateAll(es=>es.every(e=>!e.paused)),'Resume control');
    await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(300);
    check(`${w}: videos stop outside viewport`,await p.locator('#videos-cta video').evaluateAll(es=>es.every(e=>e.paused)),'IntersectionObserver pauses media');
    const theme=p.locator(`nav.${w<=768?'onlyMobile':'onlyDesktop'} button`).filter({has:p.locator('svg.lucide-sun')}).first();
    if(await theme.count()){
      await theme.click();check(`${w}: light theme toggle`,await p.locator('html').evaluate(e=>e.classList.contains('light')),'html.light');
      const dark=p.getByRole('button',{name:/tema scuro|dark theme/});if(await dark.count())await dark.first().click();
    }
    const toggle=p.getByRole('button',{name:"Passa all'inglese"});await toggle.filter({visible:true}).first().click();await p.waitForURL('**/en/automazioni-aziendali',{timeout:20000});
    check(`${w}: language toggle retains landing`,p.url().includes('/en/automazioni-aziendali')&&await p.locator('html').getAttribute('lang')==='en',{url:p.url(),heading:await p.locator('h1').innerText()});
    await c.close();
  }
  const {c,p}=await setup(1440,900);
  const links=await p.locator('a[href]').evaluateAll(es=>[...new Set(es.map(e=>e.getAttribute('href')).filter(h=>h.startsWith('/')))]);
  for(const href of links){const r=await c.request.get(base+href);check(`internal link ${href}`,r.ok(),{status:r.status(),url:r.url()});}
  for(const href of ['/sitemap.xml','/robots.txt','/og-image.jpg']){const r=await c.request.get(base+href);check(`resource ${href}`,r.ok(),{status:r.status()});}
  await p.locator('nav.onlyDesktop a[href="/it/about"]').click();await p.waitForURL('**/it/about');
  await p.waitForFunction(()=>{const e=document.querySelector('[class*="transitionOverlay"]');return e&&getComputedStyle(e).visibility==='hidden';});
  check('navbar navigation completes and transition overlay hides',true,{url:p.url(),title:await p.title()});
  await c.close();
}catch(e){results.exception=String(e);console.error(e);}
finally{await fs.writeFile(path.join(output,'interactions.json'),JSON.stringify(results,null,2));await browser.close();}
if(results.exception||results.checks.some(c=>!c.pass))process.exitCode=1;
